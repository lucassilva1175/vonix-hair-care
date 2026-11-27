import { useRef, useState } from "react";
import { CalendarDays, ClipboardCopy, Check, ArrowUpRight } from "lucide-react";
import {
  buildEditorialPlan,
  editorialProfiles,
  type EditorialProfile,
  type EditorialCadence,
  type EditorialFormat,
} from "@/lib/affiliate-editorial-plan";
import { AffiliateApplyLink } from "@/components/affiliate-apply-link";

export function AffiliateEditorialPlanner({
  recruitmentOpen = false,
  onSafePreview,
}: {
  recruitmentOpen?: boolean;
  onSafePreview?: (() => void) | undefined;
}) {
  const [profile, setProfile] = useState<EditorialProfile>("rotina");
  const [cadence, setCadence] = useState<EditorialCadence>(3);
  const [format, setFormat] = useState<EditorialFormat>("misto");
  const [done, setDone] = useState<string[]>([]);
  const [copy, setCopy] = useState<"idle" | "copying" | "copied" | "failed">("idle");
  const copyVersion = useRef(0);
  const copying = useRef(false);
  const plan = buildEditorialPlan(profile, cadence, format);
  function change(update: () => void) {
    update();
    setDone([]);
    copyVersion.current++;
    if (!copying.current) setCopy("idle");
  }
  async function copyPlan() {
    if (copying.current) return;
    const version = ++copyVersion.current;
    copying.current = true;
    setCopy("copying");
    try {
      await navigator.clipboard.writeText(plan.text);
      if (version === copyVersion.current) setCopy("copied");
    } catch {
      if (version === copyVersion.current) setCopy("failed");
    } finally {
      copying.current = false;
      if (version !== copyVersion.current) setCopy("idle");
    }
  }
  const control =
    "min-h-[44px] w-full rounded-xl border border-[#d9bec5] bg-white px-3 py-2 text-sm font-semibold text-[#633847] focus-visible:outline-2";
  return (
    <section
      id="planejamento-criativo"
      aria-labelledby="editorial-planner-title"
      data-testid="affiliate-editorial-planner"
      className="scroll-mt-28 bg-[#fbf5f1] px-5 py-10 sm:py-16"
    >
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[1.8rem] border border-[#e0c9cc] bg-white shadow-[0_12px_36px_rgba(82,43,57,.08)]">
        <div className="grid gap-5 bg-[#693c50] px-5 py-7 text-white sm:px-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-white/90">
              <CalendarDays aria-hidden="true" className="size-4" /> Estúdio de inspiração
            </p>
            <h2
              id="editorial-planner-title"
              className="mt-3 font-display text-3xl leading-tight sm:text-4xl"
            >
              Sua semana criativa, do seu jeito.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-white/90">
              Monte uma sequência de ideias de conteúdo com o ritmo que cabe na sua rotina. Não
              precisa comprar produtos nem ser afiliada aprovada para explorar.
            </p>
          </div>
          <span className="self-start rounded-full border border-white/40 px-4 py-2 text-xs font-semibold">
            Ferramenta opcional · gratuita
          </span>
        </div>
        <div className="p-5 sm:p-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="text-xs font-bold text-[#633847]">
              Meu estilo
              <select
                className={"mt-2 " + control}
                value={profile}
                onChange={(e) => change(() => setProfile(e.target.value as EditorialProfile))}
              >
                {editorialProfiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-bold text-[#633847]">
              Ideias por semana
              <select
                className={"mt-2 " + control}
                value={cadence}
                onChange={(e) =>
                  change(() => setCadence(Number(e.target.value) as EditorialCadence))
                }
              >
                {[2, 3, 5].map((n) => (
                  <option key={n} value={n}>
                    {n} ideias
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs font-bold text-[#633847]">
              Formato preferido
              <select
                className={"mt-2 " + control}
                value={format}
                onChange={(e) => change(() => setFormat(e.target.value as EditorialFormat))}
              >
                <option value="misto">Alternar formatos</option>
                <option value="video">Vídeos curtos</option>
                <option value="foto">Fotos e carrosséis</option>
              </select>
            </label>
          </div>
          <p className="mt-5 text-xs text-[#765c67]">
            As escolhas e marcações ficam nesta página. Não são enviadas nem salvas após recarregar.
            Alterar o plano reinicia a lista de preparação.
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-display text-xl text-[#633847]">Minha sequência de ideias</h3>
            <span aria-live="polite" className="text-xs font-bold text-[#765c67]">
              {done.length} de {plan.entries.length} ideias preparadas
            </span>
          </div>
          <progress
            value={done.length}
            max={plan.entries.length}
            aria-label="Ideias preparadas"
            className="mt-3 block h-2 w-full accent-[#784254]"
          />
          <ol className="mt-5 grid gap-3 lg:grid-cols-2">
            {plan.entries.map((item) => (
              <li
                key={item.day}
                className="min-w-0 rounded-xl border border-[#ead8d6] bg-[#fffaf7] p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#8a5367]">
                    {item.day}
                  </span>
                  <span className="rounded-full bg-[#f0e2e4] px-3 py-1 text-xs font-semibold text-[#6c3b50]">
                    {item.format}
                  </span>
                </div>
                <h4 className="mt-3 font-display text-xl text-[#573443]">{item.title}</h4>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-[#633847]">
                  “{item.opening}”
                </p>
                <p className="mt-2 text-sm leading-relaxed text-[#755d66]">{item.task}</p>
                <p className="mt-3 rounded-lg bg-white p-3 text-xs leading-relaxed text-[#755d66]">
                  <strong>Antes de publicar:</strong> {item.verify}
                </p>
                <label className="mt-3 flex min-h-[44px] cursor-pointer items-center gap-3 text-sm font-semibold text-[#633847]">
                  <input
                    type="checkbox"
                    checked={done.includes(item.day)}
                    onChange={(e) =>
                      setDone((prev) =>
                        e.target.checked ? [...prev, item.day] : prev.filter((x) => x !== item.day),
                      )
                    }
                    className="size-5 shrink-0 accent-[#784254]"
                  />{" "}
                  Preparei esta ideia
                </label>
              </li>
            ))}
          </ol>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={copy === "copying"}
              onClick={() => void copyPlan()}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#784254] px-5 text-sm font-bold text-white disabled:opacity-50"
            >
              <ClipboardCopy aria-hidden="true" className="size-4" />
              {copy === "copying" ? "Copiando plano..." : "Copiar meu plano editorial"}
            </button>
            <a
              href="#vitrine-afiliadas"
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#d9bec5] px-5 text-sm font-bold text-[#633847]"
            >
              Consultar produtos oficiais <ArrowUpRight aria-hidden="true" className="size-4" />
            </a>
            <button
              type="button"
              disabled={!done.length}
              onClick={() => setDone([])}
              className="min-h-[44px] px-3 text-sm font-semibold text-[#633847] underline disabled:opacity-50"
            >
              Limpar marcações
            </button>
          </div>
          {copy === "copied" && (
            <p
              role="status"
              className="mt-3 flex items-center gap-2 text-sm font-semibold text-[#4b6a46]"
            >
              <Check aria-hidden="true" className="size-4" /> Plano copiado. Adapte ao seu estilo.
            </p>
          )}
          {copy === "failed" && (
            <div className="mt-3">
              <p role="status" className="text-xs font-semibold text-[#633847]">
                Selecione o plano abaixo para copiar manualmente.
              </p>
              <textarea
                readOnly
                rows={9}
                value={plan.text}
                aria-label="Plano editorial para copiar manualmente"
                onFocus={(e) => e.currentTarget.select()}
                className="mt-2 w-full rounded-xl border border-[#d9bec5] bg-white p-3 text-sm text-[#633847]"
              />
            </div>
          )}
          <div className="mt-7 border-t border-[#ead8d6] pt-5">
            <p className="text-xs leading-relaxed text-[#755d66]">
              Isto é inspiração editorial, não campanha contratada, condição de seleção ou promessa
              de ganhos. Use apenas materiais autorizados e experiências verdadeiras. Identifique
              publicidade quando houver parceria.
            </p>
            <AffiliateApplyLink
              recruitmentOpen={recruitmentOpen}
              onSafePreview={onSafePreview}
              className="mt-3 inline-flex min-h-[44px] items-center gap-2 text-sm font-bold text-[#633847] underline underline-offset-4"
            >
              {recruitmentOpen ? "Apresentar meu perfil à Vonix" : "Conhecer a prévia sem envio"}{" "}
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </AffiliateApplyLink>
          </div>
        </div>
      </div>
    </section>
  );
}
