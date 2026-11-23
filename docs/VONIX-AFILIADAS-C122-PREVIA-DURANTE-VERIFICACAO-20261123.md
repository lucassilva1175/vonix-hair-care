# C122 — Prévia protegida disponível durante a verificação de inscrições

**Data:** 23/11/2026. Projeto exclusivo **Portal de Afiliadas Vonix Hair**.

## Continuidade

- Retomada do C121 `c4c0b8bbc9e52cf5b5fdf532258c0cfe98371387`, branch `feat/afiliadas-c86-prova-social-foto-20261121`, clone `C:\Users\JL\code\vonix-afiliadas-c111-20261122`. PR #279 https://github.com/lucassilva1175/vonix-hair-care/pull/279 **OPEN/DRAFT**, sem merge/deploy.
- Lovable compartilhado `Vonix Haircare Showcase`, projeto `203d2f84-1058-4ca4-acc3-41a4a5d4e2b5`, main `cfcfa79520df715e9a7cb2b52c8f21dc199093ad` em leitura apenas, sem publicação. O e-commerce não é alterado pelo C122.
- Fontes públicas https://vonixhair.com/seja-afiliada, https://vonixhair.com/loja e referência de linguagem visual https://skence.com.br/pages/skence-creators. Vonix: candidatura gratuita, 18+, Instagram, TikTok opcional, seleção individual, sem garantia de aprovação, comissão após aprovação sujeita a condições. **Skence exige compra com desconto em seu programa; Vonix NÃO exige compra para se candidatar.** Não importar benefícios, fotos, criadoras, avaliações ou promessas da Skence.
- As provas públicas utilizadas no portal são **avaliações de PRODUTOS** de clientes Vonix, não depoimentos ou rendimentos de afiliadas. Nenhuma prova fictícia criada.

## Problema verificado

O formulário tem fonte de verdade no status GET de `getAffiliateRecruitmentStatus`. Enquanto esse GET não responde, `recruitment === "loading"`, a seção `#inscricao` mostrava apenas `Verificando inscrições...` e deliberadamente escondia **a própria prévia protegida**. Isso impedia candidatas de entender o formulário quando a rede estivesse lenta ou bloqueada, embora a prévia já fosse inerentemente não enviável.

Navegador Chrome real antes da mudança (`qa-artifacts/c122-before-browser.json`), requisições externas/API bloqueadas, cinco larguras **320, 360, 390, 768, 1440**: **5/5** apresentavam a mensagem de verificação e **0/5** apresentavam botão de prévia. Nenhum POST, pageerror ou overflow.

## Melhoria C122

- `src/routes/seja-afiliada.tsx` **somente apresentação**: mantém a mensagem de verificação e acrescenta esclarecimento `Enquanto isso, você pode explorar a prévia, que nunca envia nem armazena candidaturas.`. Deixou de condicionar a renderização de `Visualizar formulário (prévia)` à conclusão da disponibilidade. A mesma ação existente agora aparece também com status `loading`; `data-testid="affiliate-c122-safe-preview"` para regressão.
- A ação **não** muda `getAffiliateRecruitmentStatus`, estado remoto, `AffiliateSimpleForm`, POST, banco, validações, autorização, checkout, captura de dados, preço, administração ou rotina de email. Continua ativando `setPreview(true)`. A fórmula existente `simulationOnly = preview || recruitment !== "open"` impede envio; mesmo que o GET posteriormente informe OPEN, uma prévia iniciada continua **simulação**. Somente uma ação explícita de descartar/reiniciar cria formulário real limpo após OPEN confirmado.
- O botão e o texto são iguais a todos os status fechados; a candidatura real segue automaticamente disponível apenas após comprovação OPEN, mantendo testes anteriores.

## Evidências

- `qa-artifacts/c122-after-browser.json` + `c122-after-browser.log`: Chrome headless GET/HEAD apenas **5/5 PASS** em 320,360,390,768,1440, com transporte externo bloqueado: status ainda mostra `Verificando inscrições...`, botão visível, clique abre a prévia, aviso `Esta prévia nunca envia ou armazena candidaturas`, fecha e retorna, **sem POST/pageerror/overflow**. Screenshot `qa-artifacts/c122-after-status-320.png` inspecionada: CTA legível e nenhum corte.
- `src/test/affiliate-c122-preview-during-loading.test.tsx`: novo conjunto de 4 cenários: GET nunca conclui mas CTA abre prévia sem POST; GET retorna OPEN enquanto prévia aberta e envio continua bloqueado até reinício/descartar dados explícitos; rede falha durante prévia e botão de retry aparece depois de fechá-la; OPEN confirmado sem prévia conserva cadastro real.
- Testes direcionados `qa-artifacts/c122-focused-r2.log`: **30/30 PASS, cinco arquivos** (C122, C75 retry/guard, C120 UX e página de cadastro). Primeira tentativa 28/30 falhou por cronologia inadequada de Promises de teste e `beforeEach` retornando o mock; corrigidos **apenas os testes**, sem enfraquecer segurança.
- Full Vitest **1.048/1.048 PASS em 146/146 arquivos**, 4 shards sequenciais: **322/37, 256/37, 212/36, 258/36**, todos exit0, sem enfraquecer testes anteriores. Prettier, ESLint e diff-check **0/0/0 PASS**. TypeScript local exit2 **somente três TS2322 preexistentes em `src/routes/checkout.tsx` linhas 1466–1468**; nenhum diagnóstico C122. ZIP hashes e CI estão detalhados em `qa-artifacts/c122-final-audit-20261123.md`.

## Restrições de liberação

- Pipeline global C121 continuava vermelho por **20 erros TypeScript preexistentes em cinco arquivos do e-commerce/testes de produto**, apesar de aplicação e PostgreSQL aprovados. Este ciclo não mexe nesses arquivos e **não declara produção aprovada** sem CI global e homologação do Lovable compartilhado.
- C122 segue na branch do PR #279 **DRAFT** com ZIP SOURCE_ONLY único para os três arquivos alterados; preservar checkpoints e artefatos anteriores, não fazer merge/deploy/publicação Lovable.
- Não há prova estatística de aumento de candidaturas, somente remoção verificada de uma barreira de navegação à prévia.
