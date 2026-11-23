# C115 — Portal de Afiliadas Vonix: entrada editorial premium da candidatura

Data: 23/11/2026 (BRT).

## Continuidade e material consultado

- Projeto exclusivo: **Portal de Afiliadas Vonix Hair**, código em `C:\Users\JL\code\vonix-afiliadas-c111-20261122`, branch `feat/afiliadas-c86-prova-social-foto-20261121`.
- Base C114 verificada: `55e518cdb788dd9f6db6667fe9ba407dbe83e7ce`; PR #279 permanece aberto como rascunho.
- Fonte da marca: https://vonixhair.com/seja-afiliada e https://vonixhair.com/loja. Referência de composição editorial: https://skence.com.br/pages/skence-creators, sem copiar fotos, depoimentos, vantagens, percentuais ou promessas da Skence.
- Lovable `Vonix Haircare Showcase`: commit consultado `cfcfa79520df715e9a7cb2b52c8f21dc199093ad`, compartilhado com e-commerce e ainda sem os commits do PR. **Não houve alteração na versão publicada, no banco ou no Lovable.**
- A Vonix tem avaliações reais de **produtos** (não de afiliadas), fotos de catálogo oficiais e consulta de candidatura por código; não há autorização verificada de depoimentos de afiliadas aprovadas.

## Problema de conversão identificado

O portal já apresenta diversos conteúdos premium, mas, no ponto crítico `#inscricao`, o cabeçalho era apenas texto centralizado e o retorno de quem já se cadastrou tinha baixo destaque. O objetivo não é criar novas seções nem aumentar a distância do visitante ao formulário: a melhoria é feita **dentro do cabeçalho existente**.

## Entrega C115

- `src/routes/seja-afiliada.tsx`: cabeçalho da inscrição reorganizado em card editorial suave com grade responsiva: coluna de texto e requisitos + coluna visual a partir de `lg`. Abaixo de 1024 px, a imagem complementar fica oculta e o texto/formulário é prioritário.
- `src/components/affiliate-application-editorial-art.tsx`: composição com foto do **Kit Cronograma Capilar**, proveniente dos arquivos oficiais `public/images/products/kit-cronograma-capilar.webp` e `.jpg`; badge de fonte, acessibilidade, imagem lazy e declaração explícita de que não é uma afiliada, e que aprovação, kits e remuneração não são garantidos.
- A rota `/consultar-candidatura` já existente recebeu destaque no bloco de ingresso, com texto intacto **Consultar meu status pelo código**. Não se inseriu botão de envio falso, novo formulário, teste de elegibilidade ou captura de dados.
- Foram preservados os requisitos C112: **18 anos ou mais, e-mail válido, Instagram com seguidores e TikTok opcional**; o status de abertura continua vindo exclusivamente do backend existente.
- Novo teste `src/test/affiliate-c115-application-entry.test.tsx` verifica fotos físicas reais, responsividade SSR, ausência de POST ou formulários extras e inalterabilidade dos contratos públicos anteriores.
- O formulário real, preview sem envio, salvaguardas de disponibilidade, criptografia, painel administrativo, vendas, checkout, loja e integrações não foram editados.

## Controle de qualidade e publicação

- Testes focados: **27/27 PASS em 5 arquivos**, incluindo C115, C112, C103, C114 e página de recrutamento (`qa-artifacts/c115-focused-r2.log`, exit 0).
- Chrome headless local GET-only com APIs externas bloqueadas: **5/5 PASS** em 320/360/390/768/1440 px. Coluna de arte oculta abaixo de 1024 px; fotografia oficial carrega no desktop, 4 requisitos e rota de acompanhamento preservados, sem POST/erro JS/overflow (`qa-artifacts/c115-browser/report.json`, screenshots).
- Regressão integral **1.023/1.023 PASS em 139/139 arquivos** com quatro shards, todos exit 0: 312/35, 251/35, 208/35 e 252/34. Prettier, ESLint de escopo e `git diff --check`: PASS. `tsc --noEmit` exit 2 por apenas três diagnósticos TS2322 preexistentes em `src/routes/checkout.tsx` linhas 1466–1468; nenhum erro C115.
- O CI da versão anterior teve falhas em testes de segurança de sessão administrativa em ambiente GitHub e problemas de TypeScript globais. Não enfraquecer esses testes nem anunciar produção aprovada.
- PR #279 deve permanecer **OPEN/DRAFT**, sem merge, deploy, mudança de preço nem alterações diretas no Lovable/e-commerce.
