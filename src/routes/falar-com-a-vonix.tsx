import { createFileRoute, Link } from "@tanstack/react-router";
import { CreditCard, Gift, QrCode, Truck } from "lucide-react";
import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Shell, WhatsAppIcon } from "@/components/site";
import { track } from "@/lib/analytics";
import { registerWhatsappLead } from "@/lib/leads.functions";
import { PERFIS, PRODUTOS, QUANDO, linkWhatsapp, qualificado, type PerfilId, type ProdutoId, type QuandoId } from "@/lib/whatsapp-lead";

export const Route = createFileRoute("/falar-com-a-vonix")({
  head: () => ({
    meta: [
      { title: "Falar com a Vonix — Vonix Hair" },
      { name: "description", content: "Combos para cabeleireiras e donas de salão. Fale com um vendedor da Vonix Hair no WhatsApp ou compre no site." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FalarComAVonix,
});

/** Linha de botões de escolha: um toque responde a pergunta, sem digitar. */
function Escolha<T extends string>({ titulo, opcoes, valor, onChange }: { titulo: string; opcoes: readonly { id: T; label: string }[]; valor: T | ""; onChange: (v: T) => void }) {
  return (
    <fieldset className="mt-5 text-left">
      <legend className="mb-2 text-body font-semibold">{titulo}</legend>
      <div className="grid gap-2">
        {opcoes.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            aria-pressed={valor === o.id}
            className={`flex min-h-12 items-center rounded-full border px-5 text-left text-body font-medium transition-colors ${valor === o.id ? "border-foreground bg-foreground text-background" : "border-border bg-white text-foreground"}`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function FalarComAVonix() {
  const [perfil, setPerfil] = useState<PerfilId | "">("");
  const [produto, setProduto] = useState<ProdutoId | "">("");
  const [quando, setQuando] = useState<QuandoId | "">("");
  const [nome, setNome] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const salvar = useServerFn(registerWhatsappLead);

  const pronto = perfil !== "" && produto !== "" && quando !== "";
  const quer = pronto && qualificado({ quando });

  const falarComVendedor = () => {
    if (!pronto) return;
    if (nome.trim().length < 2) return setErro("Escreva o seu nome para o vendedor saber com quem fala.");
    setErro(null);
    track("generate_lead", { method: "formulario_whatsapp" });
    void salvar({ data: { nome: nome.trim(), perfil, produto, quando } }).catch(() => undefined);
    window.open(linkWhatsapp(nome, { perfil, produto, quando }), "_blank", "noopener,noreferrer");
  };

  return (
    <Shell>
      <div className="container-site mx-auto max-w-xl py-8 md:py-12">
        <div className="rounded-2xl bg-card p-6 text-center">
          <p className="text-small font-semibold uppercase tracking-[0.2em] text-muted-foreground">Feito para cabeleireiras e donas de salão</p>
          <h1 className="mt-2 font-display text-h2">Combos com 5% OFF + 5% no Pix</h1>
          <p className="mt-2 text-body text-muted-foreground">Responda 3 perguntas rápidas e a gente leva você para o lugar certo. Entregamos para todo o Brasil, com frete grátis.</p>

          <Escolha titulo="1. Você é cabeleireira ou tem salão?" opcoes={PERFIS} valor={perfil} onChange={setPerfil} />
          <Escolha titulo="2. O que você procura?" opcoes={PRODUTOS} valor={produto} onChange={setProduto} />
          <Escolha titulo="3. Quando quer comprar?" opcoes={QUANDO} valor={quando} onChange={setQuando} />

          {pronto && (
            <div className="mt-6 grid gap-3 text-left" data-testid="falar-acoes">
              {quer ? (
                <>
                  <label className="text-body font-semibold" htmlFor="falar-nome">Seu nome</label>
                  <input
                    id="falar-nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    autoComplete="given-name"
                    placeholder="Como podemos te chamar?"
                    className="h-12 w-full rounded-full border border-border bg-white px-5 text-body outline-none focus:ring-2 focus:ring-foreground"
                  />
                  {erro && <p role="alert" className="text-small font-medium text-red-700">{erro}</p>}
                  <button
                    type="button"
                    onClick={falarComVendedor}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-whatsapp px-6 font-medium text-whatsapp-foreground"
                  >
                    <WhatsAppIcon className="h-5 w-5" /> Falar com um vendedor no WhatsApp
                  </button>
                  <Link
                    to="/loja"
                    onClick={() => track("formulario_comprar_no_site", { method: "formulario_whatsapp" })}
                    className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-white px-6 font-medium text-foreground"
                  >
                    Prefiro comprar direto no site
                  </Link>
                </>
              ) : (
                <>
                  <p className="text-body text-muted-foreground">Sem pressa. Veja os combos do salão com calma e, quando quiser comprar, é só voltar.</p>
                  <Link
                    to="/loja"
                    onClick={() => track("formulario_so_olhando", { method: "formulario_whatsapp" })}
                    className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 font-medium text-primary-foreground"
                  >
                    Ver os combos do salão
                  </Link>
                </>
              )}
            </div>
          )}

          <ul className="mt-6 grid gap-2 text-left text-small text-muted-foreground">
            <li className="flex items-center gap-2"><Truck className="h-4 w-4 shrink-0" aria-hidden="true" /> Entregamos para todo o Brasil, com frete grátis</li>
            <li className="flex items-center gap-2"><QrCode className="h-4 w-4 shrink-0" aria-hidden="true" /> Combos com 5% OFF e mais 5% no Pix</li>
            <li className="flex items-center gap-2"><CreditCard className="h-4 w-4 shrink-0" aria-hidden="true" /> Cartão em até 6x sem juros</li>
            <li className="flex items-center gap-2"><Gift className="h-4 w-4 shrink-0" aria-hidden="true" /> Sacolinha Vonix de mimo em todo pedido</li>
          </ul>
        </div>
      </div>
    </Shell>
  );
}
