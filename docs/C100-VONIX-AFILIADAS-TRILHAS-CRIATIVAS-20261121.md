# C100 — descoberta compacta de estilos para candidatas Vonix Hair

Data: 2026-11-21. Escopo exclusivo: Portal de Afiliadas, rota `/seja-afiliada`.
Base: branch `feat/afiliadas-c86-prova-social-foto-20261121`, C99 `9f8cb6ed8923789fb9dcfc7bf05c8cbba3983de3`, PR #279.

## Objetivo e evidências
- Referência funcional: Skence Creators (benefícios explicados, caminhos criativos e exemplos de UGC), sem copiar textos, ofertas, imagens ou depoimentos proprietários.
- Conteúdo Vonix: catálogo oficial e três perfis editoriais existentes (rotina/comunidade, UGC, informação/cuidado), reutilizados como fonte compartilhada em `src/data/affiliate-creator-paths.ts`.
- A vitrine inicial não lista supostas afiliadas. Avaliações de produtos permanecem marcadas como avaliações de **clientes**, não prova de adesão ao programa de afiliadas.
- A inscrição não garante produtos grátis, comissão ou parceria. Permanecem condições oficiais condicionadas a aprovação e a disponibilidade real do serviço.

## Mudança de UX
- Adicionado `AffiliateCreatorSpotlight` após o guia de 3 etapas e antes da preparação/candidatura.
- Três botões selecionáveis mostram detalhes opcionais, em vez de inserir conteúdo longo e obrigatório na jornada.
- A tela sem seleção mantém CTA direto `#inscricao`; a selecionada mostra imagem editorial, ideias reaproveitadas e link `#perfis` para a seção detalhada já existente.
- Botões sem envio, `aria-pressed`, alvos de toque adequados, foco visível e classes de movimento reduzido.
- Não alterado: formulário, recrutamento/verificação de status, integração Supabase, autenticação, pagamentos, e-commerce, produtos, preços, depoimentos e publicação.

## Verificações
- Testes de contrato: `src/test/affiliate-c100-creator-spotlight.test.tsx` e ordenação C66 atualizada; C99 permanece.
- Chrome headless isolado: larguras 360, 390, 768 e 1440; todas PASS, HTTP 200, seleção UGC e informativa, imagens carregadas, portal de ideias detalhadas revelado, formulário único, sem overflow, sem erros JS ou POST.
- Vitest integral final: **939/939 PASS**, 124/124 suítes, exit 0. Vitest focado C66/C99/C100: **11/11 PASS**.
- ESLint escopado: 0 erros / 0 avisos. Prettier escopado: PASS.
- Logs detalhados e imagens de QA locais, não versionados, em `qa-artifacts/c100-*`.
- TypeScript integral ainda encontra três erros TS2322 herdados exclusivamente de `src/routes/checkout.tsx` linhas 1466–1468. Nenhum erro C100 identificado.

## Gate de publicação
- PR de Portal #279 mantém-se em DRAFT; publicação/merge dependem de CI integral verde, correção isolada do checkout pelo projeto responsável e homologação autorizada de candidatura real, aprovação administrativa e e-mails.
- Depoimentos de **afiliadas reais** só depois de aprovação/autorização e coleta de evidência legítima.
- Nenhuma inscrição real nem atividade de produção realizada neste ciclo.
