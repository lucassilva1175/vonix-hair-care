# C107 — vídeos reais sob demanda e convite público mais claro

**Projeto exclusivo:** Portal de Afiliadas Vonix Hair. Não confundir com o e-commerce Vonix Hair.
**Data:** 22/11/2026 (BRT).
**Base preservada:** C106 `23e22c5a03b58140069ba42762ea25dee12929eb`, PR #279 DRAFT, branch `feat/afiliadas-c86-prova-social-foto-20261121`.
**Trabalho isolado:** `C:\Users\JL\code\vonix-afiliadas-c107-20261122`, clone limpo da branch PR; C106 original e QA anteriores preservados.

## Evidência e delimitação factual

- Página oficial https://vonixhair.com/seja-afiliada confirmou em 22/11: candidatura gratuita, seleção individual, 8% sobre **vendas confirmadas após aprovação**, marca responsável pela entrega e atendimento, sem comprar produtos ou estoque exigidos. Não inferir abertura das inscrições pela publicidade.
- Fonte real do conteúdo: `src/data/reviews.json` e áudios/vídeos originais já públicos em `public/depoimentos/`; **não** são avaliações de afiliadas, nem prova de ganho, remuneração, parceria, compra verificada ou resultado de vendas. Não modificar registros, nomes, comentários, fotos ou vídeos.
- Associação **original** de cada revisão do produto Botox Vonix: Mariana Andrade → `depoimento-1.mp4` / seu poster; Ayla Muniz → `depoimento-2.mp4` / poster; Fernanda Assis → `depoimento-3.mp4` / poster; Ana Paula → **fotografia** `depoimento-4.jpg`, não possui vídeo. Os três MP4 locais são públicos com tamanhos 1.301.930, 584.870 e 4.523.574 bytes.
- Lovable projeto `203d2f84-1058-4ca4-acc3-41a4a5d4e2b5`, main read-only `bbe1cf06ecdae11b414c5cdc8e2d459899488ec9`: suas edições recentes tratam de **e-commerce**, não foram copiadas para este PR. Referência https://skence.com.br/pages/skence-creators usada apenas como inspiração editorial; não importar benefícios, influenciadoras ou depoimentos da Skence.

## Melhorias implementadas, restritas ao portal

1. `src/components/affiliate-customer-voice-teaser.tsx`: adiciona ícone de vídeo sobre a capa apenas quando o registro real tem vídeo. Botão nativo com nome acessível completo, `aria-expanded` e `aria-controls` somente quando o player está montado. Clique explícito revela player inline abaixo do bloco; vídeo com `controls`, `playsInline`, `preload="none"`, poster e src locais do **mesmo registro**. **Sem autoplay**, sem player no HTML inicial/SSR e sem carregar vídeo antes de interação. Fechar desmonta o elemento (interrompendo eventual reprodução) e restaura foco ao botão. Trocar cliente também desmonta o anterior e não inicia outro. Seleção Ana Paula mostra somente foto sem player. A seção preserva sua **altura inicial** e continua antes do formulário com um único CTA `#inscricao` e acesso às avaliações completas.
2. `src/lib/affiliate-public-share.ts`: reformula convite público existente para ser mais persuasivo, mas condicional: programa de cabelos/autocuidado, **candidatura gratuita**, sem compra/estoque para se candidatar, **comissão de 8% somente após aprovação em vendas confirmadas e pagas**, seleção individual, **sem ganhos ou aprovação garantidos** e instrução para consultar disponibilidade/regras no site oficial. Mesma URL canônica `https://vonixhair.com/seja-afiliada`, mensagem WhatsApp voluntária `wa.me?text=...`, sem cookies, tokens, dados pessoais, tracking, cupom ou disparo automático. O compartilhamento da Web API segue a mesma fonte.
3. `src/test/affiliate-c107-review-video-and-invite.test.tsx`: 10 testes específicos de associação mídia↔autor, fonte original, ausência de autoplay no SSR, controle e preload, foco acessível e descarte do player, foto sem vídeo, manutenção dos links, convite oficial sem tokens, WhatsApp com destino e texto originais. Testes C71/C101/C106 anteriores sem relaxamento, **24/24 focados PASS**.

## QA navegador — Chromium real

A página foi executada localmente em 360 / 390 / 768 / 1440 px, com rede externa bloqueada, e testadas as 3 avaliações em cada largura, com *Range GET* parcial (sem baixar vídeos inteiros), retornando **HTTP 206 `video/mp4`** em cada arquivo, poster correto, video `paused=true`, `autoplay=false`, `controls=true`, `preload="none"`, `playsInline=true`. Cada seletor acessível mostra autor original; fechar devolve foco e desmonta player; selecionar foto remove todo vídeo; mensagem WhatsApp tem apenas `text`, com 8% qualificados e URL oficial. Clique em `Ir à inscrição` chega a `#inscricao`, alvo único.

**4/4 larguras PASS**, HTTP200, 0 erro JavaScript, 0 POST, 0 overflow horizontal. Tentativas existentes de carregar Google Tag Manager/Clarity foram bloqueadas por intercepção local; **não afirmar ausência de tentativa**. As medidas iniciais do teaser permanecem **443 / 409 / 366 / 349 px** nas quatro larguras, idênticas ao C106; o vídeo só aumenta a página por decisão do usuário. Evidências `qa-artifacts/c107-browser/report.json`, `closed-*.png`, `expanded-*.png`, logs e receipt local não versionados.

A primeira tentativa da automação de navegador clicou antes de a aplicação React concluir a hidratação; o teste temporizou por falta de player. A asserção de QA foi corrigida para aguardar o indicador real de hidratação do gate C96 (sem mudar o componente). Segunda rodada Chromium 4/4 totalmente verde.

## Gates de qualidade, entrega e riscos

- Focused Vitest **24/24 PASS** (C71/C101/C106/C107).
- **Vitest integral final: 979/979 PASS em 131/131 arquivos, exit 0**, executado com `--maxWorkers=1 --fileParallelism=false` (logs locais `qa-artifacts/c107-full.log` e `.exit.txt`). Os 10 casos C107 e todos os contratos antigos foram executados no conjunto. **Prettier --check, ESLint escopado e `git diff --check`: exit 0, sem erros/avisos** (recibo `qa-artifacts/c107-quality.exit.txt`). **TypeScript local `tsc --noEmit`: exit 2 exclusivamente por 3 erros TS2322 herdados de `src/routes/checkout.tsx` (linhas 1466–1468), nenhum erro de C107**, recibo `qa-artifacts/c107-tsc-r2.log`. A primeira execução do TypeScript encontrou também uma opção de consulta de teste sem tipo (`exact`); foi corrigida para o teste equivalente com regex ancorada, e a segunda execução eliminou esse erro. O GitHub CI do commit exato será registrado como resultado independente após envio, sem assumir verde.
- Testes de candidatura real/admin/e-mail/código **não realizados** por dependerem de autorização e dados externos; nenhum envio, conta, banco ou e-commerce foi alterado.
- **RELEASE_BLOCKED**: PR #279 DRAFT, sem merge/deploy/Lovable write. Erros conhecidos e-commerce no CI anterior (17 TypeScript em boleto/checkout/galerias) e teste C41 intermitente precisam ser tratados por fluxos responsáveis. Não alterar áreas não afiliadas.
- Para depoimentos reais de afiliadas, obter material autorizado e confirmação de parceria, separado das avaliações públicas de produtos. Não existe medição de aumento de inscrições atribuível a este ciclo.
