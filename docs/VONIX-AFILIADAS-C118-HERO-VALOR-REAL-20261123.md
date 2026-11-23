# C118 — Hero premium: clareza de comissão e candidatura gratuita

**Data:** 23/11/2026 (BRT). **Projeto único:** Portal de Afiliadas Vonix Hair.

## Base e fontes autorizadas

- Base C117: commit `148882bc7598ef8dd2663af6aa99e3ed36ce5cb0`; branch `feat/afiliadas-c86-prova-social-foto-20261121`; PR #279 DRAFT: https://github.com/lucassilva1175/vonix-hair-care/pull/279; clone `C:\Users\JL\code\vonix-afiliadas-c111-20261122`.
- Site/catálogo oficiais: https://vonixhair.com/seja-afiliada, https://vonixhair.com/loja. O material do projeto usa fotos originais já disponíveis em `public/images/` e depoimentos de **clientes sobre produtos** de `src/data/reviews.json`, jamais depoimentos de afiliadas.
- Referência de estrutura e marca empregadora: https://skence.com.br/pages/skence-creators. **Não utilizar** creators, percentuais, fotos, depoimentos, benefícios, cupons, kits gratuitos ou alegações de impacto da Skence; sem autorização ou equivalência na Vonix.
- Lovable vinculado: `Vonix Haircare Showcase` `203d2f84-1058-4ca4-acc3-41a4a5d4e2b5`, snapshot/main `cfcfa79520df715e9a7cb2b52c8f21dc199093ad`, compartilhado com a loja, **somente leitura**, anterior ao PR. Sem merge, edição ou deploy.

## Diagnóstico e evidência da primeira tela

O C117 já havia aproximado a inscrição do início da página. C118 verificou em Chrome real, antes de mudar o hero, que a **única CTA principal** já ficava na primeira tela: terminava em **y514 (320px), y499 (360px), y469 (390px), y566 (768px), y887 (1440px)**, para uma altura de viewport de 900px. Então não havia justificativa para criar CTA duplicada nem alegar que estava invisível.

O problema era editorial: a proposta de valor real permanecia em uma lista fina de texto, difícil de identificar à primeira vista. O usuário queria uma página premium inspirada na referência, mas ainda não existem depoimentos autorizados de afiliadas.

## Mudança C118

**Um único componente de apresentação modificado:** `src/components/affiliate-editorial-hero.tsx`.

- Copy anterior abstrata substituída por texto objetivo: conteúdo sobre cabelos, apresentação do Instagram, candidatura gratuita sem compra obrigatória e análise individual.
- Botão principal `#inscricao` com cor vinho, sombra, alvo de toque e **largura total em telas pequenas**; desktop mantém largura natural. Texto muda conforme o estado real do backend (`Conhecer a inscrição` vs `Quero ser afiliada Vonix`). Link alternativo `#ganhos` e compartilhamento preservados.
- A lista já existente de benefícios virou um **rail visual editorial** com 3 informações *já confirmadas*: bloco principal `8% sobre vendas após aprovação` com ressalva **`Vendas elegíveis e confirmadas`**, dois chips `Sem estoque próprio` e `Inscrição gratuita`. Móvel: comissão em largura completa e chips lado a lado, desktop: fila compacta.
- Nenhuma seção duplicada nem dados de faturamento/testemunhos criados. A banda C114 continua após o hero, com bônus e supervisão condicionais explicitados separadamente.
- Preservados H1, foto editorial oficial de cabelos, galeria de três produtos da loja, seletor de catálogo mobile, avaliações reais de produtos, disclaimer de foto não ser afiliada, elegibilidade, regras, status dinâmico e CTA única.

**Testes:** novo `src/test/affiliate-c118-first-fold-benefits.test.tsx` assegura 8% condicionado, três vantagens, cinco estados de inscrição, CTA única/status e imagens/SSR sem POST. Contrato legado `src/test/affiliate-c105-early-mobile-cta.test.tsx` atualizado **somente na frase intencionalmente reescrita do hero**, preservando verificações de CTA, ordem mobile/desktop, estado de inscrição e catálogo oficial. Nenhum teste removido ou enfraquecido.

## QA já verificado

- Focados finais `qa-artifacts/c118-focused-r2.log`: **57/57 PASS em 7 arquivos**, incluindo os testes antigos C105 (hierarquia/status/CTA), C109 (primeira dobra), C61 (hero), C94 (status), C102 (condições) e rota completa. A primeira bateria parcial 49/49 PASS foi ampliada após atualizar o literal legado C105.
- `qa-artifacts/c118-hero-baseline.json` e `qa-artifacts/c118-hero-after.json`: Chrome headless GET/HEAD-only em **320, 360, 390, 768 e 1440 px — 5/5 PASS**, sem overflow. CTA em 320px cresceu **182→286px** sem sair da primeira dobra (y514 no antes e no depois); em 360px **182→326px** (y499→501), em 390px **182→356px** (y469). Barra 8% completamente visível na primeira tela em 320/360/390 (bottom y848/830/779).
- Capturas visuais conferidas: `qa-artifacts/c118-hero-320.jpg`, `qa-artifacts/c118-hero-1440.jpg`. Prova de benefícios legível, layout editorial/burgundy responsivo e galeria de produtos oficiais preservada.
- Regressão integral **1.035/1.035 PASS em 142/142 arquivos** por quatro shards independentes: 319/36 (shard 1 r2), 253/36 (shard 2 r3), 208/35 (shard 3 r3), 255/35 (shard 4 r3), todos exit 0. Prettier/ESLint scoped e `git diff --check` final **0/0/0 PASS**. TypeScript local continua com três TS2322 preexistentes somente em checkout (linhas 1466–1468), nenhum novo em arquivos do portal. Auditoria `qa-artifacts/c118-final-audit-20261123.md`.
- Nenhuma inscrição real foi enviada e não há métrica de conversão atribuível ao C118. Melhor legibilidade/CTA é hipótese de conversão, não ganho medido.

## Publicação segura

- Gerar ZIP SOURCE_ONLY com os **4 arquivos** exatos modificados ou criados (hero, teste novo C118, atualização textual do teste legado C105 e este documento), hashes SHA256 e verificação byte a byte.
- Commit e push somente da branch de afiliadas, mantendo PR #279 aberto em DRAFT. Preservar `qa-artifacts` não rastreados e todos os checkpoints anteriores.
- O GitHub CI C117 `45112961576` aprovou testes de aplicação e segurança PostgreSQL, mas teve 20 erros TypeScript preexistentes em cinco arquivos do e-commerce/testes de produtos, interrompendo lint/build. C118 não deve editar checkout, boleto, produto ou segurança para contornar esses bloqueios.
- **Produção NOT_APPROVED** sem CI global verde e homologação do Lovable compartilhado.
