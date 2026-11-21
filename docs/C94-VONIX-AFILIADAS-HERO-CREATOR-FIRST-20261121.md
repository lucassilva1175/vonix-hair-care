# C94 TURBO — primeira impressão Vonix com fotografia capilar protagonista

## Baseline em 21/11/2026
Portal exclusivo de Afiliadas Vonix Hair, PR #279 DRAFT, baseado no C93, site Lovable ainda no commit 68422d2b8cdc371d8d953168c0fbdbbf4274e955. Site publicado /seja-afiliada apresenta inscrições em preparação (não há confirmação de envio de novas candidaturas). Lovable analytics novembro 1–21: 188 visualizações da página; NÃO é número de inscritas, leads ou taxa de conversão.

A referência Skence Creators usa grandes fotos de pessoas em contexto de skincare e benefícios exclusivos Skence. Não temos autorização/garantia para representar pessoas do acervo Vonix como afiliadas aprovadas nem copiar as condições Skence; o C94 utiliza somente a foto editorial /images/categorias/cachos.jpg já pertencente ao acervo Vonix.

Chrome C93 pré-C94, rota /seja-afiliada:
- 360px: foto editorial 326 × 133px; CTA de inscrição começa Y440px, status real começa Y710px (270px abaixo do CTA).
- 390px: foto 356 × 114px; CTA Y416, status Y686.
- 768px: foto 540 × 179px; CTA Y471, status Y680.
- 1440px: foto 594 × 174px; CTA Y669, status Y878.
Métricas verificáveis em c94-before-hero.json.

## Mudanças
- A faixa horizontal de foto de cabelos do catálogo virou painel editorial amplo, mobile-first, com degradê e título original "Movimento, textura e cuidado.". Imagem 480×480 oficial Cachos, carregamento prioritário; texto alternativo e legenda deixam claro que não é afiliada e não prova resultado nem parceria. Sem ativos da Skence ou prova social fabricada.
- O status verdadeiro de inscrições passou para ANTES do CTA em todos os estados (open, loading, limited, closed, unavailable), conforme resposta do servidor. O botão continua indo à seção #inscricao; não ativa candidaturas indisponíveis.
- Preservados links oficiais dos três produtos, carrossel mobile, CTA do catálogo, acesso às avaliações reais de produtos, comissão de 8% após aprovação, inscrição gratuita e explicações de seleção.
- Alterados exclusivamente src/components/affiliate-editorial-hero.tsx, novo teste src/test/affiliate-c94-editorial-intake.test.tsx e este documento. Sem e-commerce, checkout, Supabase, Auth, dados pessoais, pagamentos ou armazenamento.

## QA e publicação
- Testes C94 e anteriores C54/C61/C73/C83/C89 para origem da imagem, HTML inicial, estado antes CTA, links e carrossel.
- Chrome 360/390/768/1440: tamanho foto/status/CTA, três produtos, sem JS errors, POST, autoplay ou overflow horizontal.
- Vitest completo, Prettier/ESLint, GitHub Actions HEAD exato.
- PR #279 DRAFT, sem publicar Lovable nem mesclar até CI geral 2/2 verde. Os três TS2322 preexistentes em src/routes/checkout.tsx (1466–1468) são do e-commerce compartilhado, fora deste portal; não corrigir neste escopo.
