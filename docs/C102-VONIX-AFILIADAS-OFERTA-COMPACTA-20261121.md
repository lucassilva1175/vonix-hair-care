# C102 — Oferta comercial compacta antes da candidatura

Data: 2026-11-21, continuidade exclusiva do Portal de Afiliadas Vonix Hair.
Base: C101 `3dcdd4aea16b5694c9a5f3b0aebe2855bf768cdc` na branch do PR Draft #279 `feat/afiliadas-c86-prova-social-foto-20261121`.

## Evidência e referência
- Fonte oficial de condições comerciais: https://vonixhair.com/seja-afiliada (8% sobre venda confirmada; R$ 500 a cada R$ 10 mil vendidos; possibilidade de supervisora com média de 4% das vendas da equipe, após metas).
- Condições para candidatar-se: gratuita, seleção individual, 18+, TikTok opcional, sem compra obrigatória. Nenhuma renda/benefício/parceria é concedida pelo mero cadastro.
- Fonte de marca e conteúdo: projeto Lovable Vonix Haircare Showcase (ID `203d2f84-1058-4ca4-acc3-41a4a5d4e2b5`), materiais existentes no catálogo local e na branch do PR; comparação com Skence Creators apenas como design, sem importar ofertas, fotos ou endossos da Skence.
- Analytics observados no Lovable (7–22 nov UTC): 1.438 sessões/visitas registradas como mobile e 955 desktop; 189 visualizações da rota `/seja-afiliada`. São métricas do site publicado, NÃO conversões de candidatas e NÃO testes do PR ainda não publicado.

## Decisão de UX
A proposta comercial estava presente no bloco detalhado de ganhos depois do formulário, mas a faixa inicial enfatizava apenas elegibilidade. Uma faixa mais curta no mesmo espaço pode explicar melhor a oportunidade sem adicionar outra seção ao longo da página.

## Entrega
- Substituído o bloco `affiliate-c61-eligibility-facts` por `AffiliateEarlyValueBand`, mantendo o contrato de teste e sua posição logo abaixo do hero.
- Três números claros e condicionados: **8%** por venda confirmada; **R$ 500** a cada R$ 10 mil vendidos, sujeito às regras; **4% em média** como possibilidade de supervisão após metas e avaliação da equipe.
- Fatos essenciais continuam visíveis: candidatura gratuita, seleção individual, maiores de 18 anos, TikTok opcional e nenhuma compra obrigatória para se inscrever.
- Link para o detalhamento `#ganhos`; CTA original `#inscricao`, formulário, acesso ao status, prova social autêntica de clientes e guia de criadoras mantidos sem alteração.
- Contrato novo `src/test/affiliate-c102-early-offer.test.tsx`, cinco testes verificando condições, fonte no código, links, SSR, ausência de falso endosso, rede/formulário.

## Qualidade e liberação
- Focado: 25/25 PASS em C102/C61 e teste integral de rota; Prettier/ESLint no escopo PASS.
- **Vitest integral 948/948 PASS em 126/126 arquivos** (baixo paralelismo, exit 0) e focado **25/25 PASS em 3 suítes**; Prettier e ESLint escopados PASS, sem erros/avisos.
- **Chrome headless 4/4 PASS** em 360/390/768/1440, HTTP 200, 3 valores do programa, link para #ganhos, 3 caminhos de criadoras e avaliações de produto funcionando, sem POST/external, JS errors ou overflow. Altura final da faixa de benefícios: **276/261/243/226 px**. Aumento de percurso até formulário relativo ao C101: **207/192/190/173 px** (com CTA direto preservado); qualidade verificada em `qa-artifacts/c102-browser-r4.log`, `qa-artifacts/c102-browser/report.json` e capturas locais não versionadas.
- O protótipo inicial de 377 px em 360 foi rejeitado antes do commit; a faixa final foi compactada para 276 px sem esconder condições.
- Gate de publicação mantém **RELEASE_BLOCKED**. Histórico do CI em C101 tinha 7 TS4111 em `src/lib/boleto.ts` e 3 TS2322 em `src/routes/checkout.tsx`, inteiramente fora do portal. A correção depende de fluxo separado do e-commerce. Não fazer merge/deploy nem mutações reais de candidatura sem homologação autorizada.
- Provas sociais de afiliadas verdadeiras dependem de registros legítimos e autorização explícita para uso de depoimentos; avaliações de produtos já presentes não podem ser identificadas como resultados do programa.
