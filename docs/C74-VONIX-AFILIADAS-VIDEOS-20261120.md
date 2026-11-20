# C74 — Vonix Afiliadas: seis vídeos reais do catálogo em uma faixa

**Data:** 20/11/2026. **Escopo:** exclusivamente landing pública do programa de afiliadas Vonix Hair, independente do e-commerce e do painel administrativo. **Base GitHub:** `3527823d537d06750b494ae0ffec79ab7b7e28a9`; branch `feat/afiliadas-c74-videos-oficiais-20261120`.

## Por que vale a pena

O catálogo público já contém dezenas de vídeos com pôsteres locais. O componente C63 usava só três linhas (Banana e Mel, Botox, Fio de Luz). A referência Skence usa diversidade visual e recursos deslizáveis. Não utilizar fotos de criadoras Skence nem insinuar que vídeos de usuários mostram afiliadas ou ganhos.

**C74 acrescenta três linhas de produtos reais sem criar uma nova seção ou uma segunda fileira de vídeos:** Kit Desmaia Cabelo (`desmaia`), Plex Vonix (`plex`) e Kit Cachos (`ig-05`); preserva Banana e Mel, Botox e Fio de Luz. Todos os identificadores `id`, `slug`, `src` e `poster` foram conferidos em `src/data/provas-em-video.json`, em `src/data/products.json` e em arquivos originais `public/provas/*.mp4,*.jpg`. Imagens, fontes e descrições são de produtos, **não depoimentos de afiliadas, rendimentos, vendas verificadas ou comprovação de parcerias**.

A faixa C74 é horizontal e focável por teclado em todas as larguras, com `scroll-snap`, indicação textual e botões **Ver vídeos anteriores / Ver próximos vídeos** de 44 px; as setas ficam junto ao link existente de loja e seus estados são derivados da posição de scroll. Todos os vídeos mantêm controles nativos `playsInline`, `preload="none"` e **sem autoplay**. O botão de inscrição e a transparência do programa não mudaram. Não foram adicionadas integrações, rastreamento, formulários ou APIs.

## Arquivos permitidos no PR

- `src/components/affiliate-catalog-in-motion.tsx` — os seis cards reais, navegação, estilo horizontal responsivo.
- `src/test/affiliate-c63-catalog-motion.test.tsx` — contrato anterior adaptado de 3 para 6 fontes, mantendo todas as verificações de dados.
- `src/test/affiliate-c74-video-carousel.test.tsx` — testes de seis mídias autênticas, teclas/controles, rolagem e condições de inscrição.
- `docs/C74-VONIX-AFILIADAS-VIDEOS-20261120.md` — este documento.

## Qualidade e evidências

Vitest direcionado **23/23 PASS** (C74, C63, regressão integral da página de recrutamento). `tsc --noEmit` PASS, Prettier e ESLint escopados sem diagnóstico; primeiro build Vite/Nitro PASS após adição das seis fontes. O CI completo no GitHub deve validar novamente o código final após a compactação de layout.

Chrome local de baseline, com GET e vídeos protegidos: 360/390/768/1440 px, seção C63 de **1185/1185/2090/1367 px**, três mídias, sem POST de candidatura, MP4 inicial, overflow ou erro JS. A primeira iteração de seis mídias mediu **1276/1276/1456/1395 px**; **reprovada** por aumentar a altura mobile em 91 px (apesar de reduzir 634 px no tablet). Os botões foram então recolocados dentro da área existente de ações no cabeçalho e o texto de orientação substituiu uma descrição longa. **O resultado final dessa alteração de layout ainda exige QA de navegador; não alegar aprovação antes da evidência.** Tentativas de Chrome e servidor preview da cópia C74 foram impactadas por disputa de recursos/disk-free e preview HTTP500 no computador com múltiplos processos de outros projetos. Nenhuma worktree anterior foi apagada ou resetada.

Não inferir aumento de conversão. Dados agregados Lovable entre 01–20/11/2026: **179 visualizações** em `/seja-afiliada` contra **688** na home e **687** na página do Botox. São pageviews, não visitantes únicos nem candidaturas. Em acesso público de leitura, a inscrição antiga foi vista como aberta, mas não houve formulário submetido.

## Release

Lovable e loja compartilham deploy. Até este ciclo, o domínio público servia a versão C61/C62, enquanto main acumulava C63–C73 sem publicação. O deploy de main também levaria alterações comerciais de checkout, preços e frete dos PRs #250–252 sem homologação independente do e-commerce. **Não publicar o site completo por causa do C74**. O projeto exige validação comercial e liberação operacional; o status `is_published: true` não prova que o último commit está online. Registrar depois do CI o SHA, sincronismo e eventual verificação externa do carrossel. Não tocar bancos, candidaturas reais, .env, segredos, pagamentos ou outras worktrees.
