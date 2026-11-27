type Readiness = {
  checks: Array<{ id: string; label: string; ok: boolean }>;
  databaseResponding: boolean;
  governanceResponding: boolean;
  recruitmentOpen: boolean;
};
const nextAction: Record<string, string> = {
  database: "Confirme o projeto dedicado e seu isolamento do checkout com o responsável técnico.",
  migration: "Valide a migração de governança em ambiente controlado antes de atestá-la.",
  privacy: "Obtenha a aprovação da política de privacidade pelo responsável pela operação.",
  provider: "Confirme HTTPS, proxy e cabeçalhos privados no domínio oficial.",
  admin: "Revise a configuração de sessão administrativa com o proprietário.",
  totp: "Revise o acesso legado por autenticador somente se ele ainda for utilizado.",
  proxy: "Valide a origem confiável e a limitação de tráfego sem expor chaves.",
  encryption: "Confirme a configuração de criptografia no ambiente protegido.",
  resend: "Homologue remetente, worker e caixa de teste antes de processar notificações reais.",
  launch: "Confira as permissões de abertura; não libere apenas para eliminar este aviso.",
};
export function AffiliateReadinessActions({ readiness }: { readiness: Readiness }) {
  const unresolved = readiness.checks.filter((check) => !check.ok);
  const priority = unresolved.filter(
    (check) => !["resend", "totp", "admin", "launch"].includes(check.id),
  );
  const configured = readiness.checks.length - unresolved.length;
  return (
    <div
      data-testid="affiliate-readiness-actions"
      className="mt-4 rounded-xl border border-[#e1c8cc] bg-[#fffaf7] p-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-[#623b45]">Próximas ações de homologação</h3>
        <span className="text-xs font-semibold tabular-nums text-[#806a6c]">
          {configured} de {readiness.checks.length} verificações de configuração positivas
        </span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-[#806a6c]">
        A abertura configurada e a saúde das consultas são verificações diferentes. Nenhum indicador
        confirma entrega de e-mail ou aceite operacional completo.
      </p>
      <ul className="mt-3 space-y-2 text-xs leading-relaxed text-[#65434d]">
        {!readiness.databaseResponding && (
          <li className="rounded-lg bg-white p-3">
            <strong>Consulta ao banco não confirmada.</strong> Verifique a conexão e a resposta da
            RPC de totais antes de usar o painel.
          </li>
        )}
        {!readiness.governanceResponding && (
          <li className="rounded-lg bg-white p-3">
            <strong>Governança não confirmada.</strong> Verifique a RPC de retenção e a migração
            antes de executar ações sobre dados.
          </li>
        )}
        {[...priority, ...unresolved.filter((check) => !priority.includes(check))].map((check) => (
          <li key={check.id} className="rounded-lg bg-white p-3">
            <strong className="block">Pendência: {check.label}</strong>
            <span>
              {nextAction[check.id] ?? "Revise esta verificação com o responsável autorizado."}
            </span>
          </li>
        ))}
        {!unresolved.length && readiness.databaseResponding && readiness.governanceResponding && (
          <li className="rounded-lg bg-white p-3">
            <strong>Configuração e consultas responderam.</strong> Execute o aceite controlado de
            candidatura, decisão, entrega de e-mail e conta da equipe antes de declarar a operação
            homologada.
          </li>
        )}
      </ul>
    </div>
  );
}
