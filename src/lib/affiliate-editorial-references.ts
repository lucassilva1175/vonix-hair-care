import { isProOnly, vitrine } from "@/lib/store";

export const EDITORIAL_REFERENCE_LIMIT = 6;
export function resolveEditorialReferences(slugs: readonly string[]) {
  const unique = [...new Set(slugs)].filter((slug) => slug !== "combo-perfume-e-serum");
  return unique
    .flatMap((slug) => {
      const item = vitrine.find((p) => p.slug === slug);
      return item
        ? [
            {
              slug: item.slug,
              name: item.name,
              category: item.categoryLabel,
              professional: isProOnly(item.slug),
              href: "/produto/" + item.slug,
            },
          ]
        : [];
    })
    .slice(0, EDITORIAL_REFERENCE_LIMIT);
}
export function appendEditorialReferences(plan: string, slugs: readonly string[]) {
  const references = resolveEditorialReferences(slugs);
  if (!references.length) return plan;
  return [
    plan,
    "MINHAS REFERÊNCIAS DO CATÁLOGO OFICIAL",
    ...references.map(
      (item) =>
        item.name +
        (item.professional ? " (uso exclusivamente profissional)" : "") +
        "\nhttps://vonixhair.com" +
        item.href,
    ),
    "Referências para pesquisa editorial, não são produtos recebidos, pedidos ou kit de inscrição. Confira o rótulo e as orientações oficiais; não simule uso.",
  ].join("\n\n");
}
