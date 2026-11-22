import { ArrowUpRight } from "lucide-react";

/**
 * Official Vonix Hair commercial terms apply only AFTER approval. Never
 * describe a candidacy as guaranteed income or supervisory eligibility.
 */
const terms = [
  {
    value: "8%",
    label: "Comissão",
    detail: "Por venda confirmada.",
  },
  {
    value: "+ R$ 500",
    label: "Bônus por meta",
    detail: "A cada R$ 10 mil vendidos.",
  },
  {
    value: "4%",
    label: "Supervisão possível",
    detail: "Em média na equipe, após metas.",
  },
] as const;

const entryFacts = [
  "Candidatura gratuita",
  "Seleção individual",
  "Maiores de 18 anos",
  "TikTok opcional",
] as const;

export function AffiliateEarlyValueBand() {
  return (
    <section
      data-testid="affiliate-c61-eligibility-facts"
      aria-labelledby="affiliate-c102-value-title"
      className="border-b border-[#8d6170] bg-[#633449] px-4 py-3 text-[#fff8f5] sm:px-5 sm:py-4"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex items-center justify-between gap-2">
          <h2
            id="affiliate-c102-value-title"
            className="min-w-0 font-display text-base leading-tight sm:text-xl"
          >
            Para afiliadas aprovadas
          </h2>
          <a
            href="#ganhos"
            className="inline-flex min-h-10 shrink-0 items-center gap-1 text-[11px] font-bold text-white underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white sm:text-xs"
          >
            Ver regras
            <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
          </a>
        </div>

        <ul
          data-testid="affiliate-c102-commercial-terms"
          aria-label="Condições comerciais para afiliadas aprovadas"
          className="mt-2 grid grid-cols-3 gap-1.5 sm:gap-3"
        >
          {terms.map((term) => (
            <li
              key={term.label}
              className="min-w-0 rounded-lg border border-[#a9798c] bg-[#76465b] px-2 py-2.5 sm:px-4 sm:py-3"
            >
              <strong className="block font-display text-[clamp(1.05rem,3.6vw,1.65rem)] leading-none text-[#fff4ed]">
                {term.value}
              </strong>
              <span className="mt-1 block text-[11px] font-bold leading-tight sm:text-sm">
                {term.label}
              </span>
              <span className="mt-1 block text-[11px] leading-snug text-[#fbe7eb] sm:text-xs">
                {term.detail}
              </span>
            </li>
          ))}
        </ul>

        <ul
          aria-label="Requisitos e informações da candidatura"
          className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-semibold leading-snug sm:text-xs"
        >
          {entryFacts.map((fact) => (
            <li key={fact} className="min-w-0">
              {fact}
            </li>
          ))}
        </ul>
        <p className="mt-1.5 max-w-6xl text-[11px] leading-snug text-[#f6dce3] sm:text-xs">
          Sem comprar produto para se candidatar. Bônus e supervisão exigem metas e avaliação;
          nenhuma remuneração é garantida pela inscrição.
        </p>
      </div>
    </section>
  );
}
