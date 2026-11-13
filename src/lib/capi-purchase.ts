import { catalogId, metaCatalogId } from "@/lib/analytics";

/**
 * Monta o evento "Purchase" da Meta a partir do aviso "Pedido pago" da Appmax (sem rede, para poder testar).
 * O pagamento é confirmado na API da Appmax antes de chamar isto; o evento sai do servidor, então conta
 * mesmo quando o cliente paga o Pix no app do banco e fecha o navegador. O eventID é o mesmo do pixel
 * (`purchase-<pedido>`), então a Meta junta os dois e não conta a venda em dobro.
 */
export type PurchaseFromOrder = {
  eventId: string;
  customData: Record<string, unknown>;
  userData: { email: string; phone: string; externalId: string };
};

const num = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
const text = (v: unknown) => String(v ?? "").trim();

/** O `sku` que o checkout manda é o slug do produto, com "-kit2", "-kit3" ou "-comp5" no fim quando há oferta. */
const slugFromSku = (sku: string) => sku.replace(/-(kit2|kit3|comp5)$/, "");

export function purchaseFromPaidOrder(data: Record<string, unknown>): PurchaseFromOrder | null {
  const id = Number(data["id"]);
  if (!Number.isInteger(id) || id <= 0) return null;
  const value = num(data["total"]);
  if (value <= 0) return null;

  const contents: { id: string; quantity: number; item_price: number }[] = [];
  for (const b of Array.isArray(data["bundles"]) ? (data["bundles"] as Record<string, unknown>[]) : []) {
    for (const p of Array.isArray(b["products"]) ? (b["products"] as Record<string, unknown>[]) : []) {
      const sku = text(p["sku"]);
      if (!sku) continue;
      const name = text(p["name"]);
      const units = Math.max(1, Number(/^(\d+)\s*x\s/i.exec(name)?.[1]) || 1) * Math.max(1, Math.round(num(p["quantity"])) || 1);
      contents.push({
        id: metaCatalogId(catalogId(slugFromSku(sku))),
        quantity: units,
        item_price: Number((num(p["price"]) / units).toFixed(2)),
      });
    }
  }

  const c = (data["customer"] ?? {}) as Record<string, unknown>;
  return {
    eventId: `purchase-${id}`,
    customData: {
      currency: "BRL",
      value,
      ...(contents.length
        ? {
            content_type: "product",
            content_ids: contents.map((x) => x.id),
            contents,
            num_items: contents.reduce((s, x) => s + x.quantity, 0),
          }
        : {}),
    },
    userData: { email: text(c["email"]), phone: text(c["telephone"]), externalId: String(id) },
  };
}
