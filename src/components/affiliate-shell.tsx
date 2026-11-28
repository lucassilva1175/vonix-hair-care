import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Instagram, Menu } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import logoUrl from "@/assets/vonix-logo.webp";
import { INSTAGRAM } from "@/lib/store";
import { AffiliateApplyLink } from "@/components/affiliate-apply-link";

/**
 * Dedicated recruitment chrome: the store's search, product audiences, sales
 * ticker and shopping popup distract from the simplified application on mobile.
 * Keep that commerce layout untouched for every other route.
 */
export function AffiliateShell({
  children,
  mode = "landing",
  recruitmentStatus = "loading",
  onSafePreview,
  showCatalogLink = false,
}: {
  children: ReactNode;
  mode?: "landing" | "account";
  recruitmentStatus?: "loading" | "open" | "limited" | "closed" | "unavailable";
  onSafePreview?: (() => void) | undefined;
  showCatalogLink?: boolean;
}) {
  const mobileMenuRef = useRef<HTMLDetailsElement | null>(null);
  const closeMobileMenu = () => {
    if (mobileMenuRef.current) mobileMenuRef.current.open = false;
  };

  useEffect(() => {
    if (mode !== "landing") return;
    const dismissOutside = (event: PointerEvent) => {
      const menu = mobileMenuRef.current;
      if (menu?.open && event.target instanceof Node && !menu.contains(event.target)) {
        menu.open = false;
      }
    };
    document.addEventListener("pointerdown", dismissOutside);
    return () => document.removeEventListener("pointerdown", dismissOutside);
  }, [mode]);

  return (
    <div
      data-testid="vonix-affiliate-shell"
      className="min-h-screen min-w-0 bg-background text-foreground"
    >
      <style>{`
        [data-testid="vonix-affiliate-shell"] {
          --background: oklch(0.99 0.006 60); --foreground: oklch(0.28 0.04 10);
          --card: oklch(0.98 0.012 60); --card-foreground: var(--foreground);
          --primary: oklch(0.38 0.09 10); --primary-foreground: oklch(0.98 0.008 60);
          --secondary: oklch(0.92 0.025 30); --secondary-foreground: var(--foreground);
          --muted: oklch(0.94 0.018 60); --muted-foreground: oklch(0.43 0.04 10);
          --accent: oklch(0.90 0.035 20); --accent-foreground: var(--primary);
          --border: oklch(0.80 0.025 20); --input: var(--border); --ring: var(--primary);
          letter-spacing: 0;
          --shadow-sm: 0 2px 6px color-mix(in oklch, var(--primary) 10%, transparent);
        }
        [data-testid="vonix-affiliate-shell"] :is(button,a[role="button"],a[href^="#"],header a) { min-height: 44px; }
        [data-testid="vonix-affiliate-shell"] h1 { color: var(--foreground); }
        [data-testid="vonix-affiliate-shell"] section { min-width: 0; }
        [data-testid="vonix-affiliate-shell"] footer { --ring: var(--primary-foreground);
        }
        [data-testid="vonix-affiliate-shell"] :is(a,button,input,summary):focus-visible {
          outline: 2px solid var(--ring); outline-offset: 4px;
        }
        [data-testid="vonix-affiliate-shell"] footer { --muted-foreground: var(--primary-foreground); }
        [data-testid="vonix-affiliate-shell"] footer a { min-height: 44px; display: inline-flex; align-items: center; }
        @media (prefers-reduced-motion: reduce) {
          [data-testid="vonix-affiliate-shell"] *, [data-testid="vonix-affiliate-shell"] *::before, [data-testid="vonix-affiliate-shell"] *::after {
            animation: none !important; transition: none !important; scroll-behavior: auto !important;
          }
        }
      `}</style>
      <a
        href="#conteudo-afiliadas"
        className="sr-only rounded-md bg-background px-4 py-2 text-muted-foreground focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[90]"
      >
        Pular para o conteúdo
      </a>
      <header className="sticky top-0 z-50 border-b border-border bg-background shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex min-h-[4.5rem] max-w-7xl items-center justify-between gap-2 px-3 sm:gap-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <Link
              reloadDocument
              to="/"
              aria-label="Voltar à loja Vonix Hair"
              className="inline-flex shrink-0 items-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring"
            >
              <img
                src={logoUrl}
                alt="Vonix Hair"
                className="h-8 w-auto object-contain sm:h-[2.6rem]"
                width={109}
                height={43}
              />
            </Link>
            <span aria-hidden="true" className="hidden h-6 w-px bg-background sm:block" />
            <span className="hidden text-[10px] font-bold uppercase tracking-normal text-muted-foreground sm:block">
              Universo de criadoras
            </span>
          </div>

          {mode === "landing" && (
            <nav
              aria-label="Navegação da seleção de afiliadas"
              className="hidden items-center gap-3 xl:flex"
            >
              <Link
                to="/consultar-candidatura"
                data-testid="affiliate-c112-returning-desktop"
                className="inline-flex min-h-11 items-center rounded-full border border-[#d7bec4] bg-[#faf2ef] px-3 text-xs font-bold text-[#754256] transition hover:bg-[#f1e5e6] focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                Já me inscrevi
              </Link>
              <a
                href="#ganhos"
                className="inline-flex min-h-11 items-center text-sm font-medium text-primary"
              >
                Comissão e bônus
              </a>
              <a
                href="#como-funciona"
                className="inline-flex min-h-11 items-center text-sm font-medium text-primary"
              >
                Como funciona
              </a>
              <a
                href="#avaliacoes-rapidas"
                className="inline-flex min-h-11 items-center text-sm font-medium text-primary"
              >
                Avaliações de produtos
              </a>
              {showCatalogLink && (
                <a
                  href="#vitrine-afiliadas"
                  className="inline-flex min-h-11 items-center text-sm font-medium text-primary"
                >
                  Vitrine de produtos
                </a>
              )}
              <a
                href="#duvidas"
                className="inline-flex min-h-11 items-center text-sm font-medium text-primary"
              >
                Dúvidas
              </a>
            </nav>
          )}

          {mode === "landing" && (
            <details
              ref={mobileMenuRef}
              data-testid="affiliate-c138-mobile-menu"
              className="relative shrink-0 sm:hidden"
              onBlur={(event) => {
                if (
                  event.relatedTarget instanceof Node &&
                  !event.currentTarget.contains(event.relatedTarget)
                ) {
                  event.currentTarget.open = false;
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  event.currentTarget.open = false;
                  event.currentTarget.querySelector("summary")?.focus();
                }
              }}
            >
              <summary
                data-testid="affiliate-c138-mobile-menu-trigger"
                aria-label="Explorar seções do programa"
                className="flex size-11 cursor-pointer list-none items-center justify-center rounded-xl border border-[#d7bec4] bg-[#faf2ef] text-[#754256] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring [&::-webkit-details-marker]:hidden"
              >
                <Menu aria-hidden="true" className="size-5" />
              </summary>
              <nav
                data-testid="affiliate-c138-mobile-menu-links"
                aria-label="Seções da seleção no celular"
                className="fixed inset-x-3 top-[4.75rem] z-[70] grid max-h-[calc(100dvh-6rem)] gap-1 overflow-y-auto overscroll-contain rounded-2xl border border-[#dac6c8] bg-[#fffaf7] p-2 text-sm font-semibold text-[#754256] shadow-[0_18px_40px_rgba(65,36,49,.18)]"
              >
                <Link
                  to="/consultar-candidatura"
                  onClick={closeMobileMenu}
                  className="flex items-center rounded-xl bg-[#f0e2e4] px-4 py-3"
                >
                  Já me inscrevi
                </Link>
                <a
                  href="#ganhos"
                  onClick={closeMobileMenu}
                  className="flex items-center rounded-xl px-4 py-3 hover:bg-[#f7ebeb]"
                >
                  Comissão e bônus
                </a>
                <a
                  href="#como-funciona"
                  onClick={closeMobileMenu}
                  className="flex items-center rounded-xl px-4 py-3 hover:bg-[#f7ebeb]"
                >
                  Como funciona
                </a>
                <a
                  href="#avaliacoes-rapidas"
                  onClick={closeMobileMenu}
                  className="flex items-center rounded-xl px-4 py-3 hover:bg-[#f7ebeb]"
                >
                  Avaliações de produtos
                </a>
                {showCatalogLink && (
                  <a
                    href="#vitrine-afiliadas"
                    onClick={closeMobileMenu}
                    className="flex items-center rounded-xl px-4 py-3 hover:bg-[#f7ebeb]"
                  >
                    Vitrine de produtos
                  </a>
                )}
                {showCatalogLink && (
                  <a
                    href="#planejamento-criativo"
                    onClick={closeMobileMenu}
                    className="flex items-center rounded-xl px-4 py-3 hover:bg-[#f7ebeb]"
                  >
                    Planejamento semanal
                  </a>
                )}
                <a
                  href="#duvidas"
                  onClick={closeMobileMenu}
                  className="flex items-center rounded-xl px-4 py-3 hover:bg-[#f7ebeb]"
                >
                  Dúvidas
                </a>
              </nav>
            </details>
          )}

          {mode === "landing" ? (
            <AffiliateApplyLink
              recruitmentOpen={recruitmentStatus === "open"}
              onSafePreview={onSafePreview}
              data-testid="affiliate-c127-header-apply"
              onClick={closeMobileMenu}
              title={
                recruitmentStatus === "open"
                  ? "Ir à candidatura"
                  : "Abrir uma prévia segura do formulário"
              }
              className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring sm:px-5 sm:text-sm"
            >
              <span className="sm:hidden">
                {recruitmentStatus === "open" ? "Quero participar" : "Ver inscrição"}
              </span>
              <span className="hidden sm:inline">
                {recruitmentStatus === "open" ? "Enviar candidatura" : "Conhecer a inscrição"}
              </span>
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
              {recruitmentStatus !== "open" && (
                <span className="sr-only"> (abre prévia segura, sem enviar dados)</span>
              )}
            </AffiliateApplyLink>
          ) : (
            <Link
              to="/seja-afiliada"
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground sm:px-5 sm:text-sm"
            >
              Programa de afiliadas <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          )}
        </div>
        {mode === "landing" && (
          <nav
            aria-label="Acesso rápido ao programa"
            className="hidden w-full max-w-full snap-x snap-proximity items-center justify-start gap-3 overflow-x-auto overscroll-x-contain border-t border-border px-4 text-xs sm:flex xl:hidden"
            tabIndex={0}
          >
            <Link
              to="/consultar-candidatura"
              data-testid="affiliate-c112-returning-mobile"
              className="inline-flex min-h-11 shrink-0 snap-start items-center rounded-lg bg-[#f0e2e4] px-3 font-bold text-[#754256]"
            >
              Já me inscrevi
            </Link>
            <a
              href="#ganhos"
              className="inline-flex min-h-11 shrink-0 snap-start items-center px-1 font-semibold text-primary"
            >
              Comissão e bônus
            </a>
            <a
              href="#como-funciona"
              className="inline-flex min-h-11 shrink-0 snap-start items-center px-1 text-primary"
            >
              Como funciona
            </a>
            <a
              href="#avaliacoes-rapidas"
              className="inline-flex min-h-11 shrink-0 snap-start items-center px-1 text-primary"
            >
              Avaliações de produtos
            </a>
            {showCatalogLink && (
              <a
                href="#vitrine-afiliadas"
                className="inline-flex min-h-11 shrink-0 snap-start items-center px-1 text-primary"
              >
                Vitrine de produtos
              </a>
            )}
            {showCatalogLink && (
              <a
                href="#planejamento-criativo"
                className="inline-flex min-h-11 shrink-0 snap-start items-center px-1 text-primary"
              >
                Planejamento semanal
              </a>
            )}
            <a
              href="#duvidas"
              className="inline-flex min-h-11 shrink-0 snap-start items-center px-1 pr-2 text-primary"
            >
              Dúvidas
            </a>
          </nav>
        )}
      </header>

      <main id="conteudo-afiliadas" tabIndex={-1} className="scroll-mt-36">
        {children}
      </main>

      <footer
        className={
          "bg-primary px-5 py-12 text-muted-foreground sm:py-14 " +
          (mode === "landing" ? "max-md:pb-[calc(7rem+env(safe-area-inset-bottom))]" : "")
        }
      >
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <Link
              reloadDocument
              to="/"
              aria-label="Ir para o e-commerce Vonix Hair"
              className="inline-block rounded-md focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              <span
                role="img"
                aria-label="Vonix Hair"
                className="block h-12 w-[7.8rem]"
                style={{
                  aspectRatio: "420 / 163",
                  background:
                    "linear-gradient(135deg, #b8862b 0%, #f3d98a 38%, #c9992f 62%, #f0cf7a 100%)",
                  WebkitMaskImage: "url(" + logoUrl + ")",
                  maskImage: "url(" + logoUrl + ")",
                  WebkitMaskRepeat: "no-repeat",
                  maskRepeat: "no-repeat",
                  WebkitMaskSize: "contain",
                  maskSize: "contain",
                  WebkitMaskPosition: "left center",
                  maskPosition: "left center",
                }}
              />
            </Link>
            <p className="mt-4 max-w-lg text-sm leading-[1.8] text-muted-foreground">
              Inscrição e seleção de afiliadas Vonix Hair. A candidatura é gratuita, não garante
              aprovação ou benefícios comerciais e não constitui contrato.
            </p>
          </div>
          <div className="flex flex-col items-start gap-4 text-sm md:items-end">
            <Link
              reloadDocument
              to="/"
              className="inline-flex items-center gap-2 underline decoration-border underline-offset-4 hover:text-primary-foreground"
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Visitar a loja oficial
            </Link>
            <Link
              to="/consultar-candidatura"
              className="underline decoration-border underline-offset-4 hover:text-primary-foreground"
            >
              Acompanhar inscrição por código
            </Link>
            {mode === "landing" && (
              <a
                href="#duvidas"
                className="underline decoration-border underline-offset-4 hover:text-primary-foreground"
              >
                Perguntas frequentes
              </a>
            )}
            <Link
              to="/acompanhar-inscricao"
              className="underline decoration-border underline-offset-4 hover:text-primary-foreground"
            >
              Inscrições antigas por e-mail
            </Link>
            <a
              href="/politica-de-privacidade"
              className="underline decoration-border underline-offset-4 hover:text-primary-foreground"
            >
              Política de Privacidade
            </a>
            <a
              href={INSTAGRAM}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 underline decoration-border underline-offset-4 hover:text-primary-foreground"
            >
              <Instagram aria-hidden="true" className="h-4 w-4" /> Instagram da Vonix Hair
            </a>
          </div>
        </div>
        <div className="mx-auto mt-10 flex max-w-7xl flex-wrap justify-between gap-2 border-t border-white/20 pt-6 text-xs text-muted-foreground">
          <span>Vonix Hair · Programa de inscrição e seleção</span>
          <span>As condições de eventual parceria são comunicadas separadamente.</span>
        </div>
      </footer>
    </div>
  );
}
