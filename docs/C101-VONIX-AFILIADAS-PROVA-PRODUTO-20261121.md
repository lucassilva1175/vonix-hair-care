# C101 — voz de cliente de produto antes da candidatura

Data: 21/11/2026. Projeto: **exclusivamente Portal de Afiliadas Vonix Hair**.
Base certificada: C100 commit `e8b26ffd7449153b9c2a337cc77de296d5cde36a`, PR Draft #279 `feat/afiliadas-c86-prova-social-foto-20261121`.

## Fontes oficiais e referência
- O site público `vonixhair.com` apresenta produtos capilares e programa de afiliadas; a referência `skence.com.br/pages/skence-creators` usa UGC e benefícios, mas as regras de compra com desconto e cupom da Skence **não são aplicáveis** automaticamente à Vonix.
- A fonte da prova social é `src/data/reviews.json` da loja, conferida no código Lovable e branch do portal: **4 avaliações publicadas sobre Botox Vonix**, três com vídeos e uma com foto. A nova faixa reusa exatamente a avaliação de **Mariana Andrade** e seu poster vinculado. Não inventa conteúdo, não troca mídia de uma autora por outra nem adiciona terceiros.
- **Limites obrigatórios:** avaliação de produto publicada na loja ≠ compra verificada, depoimento de afiliada, renda, comissão ou parceria. A faixa comunica explicitamente isso e não utiliza autoplay.

## Implementação
- Novo `AffiliateCustomerVoiceTeaser`: faixa compacta, padrão editorial creme/vinho Vonix, com imagem de prévia, citação literal, autora, fonte e links para avaliações completas e candidatura.
- Integrado depois da descoberta de estilos C100 e antes do checklist/formulário real; nenhum outro formulário ou script de rastreamento foi adicionado.
- O link `#avaliacoes-produtos` abre o painel detalhado que já existia, inclusive quando está sob o disclosure `AffiliateDiscoveryGate`.
- Novo teste C101 verifica igualdade exata de citação e imagem com JSON; teste integral de página autoriza **somente** poster oficial vinculado à resenha, mantendo a proibição de imagens externas e reivindicações Skence.
- Arquivos de mudança exclusivamente: `src/components/affiliate-customer-voice-teaser.tsx`, `src/routes/seja-afiliada.tsx`, `src/test/affiliate-c101-customer-voice.test.tsx`, `src/test/affiliate-recruitment-page.test.tsx`, e este documento.

## QA
- **Vitest integral final: 943/943 PASS, 125/125 suítes**, executado com baixo paralelismo para reduzir contenção; 24/24 testes focados PASS em 4 suítes. Prettier/ESLint dos arquivos afetados PASS sem erros nem avisos.
- Navegador Chrome local bloqueando qualquer requisição não-GET ou externa: **4/4 PASS** em 360/390/768/1440, sem JavaScript error, sem overflow e sem POST. Imagem legítima e vínculo com review completa funcionam. Altura da faixa: 342 / 325 / 272 / 255 px. Deslocamento do início do formulário sobre C100: 342 / 325 / 272 / 255 px, com link direto disponível.
- TypeScript local bloqueado por 3 TS2322 preexistentes no checkout `src/routes/checkout.tsx` (1466–1468), nenhum novo erro C101.
- Artefatos locais não versionados: `qa-artifacts/c101-browser-final.log`, `qa-artifacts/c101-browser/`, `qa-artifacts/c101-focused-green.log`; relatório integral adicional conforme execução final.

## Segurança da entrega
- Não tocar checkout/boleto, sistema de afiliadas Supabase, autenticação, regras de pagamento/comissão, dados de candidatas, e-commerce nem publicação.
- PR #279 permanece DRAFT, RELEASE_BLOCKED até CI integral aprovado, homologação autorizada de inscrições/administradores, e comprovação/autorização específica caso sejam incorporados depoimentos **de afiliadas** reais.
