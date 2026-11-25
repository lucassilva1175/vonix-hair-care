/** Local-only catalogue matching: accent-, punctuation- and order-insensitive.
 * Search terms never enter analytics or leave the browser. */
export function affiliateSearchTerms(value: string): string[] {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

export function matchesAffiliateSearch(label: string, query: string): boolean {
  const searchable = affiliateSearchTerms(label).join(" ");
  return affiliateSearchTerms(query).every((term) => searchable.includes(term));
}
