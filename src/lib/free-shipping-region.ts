/**
 * Frete grátis em qualquer valor de pedido para São Paulo e Minas Gerais (decisão do Lucas, 18/11/2026).
 * O estado vem da faixa do CEP: SP 01000-000 a 19999-999 e MG 30000-000 a 39999-999.
 * Fora dessas faixas vale a regra de sempre (grátis acima de FREE_SHIPPING_ABOVE em produtos).
 */
export const FREE_SHIPPING_STATES_LABEL = "SP e MG";

export function isFreeShippingCep(cep: string): boolean {
  const d = cep.replace(/\D/g, "");
  if (d.length !== 8) return false;
  const n = Number(d.slice(0, 5));
  return (n >= 1000 && n <= 19999) || (n >= 30000 && n <= 39999);
}
