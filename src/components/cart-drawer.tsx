import { useEffect, useSyncExternalStore } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { Minus, Plus, Trash2, X } from "lucide-react";
import { toItem, track } from "@/lib/analytics";
import { thumb, webp } from "@/lib/images";
import { brl, useCart } from "@/lib/store";
import { upsellPlan } from "@/lib/upsell";

/** Gaveta da sacola: abre do lado direito quando a pessoa adiciona um produto. */
let isOpen = false;
const subs = new Set<() => void>();
const emit = () => subs.forEach((f) => f());
export const openCartDrawer = () => {
  isOpen = true;
  emit();
};
const closeCartDrawer = () => {
  isOpen = false;
  emit();
};
const useDrawerOpen = () =>
  useSyncExternalStore(
    (cb) => {
      subs.add(cb);
      return () => {
        subs.delete(cb);
      };
    },
    () => isOpen,
    () => false,
  );

export function CartDrawer() {
  const open = useDrawerOpen();
  const c = useCart();
  const nav = useNavigate();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeCartDrawer();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!open) return null;
  const slugs = c.lines.map((l) => l.slug);
  const extras = upsellPlan(slugs, 6);
  const items = c.lines.reduce((s, l) => s + l.qty, 0);
  const checkout = () => {
    closeCartDrawer();
    nav({ to: "/checkout" });
  };
  return (
    <div className="fixed inset-0 z-[80] flex justify-end bg-black/50" onClick={closeCartDrawer} data-testid="cart-drawer-overlay">
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Sacola"
        data-testid="cart-drawer"
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-[420px] flex-col bg-white shadow-2xl"
      >
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <button type="button" aria-label="Fechar sacola" onClick={closeCartDrawer} className="grid h-9 w-9 place-items-center rounded-full hover:bg-muted">
            <X className="h-5 w-5" />
          </button>
          <b className="text-name">
            Sacola <span className="font-normal text-muted-foreground">({items} {items === 1 ? "item" : "itens"})</span>
          </b>
          <span className="h-9 w-9" aria-hidden="true" />
        </header>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-4">
          {c.lines.length === 0 ? (
            <p className="py-10 text-center text-body text-muted-foreground">Sua sacola está vazia.</p>
          ) : (
            <ul className="divide-y divide-border rounded-xl border border-border">
              {c.lines.map((l) => (
                <li key={l.slug + l.variant + (l.offer ?? "")} className="grid grid-cols-[72px_minmax(0,1fr)] gap-3 p-3">
                  <img src={thumb(l.product.images[0]!)} alt={l.product.name} width={72} height={72} className="h-[72px] w-[72px] rounded-lg bg-muted object-contain p-1" />
                  <div className="min-w-0">
                    <b className="line-clamp-2 text-body font-semibold leading-snug">
                      {l.product.name} <span className="font-normal text-muted-foreground">• {l.variant}</span>
                    </b>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <span className="money text-name font-bold">{brl(l.net)}</span>
                      <div className="inline-flex items-center rounded-full border border-border" role="group" aria-label={`Quantidade de ${l.product.name}`}>
                        <button
                          type="button"
                          aria-label={l.qty <= 1 ? "Remover item" : "Diminuir quantidade"}
                          onClick={() => (l.qty <= 1 ? c.remove(l.slug, l.variant, l.offer) : c.setQty(l.slug, l.variant, l.qty - 1, l.offer))}
                          className="grid h-8 w-8 place-items-center"
                        >
                          {l.qty <= 1 ? <Trash2 className="h-4 w-4" /> : <Minus className="h-4 w-4" />}
                        </button>
                        <span className="min-w-6 text-center text-body font-semibold">{l.qty}</span>
                        <button type="button" aria-label="Aumentar quantidade" onClick={() => c.setQty(l.slug, l.variant, l.qty + 1, l.offer)} className="grid h-8 w-8 place-items-center">
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {extras.items.length > 0 && (
            <section aria-label={extras.title}>
              <h3 className="mb-2 text-name font-semibold">{extras.title}</h3>
              <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {extras.items.map(({ product: p }) => {
                  const v = p.variants[0]!;
                  return (
                    <div key={p.slug} className="flex w-[260px] shrink-0 items-center gap-2 rounded-xl border border-border p-2">
                      <img src={webp(p.images[0]!)} alt="" width={56} height={56} loading="lazy" className="h-14 w-14 shrink-0 rounded-lg bg-muted object-contain p-1" />
                      <div className="min-w-0 flex-1 leading-tight">
                        <Link to="/produto/$slug" params={{ slug: p.slug }} onClick={closeCartDrawer} className="line-clamp-2 text-small font-semibold">
                          {p.name}
                        </Link>
                        <span className="money mt-0.5 block text-small font-bold">{brl(v.price)}</span>
                      </div>
                      <button
                        type="button"
                        aria-label={`Adicionar ${p.name}`}
                        onClick={() => {
                          c.add(p.slug, v.label, 1);
                          track("add_to_cart", { value: v.price, items: [toItem(p, v.label, v.price)] });
                        }}
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border hover:bg-muted"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          <dl className="space-y-2 rounded-xl bg-muted p-4 text-body">
            <div className="flex justify-between">
              <dt>Cupom de desconto</dt>
              <dd className="text-muted-foreground">no checkout</dd>
            </div>
            <div className="flex justify-between">
              <dt>Frete</dt>
              <dd className="text-muted-foreground">grátis para todo o Brasil</dd>
            </div>
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd className="money">{brl(c.netSubtotal)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-name font-bold">
              <dt>Total</dt>
              <dd className="money">{brl(c.netSubtotal)}</dd>
            </div>
          </dl>
        </div>

        <footer className="border-t border-border p-4">
          <button
            type="button"
            onClick={checkout}
            disabled={c.lines.length === 0}
            className="flex h-12 w-full items-center justify-center rounded-full bg-[#0d0c0d] text-body font-semibold text-white disabled:opacity-40"
          >
            Finalizar compra · {brl(c.netSubtotal)} →
          </button>
          <button type="button" onClick={closeCartDrawer} className="mt-2 w-full text-center text-small underline">
            Continuar comprando
          </button>
        </footer>
      </aside>
    </div>
  );
}
