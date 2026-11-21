import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { illustrativeEarnings } from "@/lib/affiliate-marketing-math";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function AffiliateEarningsSimulator({ compact = false }: { compact?: boolean }) {
  const [sales, setSales] = useState(2500);
  const result = illustrativeEarnings(sales);
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
            step={500}
            value={sales}
            aria-describedby="simulator-conditions"
            aria-valuetext={money.format(result.sales)}
            onChange={(event) => setSales(Number(event.target.value))}
            className="mt-3 min-h-11 w-full cursor-pointer accent-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          />
          <div className="flex justify-between text-xs text-muted-foreground" aria-hidden="true">
            <span>R$ 0</span>
            <span>R$ 20.000</span>
          </div>
        </div>
        <output
          htmlFor="illustrative-sales"
          aria-live="polite"
          aria-atomic="true"
          className="block min-w-0 self-center"
        >
          <dl className="space-y-5">
            <div className="flex flex-wrap justify-between gap-2">
              <dt>Comissão ilustrativa · 8%</dt>
              <dd data-testid="illustrative-commission" className="font-semibold tabular-nums">
                {money.format(result.commission)}
              </dd>
            </div>
            <div className="flex flex-wrap justify-between gap-2">
              <dt>Bônus condicional*</dt>
              <dd data-testid="illustrative-bonus" className="font-semibold tabular-nums">
                {money.format(result.bonus)}
              </dd>
            </div>
            <div className="flex flex-wrap justify-between gap-2 border-t border-border pt-5">
              <dt className="self-center font-semibold">Soma demonstrativa*</dt>
              <dd
                data-testid="illustrative-total"
                className="font-display text-4xl text-primary tabular-nums"
              >
                {money.format(result.total)}
              </dd>
            </div>
          </dl>
          <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
            *Inclui R$ 500 por cada R$ 10.000 apenas como hipótese de bônus elegível. Sem
            elegibilidade, o bônus não se aplica. Não representa pagamento, saldo ou previsão de
            renda.
          </p>
        </output>
      </div>
    </div>
  );
}

export function AffiliateCreatorOpportunity({
  recruitmentOpen = false,
}: {
  recruitmentOpen?: boolean;
}) {
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
            Conhecer o catálogo
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </a>
          <Button asChild className="h-auto min-h-12 rounded-xl px-5 py-3 text-sm font-bold">
            <a href="#inscricao">
              {recruitmentOpen ? "Preencher candidatura" : "Conhecer a candidatura"}
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </a>
          </Button>
        </nav>
      </div>
    </section>
  );
}
