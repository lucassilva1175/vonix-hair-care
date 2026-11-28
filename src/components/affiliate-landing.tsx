import { useEffect, useState } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Camera,
  ChevronDown,
  ClipboardList,
  Heart,
  MessageCircleHeart,
  PenLine,
  ShieldCheck,
  Search,
  UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AffiliateCreatorPaths } from "@/components/affiliate-creator-paths";
import { AffiliateEditorialPlanner } from "@/components/affiliate-editorial-planner";
import { AffiliateBrandTrust } from "@/components/affiliate-brand-trust";
import { AffiliateOfficialEvidenceLinks } from "@/components/affiliate-official-evidence-links";
import { AffiliateCurrentCombos } from "@/components/affiliate-current-combos";
import { AffiliateProductProof } from "@/components/affiliate-product-proof";
import { AffiliateVerifiedReviewPreview } from "@/components/affiliate-verified-review-preview";
import { AffiliateEarlyValueBand } from "@/components/affiliate-early-value-band";
import { AffiliateApplyLink } from "@/components/affiliate-apply-link";
import { AffiliateCreativeKitAction } from "@/components/affiliate-creative-kit-action";
import {
  AffiliateEditorialHero,
  type RecruitmentStatus,
} from "@/components/affiliate-editorial-hero";
import { AffiliateSellingFlow } from "@/components/affiliate-selling-flow";
import { AffiliateCatalogInMotion } from "@/components/affiliate-catalog-in-motion";
import {
  AffiliateCreatorOpportunity,
  AffiliateEarningsSimulator,
} from "@/components/affiliate-creator-opportunity";

const experiences = [
  {
    id: "01",
    tag: "IDENTIDADE",
    title: "Sua história importa",
    description:
      "Queremos conhecer sua linguagem, seu público e o que torna seu conteúdo diferente. Não precisa reproduzir o estilo de outra pessoa.",
    image: "/images/products/kit-banana-e-mel.jpg",
    alt: "Kit Banana e Mel da Vonix Hair, produto oficial da marca",
    background: "bg-card",
  },
  {
    id: "02",
    tag: "BELEZA CAPILAR",
    title: "Afinidade de verdade",
    description:
      "O universo da Vonix Hair é feito de cuidados com os fios. Conte como esse assunto aparece na sua rotina ou nas suas criações.",
    image: "/images/products/progressiva-fio-de-luz.jpg",
    alt: "Progressiva Fio de Luz da Vonix Hair, produto oficial da marca",
    background: "bg-card",
  },
  {
    id: "03",
    tag: "CRIAÇÃO",
    title: "Ideias com personalidade",
    description:
      "Rotinas, fotos, resenhas sinceras e vídeos são jeitos de mostrar sua criatividade. A qualidade da ideia vale mais do que uma fórmula pronta.",
    image: "/images/products/mascara-reparacao-nutri-repair.jpg",
    alt: "Máscara de Reparação Nutri Repair da Vonix Hair, produto oficial da marca",
    background: "bg-card",
  },
  {
    id: "04",
    tag: "CONEXÃO",
    title: "Seu jeito de comunicar",
    description:
      "A seleção é uma oportunidade de apresentar seu perfil para análise. O cadastro não gera parceria, vantagens ou contrato automaticamente.",
    image: "/images/products/botox-vonix.jpg",
    alt: "Botox Vonix, produto oficial da Vonix Hair",
    background: "bg-card",
  },
] as const;

const creativeIdeas = [
  {
    number: "01",
    name: "Rotina capilar",
    text: "Mostre como o autocuidado entra na sua rotina, sem prometer resultados.",
    opening: "Um cuidado simples que faz sentido para a minha rotina.",
    takes: [
      "Apresente o contexto da sua rotina capilar.",
      "Mostre o produto apenas se de fato estiver usando-o.",
      "Descreva sua experiência sem prometer o mesmo resultado a outras pessoas.",
    ],
    image: "/images/categorias/nutricao.jpg",
    alt: "Fotografia editorial de cabelo da categoria Nutrição do site Vonix Hair, usada como ilustração, não como depoimento de afiliada",
  },
  {
    number: "02",
    name: "Unboxing",
    text: "Apresente uma experiência real com um produto que você conhece.",
    opening: "Primeiro olhar: o que é importante observar neste kit?",
    takes: [
      "Mostre a embalagem e os rótulos sem alterar informações.",
      "Identifique o que a descrição oficial diz sobre o produto.",
      "Compartilhe somente impressões que você realmente teve.",
    ],
    image: "/images/products/kit-cronograma-capilar.jpg",
    alt: "Kit Cronograma Capilar Vonix Hair",
  },
  {
    number: "03",
    name: "Resenha sincera",
    text: "Explique sua experiência e suas impressões com transparência.",
    opening: "Três pontos que observo antes de avaliar um produto capilar.",
    takes: [
      "Considere a indicação do rótulo e suas necessidades.",
      "Distinga o que você observou de afirmações do fabricante.",
      "Se não usou o produto, apresente como análise de informações, não como resenha de uso.",
    ],
    image: "/images/categorias/quimica.jpg",
    alt: "Fotografia ilustrativa da categoria Química capilar do site Vonix Hair, não identifica uma participante do programa",
  },
  {
    number: "04",
    name: "Foto editorial de cabelos",
    text: "Explore retratos e composições capilares com transparência e identidade própria.",
    opening: "Três enquadramentos para valorizar detalhes do cabelo.",
    takes: [
      "Escolha um enquadramento com iluminação e contexto adequados.",
      "Explore movimento, textura visual e detalhes do penteado.",
      "Não atribua resultados ou produtos à pessoa retratada sem evidência e autorização.",
    ],
    image: "/images/categorias/reconstrucao.jpg",
    alt: "Fotografia editorial ilustrativa de cabelos da categoria Reconstrução Vonix Hair, não retrata uma afiliada identificada",
  },
] as const;

const questions = [
  {
    question: "Quem pode apresentar uma candidatura?",
    answer:
      "Pessoas interessadas em criar conteúdo e apresentar seus perfis sociais à Vonix Hair. É necessário ter 18 anos ou mais. A seleção é feita pela equipe e não existe aprovação automática.",
  },
  {
    question: "Preciso ter portfólio ou muitos seguidores?",
    answer:
      "Não exigimos um portfólio para preencher a inscrição, e o formulário contempla diferentes tamanhos de audiência. A avaliação considera as informações fornecidas e a afinidade com o universo da Vonix Hair.",
  },
  {
    question: "Preciso comprar algum produto para me inscrever?",
    answer:
      "Não. A candidatura por este formulário é gratuita e não exige a compra de um produto. Caso uma parceria seja proposta posteriormente, suas condições serão apresentadas de forma separada antes de qualquer compromisso.",
  },
  {
    question: "Vou receber produtos, cupom, pagamento ou comissão?",
    answer:
      "O envio da candidatura não garante produtos gratuitos, cupons ativos, remuneração, comissão ou uma parceria. Qualquer condição comercial depende de aprovação, comunicação oficial e eventual acordo específico. Para afiliadas aprovadas: você vende pelo preço do site, com comissão de 8% sobre cada venda confirmada, mais R$ 500 a cada R$ 10 mil vendidos, e pode virar supervisora ao bater as metas, ganhando também, em média, 4% sobre o valor bruto vendido pela sua equipe. Bônus e supervisão dependem de elegibilidade, metas e avaliação da equipe; não são garantidos.",
  },
  {
    question: "Como funciona a avaliação?",
    answer:
      "Você informa nome, e-mail válido, telefone, endereço completo e Instagram com número de seguidores em um único formulário. TikTok e seus seguidores são opcionais. A equipe poderá entrar em contato pelo e-mail ou telefone informado. Não há prazo de resposta garantido.",
  },
  {
    question: "E-mail é obrigatório para se candidatar?",
    answer:
      "Sim. Para enviar uma nova candidatura, informe nome completo, e-mail válido, telefone, endereço e Instagram com seguidores. O TikTok continua opcional. O e-mail serve para contato da equipe; seu código privado de acompanhamento não será enviado por e-mail e deve ser guardado ao finalizar. Se o envio ficar sem confirmação, guarde o código da tentativa e consulte a candidatura antes de reenviar os mesmos dados.",
  },
  {
    question: "Já posso enviar meu cadastro?",
    answer:
      "A disponibilidade real aparece na seção de inscrição. Quando o cadastro estiver em preparação, você poderá conhecer apenas a prévia interativa. A prévia não envia nem armazena candidaturas.",
  },
] as const;

function normalizeFaqSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// Keep search local: tolerate everyday wording and reordered keywords without
// sending visitors' queries to analytics or external services.
const faqSearchAliases = [
  "idade menor maior 18 anos requisitos elegibilidade participar",
  "iniciante poucos seguidores audiencia influencer perfil pequeno portfolio",
  "investimento custo taxa pagar estoque dinheiro comprar produto gratis",
  "remuneracao porcentagem bonus meta vendas ganhos pagamento supervisora",
  "prazo demora retorno resposta analise selecao aprovacao recusa",
  "codigo perdido perdi esqueci recuperar comprovante acompanhar cadastro consulta erro envio",
  "inscricoes abertas fechadas disponibilidade cadastro formulario previa",
] as const;

const faqStopWords = new Set([
  "a",
  "o",
  "as",
  "os",
  "um",
  "uma",
  "de",
  "do",
  "da",
  "dos",
  "das",
  "e",
  "ou",
  "eu",
  "me",
  "meu",
  "minha",
  "meus",
  "minhas",
  "para",
  "por",
  "com",
  "como",
  "que",
  "qual",
  "quais",
  "quanto",
  "quanta",
  "se",
  "tenho",
  "preciso",
  "posso",
  "fazer",
  "ser",
]);

function matchesFaq(question: (typeof questions)[number], query: string) {
  const original = normalizeFaqSearch(question.question + " " + question.answer);
  if (original.includes(query)) return true;
  const terms = query.match(/[a-z0-9]+/g)?.filter((term) => !faqStopWords.has(term)) ?? [];
  if (!terms.length) return false;
  const text = original + " " + faqSearchAliases[questions.indexOf(question)];
  return terms.every((term) => text.includes(term));
}

const faqActions = [
  { href: "#como-funciona", label: "Ver etapas da seleção" },
  { href: "#formatos", label: "Conhecer formatos de conteúdo" },
  { href: "#ganhos", label: "Conferir condições do programa" },
  { href: "#simular-comissoes", label: "Explorar cálculo ilustrativo" },
  { href: "/consultar-candidatura", label: "Acompanhar minha candidatura" },
  { href: "/consultar-candidatura", label: "Consultar ou recuperar meu acesso" },
  { href: "#inscricao", label: "Conferir disponibilidade" },
] as const;

function Eyebrow({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <p
      className={
        "inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-normal " +
        (light ? "text-primary-foreground" : "text-primary")
      }
    >
      <span className={light ? "h-px w-7 bg-primary-foreground" : "h-px w-7 bg-primary"} />
      {children}
    </p>
  );
}

function ProductImage({
  src,
  alt,
  priority = false,
  className = "",
}: {
  src: string;
  alt: string;
  priority?: boolean;
  className?: string;
}) {
  return (
    <picture className={"block h-full w-full " + className}>
      <source srcSet={src.replace(/\.jpg$/, ".webp")} type="image/webp" />
      <img
        src={src}
        alt={alt}
        width={768}
        height={768}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        fetchPriority={priority ? "high" : "auto"}
        className="block h-full w-full object-contain"
      />
    </picture>
  );
}

/**
 * First impression: the actual program terms immediately after the hero,
 * before any extended stories, galleries, or video demonstrations.
 * The recruitment-status signal remains the only source of availability.
 */
export function AffiliateLandingOffer({
  recruitmentStatus,
  placement = "all",
  onSafePreview,
  sourceLinked = false,
}: {
  recruitmentStatus: RecruitmentStatus;
  placement?: "all" | "intro" | "details";
  sourceLinked?: boolean;
  onSafePreview?: (() => void) | undefined;
}) {
  const isOpen = recruitmentStatus === "open";

  useEffect(() => {
    if (placement === "intro") return;
    const simulator = document.getElementById("simular-comissoes");
    if (!(simulator instanceof HTMLDetailsElement)) return;
    const hash = "#simular-comissoes";
    const reveal = () => {
      if (window.location.hash === hash) simulator.open = true;
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
      if (event.target instanceof Element && event.target.closest('a[href="#simular-comissoes"]')) {
        simulator.open = true;
      }
    };
    document.addEventListener("click", onClick);
    window.addEventListener("hashchange", reveal);
    reveal();
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("hashchange", reveal);
    };
  }, [placement]);

  return (
    <div
      data-testid={placement === "details" ? "vonix-c97-offer-details" : "vonix-c64-early-offer"}
      className="min-w-0"
    >
      {placement !== "details" && (
        <>
          <AffiliateEditorialHero
            recruitmentStatus={recruitmentStatus}
            onSafePreview={onSafePreview}
            sourceLinked={sourceLinked}
          />

          <AffiliateEarlyValueBand
            recruitmentOpen={recruitmentStatus === "open"}
            onSafePreview={onSafePreview}
          />
        </>
      )}
      {placement !== "intro" && (
        <>
          {sourceLinked ? (
            placement === "all" ? (
              <AffiliateOfficialEvidenceLinks variant="preview" />
            ) : null
          ) : (
            <AffiliateVerifiedReviewPreview
              recruitmentOpen={isOpen}
              onSafePreview={onSafePreview}
            />
          )}

          <section
            id="ganhos"
            data-testid="vonix-affiliate-earnings"
            aria-labelledby="vonix-affiliate-earnings-title"
            className="scroll-mt-24 bg-card px-5 py-12 sm:py-20"
          >
            <div className="mx-auto max-w-7xl">
              <div className="max-w-3xl">
                <Eyebrow>Quanto você ganha</Eyebrow>
                <h2
                  id="vonix-affiliate-earnings-title"
                  className="mt-5 font-display text-4xl leading-tight tracking-normal text-foreground sm:text-5xl"
                >
                  Para afiliadas aprovadas.{" "}
                  <span className="italic text-primary">Condições claras, desde o começo.</span>
                </h2>
                <p className="mt-5 text-base leading-[1.8] text-muted-foreground">
                  Após aprovação e definição das condições, você divulga pelo seu link. A Vonix Hair
                  cuida da venda, entrega e atendimento. A candidatura é gratuita, sem estoque ou
                  compra obrigatória para se candidatar.
                </p>
              </div>
              <div className="mt-10 grid gap-4 md:grid-cols-3">
                {[
                  {
                    big: "8%",
                    title: "Comissão de 8% em cada venda",
                    text: "Sobre vendas confirmadas e pagas. A comissão depende de aprovação e das condições aplicáveis à parceria.",
                    image: "/images/products/botox-vonix.webp",
                  },
                  {
                    big: "+ R$ 500",
                    title: "Bônus a cada R$ 10 mil vendidos",
                    text: "Bônus anunciado de R$ 500 por cada R$ 10.000 vendidos, condicionado às regras de elegibilidade. Não é garantido pela candidatura.",
                    image: "/images/products/kit-banana-e-mel.webp",
                  },
                  {
                    big: "Supervisora",
                    title: "Cresça para supervisora",
                    text: "Possibilidade de se tornar supervisora conforme metas e avaliação da equipe. A condição anunciada inclui, em média, 4% sobre o valor bruto vendido pela equipe, além das próprias comissões. Não há promoção automática.",
                    image: "/images/products/kit-cronograma-capilar.webp",
                  },
                ].map(({ big, title, text, image }) => (
                  <article
                    key={title}
                    data-testid="vonix-c77-benefit-editorial"
                    className="min-w-0 overflow-hidden rounded-[1.4rem] border border-[#e8d5d4] bg-[#fffaf7] p-5 shadow-[0_9px_28px_rgba(75,42,53,.05)] sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="min-w-0 pt-1 font-display text-3xl leading-tight text-[#783c53] sm:text-4xl">
                        {big}
                      </p>
                      <span className="flex size-[5.5rem] shrink-0 items-center justify-center rounded-2xl border border-[#f0e0dc] bg-[#f9ebe8]">
                        <img
                          src={image}
                          alt=""
                          aria-hidden="true"
                          loading="lazy"
                          decoding="async"
                          width={96}
                          height={96}
                          className="size-full object-contain p-1.5"
                        />
                      </span>
                    </div>
                    <h3 className="mt-3 font-display text-xl leading-snug text-[#462f39] sm:text-2xl">
                      {title}
                    </h3>
                    <p className="mt-3 text-sm leading-[1.75] text-[#6e5660]">{text}</p>
                  </article>
                ))}
              </div>
              <p className="mt-6 text-xs leading-relaxed text-muted-foreground">
                Valores sobre vendas confirmadas e pagas. As metas da supervisora são combinadas
                pela equipe com cada afiliada aprovada. Bônus e supervisão dependem de
                elegibilidade. Fotos ilustrativas de produtos oficiais Vonix: não representam ganhos
                ou depoimentos de afiliadas.
              </p>
              <details
                id="simular-comissoes"
                data-testid="vonix-c69-optional-simulator"
                className="group/simulator mt-7 scroll-mt-32 rounded-2xl border border-[#dfd0cd] bg-background"
              >
                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring sm:px-7 [&::-webkit-details-marker]:hidden">
                  <span className="min-w-0">
                    <span className="block text-sm font-bold text-primary">
                      Explorar um cálculo ilustrativo de comissões
                    </span>
                    <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                      Opcional: não é previsão nem garantia de ganhos.
                    </span>
                  </span>
                  <ChevronDown
                    aria-hidden="true"
                    className="size-5 shrink-0 text-primary transition-transform motion-reduce:transition-none group-open/simulator:rotate-180"
                  />
                </summary>
                <div className="border-t border-border px-5 pb-2 sm:px-7">
                  <AffiliateEarningsSimulator compact />
                </div>
              </details>
              <div
                data-testid="vonix-c64-immediate-signup"
                className="mt-8 flex flex-col gap-4 rounded-2xl border border-[#dec8cd] bg-[#fbf2f0] px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8"
              >
                <div className="min-w-0">
                  <p className="font-display text-xl text-[#51303e] sm:text-2xl">
                    Gostou da proposta? Seu próximo passo é a candidatura.
                  </p>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#70505e]">
                    Gratuita e sujeita à análise individual. Antes de enviar, você pode conferir{" "}
                    <a href="#como-funciona" className="font-semibold underline underline-offset-4">
                      como funciona a seleção
                    </a>{" "}
                    e{" "}
                    <a
                      href="#avaliacoes-produtos"
                      className="font-semibold underline underline-offset-4"
                    >
                      avaliações de produtos
                    </a>
                    .
                  </p>
                </div>
                <Button
                  asChild
                  className="h-auto min-h-12 shrink-0 rounded-lg px-6 py-3 text-sm font-bold"
                >
                  <AffiliateApplyLink recruitmentOpen={isOpen} onSafePreview={onSafePreview}>
                    {isOpen ? "Quero me candidatar" : "Abrir prévia segura"}
                    <ArrowRight aria-hidden="true" className="size-4" />
                  </AffiliateApplyLink>
                </Button>
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

/**
 * Optional editorial exploration, AFTER the actual candidate form on the
 * public page. All media stays attached to its official PRODUCT source;
 * do not claim these are proven affiliate participants or sales.
 */
export function AffiliateLandingDiscovery({
  recruitmentStatus,
  onSafePreview,
  sourceLinked = false,
}: {
  recruitmentStatus: RecruitmentStatus;
  sourceLinked?: boolean;
  onSafePreview?: (() => void) | undefined;
}) {
  const isOpen = recruitmentStatus === "open";
  const referenceSelection = useState<string[]>([]);

  return (
    <div data-testid="vonix-c64-discovery" className="min-w-0">
      <AffiliateBrandTrust recruitmentOpen={isOpen} onSafePreview={onSafePreview} />

      {sourceLinked ? (
        <AffiliateOfficialEvidenceLinks variant="reviews" />
      ) : (
        <AffiliateProductProof />
      )}

      <AffiliateSellingFlow recruitmentOpen={isOpen} onSafePreview={onSafePreview} />

      {sourceLinked ? (
        <>
          <AffiliateCurrentCombos referenceSelection={referenceSelection} />
          <AffiliateOfficialEvidenceLinks
            variant="videos"
            referenceSelection={referenceSelection}
          />
          <div className="bg-[#fbf5f2] px-5 pb-8 sm:pb-12">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e5d2d4] bg-white p-4 sm:p-6">
              <p className="max-w-lg text-sm leading-relaxed text-[#755d66]">
                Gostou do acervo? Apresente seu perfil à equipe Vonix. Você não precisa comprar
                produtos para se candidatar.
              </p>
              <AffiliateApplyLink
                data-testid="affiliate-c159-catalog-return"
                recruitmentOpen={isOpen}
                onSafePreview={onSafePreview}
                className="inline-flex min-h-12 items-center justify-center rounded-full bg-[#784254] px-6 py-3 text-sm font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                {isOpen ? "Voltar à inscrição" : "Conhecer o formulário"}
              </AffiliateApplyLink>
            </div>
          </div>
        </>
      ) : (
        <AffiliateCatalogInMotion recruitmentOpen={isOpen} onSafePreview={onSafePreview} />
      )}

      <section
        id="criterios"
        data-testid="affiliate-c95-fit-section"
        className="scroll-mt-24 border-y border-[#e8d8d6] bg-[#fbf5f1] px-5 py-10 sm:py-14"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid items-end gap-4 lg:grid-cols-[1.1fr_.9fr] lg:gap-8">
            <div>
              <Eyebrow>O universo Vonix Hair</Eyebrow>
              <h2 className="mt-3 max-w-3xl font-display text-3xl leading-[1.14] text-[#523342] sm:text-4xl">
                Não procuramos uma fórmula.{" "}
                <span className="italic text-[#9a5a70]">Queremos conhecer você.</span>
              </h2>
            </div>
            <p className="max-w-xl text-sm leading-[1.65] text-[#755d66]">
              Cada pessoa tem sua linguagem e seu público. Estes quatro temas ajudam a apresentar
              seu perfil à equipe — não são exigências fixas nem promessa de aprovação.
            </p>
          </div>

          <p className="mt-5 text-xs font-semibold text-[#82566b] sm:hidden">
            Deslize para conhecer os quatro temas <span aria-hidden="true">→</span>
          </p>
          <div
            role="region"
            aria-label="Quatro aspectos de afinidade Vonix Hair, deslize horizontalmente em telas pequenas"
            tabIndex={0}
            data-testid="affiliate-c95-fit-rail"
            className="-mx-5 mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain px-5 pb-3 scroll-px-5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#875468] sm:mx-0 sm:mt-7 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:pb-0 xl:grid-cols-4"
          >
            {experiences.map((item) => (
              <article
                key={item.id}
                data-testid="affiliate-c95-fit-card"
                className="flex min-w-[80vw] max-w-[19rem] shrink-0 snap-start flex-col overflow-hidden rounded-[1.25rem] border border-[#e4d3d0] bg-white shadow-[0_10px_24px_rgba(82,43,57,.06)] sm:min-w-0 sm:max-w-none"
              >
                <div className="flex items-center gap-3 border-b border-[#eee1dc] px-4 py-3.5">
                  <div className="relative flex size-[4.5rem] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#f3e8e4]">
                    <ProductImage src={item.image} alt={item.alt} className="p-1.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-[.08em] text-[#97586e]">
                      {item.id} · {item.tag}
                    </p>
                    <h3 className="mt-1.5 font-display text-lg leading-tight text-[#553745] sm:text-xl">
                      {item.title}
                    </h3>
                  </div>
                </div>
                <p className="flex-1 px-4 py-4 text-xs leading-[1.7] text-[#765e68] sm:text-sm">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
          <p className="mt-4 max-w-4xl text-[11px] leading-[1.65] text-[#806874]">
            Fotos de produtos do catálogo oficial Vonix Hair, apenas como contexto da marca. Não
            retratam candidatas ou parcerias realizadas. A inscrição gratuita exige 18 anos ou mais;
            o TikTok é opcional e a aprovação depende da análise individual.
          </p>
        </div>
      </section>

      <AffiliateCreatorPaths recruitmentOpen={isOpen} onSafePreview={onSafePreview} />
      {sourceLinked && (
        <AffiliateEditorialPlanner
          recruitmentOpen={isOpen}
          onSafePreview={onSafePreview}
          referenceSlugs={referenceSelection[0]}
          onRemoveReference={(slug) =>
            referenceSelection[1]((previous) => previous.filter((item) => item !== slug))
          }
        />
      )}

      <AffiliateCreatorOpportunity
        recruitmentOpen={isOpen}
        onSafePreview={onSafePreview}
        sourceLinked={sourceLinked}
      />

      <section id="formatos" className="scroll-mt-24 bg-card px-5 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-3xl">
              <Eyebrow>Inspiração capilar</Eyebrow>
              <h2 className="mt-5 font-display text-4xl leading-tight text-foreground sm:text-5xl lg:text-5xl">
                Crie do <span className="italic text-primary">seu jeito.</span>
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-[1.8] text-muted-foreground">
                O universo dos cabelos rende muitas ideias. Explore diferentes formatos com imagens
                de categorias da própria loja Vonix Hair e produtos reais do catálogo. Fotografias
                ilustrativas não identificam criadoras do programa. Nunca invente experiências ou
                resultados de uso.
              </p>
            </div>
            <span className="rounded-full border border-border bg-card px-4 py-2 text-xs font-semibold text-muted-foreground">
              Exemplos ilustrativos · não são posts de afiliadas
            </span>
          </div>

          <div
            role="region"
            aria-label="Formatos criativos ilustrados com o acervo da loja Vonix Hair"
            tabIndex={0}
            className="-mx-5 mt-11 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-5 scroll-px-5 focus-visible:outline-2 focus-visible:outline-ring sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-4"
            data-testid="vonix-original-products"
          >
            {creativeIdeas.map((idea) => (
              <article
                key={idea.number}
                className="group min-w-[76vw] max-w-[20rem] snap-start overflow-hidden rounded-lg border border-border bg-card shadow-sm sm:min-w-0 sm:max-w-none"
              >
                <div className="relative aspect-[.95] overflow-hidden bg-card">
                  {idea.name === "Unboxing" ? (
                    <ProductImage
                      src={idea.image}
                      alt={idea.alt}
                      className="p-5 motion-safe:transition motion-safe:duration-500 motion-safe:group-hover:scale-[1.03]"
                    />
                  ) : (
                    <img
                      src={idea.image}
                      alt={idea.alt}
                      width={480}
                      height={480}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-500 motion-safe:group-hover:scale-[1.03]"
                    />
                  )}
                  <span className="absolute left-4 top-4 rounded-lg bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                    {idea.number}
                  </span>
                  {idea.name !== "Unboxing" && (
                    <span className="absolute bottom-3 left-3 right-3 rounded-lg bg-[#fffaf7]/95 px-3 py-2 text-[10px] font-semibold leading-snug text-[#563a47] shadow-sm">
                      Foto editorial de categoria Vonix · não é depoimento de afiliada
                    </span>
                  )}
                </div>
                <div className="p-6">
                  <h3 className="font-display text-2xl text-foreground">{idea.name}</h3>
                  <p className="mt-2 text-sm leading-[1.75] text-muted-foreground">{idea.text}</p>
                  <details className="group/brief mt-5 rounded-xl border border-border bg-secondary/30">
                    <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-semibold text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring [&::-webkit-details-marker]:hidden">
                      Ver ideia de roteiro
                      <ChevronDown
                        aria-hidden="true"
                        className="h-4 w-4 shrink-0 motion-safe:transition-transform group-open/brief:rotate-180"
                      />
                    </summary>
                    <div className="border-t border-border px-4 pb-5 pt-4">
                      <p className="text-[11px] font-bold uppercase tracking-[.11em] text-primary">
                        Abertura original sugerida
                      </p>
                      <p className="mt-2 font-display text-lg leading-snug text-foreground">
                        “{idea.opening}”
                      </p>
                      <p className="mt-4 text-xs font-bold uppercase tracking-[.1em] text-muted-foreground">
                        Três ideias para a sequência
                      </p>
                      <ol className="mt-3 space-y-2">
                        {idea.takes.map((take, index) => (
                          <li
                            key={take}
                            className="flex items-start gap-2 text-xs leading-relaxed text-muted-foreground"
                          >
                            <span aria-hidden="true" className="font-bold text-primary">
                              {index + 1}.
                            </span>
                            <span>{take}</span>
                          </li>
                        ))}
                      </ol>
                      <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
                        Modelo educativo, não é conteúdo de afiliada nem orientação para simular uso
                        ou resultado. Identifique publicidade quando houver parceria.
                      </p>
                      <AffiliateCreativeKitAction
                        name={idea.name}
                        opening={idea.opening}
                        takes={idea.takes}
                        recruitmentOpen={isOpen}
                        onSafePreview={onSafePreview}
                      />
                    </div>
                  </details>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-11 flex flex-col items-start justify-between gap-6 rounded-lg border border-border bg-card p-7 sm:flex-row sm:items-center sm:p-10">
            <div className="flex items-start gap-4">
              <PenLine aria-hidden="true" className="mt-1 h-6 w-6 shrink-0 text-muted-foreground" />
              <div>
                <h3 className="font-display text-2xl text-foreground">
                  Não existe um roteiro único para ter sua identidade.
                </h3>
                <p className="mt-2 max-w-2xl text-sm leading-[1.8] text-muted-foreground">
                  Conteúdo verdadeiro significa mostrar a própria experiência, sem inventar
                  resultados ou apresentar publicidade como opinião independente.
                </p>
              </div>
            </div>
            <Button asChild variant="link" className="h-auto min-h-11 max-w-full whitespace-normal">
              <AffiliateApplyLink
                recruitmentOpen={isOpen}
                onSafePreview={onSafePreview}
                className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground hover:bg-accent"
              >
                {isOpen ? "Conhecer a candidatura" : "Abrir prévia segura"}
                <ArrowRight aria-hidden="true" className="h-4 w-4" />
              </AffiliateApplyLink>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

/** Backward-compatible complete editorial composition for embedded uses. */
export function AffiliateLandingIntro({
  recruitmentStatus,
  onSafePreview,
}: {
  recruitmentStatus: RecruitmentStatus;
  onSafePreview?: (() => void) | undefined;
}) {
  return (
    <div data-testid="vonix-affiliate-editorial" className="min-w-0">
      <AffiliateLandingOffer recruitmentStatus={recruitmentStatus} onSafePreview={onSafePreview} />
      <AffiliateLandingDiscovery
        recruitmentStatus={recruitmentStatus}
        onSafePreview={onSafePreview}
      />
    </div>
  );
}

export function AffiliateLandingFAQ({
  recruitmentStatus = "loading",
  onSafePreview,
}: {
  recruitmentStatus?: RecruitmentStatus;
  onSafePreview?: (() => void) | undefined;
} = {}) {
  const isOpen = recruitmentStatus === "open";
  const [interactive, setInteractive] = useState(false);
  useEffect(() => setInteractive(true), []);
  const [faqQuery, setFaqQuery] = useState("");
  const normalizedQuery = normalizeFaqSearch(faqQuery);
  const matchingQuestions = normalizedQuery
    ? questions.filter((question) => matchesFaq(question, normalizedQuery))
    : questions;

  return (
    <section id="duvidas" className="scroll-mt-24 bg-card px-5 py-20 sm:py-28">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.75fr_1.25fr] lg:gap-16">
        <div>
          <Eyebrow>Perguntas frequentes</Eyebrow>
          <h2 className="mt-5 font-display text-4xl leading-tight text-foreground sm:text-5xl">
            Tudo mais claro <span className="italic text-primary">desde o começo.</span>
          </h2>
          <p className="mt-6 max-w-md text-sm leading-[1.85] text-muted-foreground">
            A página explica o processo de candidatura. Benefícios comerciais, contratação e
            condições de parceria, se houver, são tratados separadamente pela Vonix Hair.
          </p>
          <div className="mt-8 flex items-start gap-3 rounded-lg border border-border bg-card p-5">
            <ShieldCheck
              aria-hidden="true"
              className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground"
            />
            <p className="text-xs leading-[1.8] text-muted-foreground">
              Os dados do formulário são destinados à análise da candidatura. Consulte também a
              Política de Privacidade no formulário antes de aceitar os termos.
            </p>
          </div>
        </div>

        <div className="space-y-3" data-testid="vonix-affiliate-faq">
          <div
            data-testid="vonix-c84-faq-discovery"
            className="rounded-[1.4rem] border border-[#e4d0d3] bg-[#fcf6f3] p-4 shadow-[0_8px_24px_rgba(83,50,59,.06)] sm:p-6"
          >
            <label
              htmlFor="vonix-c84-faq-search"
              className="mb-3 block text-sm font-bold text-[#65404d]"
            >
              Encontre sua resposta
            </label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#875968]"
              />
              <input
                id="vonix-c84-faq-search"
                type="search"
                value={faqQuery}
                disabled={!interactive}
                maxLength={80}
                autoComplete="off"
                onChange={(event) => setFaqQuery(event.target.value)}
                placeholder="Busque inscrição, Instagram, comissão..."
                className="min-h-12 w-full rounded-xl border border-[#cfaeb9] bg-white py-3 pl-12 pr-4 text-base text-[#493039] outline-none focus:border-[#7b4857] focus:ring-2 focus:ring-[#dec5cc]"
              />
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="mr-1 text-xs font-semibold text-[#795d69]">Dúvidas comuns:</span>
              {["TikTok", "Comissão", "E-mail"].map((topic) => (
                <button
                  key={topic}
                  type="button"
                  aria-pressed={faqQuery === topic}
                  disabled={!interactive}
                  onClick={() => setFaqQuery((current) => (current === topic ? "" : topic))}
                  className={
                    "min-h-11 rounded-full border px-4 py-2 text-xs font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#7b4857] " +
                    (faqQuery === topic
                      ? "border-[#723d52] bg-[#723d52] text-white"
                      : "border-[#d2b6bd] bg-white text-[#734558] hover:bg-[#f3e4e8]")
                  }
                >
                  {topic}
                </button>
              ))}
              {faqQuery && (
                <button
                  type="button"
                  onClick={() => setFaqQuery("")}
                  disabled={!interactive}
                  className="min-h-11 px-2 text-xs font-semibold text-[#734558] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  Limpar busca
                </button>
              )}
            </div>
            <p
              data-testid="vonix-c84-faq-result-count"
              aria-live="polite"
              className="mt-3 text-xs font-medium text-[#795d69]"
            >
              {matchingQuestions.length}{" "}
              {matchingQuestions.length === 1 ? "resposta encontrada" : "respostas encontradas"}. A
              busca acontece nesta página, sem enviar os termos digitados.
            </p>
          </div>
          {matchingQuestions.length === 0 && (
            <div
              data-testid="vonix-c84-faq-empty"
              className="rounded-xl border border-[#e5d3d5] bg-white p-6 text-sm leading-relaxed text-[#6e4d5a]"
            >
              Não encontramos uma pergunta com esse termo. Tente buscar por inscrição, Instagram ou
              comissão. Você também pode{" "}
              <AffiliateApplyLink
                recruitmentOpen={isOpen}
                onSafePreview={onSafePreview}
                className="font-bold underline underline-offset-4"
              >
                {isOpen ? "conhecer o formulário" : "abrir a prévia segura"}
              </AffiliateApplyLink>
              .
            </div>
          )}
          {matchingQuestions.map((item) => {
            const { question, answer } = item;
            const i = questions.indexOf(item);
            const action = faqActions[i]!;
            return (
              <details
                key={question}
                className="group rounded-lg border border-border bg-card px-5 py-1 shadow-sm open:border-border sm:px-7"
              >
                <summary className="flex min-h-[4.6rem] cursor-pointer list-none items-center gap-4 py-4 text-left font-semibold text-muted-foreground marker:hidden [&::-webkit-details-marker]:hidden">
                  <span className="shrink-0 font-display text-xl text-muted-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 text-sm leading-relaxed sm:text-base">{question}</span>
                  <ChevronDown
                    aria-hidden="true"
                    className="h-5 w-5 shrink-0 text-muted-foreground motion-safe:transition-transform group-open:rotate-180"
                  />
                </summary>
                <div className="border-t border-border pb-6 pt-4 text-sm leading-[1.85] text-muted-foreground">
                  <p>{answer}</p>
                  {i === 5 && (
                    <p className="mt-3">
                      Se perdeu o código, abra a consulta de candidatura para conhecer as opções de
                      recuperação disponíveis. Não compartilhe seu código em comentários ou redes
                      sociais.
                    </p>
                  )}
                  {i === 6 ? (
                    <AffiliateApplyLink
                      recruitmentOpen={isOpen}
                      onSafePreview={onSafePreview}
                      className="mt-3 inline-flex min-h-11 items-center gap-2 font-bold text-primary underline underline-offset-4 focus-visible:outline-2"
                    >
                      {isOpen ? action.label : "Conhecer a prévia sem envio"}
                      <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
                    </AffiliateApplyLink>
                  ) : (
                    <a
                      href={action.href}
                      className="mt-3 inline-flex min-h-11 items-center gap-2 font-bold text-primary underline underline-offset-4 focus-visible:outline-2"
                    >
                      {action.label}
                      <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
                    </a>
                  )}
                </div>
              </details>
            );
          })}
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-7xl rounded-lg bg-primary px-6 py-12 text-center text-primary-foreground sm:px-10 sm:py-16">
        <p className="text-[11px] font-bold uppercase tracking-normal text-primary-foreground">
          Vonix Hair · Afiliadas
        </p>
        <h2 className="mx-auto mt-5 max-w-2xl font-display text-3xl leading-tight sm:text-5xl">
          Sua criatividade merece ser conhecida.
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-sm leading-[1.85] text-primary-foreground">
          Preencha o formulário simples e acompanhe a disponibilidade oficial da seleção.
        </p>
        <Button asChild variant="link" className="h-auto min-h-11 max-w-full whitespace-normal">
          <AffiliateApplyLink
            recruitmentOpen={isOpen}
            onSafePreview={onSafePreview}
            className="mt-7 inline-flex min-h-12 items-center gap-3 rounded-full bg-card px-7 py-3 text-sm font-bold text-primary transition hover:bg-accent"
          >
            {isOpen ? "Ir para a inscrição" : "Abrir prévia segura"}
            <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </AffiliateApplyLink>
        </Button>
      </div>
    </section>
  );
}
