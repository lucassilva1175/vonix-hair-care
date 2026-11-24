import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, ChevronDown, Film, Images } from "lucide-react";
import { AffiliateApplyLink } from "@/components/affiliate-apply-link";
import { getProduct } from "@/lib/store";

/**
 * First-party catalog products only. Deliberately excludes third-party public
 * Instagram comments: those are not approved for use in an affiliate campaign.
 */
const showcase = [
  {
    slug: "sos-reconstrutor-capilar",
    image: "/images/products/sos-reconstrutor-capilar-480.webp",
    packagingImage: "/images/sacolinhas/sos-reconstrutor-capilar.webp",
    idea: "Explore o cuidado de reconstrução",
    alt: "Foto do produto SOS Reconstrutor Capilar no catálogo Vonix Hair",
    Icon: Images,
  },
  {
    slug: "kit-desmaia",
    image: "/images/products/kit-desmaia-480.webp",
    packagingImage: "/images/sacolinhas/kit-desmaia.webp",
    idea: "Mostre uma rotina com shampoo e máscara",
    alt: "Foto oficial do Kit Desmaia no catálogo Vonix Hair",
    Icon: Film,
  },
  {
    slug: "finalizador-kera-plus",
    image: "/images/products/finalizador-kera-plus-480.webp",
    packagingImage: "/images/sacolinhas/finalizador-kera-plus.webp",
    idea: "Mostre como você incluiria um finalizador na rotina",
    alt: "Foto oficial do Kera+ Finalizador no catálogo Vonix Hair",
    Icon: Images,
  },
] as const;

const catalogCards = showcase.flatMap((item) => {
  const product = getProduct(item.slug);
  return product ? [{ ...item, product }] : [];
});

export function AffiliateProductDiscoveryStrip({
  recruitmentOpen = false,
  onSafePreview,
}: { recruitmentOpen?: boolean; onSafePreview?: (() => void) | undefined } = {}) {
  const [catalogExpanded, setCatalogExpanded] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [packagingView, setPackagingView] = useState(false);
  const [unavailablePackaging, setUnavailablePackaging] = useState<string[]>([]);
  const listRef = useRef<HTMLUListElement>(null);

  function moveCatalog(index: number) {
    const list = listRef.current;
    const card = list?.children.item(index);
    if (!list || !(card instanceof HTMLElement)) return;
    list.scrollTo({
      left: list.scrollLeft + card.getBoundingClientRect().left - list.getBoundingClientRect().left,
      behavior: "auto",
    });
    setActiveIndex(index);
  }

  function syncCatalog() {
    const list = listRef.current;
    if (!list || !list.clientWidth) return;
    // The last card can be fully visible before reaching its nominal snap offset.
    if (list.scrollLeft > 0 && list.scrollLeft + list.clientWidth >= list.scrollWidth - 2) {
      setActiveIndex(catalogCards.length - 1);
      return;
    }
    let nearest = 0;
    let distance = Infinity;
    Array.from(list.children).forEach((card, index) => {
      if (!(card instanceof HTMLElement)) return;
      const delta = Math.abs(card.getBoundingClientRect().left - list.getBoundingClientRect().left);
      if (delta < distance) {
        distance = delta;
        nearest = index;
      }
    });
    setActiveIndex(nearest);
  }
  if (catalogCards.length === 0) return null;
  return (
    <section
      data-testid="affiliate-c132-catalog"
      aria-labelledby="affiliate-c132-title"
      className="border-b border-[#e8d4d3] bg-[#fffaf7] px-4 py-5 text-[#4e3140] sm:px-5 sm:py-9"
    >
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="max-w-2xl">
            <p className="text-[10px] font-bold uppercase tracking-[.12em] text-[#854f64]">
              Vonix Hair · Acervo oficial
            </p>
            <h2
              id="affiliate-c132-title"
              className="mt-1.5 font-display text-[clamp(1.5rem,4vw,2.1rem)] leading-tight tracking-tight"
            >
              Ideias para apresentar o catálogo
            </h2>
            <p className="mt-1.5 text-xs leading-[1.65] text-[#765c67] sm:text-sm">
              Exploração opcional: produtos reais e ideias de conteúdo para inspirar seu perfil. A
              candidatura não depende de abrir estes cartões.
            </p>
          </div>
          <span className="inline-flex min-h-8 items-center rounded-full border border-[#ddc4c9] bg-white px-3 text-[11px] font-bold text-[#814b60]">
            {catalogCards.length}{" "}
            {catalogCards.length === 1 ? "produto do catálogo" : "produtos do catálogo"}
          </span>
        </div>
        <button
          type="button"
          data-testid="affiliate-c135-catalog-toggle"
          aria-controls="affiliate-c132-products"
          aria-expanded={catalogExpanded}
          onClick={() => setCatalogExpanded((open) => !open)}
          className="mt-4 flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-[#d8bfc5] bg-white px-4 py-2 text-left text-xs font-bold text-[#754457] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#754457] sm:hidden"
        >
          <span>
            {catalogExpanded ? "Ocultar produtos" : `Explorar os ${catalogCards.length} produtos`}
          </span>
          <ChevronDown
            aria-hidden="true"
            className={
              "size-4 shrink-0 transition-transform motion-reduce:transition-none " +
              (catalogExpanded ? "rotate-180" : "")
            }
          />
        </button>
        <div
          data-testid="affiliate-c142-catalog-controls"
          className={
            "mt-3 items-center justify-between gap-2 sm:hidden " +
            (catalogExpanded ? "flex" : "hidden")
          }
        >
          <button
            type="button"
            aria-label="Produto anterior"
            aria-controls="affiliate-c132-products"
            disabled={activeIndex === 0}
            onClick={() => moveCatalog(activeIndex - 1)}
            className="grid size-11 shrink-0 place-items-center rounded-full border border-[#d8bfc5] bg-white text-[#754457] disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <ArrowLeft aria-hidden="true" className="size-4" />
          </button>
          <p role="status" className="text-center text-xs font-bold text-[#754457]">
            {activeIndex + 1} de {catalogCards.length} produtos
          </p>
          <button
            type="button"
            aria-label="Próximo produto"
            aria-controls="affiliate-c132-products"
            disabled={activeIndex === catalogCards.length - 1}
            onClick={() => moveCatalog(activeIndex + 1)}
            className="grid size-11 shrink-0 place-items-center rounded-full border border-[#d8bfc5] bg-white text-[#754457] disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <ArrowRight aria-hidden="true" className="size-4" />
          </button>
        </div>
        <div
          className={
            "mt-3 flex-wrap items-center justify-between gap-2 rounded-xl border border-[#e5d0d0] bg-white px-3 py-2 sm:flex " +
            (catalogExpanded ? "flex" : "hidden")
          }
        >
          <div className="min-w-0">
            <p className="text-xs font-bold text-[#754457]">Visual do catálogo</p>
            <p className="text-[11px] leading-snug text-[#806570]">
              Explore a foto do produto ou a apresentação da embalagem.
            </p>
          </div>
          <button
            type="button"
            aria-pressed={packagingView}
            aria-controls="affiliate-c132-products"
            data-testid="affiliate-c149-packaging-toggle"
            onClick={() => setPackagingView((value) => !value)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#d8bfc5] px-4 py-2 text-xs font-bold text-[#754457] focus-visible:outline-2 focus-visible:outline-offset-2"
          >
            <Images aria-hidden="true" className="size-4" />
            {packagingView ? "Ver fotos dos produtos" : "Ver apresentação das embalagens"}
          </button>
        </div>
        {packagingView && (
          <p role="status" className="mt-2 text-[11px] leading-relaxed text-[#806570]">
            Imagens de apresentação do catálogo oficial. Não representam brindes, kits de afiliadas
            ou garantia de recebimento de produtos.
          </p>
        )}
        <ul
          id="affiliate-c132-products"
          ref={listRef}
          onScroll={syncCatalog}
          data-testid="affiliate-c132-products"
          aria-label="Ideias editoriais com produtos do catálogo Vonix"
          className={
            "mt-3 snap-x snap-mandatory gap-3 overflow-x-auto pb-2 sm:mt-5 sm:grid sm:grid-cols-3 sm:overflow-visible sm:pb-0 " +
            (catalogExpanded ? "flex" : "hidden")
          }
        >
          {catalogCards.map(({ slug, product, image, packagingImage, idea, alt, Icon }) => (
            <li
              key={slug}
              data-testid="affiliate-c132-product-card"
              className="flex w-[84vw] max-w-[18.5rem] min-w-0 shrink-0 snap-start items-start gap-3 rounded-[1.35rem] border border-[#e5d0d0] bg-white p-3 shadow-[0_8px_25px_rgba(83,42,58,.06)] sm:w-auto sm:max-w-none sm:shrink sm:flex-col sm:gap-2"
            >
              <span className="grid size-28 shrink-0 place-items-center overflow-hidden rounded-xl border border-[#eddddc] bg-[#fbf1ee] sm:h-56 sm:w-full">
                <img
                  src={
                    packagingView && !unavailablePackaging.includes(slug) ? packagingImage : image
                  }
                  alt={
                    packagingView && !unavailablePackaging.includes(slug)
                      ? "Imagem de apresentação da embalagem de " +
                        product.name +
                        " no catálogo Vonix Hair"
                      : alt
                  }
                  onError={() => {
                    if (packagingView && !unavailablePackaging.includes(slug)) {
                      setUnavailablePackaging((previous) =>
                        previous.includes(slug) ? previous : [...previous, slug],
                      );
                    }
                  }}
                  width={480}
                  height={480}
                  loading="lazy"
                  decoding="async"
                  className={
                    "size-full object-contain " +
                    (packagingView && !unavailablePackaging.includes(slug) ? "" : "p-1")
                  }
                />
              </span>
              <div className="flex min-w-0 flex-1 flex-col">
                <p className="text-[10px] font-bold uppercase tracking-[.07em] text-[#88566a]">
                  {product.categoryLabel}
                </p>
                <h3 className="mt-1 text-sm font-bold leading-tight text-[#573542]">
                  {product.name}
                </h3>
                <p className="mt-1.5 text-xs leading-[1.5] text-[#765d68]">{product.short}</p>
                <p className="mt-2 flex items-start gap-1.5 rounded-lg bg-[#f8efeb] p-2 text-xs font-semibold leading-snug text-[#754457]">
                  <Icon aria-hidden="true" className="size-4 shrink-0" />
                  <span>
                    <span className="block text-[10px] font-bold uppercase tracking-wide text-[#88566a]">
                      Ideia de conteúdo
                    </span>
                    {idea}
                  </span>
                </p>
                <a
                  href={"/produto/" + slug}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex min-h-11 items-center gap-1 self-start text-xs font-bold text-[#78485c] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  Ver produto
                  <ArrowUpRight aria-hidden="true" className="size-4" />
                </a>
              </div>
            </li>
          ))}
        </ul>
        <p
          className={
            "mt-2 text-[11px] leading-[1.55] text-[#806570] sm:block " +
            (catalogExpanded ? "block" : "hidden")
          }
        >
          São exemplos editoriais do catálogo, não trabalhos de afiliadas, avaliações de clientes ou
          promessa de produtos gratuitos. A inscrição é gratuita e depende de análise.
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e5d0d0] bg-white px-4 py-3 sm:mt-5">
          <p className="max-w-md text-xs leading-relaxed text-[#765c67]">
            Já imaginou seu próximo conteúdo? Apresente seu perfil sem precisar comprar produtos.
          </p>
          <AffiliateApplyLink
            data-testid="affiliate-c142-catalog-apply"
            recruitmentOpen={recruitmentOpen}
            onSafePreview={onSafePreview}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#713f52] px-5 py-2 text-xs font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            {recruitmentOpen ? "Quero me candidatar" : "Ver prévia da inscrição"}
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </AffiliateApplyLink>
        </div>
      </div>
    </section>
  );
}
