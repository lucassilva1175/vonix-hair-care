import { ArrowDownRight, ArrowUpRight, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AffiliateProgramShare } from "@/components/affiliate-program-share";

export type RecruitmentStatus = "loading" | "open" | "limited" | "closed";

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
        "group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#e2d4d1] bg-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#6f3b4d] " +
        (featured ? "row-span-2" : "")
      }
      aria-label={item.name + " — conferir produto no catálogo oficial"}
    >
      <picture
        className={
          "flex min-h-0 flex-1 items-center justify-center " +
          item.background +
          (featured ? " aspect-[4/5] sm:aspect-auto" : " aspect-[5/4]")
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

  return (
    <section
      data-testid="vonix-affiliate-hero"
      aria-labelledby="vonix-affiliate-title"
      className="overflow-hidden border-b border-[#e7d8d2] bg-[#fcf7f2] px-5 py-11 sm:py-16 lg:py-20"
    >
      <div className="mx-auto grid max-w-7xl min-w-0 items-center gap-11 lg:grid-cols-[minmax(0,1fr)_minmax(0,.98fr)] lg:gap-14 xl:gap-20">
        <div className="min-w-0 lg:py-5">
          <p className="inline-flex items-center gap-2 text-xs font-semibold text-[#7b4355]">
            <Sparkles aria-hidden="true" className="size-4" />
            Inscrição gratuita · seleção individual
          </p>
          <p className="mt-6 text-sm font-semibold text-[#764254]">
            Vonix Hair · Programa de afiliadas
          </p>
          <h1
            id="vonix-affiliate-title"
            className="mt-3 max-w-2xl font-display text-[clamp(2.55rem,4.2vw,4.35rem)] leading-[1.11] tracking-tight text-[#412936]"
          >
            Seu jeito de <span className="italic text-[#87465c]">criar.</span>
            <span className="mt-1 block">Nossa paixão por cabelos.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base leading-[1.75] text-[#5e4650] sm:text-lg">
            Sua criatividade e o universo dos cabelos podem se encontrar. Apresente seu perfil à
            Vonix Hair e descubra como funciona a seleção para uma possível parceria.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
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
            className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-xs font-medium text-[#553d47]"
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
            className="mt-7 inline-flex max-w-lg flex-wrap items-center gap-2 rounded-lg border border-[#e5d2cf] bg-white px-4 py-3 text-xs font-semibold leading-5 text-[#523740]"
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
                  : "Conheça o formulário enquanto as inscrições estão em preparação"}
          </div>
          <p className="mt-5 max-w-lg text-xs leading-[1.7] text-[#65515a]">
            A candidatura não garante aprovação, benefícios ou vínculo comercial. Não exige estoque
            nem compra de produtos para se candidatar.
          </p>
        </div>

        <figure
          data-testid="affiliate-c61-hero-catalog"
          className="mx-auto w-full max-w-[540px] min-w-0 lg:max-w-none lg:pl-2"
          aria-label="Vitrine de produtos reais do catálogo Vonix Hair"
        >
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <p className="font-display text-xl text-[#5d3546] sm:text-2xl">
              Conheça o que você poderia apresentar
            </p>
            <a
              href="/loja"
              className="inline-flex min-h-11 items-center gap-1 text-xs font-semibold text-[#764355] underline underline-offset-4 focus-visible:outline-2"
            >
              Ver catálogo <ArrowUpRight aria-hidden="true" className="size-4" />
            </a>
          </div>
          <div className="grid min-w-0 grid-cols-[1.03fr_.97fr] grid-rows-2 gap-3 sm:gap-4">
            <CatalogCard item={products[0]} featured />
            <CatalogCard item={products[1]} />
            <CatalogCard item={products[2]} />
          </div>
          <figcaption className="mt-4 text-xs leading-relaxed text-[#6d5660]">
            Fotos reais dos produtos à venda na loja oficial. Não são imagens de afiliadas,
            campanhas com criadoras ou prova de resultados.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
