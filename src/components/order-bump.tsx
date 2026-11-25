import { useRef, useState } from "react";
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
const ANTI_RESIDUO = ["shampoo-fio-de-luz-anti-residuo", "shampoo-diamond-anti-residuo"] as const;

/** Mais um Shampoo Anti-Resíduo: a cliente escolhe qual (Fio de Luz ou Diamond), qualquer que seja o produto do carrinho. */
function MaisUmShampoo() {
  const c = useCart();
  const sugerido = c.lines.some((l) => /diamond|lift|special|selagem/.test(l.slug)) ? ANTI_RESIDUO[1] : ANTI_RESIDUO[0];
  const [escolha, setEscolha] = useState<string>(sugerido);
  const p = getProduct(escolha);
  if (!p) return null;
  const v = p.variants[0]!;
  const qtd = c.lines.find((l) => l.slug === p.slug && l.variant === v.label)?.qty ?? 0;
  const nome = p.slug.includes("diamond") ? "Diamond" : "Fio de Luz";
  return (
    <section aria-label="Mais um shampoo anti-resíduo" data-testid="order-bump-shampoo" className="rounded-2xl border-2 border-dashed border-[#c9a45c] bg-[#fffaf0] p-4">
      <p className="text-small font-bold uppercase tracking-[0.14em] text-[#7a5a2e]">Leve mais um Shampoo Anti-Resíduo</p>
      <div className="mt-3 grid grid-cols-2 gap-2" role="radiogroup" aria-label="Escolha o shampoo anti-resíduo">
        {ANTI_RESIDUO.map((slug) => {
          const o = getProduct(slug);
          if (!o) return null;
          return (
            <button
              key={slug}
              type="button"
              role="radio"
              aria-checked={escolha === slug}
              onClick={() => setEscolha(slug)}
              className={`flex flex-col items-center gap-1 rounded-xl border-2 bg-white p-2 text-center ${escolha === slug ? "border-foreground" : "border-border"}`}
            >
              <img src={webp(o.images[0]!)} alt="" width={64} height={64} loading="lazy" className="h-16 w-16 object-contain" />
              <span className="text-small font-semibold leading-tight">{slug.includes("diamond") ? "Diamond" : "Fio de Luz"}</span>
              <span className="money text-small">{brl(o.variants[0]!.price)}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            c.add(p.slug, v.label, 1);
            track("add_to_cart", { value: v.price, items: [toItem(p, v.label, v.price)] });
          }}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-lg bg-action text-body font-semibold text-action-foreground active:scale-[.98]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" /> Adicionar mais um shampoo {nome}
        </button>
        {qtd > 0 && (
          <button type="button" onClick={() => c.setQty(p.slug, v.label, qtd - 1)} className="h-12 rounded-lg border border-border bg-white px-3 text-small font-semibold">
            Tirar um ({qtd})
          </button>
        )}
      </div>
    </section>
  );
}

export function OrderBump() {
  const c = useCart();
  const hydrated = useHydrated();
  const pick = useRef<{ slug: string; reason: string } | null>(null);
  if (hydrated && !pick.current && c.lines.length) {
    const first = upsellPlan(c.lines.map((l) => l.slug), 1).items[0];
    if (first) pick.current = { slug: first.product.slug, reason: first.reason };
  }
  if (!hydrated || !c.lines.length) return null;
  const extra = pick.current ? getProduct(pick.current.slug) : undefined;
  // Se a sugestão já seria um shampoo anti-resíduo, o bloco "mais um shampoo" (com escolha) substitui a sugestão.
  if (!extra || !pick.current || (ANTI_RESIDUO as readonly string[]).includes(extra.slug)) return <MaisUmShampoo />;
  const v = extra.variants[0]!;
  const line = c.lines.find((l) => l.slug === extra.slug && l.variant === v.label);
  const on = !!line;
  const toggle = () => {
    if (on) return c.remove(extra.slug, v.label);
    c.add(extra.slug, v.label, 1);
    track("add_to_cart", { value: v.price, items: [toItem(extra, v.label, v.price)] });
  };
  return (
    <div className="grid gap-3">
    <MaisUmShampoo />
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
        className={`mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-lg text-body font-semibold transition-transform active:scale-[.98] ${on ? "bg-black text-white" : "bg-action text-action-foreground"}`}
      >
        {on ? <Check className="h-4 w-4" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />}
        {on ? "Adicionado ao pedido (toque para remover)" : "Sim, quero adicionar ao pedido"}
      </button>
    </section>
    </div>
  );
}
