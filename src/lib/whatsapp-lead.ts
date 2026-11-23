/**
 * Formulário "Falar com a Vonix": 3 perguntas curtas antes de abrir o WhatsApp.
 * Serve para separar quem quer comprar de quem só está olhando (o anúncio de WhatsApp trazia muita gente que
 * chamava e sumia). Só quem quer comprar hoje ou nesta semana conta como lead para a Meta e vai ao WhatsApp.
 */

export const PERFIS = [
  { id: "profissional", label: "Sou cabeleireira / tenho salão" },
  { id: "casa", label: "Uso em casa" },
] as const;

export const PRODUTOS = [
  { id: "fio-de-luz", label: "Progressiva Fio de Luz" },
  { id: "botox", label: "Botox Vonix" },
  { id: "sos", label: "SOS Reconstrutor" },
  { id: "kits", label: "Kits e combos" },
  { id: "nao-sei", label: "Ainda não sei, quero ajuda" },
] as const;

export const QUANDO = [
  { id: "hoje", label: "Hoje" },
  { id: "semana", label: "Nesta semana" },
  { id: "olhando", label: "Só estou olhando" },
] as const;

export type PerfilId = (typeof PERFIS)[number]["id"];
export type ProdutoId = (typeof PRODUTOS)[number]["id"];
export type QuandoId = (typeof QUANDO)[number]["id"];

export type Respostas = { perfil: PerfilId; produto: ProdutoId; quando: QuandoId };

export const label = <T extends { id: string; label: string }>(list: readonly T[], id: string) =>
  list.find((x) => x.id === id)?.label ?? id;

/** Quer comprar logo (hoje ou nesta semana)? Só esses viram lead para a Meta e vão ao WhatsApp. */
export const qualificado = (r: Pick<Respostas, "quando">) => r.quando === "hoje" || r.quando === "semana";

/** Número do WhatsApp da Vonix (o mesmo do botão do site), só dígitos. */
export const WHATSAPP_NUMERO = "5531971185662";

/** Mensagem que já chega no WhatsApp com as respostas, para o atendimento começar sabendo o que a pessoa quer. */
export function mensagemWhatsapp(nome: string, r: Respostas) {
  const linhas = [
    `Olá! Sou ${nome.trim()}, respondi o formulário da Vonix Hair e quero falar com um vendedor.`,
    `Perfil: ${label(PERFIS, r.perfil)}`,
    `Procuro: ${label(PRODUTOS, r.produto)}`,
    `Quero comprar: ${label(QUANDO, r.quando).toLowerCase()}`,
  ];
  return linhas.join("\n");
}

export const linkWhatsapp = (nome: string, r: Respostas) =>
  `https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent(mensagemWhatsapp(nome, r))}`;
