# C91 TURBO — Dúvidas da candidatura antes de conteúdo editorial extenso

## Objetivo
Continuidade exclusivamente no Portal de Afiliados Vonix Hair, PR #279, após C90. A referência Skence Creators foi usada como direção editorial, nunca como fonte de fotos, benefícios, resultados, métricas ou depoimentos atribuídos à Vonix.

## Problema objetivo de conversão
O fluxo anterior situava a seção de dúvidas *depois* da exploração editorial longa. Uma visitante que passou pelo formulário tinha de percorrer muitos pixels de conteúdo de marca para encontrar respostas simples sobre TikTok, gratuidade, seleção, pagamento ou acompanhamento.

### Antes (Chrome local C90, px na rota /seja-afiliada)
| Largura | Distância do FIM da seção #inscricao ao INÍCIO da #duvidas |
|---|---:|
| 360 | 12.007 px |
| 390 | 11.809 px |
| 768 | 14.513 px |
| 1440 | 9.918 px |

## Mudança C91
- Ordem do conteúdo público após a seção #inscricao: AffiliateNextSteps -> AffiliateLandingFAQ -> guia de exploração editorial -> AffiliateLandingDiscovery.
- FAQ mantém sete perguntas, busca local por texto, sem envio dos termos ao servidor. Os tópicos originais da candidatura e política de privacidade não foram editados.
- Guia compacto tem três âncoras existentes: #avaliacoes-produtos (depoimentos de clientes sobre PRODUTOS), #catalogo-em-video (material editorial do catálogo) e #perfis (formatos/ideias de criação). Rótulos não apresentam as avaliações como prova social de afiliadas.
- Nenhuma mudança nas condições comerciais, cálculo de comissões, status real da candidatura, coleta/envio de dados, servidor, checkout, frete, Supabase, Auth, loja ou mídia.
- Não há promessa de melhora de taxa de conversão. A redução de distância vertical é mensurável, a taxa de inscrição não foi apurada.

## Verificação
- C91 tests: sequência DOM, 7 perguntas no FAQ, busca local, âncoras únicas, distinção de avaliações de clientes, nenhum formulário extra ou benefícios inventados.
- Vitest completo, Prettier/ESLint, Chrome em 360/390/768/1440 px com cálculo de distância antes/depois, clique e pesquisa de FAQ, âncoras e ausência de erros/redes POST/overflow.
- GitHub CI 2/2 obrigatório para merge. Três erros TS2322 preexistentes em src/routes/checkout.tsx (1466–1468), fora do escopo da equipe de afiliadas, deixam o PR em DRAFT sem publicar até correção independente.
