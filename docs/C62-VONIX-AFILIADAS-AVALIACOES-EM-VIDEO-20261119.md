# C62 | Sistema de Afiliadas Vonix Hair — avaliações com vídeos da loja

Data local: 19/11/2026, repositório compartilhado lucassilva1175/vonix-hair-care, mas escopo exclusivo ao portal de afiliadas. Base de trabalho: main 768e0444db15e6706092c23fe0d2df210805ffc7 (C61). Clone isolado: C:\Users\JL\code\vonix-afiliadas-c62-video-reviews-20261119.

## Origem verificável e apresentação honesta

- Fonte única: src/data/reviews.json da loja oficial, NÃO dados de candidatas/afiliadas. Os 3 comentários sobre o Botox Vonix já aparecem em https://vonixhair.com/produto/botox-vonix.
- Fernanda Assis, 2026-09-09: comentário Adoreeeeeiii, vídeo /depoimentos/depoimento-3.mp4, poster correspondente (60,3s).
- Ayla Muniz, 2026-08-17: comentário Já peguei logo o combo kkkkkkk minhas cliente amou, vídeo /depoimentos/depoimento-2.mp4 (12,4s).
- Mariana Andrade, 2026-07-02: comentário Produto maravilhoso ❤️ eu amei trabalhar com ele, vídeo /depoimentos/depoimento-1.mp4 (17,7s).
- Os 3 MP4s e 3 posters pertencem à base pública já servida pela loja, e deram HTTP200; não adicionamos gravações, nomes ou conteúdo de terceiros, não acessamos candidatas. Há áudio sem legenda VTT existente; as frases ESCRITAS acompanham cada vídeo mas NÃO equivalem a transcrição integral. As legendas/transcrições ainda exigem produção e revisão humana para acessibilidade integral.
- As pessoas citadas são avaliadoras de PRODUTO presentes na loja; não há comprovação de compra verificada, vínculo com a equipe de afiliadas, contrato, comissões pagas ou ganhos. A apresentação não faz tais afirmações.

## Alteração de código

- src/components/affiliate-product-proof.tsx: comentário/autor/data/vídeo/poster derivados do reviews.json; vídeos HTML5 com controles visíveis, preload=none, playsInline, poster da loja, reprodução apenas acionada pela visitante, sem autoplay. Layout responsivo coloca imagem de vídeo ao lado do texto real na mesma avaliação. Textos negativos de prova de renda e fonte oficial preservados.
- src/test/affiliate-c62-review-videos.test.tsx: correspondência vídeo-poster-autor e citações, atributos de reprodução segura e existência dos seis arquivos públicos.
- src/test/affiliate-c53.test.tsx: ajuste legítimo no seletor histórico para validar picture source (WEBP de produtos) sem exigir que uma nova source de vídeo MP4 seja interpretada como imagem. Os demais invariantes preservados.
- Nenhum arquivo de checkout, frete, produto, preços, cobrança, API, formulário de candidatura, autenticação, administração ou banco alterado.

## Qualidade local

- Testes focados C53/C58/C60/C62: 16/16 PASS.
- Chrome headless 360x780,390x844,768x1024,1440x900: 4/4 PASS com exatamente três vídeos vinculados a autor/poster/MP4, nenhuma mídia MP4 pré-carregada durante a visita, sem overflow, erros JS ou POST de candidatura, vídeo Fernanda reproduziu em Chrome desktop com duration 60.325s e foi pausado após verificação.
- ESLint e Prettier arquivos alterados, TS --noEmit, build Vite/Nitro PASS. Uma primeira passagem integral falhou 1 caso histórico do painel administrativo por temporização (esperava 3 verificações e recebeu 2), sem edição de arquivos admin. Reexecução do teste isolado PASS e reexecução integral PASS: 770/770 testes em 84 arquivos. O primeiro incidente não foi ocultado.

## Barreiras de publicação

- C61/main inclui PR #247 de e-commerce com frete SP/MG e ajustes de preços ainda não demonstrados publicados/validados em produção. Lovable compartilha deploy com e-commerce, não consegue deploy por rota. Não publicar C62 via Lovable até autorização ou verificação separada do PR247; diferenciar PR merge de publicação.
- Não inventar aumentos de conversão, aprovação de candidatas, depoimentos de afiliadas nem métricas.
