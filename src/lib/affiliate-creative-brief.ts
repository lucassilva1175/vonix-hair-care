/** Original, non-commercial educational prompts. Never imply real creator content. */
export type AffiliateCreativeBrief = {
  name: string;
  opening: string;
  takes: readonly string[];
};

export function buildCreativeBrief({ name, opening, takes }: AffiliateCreativeBrief): string {
  return [
    "VONIX HAIR · IDEIA EDITORIAL DE CONTEÚDO",
    "Formato: " + name,
    "Abertura sugerida: " + opening,
    "",
    "Sequência sugerida:",
    ...takes.map((take, index) => index + 1 + ". " + take),
    "",
    "Roteiro educativo para inspiração. Ajuste com a sua linguagem e somente com experiências reais.",
    "Não simule uso de produto, resultados nem depoimentos. Identifique publicidade se houver parceria.",
    "Esta ideia não é aprovação, comissão, contrato ou conteúdo produzido por afiliadas.",
  ].join("\n");
}
