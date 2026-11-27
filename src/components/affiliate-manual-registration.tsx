import { useEffect, useRef, useState, type FormEvent } from "react";
import { ClipboardCopy, UserRoundPlus } from "lucide-react";
import { createManualAffiliateAdmin } from "@/lib/affiliate-functions";
import { affiliateManualSchema } from "@/lib/affiliate-simple";
import { WIZARD_BRAZIL_STATES } from "@/lib/affiliate-wizard";
import { downloadAffiliatePrivateReceipt } from "@/lib/affiliate-private-receipt";

function issueManualReceipt() {
  const bytes = new Uint8Array(24);
  window.crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function registrationTabHidden() {
  return document.visibilityState === "hidden";
}

const empty = {
  fullName: "",
  email: "",
  phone: "",
  postalCode: "",
  street: "",
  number: "",
  district: "",
  city: "",
  state: "",
  complement: "",
  instagram: "",
  instagramFollowers: "",
  tiktok: "",
  tiktokFollowers: "",
};
type Field = keyof typeof empty;
const fields: Array<{
  name: Field;
  label: string;
  placeholder?: string;
  required?: boolean;
  type?: string;
}> = [
  { name: "fullName", label: "Nome completo", required: true },
  { name: "email", label: "E-mail da candidata (opcional)", type: "email" },
  { name: "phone", label: "Telefone com DDD", required: true },
  { name: "postalCode", label: "CEP", required: true },
  { name: "street", label: "Rua / avenida", required: true },
  { name: "number", label: "Número ou s/n", required: true },
  { name: "district", label: "Bairro", required: true },
  { name: "city", label: "Cidade", required: true },
  { name: "complement", label: "Complemento" },
  { name: "instagram", label: "Instagram (@usuário)", required: true },
  { name: "instagramFollowers", label: "Seguidores do Instagram", required: true, type: "number" },
  { name: "tiktok", label: "TikTok (opcional)" },
  { name: "tiktokFollowers", label: "Seguidores do TikTok (opcional)", type: "number" },
];

export function AffiliateManualRegistration({ onCreated }: { onCreated?: () => void }) {
  const [values, setValues] = useState(empty);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState("");
  const [feedback, setFeedback] = useState("");
  const [pendingReceipt, setPendingReceipt] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [copying, setCopying] = useState(false);
  const [saved, setSaved] = useState(false);
  const attempt = useRef<{ code: string; payload: string } | null>(null);
  const copyingRef = useRef(false);
  const copyVersion = useRef(0);
  const inFlight = useRef(false);
  const epoch = useRef(0);

  useEffect(() => {
    const copyRef = copyVersion;
    const hidden = () => {
      if (document.visibilityState === "hidden") {
        epoch.current += 1;
        copyVersion.current++;
        copyingRef.current = false;
        setCopying(false);
        setReceipt("");
        setPendingReceipt("");
        setRevealed(false);
        setSaved(false);
        setValues(empty);
        setConsent(false);
        attempt.current = null;
        setFeedback(
          inFlight.current
            ? "O cadastro estava em andamento. Confira a lista antes de iniciar outra inscrição."
            : "",
        );
        setError("");
      }
    };
    document.addEventListener("visibilitychange", hidden);
    return () => {
      epoch.current += 1;
      copyRef.current++;
      document.removeEventListener("visibilitychange", hidden);
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current || registrationTabHidden() || receipt) return;
    setError("");
    setFeedback("");
    setRevealed(false);
    if (!values.instagramFollowers.trim()) {
      setError("Informe a quantidade de seguidores no Instagram (pode ser zero).");
      return;
    }
    const candidate = {
      ...values,
      instagramFollowers: Number(values.instagramFollowers),
      tiktokFollowers: values.tiktokFollowers === "" ? null : Number(values.tiktokFollowers),
      privacyAccepted: true as const,
    };
    const parsed = affiliateManualSchema.safeParse({
      candidate,
      consentConfirmed: consent,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Confira os dados da candidata.");
      return;
    }
    const payload = JSON.stringify(parsed.data);
    if (attempt.current && attempt.current.payload !== payload) {
      setError(
        "Os dados mudaram desde a tentativa anterior. Confira o código existente antes de descartar a tentativa.",
      );
      return;
    }
    try {
      if (!attempt.current) attempt.current = { code: issueManualReceipt(), payload };
    } catch {
      setError("Não foi possível criar um código privado seguro neste navegador.");
      return;
    }
    const code = attempt.current.code;
    setPendingReceipt(code);
    setSaved(false);
    const requestEpoch = ++epoch.current;
    inFlight.current = true;
    setBusy(true);
    try {
      const result = await createManualAffiliateAdmin({
        data: { ...parsed.data, trackingCode: code },
      });
      if (requestEpoch !== epoch.current || registrationTabHidden()) return;
      if (!result.ok) {
        setError(result.reason);
        return;
      }
      if (result.trackingCode !== code) {
        setError(
          "O cadastro não pôde ser confirmado com o mesmo código. Consulte a tentativa antes de reenviar.",
        );
        return;
      }
      copyVersion.current++;
      copyingRef.current = false;
      setCopying(false);
      attempt.current = null;
      setPendingReceipt("");
      setReceipt(code);
      setSaved(false);
      setValues(empty);
      setConsent(false);
      setFeedback("Candidatura registrada como pendente. Nenhum convite ou e-mail foi enviado.");
      onCreated?.();
    } catch {
      if (requestEpoch === epoch.current) {
        setError(
          "Não foi possível confirmar o cadastro. Pesquise pelo perfil na lista antes de reenviar.",
        );
      }
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  }

  async function copyCode() {
    const code = receipt || pendingReceipt;
    if (!code || copyingRef.current || registrationTabHidden()) return;
    const requestEpoch = epoch.current;
    const version = ++copyVersion.current;
    copyingRef.current = true;
    setCopying(true);
    try {
      await navigator.clipboard.writeText(code);
      if (
        epoch.current === requestEpoch &&
        version === copyVersion.current &&
        !registrationTabHidden()
      )
        setFeedback("Código copiado. Envie apenas à própria candidata por um canal privado.");
    } catch {
      if (
        epoch.current === requestEpoch &&
        version === copyVersion.current &&
        !registrationTabHidden()
      )
        setFeedback("Não foi possível copiar. Revele o código e anote de forma privada.");
    } finally {
      if (version === copyVersion.current) {
        copyingRef.current = false;
        setCopying(false);
      }
    }
  }

  function downloadCode() {
    if (registrationTabHidden()) return;
    const initiated = downloadAffiliatePrivateReceipt(receipt || pendingReceipt, Boolean(receipt));
    setFeedback(
      initiated
        ? "Download solicitado. Confira o arquivo privado antes de entregá-lo."
        : "Não foi possível baixar. Copie o código em local seguro.",
    );
  }

  function clearReceipt() {
    if (inFlight.current || registrationTabHidden() || !saved) return;
    copyVersion.current++;
    copyingRef.current = false;
    setCopying(false);
    attempt.current = null;
    setReceipt("");
    setPendingReceipt("");
    setRevealed(false);
    setSaved(false);
    setError("");
    setFeedback("");
  }

  return (
    <details
      data-testid="affiliate-c77-manual-registration"
      className="mb-6 overflow-hidden rounded-[1.5rem] border border-[#dfcbd0] bg-white shadow-[0_12px_40px_rgba(76,38,52,.06)]"
    >
      <summary className="flex min-h-16 cursor-pointer items-center gap-3 px-5 py-4 text-[#653748] focus-visible:outline-2 focus-visible:outline-offset-[-3px] sm:px-7">
        <UserRoundPlus aria-hidden="true" className="size-6 shrink-0" />
        <span className="min-w-0">
          <span className="block font-display text-xl">Cadastrar candidata manualmente</span>
          <span className="block text-xs leading-relaxed text-[#795c67]">
            Registro para análise, com ou sem e-mail. Apenas equipe autorizada.
          </span>
        </span>
      </summary>
      <form
        onSubmit={(event) => void submit(event)}
        noValidate={false}
        className="border-t border-[#efdfdf] p-5 sm:p-7"
      >
        <p className="mb-6 max-w-3xl text-sm leading-relaxed text-[#70515d]">
          Preencha com dados fornecidos pela candidata. E-mail é opcional nesta modalidade; quando
          informado, não precisa de confirmação por mensagem para registrar a candidatura. A
          aprovação é feita separadamente pela equipe.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {fields.map(({ name, label, required, type, placeholder }) => (
            <label key={name} className="grid gap-1.5 text-sm font-semibold text-[#604550]">
              {label}
              <input
                name={name}
                type={type ?? "text"}
                required={required}
                min={type === "number" ? 0 : undefined}
                step={type === "number" ? 1 : undefined}
                autoComplete="off"
                placeholder={placeholder}
                disabled={busy || Boolean(receipt)}
                value={values[name]}
                onChange={(event) =>
                  setValues((previous) => ({ ...previous, [name]: event.target.value }))
                }
                className="min-h-12 w-full min-w-0 rounded-xl border border-[#ddc9cf] bg-[#fffbf9] px-3 text-base font-normal text-[#402a33] focus-visible:outline-2 focus-visible:outline-[#824c61]"
              />
            </label>
          ))}
          <label className="grid gap-1.5 text-sm font-semibold text-[#604550]">
            Estado
            <select
              name="state"
              aria-label="Estado"
              required
              disabled={busy || Boolean(receipt)}
              value={values.state}
              onChange={(event) =>
                setValues((previous) => ({ ...previous, state: event.target.value }))
              }
              className="min-h-12 rounded-xl border border-[#ddc9cf] bg-[#fffbf9] px-3 text-base"
            >
              <option value="">Selecione</option>
              {WIZARD_BRAZIL_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="mt-6 flex items-start gap-3 rounded-xl border border-[#ead7d8] bg-[#fcf5f1] p-4 text-sm leading-relaxed text-[#513844]">
          <input
            type="checkbox"
            checked={consent}
            disabled={busy || Boolean(receipt)}
            onChange={(event) => setConsent(event.target.checked)}
            className="mt-1 size-5 shrink-0 accent-[#723e52]"
          />
          <span>
            Confirmo que a candidata autorizou o registro desses dados para análise pela Vonix Hair
            e recebeu informações sobre a finalidade do cadastro. Não estou aceitando os termos em
            nome dela sem autorização.
          </span>
        </label>
        {error && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">
            {error}
          </p>
        )}
        {feedback && (
          <p role="status" className="mt-4 rounded-lg bg-[#f5ece9] p-3 text-sm text-[#623d4b]">
            {feedback}
          </p>
        )}
        {(receipt || pendingReceipt) && (
          <div className="mt-4 rounded-xl border border-[#ddc5cb] p-4">
            <p className="text-sm font-bold">
              {receipt
                ? "Código privado de acompanhamento · inscrição recebida"
                : "Código privado da tentativa · recebimento ainda não confirmado"}
            </p>
            <input
              aria-label="Código privado da candidata"
              readOnly
              type={revealed ? "text" : "password"}
              autoComplete="off"
              spellCheck={false}
              value={receipt || pendingReceipt}
              className="mt-3 min-h-12 w-full rounded-lg border border-[#e3d3d2] px-3 font-sans text-xs"
            />
            <button
              type="button"
              aria-pressed={revealed}
              onClick={() => setRevealed((v) => !v)}
              className="mt-3 mr-2 min-h-11 rounded-xl border border-[#a98792] px-4 text-sm font-semibold"
            >
              {revealed ? "Ocultar código" : "Mostrar código"}
            </button>
            <button
              type="button"
              disabled={copying}
              onClick={() => void copyCode()}
              className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-xl border border-[#a98792] px-4 text-sm font-semibold"
            >
              <ClipboardCopy aria-hidden="true" className="size-4" /> Copiar código
            </button>
            <button
              type="button"
              onClick={downloadCode}
              className="mt-3 ml-2 min-h-11 rounded-xl border border-[#a98792] px-4 text-sm font-semibold"
            >
              Baixar comprovante privado
            </button>
            <p className="mt-2 text-xs text-[#765b66]">
              Não compartilhe o código em grupos nem guarde em planilhas públicas. O código é
              removido da tela ao sair desta aba.
              {!receipt &&
                " O comprovante de tentativa não confirma o recebimento; confira o acompanhamento antes de reenviar."}
            </p>
            {!busy && (
              <div className="mt-4 border-t border-[#ead7d8] pt-3">
                <label className="flex items-start gap-2 text-xs text-[#623d4b]">
                  <input
                    type="checkbox"
                    checked={saved}
                    onChange={(e) => setSaved(e.target.checked)}
                    className="mt-0.5 size-4 shrink-0"
                  />
                  {receipt
                    ? "Já guardei o código em local privado."
                    : "Já guardei o código e conferi a tentativa anterior antes de descartá-la."}
                </label>
                <button
                  type="button"
                  disabled={!saved}
                  onClick={clearReceipt}
                  className="mt-2 min-h-11 rounded-xl border border-[#a98792] px-4 text-sm font-semibold disabled:opacity-50"
                >
                  {receipt
                    ? "Encerrar comprovante e cadastrar outra candidata"
                    : "Descartar tentativa e iniciar novo cadastro"}
                </button>
              </div>
            )}
          </div>
        )}
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <button
            type="submit"
            disabled={busy || !consent || Boolean(receipt)}
            className="min-h-12 rounded-xl bg-[#6f3b4d] px-6 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? "Registrando..." : "Cadastrar para análise"}
          </button>
          <span className="text-xs text-[#7d6970]">
            Nenhum e-mail ou convite é disparado por este cadastro.
          </span>
        </div>
      </form>
    </details>
  );
}
