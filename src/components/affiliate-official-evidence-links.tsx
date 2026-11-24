import { useState } from "react";
import { ArrowUpRight, Film, MessageSquareText } from "lucide-react";
import { getProduct, OUT_OF_STOCK } from "@/lib/store";
import publishedMedia from "@/data/provas-em-video.json";
import reviews from "@/data/reviews.json";
import { trackAffiliateFunnel } from "@/lib/affiliate-funnel";

/** Public release fallback: link to first-party source pages, do not republish
 * customer names, quotes, thumbnails, or video files until rights are documented. */
const videoProducts = [
  { slug: "kit-banana-e-mel", idea: "Apresente uma rotina de cuidados com shampoo e máscara." },
  {
    slug: "botox-vonix",
    idea: "Explore a embalagem e explique como consultar as instruções oficiais.",
  },
  {
    slug: "progressiva-fio-de-luz",
    idea: "Mostre a linha profissional e incentive a leitura das orientações de uso.",
  },
  { slug: "kit-desmaia", idea: "Crie um roteiro sobre as etapas de uma rotina capilar." },
  { slug: "kit-monovonix", idea: "Mostre os produtos da linha e suas apresentações." },
  { slug: "kit-cachos", idea: "Inspire um conteúdo sobre a rotina de cuidados com cachos." },
] as const;

// Additional first-party catalog pages, not customer media republication.
const additionalVideoProducts = [
  {
    slug: "shampoo-fio-de-luz-anti-residuo",
    idea: "Mostre a apresentação e as instruções oficiais da linha.",
  },
  {
    slug: "botox-vonix-matizador",
    idea: "Apresente a versão matizadora e oriente a leitura do rótulo.",
  },
  { slug: "botox-line", idea: "Explore a embalagem e a página de informações." },
  { slug: "botox-line-matizador", idea: "Mostre as apresentações disponíveis no catálogo." },
  {
    slug: "mascara-efeito-teia-desmaia-cabelo",
    idea: "Crie um roteiro de apresentação da máscara.",
  },
  {
    slug: "shampoo-hidratante-desmaia-cabelo",
    idea: "Apresente o shampoo e os cuidados indicados na loja.",
  },
  { slug: "shampoo-monovonix", idea: "Mostre a apresentação do shampoo da linha." },
  { slug: "mascara-monovonix", idea: "Explore a apresentação da máscara e as instruções de uso." },
] as const;

export function AffiliateOfficialEvidenceLinks({
  variant,
}: {
  variant: "teaser" | "preview" | "reviews" | "videos";
}) {
  const [expanded, setExpanded] = useState(false);
  const videos = variant === "videos";
  const compact = variant === "teaser";
  const id =
    variant === "preview"
      ? "avaliacoes-rapidas"
      : variant === "reviews"
        ? "avaliacoes-produtos"
        : videos
          ? "catalogo-em-video"
          : undefined;
  const catalogProducts = (items: readonly { slug: string; idea: string }[]) =>
    items.flatMap(({ slug, idea }) => {
      const product = getProduct(slug);
      const count = publishedMedia.filter((media) => media.slugs.includes(slug)).length;
      return product && !OUT_OF_STOCK.has(slug) && count > 0
        ? [{ slug, name: product.name, count, idea }]
        : [];
    });
  const products = videos ? catalogProducts(videoProducts) : [];
  const additionalProducts = videos ? catalogProducts(additionalVideoProducts) : [];
  const visibleProducts = expanded ? [...products, ...additionalProducts] : products;
  const reviewCount = reviews.filter((review) => review.slug === "botox-vonix").length;
  return (
    <section
      id={id}
      data-testid={"affiliate-c156-source-" + variant}
      className={
        compact
          ? "bg-card px-5 py-4"
          : "scroll-mt-32 border-y border-[#e8d8d6] bg-[#fbf5f2] px-5 py-8 sm:py-12"
      }
      aria-label={
        videos ? "Demonstrações no catálogo oficial" : "Avaliações de produtos na loja oficial"
      }
    >
      <div className="mx-auto max-w-6xl rounded-2xl border border-[#e3ccc9] bg-white p-4 sm:p-6">
        <div className="flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#f3e3e1] text-[#854b5f]">
            {videos ? <Film aria-hidden="true" /> : <MessageSquareText aria-hidden="true" />}
          </span>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider text-[#89586a]">
              Direto da loja Vonix Hair
            </p>
            <h2 className="mt-1 font-display text-xl text-[#523342] sm:text-2xl">
              {videos
                ? "Inspire-se com os produtos em ação"
                : "Conheça as avaliações de quem usa Vonix"}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#755d66]">
              {videos
                ? "Explore as demonstrações disponíveis nas páginas oficiais dos produtos. São conteúdos de produto, não resultados de afiliadas."
                : "Confira as avaliações de produto na página oficial do Botox Vonix. São opiniões de clientes sobre produtos, não depoimentos de afiliadas nem promessa de ganhos."}
            </p>
          </div>
        </div>
        {videos ? (
          <>
            <p
              className="mt-4 text-xs font-semibold text-[#795e69]"
              data-testid="affiliate-c157-video-count"
            >
              {visibleProducts.length} linhas ·{" "}
              {visibleProducts.reduce((total, product) => total + product.count, 0)} vínculos de
              vídeos no acervo oficial. Abra a loja em outra aba para manter sua candidatura aqui.
            </p>
            <div
              id="affiliate-c158-catalog-grid"
              className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
            >
              {visibleProducts.map(({ slug, name, count, idea }) => (
                <a
                  key={slug}
                  href={"/produto/" + slug}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackAffiliateFunnel("affiliate_catalog_source_open")}
                  className="flex min-h-24 items-center justify-between gap-3 rounded-xl border border-[#e5d2d4] p-3 text-sm font-bold text-[#724155] hover:bg-[#fff8f6] focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  <img
                    src={"/images/products/" + slug + "-480.webp"}
                    alt=""
                    width={80}
                    height={80}
                    loading="lazy"
                    decoding="async"
                    className="size-20 shrink-0 rounded-lg bg-[#fbf5f2] object-contain"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block">{name}</span>
                    <span className="mt-1 block text-[11px] font-semibold text-[#89586a]">
                      {count} {count === 1 ? "vídeo associado" : "vídeos associados"}
                    </span>
                    <span className="mt-1 block text-xs font-normal leading-relaxed text-[#795e69]">
                      {idea}
                    </span>
                    <span className="mt-2 block text-xs font-bold text-[#724155]">
                      Ver demonstrações na loja (nova aba)
                    </span>
                  </span>
                  <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
                </a>
              ))}
            </div>
            {additionalProducts.length > 0 && (
              <button
                type="button"
                aria-expanded={expanded}
                aria-controls="affiliate-c158-catalog-grid"
                onClick={() => setExpanded((value) => !value)}
                className="mt-4 min-h-12 w-full rounded-full border border-[#d8bfc5] bg-[#fff8f6] px-5 py-3 text-sm font-bold text-[#724155] focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                {expanded
                  ? "Mostrar apenas as linhas em destaque"
                  : `Explorar mais ${additionalProducts.length} produtos do acervo`}
              </button>
            )}
          </>
        ) : (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <span
              className="inline-flex min-h-11 items-center gap-3 rounded-xl border border-[#e5d2d4] bg-[#fff8f6] px-3 py-2 text-xs font-bold text-[#724155]"
              data-testid="affiliate-c157-review-count"
            >
              <img
                src="/images/products/botox-vonix-480.webp"
                alt=""
                width={44}
                height={44}
                loading="lazy"
                decoding="async"
                className="size-11 shrink-0 rounded-lg object-contain"
              />
              <span>
                {reviewCount} {reviewCount === 1 ? "avaliação publicada" : "avaliações publicadas"}{" "}
                no catálogo
              </span>
            </span>
            <a
              href="/produto/botox-vonix"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackAffiliateFunnel("affiliate_review_source_open")}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#784254] px-5 py-2 text-sm font-bold text-white hover:bg-[#603746] focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              Ver avaliações na loja oficial (nova aba){" "}
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
