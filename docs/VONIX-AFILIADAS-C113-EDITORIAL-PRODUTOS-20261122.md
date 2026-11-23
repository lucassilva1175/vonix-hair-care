# Vonix Hair — C113: roteiros editoriais com produtos oficiais (22/11/2026)

## Ponto de partida
- Portal de Afiliadas Vonix Hair exclusivamente: página `/seja-afiliada`, sem alterar o e-commerce.
- Clone isolado `C:\Users\JL\code\vonix-afiliadas-c111-20261122`; base C112 `313097b395c0fa38189c4b3a4f955516c69cffd8`; PR #279 mantido DRAFT.
- Lovable `Vonix Haircare Showcase` é projeto compartilhado com a loja; snapshot consultado `cfcfa79520df715e9a7cb2b52c8f21dc199093ad` anterior ao PR. Não houve edição direta ou publicação no Lovable.
- Referências editoriais consultadas: https://skence.com.br/pages/skence-creators (somente estrutura/ritmo); https://vonixhair.com/ ; https://vonixhair.com/loja (produtos originais). Não utilizar depoimentos, benefícios, imagens ou texto de terceiros.

## Evidência adicional de audiência (Lovable, leitura agregada)
Consulta somente leitura ao Analytics do projeto `Vonix Haircare Showcase`, período **01–22/11/2026 UTC**: `/seja-afiliada` apareceu com **190 visualizações de página**, ante **4.695 visualizações do projeto**. Na distribuição por dispositivo do projeto, foram reportados 1.778 registros mobile e 1.221 desktop; Instagram e Facebook aparecem entre as origens de acesso. Esses números são do **projeto inteiro**, não comprovam inscrições, conversão, aprovação ou tráfego do domínio externo em qualquer outra plataforma. Reforçam a prioridade de descoberta mobile, mas não permitem afirmar melhora percentual de conversão do C113.

## Problema e escolha
O portal já contém comissão, catálogo da marca, reviews reais de PRODUTOS, passos da inscrição, simulação opcional e guia de três estilos. Adicionar mais uma seção grande faria a candidata rolar ainda mais antes do formulário. C113 fortalece a experiência dentro da seção de estilos já existente (C111) sem aumentar o percurso inicial, inclusive em mobile.

## Entrega
- Novo arquivo `src/data/affiliate-creator-product-stories.ts` contém três produtos presentes em `src/data/products.json`, com arquivos WEBP/JPG oficiais já existentes na loja:
  - Rotina e comunidade: Kit Banana e Mel, `/produto/kit-banana-e-mel`.
  - UGC e criação: Máscara de Reparação Nutri Repair, `/produto/mascara-reparacao-nutri-repair`.
  - Conteúdo informativo: Kit Cronograma Capilar, `/produto/kit-cronograma-capilar`.
- Novo `src/components/affiliate-creator-product-story.tsx`: composição visual premium da embalagem oficial, headline contextual, plano de três cenas, link direto à descrição da loja e disclaimer de não-afiliadas.
- `affiliate-creator-spotlight.tsx` mantém seleção única e foco visível; ao selecionar estilo apresenta um plano correspondente sem rede, dados ou envio. A faixa de convite mobile ganhou miniaturas autênticas dos três produtos (decorativas, `aria-hidden`, `loading=lazy`); o conteúdo principal continua recolhido inicialmente.
- Evitou CTA duplicado: o atalho da candidatura já presente na seção continua sendo a ação principal. O novo conteúdo tem link informativo ao produto.
- `affiliate-c100-creator-spotlight.test.tsx` atualiza somente expectativa do link de produto adicionado. Novo teste C113 cobre três produtos/arquivos/rotas, seleção, troca, mobile e ausência de promessas.

## Limites comerciais e éticos
- Os produtos são fotografias e informações da loja, NÃO envio garantido, remuneração, comissão, renda, indicação ou depoimento de afiliadas participantes.
- A candidatura é gratuita e não exige compra de produtos; qualquer relação comercial só após análise/consentimento.
- Não usar fotografias de clientes/profissionais como se fossem afiliadas, não plagiar a referência Skence nem criar métricas ou parceiros fictícios.
- Sem POST, analytics novos, storage, alteração de regra de seleção, tokens, pagamento, preço, produto ou backend.

## Evidências e estado de liberação
- Vitest C113 focado definitivo: **28/28 PASS** (quatro arquivos: página de recrutamento, C100, C111 e C113, `qa-artifacts/c113-focused-final.log`). Regressão **integral 1017/1017 PASS, 137/137 arquivos PASS**, com quatro shards independentes (`c113-shard-1.log`: 312 testes, 35 arquivos; `c113-shard-2.log`: 236 testes, 34 arquivos; `c113-shard-3.log`: 217 testes, 34 arquivos; `c113-shard-4-r2.log`: 252 testes, 34 arquivos), todos exit 0. O quarto shard precisou de correção de `aria-hidden` nas miniaturas decorativas antes de ficar verde.
- Chromium headless local com requests GET/HEAD e APIs bloqueadas: 360, 390, 768 e 1440px, **4/4 PASS**; em todas as telas três imagens oficiais carregam, três links corretos, 3 cenas por perfil, nenhum POST/erro JS/overflow; `qa-artifacts/c113-browser-r2/report.json`.
- TypeScript local definitivo: `tsc --noEmit` exit 2 **apenas** pelos três diagnósticos TS2322 preexistentes de `src/routes/checkout.tsx` (1466–1468), idênticos ao C112; **nenhum novo erro no portal** (`qa-artifacts/c113-tsc-final.log`). Prettier e ESLint do escopo passaram; `git diff --check` sem erro. O GitHub Actions será verificado após o envio do PR.
- Como no C112, CI global do e-commerce já possui TypeScript pré-existente fora do escopo (20 diagnósticos em cinco arquivos no GitHub). Não mudar checkout ou produto apenas para liberar este PR.
- **Produção NÃO aprovada**. PR #279 permanecerá DRAFT; sem merge, deploy ou alteração do Lovable publicado.
