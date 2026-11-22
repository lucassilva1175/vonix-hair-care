# Vonix Hair — Portal de Afiliadas — C111 (22/11/2026)

## Escopo e origem
- Projeto: **exclusivamente** `/seja-afiliada` e seus componentes editoriais; não alterar o e-commerce, preços, checkout, frete, banco ou outros sistemas.
- Clone isolado: `C:\Users\JL\code\vonix-afiliadas-c111-20261122`.
- Base verificada C110: `eba295ad356ccb6b94125dfa80d629a2ac110e88`.
- Branch existente: `feat/afiliadas-c86-prova-social-foto-20261121`, PR #279 **DRAFT**.
- Lovable `Vonix Haircare Showcase`: é um projeto compartilhado com o e-commerce; **não publicar nem aceitar merge sem homologação comercial**.

## Origem editorial verificável
- Catálogo/fotos oficiais Vonix: `https://vonixhair.com/`, `https://vonixhair.com/loja`.
- Página atual pública (anterior a este checkpoint): `https://vonixhair.com/seja-afiliada`.
- Skence Creators foi usada como **referência de ritmo editorial e descoberta de perfis**, jamais como fonte de imagens, depoimentos, produtos, condições, ganhos ou promessas da Vonix.
- Fotografias reutilizadas são `/images/categorias/cachos.jpg`, `frizz.jpg`, `hidratacao.jpg`, com `alt` explícito baseado no texto editorial próprio da Vonix; não representam afiliadas.

## Entrega funcional C111
- `src/components/affiliate-creator-spotlight.tsx`: transforma três escolhas textuais em cartões fotográficos premium, com gradiente de legibilidade, foco visível, `aria-pressed`, `aria-controls` apenas quando selecionado, uma escolha por vez, e três ideias por perfil.
- Mobile: mantém o painel inicialmente recolhido; abrir, selecionar e recolher limpa estado sem alterar formulário ou criar inscrição.
- CTA único preserva `#inscricao`; sem nova API, POST, estado persistido, token, credenciais, mensagens de e-mail ou prova social fictícia.
- `src/test/affiliate-c111-premium-style-cards.test.tsx`: quatro verificações novas de fonte das fotos, seleção, acessibilidade, mobile, SSR, não-envio e aviso de honestidade.

## Evidências locais
- Vitest direcionado incluindo teste de regressão `affiliate-recruitment-page`: **22/22 PASS** (`qa-artifacts/c111-focused-r3.log`).
- Chrome headless GET-only e sem envio em `360/390/768/1440`: **4/4 PASS** (`qa-artifacts/c111-browser-r3.log`, imagens e relatório em `qa-artifacts/c111-browser/`).
- Prettier e ESLint (somente arquivos C111): **PASS** (`qa-artifacts/c111-prettier-r2.log`, `qa-artifacts/c111-eslint.log`).
- TypeScript global pré-existente: **3 erros TS2322 no `src/routes/checkout.tsx`**, arquivo fora do escopo, não corrigido nem omitido (`qa-artifacts/c111-tsc.log`).
- Vitest integral C111: **1008/1008 testes PASS, 135/135 arquivos PASS**, exit 0 (`qa-artifacts/c111-full-r2.exit.txt`, `qa-artifacts/c111-full-r2.log`).

## Segurança, honestidade e liberação
- Avaliações exibidas são de PRODUTOS, não depoimentos de afiliadas; não prometer aprovação, cupom, ganhos ou envio de produtos.
- Não houve candidatura real, e-mail real, transação, leitura de `.env` ou dados pessoais, nem publicação no domínio oficial.
- Este checkpoint não autoriza produção. Manter PR #279 DRAFT e liberar apenas depois de resolver gates externos e homologar projeto Lovable compartilhado.
