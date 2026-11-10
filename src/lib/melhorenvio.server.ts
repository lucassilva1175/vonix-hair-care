import { isAllowedCarrier } from "./carriers";
import { env, requireEnv } from "./env.server";

export type ShippingProduct = { id: string; unitPrice: number; quantity: number };
export type ShippingQuote = { id: number; name: string; company: string; price: number; days: number };

const base = () =>
  env("MELHORENVIO_ENV") === "production" ? "https://melhorenvio.com.br" : "https://sandbox.melhorenvio.com.br";

/** Package size per unit is a catalog assumption: override via MELHORENVIO_* env vars with real measures. */
const pkg = () => ({
  width: Math.ceil(Number(env("MELHORENVIO_PKG_WIDTH_CM", "16"))),
  height: Math.ceil(Number(env("MELHORENVIO_PKG_HEIGHT_CM", "12"))),
  length: Math.ceil(Number(env("MELHORENVIO_PKG_LENGTH_CM", "22"))),
  weight: Number(env("MELHORENVIO_UNIT_WEIGHT_KG", "0.6")),
});

const headers = (token: string) => ({
  Accept: "application/json",
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
  "User-Agent": `Vonix Hair (${env("MELHORENVIO_CONTACT_EMAIL", "contato@vonixhaircosmeticos.com.br")})`,
});

async function me<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${base()}/api/v2/me${path}`, { method: "POST", headers: headers(requireEnv("MELHORENVIO_TOKEN")), body: JSON.stringify(body) });
  const text = await res.text();
  if (!res.ok) throw new Error(`Melhor Envio ${path} ${res.status}: ${text.slice(0, 400)}`);
  return JSON.parse(text) as T;
}

export type LabelParty = { name: string; email: string; document: string; phone: string; postal_code: string; address: string; number: string; complement: string; district: string; city: string; state_abbr: string };

/** Remetente (a loja), lido das variáveis STORE_ORIGIN_*. Falta algum dado → erro claro em vez de etiqueta recusada. */
export function senderFromEnv(): LabelParty {
  const need = (n: string) => requireEnv(n);
  return {
    name: need("STORE_ORIGIN_NAME"),
    email: need("STORE_ORIGIN_EMAIL"),
    document: need("STORE_ORIGIN_DOCUMENT").replace(/\D/g, ""),
    phone: need("STORE_ORIGIN_PHONE").replace(/\D/g, ""),
    postal_code: need("STORE_ORIGIN_CEP").replace(/\D/g, ""),
    address: need("STORE_ORIGIN_STREET"),
    number: need("STORE_ORIGIN_NUMBER"),
    complement: env("STORE_ORIGIN_COMPLEMENT"),
    district: need("STORE_ORIGIN_DISTRICT"),
    city: need("STORE_ORIGIN_CITY"),
    state_abbr: need("STORE_ORIGIN_STATE").toUpperCase(),
  };
}

export type LabelOrder = {
  serviceId: number;
  to: LabelParty;
  items: { name: string; quantity: number; unitary_value: number }[];
  units: number;
  insuranceValue: number;
  /** Se já existe carrinho no Melhor Envio para este pedido, não cria outro. */
  existingId?: string | undefined;
};

/**
 * Compra a etiqueta: carrinho → checkout (debita o saldo do Melhor Envio) → gerar → imprimir.
 * `onCart` é chamado assim que o carrinho existe, para o id ficar salvo antes de gastar saldo.
 */
export async function buyLabel(o: LabelOrder, onCart?: (id: string) => Promise<unknown>) {
  const p = pkg();
  let id = o.existingId;
  if (!id) {
    const cart = await me<{ id: string }>("/cart", {
      service: o.serviceId,
      from: senderFromEnv(),
      to: o.to,
      products: o.items,
      volumes: [{ width: p.width, height: p.height, length: p.length, weight: Number((p.weight * o.units).toFixed(3)) }],
      options: { insurance_value: Number(o.insuranceValue.toFixed(2)), receipt: false, own_hand: false, reverse: false, non_commercial: true },
    });
    id = cart.id;
    await onCart?.(id);
  }
  await me("/shipment/checkout", { orders: [id] });
  await me("/shipment/generate", { orders: [id] });
  let tracking = "";
  try {
    const t = await me<Record<string, { tracking?: string }>>("/shipment/tracking", { orders: [id] });
    tracking = t[id]?.tracking ?? "";
  } catch (e) {
    console.error("[melhorenvio] rastreio ainda indisponível", e);
  }
  return { id, tracking };
}

export async function calculateShipping(toCep: string, products: ShippingProduct[]): Promise<ShippingQuote[]> {
  const token = requireEnv("MELHORENVIO_TOKEN");
  const from = requireEnv("STORE_ORIGIN_CEP").replace(/\D/g, "");
  const p = pkg();
  const res = await fetch(`${base()}/api/v2/me/shipment/calculate`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "User-Agent": `Vonix Hair (${env("MELHORENVIO_CONTACT_EMAIL", "contato@vonixhaircosmeticos.com.br")})`,
    },
    body: JSON.stringify({
      from: { postal_code: from },
      to: { postal_code: toCep.replace(/\D/g, "") },
      products: products.map((x) => ({
        id: x.id,
        width: p.width,
        height: p.height,
        length: p.length,
        weight: p.weight,
        insurance_value: Number(x.unitPrice.toFixed(2)),
        quantity: x.quantity,
      })),
    }),
  });
  if (!res.ok) throw new Error(`Melhor Envio ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const data = (await res.json()) as {
    id: number;
    name: string;
    price: string | number;
    custom_price?: string | number;
    delivery_time?: number;
    custom_delivery_time?: number;
    error?: string;
    company?: { name?: string };
  }[];
  return data
    .filter((q) => !q.error && (q.custom_price ?? q.price) != null && isAllowedCarrier(q.company?.name ?? ""))
    .map((q) => ({
      id: q.id,
      name: q.name,
      company: q.company?.name ?? "",
      price: Number(q.custom_price ?? q.price),
      days: Number(q.custom_delivery_time ?? q.delivery_time ?? 0),
    }))
    .sort((a, b) => a.price - b.price);
}
