import { useState } from "react";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { affiliateCreatorPaths } from "@/data/affiliate-creator-paths";

/** Editorial exploration only: not an eligibility test or a signup form. */
export function AffiliateCreatorSpotlight() {
  const [selected, setSelected] = useState<number | null>(null);
  const [mobileStylesExpanded, setMobileStylesExpanded] = useState(false);
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
        <button
          type="button"
          data-testid="affiliate-c108-styles-toggle"
          aria-controls="affiliate-c100-path-options"
          aria-expanded={mobileStylesExpanded}
          onClick={() => {
            setMobileStylesExpanded((expanded) => !expanded);
            setSelected(null);
          }}
          className="mt-3 flex min-h-12 w-full items-center justify-between gap-2 rounded-xl border border-[#dfc9ce] bg-white px-3 py-2.5 text-left text-xs font-bold text-[#744256] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#744256] sm:hidden"
        >
          <span>
            {mobileStylesExpanded
              ? "Ocultar ideias de conteúdo"
              : "Descobrir 3 estilos de conteúdo"}
          </span>
          <ArrowRight
            aria-hidden="true"
            className={
              "size-4 shrink-0 transition-transform motion-reduce:transition-none " +
              (mobileStylesExpanded ? "rotate-90" : "")
            }
          />
        </button>
        <div
          id="affiliate-c100-path-options"
          role="group"
          aria-label="Escolha seu estilo de conteúdo"
          className={
            "mt-4 grid-cols-1 gap-2.5 sm:grid sm:grid-cols-3 sm:gap-4 " +
            (mobileStylesExpanded ? "grid" : "hidden")
          }
        >
          {affiliateCreatorPaths.map((path, index) => (
            <button
              key={path.id}
              type="button"
              data-testid="affiliate-c100-path-button"
              aria-pressed={selected === index}
              aria-controls={selected === index ? "affiliate-c100-selected-path" : undefined}
              onClick={() => setSelected((previous) => (previous === index ? null : index))}
              className={
                "group relative isolate flex min-h-36 min-w-0 overflow-hidden rounded-[1.35rem] border-2 text-left shadow-[0_10px_25px_rgba(73,41,50,.12)] transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_35px_rgba(73,41,50,.17)] motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#784256] sm:min-h-64 " +
                (selected === index ? "border-[#754256]" : "border-transparent")
              }
            >
              <img
                data-testid="affiliate-c111-style-photo"
                src={path.image}
                alt={path.alt}
                width={480}
                height={480}
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.045] motion-reduce:transition-none"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-[#2a1b26]/95 via-[#38232f]/30 to-[#241722]/30"
              />
              <span className="relative flex min-h-36 w-full flex-col justify-between gap-4 p-4 text-white sm:min-h-64 sm:p-5">
                <span className="flex items-center justify-between gap-2">
                  <span className="rounded-full border border-white/60 bg-[#241722]/50 px-3 py-1.5 text-[10px] font-bold tracking-wider">
                    0{index + 1} / 03
                  </span>
                  <span
                    aria-hidden="true"
                    className="rounded-full border border-white/60 bg-[#241722]/50 px-3 py-1.5 text-[10px] font-semibold"
                  >
                    {selected === index ? "Selecionado" : "Explorar"}
                  </span>
                </span>
                <span className="block">
                  <span className="block text-[10px] font-semibold uppercase tracking-[.13em] text-white/85">
                    Uma ideia para seu perfil
                  </span>
                  <span className="mt-1 block font-display text-2xl leading-tight sm:text-[1.6rem]">
                    {path.shortLabel}
                  </span>
                  <span className="mt-2 block text-xs font-medium text-white/90">
                    {selected === index ? "Toque para recolher" : "Toque para descobrir"}
                  </span>
                </span>
              </span>
            </button>
          ))}
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-[#795f6b]">
          Fotografias editoriais de categorias do site Vonix Hair. Não mostram afiliadas
          participantes nem comprovam uma parceria. Escolha apenas para explorar ideias.
        </p>
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
                  {current.prompts.map((prompt) => (
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
