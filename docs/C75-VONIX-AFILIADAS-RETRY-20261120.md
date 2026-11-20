# C75 — status real da candidatura e recuperação de disponibilidade

Data: 20/11/2026. Projeto exclusivo: Portal de Afiliadas Vonix Hair. Base GitHub/Lovable C74B main `acfd5ea2d76cd8087cbe9a9029b25ed13a522165`.

## Problema confirmado
Na página pública, uma falha de GET do status era tratada como "inscrições fechadas". Ao retornar o foco para a aba, um estado antigo OPEN permanecia enquanto a nova consulta estivesse pendente. O visitante podia perder confiança, abandonar a candidatura ou tentar enviar com informação desatualizada.

## Correção
- O novo estado `unavailable` distingue falha de conexão de `closed` confirmado e comunica que não equivale a encerramento do programa.
- "Verificar novamente" executa uma nova consulta, sem enviar candidatura nem expor dados pessoais.
- No foco/visibility, o estado volta imediatamente a `loading`, bloqueando novas tentativas de envio até resposta válida.
- Rascunho já montado permanece na aba, sem ser promovido de prévia a envio real.
- Respostas antigas de consultas concorrentes não substituem o último status conhecido.
- Tipos e hero públicos foram atualizados. Checkout, preços, frete, backend, inscrições reais, autenticação, Supabase e dados de candidatas permanecem intocados.

## Verificações locais
- Vitest 23/23 PASS em `affiliate-c75-status-retry.test.tsx`, `affiliate-c75-revalidation-guard.test.tsx` e `affiliate-recruitment-page.test.tsx`.
- TypeScript `--noEmit`: exit 0.
- Prettier escopado, ESLint escopado e `git diff --check`: exit 0 após correção CRLF dos componentes.
- QA navegador visual C75 ainda não concluído: Lovable está sem créditos e outros Workloops usam o computador/disco. Não confundir testes sintéticos com validação do portal publicado.

## Guardas de publicação
O código principal e a versão de domínio são estados distintos. C63-C75 não serão publicados pelo deploy compartilhado do Lovable até homologação independente dos PR250-252 comerciais do e-commerce (checkout/preços/frete), com smoke test sem criação de candidatura real.
