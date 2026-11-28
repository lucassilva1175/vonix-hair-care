/** Recruitment and private team documents must not share a browsing realm
 * with commerce marketing or session-replay scripts. Match only our own paths. */
export const affiliateDocumentPaths = [
  "/seja-afiliada",
  "/consultar-candidatura",
  "/acompanhar-inscricao",
  "/acesso-equipe-afiliadas",
  "/admin/afiliadas",
] as const;

function normalizeAffiliatePath(pathname: string): string | null {
  try {
    return decodeURIComponent(pathname).replace(/\/+$/, "").toLowerCase();
  } catch {
    return null;
  }
}

export function isAffiliateDocumentPath(pathname: string): boolean {
  const normalized = normalizeAffiliatePath(pathname);
  return normalized !== null && (affiliateDocumentPaths as readonly string[]).includes(normalized);
}

/** Recruitment is public, but candidate and team documents are never cacheable. */
export function isPrivateAffiliateDocumentPath(pathname: string): boolean {
  const normalized = normalizeAffiliatePath(pathname);
  return (
    normalized !== null &&
    normalized !== "/seja-afiliada" &&
    (affiliateDocumentPaths as readonly string[]).includes(normalized)
  );
}

/** The same path policy in a trusted inline bootstrap, before hydration.
 * Only constant first-party routes are serialized, never URL/user content. */
export const affiliateDocumentCheckScript =
  "(function(){try{return " +
  JSON.stringify(affiliateDocumentPaths) +
  ".indexOf(decodeURIComponent(location.pathname).replace(/\\/+$/,'').toLowerCase())!==-1}catch(e){return false}})()";

/** Snapshot the initial browser document, not the current SPA route. */
const initialBrowserDocumentIsolated =
  typeof window === "undefined" ? null : isAffiliateDocumentPath(window.location.pathname);

export function affiliateDocumentNeedsReload(
  pathname: string,
  initial: boolean | null = initialBrowserDocumentIsolated,
) {
  return initial !== null && isAffiliateDocumentPath(pathname) !== initial;
}

export function affiliateTrackersAllowed(
  pathnames: readonly string[],
  initial: boolean | null = initialBrowserDocumentIsolated,
) {
  return initial !== true && !pathnames.some(isAffiliateDocumentPath);
}
