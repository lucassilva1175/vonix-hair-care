# C90 TURBO — simplificação de conversão da landing Vonix Afiliadas

## Objetivo e análise
Versão base C89, PR #279, branch feat/afiliadas-c86-prova-social-foto-20261121. Modelo de organização editorial: Skence Creators, porém sem copiar seu conteúdo, imagens, benefícios, comissões, declarações ou depoimentos.

Analytics Lovable, 2026-11-01 a 2026-11-21: /seja-afiliada acumulou 188 pageviews. Não há evidência de candidaturas concluídas ou conversão a partir dessa métrica. Site inteiro reportou 4269 pageviews, 2671 visitors. O objetivo não é afirmar melhora de taxa antes de dados.

### Baseline medido no Chromium local C89
| Largura | Altura total | 2ª galeria repetida | 2º módulo de etapas | Nº total de IMG |
| 360 | 21818px | 1879px | 1301px | 34 |
| 390 | 21379px | 1950px | 1255px | 34 |
| 768 | 23963px | 1034px | 1062px | 34 |
| 1440 | 17765px | 1114px | 831px | 34 |

### Mudança C90
1. AffiliateCreatorOpportunity agora é um convite editorial compacto, com duas ações verificáveis (catálogo /loja e candidatura #inscricao). Retirou galeria duplicada com os mesmos 3 packshots oficiais que o hero e outros módulos já apresentam; não houve perda dos links para as páginas de produtos disponíveis no hero.
2. A segunda seção #como-funciona vira resumo conciso de três momentos com link ao passo-a-passo ilustrado #candidatura-etapas, que já aparece **antes** do formulário. Preserva os headings: Três momentos, Apresente seu perfil, Análise individual, Próximos passos; mantém CTA para a disponibilidade real sem prometer envio, aprovação ou benefícios.
3. Nenhuma lógica de cadastro, status, comissões, bônus, FAQ, vídeos ou avaliações foi modificada. Nada de dados pessoais, APIs, pagamentos, banco, e-commerce ou Lovable compartilhada.
4. Regressões existentes para o segundo catálogo atualizadas para exigir zero imagens duplicadas, com novo teste C90 para CTA, âncoras, semântica e condições verdadeiras.

### Gates
- Vitest focado e completo, Prettier/ESLint, Chrome 360/390/768/1440, comparativo da altura real, sem POST, sem MP4 automático, sem overflow horizontal ou erro JavaScript.
- CI global de PR exige 2/2; três TypeScript TS2322 preexistentes no checkout da loja não podem ser alterados no projeto de afiliadas. Se falhar, manter PR OPEN DRAFT, sem merge, Lovable update ou publicação.
