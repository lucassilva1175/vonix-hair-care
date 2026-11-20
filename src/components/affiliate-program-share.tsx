import { useState } from "react";
import { Share2 } from "lucide-react";
import { PUBLIC_AFFILIATE_PAGE, PUBLIC_AFFILIATE_SHARE_TEXT } from "@/lib/affiliate-public-share";

/**
 * This invites someone to the PUBLIC selection page.
 * It is not an affiliate sales/referral link and cannot generate commissions.
 */
export function AffiliateProgramShare() {
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);

  async function sharePublicProgram() {
    if (busy) return;
    setBusy(true);
    setFeedback("");
    try {
      if (typeof navigator.share === "function") {
        try {
          await navigator.share({
            title: "Programa de afiliadas Vonix Hair",
            text: PUBLIC_AFFILIATE_SHARE_TEXT,
            url: PUBLIC_AFFILIATE_PAGE,
          });
          setFeedback("Compartilhamento concluído no aplicativo escolhido.");
          return;
        } catch (error) {
          if (error instanceof Error && error.name === "AbortError") {
            setFeedback("Compartilhamento cancelado.");
            return;
          }
          // Browser share failed: a public link copy is an explicit fallback.
        }
      }

      if (typeof navigator.clipboard?.writeText !== "function") {
        setFeedback("Compartilhamento indisponível neste navegador. Use o endereço desta página.");
        return;
      }
      await navigator.clipboard.writeText(
        PUBLIC_AFFILIATE_SHARE_TEXT + "\n" + PUBLIC_AFFILIATE_PAGE,
      );
      setFeedback("Convite público copiado. Compartilhe apenas com quem tiver interesse.");
    } catch {
      setFeedback("Não foi possível copiar ou compartilhar. Use o endereço desta página.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div data-testid="vonix-c67-public-share" className="flex min-w-0 flex-col items-start gap-1">
      <button
        type="button"
        onClick={() => void sharePublicProgram()}
        disabled={busy}
        aria-describedby="vonix-c67-share-disclaimer"
        className="inline-flex min-h-11 items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-[#784254] underline-offset-4 transition hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#754153] disabled:opacity-60"
      >
        <Share2 aria-hidden="true" className="size-4 shrink-0" />
        Compartilhar programa
      </button>
      <p id="vonix-c67-share-disclaimer" className="max-w-xs text-[11px] leading-5 text-[#755d66]">
        Convite à seleção pública, sem link de venda ou indicação remunerada.
      </p>
      <p
        aria-live="polite"
        data-testid="vonix-c67-share-feedback"
        className="max-w-xs text-xs font-medium text-[#784254]"
      >
        {feedback}
      </p>
    </div>
  );
}
