import { useState } from "react";
import { ArrowUpRight, Check, ClipboardCopy } from "lucide-react";
import { AffiliateApplyLink } from "@/components/affiliate-apply-link";
import { buildCreativeBrief, type AffiliateCreativeBrief } from "@/lib/affiliate-creative-brief";

type Props = AffiliateCreativeBrief & {
  recruitmentOpen?: boolean;
  onSafePreview?: (() => void) | undefined;
};

export function AffiliateCreativeKitAction({
  name,
  opening,
  takes,
  recruitmentOpen = false,
  onSafePreview,
}: Props) {
  const [copyState, setCopyState] = useState<"idle" | "copying" | "copied" | "failed">("idle");
  const brief = buildCreativeBrief({ name, opening, takes });

  async function copyBrief() {
    if (copyState === "copying") return;
    setCopyState("copying");
    try {
      if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
        setCopyState("failed");
        return;
      }
      await navigator.clipboard.writeText(brief);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  return (
    <div
      data-testid="affiliate-c141-creative-kit"
      className="mt-5 rounded-xl border border-[#dfcbd0] bg-[#fff8f5] p-3.5 sm:p-4"
    >
      <p className="text-[10px] font-bold uppercase tracking-[.11em] text-[#8b5368]">
        Seu kit de inspiração
      </p>
      <p className="mt-1 text-xs leading-relaxed text-[#735461]">
        Salve esta ideia e adapte ao seu estilo, sem inventar experiências ou resultados.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          disabled={copyState === "copying"}
          onClick={() => void copyBrief()}
          data-testid="affiliate-c141-brief-copy"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#713d52] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#5c3044] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#713d52] disabled:opacity-60"
        >
          {copyState === "copied" ? (
            <Check aria-hidden="true" className="size-4" />
          ) : (
            <ClipboardCopy aria-hidden="true" className="size-4" />
          )}
          {copyState === "copying"
            ? "Copiando..."
            : copyState === "copied"
              ? "Copiar novamente"
              : "Copiar ideia de roteiro"}
        </button>
        <AffiliateApplyLink
          recruitmentOpen={recruitmentOpen}
          onSafePreview={onSafePreview}
          className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-[#d8b8c1] bg-white px-4 py-2 text-center text-xs font-bold text-[#77465a] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#713d52]"
        >
          {recruitmentOpen ? "Apresentar meu perfil" : "Conhecer a prévia sem envio"}
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </AffiliateApplyLink>
      </div>
      {copyState === "copied" && (
        <p role="status" aria-live="polite" className="mt-3 text-xs font-semibold text-[#58734f]">
          Roteiro copiado. Adapte à sua experiência real antes de usar.
        </p>
      )}
      {copyState === "failed" && (
        <div role="status" aria-live="polite" className="mt-3 text-xs text-[#724659]">
          <p className="font-semibold">
            Não foi possível copiar automaticamente. Selecione o texto abaixo.
          </p>
          <textarea
            readOnly
            aria-label="Roteiro para seleção manual"
            rows={7}
            value={brief}
            onFocus={(event) => event.currentTarget.select()}
            className="mt-2 w-full rounded-lg border border-[#d6b8c0] bg-white p-3 text-sm leading-relaxed text-[#49323b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#713d52]"
          />
        </div>
      )}
    </div>
  );
}
