# C98 TURBO — vitrine mobile sob demanda + passos compactos, sem conteúdo fictício

## Identificação, fontes e limite
21/11/2026 · Portal de Afiliadas Vonix Hair EXCLUSIVO, PR GitHub #279 DRAFT branch feat/afiliadas-c86-prova-social-foto-20261121. C97 HEAD inicial 8dfc5cd8f23beef455f33cd124b5a4a440905355. Site Lovable/main publicada permanece SHA 68422d2b8cdc371d8d953168c0fbdbbf4274e955, sem merge/deploy.
A comparação foi feita usando os sites oficiais vonixhair.com/seja-afiliada e /loja, projeto Lovable conectado read-only e Skence Creators como referência de hierarquia visual, não de fotos, depoimentos, ofertas, comissões nem direitos comerciais. Não há prova autorizada de afiliadas reais ou ganhos associados; os 4 testemunhos reais disponíveis são de CLIENTES sobre Botox Vonix (3 vídeos e 1 foto).

## Diagnóstico real (Chrome QA C97)
No mobile 360px a vitrine de três produtos oficiais ocupava 555px dentro do hero de 1459px e o guia de três etapas 742px, antes do formulário em Y2474. Em 390px: vitrine 538px, formulário Y2402. Em 768px: vitrine 556px, formulário Y2653. Desktop 1440px: galeria 791px ao lado do texto (não alterar).

## Alteração
1. O componente AffiliateEditorialHero mantém a fotografia original do cabelo categoria Cachos e a manchete branca acessível. Em telas menores que 1024px, mostra resumo editorial com miniatura verdadeira Botox Vonix, nome de 3 produtos da loja e botão nativo para **abrir/recolher** o mesmo painel de produtos já existente, ligado por aria-expanded/aria-controls. Um link para o catálogo oficial continua disponível. O resumo declara que as fotos são de embalagens, não afiliadas.
2. A galeria original continua no DOM **uma única vez**: três CatalogCard, links oficiais e imagens webp/jpg, carrossel de swipe e controles, e CTA de reviews de produto. Painel fica oculto visualmente em mobile até interação, porém desktop >=1024px continua aberto e com mesmo layout original.
3. O guia de três etapas usa painel de foto com 80px no mobile e mantém 144px a partir de sm, preservando textos integrais, três cards acessíveis, navegação por swipe/teclado, autenticidade das imagens e o link /consultar-candidatura.
4. Avisos de seleção e CTA, 8% após aprovação, candidatura gratuita, ausência de compra obrigatória, idade mínima e TikTok opcional não foram alterados; não foram enviadas candidaturas e não há novas promessas ou depoimentos fictícios.
5. Arquivos restritos a src/components/affiliate-editorial-hero.tsx, src/components/affiliate-application-steps-preview.tsx, novo contrato src/test/affiliate-c98-mobile-intro.test.tsx e esta documentação. Nada em checkout/e-commerce, Auth, Supabase, pagamentos, bancos, PII, publicações ou integrações reais.

## Medições Playwright C97 → C98 no Chrome local (formulário Y a partir do topo)
| Viewport | C97 | C98 | Mais cedo |
|---|---:|---:|---:|
| 360px | 2474 | 2083 | -391px (15,8%) |
| 390px | 2402 | 2011 | -391px (16,3%) |
| 768px | 2653 | 2301 | -352px (13,3%) |
| 1440px | 2051 | 2051 | 0px (layout desktop preservado) |

Na tela 360, a vitrine visível caiu de 555px para 220px; no tablet 768, 556px para 205px. Chrome 4/4 PASS: miniatura oficial, painel inicialmente fechado em mobile e visível no desktop, botão abre/recolhe com aria-expanded sincronizado, três links e três etapas preservados, hero original com condição 8%, CTA de avaliações de produtos #avaliacoes-rapidas, sem erro JavaScript, POST, MP4 automático ou overflow horizontal. Screenshots e relatório em C:\Users\JL\code\vonix-afiliadas-c86-20261121\browser-artifacts-c98\c98-browser-report.json; baseline em c98-baseline.json.

## Gates e limites
- Testes novos C98 verificam três produtos oficiais, acessibilidade de abertura, estados open/loading/closed/limited/unavailable, regras comerciais no hero, três etapas, texto e fonte, SSR sem envio de candidatura.
- Vitest focado 29/29 PASS em cinco suítes após corrigir teste de miniatura decorativa: alt vazio não é exposto como role img (correto). Prettier/ESLint aprovados para componentes/testes C98.
- Rodar regressão completa e GitHub Actions no commit final e descrever separadamente três TS2322 **preexistentes** no checkout compartilhado src/routes/checkout.tsx linhas 1466–1468.
- PR #279 continua OPEN DRAFT, não mesclar nem publicar na Lovable sem CI global 2/2, homologação independente do checkout e autorização explícita. **Métricas acima são medidas de layout, NÃO candidaturas, resultados de afiliadas ou conversão.**
- Modo turbo documentado em C:\Users\JL\Documents\Autonomous-Global-Modo-Turbo.md; significa operações em lote, sem otimizar hardware do PC ou afetar outros projetos.
