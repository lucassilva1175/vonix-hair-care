/** Original editorial prompts, not campaign assignments or promises. */
export const editorialProfiles = [
  { id: "rotina", label: "Rotina e comunidade", focus: "Conversa próxima com seu público" },
  { id: "ugc", label: "UGC e criação", focus: "Enquadramento, composição e edição" },
  { id: "informacao", label: "Conteúdo informativo", focus: "Clareza e conferência de fontes" },
] as const;
export type EditorialProfile = (typeof editorialProfiles)[number]["id"];
export type EditorialCadence = 2 | 3 | 5;
export type EditorialFormat = "video" | "foto" | "misto";
type Idea = { title: string; opening: string; video: string; photo: string; verify: string };
const ideas: Record<EditorialProfile, readonly Idea[]> = {
  rotina: [
    {
      title: "Contexto da sua rotina",
      opening: "O que faz sentido na minha rotina de cuidado?",
      video: "Grave três cenas de hábitos que você realmente pratica.",
      photo: "Monte um carrossel com três hábitos reais.",
      verify: "Não atribua resultados a produtos que você não usou.",
    },
    {
      title: "Conversas com a comunidade",
      opening: "O que observo antes de escolher um cuidado capilar?",
      video: "Explique dois critérios pessoais em um vídeo curto.",
      photo: "Crie dois cartões com os seus critérios.",
      verify: "Separe preferências pessoais das instruções oficiais.",
    },
    {
      title: "Leitura de embalagem",
      opening: "Um detalhe que vale conferir antes de usar.",
      video: "Mostre o rótulo de um produto que você possui ou explique a página oficial.",
      photo: "Faça uma composição com rótulo próprio ou referência textual à fonte.",
      verify: "Confira indicação, modo de uso e restrições.",
    },
    {
      title: "Registro de experiência",
      opening: "Como registro uma experiência sem exagerar?",
      video: "Mostre seu método de registro; relate uso apenas se ocorreu.",
      photo: "Prepare uma sequência de observações reais, sem antes e depois inventado.",
      verify: "Não generalize efeitos nem prometa resultados.",
    },
    {
      title: "Perguntas do público",
      opening: "Uma pergunta sobre cuidados que merece contexto.",
      video: "Responda uma dúvida com linguagem simples e fontes verificadas.",
      photo: "Crie um cartão de pergunta e resposta.",
      verify: "Não ofereça diagnóstico ou orientação profissional sem habilitação.",
    },
  ],
  ugc: [
    {
      title: "Composição visual",
      opening: "Três enquadramentos para uma apresentação de beleza.",
      video: "Filme três ângulos de objetos que você tem autorização para mostrar.",
      photo: "Monte uma composição de três enquadramentos próprios.",
      verify: "Não represente objetos de terceiros como produtos recebidos.",
    },
    {
      title: "Textura e iluminação",
      opening: "Como a luz muda a percepção de uma cena.",
      video: "Compare duas iluminações sem alterar alegações de resultado.",
      photo: "Fotografe a mesma composição em duas iluminações.",
      verify: "Evite retoques que simulem eficácia capilar.",
    },
    {
      title: "Apresentação de catálogo",
      opening: "O que uma descrição oficial ajuda a entender?",
      video: "Organize uma narração sobre informações públicas do catálogo.",
      photo: "Crie um carrossel textual com referência à página oficial.",
      verify: "Não copie mídia sem autorização e não invente uma resenha.",
    },
    {
      title: "Roteiro em três cenas",
      opening: "Da ideia ao enquadramento em poucos segundos.",
      video: "Planeje abertura, demonstração permitida e encerramento.",
      photo: "Faça um storyboard de três quadros.",
      verify: "Só demonstre uso real e permitido pelo rótulo.",
    },
    {
      title: "Identidade de criação",
      opening: "Como apresentaria uma ideia com meu estilo?",
      video: "Mostre um pequeno exemplo de edição original.",
      photo: "Crie uma prancha visual com materiais próprios.",
      verify: "Identifique publicidade se houver relação comercial.",
    },
  ],
  informacao: [
    {
      title: "Leitura de informações",
      opening: "O que conferir antes de escolher um produto capilar?",
      video: "Explique como ler indicação e modo de uso na fonte oficial.",
      photo: "Faça um carrossel com os pontos a conferir.",
      verify: "Não prescreva tratamento nem altere instruções.",
    },
    {
      title: "Comparação responsável",
      opening: "Informação de produto não é promessa de resultado.",
      video: "Compare descrições oficiais sem inventar superioridade.",
      photo: "Organize duas colunas de informações verificadas.",
      verify: "Não extrapole para efeitos não comprovados.",
    },
    {
      title: "Dúvida frequente",
      opening: "Uma pergunta que vale pesquisar antes de responder.",
      video: "Apresente a dúvida e a fonte consultada.",
      photo: "Crie um cartão com pergunta, contexto e referência.",
      verify: "Diferencie fato verificável de opinião.",
    },
    {
      title: "Uso profissional",
      opening: "Por que a indicação de uso importa?",
      video: "Explique a importância de seguir restrições e buscar profissional quando indicado.",
      photo: "Crie uma lista de cuidados de leitura do rótulo.",
      verify: "Não ensine procedimentos químicos exclusivos de profissionais.",
    },
    {
      title: "Revisão de fontes",
      opening: "Antes de publicar, como confiro minhas informações?",
      video: "Mostre seu checklist de verificação.",
      photo: "Crie uma ficha de revisão editorial.",
      verify: "Não apresente parceria ou experiência inexistente.",
    },
  ],
};
export function buildEditorialPlan(
  profile: EditorialProfile,
  cadence: EditorialCadence,
  format: EditorialFormat,
) {
  const chosen = editorialProfiles.find((p) => p.id === profile);
  if (!chosen || ![2, 3, 5].includes(cadence) || !["video", "foto", "misto"].includes(format))
    throw new Error("invalid editorial plan");
  const days =
    cadence === 2
      ? ["Terça", "Sexta"]
      : cadence === 3
        ? ["Segunda", "Quarta", "Sexta"]
        : ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
  const entries = days.map((day, i) => {
    const idea = ideas[profile][i]!;
    const selected = format === "misto" ? (i % 2 === 0 ? "video" : "foto") : format;
    return {
      day,
      title: idea.title,
      opening: idea.opening,
      format: selected === "video" ? "Vídeo curto" : "Foto ou carrossel",
      task: selected === "video" ? idea.video : idea.photo,
      verify: idea.verify,
    };
  });
  const text = [
    "VONIX HAIR — PLANO EDITORIAL PESSOAL",
    chosen.label + " · " + cadence + " ideias por semana",
    ...entries.map((e) =>
      [
        e.day + " — " + e.title + " (" + e.format + ")",
        "Abertura: " + e.opening,
        "Ideia: " + e.task,
        "Antes de publicar: " + e.verify,
      ].join("\n"),
    ),
    "Referências oficiais: https://vonixhair.com/loja",
    "Plano opcional de inspiração, não é campanha contratada, obrigação, aprovação ou garantia de ganhos. Use apenas materiais autorizados e experiências verdadeiras. Identifique publicidade quando aplicável.",
  ].join("\n\n");
  return { entries, text };
}
