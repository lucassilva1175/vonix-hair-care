/** Scope document privacy to the four protected affiliate surfaces only.
 * These values are also present in page metadata; the origin headers prevent
 * intermediaries from treating a protected document as a public cache entry.
 */
const privateAffiliatePaths = new Set([
  "/admin/afiliadas",
  "/acesso-equipe-afiliadas",
  "/acompanhar-inscricao",
  "/consultar-candidatura",
]);

export function applyAffiliatePrivatePageHeaders(request: Request, response: Response): Response {
  if (request.method !== "GET" && request.method !== "HEAD") return response;
  const path = new URL(request.url).pathname.replace(/\/+$/, "");
  if (!privateAffiliatePaths.has(path)) return response;
  // Reuse body/status and preserve existing Set-Cookie and security headers.
  const result = new Response(response.body, response);
  result.headers.set("Referrer-Policy", "no-referrer");
  result.headers.set("Cache-Control", "private, no-store, max-age=0");
  result.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return result;
}
