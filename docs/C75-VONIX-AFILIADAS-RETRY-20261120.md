# C75 ? status real da candidatura e recupera??o de disponibilidade

Data: 20/11/2026. Projeto exclusivo: Portal de Afiliadas Vonix Hair. Base GitHub/Lovable C74B main `acfd5ea2d76cd8087cbe9a9029b25ed13a522165`.

## Problema confirmado
Na p?gina p?blica, uma falha de GET do status era tratada como "inscri??es fechadas". Ao retornar o foco para a aba, um estado antigo OPEN permanecia enquanto a nova consulta estivesse pendente. O visitante podia perder confian?a, abandonar a candidatura ou tentar enviar com informa??o desatualizada.

## Corre??o
- O novo estado `unavailable` distingue falha de conex?o de `closed` confirmado e comunica que n?o equivale a encerramento do programa.
- "Verificar novamente" executa uma nova consulta, sem enviar candidatura nem expor dados pessoais.
- No foco/visibility, o estado volta imediatamente a `loading`, bloqueando novas tentativas de envio at? resposta v?lida.
- Rascunho j? montado permanece na aba, sem ser promovido de pr?via a envio real.
- Respostas antigas de consultas concorrentes n?o substituem o ?ltimo status conhecido.
- Tipos e hero p?blicos foram atualizados. Checkout, pre?os, frete, backend, inscri??es reais, autentica??o, Supabase e dados de candidatas permanecem intocados.

## Verifica??es locais
- Vitest 23/23 PASS em `affiliate-c75-status-retry.test.tsx`, `affiliate-c75-revalidation-guard.test.tsx` e `affiliate-recruitment-page.test.tsx`.
- TypeScript `--noEmit`: exit 0.
- Prettier escopado, ESLint escopado e `git diff --check`: exit 0 ap?s corre??o CRLF dos componentes.
- QA navegador visual C75 ainda n?o conclu?do: Lovable est? sem cr?ditos e outros Workloops usam o computador/disco. N?o confundir testes sint?ticos com valida??o do portal publicado.

## Guardas de publica??o
O c?digo principal e a vers?o de dom?nio s?o estados distintos. C63-C75 n?o ser?o publicados pelo deploy compartilhado do Lovable at? homologa??o independente dos PR250-252 comerciais do e-commerce (checkout/pre?os/frete), com smoke test sem cria??o de candidatura real.
