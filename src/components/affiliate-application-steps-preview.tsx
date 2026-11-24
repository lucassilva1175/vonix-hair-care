import { useState } from "react";
import { affiliateApplicationFacts } from "@/lib/affiliate-application-copy";
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
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
      affiliateApplicationFacts.primaryRequirements +
      " " +
      affiliateApplicationFacts.optionalRequirement +
      " Não é preciso comprar produtos para se candidatar.",
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

/**
 * Mobile/tablet: three compact disclosures, expanded only by the visitor.
 * Desktop: original illustrated catalog steps.
 * All labels and constraints come from the same source; no creator endorsements.
 */
export function AffiliateApplicationStepsPreview() {
  const [openMobileStep, setOpenMobileStep] = useState<number | null>(null);
  const [mobileJourneyExpanded, setMobileJourneyExpanded] = useState(false);

  return (
    <section
      id="candidatura-etapas"
      aria-labelledby="application-steps-preview-title"
      data-testid="vonix-c66-application-steps"
      className="scroll-mt-36 overflow-hidden border-b border-[#e6d5d1] bg-[#fbf5f1] px-5 py-4 text-[#4e3240] sm:py-6 lg:py-14"
    >
      <div id="como-funciona" className="mx-auto max-w-7xl scroll-mt-36">
        <div className="flex flex-wrap items-end justify-between gap-2 lg:gap-8">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[.1em] text-[#865168] lg:text-xs lg:tracking-[.13em]">
              <CheckCircle2 aria-hidden="true" className="size-4" /> Passo a passo transparente
            </p>
            <h2
              id="application-steps-preview-title"
              className="mt-1 font-display text-2xl leading-tight sm:text-3xl lg:mt-3 lg:text-4xl"
            >
              Da sua ideia à sua candidatura.
            </h2>
            <p className="mt-1.5 max-w-xl text-xs leading-5 text-[#745661] sm:text-sm sm:leading-6 lg:mt-3 lg:leading-7">
              Conheça as três etapas antes de enviar seus dados. O programa não exige portfólio
              pronto e o envio não garante aprovação.
            </p>
          </div>
          <a
            href="/consultar-candidatura"
            className="inline-flex min-h-11 items-center gap-2 text-xs font-semibold text-[#784256] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4 sm:text-sm"
          >
            Já se inscreveu? Acompanhe sua candidatura
            <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
          </a>
        </div>
        <button
          type="button"
          data-testid="affiliate-c108-steps-toggle"
          aria-controls="vonix-affiliate-steps-rail"
          aria-expanded={mobileJourneyExpanded}
          onClick={() => {
            setMobileJourneyExpanded((expanded) => !expanded);
            setOpenMobileStep(null);
          }}
          className="mt-3 flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-[#d9bec8] bg-white px-3 py-2.5 text-left text-xs font-bold text-[#704355] shadow-sm transition-colors hover:bg-[#faf0ed] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#704355] lg:hidden"
        >
          <span className="min-w-0">
            <span className="block text-[10px] font-semibold uppercase leading-4 text-[#926275]">
              3 etapas · sem portfólio obrigatório
            </span>
            <span className="mt-0.5 block leading-snug">
              {mobileJourneyExpanded
                ? "Ocultar detalhes do processo"
                : "Ver as 3 etapas antes de me candidatar"}
            </span>
          </span>
          <ChevronDown
            aria-hidden="true"
            className={
              "size-5 shrink-0 transition-transform motion-reduce:transition-none " +
              (mobileJourneyExpanded ? "rotate-180" : "")
            }
          />
        </button>
        <div
          id="vonix-affiliate-steps-rail"
          role="region"
          tabIndex={0}
          aria-label="Três etapas da candidatura Vonix"
          data-testid="vonix-c79-steps-rail"
          className={
            "mt-2.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#865168] lg:mt-7 " +
            (mobileJourneyExpanded ? "block" : "hidden lg:block")
          }
        >
          <ol className="grid grid-cols-1 gap-2 lg:grid-cols-3 lg:gap-5">
            {steps.map(({ eyebrow, title, text, detail, image, alt, Icon, tone }, index) => (
              <li
                key={eyebrow}
                data-testid="vonix-c79-step-card"
                className="min-w-0 overflow-hidden rounded-xl border border-[#e2d0cc] bg-white lg:rounded-[1.4rem] lg:shadow-[0_12px_32px_rgba(76,37,51,.06)]"
              >
                <div className="lg:hidden">
                  <button
                    type="button"
                    data-testid="affiliate-c104-step-toggle"
                    aria-expanded={openMobileStep === index}
                    aria-controls={"affiliate-c104-step-detail-" + (index + 1)}
                    onClick={() =>
                      setOpenMobileStep((previous) => (previous === index ? null : index))
                    }
                    className="flex min-h-14 w-full items-center gap-3 px-3 py-2.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#784256]"
                  >
                    <span className={"grid size-10 shrink-0 place-items-center rounded-lg " + tone}>
                      <Icon aria-hidden="true" className="size-5 text-[#784256]" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[10px] font-bold uppercase tracking-[.08em] text-[#875468]">
                        {eyebrow}
                      </span>
                      <span className="mt-0.5 block text-xs font-semibold leading-snug text-[#593b48] sm:text-sm">
                        {title}
                      </span>
                    </span>
                    <ChevronDown
                      aria-hidden="true"
                      className={
                        "size-4 shrink-0 text-[#784256] transition-transform motion-reduce:transition-none " +
                        (openMobileStep === index ? "rotate-180" : "")
                      }
                    />
                  </button>
                  <div
                    id={"affiliate-c104-step-detail-" + (index + 1)}
                    data-testid="affiliate-c104-step-detail"
                    hidden={openMobileStep !== index}
                    className="border-t border-[#e6d5d1] bg-[#fffaf7] px-4 py-3 text-xs leading-5 text-[#705462] sm:text-sm"
                  >
                    <p className="font-semibold text-[#593b48]">{text}</p>
                    <p className="mt-1.5">{detail}</p>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <div
                    className={
                      "relative flex h-20 items-center justify-center overflow-hidden sm:h-36 " +
                      tone
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
                </div>
              </li>
            ))}
          </ol>
        </div>
        <p className="mt-1 hidden text-xs leading-relaxed text-[#795e68] lg:block">
          Imagens do catálogo oficial Vonix Hair. São fotos de produtos, não de afiliadas ou de
          parcerias.
        </p>
      </div>
    </section>
  );
}
