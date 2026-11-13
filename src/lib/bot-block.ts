/**
 * Bloqueia o robô de Hong Kong e da China que lota o site e o Google Analytics (13/11/2026: ~5,4 mil visitas falsas
 * em 7 dias, 93% "Direct", 1 s de duração, quase todas em /loja). O Cloudflare informa o país no cabeçalho `cf-ipcountry`.
 * Sem o cabeçalho (ou com país de clientes), nada é bloqueado. Para desfazer: esvazie BLOCKED_COUNTRIES.
 */
export const BLOCKED_COUNTRIES: readonly string[] = ["HK", "CN"];

export function isBlockedCountry(country: string | null | undefined): boolean {
  if (!country) return false;
  return BLOCKED_COUNTRIES.includes(country.trim().toUpperCase());
}

export function blockedResponse(): Response {
  return new Response("Acesso indisponível na sua região.", {
    status: 403,
    headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
  });
}
