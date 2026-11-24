import { useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  ClipboardCheck,
  Film,
  SearchCheck,
  TicketCheck,
} from "lucide-react";
import { AffiliateApplyLink } from "@/components/affiliate-apply-link";
import { affiliateApplicationFacts } from "@/lib/affiliate-application-copy";
import type { RecruitmentStatus } from "@/components/affiliate-editorial-hero";

/** A compact pre-application promise of process clarity, not automatic approval. */
const steps = [
  {
    number: "01",
    title: "Apresente seu perfil",
    detail:
      affiliateApplicationFacts.primaryRequirements +
      " " +
      affiliateApplicationFacts.optionalRequirement,
    Icon: ClipboardCheck,
  },
  {
    number: "02",
    title: "Análise individual",
    detail: "A equipe avalia a candidatura. Sem aprovação ou prazo garantido.",
    Icon: SearchCheck,
  },
  {
    number: "03",
    title: "Acompanhe pelo código",
    detail: affiliateApplicationFacts.privateReceipt,
    Icon: TicketCheck,
  },
] as const;

export function AffiliateApplicationBridge({
  status,
  onSafePreview,
}: {
  status: RecruitmentStatus;
  onSafePreview?: () => void;
}) {
  const canApply = status === "open";
  const [stepsExpanded, setStepsExpanded] = useState(false);
  return (
    <section
      aria-labelledby="affiliate-c125-bridge-heading"
      data-testid="affiliate-c125-process-bridge"
      className="border-y border-[#e9d9d6] bg-[#f9f0eb] px-5 py-5 sm:py-8"
    >
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div className="max-w-2xl">
            <p className="text-[10px] font-bold uppercase tracking-[.14em] text-[#835164]">
              Antes de preencher
            </p>
            <h2
              id="affiliate-c125-bridge-heading"
              className="mt-1 font-display text-2xl leading-tight text-[#573443] sm:text-3xl"
            >
              Seu próximo passo, <span className="italic text-[#874f65]">sem complicação.</span>
            </h2>
          </div>
          <AffiliateApplyLink
            recruitmentOpen={canApply}
            onSafePreview={onSafePreview}
            data-testid="affiliate-c125-bridge-cta"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#703d52] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#583144] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#703d52]"
          >
            {canApply ? "Começar candidatura" : "Conhecer o formulário (prévia segura)"}
            <ArrowRight aria-hidden="true" className="size-4" />
          </AffiliateApplyLink>
        </div>
        <div
          data-testid="affiliate-c141-creative-entry"
          className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-[#e5d2d4] bg-white/80 px-3 py-2 sm:px-4"
        >
          <p className="text-xs leading-relaxed text-[#735461]">
            Quer conhecer ideias de conteúdo antes de decidir?
          </p>
          <a
            href="#formatos"
            data-testid="affiliate-c141-creative-link"
            className="inline-flex min-h-11 items-center gap-1.5 text-xs font-bold text-[#724155] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#724155]"
          >
            Explorar 4 ideias de roteiro
            <ArrowRight aria-hidden="true" className="size-4" />
          </a>
          <a
            href="#catalogo-em-video"
            data-testid="affiliate-c152-video-link"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-[#e5d2d4] bg-white px-3 text-xs font-bold text-[#724155] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#724155]"
          >
            <Film aria-hidden="true" className="size-4" />
            Ver vídeos dos produtos
            <ArrowRight aria-hidden="true" className="size-4" />
          </a>
          <p className="basis-full text-[11px] leading-snug text-[#846873]">
            Modelos educativos usando o catálogo Vonix. Não são posts de afiliadas.
          </p>
        </div>
        <p
          data-testid="affiliate-c135-required-fields"
          className="mt-3 text-xs leading-[1.6] text-[#765d67] sm:hidden"
        >
          {affiliateApplicationFacts.primaryRequirements}{" "}
          {affiliateApplicationFacts.optionalRequirement}
        </p>
        <button
          type="button"
          data-testid="affiliate-c135-steps-toggle"
          aria-controls="affiliate-c135-steps-list"
          aria-expanded={stepsExpanded}
          onClick={() => setStepsExpanded((open) => !open)}
          className="mt-3 flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-[#d6bec3] bg-white px-4 py-2 text-left text-xs font-bold text-[#714558] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#714558] sm:hidden"
        >
          <span>{stepsExpanded ? "Ocultar etapas" : "Ver as 3 etapas de seleção"}</span>
          <ChevronDown
            aria-hidden="true"
            className={
              "size-4 shrink-0 transition-transform motion-reduce:transition-none " +
              (stepsExpanded ? "rotate-180" : "")
            }
          />
        </button>
        <ol
          id="affiliate-c135-steps-list"
          data-testid="affiliate-c135-steps-list"
          className={
            "mt-4 gap-2 sm:mt-5 sm:grid sm:grid-cols-3 sm:gap-3 " +
            (stepsExpanded ? "grid" : "hidden")
          }
        >
          {steps.map(({ number, title, detail, Icon }) => (
            <li
              key={number}
              className="flex min-w-0 items-start gap-3 rounded-2xl border border-[#e4d1d1] bg-white/95 px-4 py-3 shadow-[0_5px_16px_rgba(85,46,57,.04)] sm:flex-col sm:gap-2 sm:p-5"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#f2e0e5] text-[#774457]">
                <Icon aria-hidden="true" className="size-5" />
              </span>
              <div className="min-w-0">
                <span className="text-[10px] font-bold tracking-wide text-[#95697a]">
                  {number} · ETAPA
                </span>
                <h3 className="mt-0.5 text-sm font-bold text-[#573443]">{title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-[#765d67]">{detail}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-[11px] leading-relaxed text-[#745762]">
          Inscrição gratuita, para maiores de 18 anos. Nenhuma parceria, produto ou renda é
          garantida. A disponibilidade para envio é confirmada pelo servidor.
        </p>
      </div>
    </section>
  );
}
