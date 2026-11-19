import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { env } from "./env.server";
import { SIGNUP_COUPON } from "./coupons";

const leadSchema = z.object({
  nome: z.string().trim().max(80).optional(),
  email: z.string().trim().toLowerCase().email().max(160),
  /** Campo-isca escondido: gente de verdade não preenche, robô preenche. */
  empresa: z.string().max(200).optional(),
});

const cartLeadSchema = z.object({
  nome: z.string().trim().min(2).max(80),
  whatsapp: z.string().trim().max(30),
  email: z.string().trim().toLowerCase().max(160).optional(),
  status: z.enum(["preencheu", "comprou"]),
  itens: z.string().max(400),
  total: z.number().min(0).max(100000),
  frete: z.string().max(120).optional(),
  cidade: z.string().max(80).optional(),
  uf: z.string().max(2).optional(),
});

/**
 * Carrinho abandonado: o checkout manda nome + WhatsApp assim que a pessoa os preenche (antes de gerar o Pix),
 * e de novo com status "comprou" quando o pagamento é aprovado, para a planilha separar quem converteu de quem não.
 * Destino: LEAD_WEBHOOK_URL (mesmo webhook do cadastro). Sem webhook, só aparece no log do servidor.
 */
export const registerCartLead = createServerFn({ method: "POST" })
  .inputValidator(cartLeadSchema)
  .handler(async ({ data }) => {
    const digits = data.whatsapp.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 13) return { ok: true as const, saved: false };
    const lead = { origem: "carrinho", ...data, whatsapp: digits, em: new Date().toISOString() };
    const url = env("LEAD_WEBHOOK_URL");
    if (!url) {
      console.info("[carrinho]", lead.nome, lead.whatsapp, lead.status);
      return { ok: true as const, saved: false };
    }
    try {
      const r = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(lead),
        signal: AbortSignal.timeout(6000),
      });
      if (!r.ok) throw new Error(`webhook respondeu ${r.status}`);
      return { ok: true as const, saved: true };
    } catch (e) {
      console.error("[carrinho] webhook falhou", e, lead.whatsapp);
      return { ok: true as const, saved: false };
    }
  });

/**
 * Cadastro no site: quem se cadastra ganha o cupom de boas-vindas (o cupom em si é entregue no navegador).
 * Aqui só guardamos o contato. Destino: LEAD_WEBHOOK_URL (planilha, Brevo, Zapier, Make...), que recebe um POST JSON.
 * Sem webhook configurado o contato só aparece no log do servidor, então configure o webhook para não perder cadastros.
 */
export const registerLead = createServerFn({ method: "POST" })
  .inputValidator(leadSchema)
  .handler(async ({ data }) => {
    if (data.empresa) return { ok: true as const, saved: false }; // robô: finge que deu certo e descarta
    const lead = { origem: "cadastro-site", nome: data.nome ?? "", email: data.email, cupom: SIGNUP_COUPON, em: new Date().toISOString() };
    const url = env("LEAD_WEBHOOK_URL");
    if (!url) {
      console.info("[cadastro]", lead.email, lead.nome);
      return { ok: true as const, saved: false };
    }
    try {
      const r = await fetch(url, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(lead),
        signal: AbortSignal.timeout(6000),
      });
      if (!r.ok) throw new Error(`webhook respondeu ${r.status}`);
      return { ok: true as const, saved: true };
    } catch (e) {
      console.error("[cadastro] webhook falhou", e, lead.email);
      return { ok: true as const, saved: false };
    }
  });
