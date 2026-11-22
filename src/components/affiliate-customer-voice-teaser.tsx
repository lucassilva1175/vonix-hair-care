import { ArrowUpRight, MessageCircleMore } from "lucide-react";
import reviews from "@/data/reviews.json";

/**
 * Published PRODUCT review reused verbatim from the store. This must never be
 * marketed as an affiliate testimonial, purchase verification or income proof.
 */
const productReviews = reviews.filter((review) => review.slug === "botox-vonix");
const featuredReview = productReviews.find(
  (review) =>
    review.author === "Mariana Andrade" &&
    review.media.type === "video" &&
    "poster" in review.media &&
    typeof review.media.poster === "string",
);

export function AffiliateCustomerVoiceTeaser() {
  if (!featuredReview || featuredReview.media.type !== "video") return null;

  return (
    <aside
      data-testid="affiliate-c101-customer-voice"
      aria-labelledby="affiliate-c101-title"
      className="border-b border-[#e8d9d4] bg-[#f6eeea] px-5 py-3 text-[#543745] sm:py-6"
    >
      <div className="mx-auto grid max-w-5xl min-w-0 grid-cols-[5.5rem_minmax(0,1fr)] items-center gap-4 rounded-2xl border border-[#e3ccc9] bg-[#fffaf7] p-2.5 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-6 sm:px-5 sm:py-4">
        <a
          href="#avaliacoes-produtos"
          aria-label={"Ver avaliação completa de " + featuredReview.author + " sobre Botox Vonix"}
          className="block overflow-hidden rounded-xl bg-[#eadad5] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#80485e]"
        >
          <img
            src={featuredReview.media.poster}
            alt={
              "Imagem de prévia do vídeo publicado junto à avaliação de " +
              featuredReview.author +
              " sobre Botox Vonix"
            }
            width={240}
            height={300}
            loading="lazy"
            decoding="async"
            className="aspect-[3/4] w-full object-contain"
          />
        </a>
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold leading-4 text-[#835267]">
            <MessageCircleMore aria-hidden="true" className="size-4 shrink-0" />
            Comentário da loja · Botox Vonix
          </p>
          <h2
            id="affiliate-c101-title"
            className="mt-1 font-display text-lg leading-tight text-[#523241] sm:text-xl"
          >
            Conheça uma experiência com o produto.
          </h2>
          <figure className="mt-1.5">
            <blockquote className="text-sm font-medium leading-[1.45] text-[#654451]">
              “{featuredReview.comment}”
            </blockquote>
            <figcaption className="mt-1 text-xs font-semibold text-[#805365]">
              {featuredReview.author} · avaliação publicada no catálogo
            </figcaption>
          </figure>
          <p className="mt-2 text-[11px] leading-[1.55] text-[#806570]">
            Avaliação de produto, não depoimento de afiliada. Não comprova compra verificada,
            participação no programa ou ganhos.
          </p>
          <nav
            aria-label="Ações relacionadas à avaliação de produto"
            className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1"
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
    </aside>
  );
}
