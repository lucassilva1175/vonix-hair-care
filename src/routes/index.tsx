import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { FaqSection } from "@/components/faq";
import { FAQ_LOJA } from "@/lib/faq";
import { ProvaSocial } from "@/components/prova-social";
import { QuemUsa } from "@/components/quem-usa";
import { Grid, Shell } from "@/components/site";
import { SITE_URL, bySales, forAudience, homeBestSellers, products, useAudience, vitrine } from "@/lib/store";
import { HomeGiftBanner } from "@/components/home-gift-banner";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vonix Hair — Cosméticos Capilares Profissionais" },
      { name: "description", content: "Site feito para cabeleireiras e donas de salão: progressivas, botox e combos profissionais. Fio de Luz, a mais vendida em São Paulo e Minas Gerais. Até 6x sem juros e frete grátis." },
      { property: "og:title", content: "Vonix Hair — Cosméticos Capilares Profissionais" },
      { property: "og:description", content: "Para donas de salão de São Paulo e Minas Gerais. Até 6x sem juros e frete grátis." },
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
  // Combos: começam pelos de Fio de Luz, depois os de Botox Vonix, depois o resto (mais vendidos).
  const ordemCombo = (p: { slug: string }) => (p.slug.startsWith("combo-fio-de-luz") ? 0 : p.slug.startsWith("combo-botox-vonix") ? 1 : 2);
  const kits = take(forAudience(bySales(vitrine.filter((p) => p.category === "kits")), audience)).sort((a, b) => ordemCombo(a) - ordemCombo(b));
  const hidratacao = take(forAudience(bySales(vitrine.filter((p) => p.category === "hidratacao")), audience));
  const lavatorio = take(forAudience(bySales(vitrine.filter((p) => p.category === "lavatorio")), audience));
  const avulsos = take(bySales(vitrine.filter((p) => p.category === "avulsos")), 12);
  const PROVAS_HOME = ["progressiva-fio-de-luz", "botox-vonix", "progressiva-lift-em-gel", "progressiva-vonix-special-matizadora", "botox-vonix-matizador", "shampoo-fio-de-luz-anti-residuo"];
  const provas = PROVAS_HOME.map((slug) => products.find((p) => p.slug === slug)).filter((p): p is NonNullable<typeof p> => !!p);
  const finalizadores = take(forAudience(bySales(vitrine.filter((p) => p.category === "finalizadores")), audience));
  return (
    <Shell>
      <h1 className="sr-only">Vonix Hair — Cosméticos Capilares Profissionais</h1>
      <div className="container-site pt-5">
        <HomeGiftBanner />
      </div>


      {/* Monte o seu kit: progressiva + shampoo anti-resíduo + o que ela quiser */}
      <section className="container-site mt-10" data-testid="home-monte-kit" aria-label="Monte o seu kit de progressiva">
        <div className="flex flex-col items-start gap-4 rounded-2xl border border-border bg-[#faf6f1] p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div className="max-w-xl">
            <h2 className="font-display text-h2">Monte o kit de progressiva do seu salão</h2>
            <p className="mt-2 text-body text-muted-foreground">Escolha a progressiva, o shampoo anti-resíduo, o defrizante e o perfume, na quantidade que o seu salão precisa. Tudo em um só pedido, com frete grátis.</p>
          </div>
          <Link to="/monte-seu-combo" search={{ cat: "quimica" }} className="inline-flex h-12 shrink-0 items-center gap-2 rounded-full bg-foreground px-6 font-medium text-background">
            Montar meu kit <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* 1) O que mais vende, logo abaixo da oferta principal */}
      <section className="mt-12 bg-[#091413] py-10 text-white [&_a.border-foreground]:border-white [&_h2]:text-white" data-testid="home-vitrine-escura">
        <div className="container-site">
          <Title a="Mais pedidos pelas" b="donas de salão" to={{ secao: "mais-vendidos" }} />
          <Grid carousel items={bestSellers} />
        </div>
      </section>


      {/* 2) Kits: a rotina completa aumenta o valor do pedido */}
      {kits.length > 0 && (
        <section className="container-site mt-16" data-testid="home-kits">
          <Title a="Combos para o" b="seu salão" to={{ tiposProduto: "Kits" }} />
          <p className="-mt-4 mb-4 text-body text-muted-foreground">Progressiva já com o shampoo anti-resíduo certo: você compra uma vez e atende sem improviso. Leve 2 e ganhe 12% OFF, leve 3 e ganhe 15% OFF.</p>
          <Link to="/monte-seu-combo" className="mb-4 inline-flex h-11 items-center rounded-full border border-foreground px-5 text-small font-semibold">Monte o seu próprio combo</Link>
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

      {/* 7) Prova social em texto: uma por produto, para donas de salão */}
      <section className="container-site mt-20" data-testid="home-prova-social">
        <Title a="As donas de salão" b="aprovam" to={{ secao: "mais-vendidos" }} />
        <p className="-mt-4 mb-6 text-body text-muted-foreground">O que cada produto resolve no seu salão, com a quantidade de cada um e os números reais de venda da Vonix.</p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {provas.map((p) => <ProvaSocial key={p.slug} p={p} link />)}
        </div>
        <QuemUsa className="mt-12" />
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
