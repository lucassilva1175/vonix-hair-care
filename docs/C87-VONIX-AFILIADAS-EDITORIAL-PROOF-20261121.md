# C87 — Portal de Afiliadas Vonix: prova social editorial, sem evidência fabricada

## Origem e limites
- Continuação de C86R no PR #279, sem alterar checkout, catálogo, comissão, cadastro, Supabase, Auth ou dados pessoais.
- 4 avaliações reais existentes no arquivo src/data/reviews.json, exclusivamente sobre Botox Vonix: Mariana Andrade, Ayla Muniz e Fernanda Assis em vídeo (com pôsteres originais); Ana Paula em fotografia. Não são depoimentos de afiliadas nem compra verificada.
- Referência visual: hierarquia editorial da página Skence Creators. Não utilizar materiais, benefícios, comissão, depoimentos, estatísticas ou obras da Skence como fatos/ativos Vonix.

## C87 aplicado
- Reorganizar 4 cartões da vitrine pós-hero com mídia original em destaque acima da opinião escrita, formato editorial, sem cortar proporcionalmente vídeos retrato, paisagem ou foto quadrada (object-contain).
- Distintivo visível de vídeo/fotografia sem inserir player/MP4 perto do topo; apenas cartaz leve. Comentários permanecem integrais no DOM, com truncamento visual opcional, e link para a seção detalhada da mesma página.
- CTA de candidatura, navegação teclado, deslocamento horizontal mobile, nomes e textos autênticos inalterados. Rotulagem de que são opiniões de clientes sobre produtos, não afiliadas.
- Comparação de referência permitida apenas como inspiração de layout, sem copiar provas de parcerias.

## Verificação obrigatória
- Executar Vitest específico C87 e suíte de regressão, Prettier/ESLint, Chrome 360/390/768/1440, teste de media carregada, ausência de overflow e POSTs, sem download automático de MP4.
- **Bloqueio conhecido**: branch main está com 3 erros TypeScript TS2322 preexistentes nas linhas 1466–1468 de src/routes/checkout.tsx. Não contornar mudando código comercial dentro do escopo de afiliadas. Só realizar merge/publicação quando CI remoto 2/2 verde e homologação da loja compartilhada.

## Estado de entrega
- Documentar evidência de QA e link do PR. Commit em branch de proposta NÃO equivale a publicação no domínio compartilhado.
