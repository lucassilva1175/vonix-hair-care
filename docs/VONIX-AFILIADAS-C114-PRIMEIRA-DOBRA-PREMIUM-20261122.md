# C114 — Portal Vonix: condições premium legíveis na primeira dobra

**Data:** 22/11/2026 · **Escopo:** somente Portal de Afiliadas Vonix Hair.

## Base real

- Clone isolado: `C:\Users\JL\code\vonix-afiliadas-c111-20261122`, branch `feat/afiliadas-c86-prova-social-foto-20261121`, HEAD C113 `80fc2a9b7dd12f879fd01788ceeb963514be4fdc`.
- PR #279: https://github.com/lucassilva1175/vonix-hair-care/pull/279 (DRAFT, sem merge).
- Lovable Vonix Haircare Showcase: snapshot `cfcfa79520df715e9a7cb2b52c8f21dc199093ad`, compartilhado com o e-commerce e anterior ao PR. Nenhuma edição/publicação no Lovable.
- Fontes: https://vonixhair.com/seja-afiliada e https://vonixhair.com/loja. Inspiração estrutural https://skence.com.br/pages/skence-creators. Não copiar comissão, fotos, benefícios, creators nem provas sociais de terceiros.

## Diagnóstico

A antiga faixa de benefícios forçava três colunas em telas de 320–390 px, comprimindo a comissão, o bônus e a supervisão no mesmo nível de destaque. Isso prejudicava legibilidade e podia dar peso visual excessivo a ganhos condicionais.

## Implementação

- `src/components/affiliate-early-value-band.tsx`: cards responsivos em **duas colunas no mobile**, com comissão principal **8%** ocupando a largura das duas. Bônus **+ R$ 500 por R$ 10 mil vendidos** e supervisão possível **4% em média na equipe** aparecem em dois cartões menores, expressamente condicionais a metas, elegibilidade e avaliação. Em desktop, três cartões equilibrados.
- Camada visual premium com gradiente vinho/rosé, tipografia editorial, contraste, símbolos acessíveis e sem imagens externas.
- Mantidos: inscrição gratuita, seleção individual, idade mínima 18, TikTok opcional, não obrigatoriedade de compra, aviso de ausência de ganhos garantidos e link único às regras `#ganhos`.
- Nenhum formulário, dado pessoal, POST, valor comercial, backend, checkout, rede, autenticação, Lovable ou e-commerce modificado.
- Novo teste `src/test/affiliate-c114-premium-benefits.test.tsx` valida hierarquia, grid responsivo, acessibilidade básica, não criação de formulários e ausência de promessas inventadas.

## Validações

- Testes focados C102/C109/C114/página: **31/31 PASS** (`qa-artifacts/c114-focused.log`).
- Chrome GET-only 320, 360, 390, 768 e 1440 px: **5/5 PASS**, com comprovação geométrica de duas colunas mobile, três desktop, termos e links corretos, sem POST/erros JS/overflow (`qa-artifacts/c114-browser/report.json`, capturas por largura).
- Regressão integral: **1.020/1.020 PASS em 138/138 arquivos**. Shards independentes (`qa-artifacts/c114-shard-{1..4}.log`, todos exit 0): 312 em 35 arquivos; 251 em 35; 205 em 34; 252 em 34. Sem falhas ou skips reportados. O TypeScript global e o CI GitHub são tratados separadamente no recibo final para não mascarar erros preexistentes.
- Produção **NOT_APPROVED** sem homologação, ainda que os testes locais passem. Sem merge/deploy. A ausência de depoimentos de afiliadas reais continua sendo uma lacuna comercial a ser suprida somente mediante autorização e comprovação.
