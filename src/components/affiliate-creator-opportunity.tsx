import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AffiliateApplyLink } from "@/components/affiliate-apply-link";
import { illustrativeEarnings } from "@/lib/affiliate-marketing-math";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function AffiliateEarningsSimulator({ compact = false }: { compact?: boolean }) {
  const [sales, setSales] = useState(2500);
  const [includeBonus, setIncludeBonus] = useState(false);
  const [salesText, setSalesText] = useState("2500");
  function chooseSales(value: number) {
    const bounded = illustrativeEarnings(value).sales;
    setSales(bounded);
    setSalesText(String(bounded));
  }
  const result = illustrativeEarnings(sales);
  const bonus = includeBonus ? result.bonus : 0;
  const total = includeBonus ? result.total : result.commission;
  return (
    <div
      className={compact ? "py-5 sm:py-7" : "mt-12 border-y border-border py-8 sm:py-12"}
      role="group"
      aria-labelledby="simulator-title"
    >
      <div className="grid min-w-0 gap-8 lg:grid-cols-2 lg:gap-16">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase text-primary">Exemplo, não projeção</p>
          <h3 id="simulator-title" className="mt-3 font-display text-3xl">
            Simulador ilustrativo
          </h3>
          <p
            id="simulator-conditions"
            className="mt-4 text-sm leading-relaxed text-muted-foreground"
          >
            Não é promessa de ganhos. Depende de aprovação, vendas confirmadas e pagas e regras de
            elegibilidade do bônus. O exemplo não verifica sua elegibilidade.
          </p>
          <label
            htmlFor="illustrative-sales"
            className="mt-7 flex flex-wrap items-center justify-between gap-2 text-sm font-semibold"
          >
            Valor hipotético de vendas{" "}
            <span className="text-lg tabular-nums">{money.format(result.sales)}</span>
          </label>
          <input
            id="illustrative-sales"
            type="range"
            min={0}
            max={20000}
            step={1}
            value={sales}
            aria-describedby="simulator-conditions"
            aria-valuetext={money.format(result.sales)}
            onChange={(event) => chooseSales(Number(event.target.value))}
            className="mt-3 min-h-11 w-full cursor-pointer accent-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          />
          <div className="flex justify-between text-xs text-muted-foreground" aria-hidden="true">
            <span>R$ 0</span>
            <span>R$ 20.000</span>
          </div>
          <label
            htmlFor="illustrative-exact-sales"
            className="mt-4 block text-xs font-semibold text-primary"
          >
            Ou informe um valor em reais (de 0 a 20 mil)
          </label>
          <div className="mt-2 flex items-center gap-2 rounded-xl border border-[#dfccd0] bg-white px-3 text-sm text-primary">
            <span aria-hidden="true" className="font-bold">
              R$
            </span>
            <input
              id="illustrative-exact-sales"
              type="text"
              inputMode="numeric"
              value={salesText}
              maxLength={5}
              onChange={(event) => {
                const value = event.target.value;
                if (!/^\d{0,5}$/.test(value)) return;
                if (value === "") {
                  setSalesText("");
                  setSales(0);
                } else chooseSales(Number(value));
              }}
              onBlur={() => setSalesText(String(sales))}
              aria-describedby="simulator-conditions"
              className="min-h-12 w-full min-w-0 bg-transparent font-semibold tabular-nums outline-none focus-visible:outline-2"
            />
          </div>
          <div
            role="group"
            aria-label="Cenários ilustrativos de vendas"
            className="mt-4 flex flex-wrap gap-2"
          >
            {[2500, 5000, 10000, 20000].map((amount) => (
              <button
                key={amount}
                type="button"
                aria-pressed={sales === amount}
                onClick={() => chooseSales(amount)}
                className={
                  "min-h-11 rounded-full border px-3 py-2 text-xs font-bold focus-visible:outline-2 focus-visible:outline-offset-2 " +
                  (sales === amount
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-primary")
                }
              >
                {money.format(amount)}
              </button>
            ))}
          </div>
          <label className="mt-5 flex min-h-12 cursor-pointer items-start gap-3 rounded-xl border border-[#dfccd0] bg-[#fff8f6] p-3 text-sm text-[#573443]">
            <input
              type="checkbox"
              checked={includeBonus}
              onChange={(event) => setIncludeBonus(event.target.checked)}
              className="mt-0.5 size-5 shrink-0 accent-primary focus-visible:outline-2 focus-visible:outline-offset-2"
              aria-describedby="simulator-bonus-condition"
            />
            <span>
              <span className="block font-bold">Simular bônus, se elegível</span>
              <span id="simulator-bonus-condition" className="mt-1 block text-xs leading-relaxed">
                Apenas hipótese de cálculo. O bônus depende das regras e metas aplicáveis.
              </span>
            </span>
          </label>
        </div>
        <output
          htmlFor="illustrative-sales"
          aria-live="polite"
          aria-atomic="true"
          className="block min-w-0 self-center rounded-[1.5rem] border border-[#e5cfd2] bg-gradient-to-br from-[#fffaf7] to-[#f5e8e8] p-5 shadow-[0_12px_32px_rgba(73,39,52,.07)] sm:p-7"
        >
          <dl className="space-y-5">
            <div className="flex flex-wrap justify-between gap-2">
              <dt>Comissão ilustrativa · 8%</dt>
              <dd data-testid="illustrative-commission" className="font-semibold tabular-nums">
                {money.format(result.commission)}
              </dd>
            </div>
            <div className="flex flex-wrap justify-between gap-2">
              <dt>Bônus condicional* {includeBonus ? "(simulado)" : "(não incluído)"}</dt>
              <dd data-testid="illustrative-bonus" className="font-semibold tabular-nums">
                {money.format(bonus)}
              </dd>
            </div>
            <div className="flex flex-wrap justify-between gap-2 border-t border-border pt-5">
              <dt className="self-center font-semibold">
                {includeBonus ? "Soma demonstrativa*" : "Somente comissão"}
              </dt>
              <dd
                data-testid="illustrative-total"
                className="font-display text-4xl text-primary tabular-nums"
              >
                {money.format(total)}
              </dd>
            </div>
          </dl>
          <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
            *A simulação pode incluir R$ 500 por cada R$ 10.000 apenas como hipótese de bônus
            elegível. Sem elegibilidade, o bônus não se aplica. Não representa pagamento, saldo ou
            previsão de renda.
          </p>
        </output>
      </div>
    </div>
  );
}

const editorialBenefits = [
  {
    title: "Crie com a sua identidade",
    detail: "Rotinas, fotos e resenhas sinceras: explore formatos que combinem com você.",
    image: "/images/categorias/nutricao.jpg",
    href: "#formatos",
    action: "Ver ideias de conteúdo",
  },
  {
    title: "Conheça o que pode divulgar",
    detail: "Explore os produtos Vonix e suas orientações oficiais antes de criar.",
    image: "/images/products/combo-sos-reconstrutor-480.webp",
    href: "/produto/combo-sos-reconstrutor",
    action: "Conhecer o combo",
  },
  {
    title: "Uma parceria sem estoque",
    detail: "Após aprovação, você divulga pelo seu link; a Vonix cuida da venda e entrega.",
    image: "/images/products/combo-fio-de-luz-completo-480.webp",
    href: "#ganhos",
    action: "Entender as condições",
  },
] as const;

export function AffiliateCreatorOpportunity({
  recruitmentOpen = false,
  onSafePreview,
  sourceLinked = false,
}: {
  recruitmentOpen?: boolean;
  onSafePreview?: (() => void) | undefined;
  sourceLinked?: boolean;
}) {
  if (sourceLinked) {
    return (
      <section
        data-testid="affiliate-c90-creator-bridge"
        aria-labelledby="creator-stories-title"
        className="border-y border-[#e7d8d3] bg-[#fcf7f3] px-5 py-9 sm:py-14"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid items-end gap-3 lg:grid-cols-[1fr_.8fr] lg:gap-10">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[.12em] text-[#875166]">
                Seu espaço no universo Vonix
              </p>
              <h2
                id="creator-stories-title"
                className="mt-2 font-display text-3xl leading-tight text-[#4d3040] sm:text-4xl"
              >
                Cabelo, criatividade e{" "}
                <span className="italic text-[#874f62]">novas possibilidades.</span>
              </h2>
            </div>
            <p className="max-w-lg text-sm leading-relaxed text-[#705b65]">
              Você não precisa de portfólio pronto para se candidatar. Conheça a marca e descubra
              como seu estilo de conteúdo pode se conectar ao cuidado com os fios.
            </p>
          </div>
          <div
            data-testid="affiliate-c163-editorial-benefits"
            className="mt-5 grid min-w-0 gap-3 sm:grid-cols-3 sm:gap-4"
          >
            {editorialBenefits.map((item, index) => (
              <article
                key={item.title}
                className="group grid min-w-0 grid-cols-[5.5rem_minmax(0,1fr)] overflow-hidden rounded-2xl border border-[#e2cfd0] bg-white shadow-[0_8px_24px_rgba(76,41,54,.06)] sm:grid-cols-1"
              >
                <div className="relative min-h-28 overflow-hidden bg-[#f0e0df] sm:aspect-[16/10]">
                  <img
                    src={item.image}
                    alt=""
                    width={480}
                    height={480}
                    loading="lazy"
                    decoding="async"
                    className={
                      "absolute inset-0 size-full " +
                      (index === 0 ? "object-cover" : "object-contain p-2 sm:p-4")
                    }
                  />
                  <span
                    aria-hidden="true"
                    className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-1 text-[10px] font-bold text-[#754258]"
                  >
                    0{index + 1}
                  </span>
                </div>
                <div className="flex min-w-0 flex-col p-3 sm:p-5">
                  <h3 className="font-display text-lg leading-tight text-[#523342] sm:text-xl">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-[#705b65] sm:text-sm">
                    {item.detail}
                  </p>
                  <a
                    href={item.href}
                    target={item.href.startsWith("/produto/") ? "_blank" : undefined}
                    rel={item.href.startsWith("/produto/") ? "noopener noreferrer" : undefined}
                    className="mt-auto inline-flex min-h-11 items-center gap-1.5 pt-2 text-xs font-bold text-[#754258] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    {item.action} <ArrowUpRight aria-hidden="true" className="size-3.5 shrink-0" />
                  </a>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-[#f2e5e4] p-4 sm:p-5">
            <p className="max-w-xl text-xs leading-relaxed text-[#705b65] sm:text-sm">
              Imagens do catálogo oficial, não depoimentos de afiliadas. Candidatura gratuita e
              sujeita à análise individual, sem garantia de parceria ou remuneração.
            </p>
            <Button asChild className="h-auto min-h-12 rounded-xl px-5 py-3 text-sm font-bold">
              <AffiliateApplyLink recruitmentOpen={recruitmentOpen} onSafePreview={onSafePreview}>
                {recruitmentOpen ? "Preencher candidatura" : "Abrir prévia segura"}
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </AffiliateApplyLink>
            </Button>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section
      data-testid="affiliate-c90-creator-bridge"
      aria-labelledby="creator-stories-title"
      className="border-y border-[#e7d8d3] bg-[#fcf7f3] px-5 py-9 sm:py-12"
    >
      <div className="mx-auto grid max-w-7xl min-w-0 items-center gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-12">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[.12em] text-[#875166]">
            Conheça antes de compartilhar
          </p>
          <h2
            id="creator-stories-title"
            className="mt-3 max-w-3xl font-display text-3xl leading-tight text-[#4d3040] sm:text-4xl"
          >
            Explore a marca.{" "}
            <span className="italic text-[#874f62]">Depois apresente seu perfil.</span>
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-[1.75] text-[#705b65]">
            Conheça os produtos no catálogo oficial e suas orientações de uso. Não é preciso criar
            um portfólio para se candidatar, mas o envio não garante aprovação, parceria, produtos
            gratuitos ou remuneração.
          </p>
        </div>
        <nav
          aria-label="Próximos passos para conhecer a Vonix Hair"
          className="flex w-full flex-wrap items-center gap-3 lg:w-auto lg:max-w-[24rem] lg:justify-end"
        >
          <a
            href="/loja"
            className="inline-flex min-h-12 items-center gap-2 rounded-xl border border-[#d9bec3] bg-white px-5 py-3 text-sm font-bold text-[#754258] transition-colors hover:bg-[#f7e8eb] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#754258]"
          >
            Conhecer o catálogo na loja oficial
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </a>
          <Button asChild className="h-auto min-h-12 rounded-xl px-5 py-3 text-sm font-bold">
            <AffiliateApplyLink recruitmentOpen={recruitmentOpen} onSafePreview={onSafePreview}>
              {recruitmentOpen ? "Preencher candidatura" : "Abrir prévia segura"}
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </AffiliateApplyLink>
          </Button>
        </nav>
      </div>
    </section>
  );
}
