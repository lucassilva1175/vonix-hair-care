import { useEffect, useRef, useState } from "react";
import { FolderOpen, Save } from "lucide-react";
import {
  EDITORIAL_PROJECT_MAX_BYTES,
  parseEditorialProject,
  serializeEditorialProject,
  type EditorialProject,
  type EditorialProjectImport,
} from "@/lib/affiliate-editorial-project";
import { editorialProfiles } from "@/lib/affiliate-editorial-plan";

export function AffiliateEditorialProjectActions({
  ready,
  project,
  onRestore,
}: {
  ready: boolean;
  project: EditorialProject;
  onRestore: (project: EditorialProject) => void;
}) {
  const [pending, setPending] = useState<EditorialProjectImport | null>(null);
  const [feedback, setFeedback] = useState("");
  const [reading, setReading] = useState(false);
  const [manual, setManual] = useState(false);
  const version = useRef(0);
  useEffect(
    () => () => {
      version.current++;
    },
    [],
  );
  function exportProject() {
    if (!ready) return;
    setFeedback("");
    setManual(false);
    let url: string | undefined;
    let anchor: HTMLAnchorElement | undefined;
    try {
      url = URL.createObjectURL(
        new Blob([serializeEditorialProject(project)], { type: "application/json" }),
      );
      anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "meu-projeto-vonix.json";
      document.body.appendChild(anchor);
      anchor.click();
      setFeedback("Arquivo preparado para download. Guarde-o para retomar seu planejamento.");
    } catch {
      setFeedback("Não foi possível preparar o arquivo. Copie o conteúdo do projeto manualmente.");
      setManual(true);
    } finally {
      anchor?.remove();
      if (url) {
        const saved = url;
        window.setTimeout(() => {
          try {
            URL.revokeObjectURL?.(saved);
          } catch {
            /* Browser restriction. */
          }
        }, 1000);
      }
    }
  }
  async function readProject(file: File | undefined) {
    const current = ++version.current;
    setPending(null);
    setManual(false);
    setFeedback("");
    setReading(false);
    if (!ready || !file) return;
    if (file.size > EDITORIAL_PROJECT_MAX_BYTES || !file.name.toLowerCase().endsWith(".json")) {
      setFeedback("Escolha um arquivo JSON do projeto Vonix de até 4 KB.");
      return;
    }
    setReading(true);
    try {
      const raw = await file.text();
      if (current !== version.current) return;
      const parsed = parseEditorialProject(raw);
      if (!parsed) {
        setFeedback("Arquivo inválido ou incompatível. Seu planejamento atual foi preservado.");
        return;
      }
      setPending(parsed);
    } catch {
      if (current === version.current)
        setFeedback("Não foi possível ler o arquivo. Seu planejamento atual foi preservado.");
    } finally {
      if (current === version.current) setReading(false);
    }
  }
  function discard() {
    version.current++;
    setPending(null);
    setReading(false);
    setFeedback("Restauração cancelada. Seu planejamento atual foi preservado.");
  }
  function confirm() {
    if (!ready || !pending) return;
    onRestore(pending.project);
    version.current++;
    setPending(null);
    setFeedback("Projeto restaurado. Confira suas ideias, marcações e referências na vitrine.");
  }
  return (
    <aside
      aria-label="Guardar e restaurar planejamento"
      className="mt-6 rounded-2xl border border-[#e1c8cc] bg-[#faf4f0] p-4 sm:p-5"
    >
      <div className="flex items-start gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white text-[#784254]">
          <FolderOpen aria-hidden="true" className="size-5" />
        </span>
        <div className="min-w-0">
          <h3 className="font-display text-xl text-[#633847]">Continue quando quiser</h3>
          <p className="mt-1 text-xs leading-relaxed text-[#755d66]">
            Guarde uma cópia editável das suas escolhas e abra o arquivo quando voltar. Só ideias,
            marcações e referências do catálogo são incluídas, sem dados de inscrição ou envio ao
            servidor.
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!ready}
          onClick={exportProject}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#d9bec5] bg-white px-4 text-sm font-bold text-[#633847] disabled:opacity-50 focus-visible:outline-2"
        >
          <Save aria-hidden="true" className="size-4" /> Guardar arquivo do projeto
        </button>
        <label className="flex min-w-0 flex-col gap-1 text-xs font-bold text-[#633847]">
          Abrir arquivo de projeto (.json)
          <input
            type="file"
            accept=".json,application/json"
            disabled={!ready}
            onChange={(event) => {
              const file = event.currentTarget.files?.[0];
              event.currentTarget.value = "";
              void readProject(file);
            }}
            className="max-w-full text-xs file:mr-2 file:min-h-11 file:rounded-lg file:border file:border-[#d9bec5] file:bg-white file:px-3 file:font-semibold file:text-[#633847] focus-visible:outline-2"
          />
        </label>
      </div>
      {reading && (
        <div className="mt-3 flex items-center gap-3">
          <p role="status" className="text-xs">
            Lendo arquivo local…
          </p>
          <button type="button" onClick={discard} className="min-h-11 text-xs font-bold underline">
            Cancelar leitura
          </button>
        </div>
      )}
      {pending && (
        <div
          className="mt-4 rounded-xl border border-[#d9bec5] bg-white p-4"
          role="group"
          aria-label="Confirmar restauração do planejamento"
        >
          <h4 className="text-sm font-bold text-[#633847]">Substituir o planejamento atual?</h4>
          <p className="mt-2 text-xs leading-relaxed text-[#755d66]">
            {editorialProfiles.find((item) => item.id === pending.project.profile)?.label} ·{" "}
            {pending.project.cadence} ideias · {pending.project.done.length} preparadas ·{" "}
            {pending.project.references.length} referências atuais.
          </p>
          {pending.unavailableReferences > 0 && (
            <p className="mt-2 text-xs font-semibold text-[#755d66]">
              {pending.unavailableReferences} referência(s) não estão mais na vitrine atual e não
              serão recuperadas.
            </p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={confirm}
              className="min-h-11 rounded-xl bg-[#784254] px-4 text-sm font-bold text-white focus-visible:outline-2"
            >
              Restaurar projeto
            </button>
            <button
              type="button"
              onClick={discard}
              className="min-h-11 rounded-xl border border-[#d9bec5] px-4 text-sm font-bold text-[#633847]"
            >
              Cancelar restauração
            </button>
          </div>
        </div>
      )}
      {feedback && (
        <p role="status" className="mt-3 text-xs font-semibold leading-relaxed text-[#633847]">
          {feedback}
        </p>
      )}
      {manual && (
        <textarea
          readOnly
          aria-label="Conteúdo JSON do projeto"
          rows={5}
          value={serializeEditorialProject(project)}
          onFocus={(event) => event.currentTarget.select()}
          className="mt-3 w-full rounded-lg border border-[#d9bec5] bg-white p-2 text-xs text-[#633847]"
        />
      )}
    </aside>
  );
}
