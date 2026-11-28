import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Minus, Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Shell } from "@/components/site";
import { thumb } from "@/lib/images";
import { brl, lineTotals, pixPrice, useCart, vitrine, type Product } from "@/lib/store";

export const Route = createFileRoute("/monte-seu-combo")({
  head: () => ({
    meta: [
      { title: "Monte seu combo — Vonix Hair" },
      { name: "description", content: "Escolha os produtos que você quer e monte o seu próprio combo em um só pedido." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>): { cat?: string } => (typeof s["cat"] === "string" ? { cat: s["cat"] } : {}),
  component: MonteSeuCombo,
});

const norm = (v: string) => v.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

function MonteSeuCombo() {
  const cart = useCart();
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const inicial = Route.useSearch().cat;
  const [cat, setCat] = useState(inicial ?? "todos");
  const [qtd, setQtd] = useState<Record<string, number>>({});

  /** Só produtos soltos: os combos prontos ficam na loja. */
  const solos = useMemo(() => vitrine.filter((p) => !p.slug.startsWith("combo-") && p.category !== "kits"), []);
  const categorias = useMemo(() => Array.from(new Map(solos.map((p) => [p.category, p.categoryLabel]))), [solos]);
  const lista = solos.filter((p) => (cat === "todos" || p.category === cat) && (!busca || norm(p.name).includes(norm(busca))));

  const escolhidos = solos.filter((p) => (qtd[p.slug] ?? 0) > 0);
  const unidades = escolhidos.reduce((s, p) => s + (qtd[p.slug] ?? 0), 0);
  // Combo montado (2 produtos diferentes ou mais): 5% em cada item de 1 unidade; com 2 ou 3 unidades vale o Leve 2 / Leve 3. O Pix soma mais 5%.
  const comboMontado = escolhidos.length >= 2;
  const ofertaDe = (n: number) => (comboMontado && n === 1 ? ("comp5" as const) : undefined);
  const total = escolhidos.reduce((s, p) => s + lineTotals(p.variants[0].price, qtd[p.slug] ?? 0, ofertaDe(qtd[p.slug] ?? 0), p.slug).net, 0);
  const totalPix = pixPrice(total);

  const mudar = (p: Product, delta: number) => setQtd((q) => ({ ...q, [p.slug]: Math.max(0, (q[p.slug] ?? 0) + delta) }));
  const adicionar = () => {
    for (const p of escolhidos) cart.add(p.slug, p.variants[0].label, qtd[p.slug] ?? 1, ofertaDe(qtd[p.slug] ?? 1));
    void navigate({ to: "/carrinho" });
  };

  return (
    <Shell>
      <div className="container-site pb-32 pt-6 md:pt-10">
        <h1 className="font-display text-h2">Monte seu combo</h1>
        <p className="mt-2 max-w-2xl text-body text-muted-foreground">
          Escolha os produtos que você quer, na quantidade que quiser, e leve tudo em um só pedido. Monte com 2 produtos ou mais e ganhe 5% OFF em cada item, mais 5% no Pix. Frete grátis em SP e MG.
        </p>

        <div className="mt-5 flex flex-col gap-3 md:flex-row md:items-center">
          <label className="relative block md:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar produto"
              aria-label="Buscar produto"
              className="h-11 w-full rounded-full border border-border bg-white pl-9 pr-4 text-body"
            />
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Categorias">
            {[["todos", "Todos"], ...categorias].map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setCat(id!)}
                aria-pressed={cat === id}
                className={`h-10 shrink-0 rounded-full border px-4 text-small font-medium ${cat === id ? "border-foreground bg-foreground text-background" : "border-border bg-white"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3" data-testid="monte-combo-lista">
          {lista.map((p) => {
            const n = qtd[p.slug] ?? 0;
            return (
              <li key={p.slug} className={`flex items-center gap-3 rounded-2xl border bg-card p-3 ${n ? "border-foreground" : "border-border"}`}>
                <img src={thumb(p.images[0]!)} alt={p.name} width={72} height={72} loading="lazy" className="h-[72px] w-[72px] shrink-0 rounded-xl bg-white object-contain" />
                <div className="min-w-0 flex-1">
                  <b className="block text-name font-semibold leading-snug">{p.name}</b>
                  <span className="text-small text-muted-foreground">{p.variants[0].label}</span>
                  <b className="money block text-name">{brl(p.variants[0].price)}</b>
                </div>
                <div className="flex items-center gap-2">
                  <button type="button" onClick={() => mudar(p, -1)} disabled={!n} aria-label={`Tirar ${p.name}`} className="grid h-9 w-9 place-items-center rounded-full border border-border disabled:opacity-40">
                    <Minus className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <span className="w-5 text-center font-semibold" aria-live="polite">{n}</span>
                  <button type="button" onClick={() => mudar(p, 1)} aria-label={`Adicionar ${p.name}`} className="grid h-9 w-9 place-items-center rounded-full bg-foreground text-background">
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              </li>
            );
          })}
          {!lista.length && <li className="text-body text-muted-foreground">Nenhum produto encontrado.</li>}
        </ul>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 backdrop-blur">
        <div className="container-site flex items-center justify-between gap-3 py-3 pr-[84px] md:pr-0">
          <div>
            <b className="money block text-name">{unidades ? brl(totalPix) : "R$ 0,00"}{unidades ? <span className="text-small font-normal"> no Pix</span> : null}</b>
            <span className="text-small text-muted-foreground">{unidades ? `Ou ${brl(total)} no cartão · ${unidades} ${unidades === 1 ? "produto" : "produtos"}${comboMontado ? " · combo com desconto" : " · escolha mais 1 para ganhar o desconto"}` : "Escolha os produtos"}</span>
          </div>
          <button
            type="button"
            onClick={adicionar}
            disabled={!unidades}
            className="h-12 rounded-full bg-foreground px-6 font-medium text-background disabled:opacity-40"
          >
            Adicionar ao carrinho
          </button>
        </div>
      </div>
    </Shell>
  );
}
