/** Scope document privacy to the four protected affiliate surfaces only.
 * These values are also present in page metadata; the origin headers prevent
 * intermediaries from treating a protected document as a public cache entry.
 */
import { isPrivateAffiliateDocumentPath } from "./affiliate-document-privacy";

export function applyAffiliatePrivatePageHeaders(request: Request, response: Response): Response {
  if (request.method !== "GET" && request.method !== "HEAD") return response;
  if (!isPrivateAffiliateDocumentPath(new URL(request.url).pathname)) return response;
  // Reuse body/status and preserve existing Set-Cookie and security headers.
  const result = new Response(response.body, response);
  result.headers.set("Referrer-Policy", "no-referrer");
  result.headers.set("Cache-Control", "private, no-store, max-age=0");
  result.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  return result;
}
