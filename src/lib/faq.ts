/**
 * Perguntas frequentes da loja. Só fatos que já estão nas políticas e no checkout do site
 * (frete, pagamento, troca, atendimento); nada de promessa de resultado.
 */
export type FaqItem = { q: string; a: string };

export const FAQ_LOJA: FaqItem[] = [
  {
    q: "Como funciona o frete?",
    a: "O frete é grátis para todo o Brasil, em qualquer pedido. O prazo aparece na página do produto e no checkout, conforme o seu CEP.",
  },
  {
    q: "Quais são as formas de pagamento?",
    a: "Pix, com 5% OFF nos itens sem outra oferta, ou cartão de crédito em até 6x sem juros. Os pagamentos são processados em ambiente seguro.",
  },
  {
    q: "Em quanto tempo o meu pedido chega?",
    a: "O prazo estimado aparece conforme o CEP e a entrega escolhida no checkout. Ele considera a aprovação do pagamento, a preparação do pedido e o transporte.",
  },
  {
    q: "Como acompanho o meu pedido?",
    a: "Quando a transportadora disponibiliza, enviamos o código ou o link de rastreamento por e-mail ou WhatsApp. Você também pode falar com a gente pelo atendimento.",
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
