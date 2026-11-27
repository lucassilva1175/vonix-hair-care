import { track } from "@/lib/analytics";

/**
 * Only names of anonymous, aggregate steps. No applicant input, field names,
 * private receipts, URLs, identifiers or sensitive metadata leave this module.
 * Unlike sign_up, these custom events do not map to a Meta Lead.
 * The document privacy boundary currently suppresses these calls in production.
 * Keep this event contract separate from the actual aggregate admin counters;
 * do not interpret it as active tracking or introduce a replacement collector.
 */
export type AffiliateFunnelEvent =
  | "affiliate_application_interest"
  | "affiliate_form_visible"
  | "affiliate_form_started"
  | "affiliate_form_invalid"
  | "affiliate_application_confirmed"
  | "affiliate_review_source_open"
  | "affiliate_catalog_source_open";

export function trackAffiliateFunnel(event: AffiliateFunnelEvent): void {
  track(event);
}
