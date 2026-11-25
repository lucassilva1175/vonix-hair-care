import { getProduct, incluidosNosCombos, products, type Product } from "@/lib/store";

const ANTI_RESIDUO: Record<string, string> = {
  "progressiva-diamond": "shampoo-diamond-anti-residuo",
  "selagem-termica-diamond": "shampoo-diamond-anti-residuo",
};
const ANTI_RESIDUO_ANY = ["shampoo-fio-de-luz-anti-residuo", "shampoo-diamond-anti-residuo"];
const PERFUMES = ["perfume-capilar-vonix-rubi", "perfume-capilar-vonix-ouro", "perfume-capilar-vonix-azul", "perfume-capilar-vonix-verde"];

/** Por que cada item combina. Só fatos do cadastro e do rótulo: nada de promessa nem de "quem comprou também comprou" sem dado real. */
const REASON: Record<string, string> = {
  "shampoo-fio-de-luz-anti-residuo": "Remove resíduos e prepara os fios: o primeiro passo para o procedimento render o melhor.",
  "shampoo-diamond-anti-residuo": "Limpeza profunda cremosa que prepara os fios antes do tratamento ou do alisamento.",
  "mascara-efeito-teia-coco-nutri": "Nutrição e maciez com óleo de coco para cuidar do cabelo em casa, entre uma aplicação e outra.",
  "mascara-reparacao-nutri-repair": "Nutrição do comprimento e controle de frizz para o cronograma de casa.",
  "defrizante": "Controle de frizz, brilho e proteção térmica antes de secar.",
  "serum-argan": "1 ou 2 gotas de óleo de argan finalizam com brilho e nutrição, sem pesar.",
  "ampola-de-hidratacao-mousse-flash": "Hidratação rápida em 4 minutos, para qualquer dia da semana.",
  "reparador-de-pontas": "Acabamento e melhora visual das pontas, com filtro UV citado pelo fabricante.",
  "shampoo-hidratante-dep-toc": "Lavagem suave com foco em hidratação, em 1 litro.",
  "perfume-capilar-vonix-rubi": "Fecha com perfume: fragrância oriental e amadeirada, brilho intenso e super hidratação no rótulo.",
  "perfume-capilar-vonix-ouro": "Perfume para o cabelo, em frasco dourado: fragrância oriental e amadeirada.",
  "perfume-capilar-vonix-azul": "Perfume para o cabelo, em frasco azul: fragrância oriental e amadeirada.",
  "perfume-capilar-vonix-verde": "Perfume para o cabelo, em frasco verde: fragrância oriental e amadeirada.",
};

/** Vitrine só de combos (24/11/2026): quem leva uma progressiva, selagem ou o SOS solto recebe o combo montado; quem já leva um combo recebe um finalizador. */
const COMBOS_DO_ITEM: Record<string, string[]> = {
  "progressiva-fio-de-luz": ["combo-fio-de-luz-shampoo-anti-residuo", "combo-fio-de-luz-completo", "combo-fio-de-luz-serum"],
  "progressiva-diamond": ["combo-diamond-shampoo-anti-residuo", "combo-diamond-defrizante"],
  "progressiva-lift-em-gel": ["combo-lift-em-gel-shampoo", "combo-lift-em-gel-serum"],
  "progressiva-vonix-special-matizadora": ["combo-special-matizadora-shampoo", "combo-special-matizadora-reparador"],
  "selagem-termica-diamond": ["combo-selagem-diamond-shampoo", "combo-diamond-defrizante"],
  "sos-reconstrutor-capilar": ["combo-sos-shampoo", "combo-sos-reconstrutor"],
  "botox-vonix": ["combo-botox-vonix-shampoo", "combo-botox-vonix-nutri-repair"],
  "botox-line": ["combo-botox-line-shampoo", "combo-botox-vonix-nutri-repair"],
};
const FINALIZACAO = ["combo-finalizacao-serum", "combo-perfume-e-serum", "combo-trio-shampoos-hidratantes"];

/** Combos de progressiva (o que leva progressiva recebe sempre a mesma oferta de acabamento). */
const COMBO_PROGRESSIVA = /^combo-(fio-de-luz|diamond|lift-em-gel|special-matizadora)/;

export type Extra = { product: Product; reason: string };
export type UpsellPlan = { title: string; subtitle: string; items: Extra[] };

const isChemical = (p: Product) => p.category === "quimica" || p.slug.startsWith("selagem");

/**
 * "Leve também" da gaveta de compra: sugestões personalizadas pelo que está no carrinho (sempre as mesmas para o mesmo carrinho).
 * - Progressiva / botox / selagem: shampoo anti-resíduo certo, máscara hidratante, finalizador e perfume.
 * - Kits e unidades avulsas: o que completa a rotina da mesma linha, finalizador e perfume.
 * - Perfume: as outras cores da coleção.
 */
export function upsellPlan(cartSlugs: string[], count = 4): UpsellPlan {
  const inCart = new Set(cartSlugs);
  const cartProducts = cartSlugs.map((s) => getProduct(s)).filter((p): p is Product => !!p);
  const chem = [...cartProducts].reverse().find(isChemical);
  const main = chem ?? cartProducts[cartProducts.length - 1];
  let picks: string[] = [];
  let title = "Complete o seu pedido";
  let subtitle = main ? `Combina com ${main.name}` : "Escolhidos para combinar";

  const temProgressiva = cartSlugs.some((s) => s.startsWith("progressiva-") || COMBO_PROGRESSIVA.test(s));
  if (temProgressiva) {
    const solta = cartSlugs.find((s) => s.startsWith("progressiva-"));
    picks = [ANTI_RESIDUO[solta ?? ""] ?? "shampoo-fio-de-luz-anti-residuo", "defrizante", "reparador-de-pontas", "serum-argan", PERFUMES[0]!];
    title = "Complete a sua progressiva";
    subtitle = "Shampoo anti-resíduo, defrizante, finalizador e perfume";
  }
  const soltoComCombo = cartSlugs.find((s) => COMBOS_DO_ITEM[s]);
  const temCombo = cartSlugs.some((s) => s.startsWith("combo-"));
  if (temProgressiva) {
    // oferta de progressiva definida acima
  } else if (soltoComCombo && !temCombo) {
    picks = COMBOS_DO_ITEM[soltoComCombo]!;
    title = "Leve o combo completo";
    subtitle = "Shampoo anti-resíduo e finalizador já no mesmo pedido";
  } else if (temCombo) {
    picks = FINALIZACAO;
    title = "Complete com mais um combo";
    subtitle = "Finalização e cuidado para fechar o resultado";
  } else if (chem) {
    const anti = ANTI_RESIDUO[chem.slug] ?? "shampoo-fio-de-luz-anti-residuo";
    picks = ANTI_RESIDUO_ANY.some((s) => inCart.has(s)) ? [] : [anti];
    picks.push("mascara-efeito-teia-coco-nutri", "defrizante", PERFUMES[0]!, "serum-argan", "mascara-reparacao-nutri-repair");
    title = "Complete o seu procedimento";
  } else if (main?.category === "avulsos" && main.kit) {
    const sameLine = products.filter((p) => p.category === "avulsos" && p.kit === main.kit).map((p) => p.slug);
    picks = [...sameLine, main.kit, "serum-argan", PERFUMES[0]!, "defrizante"];
    title = "Complete o ritual";
    subtitle = `Mais da mesma linha de ${main.name}`;
  } else if (main?.category === "kits") {
    picks = ["serum-argan", PERFUMES[0]!, "defrizante", "ampola-de-hidratacao-mousse-flash", "reparador-de-pontas"];
    title = "Complete a sua rotina";
  } else if (main && PERFUMES.includes(main.slug)) {
    picks = [...PERFUMES, "serum-argan", "defrizante"];
    title = "Complete a coleção";
    subtitle = "As outras cores do Gloss Shine Parfum Spray";
  } else if (main?.category === "finalizadores") {
    picks = ["mascara-efeito-teia-coco-nutri", "shampoo-hidratante-dep-toc", PERFUMES[0]!, "ampola-de-hidratacao-mousse-flash"];
  } else if (main) {
    picks = ["defrizante", "serum-argan", PERFUMES[0]!, "shampoo-hidratante-dep-toc", "ampola-de-hidratacao-mousse-flash"];
    title = "Complete o seu tratamento";
  } else {
    picks = ["serum-argan", "defrizante", PERFUMES[0]!];
  }

  const incluidos = incluidosNosCombos(cartSlugs);
  const items: Extra[] = [];
  for (const slug of picks) {
    const p = getProduct(slug);
    if (!p || inCart.has(p.slug) || incluidos.has(p.slug) || !p.images[0] || items.some((i) => i.product.slug === p.slug)) continue;
    items.push({ product: p, reason: REASON[slug] ?? p.short });
    if (items.length >= count) break;
  }
  return { title, subtitle, items };
}
