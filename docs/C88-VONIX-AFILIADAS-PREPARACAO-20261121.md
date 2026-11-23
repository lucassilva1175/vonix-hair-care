# C88 — Checklist local de preparação para a candidatura Vonix Hair

## Escopo
Continuação do PR #279, apenas no Portal de Afiliados Vonix Hair. Referência Skence Creators utilizada somente para experiência guiada e apresentação editorial, sem importar termos, imagens, relatos ou benefícios daquela empresa.

## Mudança de UX
A área existente "O que preciso para me candidatar?" continua dentro de um bloco expansível, sem alongar a página inicial. Seu conteúdo agora oferece quatro lembretes marcáveis pela própria visitante: ter 18 anos ou mais, separar os dados de contato, organizar o endereço completo e conferir Instagram e número de seguidores. TikTok permanece opcional, não entra na contagem de progresso. Os dados reais continuam sendo informados apenas no formulário oficial.

O progresso 0/4 a 4/4 existe somente no estado React local e não valida requisitos, aprova candidatura, ativa parceria ou envia informações. O atalho aponta para #inscricao, cuja disponibilidade permanece independente do checklist, determinada pela fonte oficial existente.

## Privacidade e segurança
- Nenhum campo de dados pessoais foi acrescentado e nenhuma informação identificável é coletada pelo checklist.
- Nenhuma requisição POST/GET, cookie, localStorage, sessionStorage, API, Supabase ou escrita de banco é executada por esta interação.
- Não alterar formulário, regras de validação, servidor, autenticação, checkout, preços, frete ou produtos da loja.
- A candidatura continua gratuita, sem promessa de aprovação, cupom ou resultados financeiros.

## Verificação
- React Vitest para semântica de acessibilidade (4 checkboxes, barra de progresso, textos obrigatórios e TikTok opcional), progresso reversível, ausência de rede/armazenamento e reset ao remontar.
- Regressão completa, formatação e lint, Chrome em 360/390/768/1440 px (accordion, tab/checkbox, hash #inscricao, sem overflow/erros/POST).
- CI geral 2/2 obrigatório para merge; falhas TypeScript preexistentes do checkout devem ser resolvidas exclusivamente no trabalho do e-commerce, não neste PR.
