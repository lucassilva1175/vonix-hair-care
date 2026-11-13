import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { purchaseFromPaidOrder } from "@/lib/capi-purchase";

vi.mock("@/lib/env.server", () => ({
  env: (name: string) => (name === "META_CAPI_TOKEN" ? "token-de-teste" : undefined),
}));

import { phoneForMeta, sendMetaEvent } from "@/lib/meta-capi.server";
import { SITE_URL } from "@/lib/store";

/** Aviso "Pedido pago" no formato real da Appmax (mesmo exemplo do teste da etiqueta). */
const paid = {
  id: 132469895,
  total: 15.8,
  status: "aprovado",
  bundles: [
    {
      products: [
        { sku: "perfume-capilar-vonix", name: "1x Perfume Capilar Vonix (Rubi 60ml)", price: "1.00", quantity: 1 },
        { sku: "kit-banana-e-mel-kit2", name: "2x Kit Banana e Mel (Kit)", price: "100.00", quantity: 1 },
      ],
    },
  ],
  customer: { email: "Cliente@Example.com ", telephone: "31991439228" },
};

describe("Purchase da Meta pelo servidor", () => {
  it("monta o evento do pedido pago: mesmo eventID do pixel, valor pago e produtos do catálogo", () => {
    const p = purchaseFromPaidOrder(paid);
    expect(p?.eventId).toBe("purchase-132469895");
    expect(p?.customData).toMatchObject({ currency: "BRL", value: 15.8, num_items: 3 });
    expect(p?.customData["content_ids"]).toEqual(["VONIX-PERFUME-CAPILAR-VONIX", "VONIX-KIT-BANANA-E-MEL"]);
    expect(p?.userData).toEqual({ email: "Cliente@Example.com", phone: "31991439228", externalId: "132469895" });
  });
  it("ignora aviso sem número de pedido ou sem valor", () => {
    expect(purchaseFromPaidOrder({ ...paid, id: 0 })).toBeNull();
    expect(purchaseFromPaidOrder({ ...paid, total: 0 })).toBeNull();
  });
  it("telefone vai com o 55 do Brasil", () => {
    expect(phoneForMeta("(31) 99143-9228")).toBe("5531991439228");
    expect(phoneForMeta("5531991439228")).toBe("5531991439228");
    expect(phoneForMeta("123")).toBe("");
  });
});

describe("API de Conversões: só o servidor cria venda", () => {
  const fetchMock = vi.fn();
  beforeEach(() => {
    fetchMock.mockReset().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => vi.unstubAllGlobals());
  const base = { event: "Purchase", eventId: "purchase-1", url: `${SITE_URL}/checkout`, customData: { value: 999, currency: "BRL" } };

  it("Purchase vindo do navegador (sem confiança) é descartado e nada é enviado à Meta", async () => {
    expect(await sendMetaEvent(base)).toBe("skipped");
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("outros eventos do navegador continuam funcionando", async () => {
    expect(await sendMetaEvent({ ...base, event: "AddToCart", eventId: "add_to_cart-1" })).toBe("sent");
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
  it("Purchase do servidor vai com e-mail e telefone em hash, nunca em texto puro", async () => {
    const r = await sendMetaEvent({
      ...base,
      trusted: true,
      userData: { email: "Cliente@Example.com ", phone: "31991439228", externalId: "1" },
    });
    expect(r).toBe("sent");
    const body = String(fetchMock.mock.calls[0]?.[1]?.body);
    expect(body).not.toContain("example.com");
    expect(body).not.toContain("31991439228");
    const user = JSON.parse(body).data[0].user_data;
    expect(user.em[0]).toMatch(/^[0-9a-f]{64}$/);
    expect(user.ph[0]).toMatch(/^[0-9a-f]{64}$/);
    expect(user.external_id[0]).toMatch(/^[0-9a-f]{64}$/);
  });
});
