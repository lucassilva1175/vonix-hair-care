import { useId, useRef, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  Link2,
  MessageSquareText,
  ShieldCheck,
} from "lucide-react";

/**
 * Public informational content only: no application data, tokens, cookies, or analytics.
 * The creator can share the public application page, not an affiliate sales link.
 */
import { PUBLIC_AFFILIATE_PAGE } from "@/lib/affiliate-public-share";
export { PUBLIC_AFFILIATE_PAGE } from "@/lib/affiliate-public-share";

const stages = [
  {
    number: "01",
    title: "Concluiu uma inscrição real?",
    description:
      "Guarde o código de acompanhamento exibido após a confirmação. Se o envio ficou sem resposta, consulte o código da tentativa antes de reenviar.",
    Icon: ClipboardCheck,
  },
  {
    number: "02",
    title: "Consulte o andamento",
    description:
      "Use a página de acompanhamento com os dados solicitados. A consulta não altera sua candidatura e não exige uma nova inscrição.",
    Icon: CheckCircle2,
  },
  {
    number: "03",
    title: "Aguarde uma comunicação oficial",
    description:
      "Se sua candidatura avançar, a equipe poderá entrar em contato pelos canais informados. Não existe aprovação ou prazo de resposta garantidos.",
    Icon: MessageSquareText,
  },
] as const;

export function AffiliateNextSteps({ recruitmentOpen }: { recruitmentOpen: boolean }) {
  const [copyMessage, setCopyMessage] = useState("");
  const [manualCopy, setManualCopy] = useState(false);
  const [copying, setCopying] = useState(false);
  const inFlight = useRef(false);
  const copyId = useId();

  async function copyPublicLink() {
    if (inFlight.current) return;
    inFlight.current = true;
    setCopying(true);
    setManualCopy(false);
    setCopyMessage("");
    try {
      if (!navigator.clipboard?.writeText) {
        setCopyMessage("Cópia automática não disponível. Selecione o link público abaixo.");
        setManualCopy(true);
        return;
      }
      await navigator.clipboard.writeText(PUBLIC_AFFILIATE_PAGE);
      setCopyMessage(
        "Link público copiado. Compartilhe apenas com quem deseja conhecer a seleção.",
      );
    } catch {
      setCopyMessage("Não foi possível copiar automaticamente. Selecione o link público abaixo.");
      setManualCopy(true);
    } finally {
      inFlight.current = false;
      setCopying(false);
    }
  }

  return (
    <section
      id="depois-da-inscricao"
      aria-labelledby="vonix-next-steps-title"
      data-testid="affiliate-c55-next-steps"
      className="scroll-mt-24 border-y border-border bg-secondary/30 px-5 py-12 sm:py-14"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid items-end gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <div>
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-primary">
              <ShieldCheck aria-hidden="true" className="size-4" />
              Transparência durante a seleção
            </p>
            <h2
              id="vonix-next-steps-title"
              className="mt-3 max-w-3xl font-display text-3xl leading-tight text-foreground sm:text-4xl"
            >
              Sua candidatura tem{" "}
              <span className="italic text-primary">próximos passos claros.</span>
            </h2>
          </div>
          <p className="max-w-lg text-sm leading-[1.85] text-muted-foreground sm:text-base">
            Depois de um envio confirmado, acompanhe a candidatura com seu código. A inscrição é
            gratuita, a análise é individual e não há prazo ou aprovação garantidos.
          </p>
        </div>

        <ol className="mt-6 grid gap-3 md:grid-cols-3">
          {stages.map(({ number, title, description, Icon }) => (
            <li
              key={number}
              className="flex min-w-0 flex-col rounded-[1.25rem] border border-border bg-card p-4 shadow-[0_12px_35px_rgba(72,36,50,.05)] sm:p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-display text-2xl text-primary sm:text-3xl">{number}</span>
                <Icon aria-hidden="true" className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mt-2 font-display text-xl leading-tight text-foreground sm:mt-4">
                {title}
              </h3>
              <p className="mt-1.5 text-sm leading-[1.65] text-muted-foreground sm:mt-2">
                {description}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-7 flex flex-col justify-between gap-6 rounded-[1.5rem] border border-border bg-card p-6 sm:flex-row sm:items-center sm:p-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold text-foreground">
              {recruitmentOpen
                ? "Quando concluir sua inscrição, guarde o código recebido."
                : "Visualizar a prévia não gera um código ou uma candidatura."}
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Se já concluiu uma inscrição anteriormente, utilize o acompanhamento oficial. Não
              envie dados pessoais, códigos de acesso ou senhas para outras candidatas.
            </p>
          </div>
          <a
            href="/consultar-candidatura"
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 self-start rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring sm:self-auto"
          >
            Acompanhar candidatura <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </a>
        </div>

        <div className="mt-6 flex flex-col items-start justify-between gap-4 border-t border-border pt-5 sm:flex-row sm:items-center">
          <div className="max-w-xl">
            <p className="text-sm font-semibold text-foreground">
              Conhece alguém que também gostaria de participar?
            </p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Compartilhe somente a página pública da seleção. Este botão não gera link de afiliada,
              cupom ou indicação remunerada.
            </p>
            <p
              role="status"
              aria-live="polite"
              className="mt-2 text-xs font-semibold text-primary"
              data-testid="affiliate-c55-copy-result"
            >
              {copyMessage}
            </p>
            {manualCopy && (
              <div className="mt-3">
                <label htmlFor={copyId} className="block text-xs font-semibold text-primary">
                  Link público para copiar manualmente
                </label>
                <input
                  id={copyId}
                  readOnly
                  value={PUBLIC_AFFILIATE_PAGE}
                  onFocus={(event) => event.currentTarget.select()}
                  className="mt-1 min-h-11 w-full rounded-lg border border-border bg-background px-3 text-xs text-foreground"
                />
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => void copyPublicLink()}
            disabled={copying}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-primary px-6 py-3 text-sm font-bold text-primary transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
          >
            <Link2 aria-hidden="true" className="h-4 w-4" />
            Copiar link do programa
            <ExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
}
