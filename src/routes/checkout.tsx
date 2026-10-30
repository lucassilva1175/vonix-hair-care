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

const inp = "h-11 w-full rounded-lg border border-border bg-background px-3 text-sm";

function Checkout() {
  const c = useCart();
  const [f, setF] = useState({ nome: "", email: "", cpf: "", whatsapp: "", cep: "", rua: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "" });
  const [cepMsg, setCepMsg] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pay, setPay] = useState<"pix" | "card">("pix");
  const [showCoupon, setShowCoupon] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((old) => ({ ...old, [k]: e.target.value }));

  const t = checkoutTotals(c.subtotal, pay);
  const tPix = checkoutTotals(c.subtotal, "pix");
  const tCard = checkoutTotals(c.subtotal, "card");
  const inst = installments(t.net);

  const lookup = async (v: string) => {
    const d = v.replace(/\D/g, "");
    if (d.length !== 8) return;
    try {
      const r = await fetch(`https://viacep.com.br/ws/${d}/json/`).then((x) => x.json());
      if (r.erro) {
        setCepMsg("CEP não encontrado. Preencha o endereço manualmente.");
      } else {
        setF((old) => ({ ...old, rua: r.logradouro ?? "", bairro: r.bairro ?? "", cidade: r.localidade ?? "", uf: r.uf ?? "" }));
        setCepMsg("Endereço preenchido — confira e complete o número.");
      }
    } catch {
      setCepMsg("Não foi possível consultar o CEP. Preencha o endereço manualmente.");
    }
  };

  const applyCoupon = () => {
    // Nenhum cupom ativo nesta prévia; dados e carrinho são preservados.
    setCouponMsg(coupon.trim() ? "Cupom não encontrado. Nesta prévia não há cupons ativos." : "Digite um código de cupom.");
  };

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
        <form className="space-y-8" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
          <div>
            <h1 className="font-display text-5xl">Finalizar compra</h1>
            <p className="mt-2 text-sm text-muted-foreground"><b>Compre sem criar uma conta.</b> Login é opcional e não é pedido em nenhuma etapa.</p>
            <p role="note" className="mt-3 rounded-lg border border-foreground bg-muted p-4 text-sm"><b>Prévia da loja.</b> Pagamento, cálculo de frete e login ainda não estão conectados. Nenhum pedido será criado e nenhuma cobrança será feita.</p>
          </div>

          <fieldset className="space-y-3">
            <legend className="mb-1 text-lg font-semibold">1. Contato</legend>
            <input required placeholder="Nome completo" value={f.nome} onChange={set("nome")} autoComplete="name" className={inp} />
            <input required type="email" inputMode="email" placeholder="E-mail" value={f.email} onChange={set("email")} autoComplete="email" className={inp} />
            <input required inputMode="tel" placeholder="WhatsApp com DDD" value={f.whatsapp} onChange={set("whatsapp")} autoComplete="tel" className={inp} />
            <input required inputMode="numeric" placeholder="CPF (necessário para emissão da nota fiscal)" value={f.cpf} onChange={set("cpf")} className={inp} />
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="mb-1 text-lg font-semibold">2. Entrega</legend>
            <input required inputMode="numeric" placeholder="CEP" value={f.cep} onChange={(e) => { setF((old) => ({ ...old, cep: e.target.value })); lookup(e.target.value); }} autoComplete="postal-code" className={inp} />
            {cepMsg && <p className="text-sm text-muted-foreground">{cepMsg}</p>}
            <input required placeholder="Rua" value={f.rua} onChange={set("rua")} autoComplete="address-line1" className={inp} />
            <div className="grid grid-cols-2 gap-3">
              <input required inputMode="numeric" placeholder="Número" value={f.numero} onChange={set("numero")} className={inp} />
              <input placeholder="Complemento (opcional)" value={f.complemento} onChange={set("complemento")} className={inp} />
            </div>
            <input required placeholder="Bairro" value={f.bairro} onChange={set("bairro")} autoComplete="address-level3" className={inp} />
            <div className="grid grid-cols-[1fr_80px] gap-3">
              <input required placeholder="Cidade" value={f.cidade} onChange={set("cidade")} autoComplete="address-level2" className={inp} />
              <input required placeholder="UF" value={f.uf} onChange={set("uf")} maxLength={2} className={inp} />
            </div>
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="mb-1 text-lg font-semibold">3. Pagamento</legend>
            <label className={`flex items-center justify-between rounded-lg border p-3 text-sm ${pay === "pix" ? "border-action bg-card font-medium" : "border-border"}`}>
              <span className="flex gap-2"><input type="radio" name="pay" checked={pay === "pix"} onChange={() => setPay("pix")} /> Pix (5% de desconto)</span>
              <b>{brl(tPix.net)}</b>
            </label>
            <label className={`flex items-center justify-between rounded-lg border p-3 text-sm ${pay === "card" ? "border-action bg-card font-medium" : "border-border"}`}>
              <span className="flex gap-2"><input type="radio" name="pay" checked={pay === "card"} onChange={() => setPay("card")} /> Cartão de crédito — até 6x sem juros</span>
              <b>{brl(tCard.net)}</b>
            </label>
            {!showCoupon ? (
              <button type="button" onClick={() => setShowCoupon(true)} className="text-sm underline">Tem um cupom?</button>
            ) : (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <input placeholder="Código do cupom" value={coupon} onChange={(e) => setCoupon(e.target.value)} className={inp} />
                  <button type="button" onClick={applyCoupon} className="shrink-0 rounded-lg border border-foreground px-4 text-sm">Aplicar</button>
                  <button type="button" aria-label="Remover cupom" onClick={() => { setShowCoupon(false); setCoupon(""); setCouponMsg(null); }} className="shrink-0 text-sm underline">Remover</button>
                </div>
                {couponMsg && <p role="alert" className="text-sm text-muted-foreground">{couponMsg}</p>}
              </div>
            )}
          </fieldset>

          <button className="w-full rounded-full bg-action py-3.5 font-medium text-action-foreground">Revisar pedido (prévia, sem cobrança)</button>
          {sent && (
            <p role="alert" className="rounded-lg border border-border bg-muted p-4 text-sm">
              Pagamento e cálculo de frete ainda não estão conectados nesta cópia. Nenhum pedido foi criado e nenhuma cobrança foi feita. Seus dados continuam preenchidos.
            </p>
          )}
        </form>

        <aside className="space-y-4">
          <ShippingBar subtotal={c.subtotal} />
          <ul className="space-y-2 text-sm">
            {c.lines.map((l) => (
              <li key={l.slug + l.variant} className="flex justify-between gap-2">
                <span>{l.qty}× {l.product.name} <span className="text-muted-foreground">({l.variant})</span></span>
                <span>{brl(l.total)}</span>
              </li>
            ))}
          </ul>
          <div className="space-y-2 text-sm" data-testid="summary">
            <div className="flex justify-between"><span>Subtotal dos produtos</span><span>{brl(t.gross)}</span></div>
            {t.discount > 0 && <div className="flex justify-between"><span>Desconto Pix (5%)</span><span>− {brl(t.discount)}</span></div>}
            <div className="flex justify-between"><span>Frete</span><span>{t.freeShipping ? "Grátis" : "Pendente — integração de frete não conectada"}</span></div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-semibold"><span>Total {pay === "pix" ? "no Pix" : "no cartão"}{t.freeShipping ? "" : " (sem frete)"}</span><span>{brl(t.net)}</span></div>
            {pay === "card" && <div className="text-muted-foreground">até 6x de {brl(inst.value)} sem juros{inst.first !== inst.value ? ` (1ª de ${brl(inst.first)})` : ""}</div>}
          </div>
        </aside>
      </div>
    </Shell>
  );
}
