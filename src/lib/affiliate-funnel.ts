import { track } from "@/lib/analytics";

/**
 * Only names of anonymous, aggregate steps. No applicant input, field names,
 * private receipts, URLs, identifiers or sensitive metadata leave this module.
 * Unlike sign_up, these custom events do not map to a Meta Lead.
 */
export type AffiliateFunnelEvent =
  | "affiliate_application_interest"
  | "affiliate_form_visible"
  | "affiliate_form_started"
  | "affiliate_form_invalid";

export function trackAffiliateFunnel(event: AffiliateFunnelEvent): void {
  track(event);
}
