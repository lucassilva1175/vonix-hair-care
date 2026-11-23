# C116 · Prova social real mais compacta no mobile — Portal Vonix

Data: 23/11/2026 (BRT).

## Escopo e referências

- Projeto: somente **Portal de Afiliadas Vonix Hair**, não o e-commerce. Clone isolado `C:\Users\JL\code\vonix-afiliadas-c111-20261122`, branch `feat/afiliadas-c86-prova-social-foto-20261121`, base C115 `64cd2c433d84d537034bfd475f1498db60ff3b2a`.
- Site oficial consultado: https://vonixhair.com/seja-afiliada e https://vonixhair.com/. Modelo estrutural: https://skence.com.br/pages/skence-creators. Não copiar fotos, criadoras, depoimentos, comissões, kits, cupons ou benefícios da Skence.
- Lovable `Vonix Haircare Showcase`: main `cfcfa79520df715e9a7cb2b52c8f21dc199093ad` (atrás do PR), compartilhado com a loja, somente leitura. Não editar/publicar.
- Lovable analytics (01–23/11/2026 UTC, leitura agregada): `/seja-afiliada` teve 190 pageviews; site/projeto inteiro 4.733 pageviews e 3.025 visitors. São dados de navegação, **não** candidaturas nem conversões.

## Evidência de atrito no caminho de inscrição

Medição real em Chrome headless antes da alteração (C115, em clone local, sem POSTS):
- 320 px: teaser C101 de avaliações = **521 px** de altura; `#inscricao` começa em y = **2.896 px**.
- 360 px: teaser = **490 px**; `#inscricao` em y = **2.754 px**.
- 390 px: teaser = **456 px**; `#inscricao` em y = **2.661 px**.
- Tablet 768 e desktop 1440 já exibiam provas completas, que se devem manter.
- Relatório de baseline: `qa-artifacts/c116-before.json`. A grande altura pré-formulário pode atrapalhar a jornada no celular; não prova abandono sem analytics de funil.

## Mudança C116

- `src/components/affiliate-customer-voice-teaser.tsx`: antes da inscrição, em `<640px`, mostrar **um cartão compacto premium** com imagem de prévia da **avaliação de cliente do produto Botox Vonix**, título claro e número de 4 avaliações do catálogo, com disclaimer explícito **opiniões de produtos, não relatos de afiliadas**.
- Usar o próprio poster do depoimento real como plano de fundo decorativo local, sem criar outra tag `img` que quebraria os contratos de verificações de mídia. Fonte `src/data/reviews.json`.
- Botão acessível `aria-expanded` + `aria-controls` expande o painel original com os comentários, autores, fotos, vídeos e links autênticos. Ao recolher, o player é desmontado (evita vídeo tocando oculto), o comentário original é restaurado e opções extras são encerradas.
- Desktop `sm:grid`: painel integral mantém a composição original, botões, textos, vídeo voluntário sem autoplay e links `#avaliacoes-produtos` e `#inscricao`.
- Não há formulário paralelo, elegibilidade nova, alteração do código privado, divulgação de supostas afiliadas, rede/POST, rastreio adicional, backend ou checkout.
- Novo teste `src/test/affiliate-c116-compact-real-proof.test.tsx` cobre autenticidade das fontes, controle expandido, 4 avaliações, desmontagem do player, SSR, links e privacidade.

## Evidências e release

- Testes focados **52/52 PASS em 7 arquivos** na versão final: `qa-artifacts/c116-focused-r3.log` (inclui explicitamente o teste legado C110 de não confundir clientes com afiliadas). Regressão integral **1.026/1.026 PASS em 140/140 arquivos**, quatro shards de baixa concorrência, todos exit 0: 312 testes/35 arquivos, 251/35, 208/35 e 255/35. Logs finais `qa-artifacts/c116-shard-*-r3.log`. Nenhum teste de marketing foi ignorado.
- Chrome headless GET/HEAD-only em **320/360/390/768/1440 — 5/5 PASS** (`qa-artifacts/c116-browser/report.json` e screenshots). Deslocamento real da inscrição para mais perto do topo: **321 px (320), 305 px (360), 303 px (390)**. Em 768 px **0 px** e 1440 px **7 px** de variação não significativa. Botão de prova social expandiu, revelou quatro avaliações e player de vídeo somente sob escolha, fechou vídeo ao recolher, sem POST, overflow horizontal ou erros de JavaScript. Em cold-start do Vite, aguardar hidratação antes de simular interações.
- Prettier + ESLint dos arquivos C116 e `git diff --check`: **PASS (0,0,0)**. TypeScript local `tsc --noEmit` exit 2 por **três erros TS2322 anteriores em `src/routes/checkout.tsx` linhas 1466–1468** (fora do Portal); nenhum novo diagnóstico C116. O CI GitHub da loja historicamente apresenta 20 erros globais em cinco arquivos comerciais: verificar e documentar o resultado atual, sem mascarar alterando arquivos do e-commerce.
- PR #279 https://github.com/lucassilva1175/vonix-hair-care/pull/279 permanece **DRAFT**, sem merge, deploy ou edição de Lovable main. Produção **NOT_APPROVED** até homologação real.
