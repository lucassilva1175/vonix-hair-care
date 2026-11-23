import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { env } from "./env.server";
import { SIGNUP_COUPON } from "./coupons";

const leadSchema = z.object({
  nome: z.string().trim().max(80).optional(),
  email: z.string().trim().toLowerCase().email().max(160),
  /** Campo-isca escondido: gente de verdade não preenche, robô preenche. */
  empresa: z.string().max(200).optional(),
  /** WhatsApp (a lista VIP da Black Friday pede). O app guarda só dígitos e ignora número que não parece de telefone. */
  telefone: z.string().trim().max(25).optional(),
  /** De onde veio o cadastro. A lista VIP da Black Friday não ganha cupom: ganha o aviso em primeira mão. */
  origem: z.enum(["cadastro-site", "esquenta-black-friday"]).optional(),
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
 * Só confirma cadastro após o destino aceitar o contato; nunca registra dados pessoais em logs.
 */
export const registerLead = createServerFn({ method: "POST" })
  .inputValidator(leadSchema)
  .handler(async ({ data }) => {
    if (data.empresa)
      return { ok: false as const, saved: false, message: "Não foi possível concluir o cadastro." };
    const lead = {
      origem: data.origem ?? "cadastro-site",
      nome: data.nome ?? "",
      email: data.email,
      telefone: data.telefone ?? "",
      cupom: data.origem === "esquenta-black-friday" ? "" : SIGNUP_COUPON,
      em: new Date().toISOString(),
    };
    // Destinos: o app de expedição da Vonix (tela "Contatos do site") e, se existir, LEAD_WEBHOOK_URL (planilha, Brevo, Zapier...).
    // Basta um aceitar o contato para confirmar o cadastro.
    const appUrl = env("AFFILIATE_APP_URL");
    const appSecret = env("AFFILIATE_SITE_SECRET");
    const webhook = env("LEAD_WEBHOOK_URL");
    const destinos: { url: string; headers: Record<string, string> }[] = [];
    if (appUrl && appSecret) {
      destinos.push({
        url: `${appUrl.replace(/\/+$/, "")}/api/public/contatos`,
        headers: { "content-type": "application/json", authorization: `Bearer ${appSecret}` },
      });
    }
    if (webhook) destinos.push({ url: webhook, headers: { "content-type": "application/json" } });
    if (destinos.length === 0) {
      return {
        ok: false as const,
        saved: false,
        message: "O cadastro está indisponível no momento. Tente novamente mais tarde.",
      };
    }
    // Motivo da falha (só um código, sem dado pessoal): "http-401", "http-503", "rede"...
    const resultados = await Promise.all(
      destinos.map(async (d) => {
        try {
          const r = await fetch(d.url, { method: "POST", headers: d.headers, body: JSON.stringify(lead), signal: AbortSignal.timeout(6000) });
          return r.ok ? "ok" : `http-${r.status}`;
        } catch (e) {
          return e instanceof Error && e.name === "TimeoutError" ? "demorou" : "rede";
        }
      }),
    );
    if (resultados.includes("ok")) return { ok: true as const, saved: true };
    return {
      ok: false as const,
      saved: false,
      why: resultados.join(","),
      message: "Não foi possível salvar seu cadastro. Tente novamente em instantes.",
    };
  });

const whatsappLeadSchema = z.object({
  nome: z.string().trim().min(2).max(80),
  whatsapp: z.string().trim().max(30),
  perfil: z.enum(["profissional", "casa"]),
  produto: z.enum(["fio-de-luz", "botox", "sos", "kits", "nao-sei"]),
  quando: z.enum(["hoje", "semana", "olhando"]),
  /** Campo-isca escondido: gente de verdade não preenche. */
  empresa: z.string().max(200).optional(),
});

/**
 * Formulário "Falar com a Vonix" (anúncio de WhatsApp): guarda as respostas para a planilha separar quem quer comprar
 * de quem só está olhando. Melhor esforço: se o destino falhar, a pessoa segue para o WhatsApp do mesmo jeito.
 * Destino: LEAD_WEBHOOK_URL. Sem webhook, só um aviso curto no log (sem telefone).
 */
export const registerWhatsappLead = createServerFn({ method: "POST" })
  .inputValidator(whatsappLeadSchema)
  .handler(async ({ data }) => {
    if (data.empresa) return { ok: false as const, saved: false };
    const digits = data.whatsapp.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 13) return { ok: false as const, saved: false };
    const qualificado = data.quando === "hoje" || data.quando === "semana";
    const lead = {
      origem: "formulario-whatsapp",
      nome: data.nome,
      whatsapp: digits,
      perfil: data.perfil,
      produto: data.produto,
      quando: data.quando,
      qualificado,
      em: new Date().toISOString(),
    };
    const url = env("LEAD_WEBHOOK_URL");
    if (!url) {
      console.info("[formulario-whatsapp]", data.perfil, data.produto, data.quando);
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
      console.error("[formulario-whatsapp] webhook falhou", e);
      return { ok: true as const, saved: false };
    }
  });
