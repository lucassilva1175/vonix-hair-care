import { ArrowUpRight, CheckCircle2, ClipboardCheck, LockKeyhole, SearchCheck } from "lucide-react";

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
  return (
    <section
      id="candidatura-etapas"
      aria-labelledby="application-steps-preview-title"
      data-testid="vonix-c66-application-steps"
      className="scroll-mt-36 overflow-hidden border-b border-[#e6d5d1] bg-[#fbf5f1] px-5 py-10 text-[#4e3240] sm:py-14"
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
        <p
          data-testid="vonix-c79-steps-swipe-hint"
          className="mt-6 text-xs font-semibold text-[#81566a] lg:hidden"
        >
          Deslize para ver as três etapas <span aria-hidden="true">→</span>
        </p>
        <div
          role="region"
          tabIndex={0}
          aria-label="Três etapas da candidatura, deslize para percorrer"
          data-testid="vonix-c79-steps-rail"
          className="-mx-5 mt-4 overflow-x-auto overscroll-x-contain px-5 pb-4 scroll-px-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#865168] lg:mx-0 lg:px-0"
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
