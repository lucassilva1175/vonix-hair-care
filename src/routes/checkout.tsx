import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Shell } from "@/components/site";
import { brl, checkoutTotals, installments, useCart } from "@/lib/store";
import { ShippingBar } from "@/components/cart-summary";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Vonix Hair" },
      { name: "description", content: "Finalize sua compra Vonix Hair." },
      { property: "og:title", content: "Checkout — Vonix Hair" },
      { property: "og:description", content: "Finalize sua compra Vonix Hair." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Checkout,
});

function Checkout() {
  const c = useCart();
  const [cep, setCep] = useState("");
  const [addr, setAddr] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pay, setPay] = useState<"pix" | "card">("pix");
  const t = checkoutTotals(c.subtotal, pay);
  const inst = installments(t.net);
  const lookup = async (v: string) => {
    const d = v.replace(/\D/g, "");
    if (d.length !== 8) return;
    try {
      const r = await fetch(`https://viacep.com.br/ws/${d}/json/`).then((x) => x.json());
      setAddr(r.erro ? "CEP não encontrado" : `${r.logradouro}, ${r.bairro} — ${r.localidade}/${r.uf}`);
    } catch {
      setAddr("Não foi possível consultar o CEP");
    }
  };
  const inp = "h-11 w-full rounded-lg border border-border bg-background px-3 text-sm";
  if (!c.lines.length)
    return (
      <Shell>
        <div className="container-site py-20 text-center">
          <p>Seu carrinho está vazio.</p>
          <Link to="/loja" className="mt-4 inline-block underline">Ver produtos</Link>
        </div>
      </Shell>
    );
  return (
    <Shell>
      <div className="container-site grid gap-10 py-10 lg:grid-cols-[1fr_380px]">
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
          <h1 className="font-display text-5xl">Checkout</h1>
          <p role="note" className="rounded-lg border border-foreground bg-muted p-4 text-sm"><b>Prévia da loja.</b> Pagamento, cálculo de frete e login ainda não estão conectados. Nenhum pedido será criado e nenhuma cobrança será feita.</p>
          <input required placeholder="Nome completo" className={inp} />
          <input required type="email" placeholder="E-mail" className={inp} />
          <input required placeholder="CPF" className={inp} />
          <input required placeholder="WhatsApp" className={inp} />
          <input required placeholder="CEP" value={cep} onChange={(e) => { setCep(e.target.value); lookup(e.target.value); }} className={inp} />
          {addr && <p className="text-sm text-muted-foreground">{addr}</p>}
          <input required placeholder="Número e complemento" className={inp} />
          <fieldset className="space-y-2 text-sm">
            <legend className="mb-2 font-medium">Pagamento</legend>
            <label className="flex gap-2"><input type="radio" name="pay" checked={pay === "pix"} onChange={() => setPay("pix")} /> Pix (5% de desconto)</label>
            <label className="flex gap-2"><input type="radio" name="pay" checked={pay === "card"} onChange={() => setPay("card")} /> Cartão de crédito — até 6x sem juros</label>
          </fieldset>
          <button className="w-full rounded-full border border-foreground py-3.5 font-medium">Revisar pedido (prévia, sem cobrança)</button>
          {sent && (
            <p role="alert" className="rounded-lg border border-border bg-muted p-4 text-sm">
              Pagamento e cálculo de frete ainda não estão conectados nesta cópia. Nenhum pedido foi criado e nenhuma cobrança foi feita.
            </p>
          )}
        </form>
        <aside className="space-y-4">
          <ShippingBar subtotal={t.net} />
          <div className="space-y-2 text-sm" data-testid="summary">
            <div className="flex justify-between"><span>Subtotal</span><span>{brl(t.gross)}</span></div>
            {t.discount > 0 && <div className="flex justify-between"><span>Desconto Pix (5%)</span><span>− {brl(t.discount)}</span></div>}
            <div className="flex justify-between"><span>Subtotal após desconto</span><span>{brl(t.net)}</span></div>
            <div className="flex justify-between"><span>Frete</span><span>{t.freeShipping ? "Grátis" : "Pendente — integração de frete não conectada"}</span></div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-semibold"><span>Total {pay === "pix" ? "no Pix" : "no cartão"}{t.freeShipping ? "" : " (sem frete)"}</span><span>{brl(t.net)}</span></div>
            {pay === "card" && <div className="text-muted-foreground">até 6x de {brl(inst.value)} sem juros{inst.first !== inst.value ? ` (1ª de ${brl(inst.first)})` : ""}</div>}
          </div>
        </aside>
      </div>
    </Shell>
  );
}
