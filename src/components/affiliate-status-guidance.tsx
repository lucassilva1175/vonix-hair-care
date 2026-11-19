import { ArrowUpRight, ShieldCheck } from "lucide-react";

type Status = "pendente" | "aprovada" | "recusada";

// Copy only: the actual outcome still comes exclusively from the protected lookup.
const guidance = {
  pendente: {
    title: "Sua inscrição está na fila de avaliação.",
    explanation:
      "A equipe ainda está avaliando o perfil informado. Você não precisa enviar outro cadastro para acompanhar o mesmo pedido.",
    next: "Guarde seu código privado e consulte novamente quando desejar. Não há prazo de resposta garantido.",
  },
  aprovada: {
    title: "A seleção avançou. Agora aguarde a equipe.",
    explanation:
      "A aprovação da candidatura não ativa automaticamente um link, cupom, pagamento ou contrato.",
    next: "A equipe poderá confirmar os próximos passos e as condições aplicáveis por um canal oficial da Vonix Hair.",
  },
  recusada: {
    title: "Esta avaliação foi encerrada.",
    explanation:
      "O motivo apresentado acima explica a decisão registrada pela equipe, sem expor outras informações privadas.",
    next: "Você pode corrigir as informações do seu perfil antes de fazer uma nova candidatura, quando as inscrições estiverem abertas.",
  },
} as const;

export function AffiliateStatusGuidance({ status }: { status: Status }) {
  const info = guidance[status];
  return (
    <aside
      aria-labelledby="affiliate-status-next-title"
      data-testid="affiliate-c59-next-action"
      className="mt-5 rounded-2xl border border-[#dbc7cb] bg-white p-5 sm:p-6"
    >
      <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#80515f]">
        <ShieldCheck aria-hidden="true" className="h-4 w-4" /> Próximo passo
      </p>
      <h3 id="affiliate-status-next-title" className="mt-3 font-display text-xl text-[#4d303a]">
        {info.title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-[#70525c]">{info.explanation}</p>
      <p className="mt-2 text-sm leading-relaxed text-[#70525c]">{info.next}</p>
      <a
        href="/sobre"
        className="mt-4 inline-flex min-h-11 items-center gap-2 font-semibold
        text-[#633847] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        Conhecer os canais oficiais <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
      </a>
    </aside>
  );
}
