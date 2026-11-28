import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { ClipboardCheck, LockKeyhole, CheckCircle2, Clock3, XCircle } from "lucide-react";
import { AffiliateShell } from "@/components/affiliate-shell";
import { AffiliateStatusGuidance } from "@/components/affiliate-status-guidance";
import { getAffiliateStatusByCode } from "@/lib/affiliate-functions";
import {
  clearMatchingPendingReceipt,
  consumeOneTimeReceipt,
  hasMatchingPendingReceipt,
  downloadAffiliatePrivateReceipt,
  maxPrivateReceiptBytes,
  parseAffiliatePrivateReceipt,
  readPendingReceiptCode,
} from "@/lib/affiliate-private-receipt";
import { affiliateRejectionLabel, affiliateRejectionGuidance } from "@/lib/affiliate-rejection";

export const Route = createFileRoute("/consultar-candidatura")({
  head: () => ({
    meta: [
      { title: "Consultar candidatura | Vonix Hair" },
      { name: "robots", content: "noindex,nofollow,noarchive" },
      { name: "referrer", content: "no-referrer" },
    ],
  }),
  component: AffiliateTrackingCodePage,
});

type Result = {
  status: "pendente" | "aprovada" | "recusada";
  rejectionReason: string | null;
  submittedAt: string;
  reviewedAt: string | null;
};

// Decode the response at the browser boundary as well: old cached clients
// must not render unrecognized decisions, raw server data or invalid dates.
const privateStatusResponseSchema = z.object({
  ok: z.literal(true),
  status: z.enum(["pendente", "aprovada", "recusada"]),
  rejectionReason: z.string().max(55).nullable(),
  submittedAt: z.string().datetime({ offset: true }).max(70),
  reviewedAt: z.string().datetime({ offset: true }).max(70).nullable(),
});

const lookupWaitMs = 30000;
async function waitForPrivateLookup<T>(request: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      request,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("private-status-wait-expired")), lookupWaitMs);
      }),
    ]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}

function clipboardTabHidden() {
  return typeof document !== "undefined" && document.visibilityState === "hidden";
}

export function AffiliateTrackingCodePage() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [copying, setCopying] = useState(false);
  const [codeRevealed, setCodeRevealed] = useState(false);
  const [recoveryAvailable, setRecoveryAvailable] = useState(false);
  const [recoveryAcknowledged, setRecoveryAcknowledged] = useState(false);
  const [recoveryFeedback, setRecoveryFeedback] = useState("");
  const [receiptFeedback, setReceiptFeedback] = useState("");
  const [importFeedback, setImportFeedback] = useState("");
  const [importing, setImporting] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState("");
  const [pendingAvailable, setPendingAvailable] = useState(false);
  const importEpoch = useRef(0);
  const confirmedLookup = useRef<{ code: string; version: number } | null>(null);
  const lookupVersion = useRef(0);
  // React state can batch two submissions into one render. The ref prevents
  // duplicate private-status requests from spending two rate-limit quotas.
  const lookupInFlight = useRef<string | null>(null);
  const clipboardEpoch = useRef(0);
  const clipboardInFlight = useRef(false);

  async function copyPrivateCode() {
    if (!/^[A-Za-z0-9_-]{32}$/.test(code) || clipboardTabHidden() || clipboardInFlight.current)
      return;
    const requestId = lookupVersion.current;
    const copyEpoch = ++clipboardEpoch.current;
    // The ref blocks overlapping clipboard writes before React commits
    // the disabled button state on a rapid double-click.
    clipboardInFlight.current = true;
    setCopying(true);
    setCopied(false);
    setCopyFeedback("");
    try {
      await navigator.clipboard.writeText(code);
      if (
        lookupVersion.current === requestId &&
        clipboardEpoch.current === copyEpoch &&
        !clipboardTabHidden()
      )
        setCopied(true);
    } catch {
      // Never focus/select a bearer token in a hidden tab or after its
      // source code changes, even before visibilitychange is dispatched.
      if (
        lookupVersion.current !== requestId ||
        clipboardEpoch.current !== copyEpoch ||
        clipboardTabHidden()
      )
        return;
      setCopied(false);
      setCopyFeedback(
        "A cópia automática não funcionou. Use Mostrar código privado e copie manualmente em um local seguro.",
      );
      const field = document.getElementById("affiliate-private-code") as HTMLInputElement | null;
      // Do not select a masked bearer code without an explicit reveal.
      if (field?.type === "text") {
        field.focus();
        field.select();
      }
    } finally {
      // Invalidation suppresses feedback, not the native clipboard write.
      // Keep the single-flight lock until that write actually settles.
      clipboardInFlight.current = false;
      setCopying(false);
    }
  }

  const resetRecovery = useCallback(() => {
    confirmedLookup.current = null;
    setRecoveryAvailable(false);
    setRecoveryAcknowledged(false);
    setRecoveryFeedback("");
    setReceiptFeedback("");
  }, []);

  function replacePrivateCode(value: string) {
    lookupVersion.current++;
    lookupInFlight.current = null;
    clipboardEpoch.current++;
    importEpoch.current++;
    setImporting(false);
    setImportFeedback("");
    setCopyFeedback("");
    setBusy(false);
    setCode(value);
    setPendingAvailable(Boolean(readPendingReceiptCode()));
    setCopied(false);
    setCodeRevealed(false);
    setResult(null);
    resetRecovery();
    setError("");
  }

  async function importPrivateReceipt(file: File | undefined) {
    if (!file || clipboardTabHidden()) return;
    const epoch = ++importEpoch.current;
    setImporting(true);
    setImportFeedback("");
    try {
      if (file.size > maxPrivateReceiptBytes) throw new Error("receipt-too-large");
      const text = await file.text();
      if (epoch !== importEpoch.current || clipboardTabHidden()) return;
      const parsed = parseAffiliatePrivateReceipt(text);
      if (!parsed) throw new Error("invalid-receipt");
      replacePrivateCode(parsed);
      setImportFeedback(
        "Código carregado neste navegador. Consulte sua inscrição para confirmar o status.",
      );
    } catch {
      if (epoch === importEpoch.current && !clipboardTabHidden())
        setImportFeedback(
          "Não foi possível ler um código Vonix válido. Use o comprovante de texto original ou cole o código.",
        );
    } finally {
      if (epoch === importEpoch.current) setImporting(false);
    }
  }

  function finishRecovery() {
    const confirmed = confirmedLookup.current;
    if (
      !confirmed ||
      confirmed.code !== code ||
      confirmed.version !== lookupVersion.current ||
      !result ||
      !recoveryAcknowledged ||
      clipboardTabHidden() ||
      lookupInFlight.current !== null
    )
      return;
    if (!clearMatchingPendingReceipt(code)) {
      setRecoveryFeedback(
        "Não foi possível encerrar a recuperação neste navegador. Seu código continua disponível nesta página. Guarde-o antes de sair.",
      );
      return;
    }
    setRecoveryAvailable(false);
    setPendingAvailable(Boolean(readPendingReceiptCode()));
    setRecoveryAcknowledged(false);
    setRecoveryFeedback(
      "Recuperação encerrada neste navegador. Sua candidatura continua registrada; guarde o código para consultas futuras.",
    );
    setCodeRevealed(false);
  }

  function downloadConfirmedReceipt() {
    if (
      !result ||
      confirmedLookup.current?.code !== code ||
      confirmedLookup.current?.version !== lookupVersion.current ||
      clipboardTabHidden()
    )
      return;
    setReceiptFeedback(
      downloadAffiliatePrivateReceipt(code, true)
        ? "Download solicitado. Confira seus arquivos e guarde o código em local privado."
        : "Não foi possível iniciar o download. Copie e guarde o código manualmente.",
    );
  }

  const lookup = useCallback(
    async (codeValue: string) => {
      if (clipboardTabHidden() || lookupInFlight.current === codeValue) return;
      lookupInFlight.current = codeValue;
      const requestId = ++lookupVersion.current;
      resetRecovery();
      setBusy(true);
      setError("");
      setResult(null);
      try {
        const response = await waitForPrivateLookup(
          getAffiliateStatusByCode({ data: { code: codeValue } }),
        );
        // Each result is only valid for the code used by this exact request.
        // Changing codes or launching a newer query invalidates older replies.
        if (lookupVersion.current !== requestId) return;
        // A background-tab request might complete before the visibility event.
        // Never expose a private status before the tab becomes visible.
        if (document.visibilityState === "hidden") {
          setCodeRevealed(false);
          setResult(null);
          setError("");
          return;
        }
        if (!response.ok) setError(response.reason);
        else {
          const parsed = privateStatusResponseSchema.safeParse(response);
          if (!parsed.success) {
            setError(
              "Não foi possível validar os dados da candidatura. Tente novamente mais tarde.",
            );
            return;
          }
          confirmedLookup.current = { code: codeValue, version: requestId };
          setRecoveryAvailable(hasMatchingPendingReceipt(codeValue));
          setResult(parsed.data);
        }
      } catch {
        if (lookupVersion.current === requestId && document.visibilityState !== "hidden") {
          setError("Falha ao consultar. Confira sua conexão e tente novamente.");
          // The deadline ends only this browser wait; a late reply cannot
          // change the current screen or consume another quota automatically.
        }
      } finally {
        if (lookupVersion.current === requestId) {
          if (lookupInFlight.current === codeValue) lookupInFlight.current = null;
          setBusy(false);
        }
      }
    },
    [resetRecovery],
  );

  useEffect(() => {
    setBusy(false);
    setPendingAvailable(Boolean(readPendingReceiptCode()));
    const handoff = consumeOneTimeReceipt();
    if (handoff) {
      setCode(handoff.code);
      if (!handoff.consumed) {
        setImportFeedback(
          "Código carregado. O navegador não confirmou a remoção da transferência temporária; consulte manualmente para confirmar o status.",
        );
        return;
      }
      // Auto lookup is allowed only after a verified one-time transfer.
      if (document.visibilityState === "visible") void lookup(handoff.code);
    }
  }, [lookup]);

  // Private statuses should not remain visible when a shared device changes tabs.
  // Retain the code for the applicant, but mask it and require another explicit lookup.
  useEffect(() => {
    const lookupRef = lookupVersion;
    const importRef = importEpoch;
    const clipboardRef = clipboardEpoch;
    const concealPrivateResult = () => {
      lookupVersion.current++;
      lookupInFlight.current = null;
      importEpoch.current++;
      setImporting(false);
      setImportFeedback("");
      setCopyFeedback("");
      clipboardEpoch.current++;
      setBusy(false);
      setResult(null);
      resetRecovery();
      setError("");
      setCopied(false);
      setCodeRevealed(false);
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") concealPrivateResult();
      else setPendingAvailable(Boolean(readPendingReceiptCode()));
    };
    const onPageShow = (event: PageTransitionEvent) => {
      if (event.persisted) concealPrivateResult();
      setPendingAvailable(Boolean(readPendingReceiptCode()));
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", concealPrivateResult);
    window.addEventListener("pageshow", onPageShow);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", concealPrivateResult);
      window.removeEventListener("pageshow", onPageShow);
      lookupRef.current++;
      importRef.current++;
      clipboardRef.current++;
      lookupInFlight.current = null;
    };
  }, [resetRecovery]);

  async function check(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy || importing || !/^[A-Za-z0-9_-]{32}$/.test(code)) return;
    await lookup(code);
  }

  return (
    <AffiliateShell mode="account">
      <div className="min-h-[75vh] bg-[#faf5f0] px-4 py-7 text-[#392832] sm:px-5 sm:py-16">
        <div className="mx-auto max-w-2xl">
          <div className="mb-5 text-center sm:mb-8">
            <LockKeyhole className="mx-auto h-9 w-9 text-[#825164]" aria-hidden="true" />
            <h1 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
              Consulte sua candidatura
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-[#775d65]">
              Para todas as candidaturas, inclusive as novas com e-mail, use o código privado
              exibido na confirmação do cadastro. O e-mail serve para contato, mas não substitui o
              código. Não o compartilhe.
            </p>
          </div>
          <section className="rounded-[1.5rem] border border-[#e8d7d3] bg-white p-4 shadow-[0_14px_40px_rgba(72,31,43,.09)] sm:rounded-[2rem] sm:p-10">
            <form aria-busy={busy} onSubmit={(event) => void check(event)}>
              <label htmlFor="affiliate-private-code" className="block text-sm font-bold">
                Código privado de acompanhamento
              </label>
              <input
                id="affiliate-private-code"
                aria-label="Código privado de acompanhamento"
                type={codeRevealed ? "text" : "password"}
                autoComplete="off"
                spellCheck={false}
                maxLength={32}
                minLength={32}
                pattern="[A-Za-z0-9_-]{32}"
                required
                value={code}
                onChange={(event) => replacePrivateCode(event.target.value.trim())}
                onPaste={(event) => {
                  const text = event.clipboardData.getData("text/plain");
                  const parsed = parseAffiliatePrivateReceipt(text);
                  if (parsed) {
                    event.preventDefault();
                    replacePrivateCode(parsed);
                  } else if (text.includes("\n") || text.length > 32) {
                    event.preventDefault();
                    setImportFeedback(
                      "Cole somente o código ou o comprovante de texto original da Vonix.",
                    );
                  }
                }}
                placeholder="Cole o código salvo após sua inscrição"
                className="mt-2 min-h-12 w-full rounded-xl border border-[#dac4c8] px-4 font-semibold text-sm outline-none focus:ring-2 focus:ring-[#e6c8ce]"
              />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <label className="inline-flex min-h-11 cursor-pointer items-center rounded-lg border border-[#dac4c8] px-3 text-xs font-bold text-[#633847] focus-within:ring-2 focus-within:ring-[#825164]">
                  {importing ? "Lendo comprovante..." : "Importar comprovante (.txt)"}
                  <input
                    type="file"
                    accept=".txt,text/plain"
                    aria-label="Importar comprovante privado de texto"
                    className="sr-only"
                    disabled={importing || busy}
                    onChange={(event) => {
                      const file = event.currentTarget.files?.[0];
                      event.currentTarget.value = "";
                      void importPrivateReceipt(file);
                    }}
                  />
                </label>
                {code.length > 0 && (
                  <button
                    type="button"
                    onClick={() => replacePrivateCode("")}
                    className="min-h-11 px-2 text-xs font-bold text-[#633847] underline underline-offset-4"
                  >
                    Limpar consulta nesta tela
                  </button>
                )}
              </div>
              {!code && pendingAvailable && (
                <button
                  type="button"
                  onClick={() => {
                    if (clipboardTabHidden()) return;
                    const saved = readPendingReceiptCode();
                    setPendingAvailable(Boolean(saved));
                    if (saved) {
                      replacePrivateCode(saved);
                      setImportFeedback(
                        "Código da tentativa anterior carregado. Consulte para verificar se a inscrição foi recebida.",
                      );
                    }
                  }}
                  className="mt-3 min-h-11 w-full rounded-xl border border-[#dac4c8] bg-[#fff8f6] px-3 text-sm font-bold text-[#633847]"
                >
                  Recuperar código de uma tentativa anterior
                </button>
              )}
              <p className="mt-1 text-xs leading-relaxed text-[#775d65]">
                O arquivo é lido apenas neste navegador. Limpar a tela não exclui sua candidatura
                nem o comprovante salvo.
              </p>
              {importFeedback && (
                <p role="status" className="mt-2 text-xs text-[#633847]">
                  {importFeedback}
                </p>
              )}
              {code.length > 0 && (
                <button
                  type="button"
                  aria-pressed={codeRevealed}
                  onClick={() => setCodeRevealed((value) => !value)}
                  className="mt-3 min-h-11 w-full rounded-full border border-[#b9969e] px-5 text-sm font-bold text-[#633847]"
                >
                  {codeRevealed ? "Ocultar código privado" : "Mostrar código privado"}
                </button>
              )}
              <button
                type="submit"
                disabled={busy || importing || !/^[A-Za-z0-9_-]{32}$/.test(code)}
                className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[#633847] px-5 font-bold text-white disabled:opacity-50"
              >
                <ClipboardCheck className="h-4 w-4" aria-hidden="true" />
                {busy ? "Consultando..." : "Consultar minha inscrição"}
              </button>
              {/^[A-Za-z0-9_-]{32}$/.test(code) && (
                <button
                  type="button"
                  onClick={() => void copyPrivateCode()}
                  disabled={copying}
                  className="mt-3 min-h-11 w-full rounded-full border border-[#b9969e] px-5 text-sm font-bold text-[#633847] disabled:opacity-50"
                >
                  {copying
                    ? "Copiando código..."
                    : copied
                      ? "Código copiado!"
                      : "Copiar código para guardar"}
                </button>
              )}
              {copyFeedback && (
                <p role="status" className="mt-2 text-xs text-[#633847]">
                  {copyFeedback}
                </p>
              )}
            </form>
            {error && (
              <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-800">
                {error}
              </p>
            )}
            {result && (
              <div
                role="status"
                className="mt-7 rounded-2xl border border-[#e4d2d3] bg-[#fffbf9] p-5"
              >
                <div className="flex items-center gap-3">
                  {result.status === "recusada" ? (
                    <XCircle aria-hidden="true" className="h-6 w-6 text-[#9a505b]" />
                  ) : result.status === "aprovada" ? (
                    <CheckCircle2 aria-hidden="true" className="h-6 w-6 text-emerald-700" />
                  ) : (
                    <Clock3 aria-hidden="true" className="h-6 w-6 text-amber-700" />
                  )}
                  <h2 className="font-display text-2xl">
                    {result.status === "recusada"
                      ? "Candidatura não selecionada"
                      : result.status === "aprovada"
                        ? "Candidatura aprovada"
                        : "Candidatura em análise"}
                  </h2>
                </div>
                <p className="mt-3 text-sm text-[#70525c]">
                  Inscrição recebida em {new Date(result.submittedAt).toLocaleDateString("pt-BR")}.
                </p>
                {result.status === "recusada" && (
                  <>
                    <p className="mt-4 text-sm font-bold text-[#6a3b48]">
                      Motivo: {affiliateRejectionLabel(result.rejectionReason)}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-[#70525c]">
                      {affiliateRejectionGuidance(result.rejectionReason)}
                    </p>
                    {recoveryAvailable ? (
                      <p className="mt-4 rounded-lg border border-[#d9bfc7] bg-white p-3 text-xs font-semibold text-[#633847]">
                        Para iniciar outra candidatura, guarde o código anterior e encerre a
                        recuperação local abaixo. Isso não exclui sua inscrição.
                      </p>
                    ) : (
                      <a
                        href="/seja-afiliada"
                        className="mt-5 inline-block rounded-full bg-[#633847] px-5 py-3 text-sm font-bold text-white"
                      >
                        Quero me candidatar novamente
                      </a>
                    )}
                  </>
                )}
                {result.status === "aprovada" && (
                  <p className="mt-3 text-sm text-[#70525c]">
                    Aguarde contato oficial da equipe sobre as próximas etapas. Aprovação não
                    garante remuneração.
                  </p>
                )}
                {result.status === "pendente" && (
                  <p className="mt-3 text-sm text-[#70525c]">
                    A equipe ainda está analisando seu perfil. Volte a consultar mais tarde.
                  </p>
                )}
                {result.reviewedAt && (
                  <p className="mt-2 text-xs text-[#70525c]">
                    Última decisão registrada em{" "}
                    {new Date(result.reviewedAt).toLocaleDateString("pt-BR")}.
                  </p>
                )}
                <AffiliateStatusGuidance status={result.status} />
                <button
                  type="button"
                  onClick={downloadConfirmedReceipt}
                  className="mt-4 min-h-11 w-full rounded-full border border-[#b9969e] px-4 text-sm font-bold text-[#633847]"
                >
                  Baixar comprovante do código privado
                </button>
                {receiptFeedback && (
                  <p role="status" className="mt-2 text-xs text-[#70525c]">
                    {receiptFeedback}
                  </p>
                )}
                {recoveryAvailable && (
                  <div
                    data-testid="affiliate-c177-recovery"
                    className="mt-5 rounded-xl border border-[#d9bfc7] bg-white p-4"
                  >
                    <h3 className="text-sm font-bold text-[#633847]">
                      Sua tentativa anterior foi localizada
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-[#70525c]">
                      A inscrição foi recebida. Não é necessário reenviar os mesmos dados. Guarde o
                      código antes de encerrar a recuperação local. Esta ação não exclui a
                      candidatura.
                    </p>
                    <label className="mt-3 flex items-start gap-2 text-sm text-[#633847]">
                      <input
                        type="checkbox"
                        checked={recoveryAcknowledged}
                        onChange={(event) => setRecoveryAcknowledged(event.target.checked)}
                        className="mt-1 size-4 shrink-0"
                      />
                      Já guardei meu código privado em local seguro.
                    </label>
                    <button
                      type="button"
                      disabled={!recoveryAcknowledged}
                      onClick={finishRecovery}
                      className="mt-3 min-h-11 w-full rounded-full bg-[#633847] px-4 text-sm font-bold text-white disabled:opacity-50"
                    >
                      Encerrar recuperação neste navegador
                    </button>
                  </div>
                )}
                {recoveryFeedback && (
                  <p role="status" className="mt-3 text-sm text-[#70525c]">
                    {recoveryFeedback}
                  </p>
                )}
              </div>
            )}
            <details className="mt-6 rounded-2xl border border-[#e8d7d3] bg-[#fffaf7] p-4 sm:p-5">
              <summary className="flex min-h-11 cursor-pointer items-center gap-2 text-sm font-bold text-[#633847] focus-visible:outline-2">
                <LockKeyhole aria-hidden="true" className="size-4 shrink-0" />
                Não encontrou seu código privado?
              </summary>
              <ol className="mt-2 space-y-3 text-sm leading-relaxed text-[#70525c]">
                <li>
                  <strong>1. Confira seus arquivos.</strong> Procure o comprovante
                  vonixhair-codigo-candidatura.txt, que você pode importar nesta página sem enviar o
                  arquivo.
                </li>
                <li>
                  <strong>2. Confira a mesma aba.</strong> Se uma tentativa anterior estiver salva
                  nesta sessão, use a opção de recuperar o código acima. Isso não comprova o
                  recebimento da inscrição.
                </li>
                <li>
                  <strong>3. Se não tiver o código, procure a equipe.</strong> A equipe poderá
                  orientar sobre a situação, sem garantir recuperação do código ou acesso à
                  candidatura.
                </li>
              </ol>
              <p className="mt-3 text-xs leading-relaxed text-[#826c70]">
                Não envie senhas ou códigos em comentários ou redes sociais. Não é possível
                recuperar o código somente com o Instagram. Inscrições antigas com acesso por e-mail
                podem utilizar o portal correspondente; isso não substitui o código das novas
                candidaturas.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <a
                  href="/sobre"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center rounded-xl border border-[#d9bfc7] bg-white px-3 text-xs font-bold text-[#633847] underline underline-offset-4"
                >
                  Consultar canais oficiais da Vonix
                </a>
                <a
                  href="/acompanhar-inscricao"
                  rel="noreferrer"
                  className="inline-flex min-h-11 items-center rounded-xl border border-[#d9bfc7] bg-white px-3 text-xs font-bold text-[#633847] underline underline-offset-4"
                >
                  Acessar portal de e-mail de inscrições antigas
                </a>
              </div>
            </details>
          </section>
        </div>
      </div>
    </AffiliateShell>
  );
}
