import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, Camera, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AffiliateApplyLink } from "@/components/affiliate-apply-link";
import publishedMedia from "@/data/provas-em-video.json";
import { getProduct } from "@/lib/store";

/**
 * Editorial catalogue demonstration, not evidence of participation,
 * earnings, a sponsorship, or customer review verification.
 * Every source and product match is owned by the official product media catalog.
 */
const films = [
  {
    id: "banana-mel",
    slug: "kit-banana-e-mel",
    title: "Kit Banana e Mel",
    tag: "Rotina capilar",
    description: "Uma linha para apresentar ingredientes, embalagens e ideias de rotina.",
  },
  {
    id: "botox-1",
    slug: "botox-vonix",
    title: "Botox Vonix",
    tag: "Universo profissional",
    description: "Conheça o visual de um dos produtos do catálogo profissional.",
  },
  {
    id: "fio-1",
    slug: "progressiva-fio-de-luz",
    title: "Progressiva Fio de Luz",
    tag: "Cuidados e técnicas",
    description: "Explore o universo capilar que inspira conteúdos com responsabilidade.",
  },
  {
    id: "desmaia",
    slug: "kit-desmaia",
    title: "Kit Desmaia Cabelo",
    tag: "Rotina de cuidados",
    description: "Vídeo vinculado à linha Desmaia Cabelo no catálogo da loja.",
  },
  {
    id: "ig-07",
    slug: "kit-monovonix",
    title: "Kit Monovonix",
    tag: "Rotina capilar",
    description:
      "Explore ideias de apresentação da linha Monovonix, com mídia do catálogo oficial.",
  },
  {
    id: "ig-05",
    slug: "kit-cachos",
    title: "Kit Cachos",
    tag: "Cuidados com cachos",
    description: "Vídeo associado à linha de cachos da loja oficial.",
  },
] as const;

const extraFilms = [
  { id: "botox-2", slug: "botox-vonix", title: "Botox Vonix", tag: "Universo profissional" },
  { id: "fio-2", slug: "progressiva-fio-de-luz", title: "Fio de Luz", tag: "Cuidados e técnicas" },
  { id: "fio-3", slug: "progressiva-fio-de-luz", title: "Fio de Luz", tag: "Cuidados e técnicas" },
  { id: "ig-16", slug: "progressiva-fio-de-luz", title: "Fio de Luz", tag: "Cuidados e técnicas" },
  { id: "ig-17", slug: "kit-cachos", title: "Kit Cachos", tag: "Cuidados com cachos" },
  { id: "ig-19", slug: "progressiva-fio-de-luz", title: "Fio de Luz", tag: "Cuidados e técnicas" },
  // ig-26 held for editorial review: sampled frames show multiple product lines.
] as const;

export function AffiliateCatalogInMotion({
  recruitmentOpen,
  onSafePreview,
}: {
  recruitmentOpen: boolean;
  onSafePreview?: (() => void) | undefined;
}) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollBack, setCanScrollBack] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [productFilter, setProductFilter] = useState("all");
  const updateScrollButtons = useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;
    setCanScrollBack(el.scrollLeft > 4);
    setCanScrollNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);
  useEffect(() => {
    updateScrollButtons();
    const el = carouselRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(updateScrollButtons);
    observer.observe(el);
    return () => observer.disconnect();
  }, [updateScrollButtons, expanded, productFilter]);
  const moveCarousel = (direction: -1 | 1) => {
    const el = carouselRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>('[data-testid="vonix-c63-video-card"]');
    const distance = (card?.getBoundingClientRect().width ?? 320) + 16;
    el.scrollBy({
      left: distance * direction,
      behavior: window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches
        ? "instant"
        : "smooth",
    });
  };
  const primaryItems = films.flatMap((film) => {
    const proof = publishedMedia.find(
      (entry) => entry.id === film.id && entry.slugs.includes(film.slug),
    );
    if (!proof || !getProduct(film.slug)) return [];
    return [{ ...film, src: proof.src, poster: proof.poster }];
  });

  const alternateItems = extraFilms.flatMap((film) => {
    const proof = publishedMedia.find(
      (entry) => entry.id === film.id && entry.slugs.includes(film.slug),
    );
    if (!proof || !getProduct(film.slug)) return [];
    return [
      {
        ...film,
        description: "Outro vídeo associado a esta linha no catálogo oficial.",
        src: proof.src,
        poster: proof.poster,
      },
    ];
  });
  const availableItems = expanded ? [...primaryItems, ...alternateItems] : primaryItems;
  const groups = Array.from(new Set(availableItems.map((item) => item.slug))).map((slug) => ({
    slug,
    title: getProduct(slug)?.name ?? slug,
    count: availableItems.filter((item) => item.slug === slug).length,
  }));
  const items =
    expanded && productFilter !== "all"
      ? availableItems.filter((item) => item.slug === productFilter)
      : availableItems;
  function resetCarousel() {
    carouselRef.current?.querySelectorAll("video").forEach((video) => {
      if (!video.paused) video.pause();
    });
    if (carouselRef.current) carouselRef.current.scrollLeft = 0;
  }
  function toggleExpanded() {
    resetCarousel();
    setProductFilter("all");
    setExpanded((value) => !value);
  }
  if (!items.length) return null;
  const countLabel =
    items.length === 6 ? "Seis vídeos" : items.length === 1 ? "Um vídeo" : `${items.length} vídeos`;
  return (
    <section
      id="catalogo-em-video"
      data-testid="vonix-c63-catalog-motion"
      aria-labelledby="vonix-c63-title"
      className="scroll-mt-40 overflow-hidden border-y border-[#e4d4d2] bg-[#faf3ef] px-5 py-16 text-[#4b2d3c] sm:py-24"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid items-end gap-6 lg:grid-cols-[1fr_auto]">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.13em] text-[#835061]">
              <Camera aria-hidden="true" className="size-4" />
              Um olhar sobre a Vonix Hair
            </p>
            <h2
              id="vonix-c63-title"
              className="mt-4 font-display text-4xl leading-tight sm:text-5xl"
            >
              Produtos reais. <span className="italic text-[#91596b]">Ideias que ganham vida.</span>
            </h2>
            <p className="mt-5 text-sm leading-7 text-[#6c555e] sm:text-base">
              {countLabel} do catálogo: deslize ou use as setas para explorar produtos e
              possibilidades de conteúdo. Eles não representam trabalho, ganhos ou participação de
              afiliadas.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <a
              href="/loja"
              aria-label="Explorar a loja oficial"
              className="inline-flex min-h-11 w-fit items-center gap-2 text-sm font-semibold text-[#754153] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              Ver catálogo
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </a>
            <div className="flex gap-2" aria-label="Navegar pelos vídeos do catálogo">
              <button
                type="button"
                disabled={!canScrollBack}
                onClick={() => moveCarousel(-1)}
                aria-label="Ver vídeos anteriores"
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-[#cdb8bf] bg-white text-[#633449] focus-visible:outline-2 focus-visible:outline-offset-4 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowLeft aria-hidden="true" className="size-4" />
              </button>
              <button
                type="button"
                disabled={!canScrollNext}
                onClick={() => moveCarousel(1)}
                aria-label="Ver próximos vídeos"
                className="inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-[#cdb8bf] bg-white text-[#633449] focus-visible:outline-2 focus-visible:outline-offset-4 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ArrowRight aria-hidden="true" className="size-4" />
              </button>
            </div>
          </div>
        </div>
        {expanded && (
          <div className="mt-5 rounded-xl border border-[#dfcfce] bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label
                htmlFor="affiliate-video-product-filter"
                className="text-sm font-bold text-[#633449]"
              >
                Escolha uma linha para explorar
              </label>
              <select
                id="affiliate-video-product-filter"
                data-testid="affiliate-c151-product-filter"
                value={productFilter}
                onChange={(event) => {
                  resetCarousel();
                  setProductFilter(event.target.value);
                }}
                aria-controls="affiliate-video-carousel"
                className="min-h-11 w-full max-w-full rounded-lg border border-[#cdb8bf] bg-white px-3 text-sm text-[#633449] sm:w-auto"
              >
                <option value="all">Todas as linhas ({availableItems.length})</option>
                {groups.map((group) => (
                  <option key={group.slug} value={group.slug}>
                    {group.title} ({group.count})
                  </option>
                ))}
              </select>
            </div>
            <p role="status" aria-live="polite" className="mt-2 text-xs text-[#715962]">
              {items.length} de {availableItems.length} vídeos da seleção.
            </p>
          </div>
        )}
        <div
          id="affiliate-video-carousel"
          ref={carouselRef}
          onScroll={updateScrollButtons}
          role="region"
          tabIndex={0}
          data-testid="vonix-c74-catalog-video-carousel"
          aria-label={countLabel + " de produtos Vonix Hair, deslize ou use as setas para explorar"}
          className="-mx-5 mt-4 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-5 pb-5 scroll-px-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#754153] sm:mx-0 sm:px-0"
        >
          {items.map((item, index) => (
            <article
              key={item.id}
              data-testid="vonix-c63-video-card"
              className="flex w-[82vw] max-w-[20rem] shrink-0 snap-start flex-col overflow-hidden rounded-[1.4rem] border border-[#dfcfce] bg-white shadow-[0_14px_36px_rgba(74,35,55,.06)] sm:w-[44vw] sm:max-w-[22rem] lg:w-[30vw] lg:max-w-[24rem]"
            >
              <div className="relative bg-[#f0e5e0] p-3">
                <span
                  className="absolute left-5 top-5 z-10 rounded-full bg-white/95 px-3 py-1 text-[10px] font-bold text-[#754153] shadow-sm"
                  aria-hidden="true"
                >
                  {String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
                </span>
                <video
                  data-testid="vonix-c63-product-video"
                  controls
                  preload="none"
                  playsInline
                  poster={item.poster}
                  aria-label={"Vídeo do catálogo oficial sobre " + item.title}
                  className="aspect-[4/5] w-full rounded-xl bg-[#32252c] object-contain"
                  onPlay={(event) => {
                    const player = event.currentTarget;
                    carouselRef.current?.querySelectorAll("video").forEach((video) => {
                      if (video !== player && !video.paused) video.pause();
                    });
                  }}
                >
                  <source src={item.src} type="video/mp4" />
                  Seu navegador não reproduz este vídeo.
                </video>
              </div>
              <div className="flex flex-1 flex-col px-5 pb-6 pt-5 sm:px-6">
                <p className="text-[11px] font-bold uppercase tracking-[.1em] text-[#8b5465]">
                  {item.tag}
                </p>
                <h3 className="mt-2 font-display text-2xl leading-snug">{item.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-[#715962]">{item.description}</p>
                <a
                  href={"/produto/" + item.slug}
                  className="mt-5 inline-flex min-h-11 items-center gap-2 border-t border-[#eadcda] pt-3 text-sm font-semibold text-[#784254] underline-offset-4 hover:underline focus-visible:outline-2"
                >
                  Ver produto no site
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </a>
              </div>
            </article>
          ))}
        </div>
        {alternateItems.length > 0 && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#dfcfce] bg-white px-4 py-3">
            <p className="max-w-lg text-xs leading-relaxed text-[#715962]">
              {expanded
                ? "Você está explorando a seleção ampliada de mídias de produtos."
                : "Veja outros ângulos e vídeos das linhas que despertaram seu interesse."}
            </p>
            <button
              type="button"
              aria-expanded={expanded}
              aria-controls="affiliate-video-carousel"
              data-testid="affiliate-c150-extra-videos"
              onClick={toggleExpanded}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#cdb8bf] px-4 py-2 text-xs font-bold text-[#633449] focus-visible:outline-2 focus-visible:outline-offset-2"
            >
              {expanded
                ? "Voltar à seleção inicial"
                : "Explorar mais " + alternateItems.length + " vídeos"}
              <Camera aria-hidden="true" className="size-4" />
            </button>
          </div>
        )}
        <div className="mt-8 flex flex-col items-start justify-between gap-5 rounded-[1.3rem] bg-[#633449] px-6 py-6 text-white sm:flex-row sm:items-center sm:px-8">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-semibold">
              <CheckCircle2 aria-hidden="true" className="size-4" />
              Inscrição sem compra obrigatória
            </p>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#fff1f3]">
              Você pode apresentar seu perfil para análise. Vídeos ilustram o catálogo, não
              comprovam parcerias ou resultados de criadoras.
            </p>
          </div>
          <Button
            asChild
            className="h-auto min-h-12 shrink-0 rounded-lg bg-white px-6 py-3 font-semibold text-[#633449] hover:bg-[#ffedf1]"
          >
            <AffiliateApplyLink recruitmentOpen={recruitmentOpen} onSafePreview={onSafePreview}>
              {recruitmentOpen ? "Quero me candidatar" : "Abrir prévia segura"}
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </AffiliateApplyLink>
          </Button>
        </div>
      </div>
    </section>
  );
}
