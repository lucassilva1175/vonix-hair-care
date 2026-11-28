import { brl, checkoutTotals, installments, type Offer } from "@/lib/store";

export function Summary({ lines }: { lines: { gross: number; net: number; offer?: Offer | undefined; combo?: boolean | undefined }[] }) {
  const t = checkoutTotals(lines, "card");
  const i = installments(t.net);
  const tPix = checkoutTotals(lines, "pix");
  return (
    <div className="space-y-2 text-body">
      <div className="flex justify-between"><span>Subtotal dos produtos</span><span>{brl(t.gross)}</span></div>
      {t.offerDiscount > 0 && <div className="flex justify-between"><span>Desconto das ofertas (combo 5%, leve 2 ou 3: 12% e 15%)</span><span>− {brl(t.offerDiscount)}</span></div>}
      <div className="flex justify-between"><span>Frete</span><span className="text-right">Calculado pelo CEP</span></div>
      <div className="flex justify-between border-t border-border pt-2 text-body font-semibold"><span>Total dos produtos</span><span>{brl(t.net)}</span></div>
      {tPix.pixDiscount > 0 && <div className="flex justify-between font-semibold text-emerald-700"><span>Produtos no Pix (5% OFF)</span><span>{brl(tPix.net)}</span></div>}
      <div className="text-muted-foreground">{tPix.pixDiscount > 0 ? "Pix: mais 5% OFF nos itens sem oferta e nos combos (o combo já tem 5%). " : "Pix ou cartão: o mesmo valor. "}No cartão, até 6x de {brl(i.value)} sem juros{i.first !== i.value ? ` (1ª de ${brl(i.first)})` : ""}</div>
    </div>
  );
}
