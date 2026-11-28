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

export const CEP_INVALIDO_MSG = "Informe um CEP válido com 8 dígitos para continuar.";

/** Valida formato e faixa nacional. A cotação confirma a disponibilidade da entrega. */
export function cepAtendido(cep: string): boolean {
  return /^\d{5}-?\d{3}$/.test(cep) && Number(cep.slice(0, 5)) >= 1000;
}
