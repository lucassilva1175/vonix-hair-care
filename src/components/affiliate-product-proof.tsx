import { ArrowUpRight, ChevronDown, MessageSquareQuote } from "lucide-react";
import { useEffect, useRef } from "react";
import storeReviews from "@/data/reviews.json";

/**
 * Single source of truth is the public store review dataset. Never invent
 * a reviewer, pair an unrelated video with a quote, or claim that these
 * product comments prove affiliate-program participation or earnings.
 */
const monthFormatter = new Intl.DateTimeFormat("pt-BR", {
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

const customerComments = storeReviews
  .filter((review) => review.slug === "botox-vonix")
  .map((review) => {
    const base = {
      name: review.author,
      month: monthFormatter.format(new Date(review.date + "T12:00:00Z")),
      quote: review.comment,
    };
    if (review.media.type === "video") {
      if (!("poster" in review.media) || typeof review.media.poster !== "string") return null;
      return {
        ...base,
        mediaType: "video" as const,
        mediaSrc: review.media.src,
        poster: review.media.poster,
      };
    }
    if (review.media.type === "image") {
      return { ...base, mediaType: "image" as const, mediaSrc: review.media.src, poster: null };
    }
    return null;
  })
  .filter((review): review is NonNullable<typeof review> => review !== null);

/** Factual product proof close to the opening, without inventing creator proof. */
export function AffiliateProductProof() {
  const fullReviewsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    // Links can be followed safely once React has attached the hash/click listeners.
    if (fullReviewsRef.current) fullReviewsRef.current.dataset.interactive = "true";
    const openForHash = () => {
      if (window.location.hash === "#avaliacoes-produtos" && fullReviewsRef.current) {
        fullReviewsRef.current.open = true;
      }
    };
    const openForPreviewLink = (event: MouseEvent) => {
      const element = event.target;
      if (element instanceof Element && element.closest('a[href="#avaliacoes-produtos"]')) {
        if (fullReviewsRef.current) fullReviewsRef.current.open = true;
      }
    };
    openForHash();
    window.addEventListener("hashchange", openForHash);
    document.addEventListener("click", openForPreviewLink);
    return () => {
      if (fullReviewsRef.current) delete fullReviewsRef.current.dataset.interactive;
      window.removeEventListener("hashchange", openForHash);
      document.removeEventListener("click", openForPreviewLink);
    };
  }, []);

  return (
    <section
      id="avaliacoes-produtos"
      aria-labelledby="vonix-product-reviews-title"
      data-testid="vonix-c53-real-product-reviews"
      className="scroll-mt-40 border-y border-[#e4d5d2] bg-[#f8f2ed] px-5 py-8 sm:py-11"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid items-end gap-4 border-b border-[#dbc5c7] pb-5 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="text-sm font-semibold text-[#814958]">
              Avaliações publicadas no catálogo oficial
            </p>
            <h2
              id="vonix-product-reviews-title"
              className="mt-2 max-w-3xl font-display text-3xl leading-tight text-[#482e39] sm:text-4xl"
            >
              Produtos que já têm histórias.{" "}
              <span className="italic text-[#8a5163]">A sua ainda pode começar.</span>
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[#6b525c] sm:text-base">
              Estes comentários foram publicados por clientes sobre o Botox Vonix na loja oficial.{" "}
              <strong className="font-semibold">Não são depoimentos de afiliadas</strong> ou
              resultados de quem participa do programa.
            </p>
          </div>
          <a
            href="/produto/botox-vonix"
            className="inline-flex min-h-12 items-center gap-2 self-start font-semibold text-[#774050] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 lg:self-end"
          >
            Conferir avaliações na loja
            <ArrowUpRight aria-hidden="true" className="size-5 shrink-0" />
          </a>
        </div>

        <details
          ref={fullReviewsRef}
          data-testid="affiliate-c93-review-disclosure"
          className="group mt-5 rounded-2xl border border-[#d9bec3] bg-white/95 shadow-sm"
        >
          <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#82485b] [&::-webkit-details-marker]:hidden">
            <span className="min-w-0">
              <span className="block text-sm font-bold text-[#713f52] sm:text-base">
                Ver as {customerComments.length} avaliações completas
              </span>
              <span className="mt-1 block text-xs leading-5 text-[#806570]">
                As mesmas quatro avaliações da prévia · 3 vídeos e 1 foto, não oito depoimentos
                diferentes
              </span>
            </span>
            <ChevronDown
              aria-hidden="true"
              className="size-5 shrink-0 text-[#82485b] transition-transform group-open:rotate-180 motion-reduce:transition-none"
            />
          </summary>
          <div className="border-t border-[#e7d5d3] px-4 pb-6 pt-3 sm:px-6">
            <div className="mt-4 grid gap-5 lg:grid-cols-[.78fr_1.22fr] lg:gap-7">
              <figure className="flex min-w-0 flex-col overflow-hidden rounded-[1.5rem] border border-[#dfd0ce] bg-white">
                <picture className="block min-h-0 flex-1 bg-[#fbf7f3]">
                  <source srcSet="/images/products/botox-vonix.webp" type="image/webp" />
                  <img
                    src="/images/products/botox-vonix.jpg"
                    alt="Embalagem oficial do Botox Vonix sem formol, produto do catálogo Vonix Hair"
                    width={768}
                    height={768}
                    loading="lazy"
                    decoding="async"
                    className="aspect-[5/4] w-full object-contain p-5 sm:p-7 lg:aspect-square"
                  />
                </picture>
                <figcaption className="border-t border-[#e7dbd6] px-6 py-4">
                  <p className="font-display text-xl text-[#482e39]">Botox Vonix</p>
                  <p className="mt-1 text-xs leading-relaxed text-[#715963]">
                    Fotografia do produto comercializado pela Vonix Hair; não retrata candidatas.
                  </p>
                </figcaption>
              </figure>

              <div className="grid min-w-0 gap-3">
                {customerComments.map(({ name, month, quote, mediaType, mediaSrc, poster }) => (
                  <blockquote
                    key={name}
                    className="grid min-w-0 grid-cols-[5.5rem_minmax(0,1fr)] gap-4 rounded-[1.3rem] border border-[#e0cecb] bg-white px-4 py-5 sm:grid-cols-[8rem_minmax(0,1fr)] sm:px-6"
                  >
                    {mediaType === "video" ? (
                      <video
                        data-testid="affiliate-c62-customer-video"
                        className="aspect-[3/4] w-full min-w-0 self-start rounded-xl bg-[#382b31] object-contain"
                        controls
                        preload="none"
                        playsInline
                        poster={poster ?? undefined}
                        aria-label={
                          "Vídeo publicado na loja junto à avaliação sobre Botox Vonix de " + name
                        }
                      >
                        <source src={mediaSrc} type="video/mp4" />
                        Seu navegador não reproduz este vídeo. Consulte o link da avaliação na loja.
                      </video>
                    ) : (
                      <img
                        data-testid="affiliate-c86-customer-photo"
                        src={mediaSrc}
                        alt={"Foto publicada junto à avaliação de " + name + " sobre Botox Vonix"}
                        width={160}
                        height={220}
                        loading="lazy"
                        decoding="async"
                        className="aspect-[3/4] w-full min-w-0 self-start rounded-xl bg-[#382b31] object-cover"
                      />
                    )}
                    <div className="flex min-w-0 flex-col justify-between">
                      <div>
                        <p className="inline-flex items-start gap-2 text-xs font-semibold leading-relaxed text-[#855267]">
                          <MessageSquareQuote
                            aria-hidden="true"
                            className="mt-px size-4 shrink-0"
                          />
                          {mediaType === "video"
                            ? "Comentário publicado no produto"
                            : "Avaliação de produto com foto"}
                        </p>
                        <p className="mt-3 font-display text-lg leading-snug text-[#482e39] sm:text-2xl">
                          “{quote}”
                        </p>
                      </div>
                      <footer className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#eee0dd] pt-3">
                        <span className="text-sm font-semibold text-[#482e39]">{name}</span>
                        <span className="text-xs text-[#725e64]">Cliente · {month}</span>
                      </footer>
                    </div>
                  </blockquote>
                ))}
              </div>
            </div>

            <p className="mt-6 max-w-4xl text-xs leading-6 text-[#705962]">
              Os três vídeos, a foto e os comentários escritos estão associados às avaliações de
              produto publicadas na loja. O comentário não é uma transcrição integral do áudio.
              Estes comentários documentam experiências com produtos da Vonix Hair. Eles não
              representam renda, vendas, comissões ou participação no programa de afiliadas. A
              candidatura é gratuita, passa por seleção e não garante parceria.
            </p>
          </div>
        </details>
      </div>
    </section>
  );
}
