# C117 — Vonix Afiliadas: inscrição prioritária sem perder narrativa

Data: 23/11/2026 (BRT). Projeto EXCLUSIVO: Portal de Afiliadas Vonix Hair.

## Continuidade e referências

- Base C116: commit `a768a970aaa77671e7c0e37124ffe26e90e57030`, branch `feat/afiliadas-c86-prova-social-foto-20261121`, clone `C:\Users\JL\code\vonix-afiliadas-c111-20261122`. PR #279: https://github.com/lucassilva1175/vonix-hair-care/pull/279 — manter OPEN/DRAFT.
- Fontes oficiais: https://vonixhair.com/seja-afiliada, https://vonixhair.com/loja e imagens no próprio catálogo `public/images/products/`, com avaliações de produto em `src/data/reviews.json`. Referência estrutural/editorial: https://skence.com.br/pages/skence-creators; não reutilizar fotos, slogans, parcerias, remuneração ou conteúdo de terceiros.
- Lovable `Vonix Haircare Showcase` project `203d2f84-1058-4ca4-acc3-41a4a5d4e2b5`, main `cfcfa79520df715e9a7cb2b52c8f21dc199093ad` (anterior ao PR), compartilhado com loja. Acesso apenas de leitura, sem publicação.
- Analytics Lovable 01–23/11/2026 UTC: `/seja-afiliada` 190 pageviews; projeto/site completo 4.733 pageviews e 3.025 visitantes. Não há funil de conversão nem dado de candidaturas. Não alegar melhora comprovada da taxa.

## Diagnóstico quantificado de base

Antes de C117, Chrome GET-only C116 (`qa-artifacts/c116-browser/report.json`) encontrou início de `#inscricao` no documento: **y2575px em 320px, y2449px em 360px, y2358px em 390px, y2857px em 768px e y3243px em 1440px**. Isso ocorre após o hero oficial, a exploração opcional em três etapas, o seletor editorial de criadoras (não afiliadas reais), a prévia de avaliações legítimas de **produtos** e a preparação da inscrição.

## Intervenção C117

O objetivo não é adicionar mais blocos à landing, mas priorizar o destino do interesse:

- **ANTES:** hero/benefícios → 3 etapas → ideias de conteúdo → prova real de produtos → requisitos → `#inscricao` → próximos passos → FAQ → catálogo detalhado.
- **DEPOIS:** hero/benefícios → prova real de produtos → requisitos → **`#inscricao`** → próximos passos → 3 etapas opcionais → ideias editoriais de conteúdo → FAQ → catálogo detalhado.
- Somente a ordem das instâncias existentes `AffiliateApplicationStepsPreview` e `AffiliateCreatorSpotlight` mudou em `src/routes/seja-afiliada.tsx`; ambas permanecem uma única vez, sem duplicação, com imagens oficiais, links e estado local de expansão preservados.
- A prova social autêntica em `AffiliateCustomerVoiceTeaser` continua **antes** do cadastro; seus comentários são exclusivamente experiências sobre produtos, nunca apresentadas como histórias de afiliadas ou ganhos.
- Um link discreto dentro da introdução do formulário dá escolha à visitante: **Ver o passo a passo** (`#candidatura-etapas`) mesmo que ele esteja após a inscrição.
- Mantidos: `#inscricao` único, `#como-funciona`, `#candidatura-etapas`, `#ganhos`, revisão do status de candidatura por código, requisitos (18+, e-mail e Instagram, TikTok opcional) e bloqueios de submissão/preview.
- Não mudar lógica do formulário, APIs, Supabase, backend, privacidade, segurança de sessão, pagamentos, checkout, e-commerce nem a versão publicada do Lovable.

## Compatibilidade e QA

- Contratos de **ordem** dos testes C100/C101/C104/C108/C116/C66/**C97** atualizados para verificar a nova posição intencional dos mesmos componentes; **nenhum teste de segurança, autorização, conteúdo, vídeo, requisito ou formulário foi enfraquecido ou removido**.
- Novo teste C117 `src/test/affiliate-c117-application-first.test.tsx` verifica ordem de fonte e DOM, links/âncoras, 1 formulário, revisão dos critérios, prova verdadeira, disponibilidade e nenhum POST.
- Chrome headless **5/5 PASS** em 320, 360, 390, 768 e 1440 px, GET/HEAD-only, APIs e destinos externos bloqueados, sem POST, erro JS nem overflow. **Início da inscrição** em relação ao C116: 320 px **2575→1925 (650 px de ganho)**; 360 px **2449→1816 (633 px)**; 390 px **2358→1742 (616 px)**; 768 px **2857→1978 (879 px)**; 1440 px **3243→2034 (1209 px)**. Âncora opcional `#candidatura-etapas` validada após formulário. Relatório e screenshots em `qa-artifacts/c117-browser/`.
- Testes direcionados finais **43/43 PASS em 9 arquivos**, incluindo C97, C117 e a rota completa (`qa-artifacts/c117-focused-r3.log`). Regressão integral **1.028/1.028 PASS em 141/141 arquivos**, quatro shards **316/36, 249/35, 208/35, 255/35**, todos exit 0 (`qa-artifacts/c117-shard-{1..4}-r2.log`). Prettier e ESLint scoped + `git diff --check` PASS (**0,0,0**). Os resultados GitHub/CI são registrados separadamente na auditoria para não mascarar baseline remoto.
- TypeScript global local preexistente: 3 diagnósticos TS2322 em `src/routes/checkout.tsx`, linhas 1466–1468, sem novos erros em arquivos de afiliadas. GitHub C116 tinha testes da aplicação e PostgreSQL RLS aprovados, mas 20 erros TS anteriores em cinco arquivos de e-commerce/testes de produtos; C117 não deve alterar esses arquivos.

## Controle de mudança e publicação

- Não há criação de novas avaliações, provas sociais de afiliadas, remuneração prometida, contagens de inscrições, rastreamento ou formulários alternativos.
- Criar ZIP SOURCE_ONLY exclusivo C117 com hashes independentes e recibo de auditoria. Atualizar exclusivamente branch do PR #279 DRAFT, com stage de arquivos autorizados, preservando `qa-artifacts` e checkpoints anteriores.
- Produção **NOT_APPROVED** até CI global verde e homologação da versão compartilhada no Lovable, independentemente dos testes locais.
