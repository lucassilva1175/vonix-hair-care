# C96 TURBO — conteúdo editorial opcional, inscrição mais direta

## Origem e decisão
Portal de Afiliadas Vonix Hair, PR #279 DRAFT. Continuação exclusiva do C95, sem alterar e-commerce nem checkout. Lovable/main público ainda no commit 68422d2b8cdc371d8d953168c0fbdbbf4274e955.

O C95 já havia corrigido o contraste do hero e a navegação mobile, mas o Chrome mostrou que após inscrição + FAQ a página continha 8.400 px de conteúdo complementar em 360px (fotos e vídeos do catálogo, quatro avaliações completas de clientes sobre produtos, exemplos de criação, critérios e perfis). Tudo era exibido automaticamente, tornando a página inicial de 17.541 px muito longa para uma candidatura.

## C96
- Novo componente AffiliateDiscoveryGate, com elemento HTML nativo details: recolhido inicialmente, mas com summary premium de fácil acesso, duas fotografias editoriais originais da loja e explicação transparente de que os comentários são de CLIENTES sobre PRODUTOS, não afiliadas comprovadas.
- A rota /seja-afiliada envolve apenas AffiliateLandingDiscovery, **após formulário, próximos passos, FAQ e atalhos C91**. Nenhuma etapa de inscrição, disponibilidade, campos de candidatos, confirmações, armazenamento ou backend mudou.
- Toda a extensão original continua presente no DOM e acessível sob demanda: quatro avaliações completas (3 vídeos + 1 foto), vídeos de produto, fotos de catálogo, critérios, perfis e ideias de roteiro. Omitir da primeira visualização NÃO é excluir materiais nem fabricar depoimentos.
- Links internos de dentro/fora da área (incluindo #avaliacoes-produtos, #catalogo-em-video, #criterios, #perfis, #formatos) abrem a área automaticamente antes da navegação, inclusive clicando o mesmo link após recolher, hashchange e acesso direto por URL. O summary é nativo, compatível com teclado e SSR.
- Testes C96 cobrem documento inicial, opção de expandir/recolher, reabertura por links/mesma hash, deep links, atribuição verdadeira e ausência de POST/fetch. Contrato antigo de marketing foi ajustado para expandir antes de buscar cabeçalhos ocultos e para reconhecer imagens decorativas de fonte oficial com alt vazio.

## Medições Chrome da página total (C95 → C96, descoberta recolhida)
| Tela | C95 | C96 | Diferença |
|---|---:|---:|---:|
| 360 px | 17.541 px | 9.576 px | -7.965 px (-45,4%) |
| 390 px | 17.040 px | 9.271 px | -7.769 px (-45,6%) |
| 768 px | 19.157 px | 9.798 px | -9.359 px (-48,9%) |
| 1440 px | 14.341 px | 7.760 px | -6.581 px (-45,9%) |

Esses números são dimensões de layout e não significam crescimento de candidaturas, retenção ou conversão.

## Segurança e publicação
- Apenas código da landing de afiliadas, novo gate, testes C96 e este documento. Código do checkout, e-commerce, Supabase, Auth, pagamentos e PII permanecem intocados. Nenhum formulário real foi submetido em QA.
- Realizar Chrome 360/390/768/1440 com screenshots e relatório, 4/4 testes C96 mais contratos anteriores, Vitest completo, Prettier/ESLint e CI final HEAD. Sem reprodução MP4 automática, POST ou JavaScript errors.
- PR #279 continua OPEN DRAFT. Sem merge/deploy nem alteração de main/Lovable até correção independente dos três TS2322 preexistentes no checkout compartilhado (1466–1468), CI 2/2 verde e autorização.
- Fotos são acervo oficial Vonix. A referência Skence Creators foi usada apenas para UX e hierarquia, sem copiar fotos de creators, depoimentos ou percentuais exclusivos.
