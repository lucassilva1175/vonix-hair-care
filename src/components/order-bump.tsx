import { useRef } from "react";
import { Check, Plus } from "lucide-react";
import { toItem, track } from "@/lib/analytics";
import { webp } from "@/lib/images";
import { brl, getProduct, useCart, useHydrated } from "@/lib/store";
import { upsellPlan } from "@/lib/upsell";

/**
 * Order bump do checkout: UMA sugestão que combina com o que já está no carrinho (mesma lógica do "Leve também"),
 * adicionada com um toque, sem sair da tela de pagamento. A sugestão é escolhida uma vez, quando o carrinho carrega,
 * para o cartão não trocar de produto depois que a pessoa adiciona.
 */
export function OrderBump() {
  const c = useCart();
  const hydrated = useHydrated();
  const pick = useRef<{ slug: string; reason: string } | null>(null);
  if (hydrated && !pick.current && c.lines.length) {
    const first = upsellPlan(c.lines.map((l) => l.slug), 1).items[0];
    if (first) pick.current = { slug: first.product.slug, reason: first.reason };
  }
  if (!hydrated || !pick.current) return null;
  const extra = getProduct(pick.current.slug);
  if (!extra) return null;
  const v = extra.variants[0]!;
  const line = c.lines.find((l) => l.slug === extra.slug && l.variant === v.label);
  const on = !!line;
  const toggle = () => {
    if (on) return c.remove(extra.slug, v.label);
    c.add(extra.slug, v.label, 1);
    track("add_to_cart", { value: v.price, items: [toItem(extra, v.label, v.price)] });
  };
  return (
    <section
      aria-label="Oferta para completar o pedido"
      data-testid="order-bump"
      className={`rounded-2xl border-2 border-dashed p-4 transition-colors ${on ? "border-emerald-500 bg-emerald-50" : "border-[#c9a45c] bg-[#fffaf0]"}`}
    >
      <p className="text-small font-bold uppercase tracking-[0.14em] text-[#7a5a2e]">Aproveite e leve também</p>
      <div className="mt-3 grid grid-cols-[84px_minmax(0,1fr)] items-center gap-3">
        <img src={webp(extra.images[0]!)} alt={extra.name} width={84} height={84} loading="lazy" className="h-[84px] w-[84px] rounded-xl bg-white object-contain p-1.5" />
        <div className="min-w-0">
          <b className="block text-name font-semibold leading-snug">{extra.name}</b>
          <p className="mt-0.5 line-clamp-2 text-small text-muted-foreground">{pick.current.reason}</p>
          <b className="money mt-1 block text-name">{brl(v.price)}</b>
        </div>
      </div>
      <button
        type="button"
        onClick={toggle}
        aria-pressed={on}
        className={`mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-lg text-body font-semibold transition-transform active:scale-[.98] ${on ? "bg-emerald-600 text-white" : "bg-action text-action-foreground"}`}
      >
        {on ? <Check className="h-4 w-4" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
        {on ? "Adicionado ao pedido (toque para remover)" : "Sim, quero adicionar ao pedido"}
      </button>
    </section>
  );
}
