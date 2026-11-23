import { ArrowUpRight, BookOpenCheck, Clapperboard } from "lucide-react";
import { affiliateCreatorProductStories } from "@/data/affiliate-creator-product-stories";

type ProductStory = (typeof affiliateCreatorProductStories)[number];

/**
 * Curated editorial idea, not a product-use testimonial or a promise that
 * applicants receive products. Everything in this component is local/read-only.
 */
export function AffiliateCreatorProductStory({ story }: { story: ProductStory }) {
  return (
    <section
      data-testid="affiliate-c113-product-story"
      aria-label={"Inspiração editorial com " + story.name}
      className="mt-3 overflow-hidden rounded-[1.5rem] border border-[#dec4c8] bg-white shadow-[0_20px_44px_rgba(67,37,52,.08)]"
    >
      <div className="grid min-w-0 gap-0 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div className="relative isolate flex min-h-60 min-w-0 flex-col justify-between overflow-hidden bg-gradient-to-br from-[#f3dfd9] via-[#fbf4ed] to-[#eee0e6] p-5 sm:min-h-72 sm:p-7">
          <span className="relative z-10 inline-flex w-fit items-center gap-2 rounded-full border border-[#d8b8c5] bg-white/90 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.09em] text-[#75445a]">
            <BookOpenCheck aria-hidden="true" className="size-3.5" />
            Produto real · catálogo Vonix
          </span>
          <picture className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <source srcSet={story.image} type="image/webp" />
            <img
              data-testid="affiliate-c113-official-product-image"
              src={story.fallback}
              alt={story.alt}
              loading="lazy"
              decoding="async"
              width={600}
              height={600}
              className="h-full w-full object-contain px-12 pb-10 pt-12 drop-shadow-[0_15px_22px_rgba(74,40,47,.19)] sm:px-16"
            />
          </picture>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#f0e2e0]/95 to-transparent"
          />
          <div className="relative z-10 self-end rounded-xl border border-white/80 bg-white/90 px-3 py-2 text-right text-[11px] font-semibold text-[#75505f] shadow-sm">
            Acervo oficial da marca
          </div>
        </div>
        <div className="min-w-0 px-5 py-6 text-[#553745] sm:px-7 sm:py-7">
          <p className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[.11em] text-[#955f75]">
            <Clapperboard aria-hidden="true" className="size-4" /> Seu primeiro roteiro visual
          </p>
          <h4 className="mt-2 font-display text-2xl leading-tight sm:text-3xl">
            {story.eyebrow}
            <span className="text-[#875068]">.</span>
          </h4>
          <p className="mt-2 text-sm leading-[1.6] text-[#705562]">{story.intro}</p>
          <ol data-testid="affiliate-c113-story-steps" className="mt-5 grid gap-2 sm:grid-cols-3">
            {story.takes.map((take, index) => (
              <li
                key={take.label}
                className="min-w-0 rounded-xl border border-[#ead9d8] bg-[#fcf8f5] p-3.5"
              >
                <span className="block text-[10px] font-bold uppercase tracking-[.12em] text-[#965f72]">
                  0{index + 1} / {take.label}
                </span>
                <span className="mt-2 block text-xs leading-[1.6] text-[#614a54]">{take.text}</span>
              </li>
            ))}
          </ol>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <a
              data-testid="affiliate-c113-official-product-link"
              href={story.href}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[#b88f9d] bg-white px-4 py-2.5 text-sm font-bold text-[#784356] transition-colors hover:bg-[#f6ecea] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#784356]"
            >
              Conhecer {story.name} na loja
              <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
            </a>
          </div>
        </div>
      </div>
      <p className="border-t border-[#e7d4d7] bg-[#fff9f7] px-5 py-3 text-[11px] leading-[1.6] text-[#795f68] sm:px-7">
        Inspiração editorial com fotos do catálogo da Vonix Hair, não publicação de afiliada ou
        testemunho de uso. Não é necessário comprar produtos para se candidatar; nenhum kit, cupom,
        aprovação ou remuneração é garantido.
      </p>
    </section>
  );
}
