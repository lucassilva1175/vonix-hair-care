import type { AffiliateStatus } from "@/lib/affiliate-application";
import type { AffiliateMailCounters } from "@/lib/affiliate-applications.server";
import { summarizeNotificationCoverage } from "@/lib/affiliate-notification-coverage";

export function summarizeAffiliateOperations(
  stats: Record<AffiliateStatus, number>,
  mail: AffiliateMailCounters,
) {
  if (
    [stats.pendente, stats.aprovada, stats.recusada].some(
      (value) => !Number.isSafeInteger(value) || value < 0,
    )
  )
    return null;
  const coverage = summarizeNotificationCoverage(stats, mail);
  if (!coverage || !Number.isSafeInteger(stats.pendente + coverage.decided)) return null;
  const total = stats.pendente + coverage.decided;
  const percent = (numerator: number, denominator: number) =>
    denominator > 0 ? (numerator / denominator) * 100 : null;
  return {
    total,
    pending: stats.pendente,
    approved: stats.aprovada,
    rejected: stats.recusada,
    decided: coverage.decided,
    recorded: coverage.recorded,
    missing: coverage.missing,
    attention: coverage.attention,
    queued: mail.pendente,
    processing: mail.processando,
    accepted: mail.enviado,
    failed: mail.falhou,
    uncertain: mail.incerto,
    reviewedPercent: percent(coverage.decided, total),
    approvalPercent: percent(stats.aprovada, coverage.decided),
    notificationPercent: percent(coverage.recorded, coverage.decided),
  };
}

export type AffiliateOperationsSummary = NonNullable<
  ReturnType<typeof summarizeAffiliateOperations>
>;
export function formatAffiliatePercent(value: number | null) {
  return value === null
    ? "Não aplicável"
    : new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 1 }).format(value) + "%";
}

/** The export accepts only validated aggregate counters, never applicant records. */
export function affiliateOperationsReport(summary: AffiliateOperationsSummary, checkedAt: number) {
  if (!Number.isFinite(checkedAt) || checkedAt <= 0 || checkedAt > 8.64e15) return null;
  return [
    "VONIX HAIR — RESUMO OPERACIONAL DE AFILIADAS",
    "Consulta concluída (UTC): " + new Date(checkedAt).toISOString(),
    "Totais gerais de registros existentes, sem filtro, não representam um período de captação.",
    "",
    "CANDIDATURAS",
    "Inscrições existentes: " + summary.total,
    "Pendentes: " + summary.pending,
    "Analisadas: " + summary.decided,
    "Aprovadas: " + summary.approved,
    "Não selecionadas: " + summary.rejected,
    "Analisadas / existentes: " + formatAffiliatePercent(summary.reviewedPercent),
    "Aprovadas / analisadas: " + formatAffiliatePercent(summary.approvalPercent),
    "",
    "NOTIFICAÇÕES",
    "Decisões com registro na fila: " + summary.recorded,
    "Decisões sem registro na fila: " + summary.missing,
    "Cobertura de registros / decisões: " + formatAffiliatePercent(summary.notificationPercent),
    "Aguardando processamento: " + summary.queued,
    "Em processamento: " + summary.processing,
    "Aceitas pelo provedor: " + summary.accepted,
    "Falhas: " + summary.failed,
    "Incertas: " + summary.uncertain,
    "",
    "LIMITES",
    "Aceitação pelo provedor não comprova entrega. Ausência de registro pode incluir candidaturas antigas ou sem e-mail.",
    "O portal não mede visitantes ou conversão de visitas; os totais refletem apenas os registros ainda existentes.",
    "Uso interno autorizado. Nenhuma informação individual de candidata consta neste arquivo.",
    "",
  ].join("\n");
}
