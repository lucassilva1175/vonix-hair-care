import { useState } from "react";
import { ArrowUpRight, MessageCircleMore } from "lucide-react";
import reviews from "@/data/reviews.json";

/**
 * Genuine published PRODUCT reviews only. Preserve the author, comment and
 * original photo/video poster together; never imply these people are affiliates,
 * purchases were verified or their income is known.
 */
const reviewedAuthors = ["Mariana Andrade", "Ayla Muniz", "Fernanda Assis", "Ana Paula"] as const;
const productReviews = reviews.filter((review) => review.slug === "botox-vonix");
const selectedReviews = reviewedAuthors.flatMap((author) =>
  productReviews.filter(
    (review) =>
      review.author === author &&
      (review.media.type === "image" ||
        (review.media.type === "video" && typeof review.media.poster === "string")),
  ),
);

export function AffiliateCustomerVoiceTeaser() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = selectedReviews[selectedIndex] ?? selectedReviews[0];
  if (!selected || selectedReviews.length !== reviewedAuthors.length) return null;

  const imageSrc = selected.media.type === "video" ? selected.media.poster : selected.media.src;
  const imageAlt =
    (selected.media.type === "video"
      ? "Imagem de prévia do vídeo publicado junto à avaliação de "
      : "Foto publicada junto à avaliação de ") +
    selected.author +
    " sobre Botox Vonix";

  return (
    <aside
      data-testid="affiliate-c101-customer-voice"
      aria-labelledby="affiliate-c101-title"
      className="border-b border-[#e8d9d4] bg-[#f6eeea] px-5 py-3 text-[#543745] sm:py-6"
    >
      <div className="mx-auto grid max-w-5xl min-w-0 grid-cols-[5.5rem_minmax(0,1fr)] items-start gap-4 rounded-2xl border border-[#e3ccc9] bg-[#fffaf7] p-2.5 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-6 sm:px-5 sm:py-4">
        <a
          href="#avaliacoes-produtos"
          aria-label={"Ver avaliação completa de " + selected.author + " sobre Botox Vonix"}
          className="block overflow-hidden rounded-xl bg-[#eadad5] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#80485e]"
        >
          <img
            data-testid="affiliate-c106-review-image"
            src={imageSrc}
            alt={imageAlt}
            width={240}
            height={300}
            loading="lazy"
            decoding="async"
            className="aspect-[3/4] w-full object-contain"
          />
        </a>
        <div id="affiliate-c106-review-panel" className="min-w-0">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold leading-4 text-[#835267]">
            <MessageCircleMore aria-hidden="true" className="size-4 shrink-0" />
            Comentários da loja · Botox Vonix
          </p>
          <h2
            id="affiliate-c101-title"
            className="mt-1 font-display text-lg leading-tight text-[#523241] sm:text-xl"
          >
            Conheça experiências reais com o produto.
          </h2>
          <figure className="mt-1.5">
            <blockquote
              data-testid="affiliate-c106-active-comment"
              aria-live="polite"
              aria-atomic="true"
              className="text-sm font-medium leading-[1.45] text-[#654451]"
            >
              “{selected.comment}”
            </blockquote>
            <figcaption
              data-testid="affiliate-c106-active-author"
              className="mt-1 text-xs font-semibold text-[#805365]"
            >
              {selected.author} · avaliação publicada no catálogo
            </figcaption>
          </figure>
          <p className="mt-2 text-[11px] leading-[1.55] text-[#806570]">
            Avaliações de produto, não depoimentos de afiliadas. Não comprovam compra verificada,
            participação no programa ou ganhos.
          </p>
          <div className="mt-3 min-w-0 border-t border-[#efdfdb] pt-3 sm:pt-4">
            <p className="text-[11px] font-semibold text-[#835267]">
              Leia outras experiências do mesmo produto:
            </p>
            <div
              role="group"
              aria-label="Selecionar avaliações de clientes sobre Botox Vonix"
              data-testid="affiliate-c106-review-choices"
              className="mt-2 grid grid-cols-4 gap-1.5 sm:gap-2"
            >
              {selectedReviews.map((review, index) => (
                <button
                  key={review.author}
                  type="button"
                  aria-label={"Ver avaliação de produto de " + review.author}
                  aria-controls="affiliate-c106-review-panel"
                  aria-pressed={selectedIndex === index}
                  onClick={() => setSelectedIndex(index)}
                  data-testid="affiliate-c106-review-choice"
                  className={
                    "min-h-11 min-w-0 rounded-lg border px-1.5 py-2 text-center text-[11px] font-semibold leading-snug transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#784256] sm:px-3 sm:text-xs " +
                    (selectedIndex === index
                      ? "border-[#754255] bg-[#754255] text-white"
                      : "border-[#d8bcc5] bg-white text-[#774457] hover:bg-[#f4e6e9]")
                  }
                >
                  {review.author === "Mariana Andrade"
                    ? "Mariana"
                    : review.author === "Fernanda Assis"
                      ? "Fernanda"
                      : review.author}
                </button>
              ))}
            </div>
            <nav
              aria-label="Ações relacionadas à avaliação de produto"
              className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-0"
            >
              <a
                href="#avaliacoes-produtos"
                className="inline-flex min-h-11 items-center gap-1 text-xs font-bold text-[#774457] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                Ver as {productReviews.length} avaliações completas
                <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
              </a>
              <a
                href="#inscricao"
                className="inline-flex min-h-11 items-center gap-1 text-xs font-semibold text-[#774457] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                Ir à inscrição
                <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
              </a>
            </nav>
          </div>
        </div>
      </div>
    </aside>
  );
}
