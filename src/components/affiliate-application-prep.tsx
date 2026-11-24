import { useEffect, useState } from "react";
import { AffiliateApplyLink } from "@/components/affiliate-apply-link";
import {
  ArrowRight,
  Check,
  ClipboardCheck,
  HeartHandshake,
  Instagram,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";

const preparation = [
  {
    id: "contact",
    title: "Seus dados de contato",
    detail: "Nome completo, e-mail válido e telefone com DDD para contato da equipe.",
    Icon: Phone,
  },
  {
    id: "address",
    title: "Endereço completo",
    detail: "CEP, rua, número, bairro, cidade e estado, conforme o formulário.",
    Icon: MapPin,
  },
  {
    id: "instagram",
    title: "Seu Instagram",
    detail: "Nome de usuário e quantidade aproximada de seguidores.",
    Icon: Instagram,
  },
  {
    id: "tiktok",
    title: "TikTok, se você tiver",
    detail: "É opcional. Não impede que você apresente sua candidatura.",
    Icon: HeartHandshake,
  },
] as const;

type PreparationKey = "age" | "contact" | "address" | "instagram";

const checklistLabels: Record<PreparationKey, string> = {
  age: "Tenho 18 anos ou mais",
  contact: "Separei meus dados de contato",
  address: "Separei meu endereço com CEP e número",
  instagram: "Tenho meu Instagram e o número aproximado de seguidores",
};

/**
 * Public, editorial-only guide. Checkbox state is kept in memory in this
 * component. No personal details, enrollment, network calls or storage.
 */
export function AffiliateApplicationPrep({
  recruitmentOpen = false,
  onSafePreview,
}: {
  recruitmentOpen?: boolean;
  onSafePreview?: (() => void) | undefined;
} = {}) {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const [prepared, setPrepared] = useState<Record<PreparationKey, boolean>>({
    age: false,
    contact: false,
    address: false,
    instagram: false,
  });
  const preparedCount = Object.values(prepared).filter(Boolean).length;

  function togglePreparation(key: PreparationKey, checked: boolean) {
    setPrepared((previous) => ({ ...previous, [key]: checked }));
  }

  return (
    <aside
      aria-labelledby="vonix-c54-prep-title"
      className="mx-auto mb-12 max-w-5xl overflow-hidden rounded-[1.7rem] border border-[#dfcbd0] bg-[#fcf6f2] shadow-[0_12px_35px_rgba(81,44,57,.06)]"
      data-testid="affiliate-c54-preparation"
    >
      <div className="grid gap-6 bg-[#ead7d5] px-6 py-7 sm:grid-cols-[1fr_auto] sm:items-end sm:px-9">
        <div>
          <p className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[.16em] text-[#85535f]">
            <ClipboardCheck aria-hidden="true" className="h-4 w-4" />
            Antes de começar
          </p>
          <h3
            id="vonix-c54-prep-title"
            className="mt-3 font-display text-3xl leading-tight text-[#4e2b3a] sm:text-4xl"
          >
            Sua candidatura pode ser simples.
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-[1.8] text-[#75535f]">
            Deixe essas informações por perto e preencha o formulário com tranquilidade. Não é
            necessário criar um portfólio só para se candidatar.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 self-start rounded-full border border-[#caa9af] bg-white/85 px-4 py-2 text-xs font-semibold text-[#66404e] sm:self-end">
          <Check aria-hidden="true" className="h-4 w-4" />
          Inscrição gratuita
        </span>
      </div>

      <div
        data-testid="affiliate-c88-preparation-progress"
        className="border-b border-[#dfcbd0] bg-white px-6 py-6 sm:px-9"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.08em] text-[#845167]">
              Minha preparação
            </p>
            <p
              className="mt-1 text-sm font-semibold text-[#50323f]"
              aria-live="polite"
              aria-atomic="true"
            >
              {preparedCount} de 4 itens organizados
            </p>
          </div>
          <span className="text-xs leading-relaxed text-[#765b65]">
            Só para você · nada é enviado
          </span>
        </div>
        <progress
          aria-label="Itens preparados para a candidatura"
          value={preparedCount}
          max={4}
          className="mt-4 block h-2 w-full overflow-hidden rounded-full accent-[#793f54]"
        />
        <label className="mt-5 flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-[#ead8d5] bg-[#fff8f6] px-4 py-3 text-sm font-medium text-[#50323f]">
          <input
            type="checkbox"
            checked={prepared.age}
            disabled={!hydrated}
            onChange={(event) => togglePreparation("age", event.target.checked)}
            className="size-5 shrink-0 accent-[#793f54]"
          />
          <span>{checklistLabels.age}</span>
        </label>
      </div>

      <ul className="grid gap-px bg-[#e8d8d4] sm:grid-cols-2">
        {preparation.map(({ id, title, detail, Icon }) => (
          <li key={id} className="flex min-w-0 items-start gap-4 bg-[#fffcfa] p-5 sm:p-7">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f1e0df] text-[#7d4d5a]">
              <Icon aria-hidden="true" className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-[#4f303b]">{title}</p>
              <p className="mt-2 text-sm leading-[1.75] text-[#80626b]">{detail}</p>
              {id !== "tiktok" && (
                <label className="mt-4 flex min-h-11 cursor-pointer items-center gap-2 text-xs font-semibold leading-snug text-[#78485c]">
                  <input
                    type="checkbox"
                    checked={prepared[id]}
                    disabled={!hydrated}
                    onChange={(event) => togglePreparation(id, event.target.checked)}
                    className="size-5 shrink-0 accent-[#793f54]"
                  />
                  <span>{checklistLabels[id]}</span>
                </label>
              )}
            </div>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-start justify-between gap-4 bg-[#fbf4f0] px-6 py-5 sm:px-9">
        <ShieldCheck aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-[#805360]" />
        <p className="max-w-3xl text-xs leading-[1.85] text-[#745762]">
          O cadastro não garante aprovação. Antes de enviar, confira os dados e leia a{" "}
          <a
            href="/politica-de-privacidade"
            className="font-semibold underline decoration-[#b78593] underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Política de Privacidade
          </a>
          . Se concluir a candidatura, guarde o código de acompanhamento.
        </p>
        <AffiliateApplyLink
          recruitmentOpen={recruitmentOpen}
          onSafePreview={onSafePreview}
          data-testid="affiliate-c88-safe-next-step"
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#723e52] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#603345] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#723e52]"
        >
          {recruitmentOpen ? "Conferir disponibilidade da inscrição" : "Abrir prévia segura"}
          <ArrowRight aria-hidden="true" className="size-4 shrink-0" />
        </AffiliateApplyLink>
        <p className="w-full text-xs leading-relaxed text-[#765b65]">
          Marcar os itens só organiza suas informações; não valida idade, não realiza candidatura
          nem garante aprovação. Os marcadores não são salvos.
        </p>
      </div>
    </aside>
  );
}
