import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ArrowLeft, Truck } from "lucide-react";
import { Shell, WhatsAppIcon } from "@/components/site";
import { validWhatsapp } from "@/components/bf-vip-form";
import { track } from "@/lib/analytics";
import { registerWhatsappLead } from "@/lib/leads.functions";
import {
  PERFIS,
  PRODUTOS,
  QUANDO,
  linkWhatsapp,
  qualificado,
  type PerfilId,
  type ProdutoId,
  type QuandoId,
} from "@/lib/whatsapp-lead";

export const Route = createFileRoute("/falar-com-a-vonix")({
  head: () => ({
    meta: [
      { title: "Falar com a Vonix — Vonix Hair" },
      { name: "description", content: "Responda 3 perguntas rápidas e fale com a Vonix Hair no WhatsApp." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FalarComAVonix,
});

const chip =
  "w-full rounded-2xl border border-border bg-white px-4 py-3.5 text-left text-body font-medium text-foreground transition hover:border-[#c9992f] focus:outline-none focus:ring-2 focus:ring-[#c9992f]";
const input =
  "h-12 w-full min-w-0 rounded-full border border-border bg-white px-4 text-body text-foreground outline-none focus:ring-2 focus:ring-[#c9992f]";

function FalarComAVonix() {
  const [passo, setPasso] = useState(1);
  const [perfil, setPerfil] = useState<PerfilId | null>(null);
  const [produto, setProduto] = useState<ProdutoId | null>(null);
  const [quando, setQuando] = useState<QuandoId | null>(null);
  const [nome, setNome] = useState("");
  const [whats, setWhats] = useState("");
  const [isca, setIsca] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<null | { quente: boolean; link: string }>(null);
  const salvar = useServerFn(registerWhatsappLead);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (enviando || !perfil || !produto || !quando) return;
    if (nome.trim().length < 2) return setErro("Digite seu nome.");
    if (!validWhatsapp(whats)) return setErro("Digite seu WhatsApp com DDD, por exemplo (31) 99999-9999.");
    setErro(null);
    setEnviando(true);
    const respostas = { perfil, produto, quando };
    const quente = qualificado(respostas);
    try {
      await salvar({ data: { nome: nome.trim(), whatsapp: whats.trim(), ...respostas, ...(isca ? { empresa: isca } : {}) } });
    } catch {
      /* melhor esforço: a pessoa segue mesmo se o registro falhar */
    }
    // Só quem quer comprar logo conta como lead para a Meta. Quem está só olhando vai para a loja.
    if (quente) track("generate_lead", { method: "formulario_whatsapp" });
    else track("formulario_so_olhando", { method: "formulario_whatsapp" });
    setResultado({ quente, link: linkWhatsapp(nome, respostas) });
    setEnviando(false);
  };

  return (
    <Shell>
      <div className="container-site mx-auto max-w-xl py-8 md:py-12">
        {resultado ? (
          <div role="status" className="rounded-2xl bg-card p-6 text-center">
            {resultado.quente ? (
              <>
                <h1 className="font-display text-h2">Pronto, {nome.trim().split(" ")[0]}!</h1>
                <p className="mt-2 text-body text-muted-foreground">
                  Já anotamos o que você procura. Toque no botão para falar com a gente no WhatsApp.
                </p>
                <a
                  href={resultado.link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-whatsapp px-6 font-medium text-whatsapp-foreground"
                >
                  <WhatsAppIcon className="h-5 w-5" /> Chamar no WhatsApp
                </a>
              </>
            ) : (
              <>
                <h1 className="font-display text-h2">Sem pressa, {nome.trim().split(" ")[0]}.</h1>
                <p className="mt-2 text-body text-muted-foreground">
                  Veja os produtos com calma. Frete grátis em todos os produtos e 5% de desconto no Pix.
                </p>
                <Link to="/loja" className="mt-5 inline-flex h-12 items-center justify-center rounded-full bg-action px-6 font-medium text-action-foreground">
                  Ver a loja
                </Link>
                <p className="mt-4 text-small text-muted-foreground">Quando decidir, volte aqui e responda de novo para falar com a gente.</p>
              </>
            )}
          </div>
        ) : (
          <form onSubmit={enviar} noValidate className="rounded-2xl bg-card p-6">
            <div className="flex items-center justify-between text-small text-muted-foreground">
              <span>Passo {passo} de 4</span>
              {passo > 1 && (
                <button type="button" onClick={() => setPasso(passo - 1)} className="inline-flex items-center gap-1 underline">
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Voltar
                </button>
              )}
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border" aria-hidden="true">
              <div className="h-full bg-[#c9992f] transition-all" style={{ width: `${passo * 25}%` }} />
            </div>

            {passo === 1 && (
              <section className="mt-5">
                <h1 className="font-display text-h2">Quem vai usar?</h1>
                <div className="mt-4 grid gap-3">
                  {PERFIS.map((p) => (
                    <button key={p.id} type="button" className={chip} onClick={() => { setPerfil(p.id); setPasso(2); }}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {passo === 2 && (
              <section className="mt-5">
                <h1 className="font-display text-h2">O que você procura?</h1>
                <div className="mt-4 grid gap-3">
                  {PRODUTOS.map((p) => (
                    <button key={p.id} type="button" className={chip} onClick={() => { setProduto(p.id); setPasso(3); }}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {passo === 3 && (
              <section className="mt-5">
                <h1 className="font-display text-h2">Quando quer comprar?</h1>
                <div className="mt-4 grid gap-3">
                  {QUANDO.map((p) => (
                    <button key={p.id} type="button" className={chip} onClick={() => { setQuando(p.id); setPasso(4); }}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </section>
            )}

            {passo === 4 && (
              <section className="mt-5">
                <h1 className="font-display text-h2">Para quem falamos?</h1>
                <p className="mt-1 text-body text-muted-foreground">Só nome e WhatsApp. Sem spam.</p>
                <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
                  <label>
                    Empresa
                    <input tabIndex={-1} autoComplete="off" value={isca} onChange={(e) => setIsca(e.target.value)} />
                  </label>
                </div>
                <div className="mt-4 grid gap-3">
                  <label className="block">
                    <span className="sr-only">Seu nome</span>
                    <input className={input} placeholder="Seu nome" autoComplete="given-name" value={nome} onChange={(e) => setNome(e.target.value)} maxLength={80} />
                  </label>
                  <label className="block">
                    <span className="sr-only">Seu WhatsApp com DDD</span>
                    <input className={input} type="tel" inputMode="tel" placeholder="Seu WhatsApp com DDD" autoComplete="tel" value={whats} onChange={(e) => setWhats(e.target.value)} maxLength={25} />
                  </label>
                  {erro && <p role="alert" className="text-small text-destructive">{erro}</p>}
                  <button type="submit" disabled={enviando} className="h-12 rounded-full bg-action px-6 font-medium text-action-foreground disabled:opacity-60">
                    {enviando ? "Enviando…" : "Continuar"}
                  </button>
                </div>
              </section>
            )}

            <p className="mt-6 flex items-center gap-2 text-small text-muted-foreground">
              <Truck className="h-4 w-4" aria-hidden="true" /> Frete grátis em todos os produtos · 5% de desconto no Pix
            </p>
          </form>
        )}
      </div>
    </Shell>
  );
}
