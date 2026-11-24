import { ArrowUpRight, Film, MessageSquareText } from "lucide-react";
import { getProduct } from "@/lib/store";
import publishedMedia from "@/data/provas-em-video.json";

/** Public release fallback: link to first-party source pages, do not republish
 * customer names, quotes, thumbnails, or video files until rights are documented. */
const videoProducts = [
  "kit-banana-e-mel",
  "botox-vonix",
  "progressiva-fio-de-luz",
  "kit-desmaia",
  "kit-monovonix",
  "kit-cachos",
] as const;

export function AffiliateOfficialEvidenceLinks({
  variant,
}: {
  variant: "teaser" | "preview" | "reviews" | "videos";
}) {
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
  const products = videos
    ? videoProducts.flatMap((slug) => {
        const product = getProduct(slug);
        return product && publishedMedia.some((media) => media.slugs.includes(slug))
          ? [{ slug, name: product.name }]
          : [];
      })
    : [];
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
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {products.map(({ slug, name }) => (
              <a
                key={slug}
                href={"/produto/" + slug}
                className="flex min-h-12 items-center justify-between gap-2 rounded-xl border border-[#e5d2d4] px-4 py-3 text-sm font-bold text-[#724155] hover:bg-[#fff8f6] focus-visible:outline-2 focus-visible:outline-offset-2"
              >
                <span>{name}</span>
                <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
              </a>
            ))}
          </div>
        ) : (
          <a
            href="/produto/botox-vonix"
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#784254] px-5 py-2 text-sm font-bold text-white hover:bg-[#603746] focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Ver avaliações na loja oficial <ArrowUpRight aria-hidden="true" className="size-4" />
          </a>
        )}
      </div>
    </section>
  );
}
