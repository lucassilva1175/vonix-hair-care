/** Requisitos de novas candidaturas, sem substituir a validação real (Zod).
 * Consumidores são componentes públicos do Portal de Afiliadas; mudanças no
 * schema devem atualizar este texto e seus testes de coerência primeiro. */
export const affiliateApplicationFacts = {
  primaryRequirements:
    "Nome completo, e-mail válido, telefone com DDD, endereço com CEP e número, Instagram e quantidade de seguidores.",
  optionalRequirement: "TikTok é opcional.",
  privateReceipt:
    "Após o envio confirmado, guarde o código privado de acompanhamento: ele não é enviado por e-mail.",
} as const;
