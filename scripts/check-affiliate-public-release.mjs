import { pathToFileURL } from "node:url";

const official = "https://vonixhair.com";
const aliases = [
  "https://vonix-haircare-showcase.lovable.app",
  "https://vonixhaircosmeticos.com.br",
];
const worker = "/api/internal/affiliate-mail-worker";
const landing = "/seja-afiliada";
const privatePages = [
  "/consultar-candidatura",
  "/acompanhar-inscricao",
  "/acesso-equipe-afiliadas",
  "/admin/afiliadas",
];
const routes = [landing, ...privatePages, worker];
const entryPattern = /^index-[A-Za-z0-9_-]+\.js$/;
const directives = (value) => (value ?? "").split(",").map((x) => x.trim().toLowerCase());
const header = (response, name) => response.headers.get(name);
const isRedirect = (status) => [301, 302, 307, 308].includes(status);
async function readLandingMarker(response) {
  const reader = response.body?.getReader();
  if (!reader) return null;
  let text = "",
    bytes = 0;
  const decoder = new TextDecoder();
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > 1024 * 1024) return null;
      text += decoder.decode(value, { stream: true });
    }
    text += decoder.decode();
    const entry = text.match(/assets\/(index-[A-Za-z0-9_-]+\.js)/)?.[1] ?? null;
    return {
      entry,
      shortlist: text.includes("Montar minha lista de referências"),
      tracking: text.includes("Já me inscrevi"),
    };
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

/** Read-only release acceptance, not evidence of real application/notification delivery.
 * Fixed domains, no credentials, no redirects followed, no private response body retained.
 */
export async function checkAffiliatePublicRelease({
  fetchImpl = globalThis.fetch,
  expectedEntry,
  strictReferrer = false,
} = {}) {
  if (expectedEntry !== undefined && !entryPattern.test(expectedEntry))
    throw new Error("invalid_expected_entry");
  const results = [];
  let deployedEntry = null;
  for (const domain of [official, ...aliases]) {
    for (const route of routes) {
      for (const method of ["GET", "HEAD"]) {
        const row = { domain, route, method, ok: false, issues: [], warnings: [] };
        let response;
        try {
          response = await fetchImpl(domain + route, {
            method,
            redirect: "manual",
            cache: "no-store",
            credentials: "omit",
            signal: AbortSignal.timeout(12000),
          });
          row.status = response.status;
          if (response.redirected) row.issues.push("unexpected_followed_redirect");
          if (domain !== official && isRedirect(response.status)) {
            const location = header(response, "location");
            if (!location || new URL(location, domain).href !== official + route)
              row.issues.push("unexpected_alias_redirect");
            else row.canonicalRedirect = true;
          } else {
            // A separate direct-serving alias can create a second authentication realm.
            if (domain !== official)
              (strictReferrer ? row.issues : row.warnings).push("alias_not_canonical");
            const expected = route === worker ? (method === "GET" ? 405 : 401) : 200;
            if (response.status !== expected) row.issues.push("unexpected_status");
            if (route !== landing) {
              const cache = directives(header(response, "cache-control"));
              if (
                !cache.includes("no-store") ||
                !cache.includes("private") ||
                cache.includes("public") ||
                cache.some((x) => /^s-maxage\s*=/.test(x))
              )
                row.issues.push("private_cache_missing");
              const robots = directives(header(response, "x-robots-tag"));
              if (!robots.includes("noindex")) row.issues.push("noindex_missing");
              if (
                !robots.includes("nofollow") ||
                !robots.includes("noarchive") ||
                robots.includes("index") ||
                robots.includes("follow") ||
                robots.includes("archive")
              )
                row.issues.push("robots_privacy_incomplete");
              if (header(response, "referrer-policy")?.trim().toLowerCase() !== "no-referrer") {
                (strictReferrer ? row.issues : row.warnings).push("edge_referrer_policy_mismatch");
              }
            }
            if (
              route === worker &&
              method === "GET" &&
              !directives(header(response, "allow")).includes("post")
            )
              row.issues.push("worker_allow_missing");
            if (route === worker && header(response, "x-vonix-worker-probe"))
              row.issues.push("anonymous_probe_marker");
            if (route === landing && method === "GET" && response.status === 200) {
              const marker = await readLandingMarker(response);
              row.marker = marker;
              if (!marker?.entry || !marker.shortlist || !marker.tracking)
                row.issues.push("release_marker_missing");
              if (expectedEntry && marker?.entry !== expectedEntry)
                row.issues.push("release_entry_mismatch");
              if (domain === official) deployedEntry = marker?.entry ?? null;
              else if (marker?.entry !== deployedEntry) row.issues.push("domain_entry_mismatch");
            }
          }
          row.ok = row.issues.length === 0;
        } catch {
          row.issues.push("request_or_validation_failed");
          row.ok = false;
        } finally {
          // Never read, store or log a private page or worker body.
          await response?.body?.cancel().catch(() => {});
        }
        results.push(row);
      }
    }
  }
  return {
    ok: results.every((row) => row.ok),
    checked: results.length,
    domains: [official, ...aliases],
    strictReferrer,
    strictPublicChecksPassed: strictReferrer && results.every((row) => row.ok),
    candidateEntryMatched: expectedEntry !== undefined && expectedEntry === deployedEntry,
    productionAcceptanceVerified: false,
    deployedEntry,
    warningCount: results.reduce((n, row) => n + row.warnings.length, 0),
    readOnly: true,
    realApplicationTested: false,
    realDeliveryTested: false,
    results,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    const args = process.argv.slice(2);
    let expectedEntry;
    let strictReferrer = false;
    for (const arg of args) {
      if (arg === "--strict-referrer") strictReferrer = true;
      else if (arg.startsWith("--expected-entry=") && expectedEntry === undefined)
        expectedEntry = arg.slice("--expected-entry=".length);
      else throw new Error("invalid_argument");
    }
    const report = await checkAffiliatePublicRelease({ expectedEntry, strictReferrer });
    console.log(JSON.stringify(report, null, 2));
    if (!report.ok) process.exitCode = 1;
  } catch {
    console.error("Vonix public release audit: invalid input or verification failed.");
    process.exitCode = 1;
  }
}
