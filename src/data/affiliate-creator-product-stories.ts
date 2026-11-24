/**
 * Editorial suggestions for the existing three creator profiles.
 * Photos and product URLs come from the official Vonix catalogue stored in
 * src/data/products.json. These are NOT creator endorsements or guarantees.
 */
export const affiliateCreatorProductStories = [
  {
    profileId: "rotina",
    name: "Kit Banana e Mel",
    eyebrow: "Rotina com identidade",
    image: "/images/products/kit-banana-e-mel.webp",
    fallback: "/images/products/kit-banana-e-mel.jpg",
    href: "/produto/kit-banana-e-mel",
    alt: "Embalagens do Kit Banana e Mel, produto oficial do catálogo Vonix Hair",
    intro: "Uma inspiração para contar uma rotina sem simular uma experiência que ainda não viveu.",
    takes: [
      {
        label: "Apresente",
        text: "Comece pelas informações da embalagem e pelo contexto da sua rotina.",
      },
      { label: "Mostre", text: "Se já usou, registre sua própria experiência com transparência." },
      {
        label: "Converse",
        text: "Convide sua comunidade a conhecer a descrição oficial do produto.",
      },
    ],
  },
  {
    profileId: "ugc",
    name: "Máscara Nutri Repair",
    eyebrow: "Estética e composição",
    image: "/images/products/mascara-reparacao-nutri-repair.webp",
    fallback: "/images/products/mascara-reparacao-nutri-repair.jpg",
    href: "/produto/mascara-reparacao-nutri-repair",
    alt: "Embalagem da Máscara de Reparação Nutri Repair no catálogo oficial Vonix Hair",
    intro: "Um produto real como referência visual para explorar enquadramento, luz e detalhes.",
    takes: [
      { label: "Enquadre", text: "Pense em uma composição simples que valorize a embalagem." },
      { label: "Detalhe", text: "Destaque rótulos e características sem modificar informações." },
      { label: "Finalize", text: "Monte uma peça autoral sem apresentar demonstrações fictícias." },
    ],
  },
  {
    profileId: "informacao",
    name: "Kit Cronograma Capilar",
    eyebrow: "Informação confiável",
    image: "/images/products/kit-cronograma-capilar.webp",
    fallback: "/images/products/kit-cronograma-capilar.jpg",
    href: "/produto/kit-cronograma-capilar",
    alt: "Embalagens do Kit Cronograma Capilar vendidas na loja oficial Vonix Hair",
    intro:
      "Um ponto de partida para explicar uma linha de cuidados usando fontes e rótulos oficiais.",
    takes: [
      { label: "Pesquise", text: "Identifique no catálogo os itens que compõem o kit." },
      { label: "Explique", text: "Separe descrição da fabricante de opinião pessoal." },
      { label: "Confira", text: "Recomende consultar as orientações oficiais antes de usar." },
    ],
  },
] as const;
