# C60 — Vonix Afiliadas: prova pública antecipada e navegação editorial

Data local: 18/11/2026. Escopo exclusivo: Sistema de Afiliadas Vonix Hair. Não alterar e-commerce.
Base auditada: merge C59 main f3abfdcb4a95837bfe5331e54ea77d32f1df0473.
Worktree isolada: C:\Users\JL\code\vonix-afiliadas-c60-prova-20261118.

## Evidências de referência
- Página oficial https://vonixhair.com/produto/botox-vonix lista avaliação do produto Botox Vonix de Fernanda Assis (setembro), Ayla Muniz (agosto), Mariana Andrade (julho); a referência mostra comentários públicos de clientes, não casos do programa de afiliadas.
- https://vonixhair.com/seja-afiliada mantinha o bloco de comentários dentro da galeria de produtos após muitas seções, distante da apresentação da marca.
- https://skence.com.br/pages/skence-creators: referência editorial de ritmo/benefícios e prova real, SEM copiar fotos, depoimentos, métricas, 15%/21%, brindes, comunidades ou vantagens não comprovadas.
- Estudo visual de Isla Beauty apenas para ritmo de fotografia, creme e tipografia, mantendo identidade vinho/rosé da Vonix.

## Código C60
- src/components/affiliate-product-proof.tsx: novo bloco editorial próximo da abertura, foto oficial Botox Vonix, três avaliações atribuídas a clientes e hiperlink à loja. Evidência comercial de produto, não prova de parcerias ou ganhos.
- src/components/affiliate-creator-opportunity.tsx: bloco antigo de avaliações retirado, galeria original preservada; não há depoimentos duplicados.
- src/components/affiliate-landing.tsx: ordem hero -> confiança da marca -> prova de produto -> ganhos, mantendo seções seguintes.
- src/components/affiliate-shell.tsx: navegação mobile com faixa de links acessível e rolável, atalhos ganhos/como funciona/avaliações/dúvidas/status; desktop expõe avaliações no lugar de Inspirações.
- src/test/affiliate-c60-proof-navigation.test.tsx: 4 testes novos de ordem, atribuição, duplicação, links, navegação.

## Qualidade
- 758/758 testes completos PASS, 81 arquivos.
- 13/13 testes direcionados C60/C53/C58 PASS.
- TypeScript --noEmit exit 0 após ajustar o teste readonly tuples; ESLint e Prettier dos arquivos alterados exit 0, build Vite/Nitro exit 0, git diff --check exit 0.
- Chrome headless local 360x780, 390x844, 768x1024, 1440x900: 4/4 PASS, HTTP 200, foto carregada, três avaliações, revisão de ordem DOM, navegação e âncora funcional abaixo do cabeçalho fixo (135, 136, 160, 160px), ausência de overflow/JS errors, zero POST de candidatura.
- Logs e screenshots locais C60-browser-final.log e C60-local-shots; excluir do PR.

## Limitações
- Ainda não existem relatos autorizados de afiliadas e métricas de aquisição/conversão de recrutamento; não fabricar depoimentos, fotos de criadoras, indicadores de ganhos, pagamentos ou aprovação.
- Nunca foram lidos os registros de candidatas, senhas ou arquivos .env, e nenhuma área do e-commerce, banco, pagamentos, sistema administrativo ou autorização foi alterada.
- Não foi medida variação de taxa de conversão. Validação de produção apenas após merge, Lovable, deployment e Chrome no domínio oficial.
