/**
 * Legado (frete grátis só em SP e MG). A regra geral hoje é FREE_SHIPPING_ABOVE em store.ts.
 * O estado vem da faixa do CEP: SP 01000-000 a 19999-999 e MG 30000-000 a 39999-999.
 * Mantido por compatibilidade: a regra geral agora está em FREE_SHIPPING_ABOVE = 0 (store.ts).
 */
export const FREE_SHIPPING_STATES_LABEL = "SP e MG";

export function isFreeShippingCep(cep: string): boolean {
  const d = cep.replace(/\D/g, "");
  if (d.length !== 8) return false;
  const n = Number(d.slice(0, 5));
  return (n >= 1000 && n <= 19999) || (n >= 30000 && n <= 39999);
}

/** Entrega só em São Paulo e Minas Gerais (decisão do Lucas, 24/11/2026): CEP fora dessas faixas não finaliza compra. */
export const ENTREGA_SOMENTE_MSG = "No momento entregamos somente em São Paulo e Minas Gerais. Use um CEP desses estados para continuar.";
export const cepAtendido = isFreeShippingCep;
