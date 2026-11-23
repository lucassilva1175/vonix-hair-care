import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Images,
  Sparkles,
} from "lucide-react";
import {
  officialProductReviewCount,
  officialProductVideoReviewCount,
} from "@/components/affiliate-verified-review-preview";
import { Button } from "@/components/ui/button";
import { AffiliateProgramShare } from "@/components/affiliate-program-share";
import { trackAffiliateFunnel } from "@/lib/affiliate-funnel";

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
          loading="lazy"
          fetchPriority="low"
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
  onSafePreview,
}: {
  recruitmentStatus: RecruitmentStatus;
  onSafePreview?: (() => void) | undefined;
}) {
  const isOpen = recruitmentStatus === "open";
  const galleryRef = useRef<HTMLDivElement | null>(null);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoNext, setCanGoNext] = useState(false);
  const [visibleProduct, setVisibleProduct] = useState(1);
  const [mobileCatalogExpanded, setMobileCatalogExpanded] = useState(false);

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
      className="overflow-hidden border-b border-[#e7d8d2] bg-[#fcf7f2] px-5 py-5 sm:py-8 lg:py-10"
    >
      <div className="mx-auto grid max-w-7xl min-w-0 items-center gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,.98fr)] lg:gap-12 xl:gap-16">
        <div className="flex min-w-0 flex-col lg:py-5">
          <div
            data-testid="affiliate-c89-hair-editorial"
            className="order-1 relative isolate min-h-[16rem] min-w-0 overflow-hidden rounded-[1.6rem] border border-[#e1cfcb] bg-[#a7847f] shadow-[0_20px_45px_rgba(69,35,50,.18)] sm:min-h-[19rem] lg:min-h-[25rem] lg:rounded-[1.8rem]"
          >
            <img
              src="/images/categorias/cachos.jpg"
              alt="Fotografia editorial de cabelos da categoria Cachos do catálogo Vonix Hair; não identifica uma afiliada"
              width={480}
              height={480}
              loading="eager"
              fetchPriority="high"
              decoding="async"
              data-testid="affiliate-c94-editorial-photo"
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-[#21151d]/95 via-[#2a1a25]/50 to-[#21151d]/20"
            />
            <div className="relative flex min-h-[16rem] flex-col justify-between gap-3 px-4 py-4 text-white sm:min-h-[19rem] sm:gap-4 sm:p-6 lg:min-h-[25rem] lg:gap-5 lg:p-7">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/55 bg-[#21151d]/55 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[.09em] text-white backdrop-blur-sm sm:px-3.5 sm:py-2">
                  Inscrição gratuita · seleção individual
                </span>
                <span className="rounded-full border border-white/55 bg-[#21151d]/45 px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur-sm sm:px-3.5 sm:py-2">
                  Acervo oficial Vonix Hair
                </span>
              </div>
              <div className="max-w-[28rem] lg:max-w-[34rem]">
                <p className="mb-2 text-xs font-bold uppercase tracking-[.13em] text-white/90">
                  Vonix Hair · Programa de afiliadas
                </p>
                <h1
                  id="vonix-affiliate-title"
                  style={{ color: "#fff" }}
                  className="font-display text-[clamp(2.1rem,5vw,4.25rem)] leading-[1.05] tracking-tight text-white sm:text-[clamp(2.5rem,5vw,4.25rem)] lg:text-[clamp(2.75rem,3.7vw,3.6rem)]"
                >
                  Seu jeito de <span className="italic text-[#ffdae8]">criar.</span>
                  <span className="mt-1 block">Nossa paixão por cabelos.</span>
                </h1>
                <p className="mt-3 text-sm font-semibold text-white">
                  Movimento, textura e cuidado.
                </p>
                <p className="mt-2 text-[11px] leading-[1.5] text-white/90">
                  Foto editorial do catálogo da loja. Não retrata afiliada nem comprova parceria.
                </p>
              </div>
            </div>
          </div>
          <p className="order-4 mt-2 max-w-xl text-sm leading-[1.55] text-[#5e4650] sm:mt-3 sm:text-base lg:order-2 lg:mt-2 lg:leading-[1.55]">
            Cria conteúdo sobre cabelos ou quer começar? Apresente seu Instagram à Vonix Hair. A
            candidatura é gratuita, sem compra obrigatória, e passa por análise individual.
          </p>
          <div
            role="status"
            aria-live="polite"
            data-testid="affiliate-c94-intake-status"
            className="order-2 mt-3 mb-0 inline-flex max-w-lg flex-wrap items-center gap-2 self-start rounded-lg border border-[#e5d2cf] bg-white px-3 py-2 text-xs font-semibold leading-5 text-[#523740] sm:px-4 sm:py-3 lg:order-3 lg:mt-3 lg:mb-0"
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
          <div className="order-3 mt-2 flex flex-wrap items-center gap-2 lg:order-4 lg:mt-2 lg:gap-3">
            <Button
              asChild
              className="h-auto min-h-12 w-full justify-center whitespace-normal rounded-xl bg-[#713c51] px-6 py-3 text-sm font-bold text-white shadow-[0_10px_22px_rgba(88,41,60,.20)] transition-colors hover:bg-[#5e3145] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#713c51] sm:w-auto"
            >
              <a
                href="#inscricao"
                onClick={() => {
                  trackAffiliateFunnel("affiliate_application_interest");
                  if (!isOpen) onSafePreview?.();
                }}
              >
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
            data-testid="affiliate-c118-hero-benefits"
            aria-label="Condições e informações da candidatura"
            className="order-5 mt-3 grid min-w-0 grid-cols-2 gap-2 text-[#553d47] sm:flex sm:flex-wrap sm:items-center sm:gap-2.5 lg:mt-6"
          >
            <li
              data-testid="affiliate-c118-commission"
              className="col-span-2 flex min-w-0 items-center gap-3 rounded-xl border border-[#804a5d] bg-gradient-to-r from-[#713d53] to-[#5d3449] px-3 py-2.5 text-white shadow-[0_8px_20px_rgba(71,35,49,.12)] sm:col-span-1 sm:px-4"
            >
              <strong className="shrink-0 font-display text-[2rem] leading-none tabular-nums">
                8%
              </strong>{" "}
              <span className="min-w-0 text-[11px] font-semibold leading-[1.45] sm:text-xs">
                sobre vendas após aprovação
                <span className="mt-0.5 block text-[10px] font-normal text-[#f8dfe7]">
                  Vendas elegíveis e confirmadas
                </span>
              </span>
            </li>
            {["Sem estoque próprio", "Inscrição gratuita"].map((statement) => (
              <li
                key={statement}
                className="col-span-1 flex min-h-11 min-w-0 items-center justify-center gap-1.5 rounded-xl border border-[#e3ccd0] bg-white px-2 py-2 text-center text-[11px] font-bold leading-tight text-[#704558] shadow-[0_5px_15px_rgba(76,42,54,.045)] sm:px-3 sm:text-xs"
              >
                <Check aria-hidden="true" className="size-4 shrink-0 text-[#80465c]" />
                {statement}
              </li>
            ))}
          </ul>
          <p className="order-6 mt-1.5 max-w-lg text-[11px] leading-[1.5] text-[#65515a] sm:text-xs lg:mt-3 lg:leading-[1.7]">
            A candidatura não garante aprovação, benefícios ou vínculo comercial. Não exige estoque
            nem compra de produtos para se candidatar.{" "}
            {!isOpen && (
              <span className="font-semibold text-[#714458]">
                Ao clicar em “Conhecer a inscrição”, você abre apenas uma prévia segura, sem enviar
                dados.
              </span>
            )}{" "}
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
            data-testid="affiliate-c98-mobile-catalog-summary"
            className="mb-2 rounded-2xl border border-[#e1d1d1] bg-white p-2.5 shadow-[0_8px_24px_rgba(76,41,54,.06)] sm:p-3 lg:hidden"
          >
            <div className="flex min-w-0 items-center gap-3">
              <img
                src="/images/products/botox-vonix.webp"
                alt=""
                aria-hidden="true"
                width={76}
                height={76}
                loading="lazy"
                decoding="async"
                className="size-[3.5rem] shrink-0 rounded-xl bg-[#f1e5e8] object-contain p-1 sm:size-[4.25rem]"
              />
              <button
                type="button"
                data-testid="affiliate-c98-mobile-catalog-toggle"
                aria-expanded={mobileCatalogExpanded}
                aria-controls="affiliate-c98-products-panel"
                onClick={() => setMobileCatalogExpanded((previous) => !previous)}
                className="flex min-h-14 min-w-0 flex-1 items-center justify-between gap-2 rounded-lg py-1 text-left text-[#60394a] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#784254]"
              >
                <span className="min-w-0">
                  <strong className="block text-sm font-bold leading-snug">
                    3 produtos do catálogo Vonix
                  </strong>
                  <span className="mt-1 block text-[11px] leading-snug text-[#775d68]">
                    {mobileCatalogExpanded
                      ? "Recolher vitrine"
                      : "Ver a vitrine de produtos (opcional)"}
                  </span>
                </span>
                <ChevronDown
                  aria-hidden="true"
                  className={
                    "size-5 shrink-0 text-[#784254] transition-transform motion-reduce:transition-none " +
                    (mobileCatalogExpanded ? "rotate-180" : "")
                  }
                />
              </button>
            </div>
            <p className="mt-2 text-[11px] leading-[1.5] text-[#7a626b]">
              Imagens de produtos oficiais, não fotografias de afiliadas ou parcerias.
            </p>
          </div>
          <div
            id="affiliate-c98-products-panel"
            data-testid="affiliate-c98-products-panel"
            className={mobileCatalogExpanded ? "block" : "hidden lg:block"}
          >
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
          </div>
          {officialProductReviewCount > 0 && (
            <a
              href="#avaliacoes-rapidas"
              data-testid="vonix-c78-real-review-cta"
              className="group mt-2 flex min-h-14 items-center gap-2 rounded-2xl border border-[#e1c9c9] bg-white px-3 py-2 text-left text-[#593344] shadow-[0_8px_22px_rgba(78,43,54,.06)] transition-colors hover:bg-[#fff8f6] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#754153] lg:mt-4 lg:min-h-16 lg:gap-3 lg:px-4 lg:py-3"
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
