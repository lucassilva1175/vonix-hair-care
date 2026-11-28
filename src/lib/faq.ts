/**
 * Perguntas frequentes da loja (site para cabeleireiras e donas de salão). Só fatos que já estão
 * nas políticas e no checkout do site (frete, pagamento, troca, atendimento); nada de promessa de resultado.
 */
export type FaqItem = { q: string; a: string };

export const FAQ_LOJA: FaqItem[] = [
  {
    q: "Para quem é o site da Vonix?",
    a: "O site é feito para cabeleireiras e donas de salão: produtos profissionais e combos prontos para o dia a dia do salão, com desconto automático.",
  },
  {
    q: "Posso comprar com um vendedor ou só pelo site?",
    a: "Você escolhe. Pode comprar direto no site, com Pix, cartão ou boleto, ou pedir para falar com um vendedor da Vonix pelo botão verde do WhatsApp, no canto da tela. O vendedor tira suas dúvidas e ajuda a montar o seu pedido.",
  },
  {
    q: "Como funcionam os combos?",
    a: "Cada combo já sai com 5% OFF no preço e, no Pix, você ganha mais 5% por cima. Na página \"Monte seu combo\" você escolhe os produtos do seu salão e o desconto também vale.",
  },
  {
    q: "Para onde vocês entregam?",
    a: "Entregamos para todo o Brasil, com frete grátis. Consulte a disponibilidade e o prazo de entrega pelo CEP no carrinho ou no checkout.",
  },
  {
    q: "Quais são as formas de pagamento?",
    a: "Pix, com 5% a mais de desconto (inclusive nos combos), cartão de crédito em até 6x sem juros ou boleto bancário à vista. No boleto, o pedido é confirmado após a compensação. Os pagamentos são processados pela Appmax em ambiente seguro.",
  },
  {
    q: "Quanto ganho levando mais de um produto?",
    a: "Leve 2 unidades com 12% OFF e leve 3 com 15% OFF. Vale sempre o maior desconto, sem somar com o desconto do combo.",
  },
  {
    q: "Qual a diferença entre os botox?",
    a: "Cada produto traz na descrição o que ele é. O Botox Line (tampa azul) é com formol. Leia a descrição e o rótulo antes de escolher.",
  },
  {
    q: "Em quanto tempo o meu pedido chega e como acompanho?",
    a: "O prazo é calculado pelo seu CEP e aparece no carrinho ou no checkout. Quando a transportadora disponibiliza, enviamos o código ou o link de rastreamento por e-mail ou WhatsApp.",
  },
  {
    q: "Posso trocar ou devolver?",
    a: "Sim. Você pode desistir da compra em até 7 dias a partir do recebimento. Se o produto chegar errado, danificado ou vazando, registre fotos da embalagem e fale com a gente o quanto antes, que resolvemos.",
  },
  {
    q: "Como falo com o atendimento?",
    a: "Pelo WhatsApp ou pelo e-mail contato@vonixhaircosmeticos.com.br, de segunda a sexta, das 9h às 18h.",
  },
];
