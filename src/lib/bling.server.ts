import { env, requireEnv } from "./env.server";
import type { AppmaxOrder } from "./appmax.server";

/**
 * Bling API v3 (ERP): cria o pedido de venda quando o pagamento é confirmado na Appmax.
 * Desligado até as chaves existirem (BLING_CLIENT_ID, BLING_CLIENT_SECRET e BLING_REFRESH_TOKEN).
 * O refresh token do Bling muda a cada renovação; aqui o mais novo fica só em memória.
 * Para produção estável, guarde o novo token num banco (pendência no docs/ESTRUTURA.md).
 */
const AUTH = "https://www.bling.com.br/Api/v3/oauth/token";
const API = "https://api.bling.com.br/Api/v3";

export const blingEnabled = () => Boolean(env("BLING_CLIENT_ID") && env("BLING_CLIENT_SECRET") && env("BLING_REFRESH_TOKEN"));

let cached: { token: string; expiresAt: number } | null = null;
let refreshToken = "";

async function getToken(force = false) {
  if (!force && cached && cached.expiresAt > Date.now() + 60_000) return cached.token;
  const basic = Buffer.from(`${requireEnv("BLING_CLIENT_ID")}:${requireEnv("BLING_CLIENT_SECRET")}`).toString("base64");
  const res = await fetch(AUTH, {
    method: "POST",
    headers: { Authorization: `Basic ${basic}`, "Content-Type": "application/x-www-form-urlencoded", Accept: "1.0" },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken || requireEnv("BLING_REFRESH_TOKEN") }),
  });
  if (!res.ok) throw new Error(`Bling auth ${res.status}`);
  const j = (await res.json()) as { access_token: string; refresh_token: string; expires_in: number };
  refreshToken = j.refresh_token;
  cached = { token: j.access_token, expiresAt: Date.now() + j.expires_in * 1000 };
  return cached.token;
}

async function bling<T>(method: "GET" | "POST", path: string, body?: unknown, retried = false): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    method,
    headers: { Authorization: `Bearer ${await getToken(retried)}`, Accept: "application/json", "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (res.status === 401 && !retried) return bling<T>(method, path, body, true);
  const text = await res.text();
  if (!res.ok) throw new Error(`Bling ${method} ${path} ${res.status}: ${text.slice(0, 400)}`);
  return JSON.parse(text) as T;
}

/** Campos que o pedido da Appmax costuma trazer; a estrutura exata será confirmada com a chave de teste. */
type Loose = {
  customer?: { first_name?: string; last_name?: string; email?: string; phone?: string; document_number?: string; address?: { street?: string; number?: string; complement?: string; district?: string; city?: string; state?: string; postcode?: string } };
  products?: { sku?: string; name?: string; quantity?: number; unit_value?: number }[];
  shipping_value?: number;
  discount_value?: number;
};

/** Envia a venda paga ao Bling. Usa o número do pedido Appmax como numeroLoja para não duplicar. */
export async function sendPaidOrder(order: AppmaxOrder) {
  if (!blingEnabled()) return "bling desligado";
  const o = order.data.order as AppmaxOrder["data"]["order"] & Loose;
  const c = o.customer;
  if (!c || !o.products?.length) return "pedido da Appmax sem cliente ou itens: mapeamento a confirmar";
  const a = c.address ?? {};
  await bling("POST", "/pedidos/vendas", {
    numeroLoja: String(o.id),
    data: new Date().toISOString().slice(0, 10),
    contato: { nome: `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim(), tipoPessoa: "F", numeroDocumento: c.document_number, email: c.email, celular: c.phone },
    itens: o.products.map((p) => ({ codigo: p.sku, descricao: p.name, unidade: "UN", quantidade: p.quantity, valor: p.unit_value })),
    desconto: { valor: o.discount_value ?? 0, unidade: "REAL" },
    transporte: {
      fretePorConta: 0,
      frete: o.shipping_value ?? 0,
      etiqueta: { nome: `${c.first_name ?? ""} ${c.last_name ?? ""}`.trim(), endereco: a.street, numero: a.number, complemento: a.complement, bairro: a.district, municipio: a.city, uf: a.state, cep: a.postcode },
    },
  });
  return "enviado";
}
