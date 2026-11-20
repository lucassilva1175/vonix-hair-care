# C85 — Jornada editorial de cabelos com imagens já existentes na Vonix Hair

20/11/2026. Projeto exclusivo **portal de afiliadas Vonix Hair**, continuidade do C84 GitHub/Lovable `fb81c1cc76edacd1712d0f6c4df5e6782a159136`.

## Fonte oficial e referência

- Seis imagens JPEG ilustrativas em `public/images/categorias/`: `cachos.jpg`, `frizz.jpg`, `hidratacao.jpg`, `nutricao.jpg`, `quimica.jpg`, `reconstrucao.jpg`. Já presentes no próprio site/repositório da loja Vonix. Todas 480×480, aprox. 28–52 KB por imagem; contato visual consolidado em `C85-category-contact-sheet.jpg` **local**.
- A página de referência `https://skence.com.br/pages/skence-creators` usa fotografias de pessoas criadoras, cupons, descontos e vantagens específicas do programa Skence. Não se copiou nenhuma dessas imagens, pessoas, condições, porcentagens, práticas ou alegações. Imagens do catálogo Vonix são **ilustrativas**: nunca identificam afiliadas contratadas, depoimentos, comissões, resultados ou vínculos.
- Fotos originais de produtos na vitrine de abertura, avaliações de clientes e fluxo de compra permanecem intactas. O exemplo de unboxing ainda mostra o Kit Cronograma Capilar real, porque uma foto de cabelo não é um unboxing.

## Melhorias de frontend C85

1. `src/components/affiliate-creator-paths.tsx`: três caminhos `Rotina e comunidade`, `UGC e criação`, `Conteúdo informativo` passam a ilustrar cabelos reais a partir das imagens editoriais já presentes no site (`cachos`, `frizz`, `hidratacao`), com `object-cover`, carregamento `lazy`, textos alternativos e badge visível avisando que as fotos **não são depoimentos**. Mantidos roving tabs por teclado Home/End/ArrowLeft/ArrowRight, ARIA, todos os textos de critérios e CTA. Aviso institucional abaixo da seção deixa claro que fotos não representam participantes nem resultados do programa.
2. `src/components/affiliate-landing.tsx`: o conjunto **já existente** de quatro inspirações de formato combina três fotos editoriais `nutricao`, `quimica`, `reconstrucao` e um unboxing com foto real de produto. A primeira imagem, no mobile, passa a ser de cabelo/rotina para reduzir repetição de embalagens e aproximar a experiência editorial da proposta de criadoras. O formato **Foto editorial de cabelos** traz orientações de enquadramento sem endosso inventado. Cada foto de categoria recebe badge editorial inequívoco e alt descritivo; fotos de produto mantêm `<picture>` WebP do catálogo.
3. Uma checagem impediu o reuso indevido do componente `ProductImage` para os JPEGs de categorias: ele procura automaticamente um WebP com o mesmo nome que **não existe** neste acervo. Os JPEGs editoriais usam `<img src=...>` direto; não há 404 ou fonte duplicada.
4. Contratos C54/C80 atualizados para os novos `src` reais e disclosures, e novos quatro testes `src/test/affiliate-c85-editorial-hair-gallery.test.tsx`. Sem mudanças em comunicação da marca, regras de aprovação, oferta, percentuais, dados pessoais ou mecanismos de inscrição.

## QA verificado

- Vitest C54/C80/landing-v2/C85 **23/23 testes PASS** em quatro arquivos.
- ESLint focado, Prettier e `git diff --check`: saídas 0. TypeScript e build completos conferidos também no CI GitHub antes de qualquer merge.
- Chrome real em `http://127.0.0.1:5301/seja-afiliada`: **C85_CHROME PASS failures=0**, quatro tamanhos 360×780, 390×844, 768×1024, 1440×900. Troca dos três tabs com estado efetivamente selecionado, fotografia decodificada `naturalWidth>0`, seis fotos de categoria válidas, cards de formatos intactos, bom enquadramento `object-fit: cover`, nenhum `source` apontando para WebP inexistente. Zero POST, zero JavaScript error, zero HTTP 404 da categoria, zero overflow horizontal. Foram salvos screenshots locais de 390px para revisão visual.
- A primeira versão do ensaio Chrome capturou imagens imediatamente após clique, antes de confirmar o estado selecionado durante a atualização inicial de recrutamento; foi corrigida com espera explícita `aria-selected=true` e `img.src`, e quatro resoluções passaram. Nenhum defeito de inscrição foi mascarado; teste não envia dados.
- Inscrição real, e-mail, token, base de candidatas, Auth, Supabase, pagamento, dados privados e deploy **não foram usados**.

## Bloqueio de produção

Este sistema compartilha o repositório da loja. O domínio `https://vonixhair.com/seja-afiliada` ainda carrega bundle antigo; atualização no GitHub/Lovable não implica publicação. Há alterações comerciais de e-commerce (checkout, preços e frete) não homologadas independentemente, logo **não publicar** o pacote compartilhado até validação/autorizações específicas. Não declarar aumento de conversão sem evidência de analytics e candidaturas de produção.

## Próxima prioridade real

Obter autorização/relatos reais de afiliadas (se existirem) e homologar publicação do portal sem liberar mudanças comerciais de loja não aprovadas. Fotos ilustrativas melhoram linguagem, mas não substituem prova social do programa.

## C85B — correção de contratos legados descoberta no CI integral

O primeiro GitHub Actions (run `44837334354`) encontrou **872 PASS / 2 FAIL** entre 874 testes; o PostgreSQL isolado ficou verde. Os dois casos falhos eram contratos anteriores que afirmavam que **todas** as imagens do portal deveriam ser embalagens de produtos: `affiliate-c55-content.test.tsx` procurava sempre `picture img` na seção de quatro formatos e `affiliate-recruitment-page.test.tsx` exigia que qualquer `img` do site viesse de `/images/products/`. Com a melhoria editorial, ambas as premissas ficaram desatualizadas; os testes antigos não sinalizavam defeito de renderização e não deveriam ser apagados ou ignorados.

A correção C85B atualiza explicitamente esses contratos para aceitar apenas as **seis fotos de categoria previamente existentes no próprio site**, com `alt` informando origem Vonix e caráter ilustrativo/não participação. A foto de unboxing continua vinculada ao WebP oficial de produto; nenhuma origem arbitrária ou imagem de outra marca é permitida. O rótulo de acessibilidade dos formatos foi corrigido para `Formatos criativos ilustrados com o acervo da loja Vonix Hair`, sem prometer que fotos de cabelos sejam produtos.

O rerun local com seis arquivos e contratos antigos C54/C55/C80/recrutamento/landing-v2/C85 foi **42/42 PASS**. O novo CI integral após o push de C85B é obrigatório antes de merge.
