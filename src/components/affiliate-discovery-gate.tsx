import { useEffect, useRef, type ReactNode } from "react";
import { ArrowUpRight, ChevronDown, Film, Images } from "lucide-react";
import { AffiliateApplyLink } from "@/components/affiliate-apply-link";

/**
 * Optional editorial continuation, not the application workflow.
 * Native <details> keeps all genuine media and sources in the DOM while
 * letting visitors finish the signup journey without an 8k-pixel detour.
 * Direct fragment links must reveal the content before scrolling to it.
 */
export function AffiliateDiscoveryGate({
  children,
  recruitmentOpen = false,
  onSafePreview,
}: {
  children: ReactNode;
  recruitmentOpen?: boolean;
  onSafePreview?: (() => void) | undefined;
}) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const targetForHash = (hash: string) => {
      if (!hash.startsWith("#") || hash.length < 2) return null;
      let id: string;
      try {
        id = decodeURIComponent(hash.slice(1));
      } catch {
        return null;
      }
      const target = document.getElementById(id);
      return target && node.contains(target) ? target : null;
    };

    const reveal = (hash: string, scroll: boolean) => {
      const target = targetForHash(hash);
      if (!target) return;
      node.open = true;
      if (scroll) {
        window.requestAnimationFrame(() => {
          if (node.isConnected && node.open) target.scrollIntoView({ block: "start" });
        });
      }
    };

    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLAnchorElement>('a[href^="#"]');
      const hash = link?.getAttribute("href");
      if (hash) reveal(hash, false);
    };

    const onHash = () => reveal(window.location.hash, true);
    const pauseHiddenMedia = () => {
      node.querySelectorAll("video").forEach((video) => {
        if (!video.paused) video.pause();
      });
    };
    const onToggle = () => {
      if (!node.open) pauseHiddenMedia();
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") pauseHiddenMedia();
    };

    // Mark the disclosure interactive only after the listeners are attached.
    node.setAttribute("data-interactive", "true");
    document.addEventListener("click", onClick);
    window.addEventListener("hashchange", onHash);
    node.addEventListener("toggle", onToggle);
    document.addEventListener("visibilitychange", onVisibility);
    onHash();

    return () => {
      node.removeAttribute("data-interactive");
      document.removeEventListener("click", onClick);
      window.removeEventListener("hashchange", onHash);
      node.removeEventListener("toggle", onToggle);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <details
      ref={ref}
      data-testid="affiliate-c96-discovery-gate"
      className="group/discover scroll-mt-32 border-y border-[#dec9c7] bg-[#fbf5f1] text-[#533744]"
    >
      <summary
        data-testid="affiliate-c96-discovery-summary"
        className="mx-auto flex min-h-52 max-w-7xl cursor-pointer list-none flex-col gap-6 px-5 py-8 focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[#875266] sm:flex-row sm:items-center sm:justify-between sm:py-9 [&::-webkit-details-marker]:hidden"
      >
        <div className="min-w-0 max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[.14em] text-[#8b5367]">
            Uma viagem pelo universo capilar
          </p>
          <h2 className="mt-2 font-display text-[clamp(1.8rem,3vw,2.6rem)] leading-tight text-[#513541]">
            Conheça a Vonix além da inscrição.
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-[1.65] text-[#765c67]">
            Veja as avaliações completas dos clientes sobre os produtos, vídeos do catálogo e ideias
            de conteúdo para apresentar seu estilo. Tudo opcional: você não precisa assistir aos
            vídeos para se candidatar.
          </p>
          <p className="mt-2 text-[11px] leading-[1.6] text-[#806b73]">
            As imagens são do acervo editorial Vonix; as avaliações são de clientes sobre produtos,
            não relatos de afiliadas aprovadas.
          </p>
          <span className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full border border-[#b58d9c] bg-white px-5 py-2 text-sm font-bold text-[#75465a] shadow-sm transition-colors group-hover/discover:bg-[#f6e7eb]">
            <span className="group-open/discover:hidden">Explorar fotos, vídeos e ideias</span>
            <span className="hidden group-open/discover:inline">
              Recolher conteúdo complementar
            </span>
            <ChevronDown
              aria-hidden="true"
              className="size-4 transition-transform group-open/discover:rotate-180 motion-reduce:transition-none"
            />
          </span>
        </div>
        <div
          aria-hidden="true"
          className="flex items-center justify-center gap-2 self-start rounded-[1.5rem] bg-[#efe0df] p-2 sm:shrink-0 sm:self-center"
        >
          <img
            src="/images/categorias/nutricao.jpg"
            alt=""
            loading="lazy"
            decoding="async"
            width={480}
            height={480}
            className="h-24 w-24 rounded-xl object-cover sm:h-32 sm:w-32"
          />
          <div className="relative">
            <img
              src="/images/categorias/reconstrucao.jpg"
              alt=""
              loading="lazy"
              decoding="async"
              width={480}
              height={480}
              className="h-24 w-24 rounded-xl object-cover sm:h-32 sm:w-32"
            />
            <div className="absolute -bottom-1 -left-1 grid size-9 place-items-center rounded-full border border-white/70 bg-[#713f52] text-white">
              <Film aria-hidden="true" className="size-4" />
            </div>
          </div>
          <Images aria-hidden="true" className="size-5 text-[#87566a] sm:ml-2" />
        </div>
      </summary>
      <div data-testid="affiliate-c96-discovery-content" className="border-t border-[#ead8d4]">
        {children}
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 border-t border-[#e5d1ce] px-5 py-7">
          <p className="max-w-lg text-xs leading-6 text-[#785c68]">
            Os conteúdos acima são ilustrativos e não comprovam parcerias de afiliadas.
          </p>
          <AffiliateApplyLink
            recruitmentOpen={recruitmentOpen}
            onSafePreview={onSafePreview}
            data-testid="affiliate-c129-discovery-footer-cta"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[#713f52] px-5 py-2 text-sm font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#713f52]"
          >
            {recruitmentOpen ? "Voltar à inscrição" : "Abrir prévia segura"}
            <ArrowUpRight aria-hidden="true" className="size-4" />
          </AffiliateApplyLink>
        </div>
      </div>
    </details>
  );
}
