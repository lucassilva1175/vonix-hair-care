# C106 — quatro avaliações originais de produtos antes da candidatura

**Projeto exclusivo:** Portal de Afiliadas Vonix Hair; não confundir com o e-commerce.
**Data:** 22/11/2026 (BRT).
**Base:** C105 `e45a1733644c73e797f7cd5bf4aef94024b7f344`, branch `feat/afiliadas-c86-prova-social-foto-20261121`, PR #279 DRAFT.
**Trabalho isolado:** `C:\Users\JL\code\vonix-afiliadas-c106-20261122`; clones/checkpoints C105, C104 etc. preservados.

## Evidência oficial e limitações

- A fonte primária de comentários, nomes e datas é a página pública **Botox Vonix** em https://vonixhair.com/produto/botox-vonix, que exibe quatro avaliações de clientes de produtos com texto, identificação e mídias originais. Cópia local de dados existente e anteriormente testada: `src/data/reviews.json`.
- Todos os quatro registros são de **um mesmo produto** (Botox Vonix), não de diferentes linhas. A seleção usa exclusivamente `slug === "botox-vonix"` e lista fixa: Mariana Andrade (vídeo), Ayla Muniz (vídeo), Fernanda Assis (vídeo) e Ana Paula (foto). A vitrine mostra apenas os **posters** dos vídeos, não toca nenhum vídeo automaticamente, e inclui a foto original de Ana Paula.
- Não chamar essas pessoas de afiliadas, criadoras contratadas, vendas realizadas pelo programa, compradoras verificadas nem garantir resultado comercial. As avaliações não comprovam compra validada ou qualquer participação no programa; o texto traz essa restrição em todos os estados.
- Referência https://skence.com.br/pages/skence-creators usada como inspiração de experiência visual de creators, **nunca** como fonte de relatos, descontos ou taxas da Vonix.
- Lovable do catálogo Vonix `203d2f84-1058-4ca4-acc3-41a4a5d4e2b5`, main consultado `bbe1cf06ecdae11b414c5cdc8e2d459899488ec9`. Suas edições recentes se referem a galerias, banners e preços do e-commerce; nenhuma foi aplicada aqui.

## Melhoria implementada

- O componente existente `src/components/affiliate-customer-voice-teaser.tsx`, já posicionado após o seletor de estilos C100 e antes do formulário, passa a permitir trocar a avaliação exibida sem sair da landing.
- Os quatro controles nativos `<button type="button">` têm nome acessível completo, `aria-pressed` (exatamente um selecionado por vez), `aria-controls` e foco de teclado. Texto ativo com `aria-live="polite"`. O comentário exibido, a pessoa e o arquivo de imagem pertencem sempre ao mesmo registro publicado.
- Layout mantém uma imagem principal e um bloco compacto de texto/seletor, preservando as duas ações existentes: **ver avaliações completas** no catálogo editorial recolhido (`#avaliacoes-produtos`) e **ir à inscrição** (`#inscricao`). A seção completa pode ser aberta pelo gate C96 existente e não exige abandonar a candidatura.
- Não houve nova seção antes do formulário; o seletor faz parte do teaser C101. Não criou outra galeria de mídias nem cadastro paralelo, não fez requisição, não publicou avaliações, não mexeu em pagamentos, aprovação, suporte/admin, privacidade, back-end, Supabase ou Live Lovable.
- Testes: `src/test/affiliate-c101-customer-voice.test.tsx` (contratos adaptados ao plural, quatro seleções) e novo `src/test/affiliate-c106-product-reviews-selector.test.tsx`, protegendo autor↔comentário↔imagem, inexistência de vídeo automático, SSR, sem renda/afiliadas fictícias, links e foco.

## Impacto de layout real, sem alegar taxa de conversão

| Largura Chrome | Altura teaser C105 | Altura C106 | Diferença | Topo do formulário C105 | Topo C106 |
|---|---:|---:|---:|---:|---:|
| 360 px | 342 px | 443 px | +101 px | 2.598 px | 2.699 px |
| 390 px | 325 px | 409 px | +84 px | 2.538 px | 2.622 px |
| 768 px | 272 px | 366 px | +94 px | 2.669 px | 2.762 px |
| 1440 px | 255 px | 349 px | +94 px | 2.738 px | 2.832 px |

**Transparência:** há um custo de 84–101 px no percurso até o formulário. É uma escolha editorial consciente para exibir quatro avaliações autênticas sem uma vitrine extensa. Não existe evidência de aumento de cadastros ou retorno financeiro. Se os testes A/B mostrarem piora na conversão, é correto reavaliar o seletor.

## Validação e riscos

- Chrome headless local real: **4/4** em 360, 390, 768, 1440. Troca das quatro avaliações por clique, exatamente um botão `aria-pressed=true`, imagens carregadas com `naturalWidth>0`, nomes e comentários corretos, CTA clicado até `#inscricao` com um alvo; HTTP 200, 0 JS error, 0 POST, 0 overflow horizontal. **Clarity/Google Tag Manager foram tentados pela configuração existente da loja, mas explicitamente bloqueados pela interceptação do teste; nenhuma dessas requisições chegou ao destino**. Não declarar que não foram tentadas.
- Evidências antes e depois em `qa-artifacts/c106-before/report.json` e `qa-artifacts/c106-after-final/report.json` e capturas por largura, todos arquivos locais e não versionados. O baseline inicial foi marcado FAIL por tratar requisições de terceiros **bloqueadas** como se fossem externas realizadas. A asserção foi corrigida para verificar o bloqueio, não houve erro de interface.
- QA focado após corrigir a expectativa singular: **12/12 PASS** em 3 arquivos (C101/C106/C86). **Vitest integral 969/969 PASS em 130/130 arquivos, exit 0**, com um worker e `--fileParallelism=false`, log local `qa-artifacts/c106-full.log` e exit `qa-artifacts/c106-full.exit.txt`. **Prettier --check, ESLint escopado e git diff --check exit 0** (`qa-artifacts/c106-quality.exit.txt`). **TypeScript local exit 2** por três erros anteriores TS2322 exclusivamente em `src/routes/checkout.tsx` nas linhas 1466–1468; nenhum erro C106. O CI remoto do SHA exato é verificado no PR após o push; não declarar conclusão de CI antes de sua execução.
- Bloqueios antigos de CI: TypeScript e-commerce `src/lib/boleto.ts`, `src/routes/checkout.tsx`, `src/routes/produto.$slug.tsx` e `src/test/product-gallery-video.test.tsx`; **nenhum arquivo desses pode ser corrigido neste Workloop**, pois é fluxo independente.

## Gate de liberação

**RELEASE_BLOCKED.** PR #279 continua DRAFT, sem merge/deploy/publicação do C106 no Lovable. Homologação com autorização: fluxo real completo de inscrição, decisão administrativa, e-mail/consulta e validação do código privado. Depoimentos de **afiliadas** exigem material genuíno e autorização explícita, não podem ser inferidos dessas quatro avaliações de produto.
