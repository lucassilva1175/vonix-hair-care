# C81 — Validação clara e acessível da candidatura Vonix Hair

Data: 20/11/2026. Projeto exclusivo **portal de afiliadas Vonix Hair**, sem intervir no e-commerce. Base pós-C80 `a88d9cf19541d3ce65f09a0a597e8042f48c55d7`.

## Defeito reproduzido antes do patch

Formulário usava `required` e campos HTML `type=email`, mas sem `noValidate`. O Chrome bloqueava o evento `submit` antes de a validação própria Zod rodar. Em tentativa vazia: `form.noValidate=false`, contagem de eventos submit **0**, nenhum erro contextual Zod, foco no primeiro campo imposto pelo navegador, POST **0**. Evidência: `C81-native-repro.log` gerado em execução local da rota `/seja-afiliada` sem cadastro real.

## Mudanças autorizadas apenas de frontend

- `src/components/affiliate-simple-form.tsx`: `<form noValidate>` preserva `required`, tipo `email`, schema completo Zod e controles anti-duplicidade. Assim o próprio sistema sempre mostra erros do formulário antes de qualquer transmissão.
- Painel de resumo acessível junto ao formulário, focado após tentativa inválida, com contagem de campos e links `#simple-*` de nomes estáticos. Não inclui valores, dados pessoais, códigos de acompanhamento, tokens, perfil social privado ou parâmetros de rastreamento. Todos os destinos de foco existem e são clicáveis por teclado.
- Checkbox LGPD tem `id="simple-privacyAccepted"`, `aria-invalid`, `aria-describedby` e erro em português. A concordância continua obrigatória e não é inferida nem pré-assinalada.
- E-mail obrigatório sempre é apontado no resumo, mesmo quando o refinamento final Zod é interrompido por erros base (ex.: seguidores não numéricos). Nunca alterar o schema do servidor para aceitar formulário incompleto.
- Sumário é região nomeada `role="region"`, `aria-live="polite"`, em vez de criar alerta redundante; os erros por campo continuam com `role="alert"`. Isso evita duplicação da consulta genérica de alertas nos contratos anteriores.
- Ao validar todos os campos, o painel é limpo; prévia continua sem envio real, validação não concede aprovação e códigos privados permanecem com mesma segurança.

## QA local, sem dados reais

- Prettier, ESLint, TypeScript `--noEmit` e `git diff --check`: saída 0 (`C81-final-quality.txt`).
- Vitest direcionado / regressões: **52/52** (`C81-regression2.log`) incluindo formulários existentes, prévia, riscos de rastreamento e novos testes.
- Chrome real 360x780, 390x844, 768x1024, 1440x900 (`C81-browser-qa.log` e verificação independente `C81-independent-qa-final.log`): resumo de **12 campos**, incluindo e-mail e aceite LGPD; foco no resumo e em links de campo, offset sticky header 136/160px, sem overflow, JS errors ou POST, MP4 bloqueado. Em teste anterior, antes da correção, Zod era bloqueado por HTML; após patch, evento submit disparou, erros apareceram e submissão inválida continuou bloqueada.

## Limites de publicação

O sistema de afiliadas compartilha repositório/projeto Lovable com o e-commerce, que contém alterações comerciais (checkout, preço, frete) não homologadas para publicação conjunta. **Não publicar/deploy** sem aprovação específica para a loja. Integração GitHub + sincronização Lovable do código não equivale a domínio oficial atualizado. Não executamos inscrição real, Auth, Supabase, e-mails, pagamentos ou operações com dados pessoais.
