# C105 — botão de inscrição mais imediato no mobile

**Projeto exclusivo:** Portal de Afiliadas Vonix Hair, não o e-commerce.
**Data:** 22/11/2026 (BRT).
**Base preservada:** C104 `725f066548e9a8bf0c0cc0e3e2eb55e27c45eb66`, PR #279 branch `feat/afiliadas-c86-prova-social-foto-20261121`, aberto DRAFT.
**Clone independente:** `C:\Users\JL\code\vonix-afiliadas-c105-20261122`. C104 original, seus logs e seus arquivos não foram alterados.

## Referência revisada, sem replicar alegações comerciais
- Loja e página de recrutamento oficiais em https://vonixhair.com/ e https://vonixhair.com/seja-afiliada; produtos oficiais e regras expressas da própria marca.
- Lovable `Vonix Haircare Showcase`, projeto `203d2f84-1058-4ca4-acc3-41a4a5d4e2b5`, main `bbe1cf06ecdae11b414c5cdc8e2d459899488ec9` em 22/11; edições recentes tratam de galerias, fotos e preços do **e-commerce** e não justificam misturar as branches.
- https://skence.com.br/pages/skence-creators é exclusivamente referência de linguagem visual, narrativa e inspiração para criadoras, não fonte de alegações comerciais para Vonix. Não atribuir à Vonix desconto de R$30, creators contratadas, cupons ativos nem depoimentos/ganhos de afiliadas Skence.

## Problema real medido
A primeira tela de 360–390 px já exibia o botão de candidatura, porém tardiamente após uma introdução textual completa. Não estava escondido, e a melhoria não deve ser comunicada como correção de CTA ausente. Reposicionar informações pode reduzir a distância até o primeiro gesto sem perder status oficial, contexto e avisos.

| Viewport | CTA C104, topo / base | CTA C105, topo / base | Ação antecipada |
|---|---|---|---:|
| 360 x 800 | 642 / 686 px | 523 / 567 px | **119 px** |
| 390 x 800 | 651 / 695 px | 555 / 599 px | **96 px** |
| 768 x 800 | 749 / 793 px | 630 / 674 px | **119 px** |
| 1440 x 800 | 843 / 887 px | 843 / 887 px | **0 px** |

A fotografia editorial permanece visível e com título. A altura total do hero variou apenas -10 / -10 / -8 / 0 px; **não atribuir a esta mudança uma redução equivalente na distância absoluta até o formulário**. O ganho é exclusivamente na localização do CTA.

## Implementação restrita
- `src/components/affiliate-editorial-hero.tsx`: usando Flexbox e `order-*` responsivo apenas na coluna editorial, status real de recrutamento e botão primário entram visualmente logo após a imagem, antes do parágrafo explicativo; acima de 1024 px a ordem anterior é restaurada. A ordem do DOM e da navegação por teclado não é invertida de forma perigosa: o parágrafo não contém controles, o status e os links mantêm ordem relativa correta.
- Altura mínima da fotografia em pequenos celulares reduzida de 21rem para 19rem, sem esconder título, status ou avisos; tamanho do tablet e desktop preservados.
- Mantidos H1 único, CTA `#inscricao` único, `#ganhos`, fotografias oficiais, 8% somente após aprovação, inscrição gratuita, sem estoque e sem exigência de compra, estado OPEN/CLOSED/LIMITED/UNAVAILABLE/LOADING real. No modo indisponível, não oferecer post real pelo link.
- `src/test/affiliate-c105-early-mobile-cta.test.tsx` cobre ordem responsiva, CTA único, requisitos e estados 5x, fonte de imagens, SSR e ausência de formulários/requisições.
- **Nenhuma nova prova social de afiliadas** por não existir evidência autorizada. Avaliações de produto C101 não são testemunhos de ganhos.

## Evidências de QA
- Chrome headless real, com bloqueio de requisições externas, POST e sem simular cadastro verdadeiro: **4/4 larguras 360,390,768,1440** HTTP 200, JS error 0, POST 0, overflow horizontal 0. Um CTA e um H1, fotos e âncoras preservados.
- Métricas e capturas locais: `qa-artifacts/c105-before/report.json` / `c105-after/report.json`; repetição com clique real em `c105-after-cta-click/report.json` confirmou **4/4 botões com `location.hash=#inscricao`, alvo único e nenhum POST**. Capturas `viewport-<largura>.png` / `hero-<largura>.png`. Todos arquivos de QA fora do git.
- Testes direcionados **28/28 PASS**, quatro suítes (C73, C95, C98, C105). A primeira tentativa de compilação teve erro de edição numa string JSX, corrigido; depois houve uma falha no teste novo por texto de expectativa incorreto, corrigida; a validação final do componente e navegador foi totalmente verde.
- **Vitest integral final: 964/964 PASS em 129/129 arquivos, exit 0** (`qa-artifacts/c105-full-r2.log` e `.exit.txt`), com um worker para não disputar recursos. A primeira execução teve 963/964 porque o teste pré-existente C94 esperava a antiga classe 21rem da fotografia; ajustou-se apenas essa expectativa para 19rem, acrescentando garantias de 23rem/25rem para tablet/desktop. Nenhuma regra de negócio ou teste de segurança foi enfraquecido.
- **Prettier, ESLint escopados e `git diff --check`: todos PASS, exit 0** (recibo `qa-artifacts/c105-quality-final.exit.txt`), sem aviso remanescente. O arquivo C94 foi normalizado para LF após o editor remoto introduzir CRLF.
- **`tsc --noEmit` local exit 2 exclusivamente por três erros TS2322 herdados em `src/routes/checkout.tsx` linhas 1466–1468, nenhum em C105.** Em CI anterior existiam ainda sete TS4111 em `src/lib/boleto.ts`; observar resultado exato do novo CI antes de concluir. Esses arquivos pertencem ao e-commerce, não devem ser alterados neste Workloop.

## Gate operacional
- PR #279 **DRAFT**, sem deploy/merge ou escrita em produção; `RELEASE_BLOCKED` até CI completo verde e testes E2E reais, explicitamente autorizados, de candidatura, admin, e-mail e código de acompanhamento. Essas ações não foram realizadas neste ciclo.
- Não há experimento A/B ou dados de inscrição atribuídos à mudança; antecipação de pixels **não comprova aumento de conversão**.
