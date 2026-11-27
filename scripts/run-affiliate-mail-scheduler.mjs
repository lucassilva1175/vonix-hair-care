import { pathToFileURL } from "node:url";

const endpoint = "https://vonixhair.com/api/internal/affiliate-mail-worker";
const MAX_BATCH = 5;
const MAX_RESPONSE_BYTES = 512;
const privateNoStore = (response) =>
  (response.headers.get("cache-control") || "")
    .split(",")
    .some((directive) => directive.trim().toLowerCase() === "no-store");
const exactJson = (response) =>
  (response.headers.get("content-type") || "").split(";")[0].trim().toLowerCase() ===
  "application/json";

// No configurable URL, redirects, retries, raw response logs or credentials in argv.
export async function runAffiliateMailScheduler({
  secret,
  mode = "probe",
  enabled = false,
  fetchImpl = globalThis.fetch,
} = {}) {
  if (mode !== "probe" && mode !== "process") throw new Error("invalid_mode");
  if (mode === "process" && !enabled) throw new Error("schedule_disabled");
  if (typeof secret !== "string" || secret.length < 24 || /\s/.test(secret))
    throw new Error("worker_secret_missing_or_invalid");

  async function request(method) {
    try {
      return await fetchImpl(endpoint, {
        method,
        headers: { authorization: "Bearer " + secret },
        redirect: "error",
        cache: "no-store",
        signal: AbortSignal.timeout(method === "HEAD" ? 15000 : 120000),
      });
    } catch {
      // A failed POST may already have been processed. Never retry here.
      throw new Error(method === "HEAD" ? "probe_unavailable" : "processing_outcome_unknown");
    }
  }

  const probe = await request("HEAD");
  if (
    probe.status !== 204 ||
    probe.headers.get("x-vonix-worker-probe") !== "authenticated-v1" ||
    probe.redirected ||
    !privateNoStore(probe)
  ) {
    throw new Error("authenticated_probe_not_confirmed");
  }
  if (mode === "probe") return { mode, authenticated: true, processed: false };

  const response = await request("POST");
  if (
    response.status !== 200 ||
    response.redirected ||
    !privateNoStore(response) ||
    !exactJson(response)
  )
    throw new Error("processing_response_unconfirmed");
  // Read a bounded response, not an arbitrary provider or proxy error document.
  const reader = response.body?.getReader();
  if (!reader) throw new Error("processing_response_invalid");
  let bytes = 0;
  const decoder = new TextDecoder("utf-8", { fatal: true });
  let raw = "";
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > MAX_RESPONSE_BYTES) throw new Error("processing_response_invalid");
      raw += decoder.decode(value, { stream: true });
    }
    raw += decoder.decode();
  } catch {
    await reader.cancel().catch(() => {});
    throw new Error("processing_response_invalid");
  } finally {
    reader.releaseLock();
  }
  let result;
  try {
    result = JSON.parse(raw);
  } catch {
    throw new Error("processing_response_invalid");
  }
  if (
    !result ||
    typeof result !== "object" ||
    Object.keys(result).sort().join(",") !== "configured,failed,sent" ||
    typeof result.configured !== "boolean" ||
    !Number.isInteger(result.sent) ||
    !Number.isInteger(result.failed) ||
    result.sent < 0 ||
    result.failed < 0 ||
    result.sent + result.failed > MAX_BATCH ||
    (!result.configured && (result.sent !== 0 || result.failed !== 0))
  )
    throw new Error("processing_response_invalid");
  return {
    mode,
    authenticated: true,
    processed: true,
    configured: result.configured,
    accepted: result.sent,
    failed: result.failed,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const mode = process.argv[2] ?? "probe";
  try {
    const result = await runAffiliateMailScheduler({
      secret: process.env.VONIX_AFFILIATE_MAIL_WORKER_SECRET,
      enabled: process.env.VONIX_AFFILIATE_MAIL_SCHEDULE_ENABLED === "true",
      mode,
    });
    console.log(JSON.stringify(result));
    if (result.processed && (!result.configured || result.failed > 0)) process.exitCode = 1;
  } catch {
    // Do not expose exceptions, response content, URLs with parameters or secret material.
    console.error(
      "Vonix worker: verification or processing not confirmed. Check authorized logs before retrying.",
    );
    process.exitCode = 1;
  }
}
