import { useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { affiliateCreatorPaths } from "@/data/affiliate-creator-paths";

/** Editorial exploration only: not an eligibility test or a signup form. */
export function AffiliateCreatorSpotlight() {
  const [selected, setSelected] = useState<number | null>(null);
  const current = selected === null ? null : affiliateCreatorPaths[selected];

  return (
    <section
      data-testid="affiliate-c100-creator-spotlight"
      aria-labelledby="affiliate-c100-title"
      className="border-b border-[#e7d7d2] bg-[#fffaf7] px-5 py-6 text-[#533544] sm:py-9"
    >
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[.10em] text-[#89566b]">
              Seu estilo, sua história
            </p>
            <h2
              id="affiliate-c100-title"
              className="mt-2 font-display text-3xl leading-tight sm:text-4xl"
            >
              Três caminhos. <span className="italic text-[#884d63]">Um começo possível.</span>
            </h2>
            <p className="mt-3 text-sm leading-[1.7] text-[#705965]">
              Escolha um caminho para ver ideias de conteúdo. Nenhum estilo garante aprovação,
              parceria ou remuneração.
            </p>
          </div>
          <a
            href="#inscricao"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-bold text-[#784256] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Ir direto à inscrição <ArrowUpRight aria-hidden="true" className="size-4" />
          </a>
        </div>
        <div
          role="group"
          aria-label="Escolha seu estilo de conteúdo"
          className="mt-4 grid grid-cols-3 gap-2 sm:gap-3"
        >
          {affiliateCreatorPaths.map((path, index) => (
            <button
              key={path.id}
              type="button"
              data-testid="affiliate-c100-path-button"
              aria-pressed={selected === index}
              onClick={() => setSelected((previous) => (previous === index ? null : index))}
              className={
                "min-h-14 rounded-xl border px-2 py-3 text-center text-xs font-semibold leading-snug transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#784256] sm:text-sm " +
                (selected === index
                  ? "border-[#744256] bg-[#744256] text-white"
                  : "border-[#d9c1c6] bg-white text-[#704758] hover:bg-[#f6e9ed]")
              }
            >
              <span className="mr-1 font-bold tabular-nums" aria-hidden="true">
                0{index + 1}
              </span>
              {path.shortLabel}
            </button>
          ))}
        </div>
        {current && (
          <>
            <div
              data-testid="affiliate-c100-selected-path"
              className="mt-3 grid min-w-0 overflow-hidden rounded-[1.4rem] border border-[#e3d0d1] bg-[#f8efeb] sm:grid-cols-[minmax(10rem,.6fr)_minmax(0,1.4fr)]"
            >
              <img
                src={current.image}
                alt={current.alt}
                width={500}
                height={300}
                loading="lazy"
                decoding="async"
                className="h-28 w-full object-cover object-center sm:h-full sm:min-h-52"
              />
              <div className="min-w-0 px-5 py-5 sm:px-7 sm:py-6">
                <p className="text-[11px] font-bold uppercase tracking-[.09em] text-[#805267]">
                  {current.eyebrow}
                </p>
                <h3
                  aria-live="polite"
                  className="mt-2 font-display text-2xl leading-tight text-[#503342]"
                >
                  {current.title}
                </h3>
                <ul className="mt-3 grid gap-1.5 text-sm leading-[1.5] text-[#69505d] sm:grid-cols-2">
                  {current.prompts.slice(0, 2).map((prompt) => (
                    <li key={prompt} className="flex items-start gap-2">
                      <span
                        aria-hidden="true"
                        className="mt-2 size-1.5 shrink-0 rounded-full bg-[#95566e]"
                      />
                      {prompt}
                    </li>
                  ))}
                </ul>
                <div className="mt-5 flex flex-wrap items-center gap-4">
                  <a
                    href="#inscricao"
                    className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#744256] px-5 py-3 text-sm font-bold text-white hover:bg-[#603345] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#744256]"
                  >
                    Conhecer o formulário <ArrowRight aria-hidden="true" className="size-4" />
                  </a>
                  <a
                    href="#perfis"
                    className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#744256] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
                  >
                    Ver ideias completas <ArrowUpRight aria-hidden="true" className="size-4" />
                  </a>
                </div>
              </div>
            </div>
            <p className="mt-3 text-xs leading-[1.7] text-[#7c606b]">
              As imagens são editoriais do catálogo oficial Vonix Hair, não retratos ou depoimentos
              de afiliadas. A candidatura é gratuita e a análise é individual.
            </p>
          </>
        )}
      </div>
    </section>
  );
}
