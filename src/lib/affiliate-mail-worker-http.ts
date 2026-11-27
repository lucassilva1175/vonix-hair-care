/** This boundary is pure: no environment, database, or mail provider access. */
export const affiliateMailWorkerPath = "/api/internal/affiliate-mail-worker";
export const affiliateMailWorkerPrivateHeaders = {
  "cache-control": "private, no-store, max-age=0",
  "referrer-policy": "no-referrer",
  "x-robots-tag": "noindex, nofollow, noarchive",
  "x-content-type-options": "nosniff",
};
export function isAffiliateMailWorkerRequest(request: Request): boolean {
  try {
    return (
      decodeURIComponent(new URL(request.url).pathname).replace(/\/+$/, "").toLowerCase() ===
      affiliateMailWorkerPath
    );
  } catch {
    return false;
  }
}
export function unsupportedAffiliateMailWorkerMethod(method: string): Response | null {
  if (method === "POST" || method === "HEAD") return null;
  return new Response("method not allowed", {
    status: 405,
    headers: {
      ...affiliateMailWorkerPrivateHeaders,
      allow: "POST, HEAD",
      "content-type": "text/plain; charset=utf-8",
    },
  });
}
export function applyAffiliateMailWorkerHeaders(request: Request, response: Response): Response {
  if (!isAffiliateMailWorkerRequest(request)) return response;
  const out = new Response(response.body, response);
  for (const [key, value] of Object.entries(affiliateMailWorkerPrivateHeaders))
    out.headers.set(key, value);
  return out;
}
