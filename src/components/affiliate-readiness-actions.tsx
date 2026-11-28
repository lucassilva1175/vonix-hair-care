import { useState } from "react";
import { ClipboardList, Download } from "lucide-react";

import {
  acceptanceGates,
  buildAffiliateAcceptanceWorksheet,
  validReadinessTime,
  type AffiliateReadiness,
} from "@/lib/affiliate-readiness-worksheet";

const nextAction: Record<string, string> = {
  database: "Confirme o projeto dedicado e seu isolamento do checkout com o responsável técnico.",
  migration: "Valide a migração de governança em ambiente controlado antes de atestá-la.",
  privacy: "Obtenha a aprovação da política de privacidade pelo responsável pela operação.",
  provider: "Confirme HTTPS, proxy e cabeçalhos privados no domínio oficial.",
  admin: "Revise a configuração de sessão administrativa com o proprietário.",
  totp: "Revise o acesso legado por autenticador somente se ele ainda for utilizado.",
  proxy: "Valide a origem confiável e a limitação de tráfego sem expor chaves.",
  encryption: "Confirme a configuração de criptografia no ambiente protegido.",
  resend: "Homologue remetente, worker e caixa de teste antes de processar notificações reais.",
  launch: "Confira as permissões de abertura; não libere apenas para eliminar este aviso.",
};
export function AffiliateReadinessActions({ readiness }: { readiness: AffiliateReadiness }) {
  const [downloadFailed, setDownloadFailed] = useState(false);
  const worksheet = buildAffiliateAcceptanceWorksheet(readiness);
  function downloadWorksheet() {
    if (document.visibilityState === "hidden") return;
    setDownloadFailed(false);
    let url: string | undefined;
    let anchor: HTMLAnchorElement | undefined;
    try {
      url = URL.createObjectURL(new Blob([worksheet], { type: "text/plain;charset=utf-8" }));
      anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "vonix-roteiro-homologacao.txt";
      document.body.appendChild(anchor);
      anchor.click();
    } catch {
      setDownloadFailed(true);
    } finally {
      anchor?.remove();
      if (url) {
        const current = url;
        window.setTimeout(() => {
          try {
            URL.revokeObjectURL?.(current);
          } catch {
            // A restricted browser may refuse cleanup; never throw from a timer.
          }
        }, 1000);
      }
    }
  }
  const unresolved = readiness.checks.filter((check) => !check.ok);
  const priority = unresolved.filter(
    (check) => !["resend", "totp", "admin", "launch"].includes(check.id),
  );
  const configured = readiness.checks.length - unresolved.length;
  return (
    <div
      data-testid="affiliate-readiness-actions"
      className="mt-4 rounded-xl border border-[#e1c8cc] bg-[#fffaf7] p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-[#623b45]">Próximas ações de homologação</h3>
        <span className="text-xs font-semibold tabular-nums text-[#806a6c]">
          {configured} de {readiness.checks.length} verificações de configuração positivas
        </span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-[#806a6c]">
        A abertura configurada e a saúde das consultas são verificações diferentes. Nenhum indicador
        confirma entrega de e-mail ou aceite operacional completo.
      </p>
      <ul className="mt-3 space-y-2 text-xs leading-relaxed text-[#65434d]">
        {!readiness.databaseResponding && (
          <li className="rounded-lg bg-white p-3">
            <strong>Consulta ao banco não confirmada.</strong> Verifique a conexão e a resposta da
            RPC de totais antes de usar o painel.
          </li>
        )}
        {!readiness.governanceResponding && (
          <li className="rounded-lg bg-white p-3">
            <strong>Governança não confirmada.</strong> Verifique a RPC de retenção e a migração
            antes de executar ações sobre dados.
          </li>
        )}
        {[...priority, ...unresolved.filter((check) => !priority.includes(check))].map((check) => (
          <li key={check.id} className="rounded-lg bg-white p-3">
            <strong className="block">Pendência: {check.label}</strong>
            <span>
              {nextAction[check.id] ?? "Revise esta verificação com o responsável autorizado."}
            </span>
          </li>
        ))}
        {!unresolved.length && readiness.databaseResponding && readiness.governanceResponding && (
          <li className="rounded-lg bg-white p-3">
            <strong>Configuração e consultas responderam.</strong> Execute o aceite controlado de
            candidatura, decisão, entrega de e-mail e conta da equipe antes de declarar a operação
            homologada.
          </li>
        )}
      </ul>
      <details className="mt-4 rounded-xl border border-[#e1c8cc] bg-white p-4">
        <summary className="flex min-h-11 cursor-pointer items-center gap-2 text-sm font-bold text-[#623b45] focus-visible:outline-2">
          <ClipboardList aria-hidden="true" className="size-4 shrink-0" />
          Roteiro de aceite real
        </summary>
        <p className="mt-2 text-xs leading-relaxed text-[#806a6c]">
          Os itens abaixo ainda exigem evidência de uma execução autorizada. Este roteiro não altera
          o estado do programa, não envia mensagens e não certifica a operação.
        </p>
        {validReadinessTime(readiness.checkedAt) && (
          <p className="mt-2 text-xs text-[#806a6c]">
            Diagnóstico desta consulta: {new Date(readiness.checkedAt).toLocaleString("pt-BR")}
          </p>
        )}
        <ol className="mt-4 grid gap-2 sm:grid-cols-2">
          {acceptanceGates.map((gate, index) => (
            <li key={gate.title} className="min-w-0 rounded-lg border border-[#eee3e0] p-3">
              <p className="text-xs font-bold text-[#623b45]">
                {index + 1}. {gate.title}
              </p>
              <p className="mt-1 text-xs leading-relaxed text-[#806a6c]">{gate.evidence}</p>
            </li>
          ))}
        </ol>
        <button
          type="button"
          onClick={downloadWorksheet}
          className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#d6b6be] px-4 py-2 text-xs font-bold text-[#733e4a] focus-visible:outline-2"
        >
          <Download aria-hidden="true" className="size-4" /> Baixar roteiro de homologação
        </button>
        {downloadFailed && (
          <label className="mt-3 block text-xs font-semibold text-[#623b45]">
            Não foi possível baixar. Copie o roteiro:
            <textarea
              readOnly
              rows={8}
              value={worksheet}
              onFocus={(event) => event.currentTarget.select()}
              className="mt-2 block w-full rounded-lg border border-[#d6b6be] p-3"
            />
          </label>
        )}
      </details>
    </div>
  );
}
