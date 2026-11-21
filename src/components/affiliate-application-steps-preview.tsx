import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ClipboardCheck,
  LockKeyhole,
  SearchCheck,
} from "lucide-react";

const steps = [
  {
    eyebrow: "01 · Apresente seu perfil",
    title: "Um convite para sua criatividade.",
    text: "Apresente seu perfil gratuitamente.",
    detail:
      "Nome, contato, endereço e Instagram. TikTok é opcional, e não é preciso comprar produtos para se candidatar.",
    image: "/images/products/kit-banana-e-mel.webp",
    alt: "Fotografia do Kit Banana e Mel vendido no catálogo Vonix Hair",
    Icon: ClipboardCheck,
    tone: "bg-[#f7e9dc]",
  },
  {
    eyebrow: "02 · Guarde seu acesso",
    title: "Seu código é só seu.",
    text: "Se o envio for confirmado, guarde o código de acompanhamento.",
    detail:
      "Você poderá copiar ou baixar seu código privado ao terminar. Ele não é enviado por e-mail.",
    image: "/images/products/kit-cronograma-capilar.webp",
    alt: "Fotografia do Kit Cronograma Capilar vendido na loja Vonix Hair",
    Icon: LockKeyhole,
    tone: "bg-[#eee0e5]",
  },
  {
    eyebrow: "03 · Acompanhe a seleção",
    title: "Análise individual, sem promessas.",
    text: "Consulte o andamento pelo código, sem prazo ou aprovação garantidos.",
    detail:
      "A equipe analisa sua candidatura. O cadastro não ativa um vínculo, comissão ou parceria automaticamente.",
    image: "/images/products/botox-vonix.webp",
    alt: "Fotografia da embalagem do Botox Vonix do catálogo oficial",
    Icon: SearchCheck,
    tone: "bg-[#ede8e2]",
  },
] as const;

/** Official catalog artwork, never photos or testimonials of real creators. */
export function AffiliateApplicationStepsPreview() {
  const railRef = useRef<HTMLDivElement | null>(null);
  const [activeStep, setActiveStep] = useState(1);
  const [canScrollBack, setCanScrollBack] = useState(false);
  const [canScrollForward, setCanScrollForward] = useState(true);

  const syncScroll = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;
    const cards = Array.from(
      rail.querySelectorAll<HTMLElement>('[data-testid="vonix-c79-step-card"]'),
    );
    if (!cards.length) return;

    const maxScroll = Math.max(0, rail.scrollWidth - rail.clientWidth);
    const current = Math.min(maxScroll, Math.max(0, rail.scrollLeft));
    setCanScrollBack(current > 4);
    setCanScrollForward(maxScroll > 4 && current < maxScroll - 4);

    if (maxScroll > 4 && current >= maxScroll - 4) {
      setActiveStep(cards.length);
      return;
    }
    const first = cards[0]!.offsetLeft;
    const nearestIndex = cards.reduce((nearest, card, index) => {
      const delta = Math.abs(current - (card.offsetLeft - first));
      const prior = Math.abs(current - (cards[nearest]!.offsetLeft - first));
      return delta < prior ? index : nearest;
    }, 0);
    setActiveStep(nearestIndex + 1);
  }, []);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) return;
    syncScroll();
    const observer = typeof ResizeObserver !== "undefined" ? new ResizeObserver(syncScroll) : null;
    observer?.observe(rail);
    rail
      .querySelectorAll('[data-testid="vonix-c79-step-card"]')
      .forEach((card) => observer?.observe(card));
    window.addEventListener("resize", syncScroll);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", syncScroll);
    };
  }, [syncScroll]);

  function moveRail(direction: -1 | 1) {
    const rail = railRef.current;
    if (!rail) return;
    const cards = rail.querySelectorAll<HTMLElement>('[data-testid="vonix-c79-step-card"]');
    if (cards.length < 2) return;
    const cardWidth = cards[0]!.getBoundingClientRect().width;
    const distance = Math.max(1, cards[1]!.offsetLeft - cards[0]!.offsetLeft, cardWidth + 16);
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    rail.scrollBy({ left: direction * distance, behavior: reducedMotion ? "instant" : "smooth" });
  }

  return (
    <section
      id="candidatura-etapas"
      aria-labelledby="application-steps-preview-title"
      data-testid="vonix-c66-application-steps"
      className="scroll-mt-36 overflow-hidden border-b border-[#e6d5d1] bg-[#fbf5f1] px-5 py-6 text-[#4e3240] sm:py-14"
    >
      <div id="como-funciona" className="mx-auto max-w-7xl scroll-mt-36">
        <div className="flex flex-wrap items-end justify-between gap-5 sm:gap-8">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[.13em] text-[#865168]">
              <CheckCircle2 aria-hidden="true" className="size-4" /> Passo a passo transparente
            </p>
            <h2
              id="application-steps-preview-title"
              className="mt-3 font-display text-3xl leading-tight sm:text-4xl"
            >
              Da sua ideia à sua candidatura.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-[#745661]">
              Conheça as três etapas antes de enviar seus dados. O programa não exige portfólio
              pronto e o envio não garante aprovação.
            </p>
          </div>
          <a
            href="/consultar-candidatura"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#784256] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Já se inscreveu? Acompanhe sua candidatura
            <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
          </a>
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3 lg:hidden">
          <p
            data-testid="vonix-c79-steps-swipe-hint"
            className="text-xs font-semibold text-[#81566a]"
          >
            Deslize ou avance
          </p>
          <div data-testid="affiliate-c99-steps-controls" className="flex items-center gap-2">
            <span
              aria-live="polite"
              aria-atomic="true"
              className="mr-1 min-w-14 text-center text-xs font-semibold tabular-nums text-[#674556]"
            >
              {activeStep} de {steps.length}
            </span>
            <button
              type="button"
              onClick={() => moveRail(-1)}
              disabled={!canScrollBack}
              aria-label="Etapa anterior da candidatura"
              aria-controls="vonix-affiliate-steps-rail"
              className="grid size-11 place-items-center rounded-full border border-[#c9aab4] bg-white text-[#684055] transition-colors hover:bg-[#f1e4e8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#784256] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowLeft aria-hidden="true" className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => moveRail(1)}
              disabled={!canScrollForward}
              aria-label="Próxima etapa da candidatura"
              aria-controls="vonix-affiliate-steps-rail"
              className="grid size-11 place-items-center rounded-full border border-[#c9aab4] bg-white text-[#684055] transition-colors hover:bg-[#f1e4e8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#784256] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ArrowRight aria-hidden="true" className="size-5" />
            </button>
          </div>
        </div>
        <div
          id="vonix-affiliate-steps-rail"
          ref={railRef}
          onScroll={syncScroll}
          role="region"
          tabIndex={0}
          aria-label="Três etapas da candidatura, deslize para percorrer"
          data-testid="vonix-c79-steps-rail"
          className="-mx-5 mt-2 overflow-x-auto overscroll-x-contain px-5 pb-4 scroll-px-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#865168] lg:mx-0 lg:px-0"
        >
          <ol className="flex min-w-max snap-x snap-mandatory gap-4 lg:grid lg:min-w-0 lg:grid-cols-3 lg:gap-5">
            {steps.map(({ eyebrow, title, text, detail, image, alt, Icon, tone }) => (
              <li
                key={eyebrow}
                data-testid="vonix-c79-step-card"
                className="w-[80vw] max-w-[20.5rem] shrink-0 snap-start overflow-hidden rounded-[1.4rem] border border-[#e2d0cc] bg-white shadow-[0_12px_32px_rgba(76,37,51,.06)] sm:w-[43vw] lg:w-auto lg:max-w-none"
              >
                <div
                  className={
                    "relative flex h-20 items-center justify-center overflow-hidden sm:h-36 " + tone
                  }
                >
                  <img
                    src={image}
                    alt={alt}
                    width={440}
                    height={220}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-contain px-5 py-3"
                  />
                  <span className="absolute right-4 top-4 grid size-10 place-items-center rounded-xl border border-white/70 bg-white/90 text-[#784256]">
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                </div>
                <div className="space-y-2.5 px-5 py-5">
                  <p className="text-[11px] font-bold uppercase tracking-[.09em] text-[#875468]">
                    {eyebrow}
                  </p>
                  <h3 className="font-display text-xl leading-tight sm:text-2xl">{title}</h3>
                  <p className="text-sm font-semibold leading-6 text-[#593b48]">{text}</p>
                  <p className="text-xs leading-6 text-[#775e69]">{detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-[#795e68]">
          Imagens do catálogo oficial Vonix Hair. São fotos de produtos, não de afiliadas ou de
          parcerias.
        </p>
      </div>
    </section>
  );
}
