# C120 — Inscrição mais próxima da ação, sem perder requisitos

Data: 23/11/2026 (BRT). **Projeto exclusivo:** Portal de Afiliadas Vonix Hair.

## Continuidade e referência

- Base C119: `713a7c12fbde8f7409ec041f8ef32ff629cbb331`; branch `feat/afiliadas-c86-prova-social-foto-20261121`; PR #279 **OPEN/DRAFT**: https://github.com/lucassilva1175/vonix-hair-care/pull/279.
- Clone isolado `C:\Users\JL\code\vonix-afiliadas-c111-20261122`; checkpoints C113–C119 e QA untracked preservados.
- Site da marca: https://vonixhair.com/seja-afiliada e https://vonixhair.com/loja. Referência editorial de organização, não de materiais ou benefícios: https://skence.com.br/pages/skence-creators.
- Lovable: projeto compartilhado `Vonix Haircare Showcase` `203d2f84-1058-4ca4-acc3-41a4a5d4e2b5`, main `cfcfa79520df715e9a7cb2b52c8f21dc199093ad`, consultado somente leitura. O Lovable publicado está atrás das alterações acumuladas no PR e também contém o e-commerce, portanto não editar nem publicar sem homologação.
- Analytics Lovable 16–23/11 UTC: **31 pageviews em `/seja-afiliada`**; não há taxa de inscrição ou funil comprovado. Não inferir aumento de conversão.
- Reviews reais são apenas de **produtos**, não afiliadas. Sem depoimentos inventados, valores garantidos, aprovação automática, benefícios da Skence, provas sociais comerciais de terceiros ou fotos sem autorização.

## Problema, medição e objetivo

A etapa C117 trouxe o formulário para antes dos blocos opcionais; C118 destacou a proposta de valor e C119 esclareceu elegibilidade. Restava um atrito concreto: depois de clicar em `#inscricao`, a visitante de celular ainda via uma longa introdução antes do status e da área de cadastro ou prévia. A introdução tinha **589px no telefone 320px, 498px no 360px e 478px no 390px**. Isso duplicava os quatro chips de requisitos já exibidos no guia C119 imediatamente anterior e ocupava rolagem sem acrescentar informação.

## Melhoria C120: compactação responsiva

**Arquivo alterado:** `src/routes/seja-afiliada.tsx`. Nenhuma alteração em handlers, `AffiliateSimpleForm`, API, backend, regras de elegibilidade, armazenamento, privacidade, pagamento ou dados.

- Seção `#inscricao`: espaçamento mobile menor (`py-6` em vez de `py-11`); desktop preserva respiro com `sm:py-14`.
- Painel `affiliate-c115-form-intro`: padding mobile `p-4`, margem `mb-4`, título tipograficamente um pouco menor para leitura em tela estreita; grade/foto oficial no desktop permanecem.
- Texto mais direto e **completo**: nome, telefone, **e-mail válido**, endereço, Instagram com número de seguidores, TikTok opcional, inscrição gratuita, dependente da disponibilidade e **sem aprovação garantida**; após envio confirmado, código privado a guardar na tela.
- Quatro chips duplicados ocultos **apenas no celular** com `hidden sm:flex`. Seu conteúdo textual e IDs permanecem no DOM e são visíveis em tablet/desktop; no telefone, o resumo de preparação C119 imediatamente anterior já mostra idade mínima, Instagram e TikTok opcional, com checklist expandido de e-mail/contato/endereço. O resumo escrito do próprio cadastro também traz o e-mail obrigatório.
- Links `Consultar meu status pelo código` → `/consultar-candidatura` e `Ver o passo a passo` → `#candidatura-etapas` preservados, apenas mais compactos em mobile.
- Imagem editorial oficial C115 preservada no desktop, sem fingir ser fotografia de participante; status de abertura e prévia segura permanecem os mesmos.

## QA de usabilidade real

Chrome headless GET/HEAD-only, bloqueio de APIs e origens externas, sem POST, sem pageerror e sem overflow horizontal; cinco larguras:
| Tela | Altura do painel C119 | Altura C120 | Redução |
|---|---:|---:|---:|
| 320px | 589px | 385px | **204px** |
| 360px | 498px | 351px | **147px** |
| 390px | 478px | 332px | **146px** |
| 768px | 448px | 421px | 27px |
| 1440px | 552px | 552px | 0px |

Evidência `qa-artifacts/c120-before-browser.json` (baseline geométrico; readiness externo ficou `loading` durante amostragem curta) e `qa-artifacts/c120-after-browser.json` (5/5 PASS: status/etapas links, única âncora e DOM preservados). Prints: `qa-artifacts/c120-form-intro-{320,390,1440}.png`, foto de 320 revisada visualmente e legível.

**Limitação de medição:** a consulta real de disponibilidade não concluiu durante a amostragem curta com rede externa bloqueada; o clique no botão da prévia não foi medido no Chrome. O seu comportamento foi verificado **com status fechado simulado em Vitest**, sem requisição externa, incluindo abrir/fechar prévia e não enviar dados. A economia em pixels é do bloco que antecede a ação, não uma afirmação de conversão.

## Testes e status

- Novo `src/test/affiliate-c120-action-first.test.tsx`: conteúdo verdadeiro, classes responsivas, links e âncoras, candidatura única, botão de prévia protegida, retorno à visualização sem POST.
- Focados finais `qa-artifacts/c120-focused-r2.log`: **25/25 PASS em 5 arquivos** incluindo C120/C115/C117/C119 e candidatura completa, após corrigir um diagnóstico de tipagem exclusivo do teste novo. A prévia segura foi exercitada com status fechado controlado; não houve POST.
- Regressão integral final **1.041/1.041 PASS em 144/144 arquivos**, quatro shards **313/36, 248/36, 222/36, 258/36**, todos exit 0; Prettier, ESLint e `git diff --check` **PASS 0/0/0**. TypeScript local permaneceu com **3 TS2322 preexistentes somente em `src/routes/checkout.tsx`** (linhas 1466–1468), nenhum diagnóstico C120. Hashes e GitHub CI registrados em `qa-artifacts/c120-final-audit-20261123.md`.
- Entregar somente arquivos C120 (rota/teste/doc) via ZIP SOURCE_ONLY com SHA256 byte-idêntico e PR #279 DRAFT, sem merge/deploy/Lovable.
- Produção **NOT_APPROVED** enquanto TypeScript global do repositório e homologação compartilhada estiverem pendentes.
