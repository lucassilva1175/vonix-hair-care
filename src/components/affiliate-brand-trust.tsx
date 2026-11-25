import { ArrowUpRight, Headset, PackageCheck, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AffiliateApplyLink } from "@/components/affiliate-apply-link";
import { affiliateInstitutionalEvidence } from "@/lib/affiliate-brand-evidence";

/**
 * Factual brand credibility for prospects, sourced from the official
 * /sobre and /loja pages. Deliberately NOT creator testimonials, audience
 * metrics, income evidence, paid-campaign results or promises of perks.
 */
const brandFacts = [
  {
    title: "Produtos oficiais para conhecer",
    description:
      "Confira o catálogo vendido no site da Vonix e escolha os produtos sobre os quais você gostaria de aprender mais.",
    Icon: PackageCheck,
    href: "/loja",
    link: "Conhecer o catálogo",
  },
  {
    title: "Atendimento humano",
    description:
      "A Vonix apresenta os canais de contato e informações de atendimento em suas páginas institucionais.",
    Icon: Headset,
    href: "/sobre",
    link: "Conhecer a marca",
  },
  {
    title: "Entregas pelo Brasil",
    description:
      "A loja apresenta atendimento nacional. Frete, prazos e disponibilidade dependem do CEP e do pedido.",
    Icon: Truck,
    href: "/politica-de-frete",
    link: "Consultar entregas",
  },
] as const;

export function AffiliateBrandTrust({
  recruitmentOpen,
  onSafePreview,
}: {
  recruitmentOpen: boolean;
  onSafePreview?: (() => void) | undefined;
}) {
  return (
    <section
      id="conheca-a-vonix"
      data-testid="affiliate-c58-brand-trust"
      aria-labelledby="vonix-c58-brand-title"
      className="scroll-mt-28 overflow-hidden border-y border-[#eadbd7] bg-[#fbf5f1] px-5 py-10 sm:py-16"
    >
      <div className="mx-auto grid max-w-7xl min-w-0 gap-6 lg:grid-cols-[.75fr_1.25fr] lg:items-center lg:gap-10">
        <figure
          data-testid="affiliate-c92-brand-photo"
          className="relative h-56 min-w-0 overflow-hidden rounded-[1.7rem] border border-[#e2c7c5] bg-[#e8d8d1] shadow-[0_16px_42px_rgba(71,34,48,.10)] sm:h-72 lg:h-[32rem]"
        >
          <img
            src="/images/categorias/frizz.jpg"
            alt="Fotografia editorial de cabelos da categoria Frizz do catálogo oficial Vonix Hair; não retrata afiliadas"
            width={480}
            height={480}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <span className="absolute left-4 top-4 rounded-full border border-white/70 bg-[#fffaf7]/95 px-4 py-2 text-[11px] font-bold uppercase tracking-[.08em] text-[#633c4d]">
            Acervo oficial Vonix Hair
          </span>
          <figcaption className="absolute inset-x-3 bottom-3 rounded-xl border border-white/70 bg-[#fffaf7]/95 px-4 py-3 text-[11px] leading-[1.55] text-[#634a54] backdrop-blur-sm sm:inset-x-5 sm:bottom-5">
            Fotografia ilustrativa de cabelos da loja. Não retrata uma afiliada, criadora
            participante ou resultado de parceria.
          </figcaption>
        </figure>

        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[.13em] text-[#874959]">
            Conheça a marca por trás do convite
          </p>
          <h2
            id="vonix-c58-brand-title"
            className="mt-3 font-display text-3xl leading-tight text-[#442b35] sm:text-4xl lg:text-5xl"
          >
            Uma loja real. <span className="italic text-[#9b5a6c]">Uma marca para conhecer.</span>
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-[1.7] text-[#715c64]">
            Antes de apresentar seu perfil, veja a história, os produtos e os canais oficiais da
            Vonix. Conhecer a marca ajuda você a decidir se combina com o que deseja compartilhar
            com sua audiência.
          </p>
          <div
            data-testid="affiliate-c92-public-store-fact"
            className="mt-5 grid items-center gap-3 rounded-2xl border border-[#e5cecb] bg-white/95 px-5 py-4 shadow-sm sm:grid-cols-[auto_minmax(0,1fr)] sm:gap-5"
          >
            <strong className="font-display text-4xl leading-none text-[#763f54] sm:text-5xl">
              {affiliateInstitutionalEvidence.minimumLabel}
            </strong>
            <div className="text-xs leading-[1.65] text-[#725762] sm:text-sm">
              <p>
                {affiliateInstitutionalEvidence.description},
                <strong> segundo a página institucional da Vonix Hair</strong>. Não é número de
                afiliadas, vendas por criadoras ou ganhos do programa.
              </p>
              <a
                href={affiliateInstitutionalEvidence.sourceHref}
                className="mt-1 inline-flex min-h-9 items-center gap-1.5 font-bold text-[#814759] underline underline-offset-4"
              >
                Conferir a fonte oficial <ArrowUpRight aria-hidden="true" className="size-4" />
              </a>
            </div>
          </div>

          <div className="mt-4 grid min-w-0 gap-2.5 sm:grid-cols-3">
            {brandFacts.map(({ title, description, Icon, href, link }) => (
              <article
                key={title}
                className="min-w-0 rounded-xl border border-[#e7d9d5] bg-white/90 px-4 py-4"
              >
                <Icon aria-hidden="true" className="size-5 text-[#814759]" />
                <h3 className="mt-2 font-display text-lg leading-tight text-[#442b35]">{title}</h3>
                <p className="mt-2 text-xs leading-[1.65] text-[#715c64]">{description}</p>
                <a
                  href={href}
                  className="mt-2 inline-flex min-h-9 items-center gap-1.5 text-xs font-bold text-[#7e4152] underline underline-offset-4"
                >
                  {link} <ArrowUpRight aria-hidden="true" className="size-3.5" />
                </a>
              </article>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[#e4d3cf] pt-4">
            <a
              href="#avaliacoes-produtos"
              className="inline-flex min-h-11 items-center gap-2 text-xs font-bold text-[#7e4152] underline underline-offset-4"
            >
              Ver avaliações reais de produtos
              <ArrowUpRight aria-hidden="true" className="size-4" />
            </a>
            <Button asChild className="h-auto min-h-11 rounded-full px-5 py-2.5 text-xs font-bold">
              <AffiliateApplyLink recruitmentOpen={recruitmentOpen} onSafePreview={onSafePreview}>
                {recruitmentOpen ? "Quero apresentar meu perfil" : "Abrir prévia segura"}
                <ArrowUpRight aria-hidden="true" className="size-4" />
              </AffiliateApplyLink>
            </Button>
          </div>
          <p className="mt-3 text-[11px] leading-[1.55] text-[#806b72]">
            Avaliações deste portal são de clientes sobre produtos, não de afiliadas participantes.
            A candidatura não garante aprovação ou remuneração.
          </p>
        </div>
      </div>
    </section>
  );
}
