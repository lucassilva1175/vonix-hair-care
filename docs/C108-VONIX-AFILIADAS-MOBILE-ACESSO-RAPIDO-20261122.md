# C108 — reduzir a rolagem mobile antes da inscrição

**Sistema exclusivo:** Portal de Afiliadas Vonix Hair; sem alterações no e-commerce Vonix.
**Data:** 22/11/2026 BRT.
**Base imutável:** C107 commit `11fa9ac0ebdc937a01e3165fe25b9dcb67cbc3fa`, branch `feat/afiliadas-c86-prova-social-foto-20261121`, PR #279 aberto DRAFT, sem publicação.
**Clone independente:** `C:\Users\JL\code\vonix-afiliadas-c108-20261122`, C107 e seus logs preservados.

## Por que essa mudança é mais prioritária do que outra seção

Revisões de conteúdo do site público https://vonixhair.com/seja-afiliada e modelo de referência https://skence.com.br/pages/skence-creators identificaram um funil composto por hero + benefícios oficiais + 3 etapas de candidatura + seletor criativo C100 + 4 avaliações de clientes de Botox Vonix C106 e vídeos opt-in C107 + preparação + inscrição. A referência Skence usa descontos, taxas e creators próprias; **não** há evidência equivalente da Vonix autorizando copiar esses benefícios ou depoimentos de afiliadas.

Analytics agregados do Lovable read-only `203d2f84-1058-4ca4-acc3-41a4a5d4e2b5`, main `bbe1cf06ecdae11b414c5cdc8e2d459899488ec9`, período 14–22/11: 1.036 visitas mobile e 375 desktop no site **inteiro**; somente 38 pageviews `/seja-afiliada`, não candidaturas nem conversões verificadas. O tráfego é fortemente mobile, mas a amostra do portal é pequena. O Lovable segue publicado na main do e-commerce; este PR C108 é separado e NÃO está no site publicado.

## Baseline em Chrome real, antes da mudança (C107)

| Viewport | Topo `#inscricao` C107 | Seção 3 etapas | Seção estilos C100 | Depoimentos C106/C107 |
|---|---:|---:|---:|---:|
| 360×900 | 2.699 px | 342 px | 322 px | 443 px |
| 390×900 | 2.589 px | 342 px | 302 px | 409 px |
| 768×900 | 2.762 px | 433 px | 327 px | 366 px |
| 1440×900 | 2.832 px | 702 px | 263 px | 349 px |

Cada tamanho: HTTP200, zero JS error, zero POST, zero overflow. Tentativas de Google/Clarity provenientes do site existente foram bloqueadas no QA; não afirmar ausência de tentativas de terceiros. Logs e screenshots local `qa-artifacts/c108-before/`.

## Alterações implementadas

- `src/components/affiliate-application-steps-preview.tsx`: na tela estreita/mobile e tablet (até 1023px), mantém cabeçalho, aviso “não garante aprovação” e link de acompanhamento à vista, mas os três cartões explicativos passam a um **único botão expansível** “Ver as 3 etapas antes de me candidatar”. O botão, com `aria-expanded`, `aria-controls` e foco de teclado, exibe as três etapas existentes, onde cada cartão mantém seu detalhe C104 interativo. Fechar o bloco limpa só o cartão expandido. No desktop `lg:block` mantém exatamente os três cartões e layout anterior; o botão mobile fica oculto. O `#como-funciona` e `#candidatura-etapas` permanecem acessíveis.
- `src/components/affiliate-creator-spotlight.tsx`: nos celulares estreitos (<640px), os três botões de escolha de estilo ficam atrás de um controle explícito “Descobrir 3 estilos de conteúdo”, mantendo título, aviso de análise individual e o CTA “Ir direto à inscrição” visíveis. Ao abrir, os estilos e o painel editorial são acessíveis; ao fechar, limpa apenas a escolha editorial, nunca campos ou formulários. Desktop/tablet continuam exibindo os três estilos diretamente. Imagens são referências editoriais oficiais Vonix, nunca de afiliadas aprovadas.
- `src/test/affiliate-c108-mobile-conversion-path.test.tsx`: seis testes direcionados de SSR, disclosure/ARIA/teclado, 3+3 opções existentes, CTA único, reset de passos e estilos, status, conteúdo factual e nenhuma requisição ou formulário paralelo. Conserva testes anteriores C100/C104/C90, sem enfraquecimento.
- Não foram alteradas as 4 avaliações verdadeiras de **produto** (C106) ou os 3 vídeos opt-in (C107), requisitos de candidatura (Instagram, endereço/CEP, LGPD), estado real de recrutamento, simulador condicional de ganhos, backend, contas, banco, e-mail, códigos, HTML metadata, URL pública ou o e-commerce.

## Comparação medida em Chrome após C108, sem falsear conversão

| Largura | Topo formulário C107 | Topo C108 | Antecipação | Altura etapas antes→depois | Estilos antes→depois |
|---|---:|---:|---:|---|---|
| 360 px | 2.699 px | 2.566 px | **133 px** | 342→219 px | 322→312 px |
| 390 px | 2.589 px | 2.457 px | **132 px** | 342→219 px | 302→292 px |
| 768 px | 2.762 px | 2.619 px | **143 px** | 433→289 px | 327→327 px |
| 1440 px | 2.832 px | 2.832 px | **0 px** | 702→702 px | 263→263 px |

As diferenças são **medidas da página ao carregar, antes de abrir os detalhes**. Não é redução no tamanho do formulário nem tempo de preenchimento, e não prova aumento de leads. Para quem decide explorar, a seção recupera o conteúdo integral e naturalmente amplia a altura da página enquanto aberta. A loja e as provas sociais continuam visíveis. Capturas locais `qa-artifacts/c108-after/` e `qa-artifacts/c108-before/`.

**Browser 4/4 PASS** em 360/390/768/1440; abre três etapas, três opções criativas, seleciona/desseleciona conteúdo, as 4 avaliações continuam acessíveis, C107 não monta vídeo sem clique, `Ir à inscrição` termina no único `#inscricao`; zero erro JS, POST ou overflow. O status privado de recrutamento não foi forçado nem falsificado.

## Controle de qualidade e liberação

- Testes direcionados C108/C100/C104/C90: **17/17 PASS em 4 arquivos**, `--pool=threads --maxWorkers=1 --fileParallelism=false`. Duas tentativas anteriores usando workers por processo/forks falharam por timeout/encerramento inesperado do worker (infraestrutura, não assertiva); mudou-se apenas o isolamento da suíte para threads, obtendo testes verdes, sem afrouxar expectativas.
- **Vitest integral final: 985/985 PASS em 132/132 arquivos, exit 0**, execução única por `--pool=threads --maxWorkers=1 --fileParallelism=false` para evitar o timeout de worker fork observado no primeiro teste focado. Log `qa-artifacts/c108-full-threads.log`; recibo `qa-artifacts/c108-full-threads.exit.txt`. **Prettier, ESLint escopados e git diff --check: exit 0**, logs/receipt `qa-artifacts/c108-quality.exit.txt`. **TypeScript local `tsc --noEmit`: exit 2 exclusivamente 3 erros herdados TS2322 de `src/routes/checkout.tsx` linhas 1466–1468, nenhum erro C108**, log `qa-artifacts/c108-tsc.log`. Os resultados de CI remoto são independentes e só serão descritos após execução no SHA da branch.
- CI do commit exato será verificado depois de push; bloqueios herdados de e-commerce (7 TS4111 boleto, 3 TS2322 checkout, 1 TS2375 produto, 6 TS2769 testes galeria) pertencem ao fluxo próprio e **não** serão alterados neste Workloop.
- **RELEASE_BLOCKED:** PR #279 continua DRAFT, sem merge/deploy/Lovable write; nenhuma candidatura real enviada. Antes de liberar, corrigir o CI em seu escopo, validar ponta a ponta com autorização da equipe, e incorporar depoimentos reais de afiliadas apenas mediante consentimento e evidências verdadeiras.
