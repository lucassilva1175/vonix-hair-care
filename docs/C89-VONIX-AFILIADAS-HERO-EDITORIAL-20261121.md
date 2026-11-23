# C89 — primeira dobra com foto capilar real e galeria pronta ao primeiro clique

## Motivo
A referência Skence Creators destaca rostos e cenas de criação; a primeira dobra anterior da Vonix Hair mostrava quase só embalagens. Um portal de recrutamento deve evocar o universo capilar, sem atribuir imagens comuns de catálogo a afiliadas reais.

## Implementação
- Dentro do hero já existente, exibir um cartão editorial com a fotografia de cabelos que já pertence ao acervo de categorias da loja (public/images/categorias/cachos.jpg), em um enquadramento responsivo.
- O texto identifica explicitamente a imagem como editorial da loja e esclarece que ela não retrata uma afiliada nem comprova parceria. Nenhuma imagem da Skence, profissional contratada ou influencer foi inserida.
- Manter exatamente os três links de produtos, CTA #inscricao, status real do cadastro e fontes/condições do programa.
- Corrigir a seta “próximos produtos” da galeria: agora começa desabilitada no HTML do servidor e é habilitada após a medição de largura e conexão dos handlers; evita o primeiro clique vazio antes da hidratação, preservando swipe/scroll/teclado e responsividade.
- Foto local de categoria 480x480, 38.632 bytes (não novo download de fonte externa).

## QA e isolamento
- Teste C89 para foto, dimensão/alt, rótulo factual, SSR com botão desabilitado, primeira navegação correta e preservação de 3 produtos/CTA.
- Executar Chrome 360/390/768/1440, verificar mídia carregada, seta inicial após hidratação, primeiro clique válido, overflow horizontal, imagens/performance, ausência de POST e erros JS.
- Vitest total, ESLint/Prettier e CI; nenhuma mudança no e-commerce, checkout, Auth, Supabase, armazenamento de candidaturas ou produção.
- PR #279 continua DRAFT até o checkout compartilhado receber reparo por fluxo independente, CI 2/2 verde e homologação comercial. Não publicar automaticamente.
