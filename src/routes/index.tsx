import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { ReviewCard, reviews } from "@/components/reviews";
import { Benefits, Grid, Shell, SRC } from "@/components/site";
import { BEST_SELLERS, MAX_DISCOUNT, brl, discountPct, forAudience, getProduct, products, useAudience } from "@/lib/store";
import masks from "@/data/banner-masks.json";

type Mask = { box: number[]; bg: string };
function OfferMask({ m, slug, cls }: { m: Mask; slug: string; cls: string }) {
  const p = getProduct(slug)!;
  const v = p.variants[0];
  const off = discountPct(p.compareBase, v.price);
  const [x, y, w, h] = m.box as [number, number, number, number];
  return (
    <div aria-hidden className={`banner-mask absolute flex-col items-center justify-center ${cls}`} style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, height: `${h}%`, background: m.bg }}>
      {off > 0 && <span className="bg-foreground px-[0.8em] py-[0.15em] text-[0.9em] tracking-[0.25em] text-background">{off}% OFF</span>}
      {p.compareBase && <span className="mt-[0.3em] text-[0.8em] line-through opacity-70">De {brl(p.compareBase)}</span>}
      <span className="font-display text-[2.2em] font-semibold leading-none">Por {brl(v.price)}</span>
    </div>
  );
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vonix Hair — Cosméticos Capilares Profissionais" },
      { name: "description", content: "Progressivas, botox, máscaras e combos Vonix Hair. Até 6x sem juros e frete grátis acima de R$ 150,00." },
      { property: "og:title", content: "Vonix Hair — Cosméticos Capilares Profissionais" },
      { property: "og:description", content: "Até 6x sem juros e frete grátis acima de R$ 150,00." },
    ],
  }),
  component: Home,
});

const BANNERS = [
  "kit-banana-e-mel", "kit-cachos", "kit-coco-nutri", "kit-cronograma-capilar",
  "kit-desmaia", "kit-whey-protein", "kit-matizador-shampoo-e-mascara",
] as const;
const NEEDS = [
  ["Hidratação", "Mais maciez e brilho", "cat-hidratacao-B3HDbjAo", "Hidratação"],
  ["Reconstrução", "Fios mais fortes", "cat-reconstrucao--AvyZZnd", "Reconstrução"],
  ["Controle de Frizz", "Cabelos mais alinhados", "cat-frizz-DkfsGSS5", "Controle de Frizz"],
  ["Cachos", "Definição e movimento", "cat-cachos-BaMWSeI5", "Definição de Cachos"],
  ["Com Química", "Cuidado e hidratação", "cat-loiros-DMned0Ju", "Cabelos com Química"],
  ["Nutrição", "Fios nutridos e macios", "cat-nutricao-DPiiOsHs", "Nutrição"],
] as const;

function Title({ a, b, to }: { a: string; b: string; to?: Record<string, string> }) {
  return (
    <div className="mb-8 flex items-end justify-between">
      <h2 className="text-2xl font-bold tracking-tight md:text-3xl [&_em]:not-italic">
        {a} <em>{b}</em>
      </h2>
      {to && (
        <Link to="/loja" search={to} className="flex items-center gap-1 border-b border-foreground text-xs uppercase">
          Ver todos <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}

function Home() {
  const [i, setI] = useState(0);
  const { audience } = useAudience();
  useEffect(() => {
    const t = setInterval(() => setI((x) => (x + 1) % BANNERS.length), 6000);
    return () => clearInterval(t);
  }, []);
  return (
    <Shell>
      <section className="container-site pt-5">
        <div className="relative overflow-hidden rounded-2xl">
          <Link to="/produto/$slug" params={{ slug: BANNERS[i]! }} className="banner-wrap relative block aspect-[1080/1350] md:aspect-[1850/700]">
            <picture>
              <source media="(min-width: 768px)" srcSet={`${SRC}/images/home/black-friday-2026/desktop/${i + 1}.webp`} />
              <img src={`${SRC}/images/home/black-friday-2026/mobile/${i + 1}.webp`} alt={`Banner ${i + 1} de 7: ${getProduct(BANNERS[i]!)?.name}`} width={1080} height={1350} fetchPriority={i === 0 ? "high" : "auto"} className="h-full w-full object-cover" />
            </picture>
            <OfferMask m={masks[i]!.desktop} slug={BANNERS[i]!} cls="hidden md:flex" />
            <OfferMask m={masks[i]!.mobile} slug={BANNERS[i]!} cls="flex md:hidden" />
          </Link>
          <button aria-label="Anterior" onClick={() => setI((i + 6) % 7)} className="absolute left-4 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-background">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button aria-label="Próximo" onClick={() => setI((i + 1) % 7)} className="absolute right-4 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-background">
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
            {BANNERS.map((_, k) => (
              <button key={k} aria-label={`Banner ${k + 1}`} onClick={() => setI(k)} className={`h-3 w-3 rounded-full border border-foreground ${k === i ? "bg-foreground" : "bg-background/70"}`} />
            ))}
          </div>
        </div>
      </section>

      <Benefits />

      <section className="container-site mt-12">
        <Title a="Mais" b="Desejados" to={{ secao: "mais-vendidos" }} />
        <Grid carousel items={forAudience(BEST_SELLERS.map((s) => getProduct(s)!), audience)} />
      </section>

      <section className="container-site mt-20 text-center">
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl [&_em]:not-italic">Encontre o Tratamento <em>Ideal</em></h2>
        <p className="mt-2 text-muted-foreground">Escolha a necessidade do seu cabelo e veja os produtos indicados.</p>
        <div className="mt-6 grid grid-cols-3 gap-x-3 gap-y-5 md:grid-cols-6">
          {NEEDS.map(([t, s, img, q]) => (
            <Link key={t} to="/loja" search={{ uso: "pessoal", necessidades: q }} className="group">
              <img src={`${SRC}/assets/${img}.webp`} alt={t} width={130} height={130} loading="lazy" className="mx-auto aspect-square w-full max-w-[84px] rounded-full object-cover transition-transform group-hover:scale-105 md:max-w-[120px]" />
              <div className="mt-2 text-sm font-medium">{t}</div>
              <div className="text-[11px] leading-tight text-muted-foreground">{s}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container-site mt-20">
        <Title a="Todos os" b="Produtos" to={{}} />
        <Grid carousel items={forAudience(products, audience).slice(0, 8)} />
      </section>

      <section className="container-site mt-20">
        <Title a="Resultados que" b="Falam por Si" to={{ q: "botox vonix" }} />
        <p className="-mt-4 mb-6 text-sm text-muted-foreground">Depoimentos reais de cabeleireiras que usam o Botox Vonix.</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {reviews.map((r) => <ReviewCard key={r.author + r.date} r={r} />)}
        </div>
      </section>

      <section className="container-site mt-20">
        <div className="relative overflow-hidden rounded-2xl">
          <img src={`${SRC}/assets/banner-cupom-bg-Bs3RLSaf.jpg`} alt="" className="h-72 w-full object-cover" />
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-foreground/40 text-center text-background">
            <span className="text-sm tracking-[0.3em]">ATÉ {MAX_DISCOUNT}% OFF</span>
            <h3 className="font-display text-5xl">Esquenta Black Friday</h3>
            <p className="mt-2 text-sm">Aproveite os preços de Black Friday nos seus favoritos da Vonix Hair.</p>
            <Link to="/loja" className="mt-5 rounded-full bg-background px-6 py-2.5 text-sm text-foreground">Ver ofertas</Link>
          </div>
        </div>
      </section>
    </Shell>
  );
}
