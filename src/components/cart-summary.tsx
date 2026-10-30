import { FREE_SHIPPING_ABOVE, brl, hasFreeShipping, installments, missingForFreeShipping, pixPrice } from "@/lib/store";

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

