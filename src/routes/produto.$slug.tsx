import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { Heart, Minus, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Grid, Md, PriceBlock, Shell, Stars } from "@/components/site";
import { FREE_SHIPPING_ABOVE, brl, discountPct, getProduct, getSavedCep, hasFreeShipping, maskCep, products, saveCep, useCart, useFavorites } from "@/lib/store";

export const Route = createFileRoute("/produto/$slug")({
  loader: ({ params }) => {
    const p = getProduct(params.slug);
    if (!p) throw notFound();
    return p;
  },
  head: ({ loaderData: p }) => ({
    meta: p
      ? [
          { title: `${p.name} — Vonix Hair` },
          { name: "description", content: p.short || p.name },
          { property: "og:title", content: `${p.name} — Vonix Hair` },
          { property: "og:description", content: p.short || p.name },
          { property: "og:image", content: p.images[0] },
          { name: "twitter:image", content: p.images[0] },
        ]
      : [{ title: "Produto indisponível — Vonix Hair" }, { name: "robots", content: "noindex" }],
  }),
  component: ProductPage,
});

function ShippingCalc({ subtotal }: { subtotal: number }) {
  const [cep, setCep] = useState("");
  const [dest, setDest] = useState<{ city: string; uf: string } | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const saved = getSavedCep();
    if (saved) setCep(saved);
  }, []);
  const calc = async () => {
    const d = cep.replace(/\D/g, "");
    if (d.length !== 8) {
      setErr("Digite um CEP válido no formato 00000-000.");
      setDest(null);
      return;
    }
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch(`https://viacep.com.br/ws/${d}/json/`).then((x) => x.json());
      if (r.erro) {
        setErr("CEP não encontrado.");
        setDest(null);
        return;
      }
      saveCep(cep);
      setDest({ city: r.localidade, uf: r.uf });
    } catch {
      setErr("Não foi possível consultar o CEP. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="mt-6 rounded-xl border border-border p-4">
      <div className="text-sm font-medium">Calcular frete</div>
      <div className="mt-2 flex gap-2">
        <input
          inputMode="numeric"
          placeholder="00000-000"
          value={cep}
          onChange={(e) => setCep(maskCep(e.target.value))}
          onKeyDown={(e) => e.key === "Enter" && calc()}
          aria-label="CEP de entrega"
          className="h-11 min-w-0 flex-1 rounded-lg border border-border bg-background px-3 text-sm"
        />
        <button onClick={calc} disabled={loading} className="shrink-0 rounded-full bg-action px-5 text-sm font-medium text-action-foreground disabled:opacity-60">
          {loading ? "..." : "Calcular"}
        </button>
      </div>
      {err && <p className="mt-2 text-sm text-destructive">{err}</p>}
      {dest && (
        <div className="mt-3 text-sm">
          <p className="text-muted-foreground">Entrega para {dest.city}/{dest.uf}</p>
          {hasFreeShipping(subtotal) ? (
            <p className="mt-1 font-medium">Frete Grátis — pedido acima de {brl(FREE_SHIPPING_ABOVE)} em produtos (vale mesmo após o desconto do Pix).</p>
          ) : (
            <p className="mt-1 text-muted-foreground">
              Cotação com transportadoras (Melhor Envio) ainda não conectada nesta prévia — valor e prazo serão exibidos quando a integração for ativada.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function ProductPage() {
  const p = Route.useLoaderData();
  const cart = useCart();
  const fav = useFavorites();
  const nav = useNavigate();
  const [img, setImg] = useState(0);
  const [vi, setVi] = useState(0);
  const [qty, setQty] = useState(1);
  const v = p.variants[vi] ?? p.variants[0]!;
  const compare = vi === 0 ? p.compareBase : null;
  const off = discountPct(compare, v.price);
  const related = products.filter((x) => x.category === p.category && x.slug !== p.slug).slice(0, 4);
  return (
    <Shell>
      <div className="container-site py-8">
        <nav className="mb-6 text-xs text-muted-foreground">
          <Link to="/">Início</Link> / <Link to="/loja" search={{ categoria: p.category }}>{p.categoryLabel}</Link> / {p.name}
        </nav>
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="min-w-0">
            <div className="overflow-hidden rounded-2xl bg-card-image">
              <img src={p.images[img]} alt={p.name} className="aspect-square w-full object-contain" />
            </div>
            <div className="mt-3 flex gap-2 overflow-x-auto">
              {p.images.map((u, k) => (
                <button key={u} onClick={() => setImg(k)} className={`h-20 w-20 shrink-0 overflow-hidden rounded-lg border-2 ${k === img ? "border-foreground" : "border-transparent"}`}>
                  <img src={u} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          </div>
          <div className="min-w-0">
            {off > 0 && <span className="rounded-full bg-foreground px-3 py-1 text-xs text-background">{off}% OFF</span>}
            <h1 className="mt-3 font-display text-4xl md:text-5xl">{p.name}</h1>
            <Stars count={p.reviews} />
            {p.short && <p className="mt-3 text-muted-foreground">{p.short}</p>}
            <div className="mt-6"><PriceBlock price={v.price} compare={compare} big /></div>
            {p.variants.length > 1 && (
              <div className="mt-6">
                <div className="mb-2 text-sm font-medium">Tamanho</div>
                <div className="flex flex-wrap gap-2">
                  {p.variants.map((x, k) => (
                    <button key={x.label} onClick={() => setVi(k)} className={`rounded-full border px-4 py-2 text-sm ${k === vi ? "border-foreground bg-foreground text-background" : "border-border"}`}>
                      {x.label} · {brl(x.price)}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {p.variants.length === 1 && <div className="mt-4 text-sm text-muted-foreground">Tamanho: {v.label}</div>}
            <div className="mt-6 flex items-center gap-3">
              <div className="flex items-center rounded-full border border-border">
                <button aria-label="Diminuir" className="p-3" onClick={() => setQty(Math.max(1, qty - 1))}><Minus className="h-4 w-4" /></button>
                <span className="w-8 text-center" data-testid="qty">{qty}</span>
                <button aria-label="Aumentar" className="p-3" onClick={() => setQty(qty + 1)}><Plus className="h-4 w-4" /></button>
              </div>
              <button aria-label="Favoritar" onClick={() => fav.toggle(p.slug)} className="rounded-full border border-border p-3">
                <Heart className={`h-4 w-4 ${fav.has(p.slug) ? "fill-foreground" : ""}`} />
              </button>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <button className="rounded-full bg-action py-3.5 font-medium text-action-foreground" onClick={() => { cart.add(p.slug, v.label, qty); nav({ to: "/carrinho" }); }}>
                Comprar agora
              </button>
              <button className="rounded-full border border-foreground py-3.5 font-medium" onClick={() => { cart.add(p.slug, v.label, qty); toast.success("Adicionado ao carrinho"); }}>
                Adicionar ao carrinho
              </button>
            </div>
            <ShippingCalc subtotal={v.price * qty} />
            <p className="mt-4 text-sm text-muted-foreground">Frete grátis em compras acima de {brl(FREE_SHIPPING_ABOVE)} em produtos, antes dos descontos.</p>
          </div>
        </div>
        {p.description && (
          <section className="mx-auto mt-16 max-w-3xl">
            <h2 className="mb-4 font-display text-3xl">Descrição</h2>
            <Md text={p.description} />
          </section>
        )}
        {related.length > 0 && (
          <section className="mt-20">
            <h2 className="mb-8 font-display text-4xl">Você também pode <em>gostar</em></h2>
            <Grid items={related} />
          </section>
        )}
      </div>
    </Shell>
  );
}
