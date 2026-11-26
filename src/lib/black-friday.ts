/**
 * Black Friday 2026. Datas reais (horário de Brasília): o esquenta vai até a véspera e a oferta tem data final verdadeira.
 * Nada aqui muda preço: só diz em que fase o site está e guarda a lista de produtos-foco.
 */
export const BF_START = new Date("2026-11-27T00:00:00-03:00");
/** Decisão do dono (26/11/2026): sexta a domingo. */
export const BF_END = new Date("2026-11-29T23:59:59-03:00");

export type BfPhase = "esquenta" | "ativa" | "encerrada";

export const bfPhase = (now: Date = new Date()): BfPhase =>
  now < BF_START ? "esquenta" : now <= BF_END ? "ativa" : "encerrada";

/** A página e o aviso do esquenta só existem antes da Black Friday abrir. */
export const bfEsquentaAberto = (now: Date = new Date()) => bfPhase(now) === "esquenta";

/** Dias inteiros que faltam para abrir (0 no dia). */
export const bfDiasParaAbrir = (now: Date = new Date()) =>
  Math.max(0, Math.ceil((BF_START.getTime() - now.getTime()) / 864e5));

export const BF_DATA_ABERTURA = "27/11";

/** Produtos-foco da Black Friday: Botox, Fio de Luz e kits (Monovonix fica de fora: margem menor). */
export const BF_FOCO: { titulo: string; texto: string; slug: string }[] = [
  { titulo: "Botox Vonix", texto: "Controle de volume e frizz, com maciez e brilho.", slug: "botox-vonix" },
  { titulo: "Progressiva Fio de Luz", texto: "Alinhamento profissional para o salão.", slug: "progressiva-fio-de-luz" },
  { titulo: "Kits", texto: "Cronograma completo em um só pedido.", slug: "kit-cronograma-capilar" },
];

/**
 * Desconto público da Black Friday: nenhum (decisão do dono em 26/11/2026: a oferta é só do grupo VIP, por cupom).
 * O site continua com o preço normal para todo mundo.
 */
export const bfPct = (_slug: string | undefined, _now: Date = new Date()): number => 0;

/** Avulsos principais da oferta do grupo VIP. */
export const VIP_PRINCIPAIS: readonly string[] = [
  "progressiva-fio-de-luz",
  "botox-vonix",
  "botox-vonix-matizador",
  "progressiva-diamond",
  "sos-reconstrutor-capilar",
];

/** Desconto do cupom do grupo VIP por produto: combos 30%, avulsos principais 20% (conferido com o custo do distribuidor). */
export const vipPct = (slug: string | undefined): number => {
  if (!slug) return 0;
  if (slug.startsWith("combo-")) return 30;
  return VIP_PRINCIPAIS.includes(slug) ? 20 : 0;
};

/** Link de convite do grupo VIP no WhatsApp. Vazio = o botao nao aparece (preencher quando o grupo existir). */
export const BF_GRUPO_VIP = "https://chat.whatsapp.com/LANn3jhVc857miUWtjv8hV";
