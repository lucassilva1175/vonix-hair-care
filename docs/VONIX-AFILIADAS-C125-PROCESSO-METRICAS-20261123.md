# C125 — Jornada clara e sinais anônimos | Portal de Afiliadas Vonix Hair

Data: 23/11/2026, BRT. **Somente Portal de Afiliadas**, sem modificações do e-commerce.
Base C124: commit `1d2876fd912fb96597dfc2e9f012058c0243e82d`, branch `feat/afiliadas-c86-prova-social-foto-20261121`; PR #279 DRAFT.
Fontes: https://vonixhair.com/seja-afiliada e catálogo oficial Vonix Hair. Referência editorial: https://skence.com.br/pages/skence-creators.
Lovable vinculada: projeto `203d2f84-1058-4ca4-acc3-41a4a5d4e2b5`, main compartilhado com e-commerce, SHA observado `44fa64456cc751a243c28293d0be0abbbd94d048`. **Não sincronizado, não publicado.**

## Implementação

- Novo `AffiliateApplicationBridge` após avaliação real de **produto** e antes da inscrição: três etapas factuais — apresentar Instagram/dados, análise individual sem aprovação/prazo automático, código privado só após envio real confirmado. CTA muda entre iniciar candidatura e conhecer formulário conforme status confirmado do backend. Marca, textos e fotos existentes preservados.
- `affiliate_application_interest` no CTA do hero e no novo atalho; `affiliate_form_invalid` somente após falha de validação Zod de envio real. Esses são eventos agregados sem metadados ou dados pessoais, e **não disparam Meta Lead**; o evento `sign_up` anterior só ocorre com comprovante validado após persistência confirmada.
- Prévia continua sem POST nem evento real de invalidação; gates de disponibilidade/timeout/fail-closed C124 permanecem. Nenhum depoimento de afiliada fictício, número de candidaturas, faturamento ou promessa de ganhos adicionados.
- Escopo de código: `src/components/affiliate-application-bridge.tsx`, `affiliate-editorial-hero.tsx`, `affiliate-simple-form.tsx`, `src/routes/seja-afiliada.tsx`, `src/lib/affiliate-funnel.ts`, novo teste `src/test/affiliate-c125-process-and-metrics.test.tsx`.

## Validação realizada

- Novos testes + regressão C68: **8/8 PASS** (2 arquivos).
- Suíte integral: **1.063/1.063 PASS** em **150 arquivos**, 4 shards sequenciais (`321+265+216+261`), 0 falhas. Logs e exit codes em `qa-artifacts/c125-shard-*.log` e `*.exit.txt`.
- Prettier e ESLint de arquivos alterados: exit 0. `git diff --check`: exit 0.
- TypeScript local: exit 2 exclusivamente três **TS2322 preexistentes** em `src/routes/checkout.tsx:1466-1468`; checkout não modificado nem tratado como corrigido.
- Browser real C125 **NÃO EXECUTADO**: RAM física livre verificada em ~2,2–3,2 GB e outras tarefas concorrentes; não declarar 8/8 Chrome C125 ou melhoria comprovada de conversão. C124 havia passado 8/8, mas não cobre novo bloco C125.
- Métrica `affiliate_form_invalid` cobre a validação Zod do handler; bloqueios nativos do HTML antes de `onSubmit` ainda não são observados por esse evento. Não interpretar contagem como taxa total de erros.

## Gate operacional

Código de C125 não entregue em produção. Lovable main é compartilhado com loja e evoluiu independente do PR; integração depende de reconciliação, validação visual, QA de homologação e liberação. **Produção: NOT_APPROVED**.
C125 é checkpoint SOURCE_ONLY cumulativo; C124 e material anterior preservados. Sem alterações em checkout, pagamentos, preços, supabase, autenticação, dados reais ou segredos.
