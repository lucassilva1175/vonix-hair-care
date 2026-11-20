# C82 — Navegação acessível de avaliações reais de produtos Vonix Hair

20/11/2026. Continuidade exclusiva do portal de afiliadas após C81 `98a500784b97b6ddd933ce019c245ef2468c9a23`.

## Fontes, referência e limites

A página `/seja-afiliada` já apresenta, **antes** das condições de ganhos e do formulário, três avaliações em vídeo vinculadas ao produto Botox Vonix e derivadas de `src/data/reviews.json`: Mariana Andrade, Ayla Muniz e Fernanda Assis. Citações, poster e nome são resolvidos da mesma fonte de produto; não há relatórios ou provas de ganhos de creators. O modelo externo Skence Creators é somente inspiração editorial, sem copiar depoimentos, fotos, cupons, ofertas, remuneração ou números. A Vonix não deve afirmar que clientes são afiliadas.

## Mudança

- `src/components/affiliate-verified-review-preview.tsx` mantém três cartões de avaliações de produtos, os avisos de que **não são depoimentos de afiliadas**, links ao catálogo oficial, aos vídeos completos e à inscrição. Não adiciona mídia autoplay, estrelas fictícias, pessoas ou alegações de compra verificada.
- Novo grupo de controles **Anterior / Próximo** com nomes acessíveis, foco visível, altura 44 px, estado disabled real medido da geometria do trilho e atualização ao rolar manualmente. Apenas em telas menores do que `md`; em desktop mantém a grade de três itens e omite os controles por CSS.
- O trilho mantém scroll touch e teclado nativos. A distância de rolagem corresponde à largura real de cartão + gap; observa `ResizeObserver` no trilho e nos cartões, além de resize e load, para detectar dimensionamento responsivo mesmo depois da hidratação. O botão Próximo inicia habilitado em mobile para não ficar inutilizável até a primeira medição; o estado é corrigido na medida efetiva.
- Novo teste `src/test/affiliate-c82-real-review-controls.test.tsx` cobre fonte oficial, três autores, ausência de mídia/POST, estados dos botões com overflow real e sem overflow, limites de rolagem, links seguros.

## QA

- Vitest dirigido C65 + C78 + C82: **12/12 testes PASS** em 3 arquivos.
- Chrome real via `C82-browser-qa.cjs` em 360x780, 390x844, 768x1024, 1440x900: `C82_CHROME PASS failures=0`. Em celular, botões começam corretamente, avançam até o limite, desabilitam Próximo e permitem retorno. Desktop mostra grade com controles ocultos. Zero overflow no documento, zero JS errors, zero imagens 404, zero POST e nenhuma reprodução de vídeo.
- Primeira verificação detectou as setas desativadas antes do CSS completar o dimensionamento. Ajustada medição observando cartões responsivos, evento load/resize e estado inicial móvel; a segunda verificação em quatro larguras passou.
- Prettier, ESLint, TypeScript `noEmit`, `git diff --check`: saída 0 na máquina local.

## Segurança e publicação

Nenhum código de cadastro, Auth, Supabase, PII, banco, checkout, preços, frete ou descontos foi alterado. Não houve candidaturas, pagamentos, mensagens, conversões, sessões reais, nem coleta de dados. GitHub e Lovable podem sincronizar sem que o bundle em `vonixhair.com` seja atualizado. Publicação do projeto compartilhado permanece bloqueada até homologação independente das mudanças comerciais do e-commerce.
