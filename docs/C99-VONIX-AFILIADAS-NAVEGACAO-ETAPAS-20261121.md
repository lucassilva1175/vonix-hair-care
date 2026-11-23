# C99 — Navegação explícita do guia de candidatura (21/11/2026)

## Escopo e origem
- Exclusivamente o Portal de Afiliadas Vonix Hair; não inclui o e-commerce, checkout, frete, preços, pagamentos, banco, Auth ou submissões reais.
- Base: PR #279 `feat/afiliadas-c86-prova-social-foto-20261121`, C98 SHA `c93cf739036c2c9c44fde7d54d76e82c4c53a155`, branch isolada para execução.
- Lovable e produção não foram publicados por este ciclo. A referência Skence Creators foi usada somente para hierarquia editorial, sem imagens, depoimentos, comissões ou alegações importadas.

## Alteração funcional
- `src/components/affiliate-application-steps-preview.tsx`: controles anteriores/próximos com alvo 44×44 CSS px visíveis apenas abaixo do breakpoint `lg`; indicação `N de 3` com aria-live, aria-controls consistente e disabled nos limites de rolagem.
- Estado sincronizado com scroll real (inclusive gesto horizontal), resize e ResizeObserver, reduzindo animação para usuários com `prefers-reduced-motion`. Em desktop, as três etapas continuam expostas na grade.
- Guia mantém os três textos completos, imagens oficiais de produtos, condição de TikTok opcional e aviso de ausência de garantias. Espaçamento da seção ajustado apenas em mobile (`py-6`) para minimizar o deslocamento do formulário.
- `src/test/affiliate-c99-steps-navigation.test.tsx`: 5 novos testes para navegação, limites, gesto manual, redução de movimento, SSR, sem overflow/sem envio e conteúdo original.

## Evidências verificadas
- Vitest focado C99+C98: **14/14 PASS**; lint afetado: **0 erros**; Prettier dos arquivos alterados: **PASS**.
- Bateria integral final **após** o ajuste de espaçamento: **935/935 PASS**, 123 arquivos, execução encerrada com sucesso (42,18 s); log local `c99-final-vitest.log`.
- TypeScript após correção dos erros novos C99: apenas **3 erros anteriores** no arquivo `src/routes/checkout.tsx`, linhas 1466–1468 (`TS2322`). Nenhum erro TypeScript presente nos arquivos C99.
- Chrome real 360, 390, 768 e 1440 px: **4/4 PASS** com hidratação concluída. Botões testados, indicador acompanha clique e rolagem; nenhuma requisição POST, nenhum `pageerror`, nenhum overflow horizontal. No desktop, as setas são ocultas e as três etapas seguem visíveis.
- Posição medida de `#inscricao` (C98 → C99): 360px **2083→2098 (+15px)**; 390px **2011→2026 (+15px)**; 768px **2301→2305 (+4px)**; 1440px **2051→2043 (−8px)**. Mudança modesta e explicitamente medida; não há prova de aumento de conversão.
- Verificação local: `browser-artifacts-c99/c99-browser-report.json` e capturas `c99-steps-*.png`; execução `browser-c99-qa.mjs`. Esses artefatos locais de QA não precisam ser enviados ao site.

## Limitações e liberação
- A página pública `https://vonixhair.com/seja-afiliada` usa a versão publicada anterior enquanto PR #279 permanecer como rascunho; não confundir código de PR com produção.
- Não fabricar provas sociais de afiliadas; avaliações públicas de **produtos** não são depoimentos de afiliadas. Requer fotos/vídeos/depoimentos reais com autorização explícita antes de publicar seção específica de criadoras.
- Liberação depende da correção do TypeScript de checkout em fluxo separado de e-commerce, CI completo aprovado, revisão responsável do PR, homologação de inscrição/consulta com acesso autorizado e aprovação de publicação.
- Nenhuma inscrição real, mudança administrativa, pagamento, integração externa, merge ou deploy foram executados neste ciclo.
