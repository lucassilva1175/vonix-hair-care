import { FREE_SHIPPING_ABOVE, brl, hasFreeShipping, installments, missingForFreeShipping, pixPrice } from "@/lib/store";

export function ShippingBar({ subtotal }: { subtotal: number }) {
  const free = hasFreeShipping(subtotal);
  const pct = Math.min(100, (subtotal / (FREE_SHIPPING_ABOVE + 0.01)) * 100);
  return (
    <div className="rounded-xl border border-border bg-card p-4 text-sm">
      {free ? <b>Você ganhou frete grátis! 🎉</b> : <>Faltam <b>{brl(missingForFreeShipping(subtotal))}</b> em produtos para ganhar frete grátis.</>}
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-action transition-all" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Frete grátis acima de {brl(FREE_SHIPPING_ABOVE)} em produtos, antes dos descontos. Seu cupom e o desconto no Pix mantêm esse benefício.
      </p>
    </div>
  );
}

export function Summary({ subtotal }: { subtotal: number }) {
  const free = hasFreeShipping(subtotal);
  const i = installments(subtotal);
  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between"><span>Subtotal dos produtos</span><span>{brl(subtotal)}</span></div>
      <div className="flex justify-between"><span>Frete</span><span>{free ? "Grátis" : "Calculado pelo CEP no checkout"}</span></div>
      <div className="flex justify-between border-t border-border pt-2 text-base font-semibold"><span>Total no Pix (5% off)</span><span>{brl(pixPrice(subtotal))}</span></div>
      <div className="flex justify-between"><span>Total no cartão{free ? "" : " (sem frete)"}</span><span>{brl(subtotal)}</span></div>
      <div className="text-muted-foreground">ou até 6x de {brl(i.value)} sem juros{i.first !== i.value ? ` (1ª de ${brl(i.first)})` : ""}</div>
    </div>
  );
}
