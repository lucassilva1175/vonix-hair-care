/**
 * Arithmetic examples for the PUBLIC affiliate landing only.
 * Never use this function to determine eligibility or payable commissions.
 */
/** Parse unambiguous Brazilian real amounts. A dot is a thousands separator,
 * not a decimal separator. Blank and incomplete fractions are editing states. */
export function parseIllustrativeSales(value: string): number | null {
  const clean = value
    .trim()
    .replace(/^R\$\s*/, "")
    .trim();
  if (clean === "") return 0;
  if (!/^(?:\d{1,8}|\d{1,3}(?:\.\d{3}){1,2})(?:,\d{0,2})?$/.test(clean)) return null;
  const n = Number(clean.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

export function illustrativeEarnings(input: number) {
  const sales = Number.isFinite(input) ? Math.min(20000, Math.max(0, input)) : 0;
  const salesCents = Math.round(sales * 100);
  const commissionCents = Math.round((salesCents * 8) / 100);
  const bonusCents = Math.floor(salesCents / 1000000) * 50000;
  return {
    sales: salesCents / 100,
    commission: commissionCents / 100,
    bonus: bonusCents / 100,
    total: (commissionCents + bonusCents) / 100,
  };
}
