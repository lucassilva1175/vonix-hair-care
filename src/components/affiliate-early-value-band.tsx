import { ArrowUpRight, Check, Sparkles } from "lucide-react";

/**
 * Terms authorized by the Vonix storefront, only applicable AFTER approval.
 * This is editorial information, not a simulator, contract, promise or signup.
 */
const terms = [
  {
    value: "8%",
    label: "Comissão",
    detail: "Por venda confirmada.",
    condition: "Para afiliadas aprovadas",
  },
  {
    value: "+ R$ 500",
    label: "Bônus por meta",
    detail: "A cada R$ 10 mil vendidos.",
    condition: "Após metas e elegibilidade",
  },
  {
    value: "4%",
    label: "Supervisão possível",
    detail: "Em média na equipe, após metas.",
    condition: "Sujeita à avaliação da equipe",
  },
] as const;

const entryFacts = [
  "Candidatura gratuita",
  "Seleção individual",
  "Maiores de 18 anos",
  "TikTok opcional",
] as const;

/**
 * The main commission must remain legible on 320–390 px screens. Bonuses are
 * secondary/conditional, not an equal-to-income promise. On desktop all three
 * factual cards are equal-width without a hidden carousel or extra clicks.
 */
export function AffiliateEarlyValueBand() {
  return (
    <section
      data-testid="affiliate-c61-eligibility-facts"
      aria-labelledby="affiliate-c102-value-title"
      className="relative isolate overflow-hidden border-b border-[#9b6b7d] bg-gradient-to-br from-[#633449] via-[#713d53] to-[#4f2c40] px-4 py-5 text-[#fff8f5] sm:px-5 sm:py-6"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-20 -top-28 size-64 rounded-full border-[45px] border-white/[.035] sm:right-6"
      />
      <div className="relative mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-2">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.12em] text-[#ffe0eb]">
              <Sparkles aria-hidden="true" className="size-3.5" />
              Conheça as condições do programa
            </p>
            <h2
              id="affiliate-c102-value-title"
              className="mt-1 min-w-0 font-display text-xl leading-tight tracking-tight sm:text-2xl"
            >
              Para afiliadas aprovadas
            </h2>
          </div>
          <a
            href="#ganhos"
            className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-full border border-white/50 px-3 text-xs font-bold text-white underline-offset-4 transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            Ver regras
            <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
          </a>
        </div>

        <ul
          data-testid="affiliate-c102-commercial-terms"
          aria-label="Condições comerciais para afiliadas aprovadas"
          className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3"
        >
          {terms.map((term, index) => {
            const featured = index === 0;
            return (
              <li
                key={term.label}
                data-testid="affiliate-c114-term-card"
                data-priority={featured ? "primary" : "conditional"}
                className={
                  "relative flex min-w-0 flex-col justify-between overflow-hidden rounded-2xl border p-3.5 shadow-[0_7px_21px_rgba(28,15,22,.09)] sm:p-5 " +
                  (featured
                    ? "col-span-2 border-[#f2e1d9] bg-gradient-to-br from-[#fff7ef] to-[#f3dce2] text-[#573347] sm:col-span-1"
                    : "col-span-1 border-[#b88a9a] bg-white/[.10] text-white backdrop-blur-sm")
                }
              >
                <div className="min-w-0">
                  <span
                    className={
                      "inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[.08em] " +
                      (featured ? "text-[#875065]" : "text-[#f8d8e4]")
                    }
                  >
                    {featured && <Check aria-hidden="true" className="size-3.5" />}
                    {term.condition}
                  </span>
                  <strong
                    className={
                      "mt-2 block font-display leading-none tabular-nums " +
                      (featured
                        ? "text-[clamp(2.5rem,10vw,3.25rem)] text-[#6a3850] sm:text-[2rem]"
                        : "text-[clamp(1.35rem,5vw,2rem)] text-[#fff7f0] sm:text-[2rem]")
                    }
                  >
                    {term.value}
                  </strong>
                  <span className="mt-2 block text-sm font-bold leading-tight sm:text-base">
                    {term.label}
                  </span>
                  <span
                    className={
                      "mt-1.5 block text-xs leading-relaxed sm:text-sm " +
                      (featured ? "text-[#765366]" : "text-[#f9e4eb]")
                    }
                  >
                    {term.detail}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>

        <ul
          aria-label="Requisitos e informações da candidatura"
          className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[11px] font-semibold leading-snug sm:text-xs"
        >
          {entryFacts.map((fact) => (
            <li key={fact} className="inline-flex min-w-0 items-center gap-1.5">
              <Check aria-hidden="true" className="size-3.5 shrink-0 text-[#fbe0e7]" />
              {fact}
            </li>
          ))}
        </ul>
        <p className="mt-2 max-w-5xl text-[11px] leading-[1.6] text-[#f6dce3] sm:text-xs">
          Sem comprar produto para se candidatar. Bônus e supervisão exigem metas e avaliação;
          nenhuma remuneração é garantida pela inscrição.
        </p>
      </div>
    </section>
  );
}
