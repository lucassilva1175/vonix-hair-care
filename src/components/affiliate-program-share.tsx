import { useId, useRef, useState } from "react";
import { MessageCircle, Share2 } from "lucide-react";
import {
  PUBLIC_AFFILIATE_PAGE,
  PUBLIC_AFFILIATE_SHARE_TEXT,
  PUBLIC_AFFILIATE_SHARE_MESSAGE,
  PUBLIC_AFFILIATE_WHATSAPP_URL,
} from "@/lib/affiliate-public-share";

/**
 * This invites someone to the PUBLIC selection page.
 * It is not an affiliate sales/referral link and cannot generate commissions.
 */
export function AffiliateProgramShare() {
  const [feedback, setFeedback] = useState("");
  const [busy, setBusy] = useState(false);
  const [manualShare, setManualShare] = useState(false);
  const shareInFlight = useRef(false);
  const manualId = useId();

  async function sharePublicProgram() {
    if (shareInFlight.current) return;
    shareInFlight.current = true;
    setBusy(true);
    setFeedback("");
    setManualShare(false);
    try {
      if (typeof navigator.share === "function") {
        try {
          await navigator.share({
            title: "Programa de afiliadas Vonix Hair",
            text: PUBLIC_AFFILIATE_SHARE_TEXT,
            url: PUBLIC_AFFILIATE_PAGE,
          });
          setFeedback("Convite entregue ao compartilhamento do dispositivo.");
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
        setFeedback("Compartilhamento indisponível neste navegador. Copie o convite abaixo.");
        setManualShare(true);
        return;
      }
      await navigator.clipboard.writeText(PUBLIC_AFFILIATE_SHARE_MESSAGE);
      setFeedback("Convite público copiado. Compartilhe apenas com quem tiver interesse.");
    } catch {
      setFeedback(
        "Não foi possível copiar ou compartilhar automaticamente. Copie o convite abaixo.",
      );
      setManualShare(true);
    } finally {
      shareInFlight.current = false;
      setBusy(false);
    }
  }

  return (
    <div data-testid="vonix-c67-public-share" className="flex min-w-0 flex-col items-start gap-1">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
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
        <a
          data-testid="vonix-c71-whatsapp-share"
          href={PUBLIC_AFFILIATE_WHATSAPP_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Compartilhar programa pelo WhatsApp"
          aria-describedby="vonix-c67-share-disclaimer"
          className="inline-flex min-h-[44px] items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-[#784254] underline-offset-4 transition hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#754153]"
        >
          <MessageCircle aria-hidden="true" className="size-4 shrink-0" />
          WhatsApp
        </a>
      </div>
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
      {manualShare && (
        <div className="w-full max-w-xs space-y-1">
          <label htmlFor={manualId} className="block text-xs font-semibold text-[#784254]">
            Convite público para copiar manualmente
          </label>
          <textarea
            id={manualId}
            readOnly
            rows={4}
            value={PUBLIC_AFFILIATE_SHARE_MESSAGE}
            onFocus={(event) => event.currentTarget.select()}
            className="w-full resize-y rounded-lg border border-[#e9d3d2] bg-white p-2 text-xs leading-relaxed text-[#693c4c] focus-visible:outline-2 focus-visible:outline-[#754153]"
          />
        </div>
      )}
    </div>
  );
}
