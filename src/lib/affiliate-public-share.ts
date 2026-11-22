/** Public recruitment information only. Never append applicant or referral tokens. */
export const PUBLIC_AFFILIATE_PAGE = "https://vonixhair.com/seja-afiliada";

export const PUBLIC_AFFILIATE_SHARE_TEXT =
  "Você cria conteúdo sobre cabelos e autocuidado? ✨ Conheça a seleção de afiliadas Vonix Hair: candidatura gratuita, sem compra de produtos ou estoque para se candidatar. Após aprovação, a comissão é de 8% sobre vendas confirmadas e pagas, conforme as condições do programa. A seleção é individual e não garante aprovação nem ganhos. Confira a disponibilidade e as regras no site oficial.";

/** No private referral code, applicant details or tracking parameters. */
export const PUBLIC_AFFILIATE_SHARE_MESSAGE =
  PUBLIC_AFFILIATE_SHARE_TEXT + "\n" + PUBLIC_AFFILIATE_PAGE;

/** This link only acts when the visitor deliberately opens it. */
export const PUBLIC_AFFILIATE_WHATSAPP_URL =
  "https://wa.me/?text=" + encodeURIComponent(PUBLIC_AFFILIATE_SHARE_MESSAGE);
