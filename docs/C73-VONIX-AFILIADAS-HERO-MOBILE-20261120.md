# C73 — Vonix Hair Afiliadas: vitrine editorial mobile mais compacta

Data: 20/11/2026 (Brasil). **Escopo exclusivo:** página pública de recrutamento de afiliadas Vonix Hair. Base main GitHub `932e5fd0c94895914394f198320e70228ff17b42`, branch `feat/afiliadas-c73-hero-mobile-20261120`. Não confundir com sistema de afiliadas administrativo nem com e-commerce.

## Referência e decisão

A página [Skence Creators](https://skence.com.br/pages/skence-creators) usa cartões editoriais deslizáveis para mostrar benefícios e imagens. A Vonix já possuía, no hero C61, três fotografias próprias de produtos efetivamente vendidos no site: Kit Banana e Mel, Máscara Nutri Repair, Botox Vonix. **São fotografias de catálogo, não UGC, criadoras contratadas, avaliações ou resultados.** Os benefícios comerciais da Skence são de outra empresa; não copiar ativos, comissões, promessas ou benefícios.

O hero Vonix C61 mantém a CTA de inscrição, condições e disponibilidade verdadeiras, mas exibia uma vitrine 2×2 até mesmo no celular, com altura de 490–513 px. O C73 converte essa vitrine para **três cartões mobile/tablet com snap horizontal** e instrução visível para deslizar, sem remover conteúdo; ao atingir o breakpoint desktop `lg`, a composição 2×2 original permanece.

## Mudanças

- `src/components/affiliate-editorial-hero.tsx`: vitrine com região focável por teclado (`role=region`, `tabIndex=0`, rótulo acessível), `scroll-snap`, `overflow-x-auto` e indicação mobile “Deslize para explorar os produtos”; cards responsivos, com primeira imagem prioritária `loading=eager` `fetchPriority=high`, as demais lazy, mesma fonte WebP/JPG e links oficiais.
- `src/test/affiliate-c73-mobile-hero.test.tsx`: testes da região acessível, fonte real dos três produtos, prioridade de imagens, mosaico desktop, links da loja e `#inscricao`, estados de candidatura `open/loading/limited/closed`, transparência sem promessas nem vídeo/autoplay.
- Nenhuma imagem, cor de logotipo, API, formulário, backend, status de recrutamento, analytics, validação ou regra de comissão foi alterada. Nenhum dado pessoal, candidatura, segredo, .env ou banco foi acessado.

## Comparativo de Chrome local

Rede externa e todo POST/MP4 bloqueados. Mesma cópia isolada, mesmo servidor local porta 5291, Chrome headless, medidas DOM reais.

| Viewport | Vitrine antes | Vitrine depois | Hero antes | Hero depois | Topo da inscrição antes → depois |
| --- | ---: | ---: | ---: | ---: | ---: |
| 360 × 780 | 490 px | 404 px | 1354 px | 1268 px | 3779 → 3693 px (**−86 px**) |
| 390 × 844 | 513 px | 404 px | 1336 px | 1227 px | 3649 → 3540 px (**−109 px**) |
| 768 × 1024 | 663 px | 438 px | 1489 px | 1264 px | 3638 → 3413 px (**−225 px**) |
| 1440 × 900 | 699 px | 699 px | 965 px | 965 px | 2828 → 2828 px (**0 px**) |

C73 Chrome 4/4 PASS: 3 links e fontes WebP/JPG correspondentes aos produtos oficiais, região acessível navegável pelo teclado (ArrowRight), rolagem interna em mobile/tablet e grid sem rolagem no desktop, uma âncora `#inscricao`, primeira imagem com prioridade high, documentos sem overflow, sem erros JS, nem POST ou MP4. Screenshot e logs locais não inclusos no PR. Isso demonstra economia de rolagem, **não crescimento medido de conversões**.

QA local: **31/31 Vitest PASS** (C73 novo, C61 hero, C72 prova real e recrutamento), TypeScript `tsc --noEmit` PASS, Prettier escopado PASS, ESLint escopado PASS e build Nitro/Vite PASS. Suíte integral apenas no runner GitHub isolado. Todos os checks finais do PR e SHA/estado de produção deverão ser confirmados antes do merge e registrados no recibo local.

## Publicação bloqueada separadamente

O Lovable `203d2f84-1058-4ca4-acc3-41a4a5d4e2b5` compartilha deploy da página de afiliadas com o e-commerce Vonix Hair. Main contém atualizações de preços/frete/checkout dos PRs #250–252 que precisam de validação comercial e aprovação independente; não publicar todo o site apenas porque este PR de UI foi aprovado. `is_published: true` diz apenas que existe versão anterior publicada, não que o último commit está online.

Oportunidade futura: provas de criadoras/afiliadas reais mediante consentimento e material verificável; relatos de clientes de produto (C62/C72) não são provas de ganhos de afiliadas. O funil analítico anônimo C68 permitirá medir conversões só **após** publicação do código e volume suficiente de tráfego.
