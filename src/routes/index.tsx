import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Atom, FlaskConical, ShowerHead, Sparkles } from "lucide-react";
import { ReviewCard, reviews } from "@/components/reviews";
import { FaqSection } from "@/components/faq";
import { FAQ_LOJA } from "@/lib/faq";
import { ProvasEmVideo } from "@/components/provas-em-video";
import { ComentariosInstagram } from "@/components/comentarios-instagram";
import { Grid, Shell } from "@/components/site";
import { SITE_URL, bySales, forAudience, homeBestSellers, products, useAudience } from "@/lib/store";
import { HomeGiftBanner } from "@/components/home-gift-banner";

/** Faixa de valores da marca que passa devagar embaixo do banner (ícone de traço + frase curta). Não repete frete, parcelamento nem Pix. */
const MARCA = [
  { Icon: Sparkles, text: "Resultado de salão" },
  { Icon: FlaskConical, text: "Fórmulas inovadoras" },
  { Icon: Atom, text: "Alta tecnologia" },
  { Icon: ShowerHead, text: "Rotina capilar" },
];
function FaixaMarca() {
  return (
    <section aria-label="Diferenciais da Vonix Hair" data-testid="home-faixa-marca" className="mt-3 overflow-hidden bg-[#faf6f1] py-6">
      <div className="flex w-max animate-marquee items-center gap-16 whitespace-nowrap hover:[animation-play-state:paused] motion-reduce:animate-none">
        {[...MARCA, ...MARCA, ...MARCA, ...MARCA, ...MARCA, ...MARCA].map(({ Icon, text }, k) => (
          <span key={k} aria-hidden={k >= MARCA.length} className="flex items-center gap-3.5 text-[1.05rem] font-bold">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-[#e3c07a]/70 bg-white text-[#7a5a2e] shadow-[0_6px_16px_-10px_rgba(122,90,46,0.6)]">
              <Icon className="h-7 w-7" strokeWidth={1.4} aria-hidden="true" />
            </span>
            {text}
          </span>
        ))}
      </div>
    </section>
  );
}

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vonix Hair — Cosméticos Capilares Profissionais" },
      { name: "description", content: "Progressivas, botox, máscaras e kits Vonix Hair. Até 6x sem juros e frete grátis em todos os produtos." },
      { property: "og:title", content: "Vonix Hair — Cosméticos Capilares Profissionais" },
      { property: "og:description", content: "Até 6x sem juros e frete grátis em todos os produtos." },
      { property: "og:url", content: SITE_URL },
      { property: "og:image", content: `${SITE_URL}/og-vonix.jpg` },
      { name: "twitter:image", content: `${SITE_URL}/og-vonix.jpg` },
    ],
    links: [{ rel: "canonical", href: SITE_URL }],
  }),
  component: Home,
});

function Title({ a, b, to }: { a: string; b: string; to?: Record<string, string> }) {
  return (
    <div className="mb-8 flex items-end justify-between">
      <h2 className="[&_em]:not-italic">
        {a} <em>{b}</em>
      </h2>
      {to && (
        <Link to="/loja" search={to} className="flex items-center gap-1 border-b border-foreground py-2 text-small uppercase">
          Ver todos <ArrowRight className="h-3 w-3" />
        </Link>
      )}
    </div>
  );
}

function Home() {
  const { audience } = useAudience();
  // Ordem do curso: o que mais vende primeiro e nenhuma vitrine repete o que já apareceu em cima.
  const bestSellers = homeBestSellers(audience);
  const seen = new Set(bestSellers.map((p) => p.slug));
  const take = <T extends { slug: string }>(list: T[], max?: number) => {
    const out = list.filter((p) => !seen.has(p.slug)).slice(0, max);
    out.forEach((p) => seen.add(p.slug));
    return out;
  };
  const kits = take(forAudience(bySales(products.filter((p) => p.category === "kits")), audience));
  const hidratacao = take(forAudience(bySales(products.filter((p) => p.category === "hidratacao")), audience));
  const lavatorio = take(forAudience(bySales(products.filter((p) => p.category === "lavatorio")), audience));
  const avulsos = take(bySales(products.filter((p) => p.category === "avulsos")), 12);
  const finalizadores = take(forAudience(bySales(products.filter((p) => p.category === "finalizadores")), audience));
  return (
    <Shell>
      <h1 className="sr-only">Vonix Hair — Cosméticos Capilares Profissionais</h1>
      <div className="container-site pt-5">
        <HomeGiftBanner />
      </div>

      <FaixaMarca />

      {/* 1) O que mais vende, logo abaixo da oferta principal */}
      <section className="mt-12 bg-[#091413] py-10 text-white [&_a.border-foreground]:border-white [&_h2]:text-white" data-testid="home-vitrine-escura">
        <div className="container-site">
          <Title a="Mais" b="Desejados" to={{ secao: "mais-vendidos" }} />
          <Grid carousel items={bestSellers} />
        </div>
      </section>

      {/* O que o cabelo precisa hoje: atalhos por necessidade */}
      <section className="container-site mt-14" data-testid="home-necessidades" aria-label="O que seu cabelo precisa hoje?">
        <h2 className="mb-8 text-center">O que seu cabelo precisa hoje?</h2>
        <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] md:grid md:grid-cols-6 md:gap-6 md:overflow-visible [&::-webkit-scrollbar]:hidden">
          {(
            [
              ["Hidratação", "hidratacao"],
              ["Reconstrução", "reconstrucao"],
              ["Controle de Frizz", "frizz"],
              ["Definição de Cachos", "cachos"],
              ["Cabelos com Química", "quimica"],
              ["Nutrição", "nutricao"],
            ] as const
          ).map(([n, img]) => (
            <Link key={n} to="/loja" search={{ necessidades: n }} className="group flex w-[132px] shrink-0 flex-col items-center gap-3 text-center md:w-auto">
              <span className="block aspect-square w-[132px] overflow-hidden rounded-full bg-muted md:w-full md:max-w-[168px]">
                <img src={`/images/categorias/${img}.jpg`} alt="" width={336} height={336} loading="lazy" decoding="async" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              </span>
              <span className="text-body leading-snug">{n}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 2) Kits: a rotina completa aumenta o valor do pedido */}
      {kits.length > 0 && (
        <section className="container-site mt-16" data-testid="home-kits">
          <Title a="Rotina Completa em" b="Kits" to={{ tiposProduto: "Kits" }} />
          <p className="-mt-4 mb-4 text-body text-muted-foreground">Todos os passos do cuidado em um só pedido. Leve 2 e ganhe 12% OFF, leve 3 e ganhe 15% OFF.</p>
          <Grid carousel items={kits} />
        </section>
      )}

      {/* 3) Hidratação */}
      {hidratacao.length > 0 && (
        <section className="container-site mt-16" data-testid="home-hidratacao">
          <Title a="Linha de" b="Hidratação" to={{ categoria: "hidratacao" }} />
          <Grid carousel items={hidratacao} />
        </section>
      )}

      {/* 4) Lavatório: shampoos e preparação */}
      {lavatorio.length > 0 && (
        <section className="container-site mt-16" data-testid="home-lavatorio">
          <Title a="Lavatório e" b="Shampoos" to={{ categoria: "lavatorio" }} />
          <Grid carousel items={lavatorio} />
        </section>
      )}

      {/* 5) Quem quer só um item leva só um item (e completa o carrinho até o frete grátis) */}
      {avulsos.length > 0 && (
        <section className="container-site mt-16" data-testid="home-avulsos">
          <Title a="Avulsos dos" b="Kits" to={{ tiposProduto: "Avulsos" }} />
          <p className="-mt-4 mb-4 text-body text-muted-foreground">Unidades dos kits vendidas separadas. Leve 2 e ganhe 12% OFF, leve 3 e ganhe 15% OFF. Acima de R$ 150,00 em produtos o frete é grátis.</p>
          <Grid carousel items={avulsos} />
          <div className="mt-6 text-center">
            <Link to="/loja" className="inline-flex items-center gap-2 rounded-full border border-foreground px-6 py-2.5 text-body">
              Ver todos os produtos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      )}

      {/* 6) Finalizadores */}
      {finalizadores.length > 0 && (
        <section className="container-site mt-16" data-testid="home-finalizadores">
          <Title a="Linha de" b="Finalizadores" to={{ categoria: "finalizadores" }} />
          <Grid carousel items={finalizadores} />
        </section>
      )}

      {/* 7) Prova social num bloco só: vídeos, depoimentos e comentários escritos */}
      <section className="container-site mt-20" data-testid="home-prova-social">
        <Title a="Quem usa" b="Aprova" to={{ q: "botox vonix" }} />
        <p className="-mt-4 mb-4 text-body text-muted-foreground">Veja quem usa os produtos da Vonix Hair. Toque para assistir.</p>
        <ProvasEmVideo all seed="home" max={16} />
        <h3 className="mb-3 mt-10 font-display text-h2">Resultados que falam por si</h3>
        <p className="mb-4 text-body text-muted-foreground">Depoimentos reais de cabeleireiras que usam o Botox Vonix.</p>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {reviews.map((r) => <ReviewCard key={r.author + r.date} r={r} />)}
        </div>
        <div data-testid="home-comentarios">
          <ComentariosInstagram max={10} />
        </div>
      </section>

      {/* 8) Oferta de quantidade e convite de afiliadas, logo antes do rodapé */}
      <section className="container-site mt-20">
        <div className="relative overflow-hidden rounded-2xl">
          <div aria-hidden className="h-72 w-full" style={{ background: "radial-gradient(90% 120% at 15% 10%, oklch(0.66 0.13 82) 0%, oklch(0.4 0.08 70) 45%, oklch(0.2 0.02 60) 100%)" }} />
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-foreground/40 text-center text-background">
            <span className="text-body tracking-[0.3em]">LEVE MAIS E ECONOMIZE</span>
            <h3 className="font-display text-h1">Ofertas Vonix Hair</h3>
            <p className="mt-2 text-body">Leve 2 unidades e ganhe 12% OFF. Leve 3 e ganhe 15% OFF, em qualquer produto.</p>
            <Link to="/loja" className="mt-5 rounded-full bg-background px-6 py-2.5 text-body text-foreground">Ver ofertas</Link>
          </div>
        </div>
      </section>

      <FaqSection items={FAQ_LOJA} />

    </Shell>
  );
}
