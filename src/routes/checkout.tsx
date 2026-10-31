import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Shell } from "@/components/site";
import { toItem, track } from "@/lib/analytics";
import { OFFER_LABEL, WHATSAPP, brl, checkoutTotals, getSavedCep, installments, maskCep, saveCep, useCart } from "@/lib/store";
import { ShippingBar } from "@/components/cart-summary";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Vonix Hair" },
      { name: "description", content: "Finalize sua compra Vonix Hair." },
      { property: "og:title", content: "Checkout — Vonix Hair" },
      { property: "og:description", content: "Finalize sua compra Vonix Hair." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Checkout,
});

const inp = "h-11 w-full rounded-lg border border-border bg-background px-3 text-sm";

const maskCpf = (v: string) =>
  v.replace(/\D/g, "").slice(0, 11).replace(/^(\d{3})(\d)/, "$1.$2").replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1-$2");

function Checkout() {
  const c = useCart();
  const [f, setF] = useState({ nome: "", email: "", cpf: "", whatsapp: "", cep: "", rua: "", numero: "", complemento: "", bairro: "", cidade: "", uf: "" });
  const [cepMsg, setCepMsg] = useState<string | null>(null);
  const [cepLoading, setCepLoading] = useState(false);
  const lastCep = useRef("");
  const numeroRef = useRef<HTMLInputElement>(null);
  const [sent, setSent] = useState(false);
  const [pay, setPay] = useState<"pix" | "card">("pix");
  const [showCoupon, setShowCoupon] = useState(false);
  const [coupon, setCoupon] = useState("");
  const [couponMsg, setCouponMsg] = useState<string | null>(null);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF((old) => ({ ...old, [k]: e.target.value }));

  useEffect(() => {
    const saved = getSavedCep();
    if (saved) setF((old) => (old.cep ? old : { ...old, cep: saved }));
  }, []);

  const hasLines = c.lines.length > 0;
  useEffect(() => {
    if (hasLines) track("begin_checkout", { value: c.netSubtotal, items: c.lines.map((l) => toItem(l.product, l.variant, l.net / l.units, l.units)) });
  }, [hasLines]);

  const t = checkoutTotals(c.lines, pay);
  const tPix = checkoutTotals(c.lines, "pix");
  const tCard = checkoutTotals(c.lines, "card");
  const inst = installments(t.net);

  const lookup = async (v: string) => {
    const d = v.replace(/\D/g, "");
    if (d.length !== 8 || d === lastCep.current) return;
    lastCep.current = d;
    setCepLoading(true);
    setCepMsg(null);
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    try {
      const r = await fetch(`https://viacep.com.br/ws/${d}/json/`, { signal: ctrl.signal }).then((x) => x.json());
      if (r.erro) {
        setCepMsg("CEP não encontrado. Preencha o endereço manualmente.");
      } else {
        setF((old) => ({ ...old, rua: r.logradouro ?? "", bairro: r.bairro ?? "", cidade: r.localidade ?? "", uf: r.uf ?? "" }));
        saveCep(v);
        setCepMsg("Endereço preenchido — confira e complete o número.");
        numeroRef.current?.focus();
      }
    } catch {
      lastCep.current = "";
      setCepMsg("A consulta do CEP demorou ou falhou. Preencha o endereço manualmente.");
    } finally {
      clearTimeout(timer);
      setCepLoading(false);
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
      <div className="container-site grid min-w-0 grid-cols-[minmax(0,1fr)] gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_380px]">
        <form className="min-w-0 space-y-8" onSubmit={(e) => { e.preventDefault(); setSent(true); track("add_payment_info", { payment_type: pay, value: t.net }); }}>
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
            <input required inputMode="numeric" placeholder="CPF (necessário para emissão da nota fiscal)" value={f.cpf} maxLength={14} onChange={(e) => setF((old) => ({ ...old, cpf: maskCpf(e.target.value) }))} className={inp} />
          </fieldset>

          <fieldset className="space-y-3">
            <legend className="mb-1 text-lg font-semibold">2. Entrega</legend>
            <input required inputMode="numeric" placeholder="CEP (00000-000)" value={f.cep} maxLength={9} onChange={(e) => { const m = maskCep(e.target.value); setF((old) => ({ ...old, cep: m })); lookup(m); }} autoComplete="postal-code" className={inp} />
            {cepLoading && <p role="status" className="text-sm text-muted-foreground">Buscando endereço…</p>}
            {cepMsg && !cepLoading && <p role="status" className="text-sm text-muted-foreground">{cepMsg}</p>}
            <input required placeholder="Rua" value={f.rua} onChange={set("rua")} autoComplete="address-line1" className={inp} />
            <div className="grid grid-cols-2 gap-3">
              <input ref={numeroRef} required inputMode="numeric" placeholder="Número" value={f.numero} onChange={set("numero")} autoComplete="address-line2" className={inp} />
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
              <span className="flex gap-2"><input type="radio" name="pay" checked={pay === "pix"} onChange={() => setPay("pix")} /> Pix (5% de desconto nos itens sem outra oferta)</span>
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
          <p className="text-center text-sm text-muted-foreground">
            Precisa de ajuda para finalizar? <a href={WHATSAPP} target="_blank" rel="noreferrer" className="underline">Fale com a gente no WhatsApp</a>
          </p>
          {sent && (
            <p role="alert" className="rounded-lg border border-border bg-muted p-4 text-sm">
              Pagamento e cálculo de frete ainda não estão conectados nesta cópia. Nenhum pedido foi criado e nenhuma cobrança foi feita. Seus dados continuam preenchidos.
            </p>
          )}
        </form>

        <aside className="min-w-0 space-y-4" aria-label="Resumo do pedido">
          <ShippingBar subtotal={c.subtotal} />
          <ul className="space-y-2 text-sm">
            {c.lines.map((l) => (
              <li key={l.slug + l.variant + (l.offer ?? "")} className="grid grid-cols-[48px_minmax(0,1fr)_auto] items-start gap-2">
                <img src={l.product.images[0]} alt={l.product.name} width={48} height={48} className="h-12 w-12 rounded border border-border bg-background object-contain" />
                <span className="min-w-0 break-words">
                  {l.units}× {l.product.name} <span className="text-muted-foreground">({l.variant})</span>
                  {l.offer && <span className="block text-xs text-muted-foreground">{OFFER_LABEL[l.offer]}{l.offer !== "comp5" ? ` · ${l.qty} kit(s)` : ""}</span>}
                </span>
                <span className="whitespace-nowrap font-medium">{brl(l.net)}</span>
              </li>
            ))}
          </ul>
          <div className="space-y-2 text-sm" data-testid="summary">
            <div className="flex justify-between"><span>Subtotal dos produtos</span><span>{brl(t.gross)}</span></div>
            {t.offerDiscount > 0 && <div className="flex justify-between"><span>Economia das ofertas</span><span>− {brl(t.offerDiscount)}</span></div>}
            {t.pixDiscount > 0 && <div className="flex justify-between"><span>Desconto Pix (5% nos itens sem oferta)</span><span>− {brl(t.pixDiscount)}</span></div>}
            {t.hasOffers && <p className="text-xs text-muted-foreground">Ofertas não cumulativas no mesmo item.</p>}
            <div className="flex justify-between"><span>Frete</span><span>{t.freeShipping ? "Grátis" : "Pendente — integração de frete não conectada"}</span></div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-semibold"><span>Total {pay === "pix" ? "no Pix" : "no cartão"}{t.freeShipping ? "" : " (sem frete)"}</span><span>{brl(t.net)}</span></div>
            {pay === "card" && <div className="text-muted-foreground">até 6x de {brl(inst.value)} sem juros{inst.first !== inst.value ? ` (1ª de ${brl(inst.first)})` : ""}</div>}
          </div>
        </aside>
      </div>
    </Shell>
  );
}
