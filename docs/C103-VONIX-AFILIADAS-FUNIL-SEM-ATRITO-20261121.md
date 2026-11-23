# C103 — formulário de candidatura orientado à criadora e sem TikTok obrigatório

Data: 21/11/2026 (horário do Brasil). Escopo: EXCLUSIVAMENTE Portal de Afiliadas Vonix Hair.
Base preservada: C102 `2591c2f339fd03a1911e2d092dff11c60eca9493`, branch `feat/afiliadas-c86-prova-social-foto-20261121`, PR #279 DRAFT.

## Referências e hipótese
- https://vonixhair.com/seja-afiliada — proposta oficial de inscrição gratuita, Instagram obrigatório, TikTok opcional e condições comerciais somente para afiliadas aprovadas.
- https://skence.com.br/pages/skence-creators — inspiração de jornada clara e inscrição curta; NÃO copiar benefícios, cupons, percentuais, depoimentos ou recursos oferecidos somente pela Skence.
- Lovable Vonix Haircare Showcase (`203d2f84-1058-4ca4-acc3-41a4a5d4e2b5`), commit publicado `fdb503eacd0d69499f549f1b6e4f13699698a3a0`, consultado. Analytics Lovable 7–22/11 UTC: ~1.445 mobile, ~955 desktop, 189 visualizações da rota /seja-afiliada. Não são taxas de conversão, não medem o PR e não demonstram impacto do C103.
- Hipótese de UX: mostrar primeiro os dados essenciais para análise do perfil social e esconder TikTok (opcional) até a escolha da pessoa pode reduzir complexidade percebida, sem diminuir a quantidade de dados efetivamente exigida para enviar a candidatura.

## Mudança
- Único formulário `AffiliateSimpleForm`: ordem visual e de navegação `Contato → Instagram → Endereço completo → Privacidade`; **todos os campos antes exigidos continuam obrigatórios**.
- TikTok e seus seguidores permanecem opcionais e conservam valores digitados quando o painel `<details>` é recolhido. Usar resumo nativo acessível e área de toque adequada, sem outra requisição.
- Erros em TikTok reabrem os campos automaticamente antes do resumo de validação; ordem do resumo e atalhos de progresso acompanha a nova sequência visual.
- Nenhuma mudança na validação Zod, no envio, no status aberto/fechado do programa, nas regras de comissão, na guarda de dados, nos pagamentos, no token privado de acompanhamento, no painel admin ou em qualquer arquivo do e-commerce.
- Testes ajustados C70 e C79; novo contrato `affiliate-c103-shorter-application.test.tsx` cobre ordenação, expansão/colapso, preservação de valores, reabertura por erro, ausência de POST e integridade de privacidade.

## QA e evidências
- Testes dirigidos: **24/24 PASS em 4 arquivos**; Prettier escopado PASS; ESLint escopado 0 erro/aviso.
- Chrome real headless: **4/4 PASS** (360, 390, 768, 1440 px): formulário único em modo prévia, ordem e atalhos corretos, TikTok recolhido inicialmente, expansão por clique, valores preservados após ocultar, nenhum POST/requisição externa/erro JS/overflow. A faixa comercial C102 e provas/editorial C100/C101 continuam funcionando. Logs, report e capturas em `qa-artifacts/c103-browser-*` e `qa-artifacts/c103-browser/`, locais e não versionados.
- TypeScript local bloqueado exclusivamente por 3 TS2322 anteriores em `src/routes/checkout.tsx` linhas 1466–1468; nenhum erro C103. GitHub antes do C103 bloqueado por mais 7 TS4111 de `src/lib/boleto.ts` no CI por integração com o e-commerce.
- **Vitest integral 952/952 PASS em 127/127 arquivos**, exit 0, executado com paralelismo baixo para reduzir a ocupação do PC; log local `qa-artifacts/c103-full-final.log`. Todos os novos testes C103 passaram. CI SHA exato registrado no PR após push, sem antecipar liberação.

## Gate de liberação
- PR #279 permanece DRAFT e `RELEASE_BLOCKED`: CI verde é requisito; eventuais correções de checkout/boleto devem ocorrer em fluxo exclusivo do e-commerce.
- Homologar com autorização a inscrição real, a aprovação no admin, e-mails e consulta de status antes de publicar.
- Depoimentos de afiliadas reais exigem fonte legítima e autorização; avaliações de produtos nunca devem se tornar falsos relatos de afiliadas. Nenhum vínculo comercial ou renda garantida pelo envio.
