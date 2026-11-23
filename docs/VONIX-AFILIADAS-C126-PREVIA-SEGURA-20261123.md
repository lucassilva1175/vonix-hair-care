# Vonix Hair — Portal de Afiliadas C126 | CTA direto para prévia segura

**Data:** 23/11/2026. **Escopo:** exclusivamente Portal de Afiliadas; NÃO e-commerce, checkout, banco, Lovable main nem produção.

## Continuidade e referência
- Base certificada C125: commit `d138403`, PR #279 DRAFT, clone `C:\Users\JL\code\vonix-afiliadas-c111-20261122`.
- Código C126: commit `63fe721`; reparo do teste de ordem: `a7acfae4a9ab27fb0443a419f73ab7c4aa18a2b0`.
- Referência editorial: https://skence.com.br/pages/skence-creators ; fonte de marca/condições: https://vonixhair.com/seja-afiliada .
- Lovable projeto `203d2f84-1058-4ca4-acc3-41a4a5d4e2b5`: main compartilhado com e-commerce, SHA observado `62ad4d3659a370e9d92416d0419d0d4cf0537f52`; **não integrado, não alterado, não publicado**.

## Modificação validada
- Clique único na chamada principal, ponte do processo C125 e barra fixa mobile abre prévia segura quando status do servidor NÃO está OPEN. Quando OPEN, dirige para o formulário de inscrição real.
- A prévia é sempre simulação e **não realiza POST**, mesmo quando o status do recrutamento muda; usa controle existente de rascunho e descarte. Texto auxiliar esclarece explicitamente que a prévia não envia dados.
- Mantidos eventos agregados anônimos de interesse: sem PII, sem número de inscrição, sem Meta Lead falso. Sem alegações de testemunhos de afiliadas ou renda garantida.
- Reparo de teste C117 verifica a ordem real das seções por identificador do componente, não pela igualdade textual exata do JSX com props. Assertions do DOM e de prevenção de POST preservadas.
- Arquivos alterados (8): `affiliate-application-bridge.tsx`, `affiliate-editorial-hero.tsx`, `affiliate-landing.tsx`, `affiliate-mobile-apply-bar.tsx`, `seja-afiliada.tsx`, `affiliate-c76-mobile-apply.test.tsx`, `affiliate-c126-safe-preview-shortcuts.test.tsx`, `affiliate-c117-application-first.test.tsx`.

## Evidências e limites
- Testes focados novos + C125 + mobile: **13/13 PASS**; C117 + novos: **6/6 PASS**.
- CI GitHub https://github.com/lucassilva1175/vonix-hair-care/actions/runs/45214052663 **SUCCESS**, **1.094/1.094 testes**, **156/156 arquivos**, ambos jobs (tipos/lint/build e PostgreSQL RLS/migração/concorrência) SUCCESS.
- Prettier, ESLint em arquivos editados e `git diff --check`: PASS. `tsc` local: exit 2 apenas por 3 TS2322 existentes em `src/routes/checkout.tsx:1466-1468`, que não pertencem ao portal; CI completo rodou com sucesso em ambiente isolado.
- Chrome local com requests externos e POST bloqueados: **390/768/1440 PASS** (CTA >=44px, simulação, sem overflow horizontal/JS error, zero POST). **360 NÃO APROVADO**: timeout de 12s aguardando campo da prévia após clique enquanto RAM do computador variou entre 0,8 e 3,9 GB livres; não afirmar 4/4 ou conversão comprovada. Screenshots/logs em `qa-artifacts/c126-*`.
- Arquivo C126 SOURCE_ONLY: `qa-artifacts/c126-source-only-checkpoint-20261123.zip`, 8 arquivos com hash individual e byte-identidade Git/ZIP verificados, SHA256 `778d6778792d1ce9bb3aa34b5567b091fd646dddb4424556a932d8f347e1c115`. C125 intacto.

## Gate
PR https://github.com/lucassilva1175/vonix-hair-care/pull/279 **OPEN DRAFT**, sem merge e sem deploy. **PRODUÇÃO: NOT_APPROVED** até reconciliação Lovable/e-commerce compartilhado, QA 360 em ambiente estável, validação visual/staging completa e medição real de candidatura e conversão. Avaliações de PRODUTOS não devem ser apresentadas como depoimentos de afiliadas.
