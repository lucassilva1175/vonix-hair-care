/** A voluntary local backup for the unique, private applicant status receipt.
 * No network requests, third-party share intent, PII or analytics.
 */
const CODE = /^[A-Za-z0-9_-]{32}$/;

export const pendingReceiptSessionKey = "vonix-affiliate-unconfirmed-code";
export const oneTimeReceiptSessionKey = "vonix-affiliate-once-code";

/** Explicit one-time transfer, with readback. Never overwrite a different code
 * if the current tab still holds an unconsumed handoff. */
export function reserveOneTimeReceipt(code: string): boolean {
  if (!CODE.test(code)) return false;
  try {
    const previous = window.sessionStorage.getItem(oneTimeReceiptSessionKey);
    if (previous && CODE.test(previous) && previous !== code) return false;
    window.sessionStorage.setItem(oneTimeReceiptSessionKey, code);
    return window.sessionStorage.getItem(oneTimeReceiptSessionKey) === code;
  } catch {
    return false;
  }
}

export function consumeOneTimeReceipt(): { code: string; consumed: boolean } | null {
  let code = "";
  try {
    code = window.sessionStorage.getItem(oneTimeReceiptSessionKey) ?? "";
    if (!CODE.test(code)) return null;
    window.sessionStorage.removeItem(oneTimeReceiptSessionKey);
    return { code, consumed: window.sessionStorage.getItem(oneTimeReceiptSessionKey) === null };
  } catch {
    return CODE.test(code) ? { code, consumed: false } : null;
  }
}

/** Cleanup is best-effort in restricted browser implementations. */
function revokeReceiptUrl(url: string) {
  try {
    URL.revokeObjectURL?.(url);
  } catch {
    // Do not throw from an asynchronous cleanup or mask the initial failure.
  }
}
export const maxPrivateReceiptBytes = 4096;

/** Reserve a fresh code without replacing another valid attempt in this tab.
 * Storage failure retains the existing in-memory recovery contract. */
export function reservePendingReceipt(
  code: string,
): { status: "reserved" | "unavailable" } | { status: "conflict"; code: string } {
  if (!CODE.test(code)) return { status: "unavailable" };
  try {
    const previous = window.sessionStorage.getItem(pendingReceiptSessionKey);
    if (previous && CODE.test(previous) && previous !== code)
      return { status: "conflict", code: previous };
    window.sessionStorage.setItem(pendingReceiptSessionKey, code);
    const current = window.sessionStorage.getItem(pendingReceiptSessionKey);
    if (current === code) return { status: "reserved" };
    if (current && CODE.test(current)) return { status: "conflict", code: current };
    return { status: "unavailable" };
  } catch {
    return { status: "unavailable" };
  }
}

/** Local recovery only: never look up a saved attempt until the user asks. */
export function readPendingReceiptCode(): string | null {
  try {
    const saved = window.sessionStorage.getItem(pendingReceiptSessionKey) ?? "";
    return CODE.test(saved) ? saved : null;
  } catch {
    return null;
  }
}

/** Decode only a single exact code or a Vonix-generated text receipt. The
 * receipt's claimed status is never trusted; only the server can confirm it. */
export function parseAffiliatePrivateReceipt(text: string): string | null {
  if (text.length > maxPrivateReceiptBytes) return null;
  const trimmed = text.trim();
  if (CODE.test(trimmed)) return trimmed;
  const lines = trimmed.split(/\r?\n/);
  if (lines[0] !== "VONIX HAIR — CÓDIGO PRIVADO DA CANDIDATURA") return null;
  if (!["INSCRIÇÃO RECEBIDA", "TENTATIVA AINDA NÃO CONFIRMADA"].includes(lines[1] ?? ""))
    return null;
  const candidates = lines.filter((line) => line.startsWith("Código privado:"));
  if (candidates.length !== 1) return null;
  const match = /^Código privado: ([A-Za-z0-9_-]{32})$/.exec(candidates[0] ?? "");
  return match?.[1] ?? null;
}

/** Only clear the matching, independently confirmed attempt, on explicit user action.
 * Storage may be disabled or silently ignore removals. Do not touch another code. */
export function hasMatchingPendingReceipt(code: string): boolean {
  if (!CODE.test(code)) return false;
  try {
    return window.sessionStorage.getItem(pendingReceiptSessionKey) === code;
  } catch {
    return false;
  }
}

export function releasePendingReceipt(code: string): "cleared" | "not-matching" | "unavailable" {
  if (!CODE.test(code)) return "not-matching";
  try {
    if (window.sessionStorage.getItem(pendingReceiptSessionKey) !== code) return "not-matching";
    window.sessionStorage.removeItem(pendingReceiptSessionKey);
    return window.sessionStorage.getItem(pendingReceiptSessionKey) === null
      ? "cleared"
      : "unavailable";
  } catch {
    return "unavailable";
  }
}

export function clearMatchingPendingReceipt(code: string): boolean {
  return releasePendingReceipt(code) === "cleared";
}

export function affiliatePrivateReceiptText(code: string, confirmed: boolean): string {
  if (!CODE.test(code)) return "";
  const status = confirmed ? "INSCRIÇÃO RECEBIDA" : "TENTATIVA AINDA NÃO CONFIRMADA";
  return [
    "VONIX HAIR — CÓDIGO PRIVADO DA CANDIDATURA",
    status,
    "",
    "Código privado: " + code,
    "Consulte sua candidatura: https://vonixhair.com/consultar-candidatura",
    "",
    confirmed
      ? "Guarde este arquivo para consultar o resultado. Não compartilhe seu código."
      : "Este código não comprova que sua candidatura foi salva. Consulte o portal antes de tentar novamente.",
    "Este arquivo contém um código privado de acesso. Guarde-o em local seguro e não encaminhe.",
    "",
  ].join("\n");
}

export function downloadAffiliatePrivateReceipt(code: string, confirmed: boolean): boolean {
  const content = affiliatePrivateReceiptText(code, confirmed);
  if (
    !content ||
    typeof document === "undefined" ||
    typeof window === "undefined" ||
    typeof URL.createObjectURL !== "function"
  )
    return false;
  let objectUrl: string | null = null;
  try {
    objectUrl = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = "vonixhair-codigo-candidatura.txt";
    link.rel = "noopener noreferrer";
    link.hidden = true;
    document.body.appendChild(link);
    try {
      link.click();
    } finally {
      link.remove();
    }
    // Browsers may not have finished initiating the download immediately.
    // The private Blob URL is always revoked after the brief handoff.
    const privateBlobUrl = objectUrl;
    window.setTimeout(() => revokeReceiptUrl(privateBlobUrl), 30000);
    return true;
  } catch {
    if (objectUrl) revokeReceiptUrl(objectUrl);
    return false;
  }
}
