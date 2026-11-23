import { useEffect, useState } from "react";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import type { RecruitmentStatus } from "@/components/affiliate-editorial-hero";
import { trackAffiliateFunnel } from "@/lib/affiliate-funnel";

/**
 * Only a scroll shortcut to the EXISTING form. No personal data, tracking,
 * navigation away from the page, status override, or submission is involved.
 * If intersection support/targets are missing, do not cover the application.
 */
export function AffiliateMobileApplyBar({
  recruitmentStatus,
  onSafePreview,
}: {
  recruitmentStatus: RecruitmentStatus;
  onSafePreview?: () => void;
}) {
  const [visibility, setVisibility] = useState<{
    hero: boolean | null;
    form: boolean | null;
  }>({ hero: null, form: null });

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const hero = document.querySelector('[data-testid="vonix-affiliate-hero"]');
    const form = document.getElementById("inscricao");
    if (!hero || !form) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setVisibility((previous) => {
          let next = previous;
          for (const entry of entries) {
            if (entry.target === hero && previous.hero !== entry.isIntersecting) {
              next = { ...next, hero: entry.isIntersecting };
            }
            if (entry.target === form && next.form !== entry.isIntersecting) {
              next = { ...next, form: entry.isIntersecting };
            }
          }
          return next;
        });
      },
      { threshold: 0 },
    );
    observer.observe(hero);
    observer.observe(form);
    return () => observer.disconnect();
  }, []);

  const show = visibility.hero === false && visibility.form === false;

  if (!show) return null;

  const isOpen = recruitmentStatus === "open";
  const statusText = isOpen
    ? "Candidaturas abertas para análise"
    : recruitmentStatus === "loading"
      ? "Consultando disponibilidade"
      : recruitmentStatus === "limited"
        ? "Acesso temporariamente limitado"
        : recruitmentStatus === "unavailable"
          ? "Disponibilidade não confirmada"
          : "Inscrições em preparação";
  const actionLabel = isOpen
    ? "Fazer minha inscrição"
    : recruitmentStatus === "loading"
      ? "Ver prévia segura"
      : recruitmentStatus === "limited" || recruitmentStatus === "unavailable"
        ? "Ver disponibilidade"
        : "Conhecer o formulário";

  return (
    <nav
      data-testid="affiliate-c76-mobile-apply"
      data-status={recruitmentStatus}
      aria-label="Atalho mobile da candidatura Vonix"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#e9d3d2] bg-[#fffaf7]/95 px-4 pb-[max(.75rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-14px_45px_rgba(65,36,49,.14)] backdrop-blur-lg md:hidden"
    >
      <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 text-[11px] font-bold leading-snug text-[#693c4c]">
            <ShieldCheck className="size-3.5 shrink-0" aria-hidden="true" />
            Vonix Hair · afiliadas
          </p>
          <p className="mt-1 text-[11px] leading-snug text-[#775d67]">{statusText}</p>
        </div>
        <a
          href="#inscricao"
          onClick={() => {
            trackAffiliateFunnel("affiliate_application_interest");
            if (!isOpen) onSafePreview?.();
          }}
          className="inline-flex min-h-12 max-w-[55%] shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#723e52] px-4 py-3 text-center text-xs font-bold leading-snug text-white shadow-sm transition-colors motion-reduce:transition-none hover:bg-[#603345] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#723e52]"
        >
          {actionLabel}
          <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
        </a>
      </div>
    </nav>
  );
}
