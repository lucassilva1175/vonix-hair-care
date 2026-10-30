import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Shell } from "@/components/site";
import { BEST_SELLERS, brl, getProduct, useCart } from "@/lib/store";
import { ShippingBar, Summary } from "@/components/cart-summary";

export const Route = createFileRoute("/carrinho")({
  head: () => ({
    meta: [
      { title: "Carrinho — Vonix Hair" },
      { name: "description", content: "Seu carrinho Vonix Hair." },
      { property: "og:title", content: "Carrinho — Vonix Hair" },
      { property: "og:description", content: "Seu carrinho Vonix Hair." },
    ],
  }),
  component: Cart,
});

/** Uma única recomendação complementar, compacta e recolhível; nunca pré-selecionada. */
function Suggestion() {
  const c = useCart();
  const slug = BEST_SELLERS.map(getProduct).find((p) => p && !c.lines.some((l) => l.slug === p.slug));
  if (!slug) return null;
  const v = slug.variants[0];
  return (
    <details className="rounded-xl border border-border bg-card p-4 text-sm">
      <summary className="cursor-pointer font-medium">Complete seu tratamento (opcional)</summary>
      <div className="mt-3 flex items-center gap-3">
        <img src={slug.images[0]} alt="" className="h-16 w-16 rounded-lg bg-card-image object-contain" />
        <div className="flex-1">
          <Link to="/produto/$slug" params={{ slug: slug.slug }} className="font-medium hover:underline">
            {slug.name}
          </Link>
          <div className="text-xs text-muted-foreground">{v.label} · {brl(v.price)}</div>
        </div>
        <button
          onClick={() => c.add(slug.slug, v.label)}
          className="rounded-full border border-action px-4 py-2 text-xs font-medium text-action"
        >
          Adicionar
        </button>
      </div>
    </details>
  );
}

function Cart() {
  const c = useCart();
  return (
    <Shell>
      <div className="container-site py-10 pb-28 lg:pb-10">
        <h1 className="mb-8 font-display text-5xl">Carrinho</h1>
        {c.lines.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-muted-foreground">Seu carrinho está vazio.</p>
            <Link to="/loja" className="mt-6 inline-block rounded-full bg-action px-6 py-3 text-action-foreground">Ver produtos</Link>
          </div>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1fr_360px]">
            <ul className="divide-y divide-border">
              {c.lines.map((l) => (
                <li key={l.slug + l.variant} className="flex gap-4 py-4">
                  <img src={l.product.images[0]} alt="" className="h-24 w-24 rounded-lg bg-card-image object-contain" />
                  <div className="flex-1">
                    <Link to="/produto/$slug" params={{ slug: l.slug }} className="font-medium">{l.product.name}</Link>
                    <div className="text-xs text-muted-foreground">{l.variant} · {brl(l.price)}</div>
                    <div className="mt-2 flex items-center gap-2">
                      <button aria-label="Diminuir" onClick={() => c.setQty(l.slug, l.variant, l.qty - 1)} className="rounded-full border border-border p-1.5"><Minus className="h-3 w-3" /></button>
                      <span className="w-6 text-center">{l.qty}</span>
                      <button aria-label="Aumentar" onClick={() => c.setQty(l.slug, l.variant, l.qty + 1)} className="rounded-full border border-border p-1.5"><Plus className="h-3 w-3" /></button>
                      <button aria-label="Remover" onClick={() => c.remove(l.slug, l.variant)} className="ml-3 text-muted-foreground"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                  <div className="font-semibold">{brl(l.total)}</div>
                </li>
              ))}
            </ul>
            <aside className="space-y-4">
              <ShippingBar subtotal={c.subtotal} />
              <Summary subtotal={c.subtotal} />
              <Suggestion />
              <Link to="/checkout" className="hidden rounded-full bg-action py-3.5 text-center font-medium text-action-foreground lg:block">Finalizar minha compra</Link>
              <Link to="/loja" className="block text-center text-sm underline">Continuar comprando</Link>
            </aside>
          </div>
        )}
      </div>
      {c.lines.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background p-3 lg:hidden">
          <Link to="/checkout" className="block rounded-full bg-action py-3.5 text-center font-medium text-action-foreground">
            Finalizar minha compra
          </Link>
        </div>
      )}
    </Shell>
  );
}
