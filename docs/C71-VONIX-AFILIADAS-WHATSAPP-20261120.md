# C71 — Vonix Hair Afiliadas: compartilhamento pelo WhatsApp

**Data:** 20/11/2026 (Brasil). **Escopo:** exclusivamente recrutamento público de afiliadas Vonix Hair. **Base GitHub:** `0f68a6db4f87ae5b53175bb85bd0f7b44b8e5e1b`, branch `feat/afiliadas-c71-whatsapp-publico-20261120`.

## Diagnóstico verificado

A referência Skence destaca criadoras e apresenta caminhos claros para descobrir o programa, mas não autoriza copiar depoimentos ou vantagens. A Vonix já possui conteúdo verdadeiro de produtos e comentários de clientes, apresentados sem confundi-los com rendimentos de afiliadas. A página `/seja-afiliada` já gera metadados Open Graph, descrição, canonical e imagem oficial `affiliate-creators-share.png` de 1200 × 630 px (406.069 bytes); o arquivo público respondeu HTTP 200 `image/png`. **Não houve duplicação dos metadados nem substituição de ativos.**

C67 implementou compartilhamento nativo Web Share com fallback clipboard, mas quem utiliza navegador sem API nativa ainda precisava colar a mensagem manualmente no WhatsApp. C71 oferece um link direto, de ação voluntária, próximo do botão existente.

## Alterações

- `src/lib/affiliate-public-share.ts`: centraliza a mesma mensagem factual já usada na cópia, seguida da URL canônica pública, e deriva `https://wa.me/?text=` com codificação correta. Nenhum nome, e-mail, telefone, parâmetro UTM, identificador de candidata, token privado, cupom ou link com comissão.
- `src/components/affiliate-program-share.tsx`: preserva a ação C67, adiciona link **WhatsApp** acessível, com `target="_blank"`, `rel="noopener noreferrer"` e `aria-describedby` apontando para o aviso de que não é um link remunerado. A ação só pode abrir o destino mediante clique. Área de toque corrigida para `min-h-[44px]` após o primeiro Chrome detectar 37,4 px no celular.
- `src/test/affiliate-c71-whatsapp-share.test.tsx`: cinco casos de URL, texto, condições, acessibilidade, segurança e disponibilidade tanto com inscrições abertas quanto fechadas. Testes antigos C67 permanecem válidos.

**Não foram alterados:** checkout, preços, frete, catálogo, e-commerce, sistema de administração das afiliadas, API, autenticação, Supabase, reservas, candidaturas reais, dados pessoais, segredos ou regras de comissão.

## QA efetivo

- Vitest **31/31 PASS** em quatro arquivos (C71, C67, C61 e regressão da rota de recrutamento).
- `tsc --noEmit` **PASS**; ESLint escopado **PASS**; Prettier **PASS**; Nitro/Vite build **PASS**; revisão `git diff --check` a confirmar na integração.
- Chrome real no computador pareado, localhost, **4/4 PASS** em 360×780, 390×844, 768×1024, 1440×900: ambas as ações com ao menos 44 px, sem rolagem horizontal, erros JS, POST de candidata ou pré-carregamento de vídeos MP4. A URL foi lida, mas **não houve navegação automática nem envio ao WhatsApp**. Fallback clipboard copiou exatamente o mesmo convite codificado.
- Primeiro teste de Chrome reprovaria o link do WhatsApp em 360 e 390 px por ter 37,4 px de altura; corrigido com medida absoluta de 44 px e novo Chrome 4/4 aprovado.
- A suíte total do projeto deve ser executada apenas no runner isolado do GitHub CI; não executar testes de leads do e-commerce contra destinos externos configurados.

Não há dados de aumento real de cliques, inscrições ou conversões. A melhoria facilita uma ação de divulgação voluntária, sem promessas de desempenho.

## Publicação e risco comercial

Lovable publica a aplicação compartilhada de portal e loja. A branch main inclui alterações de frete, preços e checkout provenientes de PRs #250–252 ainda sem homologação comercial independente neste fluxo de afiliadas. **Merge não equivale a deploy**, e o valor `is_published=true` indica apenas que já existe uma versão anterior publicada. Não executar `deploy_project` sem liberação operacional do e-commerce. Após homologação, conferir simultaneamente portal e loja publicada. Registrar o commit final, CI, sync Lovable e bundle público no recibo C71.
