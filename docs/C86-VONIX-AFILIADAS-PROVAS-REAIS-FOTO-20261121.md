# C86 — Afiliadas Vonix Hair: quatro avaliações reais, três vídeos e uma foto

## Origem comprovada
- Base pública original: src/data/reviews.json do e-commerce Vonix, sem modificações.
- 3 vídeos com posters originais: Mariana Andrade, Ayla Muniz e Fernanda Assis.
- 1 foto original publicada na avaliação: Ana Paula, /depoimentos/depoimento-4.jpg.
- São avaliações de **produtos** (Botox Vonix), não depoimentos de afiliadas, vendas, renda, compra verificada ou aprovação.

## Interface
- Faixa próxima ao topo: quatro opiniões com cards responsivos e controles de navegação no celular; cada mídia rotulada vídeo/foto, sem preload de MP4.
- Seção detalhada pós-formulário: 3 vídeos com controles e preload none; 1 foto lazy-loaded ligada ao respectivo comentário e autora.
- A copy comercial e o formulário de candidatura permanecem intactos.

## Limites de liberação
- Escopo: apenas 2 componentes públicos do portal, testes de apresentação e este documento.
- Não modificar checkout, preço, frete, catálogo, admin, Auth, Supabase ou dados pessoais.
- PR deve aprovar todos os trabalhos de CI e QA browser. GitHub/Lovable sincronizados não significam publicação no domínio.
- Publicação compartilhada bloqueada até homologação independente das alterações comerciais da loja.

## Verificação
- Conferir 4 avaliações, das quais 3 vídeos e 1 foto; sem falsas credenciais e sem requisições POST.
- Testar viewport 360/390/768/1440 sem overflow, mídia quebrada ou perda da CTA.
