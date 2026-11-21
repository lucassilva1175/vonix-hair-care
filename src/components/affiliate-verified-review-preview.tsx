import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, PlayCircle } from "lucide-react";
import reviews from "@/data/reviews.json";

/**
 * Authentic public PRODUCT reviews from the official Vonix catalog only.
 * Three reviews have videos; the fourth has a photo, not a video.
 * Neither form of media proves an affiliate, verified purchase or income.
 * Preview images load lazily; videos are presented below the application.
 */
const selectedReviews = ["Mariana Andrade", "Ayla Muniz", "Fernanda Assis", "Ana Paula"].flatMap(
  (author) =>
    reviews.filter(
      (review) =>
        review.author === author &&
        review.slug === "botox-vonix" &&
        ((review.media.type === "video" &&
          "poster" in review.media &&
          typeof review.media.poster === "string") ||
          (review.media.type === "image" && typeof review.media.src === "string")),
    ),
);

export const officialProductVideoReviewCount = selectedReviews.filter(
  (review) => review.media.type === "video",
).length;
export const officialProductReviewCount = selectedReviews.length;

export function AffiliateVerifiedReviewPreview() {
  const carouselRef = useRef<HTMLDivElement | null>(null);
  const [canScrollBack, setCanScrollBack] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateScrollControls = useCallback(() => {
    const rail = carouselRef.current;
    if (!rail) return;
    const overflow = rail.scrollWidth > rail.clientWidth + 2;
    setCanScrollBack(overflow && rail.scrollLeft > 3);
    setCanScrollNext(overflow && rail.scrollLeft + rail.clientWidth < rail.scrollWidth - 3);
  }, []);

  useEffect(() => {
    const rail = carouselRef.current;
    if (!rail) return;
    updateScrollControls();
    // Cards can receive their responsive widths after hydration.
    // Observe the cards as well as the rail: its own width may not change
    // even when the children's combined scroll width does.
    const frame = window.requestAnimationFrame(updateScrollControls);
    window.addEventListener("resize", updateScrollControls);
    window.addEventListener("load", updateScrollControls);
    const observer =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateScrollControls) : null;
    observer?.observe(rail);
    rail.querySelectorAll('[data-testid="vonix-c72-review-card"]').forEach((card) => {
      observer?.observe(card);
    });
    return () => {
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("resize", updateScrollControls);
      window.removeEventListener("load", updateScrollControls);
    };
  }, [updateScrollControls]);

  function moveReviews(direction: -1 | 1) {
    const rail = carouselRef.current;
    if (!rail) return;
    const firstCard = rail.querySelector<HTMLElement>('[data-testid="vonix-c72-review-card"]');
    const distance = (firstCard?.getBoundingClientRect().width ?? rail.clientWidth * 0.8) + 12;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    rail.scrollBy({ left: direction * distance, behavior: reduceMotion ? "instant" : "smooth" });
  }

  return (
    <section
      id="avaliacoes-rapidas"
      aria-labelledby="product-review-preview-title"
      aria-describedby="product-review-preview-disclaimer"
      data-testid="vonix-c65-review-preview"
      className="scroll-mt-36 border-y border-[#e5d8d3] bg-[#fbf6f2] px-5 py-4 text-[#493039] sm:py-5"
    >
      <div className="mx-auto max-w-6xl lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-x-8">
        <div className="flex flex-col gap-1 lg:col-start-1 lg:row-start-1">
          <p className="text-[10px] font-bold uppercase tracking-[.16em] text-[#89586a]">
            Vozes de clientes · Catálogo Vonix Hair
          </p>
          <h2
            id="product-review-preview-title"
            className="font-display text-2xl leading-tight text-[#603748] sm:text-3xl"
          >
            O que dizem sobre nossos produtos
          </h2>
          <p
            id="product-review-preview-disclaimer"
            className="max-w-4xl text-xs leading-relaxed text-[#765e67]"
          >
            Avaliações de clientes sobre o produto Botox Vonix. Não são depoimentos de afiliadas e
            não comprovam compra verificada, vendas, renda ou participação no programa.
          </p>
        </div>

        <div
          data-testid="vonix-c82-review-controls"
          className="mt-3 flex items-center justify-between gap-3 md:hidden"
        >
          <p className="min-w-0 text-xs font-semibold leading-relaxed text-[#795767]">
            {officialProductReviewCount} avaliações reais de produto. Deslize ou use as setas.
          </p>
          <div className="flex shrink-0 gap-2" role="group" aria-label="Navegar pelas avaliações">
            <button
              type="button"
              data-testid="vonix-c82-review-back"
              aria-label="Ver avaliações anteriores"
              disabled={!canScrollBack}
              onClick={() => moveReviews(-1)}
              className="grid size-11 place-items-center rounded-full border border-[#b48e9b] bg-white text-[#673c4d] transition-colors hover:bg-[#f5e4e8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#784254] disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ArrowLeft aria-hidden="true" className="size-5" />
            </button>
            <button
              type="button"
              data-testid="vonix-c82-review-next"
              aria-label="Ver próximas avaliações"
              disabled={!canScrollNext}
              onClick={() => moveReviews(1)}
              className="grid size-11 place-items-center rounded-full border border-[#b48e9b] bg-white text-[#673c4d] transition-colors hover:bg-[#f5e4e8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#784254] disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ArrowRight aria-hidden="true" className="size-5" />
            </button>
          </div>
        </div>

        <div
          ref={carouselRef}
          onScroll={updateScrollControls}
          role="region"
          tabIndex={0}
          aria-label="Quatro avaliações de clientes sobre Botox Vonix, deslize horizontalmente no celular"
          data-testid="vonix-c72-product-reviews-carousel"
          className="-mx-5 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-5 pb-3 scroll-px-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#784254] sm:mx-0 sm:px-0 sm:pb-0 md:grid md:grid-cols-2 md:overflow-visible lg:col-span-2 lg:row-start-2 lg:grid-cols-4"
        >
          {selectedReviews.map((review) => (
            <figure
              key={review.author}
              data-testid="vonix-c72-review-card"
              className="group flex w-[78vw] max-w-[20rem] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-[#e5d7d3] bg-white shadow-[0_12px_28px_rgba(84,51,62,.10)] transition-shadow hover:shadow-[0_16px_34px_rgba(84,51,62,.15)] sm:w-[42vw] sm:max-w-none md:w-auto"
            >
              <a
                href="#avaliacoes-produtos"
                aria-label={
                  "Ver avaliação " +
                  (review.media.type === "video" ? "em vídeo" : "com foto") +
                  " de " +
                  review.author +
                  " na seção completa"
                }
                className="relative block aspect-[5/4] w-full shrink-0 overflow-hidden bg-[#eadee0] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#784254] sm:aspect-[16/11] lg:aspect-[5/4]"
              >
                <img
                  src={
                    review.media.type === "video" && "poster" in review.media
                      ? review.media.poster
                      : review.media.src
                  }
                  alt={
                    (review.media.type === "video"
                      ? "Imagem de prévia da avaliação de "
                      : "Foto publicada junto à avaliação de ") +
                    review.author +
                    " sobre Botox Vonix"
                  }
                  width={640}
                  height={480}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-[1.025] motion-reduce:transform-none motion-reduce:transition-none"
                />
                <span className="absolute left-3 top-3 rounded-full border border-white/60 bg-[#fffaf7]/95 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.06em] text-[#683d4d] shadow-sm">
                  {review.media.type === "video"
                    ? "Avaliação de produto em vídeo"
                    : "Avaliação de produto com foto"}
                </span>
                {review.media.type === "video" ? (
                  <PlayCircle
                    aria-hidden="true"
                    className="absolute bottom-3 right-3 size-9 rounded-full bg-white/95 p-1 text-[#783d53] shadow-lg transition-transform group-hover:scale-110 motion-reduce:transform-none motion-reduce:transition-none"
                  />
                ) : (
                  <span className="absolute bottom-3 right-3 rounded-lg bg-white/95 px-3 py-1.5 text-[10px] font-bold text-[#783d53] shadow-sm">
                    Foto real
                  </span>
                )}
              </a>
              <figcaption className="flex min-h-[10.75rem] min-w-0 flex-1 flex-col px-4 py-4 sm:px-5">
                <p className="text-[10px] font-bold uppercase tracking-[.06em] text-[#9a5c70]">
                  Cliente · Botox Vonix
                </p>
                <blockquote className="mt-2 line-clamp-4 break-words font-display text-base leading-snug text-[#4d3340] sm:text-lg">
                  “{review.comment}”
                </blockquote>
                <span className="mt-auto pt-4 text-sm font-bold text-[#794558]">
                  {review.author}
                  <span className="mt-0.5 block text-[11px] font-normal text-[#836b72]">
                    Avaliação de produto · não de afiliada
                  </span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 lg:col-start-2 lg:row-start-1 lg:self-end lg:justify-self-end">
          <a
            href="#avaliacoes-produtos"
            className="inline-flex min-h-11 items-center gap-1.5 text-xs font-semibold text-[#784254] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Ver avaliações completas
            <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </a>
          <a
            href="/produto/botox-vonix"
            className="inline-flex min-h-11 items-center gap-1.5 text-xs font-semibold text-[#784254] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            Ver produto na loja
            <ArrowUpRight aria-hidden="true" className="size-3.5" />
          </a>
          <a
            href="#inscricao"
            data-testid="vonix-c78-proof-signup-link"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#713f51] px-4 text-xs font-bold text-white hover:bg-[#5f3446] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#754153]"
          >
            Ver candidatura
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
