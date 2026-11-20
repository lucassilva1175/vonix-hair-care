# C74B — correção do alvo de toque dos controles de vídeo

Data: 20/11/2026, projeto EXCLUSIVO Vonix Afiliadas, depois de C74 PR #265 (merge `d19ae0d68883bd2670fd071ae7776cc4b16779d8`). Este patch não altera e-commerce, checkout, preços, frete, formulários de candidatura, backend, analytics, contas nem banco.

## Evidência do defeito

O C74 ampliou a seção com **seis vídeos verdadeiros** do catálogo e foi verificado em ambiente de preview isolado pelo Lovable, sem alterar arquivos ou publicar. O QA mediu alturas finais de **1171,13 / 1147,33 / 1355,63 / 1322,50 px** nas larguras 360/390/768/1440, frente aos respectivos baselines 1185/1185/2090/1367. Todos os seis pôsteres foram carregados; mídia, product slugs, controles de reprodução nativos e links foram conferidos; nenhuma requisição MP4 na abertura, nenhum erro JS e nenhuma rolagem horizontal da página.

**Falha real:** os botões `Ver vídeos anteriores` e `Ver próximos vídeos` tinham classe `size-11`, mas, devido a `flex-shrink` na linha do celular, mediam **37,39 × 44 px**, abaixo do alvo de 44 × 44 px. Em 768/1440 mediam 44 × 44 px. O QA classificou C74 como **PASS parcial**, corretamente.

## Correção exata

- `src/components/affiliate-catalog-in-motion.tsx`: aplica `shrink-0` a ambos botões, garantindo largura de 44 px e preservando altura. Altera apenas o **texto visível** do link para loja para `Ver catálogo`, mantendo o nome acessível original `aria-label="Explorar a loja oficial"` e o mesmo destino `/loja`. A abreviação libera espaço na mesma linha para os botões, evitando que passem para outra linha e aumentem a altura em 360/390 px.
- `src/test/affiliate-c74-video-carousel.test.tsx`: reforça contrato `size-11 shrink-0`, nome acessível e texto visível do link.
- Não modifica arquivos de outras áreas. Não cria mídia, não altera `src/data/provas-em-video.json` nem comportamento de `preload="none"`.

Local: Vitest direcionado C74/C63 **9/9 PASS**, TypeScript noEmit sem diagnósticos; ESLint/Prettier escopados são gates do CI. **O comportamento visual de 44 × 44 px ainda deve ser conferido novamente no preview Lovable antes de considerar a correção plenamente aprovada.** Após o merge da correção, executar QA read-only com Chrome em 360/390/768/1440, medir ambos controles, uma linha sem overflow e alturas da seção, sem POST nem MP4. O status online continua independente do código: nenhuma publicação conjunta enquanto mudanças comerciais de preços/frete/checkout PR250–252 não forem homologadas.
