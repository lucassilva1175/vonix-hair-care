# C124 — Funil seguro e leve para candidatas | Vonix Hair Afiliadas

Data: 23/11/2026 BRT. **Escopo EXCLUSIVO: Portal de Afiliadas Vonix Hair.**

## Continuidade e referência
- Base verificada: C123 `a81c3a21dfe8f681c4ee95531e70566cc89535ca`, branch `feat/afiliadas-c86-prova-social-foto-20261121`, PR [#279](https://github.com/lucassilva1175/vonix-hair-care/pull/279) **OPEN/DRAFT**, sem merge ou publicação.
- Identidade e mídias: https://vonixhair.com/seja-afiliada e https://vonixhair.com/loja. Inspiração apenas de hierarquia/ritmo editorial de https://skence.com.br/pages/skence-creators. **Nenhum relato fictício, imagem, porcentagem, comissão ou benefício da Skence importado**.
- A Lovable `Vonix Haircare Showcase` ID `203d2f84-1058-4ca4-acc3-41a4a5d4e2b5` é compartilhada com o e-commerce e o main avançou independentemente para `44fa64456cc751a243c28293d0be0abbbd94d048`. Não sincronizar/sobrescrever a Lovable main sem homologação da loja.

## Problemas encontrados, mudanças concretas
1. **GET de disponibilidade que nunca termina**: `src/routes/seja-afiliada.tsx` passa a limitar a espera de UI a **10 segundos** com `Promise.race`, limpeza de timers e barreiras contra respostas antigas. Erro/timeout resulta em `unavailable`, com opção "Verificar novamente". Mesmo que uma resposta OPEN chegue depois do timeout, ela **não** desbloqueia formulário. Prévia sem envio e rascunho local permanecem protegidos.
2. **Atalho mobile quando status ainda carrega**: `src/components/affiliate-mobile-apply-bar.tsx` pode exibir "Consultando disponibilidade" e "Ver prévia segura" depois que hero e área do formulário saíram de vista. É somente âncora `#inscricao`; não declara inscrições abertas ou executa POST. Oculta-se enquanto hero/form estão visíveis e não cria barra quando IntersectionObserver/targets faltam.
3. **Imagens secundárias concorrendo com foto principal**: `src/components/affiliate-editorial-hero.tsx` mantém fotografia editorial real com `loading=eager`/`fetchpriority=high`, mas as três fotos do catálogo, incluindo a primeira atrás de `<details>` no celular, agora usam `loading=lazy`/`fetchpriority=low`. Mesmas fotos/produtos/links e disclaimers, sem mudanças na comissão.
4. **Teste negativo novo**: `affiliate-c124-status-timeout.test.tsx` reproduz espera 9999/10000ms, indisponibilidade, retry, resultado tardio e prévia não enviável; `affiliate-c124-hero-priority.test.tsx` fixa a prioridade da imagem principal e catálogo. Três expectativas legadas C61/C73/C76 foram atualizadas **apenas** onde o comportamento mudou, reforçando foto editorial prioritária, sem eliminar testes.

## Evidências e limitações
- **Vitest 1.059/1.059 PASS em 149/149 arquivos**: shards 1=321/38, 2=250/37, 3=227/37, 4=261/37; todos exit=0. O shard1 exibiu um timeout do teste C75 na primeira tentativa sob execução paralela; C75 isolado passou **4/4** e shard1 passou **321/321** ao ser reexecutado com `--testTimeout=15000`; não foi alterada lógica de loja/teste C75. Logs individuais `qa-artifacts/c124-shard-*.log`.
- Testes focados C124/C122/C76 **12/12 PASS em 4 arquivos**, em `qa-artifacts`.
- **Chrome real 8/8 PASS** em 320/360/390/768/1024/1280/1440/1920 com altura 780: CTA do hero visível em todas as dimensões; imagem principal prioritária, imagens de catálogo lazy/low; sem POST, JS pageerror, overflow ou conexão externa permitida. Scripts, JSON e screenshots C124 em `qa-artifacts`.
- Prettier, ESLint escopados e `git diff --check` **PASS**. TypeScript local ainda `exit=2` em **três erros TS2322 existentes** em `src/routes/checkout.tsx` linhas 1466–1468; **nenhum erro nos arquivos C124**. Checkout, autenticação, banco, preços, pagamentos, Supabase, analytics e APIs de envio não foram modificados.
- Mudança de renderização e capacidade de navegação **não prova crescimento de cadastros nem ganho em Core Web Vitals sem medições de tráfego real**. Site em produção só depois de revisão da branch, integração segura com main Lovable e QA de homologação. **Produção NOT_APPROVED** por enquanto.

## Próxima etapa comercial, após sincronização controlada
- Usar imagens/prova social de afiliadas **somente com autorização explícita e experiências reais verificadas**.
- Medir visitas à página, cliques no `#inscricao`, início da inscrição, erros de validação, abandono e envio confirmado, respeitando consentimento e sem duplicar eventos; desenhar um funil antes de prometer conversão.
- Revisar a experiência real da candidata em staging que reflita o main do e-commerce; não ativar pagamentos nem candidaturas reais para testes.

Este checkpoint é SOURCE_ONLY e cumulativo por progresso, preservando C123 e todos os anteriores sem sobrescritas.
