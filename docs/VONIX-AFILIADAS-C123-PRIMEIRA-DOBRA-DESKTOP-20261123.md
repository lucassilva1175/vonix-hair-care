# C123 — Hero desktop premium com CTA na primeira dobra | Vonix Hair Afiliadas

Data: 23/11/2026 BRT. **Somente Portal de Afiliadas Vonix Hair.** Continuidade C122 `ebf7797d88f045a6b8e58087b4a7f42c0e9bc912`, clone `C:\Users\JL\code\vonix-afiliadas-c111-20261122`, branch `feat/afiliadas-c86-prova-social-foto-20261121`, [PR #279](https://github.com/lucassilva1175/vonix-hair-care/pull/279) OPEN/DRAFT. **Sem merge, deploy ou mudança do e-commerce.**

## Referência real e problema

- Marca/fotografia/catálogo: https://vonixhair.com/seja-afiliada e https://vonixhair.com/loja. A fotografia `/images/categorias/cachos.jpg` é **foto editorial de cabelo do acervo oficial**, não representa afiliada, parceria, resultado ou depoimento. Produtos da vitrine são itens reais da loja.
- Referência editorial: https://skence.com.br/pages/skence-creators. Usar somente linguagem premium, hierarquia e inspiração geral. Não copiar creators, imagens, depoimentos, métricas, porcentagens, benefícios, compra obrigatória, comissões nem condições da Skence para a Vonix.
- Lovable projeto compartilhado `Vonix Haircare Showcase`, ID `203d2f84-1058-4ca4-acc3-41a4a5d4e2b5`, main `cfcfa79520df715e9a7cb2b52c8f21dc199093ad` consultado em **leitura apenas**, atrás do PR #279. A presença do PR remoto não significa publicação no Lovable.
- Baseline Chrome real com altura 780px: o CTA único do hero desktop começava aos 840px (1024), 826px (1280), 843px (1440/1920), ficando fora da primeira tela, apesar de haver botão de navegação global no cabeçalho. No mobile, começava a 470px (320), 457px (360), 425px (390), 522px (768), já visível.
- A imagem tinha cerca de 481px de altura em 1440, texto sobreposto com 4 linhas grandes; a composição fazia a chamada principal da seção começar tarde.

## Melhoria implementada

- `src/components/affiliate-editorial-hero.tsx`: apenas **classes de apresentação para `lg`**: reduzir padding do hero desktop `lg:py-16 → lg:py-10`, ampliar largura do heading para `lg:max-w-[34rem]`, adicionar tipo fluido editorial `lg:text-[clamp(2.75rem,3.7vw,3.6rem)]`; reduzir espaço da descrição (`lg:mt-2`, `lg:leading-[1.55]`, texto-base responsivo), status (`lg:mt-3 lg:mb-0`) e botão (`lg:mt-2`). No mobile 320–768, as classes e dimensões originais continuam ativas.
- **Nenhuma alteração** em etiquetas do programa, comissão 8% sujeita a elegibilidade após aprovação, condições, estado de abertura, texto de privacidade, foto, links, CTA, formulário, métodos de envio, analytics, cadastro, RLS, servidor ou loja. A página continua com **exatamente 1 link CTA `href="#inscricao"` no hero**, sem duplicar botões.
- `src/test/affiliate-c109-first-fold-mobile.test.tsx`: atualiza apenas a asserção do padding desktop para o novo `lg:py-10`, preservando todas as demais verificações legadas de acessibilidade, informação verídica e CTA único.
- `src/test/affiliate-c123-desktop-first-fold.test.tsx`: novo teste específico que valida tipografia por breakpoint, composição, foto oficial, ordem original status→CTA, 1 CTA único, SSR, ausência de submissão/autorizações e texto correto nos cinco estados de disponibilidade.
- Este handoff `docs/VONIX-AFILIADAS-C123-PRIMEIRA-DOBRA-DESKTOP-20261123.md`.

## Resultados Chrome headless, viewport de 780px de altura

| Largura | CTA antes (top) | CTA depois (top) | Ganho |
|---|---:|---:|---:|
| 320 | 470px | 470px | 0px |
| 360 | 457px | 457px | 0px |
| 390 | 425px | 425px | 0px |
| 768 | 522px | 522px | 0px |
| 1024 | 840px | 728px | 112px |
| 1280 | 826px | 683px | 143px |
| 1440 | 843px | 683px | 160px |
| 1920 | 843px | 683px | 160px |

Real Chrome, somente GET/HEAD localhost; APIs e terceiros bloqueados, **8/8 PASS** antes e depois, sem POST, JS pageerror ou overflow. Todos os botões cabem **integralmente** na dobra desktop de 780px após a mudança. Screenshot 1440 inspecionada: foto real intacta, texto com maior equilíbrio e CTA da seção visível, sem truncamento. Evidências `qa-artifacts/c123-{before,after}-hero-8.json`, screenshots `qa-artifacts/c123-*-hero-8-{320,390,768,1440}.png`.

## Segurança, QA e publicação

- Focados: C123/C105/C109/C118/C102/recruitment **50/50 PASS em 6 arquivos**, `qa-artifacts/c123-focused.log`. A atualização da expectativa C109 reflete alteração explícita do padding desktop, sem excluir testes.
- Regressão integral **1.055/1.055 PASS em 147/147 arquivos**, 4 shards sequenciais S1 **320/37**, S2 **250/37**, S3 **227/37**, S4 **258/36**, todos exit0, `qa-artifacts/c123-shard-{1..4}.log` e `.exit.txt`.
- Scoped Prettier, ESLint, `git diff --check`: **PASS 0/0/0**, `qa-artifacts/c123-quality.exit.txt`. TypeScript local `qa-artifacts/c123-tsc.log`: exit2 **somente três TS2322 preexistentes em `src/routes/checkout.tsx`** linhas 1466–1468, nenhum C123; CI remoto C122 tinha 20 erros em cinco arquivos comerciais/testes de produto intocados.
- Checkpoint SOURCE_ONLY C123 incluirá exatamente **4 fontes** (componente, asserção C109, teste C123 novo, esta documentação), verificação hash por membro com reabertura do ZIP e SHA256 do ZIP; manter todos os checkpoints anteriores. Push apenas PR #279 DRAFT após confirmar base remota, sem publicar/merge/deploy. Produção **NOT_APPROVED** até o CI global e homologação do projeto compartilhado Lovable.
- A melhoria é **visibilidade mensurada de CTA**, não prova de aumento de inscrições, ganhos ou qualidade de candidatos.
