import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Shell } from "@/components/site";
import { FREE_SHIPPING_ABOVE, brl, hasFreeShipping, installments, missingForFreeShipping, pixPrice, useCart } from "@/lib/store";

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

export function ShippingBar({ subtotal }: { subtotal: number }) {
  const free = hasFreeShipping(subtotal);
  const pct = Math.min(100, (subtotal / (FREE_SHIPPING_ABOVE + 0.01)) * 100);
  return (
    <div className="rounded-xl border border-border p-4 text-sm">
      {free ? <b>Você ganhou frete grátis! 🎉</b> : <>Faltam <b>{brl(missingForFreeShipping(subtotal))}</b> para ultrapassar {brl(FREE_SHIPPING_ABOVE)} e ganhar frete grátis.</>}
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-foreground transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function Summary({ subtotal }: { subtotal: number }) {
  const free = hasFreeShipping(subtotal);
  const i = installments(subtotal);
  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between"><span>Subtotal</span><span>{brl(subtotal)}</span></div>
      <div className="flex justify-between"><span>Frete</span><span>{free ? "Grátis" : "Calculado pelo CEP no checkout"}</span></div>
      <div className="flex justify-between border-t border-border pt-2 text-base font-semibold"><span>Total{free ? "" : " (sem frete)"}</span><span>{brl(subtotal)}</span></div>
      <div>ou <b>{brl(pixPrice(subtotal))}</b> no Pix (5% off)</div>
      <div className="text-muted-foreground">ou até 6x de {brl(i.value)} sem juros{i.first !== i.value ? ` (1ª de ${brl(i.first)})` : ""}</div>
    </div>
  );
}

function Cart() {
  const c = useCart();
  return (
    <Shell>
      <div className="container-site py-10">
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
              <Link to="/checkout" className="block rounded-full bg-action py-3.5 text-center font-medium text-action-foreground">Finalizar compra</Link>
              <Link to="/loja" className="block text-center text-sm underline">Continuar comprando</Link>
            </aside>
          </div>
        )}
      </div>
    </Shell>
  );
}
