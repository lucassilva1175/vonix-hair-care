import reviews from "@/data/reviews.json";

const selectedReviews = ["Mariana Andrade", "Ayla Muniz"].flatMap((author) =>
  reviews.filter(
    (review) =>
      review.author === author &&
      review.slug === "botox-vonix" &&
      review.media.type === "video" &&
      review.media.poster,
  ),
);

export function AffiliateVerifiedReviewPreview() {
  return (
    <section
      aria-labelledby="product-review-preview-title"
      aria-describedby="product-review-preview-disclaimer"
      data-testid="vonix-c65-review-preview"
      className="border-y border-border bg-secondary/30 px-5 py-7 sm:py-8"
    >
      <div className="mx-auto max-w-5xl">
        <h2 id="product-review-preview-title" className="font-display text-2xl text-primary sm:text-3xl">
          O que dizem sobre nossos produtos
        </h2>
        <p
          id="product-review-preview-disclaimer"
          className="mt-3 max-w-4xl text-xs leading-relaxed text-muted-foreground"
        >
          Avaliações de clientes sobre o produto Botox Vonix. Não são depoimentos de afiliadas e
          não comprovam compra verificada, vendas, renda ou participação no programa.
        </p>
        <div className="mt-5 grid min-w-0 gap-5 sm:grid-cols-2 sm:gap-8">
          {selectedReviews.map((review) => (
            <figure key={review.author} className="flex min-w-0 items-start gap-3">
              <img
                src={review.media.poster}
                alt={`Imagem de prévia da avaliação de ${review.author} sobre Botox Vonix`}
                width={64}
                height={80}
                loading="lazy"
                decoding="async"
                className="h-20 w-16 shrink-0 rounded object-cover"
              />
              <div className="min-w-0">
                <blockquote className="text-sm leading-relaxed text-foreground">
                  “{review.comment}”
                </blockquote>
                <figcaption className="mt-2 text-xs font-semibold text-primary">
                  {review.author}
                </figcaption>
              </div>
            </figure>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1">
          <a
            href="#avaliacoes-produtos"
            className="inline-flex min-h-11 items-center text-xs font-semibold text-primary underline underline-offset-4"
          >
            Ver avaliações completas
          </a>
          <a
            href="/produto/botox-vonix"
            className="inline-flex min-h-11 items-center text-xs font-semibold text-primary underline underline-offset-4"
          >
            Ver produto na loja
          </a>
        </div>
      </div>
    </section>
  );
}