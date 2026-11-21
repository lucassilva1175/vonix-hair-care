import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  Images,
  Sparkles,
} from "lucide-react";
import {
  officialProductReviewCount,
  officialProductVideoReviewCount,
} from "@/components/affiliate-verified-review-preview";
import { Button } from "@/components/ui/button";
import { AffiliateProgramShare } from "@/components/affiliate-program-share";

export type RecruitmentStatus = "loading" | "open" | "limited" | "closed" | "unavailable";

/**
 * Product photographs are published by the Vonix Hair store itself.
 * This is catalogue imagery, NOT UGC, influencer photography or evidence
 * of an existing affiliate relationship. The links are product sources.
 */
const products = [
  {
    name: "Combo Banana e Mel",
    caption: "Rotina e cuidado capilar",
    slug: "kit-banana-e-mel",
    href: "/produto/kit-banana-e-mel",
    background: "bg-[#f3e1d5]",
  },
  {
    name: "Máscara Nutri Repair",
    caption: "Nutrição dos fios",
    slug: "mascara-reparacao-nutri-repair",
    href: "/produto/mascara-reparacao-nutri-repair",
    background: "bg-[#f1e5e8]",
  },
  {
    name: "Botox Vonix",
    caption: "Catálogo profissional",
    slug: "botox-vonix",
    href: "/produto/botox-vonix",
    background: "bg-[#ece3df]",
  },
] as const;

function CatalogCard({
  item,
  featured = false,
}: {
  item: (typeof products)[number];
  featured?: boolean;
}) {
  return (
    <a
      href={item.href}
      data-testid="affiliate-c61-catalog-link"
      className={
        "group flex w-[68vw] max-w-[17.5rem] shrink-0 snap-start min-w-0 flex-col overflow-hidden rounded-2xl border border-[#e2d4d1] bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6f3b4d] lg:w-auto lg:max-w-none lg:shrink " +
        (featured ? "lg:row-span-2" : "")
      }
      aria-label={item.name + " — conferir produto no catálogo oficial"}
    >
      <picture
        className={
          "flex min-h-0 flex-1 items-center justify-center " +
          item.background +
          (featured ? " aspect-[5/4] lg:aspect-auto" : " aspect-[5/4]")
        }
      >
        <source srcSet={`/images/products/${item.slug}.webp`} type="image/webp" />
        <img
          src={`/images/products/${item.slug}.jpg`}
          alt={item.name + ", embalagem do produto vendido na loja Vonix Hair"}
          width={640}
          height={640}
          loading={featured ? "eager" : "lazy"}
          fetchPriority={featured ? "high" : "auto"}
          decoding="async"
          className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-[1.025] sm:p-5"
        />
      </picture>
      <span className="flex min-w-0 items-center justify-between gap-2 border-t border-[#eadad6] px-3 py-3 sm:px-4">
        <span className="min-w-0">
          <span className="block text-[10px] leading-4 text-[#745b65] sm:text-xs">
            {item.caption}
          </span>
          <span className="mt-1 block text-xs font-semibold leading-tight text-[#50313d] sm:text-sm">
            {item.name}
          </span>
        </span>
        <ArrowUpRight aria-hidden="true" className="size-4 shrink-0 text-[#744354] sm:size-5" />
      </span>
    </a>
  );
}

/**
 * Reference: editorial creator-recruitment layout, not commercial claims
 * from Skence. Always keep the live intake status as source of truth.
 */
export function AffiliateEditorialHero({
  recruitmentStatus,
}: {
  recruitmentStatus: RecruitmentStatus;
}) {
  const isOpen = recruitmentStatus === "open";
  const galleryRef = useRef<HTMLDivElement | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoNext, setCanGoNext] = useState(false);
  const [visibleProduct, setVisibleProduct] = useState(1);

  const updateGallery = useCallback(() => {
    const gallery = galleryRef.current;
    if (!gallery) return;
    const overflow = gallery.scrollWidth > gallery.clientWidth + 2;
    const maxScroll = Math.max(0, gallery.scrollWidth - gallery.clientWidth);
    const atEnd = gallery.scrollLeft >= maxScroll - 3;
    setCanGoBack(overflow && gallery.scrollLeft > 3);
    setCanGoNext(overflow && !atEnd);
    const first = gallery.querySelector<HTMLElement>('[data-testid="affiliate-c61-catalog-link"]');
    const step = (first?.getBoundingClientRect().width ?? gallery.clientWidth * 0.68) + 12;
    const position =
      atEnd && overflow
        ? products.length
        : Math.min(products.length, 1 + Math.round(gallery.scrollLeft / Math.max(step, 1)));
    setVisibleProduct(Math.max(1, position));
  }, []);

  useEffect(() => {
    const gallery = galleryRef.current;
    if (!gallery) return;
    updateGallery();
    const frame = window.requestAnimationFrame(updateGallery);
    const observer =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(updateGallery) : null;
    observer?.observe(gallery);
    gallery.querySelectorAll('[data-testid="affiliate-c61-catalog-link"]').forEach((item) => {
      observer?.observe(item);
    });
    window.addEventListener("resize", updateGallery);
    window.addEventListener("load", updateGallery);
    return () => {
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("resize", updateGallery);
      window.removeEventListener("load", updateGallery);
    };
  }, [updateGallery]);

  function moveGallery(direction: -1 | 1) {
    const gallery = galleryRef.current;
    if (!gallery) return;
    const first = gallery.querySelector<HTMLElement>('[data-testid="affiliate-c61-catalog-link"]');
    const step = (first?.getBoundingClientRect().width ?? gallery.clientWidth * 0.68) + 12;
    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    gallery.scrollBy({ left: direction * step, behavior: reduceMotion ? "instant" : "smooth" });
  }

  return (
    <section
      data-testid="vonix-affiliate-hero"
      aria-labelledby="vonix-affiliate-title"
      className="overflow-hidden border-b border-[#e7d8d2] bg-[#fcf7f2] px-5 py-8 sm:py-14 lg:py-16"
    >
      <div className="mx-auto grid max-w-7xl min-w-0 items-center gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,.98fr)] lg:gap-12 xl:gap-16">
        <div className="min-w-0 lg:py-5">
          <p className="inline-flex items-center gap-2 text-xs font-semibold text-[#7b4355]">
            <Sparkles aria-hidden="true" className="size-4" />
            Inscrição gratuita · seleção individual
          </p>
          <p className="mt-4 text-sm font-semibold text-[#764254]">
            Vonix Hair · Programa de afiliadas
          </p>
          <h1
            id="vonix-affiliate-title"
            className="mt-3 max-w-2xl font-display text-[clamp(2.55rem,4.2vw,4.35rem)] leading-[1.11] tracking-tight text-[#412936]"
          >
            Seu jeito de <span className="italic text-[#87465c]">criar.</span>
            <span className="mt-1 block">Nossa paixão por cabelos.</span>
          </h1>
          <p className="mt-4 max-w-xl text-base leading-[1.75] text-[#5e4650] sm:text-lg">
            Sua criatividade e o universo dos cabelos podem se encontrar. Apresente seu perfil à
            Vonix Hair e descubra como funciona a seleção para uma possível parceria.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Button
              asChild
              className="h-auto min-h-12 whitespace-normal rounded-lg px-6 py-3 text-sm"
            >
              <a href="#inscricao">
                {isOpen ? "Quero ser afiliada Vonix" : "Conhecer a inscrição"}
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </a>
            </Button>
            <Button asChild variant="link" className="h-auto min-h-11 whitespace-normal">
              <a href="#ganhos">
                Conhecer as condições
                <ArrowDownRight aria-hidden="true" className="size-4" />
              </a>
            </Button>
            <AffiliateProgramShare />
          </div>
          <ul
            className="mt-6 flex flex-wrap gap-x-5 gap-y-3 text-xs font-medium text-[#553d47]"
            aria-label="Informações da candidatura"
          >
            {["8% sobre vendas após aprovação", "Sem estoque próprio", "Inscrição gratuita"].map(
              (statement) => (
                <li key={statement} className="inline-flex items-start gap-2">
                  <Check aria-hidden="true" className="mt-px size-4 shrink-0 text-[#7f4256]" />
                  {statement}
                </li>
              ),
            )}
          </ul>
          <div
            role="status"
            className="mt-5 inline-flex max-w-lg flex-wrap items-center gap-2 rounded-lg border border-[#e5d2cf] bg-white px-4 py-3 text-xs font-semibold leading-5 text-[#523740]"
          >
            <span
              aria-hidden="true"
              className={
                "size-2.5 shrink-0 rounded-full " +
                (isOpen
                  ? "bg-emerald-600"
                  : recruitmentStatus === "loading"
                    ? "bg-amber-600"
                    : "bg-[#7e4053]")
              }
            />
            {isOpen
              ? "Candidaturas abertas para análise"
              : recruitmentStatus === "loading"
                ? "Consultando disponibilidade de inscrição"
                : recruitmentStatus === "limited"
                  ? "Inscrição temporariamente limitada nesta conexão"
                  : recruitmentStatus === "unavailable"
                    ? "Não foi possível consultar a disponibilidade das inscrições"
                    : "Conheça o formulário enquanto as inscrições estão em preparação"}
          </div>
          <p className="mt-3 max-w-lg text-xs leading-[1.7] text-[#65515a]">
            A candidatura não garante aprovação, benefícios ou vínculo comercial. Não exige estoque
            nem compra de produtos para se candidatar.{" "}
            <a
              href="#candidatura-etapas"
              className="font-semibold text-[#754153] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              Entenda as três etapas da candidatura
            </a>
          </p>
        </div>

        <figure
          data-testid="affiliate-c61-hero-catalog"
          className="mx-auto w-full max-w-[540px] min-w-0 lg:max-w-none lg:pl-2"
          aria-label="Vitrine de produtos reais do catálogo Vonix Hair"
        >
          <div
            data-testid="affiliate-c89-hair-editorial"
            className="mb-5 min-w-0 overflow-hidden rounded-[1.5rem] border border-[#e1cfcb] bg-gradient-to-r from-[#eee0d9] via-[#f9eee8] to-[#fffaf6] shadow-[0_12px_32px_rgba(69,35,50,.07)]"
          >
            <div className="grid grid-cols-[7.75rem_minmax(0,1fr)] items-stretch sm:grid-cols-[11.5rem_minmax(0,1fr)]">
              <div className="relative min-h-[8.25rem] overflow-hidden bg-[#d8b8a8] sm:min-h-[10.75rem]">
                <img
                  src="/images/categorias/cachos.jpg"
                  alt="Fotografia editorial de cabelos da categoria Cachos do catálogo Vonix Hair; não identifica uma afiliada"
                  width={480}
                  height={480}
                  loading="eager"
                  decoding="async"
                  className="absolute inset-0 h-full w-full object-cover"
                />
              </div>
              <div className="flex min-w-0 flex-col justify-center px-3.5 py-3.5 sm:px-6 sm:py-5">
                <p className="text-[9px] font-bold uppercase leading-snug tracking-[.11em] text-[#865267] sm:text-[11px]">
                  Inspiração capilar · Acervo Vonix
                </p>
                <h2 className="mt-1.5 font-display text-lg leading-snug text-[#573342] sm:mt-2 sm:text-2xl">
                  Movimento, textura e cuidado.
                </h2>
                <p className="mt-2 text-[10px] leading-[1.45] text-[#705663] sm:text-xs sm:leading-5">
                  Imagem editorial da loja. Não retrata afiliada nem comprova parceria.
                </p>
              </div>
            </div>
          </div>
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <p className="font-display text-xl text-[#5d3546] sm:text-2xl">
              Conheça produtos e inspirações Vonix
            </p>
            <a
              href="/loja"
              className="inline-flex min-h-11 items-center gap-1 text-xs font-semibold text-[#764355] underline underline-offset-4 focus-visible:outline-2"
            >
              Ver catálogo <ArrowUpRight aria-hidden="true" className="size-4" />
            </a>
          </div>
          <div
            data-testid="vonix-c83-gallery-toolbar"
            className="mb-3 flex min-w-0 items-center justify-between gap-3 lg:hidden"
          >
            <p
              data-testid="vonix-c73-gallery-swipe-hint"
              className="min-w-0 text-xs font-semibold leading-snug text-[#765260] lg:hidden"
            >
              Deslize para explorar os produtos <span aria-hidden="true">→</span>
            </p>
            <div
              role="group"
              aria-label="Navegação dos produtos Vonix Hair"
              className="flex shrink-0 items-center gap-2"
            >
              <span
                data-testid="vonix-c83-gallery-position"
                aria-live="polite"
                className="min-w-9 text-center text-xs font-bold tabular-nums text-[#704455]"
              >
                {visibleProduct} / {products.length}
              </span>
              <button
                type="button"
                data-testid="vonix-c83-gallery-back"
                aria-label="Ver produtos anteriores"
                disabled={!canGoBack}
                onClick={() => moveGallery(-1)}
                className="grid size-11 place-items-center rounded-full border border-[#cbaeb9] bg-white text-[#6e3e50] transition-colors hover:bg-[#f8e8ec] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#784254] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ArrowLeft aria-hidden="true" className="size-5" />
              </button>
              <button
                type="button"
                data-testid="vonix-c83-gallery-next"
                aria-label="Ver próximos produtos"
                disabled={!canGoNext}
                onClick={() => moveGallery(1)}
                className="grid size-11 place-items-center rounded-full border border-[#cbaeb9] bg-white text-[#6e3e50] transition-colors hover:bg-[#f8e8ec] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#784254] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ArrowRight aria-hidden="true" className="size-5" />
              </button>
            </div>
          </div>
          <div
            ref={galleryRef}
            onScroll={updateGallery}
            role="region"
            tabIndex={0}
            aria-label="Vitrine de três produtos reais Vonix Hair, deslize horizontalmente para explorar no celular"
            data-testid="vonix-c73-hero-products-region"
            className="-mx-5 flex min-w-0 snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-5 pb-3 scroll-px-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#754153] sm:mx-0 sm:px-0 lg:grid lg:grid-cols-[1.03fr_.97fr] lg:grid-rows-2 lg:gap-4 lg:overflow-visible lg:pb-0"
          >
            <CatalogCard item={products[0]} featured />
            <CatalogCard item={products[1]} />
            <CatalogCard item={products[2]} />
          </div>
          <figcaption className="mt-4 text-xs leading-relaxed text-[#6d5660]">
            Fotos reais dos produtos à venda na loja oficial. Não são imagens de afiliadas,
            campanhas com criadoras ou prova de resultados.{" "}
            <a
              href="#conheca-a-vonix"
              className="font-semibold text-[#764355] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#784254]"
            >
              Conhecer a marca por trás da seleção
            </a>
          </figcaption>
          {officialProductReviewCount > 0 && (
            <a
              href="#avaliacoes-rapidas"
              data-testid="vonix-c78-real-review-cta"
              className="group mt-4 flex min-h-16 items-center gap-3 rounded-2xl border border-[#e1c9c9] bg-white px-4 py-3 text-left text-[#593344] shadow-[0_8px_22px_rgba(78,43,54,.06)] transition-colors hover:bg-[#fff8f6] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#754153]"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-[#f3e3e1] text-[#854b5f]">
                <Images aria-hidden="true" className="size-6" />
              </span>
              <span className="min-w-0 flex-1">
                <strong className="block text-sm font-bold leading-snug">
                  {officialProductReviewCount} avaliações de clientes no catálogo Vonix
                </strong>
                <span className="mt-1 block text-xs leading-snug text-[#795e69]">
                  São {officialProductVideoReviewCount} vídeos e{" "}
                  {officialProductReviewCount - officialProductVideoReviewCount} foto de clientes —
                  não são depoimentos de afiliadas.
                </span>
              </span>
              <ArrowUpRight
                aria-hidden="true"
                className="size-5 shrink-0 text-[#854b5f] transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
              />
            </a>
          )}
        </figure>
      </div>
    </section>
  );
}
