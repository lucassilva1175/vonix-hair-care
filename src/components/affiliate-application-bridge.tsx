import { ArrowRight, ClipboardCheck, SearchCheck, TicketCheck } from "lucide-react";
import { trackAffiliateFunnel } from "@/lib/affiliate-funnel";
import type { RecruitmentStatus } from "@/components/affiliate-editorial-hero";

/** A compact pre-application promise of process clarity, not automatic approval. */
const steps = [
  {
    number: "01",
    title: "Apresente seu perfil",
    detail: "Instagram, contato e endereço. TikTok é opcional.",
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
    detail: "Após envio confirmado, guarde seu código privado de consulta.",
    Icon: TicketCheck,
  },
] as const;

export function AffiliateApplicationBridge({ status }: { status: RecruitmentStatus }) {
  const canApply = status === "open";
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
          <a
            href="#inscricao"
            data-testid="affiliate-c125-bridge-cta"
            onClick={() => trackAffiliateFunnel("affiliate_application_interest")}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#703d52] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#583144] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#703d52]"
          >
            {canApply ? "Começar candidatura" : "Conhecer o formulário"}
            <ArrowRight aria-hidden="true" className="size-4" />
          </a>
        </div>
        <ol className="mt-4 grid gap-2 sm:mt-5 sm:grid-cols-3 sm:gap-3">
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
