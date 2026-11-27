import type { AffiliateMailStatus, AffiliateStatus } from "@/lib/affiliate-application";
import type { AffiliateMailCounters } from "@/lib/affiliate-applications.server";

import { summarizeNotificationCoverage } from "@/lib/affiliate-notification-coverage";

export function AffiliateNotificationOperations({
  decisions,
  mail,
  fresh,
  loading,
  onRefresh,
  onReviewAll,
  onReviewMissing,
  missingSelected,
  checkedAt,
}: {
  decisions: Pick<Record<AffiliateStatus, number>, "aprovada" | "recusada">;
  mail: AffiliateMailCounters;
  fresh: boolean;
  loading: boolean;
  onRefresh: () => void;
  onReviewAll: () => void;
  onReviewMissing: () => void;
  missingSelected: boolean;
  checkedAt?: number | null;
}) {
  const summary = fresh ? summarizeNotificationCoverage(decisions, mail) : null;
  return (
    <div
      data-testid="affiliate-c174-notification-operations"
      className="mt-5 rounded-2xl border border-[#e8dcd8] bg-[#fcf9f7] p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-[#623b45]">Cobertura das decisões</h3>
          <p className="mt-1 text-xs leading-relaxed text-[#806a6c]">
            Totais gerais da última consulta concluída, independentemente da página ou filtro.
            Registro na fila não comprova entrega.
          </p>
          {fresh && checkedAt != null && (
            <p className="mt-1 text-xs font-semibold text-[#72515f]">
              Consulta concluída às{" "}
              {new Date(checkedAt).toLocaleTimeString("pt-BR", {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              (horário deste dispositivo).
            </p>
          )}
        </div>
        <button
          type="button"
          disabled={loading}
          onClick={onRefresh}
          className="min-h-11 rounded-full border border-[#cfaeb4] bg-white px-4 text-xs font-bold text-[#693440] disabled:opacity-50 focus-visible:outline-2"
        >
          Atualizar notificações
        </button>
      </div>
      {!fresh ? (
        <p role="status" className="mt-3 text-sm text-[#806a6c]">
          {loading
            ? "Atualizando cobertura..."
            : "Cobertura indisponível. Atualize as notificações para consultar os totais."}
        </p>
      ) : !summary ? (
        <p role="status" className="mt-3 text-sm text-[#806a6c]">
          Os totais não permitem conciliar a cobertura. Atualize antes de tomar uma decisão.
        </p>
      ) : (
        <>
          <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Analisadas", summary.decided],
              ["Com registro na fila", summary.recorded],
              ["Sem registro na fila", summary.missing],
              ["Falhas ou incertos", summary.attention],
            ].map(([label, value]) => (
              <div key={label} className="min-w-0 rounded-xl border border-[#e8dcd8] bg-white p-3">
                <dt className="text-xs text-[#806a6c]">{label}</dt>
                <dd className="mt-1 font-display text-2xl tabular-nums text-[#623b45]">{value}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-xs leading-relaxed text-[#806a6c]">
            Sem registro pode incluir candidaturas antigas ou sem e-mail. Não significa falha de
            envio. Confira a decisão e o contato antes de qualquer comunicação.
          </p>
          <div className="mt-2 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={loading}
              aria-pressed={missingSelected}
              onClick={onReviewMissing}
              className={
                "min-h-11 rounded-full border px-4 text-sm font-bold focus-visible:outline-2 disabled:opacity-50 " +
                (missingSelected
                  ? "border-[#784254] bg-[#784254] text-white"
                  : "border-[#cfaeb4] bg-white text-[#693440]")
              }
            >
              Ver somente decisões sem registro
            </button>
            <button
              type="button"
              disabled={loading}
              onClick={onReviewAll}
              className="mt-2 min-h-11 text-sm font-bold text-[#693440] underline underline-offset-4 focus-visible:outline-2"
            >
              Ver todas as decisões analisadas
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function AffiliateDecisionMailGuidance({
  status,
  hasEmail,
}: {
  status?: AffiliateMailStatus | undefined;
  hasEmail: boolean;
}) {
  const guidance: Record<AffiliateMailStatus, string> = {
    pendente: "A mensagem está na fila. Confira o processamento antes de abrir outro contato.",
    processando: "Há uma tentativa em andamento. Não reenvie enquanto o estado não for conciliado.",
    enviado:
      "A aceitação pelo provedor não confirma recebimento. Confira a entrega no provedor se necessário.",
    falhou:
      "Verifique a configuração e a falha no provedor. Não use o convite de acesso como substituto da notificação da decisão.",
    incerto:
      "Concilie a tentativa no provedor antes de qualquer reenvio para evitar mensagens duplicadas.",
  };
  return (
    <p
      data-testid="affiliate-c174-mail-guidance"
      className="mt-2 text-xs leading-relaxed text-[#806a6c]"
    >
      {status
        ? guidance[status]
        : hasEmail
          ? "Decisão sem notificação registrada. Confira o histórico e o endereço antes de contatar a candidata. Reenviar acesso é um fluxo diferente."
          : "Sem e-mail cadastrado. Se for necessário comunicar a decisão, consulte o contato protegido e confirme a identidade da candidata antes de usar WhatsApp."}
    </p>
  );
}
