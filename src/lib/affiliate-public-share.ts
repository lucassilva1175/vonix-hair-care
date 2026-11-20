/** Public recruitment information only. Never append applicant or referral tokens. */
export const PUBLIC_AFFILIATE_PAGE = "https://vonixhair.com/seja-afiliada";

export const PUBLIC_AFFILIATE_SHARE_TEXT =
  "Conhece alguém que cria conteúdo sobre cabelos? Conheça o programa de afiliadas Vonix Hair: candidatura gratuita e seleção individual quando disponível. A inscrição não garante aprovação. Confira as condições no site oficial.";

/** No private referral code, applicant details or tracking parameters. */
export const PUBLIC_AFFILIATE_SHARE_MESSAGE =
  PUBLIC_AFFILIATE_SHARE_TEXT + "\n" + PUBLIC_AFFILIATE_PAGE;

/** This link only acts when the visitor deliberately opens it. */
export const PUBLIC_AFFILIATE_WHATSAPP_URL =
  "https://wa.me/?text=" + encodeURIComponent(PUBLIC_AFFILIATE_SHARE_MESSAGE);
