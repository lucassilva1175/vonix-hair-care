import type { AffiliateStatus } from "@/lib/affiliate-application";
import type { AffiliateMailCounters } from "@/lib/affiliate-applications.server";

/** Counts come from the same private stats RPC. The outbox has at most one
 * notification per application. An absent row is not evidence of failed mail. */
export function summarizeNotificationCoverage(
  decisions: Pick<Record<AffiliateStatus, number>, "aprovada" | "recusada">,
  mail: AffiliateMailCounters,
) {
  const counts = [
    decisions.aprovada,
    decisions.recusada,
    mail.pendente,
    mail.processando,
    mail.enviado,
    mail.falhou,
    mail.incerto,
  ];
  if (counts.some((value) => !Number.isSafeInteger(value) || value < 0)) return null;
  const decided = decisions.aprovada + decisions.recusada;
  const recorded = mail.pendente + mail.processando + mail.enviado + mail.falhou + mail.incerto;
  if (!Number.isSafeInteger(decided) || !Number.isSafeInteger(recorded) || recorded > decided)
    return null;
  return { decided, recorded, missing: decided - recorded, attention: mail.falhou + mail.incerto };
}
