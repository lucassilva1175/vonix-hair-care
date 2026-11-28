export type AffiliateReadiness = {
  checks: Array<{ id: string; label: string; ok: boolean }>;
  databaseResponding: boolean;
  governanceResponding: boolean;
  recruitmentOpen: boolean;
  checkedAt?: number;
};

export const acceptanceGates = [
  {
    title: "Inscrição controlada",
    evidence:
      "Em ambiente autorizado, enviar cadastro fictício, guardar o comprovante e confirmar o registro único.",
  },
  {
    title: "Consulta privada",
    evidence:
      "Verificar consulta e recuperação autorizadas, incluindo acesso negado para identidade incorreta.",
  },
  {
    title: "Acesso e decisão da equipe",
    evidence:
      "Usar conta de teste autorizada, validar permissões, aprovação e recusa de registros fictícios distintos.",
  },
  {
    title: "Notificação e reconciliação",
    evidence:
      "Confirmar registro único, processamento autorizado e recebimento em caixa de teste. Conciliar estado incerto antes de reenviar.",
  },
  {
    title: "Privacidade e publicação",
    evidence:
      "Verificar cabeçalhos no domínio publicado, isolamento do checkout, revisão exata e plano de reversão.",
  },
  {
    title: "Aceite comercial",
    evidence:
      "Confirmar condições comerciais e autorização específica das mídias exibidas, sem substituir prova de afiliadas por avaliações de produtos.",
  },
] as const;

export function validReadinessTime(value: number | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value) && value > 0 && value <= 8.64e15;
}

/** A worksheet, not an attestation. No personal data, tokens or live mutations. */
export function buildAffiliateAcceptanceWorksheet(readiness: AffiliateReadiness): string {
  const checkedAt = readiness.checkedAt;
  return [
    "VONIX HAIR — ROTEIRO DE HOMOLOGAÇÃO CONTROLADA",
    validReadinessTime(checkedAt)
      ? "Diagnóstico consultado (UTC): " + new Date(checkedAt).toISOString()
      : "Horário da consulta não informado.",
    "Configuração de abertura: " + (readiness.recruitmentOpen ? "habilitada" : "bloqueada"),
    "Consulta ao banco: " + (readiness.databaseResponding ? "respondeu" : "não confirmada"),
    "Consulta de governança: " + (readiness.governanceResponding ? "respondeu" : "não confirmada"),
    "Configuração: " +
      readiness.checks.filter((check) => check.ok).length +
      " de " +
      readiness.checks.length +
      " verificações positivas",
    "",
    "Todos os itens abaixo exigem evidência própria. Não constituem testes já aprovados.",
    ...acceptanceGates.flatMap((gate, index) => [
      "",
      index + 1 + ". " + gate.title,
      gate.evidence,
      "Resultado: PENDENTE DE VERIFICAÇÃO",
      "Referência de evidência: __________________",
    ]),
    "",
    "Não incluir nomes, contatos, senhas, códigos privados ou links de ativação neste roteiro.",
    "Não abrir inscrições nem acionar notificações reais apenas para completar a lista.",
  ].join("\n");
}
