export const FREE_SHIPPING_STATES_LABEL = "SP e MG";

/** Frete grátis por CEP em São Paulo e Minas Gerais. */
export function isFreeShippingCep(cep: string): boolean {
  if (!cepAtendido(cep)) return false;
  const n = Number(cep.slice(0, 5));
  return (n >= 1000 && n <= 19999) || (n >= 30000 && n <= 39999);
}

export const CEP_INVALIDO_MSG = "Informe um CEP válido com 8 dígitos para continuar.";

/** Valida formato e faixa nacional. A cotação confirma a disponibilidade da entrega. */
export function cepAtendido(cep: string): boolean {
  return /^\d{5}-?\d{3}$/.test(cep) && Number(cep.slice(0, 5)) >= 1000;
}
