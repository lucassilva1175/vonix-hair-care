import { createFileRoute } from "@tanstack/react-router";
import * as appmax from "@/lib/appmax.server";
import * as bling from "@/lib/bling.server";
import { notifyAffiliateSale } from "@/lib/affiliate-notify.server";
import { isOrderPaidEvent, parseAppmaxWebhook } from "@/lib/appmax-event";
import { createLabelForPaidOrder } from "@/lib/shipping-label.server";
import { purchaseFromPaidOrder } from "@/lib/capi-purchase";
import { sendMetaEvent } from "@/lib/meta-capi.server";
import { SITE_URL } from "@/lib/store";

/**
 * Appmax webhooks carry no signature, so the payload is never trusted:
 * the order is re-read from the Appmax API before anything is logged as paid.
 * Retries and duplicates are expected, so this handler is idempotent.
 *
 * O Appmax manda `event: "OrderPaid"` e o número do pedido em `data.id` (ver appmax-event.ts).
 */
export const Route = createFileRoute("/api/public/appmax-webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const hook = parseAppmaxWebhook(await request.json());
          if (hook && hook.event.startsWith("order_")) {
            const { orderId } = hook;
            const order = await appmax.getOrder(orderId);
            console.log("[appmax-webhook]", hook.event, orderId, order.data.order.status, appmax.isPaid(order) ? "PAGO" : "pendente");
            const statusText = String(order.data.order.status).toLowerCase();
            if (appmax.isPaid(order)) await notifyAffiliateSale({ orderId, status: "pago" });
            else if (/cancel|estorn|reembols|refund/.test(statusText)) await notifyAffiliateSale({ orderId, status: "cancelado" });
            if (appmax.isPaid(order)) {
              // Venda para a Meta pelo servidor: conta mesmo se o cliente pagou o Pix no app do banco e fechou o navegador.
              // O eventID é o mesmo do pixel, então a Meta não conta em dobro. Falha aqui nunca atrapalha o pedido.
              if (isOrderPaidEvent(hook.event)) {
                try {
                  const purchase = purchaseFromPaidOrder(hook.data);
                  if (purchase)
                    console.log(
                      "[meta-purchase]",
                      orderId,
                      await sendMetaEvent({
                        event: "Purchase",
                        eventId: purchase.eventId,
                        url: `${SITE_URL}/checkout`,
                        customData: purchase.customData,
                        userData: purchase.userData,
                        trusted: true,
                      }),
                    );
                } catch (e) {
                  console.error("[meta-purchase]", orderId, e);
                }
              }
              try {
                console.log("[bling]", orderId, await bling.sendPaidOrder(order));
              } catch (e) {
                console.error("[bling]", e);
              }
              // Etiqueta: só no aviso "Pedido pago", e só depois de a API do Appmax confirmar que o pedido está pago.
              if (isOrderPaidEvent(hook.event)) {
                try {
                  console.log("[etiqueta]", orderId, JSON.stringify(await createLabelForPaidOrder(hook.data)));
                } catch (e) {
                  console.error("[etiqueta]", orderId, e);
                }
              }
            }
          }
        } catch (e) {
          console.error("[appmax-webhook]", e);
        }
        return new Response("ok", { status: 200 });
      },
    },
  },
});
