# C119 — Clareza de requisitos sem aumentar a jornada

**Data:** 23/11/2026 · **Projeto exclusivo:** Portal de Afiliadas Vonix Hair.

## Continuidade e material de referência

- Retomado exatamente do commit C118 `d99aa4fdd26a16eb1e41915bf06bd805723feb10` em `C:\Users\JL\code\vonix-afiliadas-c111-20261122` / branch `feat/afiliadas-c86-prova-social-foto-20261121`.
- PR #279 https://github.com/lucassilva1175/vonix-hair-care/pull/279 **OPEN/DRAFT**, sem merge/deploy.
- Fontes da marca https://vonixhair.com/seja-afiliada, https://vonixhair.com/loja, conteúdo atual `src/components/affiliate-application-prep.tsx` (dispensa portfólio apenas para preencher), candidatura 18+ com Instagram e seguidores informados, TikTok opcional.
- Lovable `Vonix Haircare Showcase` projeto `203d2f84-1058-4ca4-acc3-41a4a5d4e2b5`, main `cfcfa79520df715e9a7cb2b52c8f21dc199093ad`, atrasado em relação ao PR; consultado apenas para leitura, pois é compartilhado com o e-commerce.
- Referência criativa https://skence.com.br/pages/skence-creators, utilizada apenas para identificar a importância de responder às dúvidas de iniciantes **antes** do cadastro. **Não** copiar benefícios, creators, promessas, fotos, cupons, envio de kits, condições de seguidores ou comissões Skence; critérios Vonix são próprios.
- Produto e prova social: avaliações de clientes são avaliações **de produtos**, não testemunhos de afiliadas, vendas, remuneração ou participação no programa. Nenhum dado fabricado.

## Problema resolvido

- O resumo antigo dizia apenas: `O que preciso para me candidatar? Nome, contato, endereço e Instagram. TikTok é opcional.` e podia desencorajar iniciantes antes de abrir o guia, embora o checklist original explique que **não é preciso criar portfólio só para candidatar**.
- C119 melhora a clareza da elegibilidade visível, sem exigir campo adicional, registrar dado pessoal ou desviar a pessoa do formulário.
- O accordion `<details data-testid="vonix-c64-preparation-details">` é o mesmo de antes, ainda localizado **antes** do `#inscricao` único, mas seu `<summary>` ganhou tipografia editorial vinho/rosé, indicador nativo de abertura e três mensagens visíveis: `Não precisa ter portfólio para se candidatar`, `18 anos ou mais`, `Instagram`, `TikTok opcional`. A abertura revela o checklist completo de nome, e-mail, telefone, endereço e seguidores Instagram. Seleção individual e **aprovação não garantida**.
- Foi preservado o componente `AffiliateApplicationPrep`, seus checkboxes locais, o status das candidaturas, códigos de consulta, formulário real protegido e toda a jornada C117/C118.

## Arquivos controlados

- `src/routes/seja-afiliada.tsx`: apenas markup e importação visual de `ChevronDown`, sem lógica de cadastro, requisições, integração ou banco.
- `src/test/affiliate-c119-eligibility-clarity.test.tsx`: teste novo para texto verdadeiro, ausência de falsas promessas, ordem antes do formulário, expandir/recolher, checklist original, apenas um formulário, prova real e bloqueio de POST.
- `docs/VONIX-AFILIADAS-C119-CLAREZA-REQUISITOS-20261123.md`: este handoff e medidas.
- Nenhuma alteração no e-commerce, arquivos de checkout, produtos, pagamentos, admins, APIs, banco, analytics, Supabase, Lovable publicado, provas sociais ou demais projetos.

## Medição real do navegador

Chrome headless com GET/HEAD apenas, APIs e terceiros bloqueados, 900 px de altura, 5 viewports, nenhum POST, erro JS ou overflow:

| Viewport | `#inscricao` antes C118 | `#inscricao` C119 | Deslocamento |
|---|---:|---:|---:|
| 320 px | 1988 px | 2007 px | +19 px |
| 360 px | 1893 px | 1897 px | +4 px |
| 390 px | 1799 px | 1803 px | +4 px |
| 768 px | 2017 px | 2036 px | +19 px |
| 1440 px | 2073 px | 2092 px | +19 px |

- `qa-artifacts/c119-before-browser.json`, `qa-artifacts/c119-after-browser.json`, prints `qa-artifacts/c119-prep-{360,1440}.png`. 5/5 PASS. Novo resumo legível a 360 px, sem aumentar substancialmente a distância ao cadastro.
- A melhora de linguagem pode reduzir dúvidas de iniciantes, mas **não há evidência de aumento de candidaturas/conversão**. A versão pública do site ainda é antiga, não substituída por este PR.

## QA e liberação

- `qa-artifacts/c119-focused.log`: **34/34 PASS em seis arquivos** (contrato C119, C117, C88, C108, C65, página de candidaturas).
- Regressão completa **1.038/1.038 PASS em 143/143 arquivos**, quatro shards sequenciais com todos os exits 0: S1 **319/36**, S2 **241/36**, S3 **223/36**, S4 **255/35**. Logs `qa-artifacts/c119-shard-{1..4}.log` e receipts por shard preservados; nenhum teste antigo foi removido.
- Prettier, ESLint e `git diff --check` **PASS 0/0/0**; TypeScript local `tsc --noEmit` exit2 apenas **3 TS2322 preexistentes em `src/routes/checkout.tsx` linhas 1466–1468**, nenhum diagnóstico em arquivos C119. Os 20 erros TS remotos anteriores em cinco arquivos externos do e-commerce/testes de produto impediam o build global; verificar novamente no commit C119.
- Criar ZIP SOURCE_ONLY dos três arquivos C119, verificar SHA256 de cada entrada contra arquivos ativos, documentar recibo e registro final em `qa-artifacts/c119-final-audit-20261123.md`; atualizar somente branch PR #279 em DRAFT, sem merge ou deploy.
- **NOT_APPROVED** para produção até CI global verde e homologação da integração compartilhada com Lovable/main.
