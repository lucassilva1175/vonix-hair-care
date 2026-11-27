import { useState } from "react";
import { ArrowDownToLine, BarChart3, ChevronDown } from "lucide-react";
import type { AffiliateStatus } from "@/lib/affiliate-application";
import type { AffiliateMailCounters } from "@/lib/affiliate-applications.server";
import {
  affiliateOperationsReport,
  formatAffiliatePercent,
  summarizeAffiliateOperations,
} from "@/lib/affiliate-operational-overview";

export function AffiliateOperationalOverview({
  stats,
  mail,
  fresh,
  checkedAt,
  loading,
  onPending,
  onDecisions,
  onMissing,
  onUncertain,
  onFailed,
}: {
  stats: Record<AffiliateStatus, number>;
  mail: AffiliateMailCounters;
  fresh: boolean;
  checkedAt: number | null;
  loading: boolean;
  onPending: () => void;
  onDecisions: () => void;
  onMissing: () => void;
  onUncertain: () => void;
  onFailed: () => void;
}) {
  const [exportNotice, setExportNotice] = useState<{ at: number; text: string } | null>(null);
  const summary = fresh && checkedAt !== null ? summarizeAffiliateOperations(stats, mail) : null;
  const report =
    summary && checkedAt !== null ? affiliateOperationsReport(summary, checkedAt) : null;
  function exportSummary() {
    if (!report || checkedAt === null || loading || document.visibilityState === "hidden") return;
    let url: string | undefined;
    try {
      url = URL.createObjectURL(new Blob([report], { type: "text/plain;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = "vonix-resumo-operacional-afiliadas.txt";
      document.body.appendChild(link);
      try {
        link.click();
      } finally {
        link.remove();
      }
      setExportNotice({
        at: checkedAt,
        text: "Download solicitado. Confira seus arquivos; compartilhe apenas com a equipe autorizada.",
      });
    } catch {
      setExportNotice({
        at: checkedAt,
        text: "Não foi possível iniciar o download. Consulte os indicadores nesta tela.",
      });
    } finally {
      if (url) {
        const current = url;
        const revoke = URL.revokeObjectURL.bind(URL);
        window.setTimeout(() => revoke(current), 1000);
      }
    }
  }
  return (
    <details
      id="indicadores-afiliadas"
      data-testid="affiliate-operational-overview"
      className="group/overview scroll-mt-6 mt-6 rounded-[1.5rem] border border-[#e8dcd8] bg-white"
    >
      <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-3 rounded-[1.5rem] p-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#784254] sm:p-6 [&::-webkit-details-marker]:hidden">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <BarChart3 className="mt-1 size-5 shrink-0 text-[#8f5361]" aria-hidden="true" />
          <div>
            <h2 className="font-display text-xl">Panorama da operação</h2>
            <p className="mt-1 text-xs leading-relaxed text-[#856f73]">
              Indicadores gerais, prioridades da equipe e relatório interno sem dados individuais.
            </p>
          </div>
        </div>
        <span className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#e8dcd8] px-4 text-xs font-bold text-[#693440]">
          <span className="group-open/overview:hidden">Abrir indicadores</span>
          <span className="hidden group-open/overview:inline">Recolher indicadores</span>
          <ChevronDown className="size-4 group-open/overview:rotate-180" aria-hidden="true" />
        </span>
      </summary>
      <div className="border-t border-[#f0e6e2] p-5 sm:p-6">
        {!summary || !report ? (
          <p role="status" className="text-sm text-[#806a6c]">
            {loading
              ? "Atualizando panorama…"
              : "Panorama indisponível. Atualize a consulta antes de interpretar indicadores."}
          </p>
        ) : (
          <>
            <p className="text-xs text-[#806a6c]">
              Base: {summary.total} inscrições existentes na última consulta. Não representa uma
              janela de tempo, visitas ao site ou conversão comercial.
            </p>
            <dl className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                [
                  "Análise das inscrições",
                  summary.reviewedPercent,
                  summary.decided,
                  summary.total,
                  "analisadas / existentes",
                ],
                [
                  "Aprovação entre analisadas",
                  summary.approvalPercent,
                  summary.approved,
                  summary.decided,
                  "aprovadas / analisadas",
                ],
                [
                  "Cobertura de notificações",
                  summary.notificationPercent,
                  summary.recorded,
                  summary.decided,
                  "com registro / decisões",
                ],
              ].map(([label, ratio, numerator, denominator, description]) => (
                <div
                  key={String(label)}
                  className="min-w-0 rounded-xl border border-[#e8dcd8] bg-[#fcf9f7] p-4"
                >
                  <dt className="text-xs font-semibold text-[#806a6c]">{label}</dt>
                  <dd>
                    <span className="mt-1 block font-display text-2xl tabular-nums text-[#623b45]">
                      {formatAffiliatePercent(ratio as number | null)}
                    </span>
                    <span className="mt-1 block text-xs text-[#806a6c]">
                      {numerator} de {denominator} · {description}
                    </span>
                    {typeof ratio === "number" && (
                      <span
                        aria-hidden="true"
                        className="mt-3 block h-1.5 overflow-hidden rounded-full bg-[#ecdedd]"
                      >
                        <span
                          className="block h-full rounded-full bg-[#8c4d59]"
                          style={{ width: ratio + "%" }}
                        />
                      </span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
            <h3 className="mt-5 text-sm font-bold text-[#623b45]">Prioridades para a equipe</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {[
                { count: summary.pending, label: "Inscrições pendentes", action: onPending },
                { count: summary.uncertain, label: "Notificações incertas", action: onUncertain },
                { count: summary.failed, label: "Notificações com falha", action: onFailed },
                { count: summary.missing, label: "Decisões sem registro", action: onMissing },
              ].map((item) => (
                <button
                  type="button"
                  key={item.label}
                  disabled={loading || !item.count}
                  onClick={item.action}
                  className="min-h-11 rounded-xl border border-[#e1c8cc] bg-white px-3 py-2 text-left text-xs font-bold text-[#693440] disabled:opacity-60"
                >
                  {item.label}: {item.count}
                </button>
              ))}
              <button
                type="button"
                disabled={loading || !summary.decided}
                onClick={onDecisions}
                className="min-h-11 rounded-xl border border-[#e1c8cc] px-3 py-2 text-xs font-bold text-[#693440] disabled:opacity-60"
              >
                Todas as decisões: {summary.decided}
              </button>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-[#806a6c]">
              Priorize a revisão de pendências e concilie envios incertos antes de reenviar.
              Cobertura de registros não comprova entrega de e-mail.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#f0e6e2] pt-4">
              <p className="max-w-lg text-xs leading-relaxed text-[#806a6c]">
                O relatório contém apenas contagens agregadas e o horário da consulta. Não inclui
                nomes, contatos, códigos ou identificadores.
              </p>
              <button
                type="button"
                disabled={loading}
                onClick={exportSummary}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#784254] px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
              >
                <ArrowDownToLine aria-hidden="true" className="size-4" />
                Baixar resumo interno (.txt)
              </button>
            </div>
            {exportNotice?.at === checkedAt && (
              <p role="status" className="mt-2 text-xs text-[#693440]">
                {exportNotice.text}
              </p>
            )}
          </>
        )}
      </div>
    </details>
  );
}
