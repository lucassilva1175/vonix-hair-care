import { useRef, useState, type KeyboardEvent } from "react";
import { ArrowRight, BookOpen, Camera, Heart, Sparkles, Check } from "lucide-react";

const paths = [
  {
    id: "rotina",
    eyebrow: "Caminho 01 · Rotina e comunidade",
    label: "Compartilho minha rotina",
    shortLabel: "Rotina e comunidade",
    title: "Sua rotina também pode contar uma história.",
    intro:
      "Você gosta de conversar com sua audiência sobre cabelo, beleza e autocuidado. Quer mostrar suas experiências com uma linguagem própria, sem precisar de um portfólio profissional para se apresentar.",
    prompts: [
      "Como você cuida do cabelo no dia a dia",
      "O que observa ao conhecer uma linha capilar",
      "Como conversa de verdade com sua comunidade",
    ],
    image: "/images/categorias/cachos.jpg",
    alt: "Fotografia editorial ilustrativa de cabelos cacheados, presente nas categorias da Vonix Hair; não identifica participante do programa",
    tone: "bg-[#f1dfd2]",
  },
  {
    id: "ugc",
    eyebrow: "Caminho 02 · Conteúdo UGC",
    label: "Exploro fotos e vídeos",
    shortLabel: "UGC e criação",
    title: "Sua criatividade pode aparecer nos detalhes.",
    intro:
      "Você se interessa por composição, edição, vídeos ou fotos de produtos. Seu perfil pode mostrar habilidades criativas, mesmo sem experiências anteriores com marcas.",
    prompts: [
      "Uma composição com embalagens e texturas",
      "Como contaria uma rotina em poucos segundos",
      "Sua forma de apresentar um produto com transparência",
    ],
    image: "/images/categorias/frizz.jpg",
    alt: "Fotografia editorial ilustrativa de cabelo longo, presente na categoria de frizz da loja Vonix Hair; não identifica afiliada",
    tone: "bg-[#e8dbe0]",
  },
  {
    id: "informacao",
    eyebrow: "Caminho 03 · Informação e cuidado",
    label: "Compartilho dicas de cabelo",
    shortLabel: "Conteúdo informativo",
    title: "Boas informações também criam conexões.",
    intro:
      "Você gosta de pesquisar o universo capilar, conferir rótulos e explicar diferenças entre rotinas de cuidado. Pode transformar curiosidades em conteúdo claro, sem prometer resultados nem se apresentar como profissional sem ser.",
    prompts: [
      "Um detalhe do rótulo que vale explicar com cuidado",
      "Como compararia informações de duas rotinas capilares",
      "O que é opinião pessoal e o que é informação do fabricante",
    ],
    image: "/images/categorias/hidratacao.jpg",
    alt: "Fotografia editorial ilustrativa de cabelos, presente na categoria de hidratação da loja Vonix Hair; não identifica afiliada",
    tone: "bg-[#e9e4de]",
  },
] as const;

export function AffiliateCreatorPaths() {
  const [active, setActive] = useState<0 | 1 | 2>(0);
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const current = paths[active];

  function moveTab(event: KeyboardEvent<HTMLButtonElement>, index: 0 | 1 | 2) {
    if (
      event.key !== "ArrowLeft" &&
      event.key !== "ArrowRight" &&
      event.key !== "Home" &&
      event.key !== "End"
    )
      return;
    event.preventDefault();
    const next: 0 | 1 | 2 =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? 2
          : event.key === "ArrowRight"
            ? (((index + 1) % paths.length) as 0 | 1 | 2)
            : (((index - 1 + paths.length) % paths.length) as 0 | 1 | 2);
    setActive(next);
    buttons.current[next]?.focus();
  }

  return (
    <section
      id="perfis"
      className="scroll-mt-40 bg-card px-5 py-16 sm:py-24"
      aria-labelledby="vonix-creator-paths-title"
      data-testid="affiliate-c54-creator-paths"
    >
      <div className="mx-auto max-w-7xl">
        <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[.12em] text-primary">
          <Sparkles aria-hidden="true" className="h-4 w-4" />
          Seu perfil, sua identidade
        </p>
        <div className="mt-5 grid items-end gap-6 lg:grid-cols-[1.1fr_.9fr]">
          <h2
            id="vonix-creator-paths-title"
            className="max-w-3xl font-display text-4xl leading-tight text-foreground sm:text-5xl lg:text-6xl"
          >
            Três jeitos de criar.{" "}
            <span className="italic text-primary">O seu jeito de começar.</span>
          </h2>
          <p className="max-w-xl text-sm leading-[1.9] text-muted-foreground sm:text-base">
            Não é preciso se encaixar em um único formato. Escolha um dos estilos abaixo e conheça
            ideias para apresentar sua criatividade à equipe da Vonix Hair.
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-[.82fr_1.18fr]">
          <div
            role="tablist"
            aria-label="Estilos de criação Vonix Hair"
            className="grid grid-cols-3 gap-2 sm:gap-3 lg:grid-cols-1"
          >
            {paths.map((path, index) => {
              const selected = active === index;
              return (
                <button
                  key={path.id}
                  ref={(element) => {
                    buttons.current[index] = element;
                  }}
                  type="button"
                  role="tab"
                  id={"vonix-path-tab-" + path.id}
                  aria-controls="vonix-path-panel"
                  aria-label={path.label}
                  aria-selected={selected}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActive(index as 0 | 1 | 2)}
                  onKeyDown={(event) => moveTab(event, index as 0 | 1 | 2)}
                  className={
                    "group flex min-h-[7.25rem] w-full min-w-0 flex-col justify-between gap-2 rounded-[1.15rem] border px-2.5 py-3 text-center transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:min-h-[8rem] sm:rounded-[1.5rem] sm:p-5 sm:text-left lg:min-h-[8.75rem] lg:p-6 " +
                    (selected
                      ? "border-primary bg-primary text-primary-foreground shadow-[0_18px_40px_rgba(65,33,45,.15)]"
                      : "border-border bg-background text-foreground hover:border-primary")
                  }
                >
                  <span className="flex w-full items-center justify-center gap-1 sm:justify-between sm:gap-3">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[.1em] sm:gap-2 sm:text-[11px]">
                      {index === 0 ? (
                        <Heart aria-hidden="true" className="h-4 w-4" />
                      ) : index === 1 ? (
                        <Camera aria-hidden="true" className="h-4 w-4" />
                      ) : (
                        <BookOpen aria-hidden="true" className="h-4 w-4" />
                      )}
                      <span className="sm:hidden">0{index + 1}</span>
                      <span className="hidden sm:inline">{path.eyebrow}</span>
                    </span>
                    <ArrowRight
                      aria-hidden="true"
                      className={
                        "hidden h-5 w-5 transition-transform sm:block " +
                        (selected ? "translate-x-1" : "group-hover:translate-x-1")
                      }
                    />
                  </span>
                  <strong className="font-display text-[13px] leading-snug sm:mt-3 sm:text-[1.45rem] lg:text-2xl">
                    <span className="sm:hidden">{path.shortLabel}</span>
                    <span className="hidden sm:inline">{path.label}</span>
                  </strong>
                </button>
              );
            })}
          </div>

          <div
            role="tabpanel"
            id="vonix-path-panel"
            aria-labelledby={"vonix-path-tab-" + current.id}
            tabIndex={0}
            className="min-w-0 overflow-hidden rounded-[1.6rem] border border-border bg-background focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
          >
            <div className="grid h-full md:grid-cols-[.9fr_1.1fr]">
              <div className={"relative min-h-64 overflow-hidden " + current.tone}>
                <span className="absolute left-5 top-5 z-10 rounded-full bg-white/90 px-4 py-2 text-[10px] font-bold uppercase tracking-[.13em] text-[#6d3d4c]">
                  Imagem editorial da loja · não é depoimento
                </span>
                <img
                  src={current.image}
                  alt={current.alt}
                  width={480}
                  height={480}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-500"
                />
              </div>
              <div className="flex min-w-0 flex-col justify-center p-6 sm:p-9">
                <span className="text-[11px] font-bold uppercase tracking-[.13em] text-primary">
                  {current.shortLabel}
                </span>
                <h3 className="mt-4 font-display text-3xl leading-tight text-foreground">
                  {current.title}
                </h3>
                <p className="mt-4 text-sm leading-[1.8] text-muted-foreground">{current.intro}</p>
                <p className="mt-6 text-xs font-bold uppercase tracking-[.12em] text-primary">
                  Ideias para apresentar seu perfil
                </p>
                <ul className="mt-3 space-y-3">
                  {current.prompts.map((prompt) => (
                    <li
                      key={prompt}
                      className="flex items-start gap-2 text-sm leading-relaxed text-foreground"
                    >
                      <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {prompt}
                    </li>
                  ))}
                </ul>
                <a
                  href="#inscricao"
                  className="mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                >
                  Apresentar meu perfil <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
        <p className="mt-6 max-w-3xl text-xs leading-[1.8] text-muted-foreground">
          Estes são três exemplos de estilos de conteúdo — você pode combinar todos eles. Não são
          categorias de aprovação, requisitos profissionais ou modalidades de contrato. As
          fotografias ilustram categorias capilares presentes na loja Vonix Hair: não representam
          participantes do programa, depoimentos de afiliadas nem resultados de parcerias.
        </p>
      </div>
    </section>
  );
}
