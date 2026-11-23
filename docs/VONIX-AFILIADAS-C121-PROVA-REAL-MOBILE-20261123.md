# C121 — Prévia de avaliação real no celular | Vonix Afiliadas

**Data:** 23/11/2026. **Projeto único:** Portal de Afiliadas Vonix Hair; não confundir com o e-commerce.

## Continuidade e fontes

- Base: C120, `a99ab2e1b0cc9c92562acb966f67a2e9a7ad5942`, branch `feat/afiliadas-c86-prova-social-foto-20261121`, clone `C:\Users\JL\code\vonix-afiliadas-c111-20261122`.
- PR #279: https://github.com/lucassilva1175/vonix-hair-care/pull/279, **OPEN/DRAFT**. Sem merge, deploy ou modificações em checkout/backend.
- Conteúdo oficial: https://vonixhair.com/seja-afiliada e https://vonixhair.com/produto/botox-vonix, onde estão publicados os comentários associados a produtos Vonix, incluindo a cliente Mariana Andrade e seu comentário **“Produto maravilhoso ❤️ eu amei trabalhar com ele”**.
- Fonte estruturada no código `src/data/reviews.json`: `slug=botox-vonix`, `author=Mariana Andrade`, `comment` acima, vídeo e poster `/depoimentos/depoimento-1-poster.jpg` já publicados. Não editar, renomear, remixar, fabricar ou alterar o registro, nome, autoria, foto/vídeo.
- Referência editorial https://skence.com.br/pages/skence-creators: apenas estrutura e apresentação social; nunca copiar depoimentos de creators Skence, benefícios, pessoas, comissão ou renders.
- Lovable conectado: `Vonix Haircare Showcase` `203d2f84-1058-4ca4-acc3-41a4a5d4e2b5`, main antigo `cfcfa79520df715e9a7cb2b52c8f21dc199093ad`, consultado apenas em leitura; compartilhado com a loja, não sincronizar o PR com main sem homologação.
- **Separação essencial:** as avaliações são de CLIENTES sobre PRODUTOS. Não provam compra verificada, campanha, participação no programa, aprovação ou ganhos de afiliadas.

## Melhoria efetivamente implementada

- `src/components/affiliate-customer-voice-teaser.tsx`: no botão de prévia móvel `affiliate-c116-mobile-proof-toggle`, trocou o texto genérico por uma citação **derivada em runtime da avaliação selecionada em `src/data/reviews.json`** (`selected.comment`) e um crédito de autoria (`selected.author · cliente`), sem nova lista de depoimentos. O poster original da mesma avaliação permanece vinculado (`imageSrc`). Identificação `Avaliações reais de produtos`, indicação `Opiniões sobre produtos, não relatos de afiliadas` e ação para ver as 4 avaliações com fotos e vídeos preservadas.
- A seleção de outro comentário no painel expande/atualiza citação e crédito com a **mesma fonte de dados**; fechar restaura o primeiro item e para o vídeo, mantendo `aria-expanded`, `aria-controls`, navegação e links existentes.
- `src/test/affiliate-c121-visible-real-proof.test.tsx`: contratos de revisão original, citação/autoria/poster coincidentes, navegação em quatro avaliações, SSR acessível, ausência de vídeo autoplay, formulário, POST, promessas de renda e falso endosso. Os testes legados C101/C106/C107/C110/C116 continuam integralmente.
- Esta documentação: `docs/VONIX-AFILIADAS-C121-PROVA-REAL-MOBILE-20261123.md`.
- **Não altera** backend, status de seleção, dados pessoais, inscrição, pagamentos, comissão, catálogo de produtos, avaliações no e-commerce, Lovable, Instagram ou scripts de acompanhamento.

## Medição e limite

- Chrome real 320/360/390/768/1440, GET/HEAD exclusivamente, APIs e terceiros bloqueados. Fonte `qa-artifacts/c121-before-browser.json` e `qa-artifacts/c121-after-browser.json` / logs finais; screenshot do botão mobile em `qa-artifacts/c121-mobile-proof-after-320.png` e de 390px.
- Cartão móvel ANTES: 149px @320; 134px @360; 120px @390. Após incluir citação e crédito, a prévia passou para cerca de 189px @320; 155px @360; 141px @390; deslocamento do formulário de +40/+21/+21px. Desktop/mobile largo preservado, sem novos cards/seções.
- Teste do clique no 320px inicialmente ocorreu antes da hidratação do React; a automação agora aguarda `data-interactive=true` no guia editorial (sinal real de `useEffect`) antes de interagir. Medições anteriores da geometria eram corretas, mas não foram tratadas como testes de interação aprovados. Inspecionar screenshot final, autoria legível e responsividade.
- Nenhum dado comprova ganho de candidaturas. A melhoria é de visualização de prova de produto original, não depoimento de afiliada.

## QA, checkpoint e bloqueio

- Focados FINAIS C121+C116+C101+C106+C107+C110+rota: **49/49 PASS em 7 arquivos** na última versão do crédito, log `qa-artifacts/c121-focused-final.log` (exit 0).
- Regressão final **1.044/1.044 PASS em 145/145 arquivos** (S1 322/37, S2 241/36, S3 223/36, S4 258/36; exits todos 0). Chrome **5/5 PASS**, Prettier/ESLint/diff **0/0/0 PASS**; TypeScript local somente três diagnósticos preexistentes no checkout (nenhum C121). Logs, hashes do ZIP e CI constam em `qa-artifacts/c121-final-audit-20261123.md` e `qa-artifacts/c121-verified-receipt-20261123.json`.
- CI do C120 foi vermelho apenas no TypeScript global por 20 erros preexistentes de cinco arquivos comerciais/testes da loja; aplicação e PostgreSQL aprovados. Não alterar ou enfraquecer testes comerciais/segurança para forçar CI verde. C121 só pode ser considerado pronto para código/PR se regressões locais estiverem aprovadas.
- **Produção NOT_APPROVED** até CI global corrigido pelo responsável e homologação compartilhada do Lovable. Nenhuma publicação direta, push main ou merge.
