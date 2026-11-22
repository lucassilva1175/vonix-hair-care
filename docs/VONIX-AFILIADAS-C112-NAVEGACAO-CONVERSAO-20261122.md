# Vonix Hair — Portal de Afiliadas C112 (22/11/2026)

## Continuidade comprovada
- Escopo: somente portal /seja-afiliada e cabeçalho dedicado; sem mudanças no e-commerce, checkout, preços, vendas, APIs, sistema de inscrição ou dados.
- Clone de QA isolado: `C:\Users\JL\code\vonix-afiliadas-c111-20261122`.
- Base C111: `2d2f4b2900014e53ae1be462d1cb9413512446df`. Branch do PR #279 DRAFT: `feat/afiliadas-c86-prova-social-foto-20261121`.
- Lovable Vonix Haircare Showcase é compartilhado com e-commerce; sua main não é a branch do PR. Não realizar merge nem deploy sem homologação.
- Referência de composição: Skence Creators, exclusivamente hierarquia editorial e orientação da jornada; nunca copiar avaliações, criadoras, imagens ou benefícios de outra marca.

## Incremento C112
1. Cabeçalho desktop e mobile: 5 atalhos em vez de 7 links informativos. Primeiro `Já me inscrevi` abre o acompanhamento privado por código, seguido de comissão, processo, avaliações **de produtos** e dúvidas.
2. CTA principal respeita estado de captação confirmado pelo backend; status fechado não anuncia candidatura real aberta.
3. Introdução do formulário encurtada; quatro critérios exibidos diretamente: 18+, e-mail válido, Instagram, TikTok opcional. CTA de retorno `Consultar meu status pelo código` ao lado dos requisitos.
4. Novo teste C112 cobre prioridade de links, rotas, transição fechado/aberto e informações do formulário. Testes legados C53/C60 foram adequados ao novo menu com as mesmas âncoras de destino e mantendo a descoberta de perfis/critérios. Nenhuma nova API ou POST.

## Verificação
- Formatação e ESLint do escopo: PASS.
- Testes focados: 5 arquivos, 31/31 PASS após ajustar as verificações legadas do C53/C60 para a navegação intencionalmente simplificada (qa-artifacts/c112-focused-r2.log).
- Chromium headless GET-only, 360/390/768/1440px: 4/4 PASS, clique para /consultar-candidatura, sem POST, sem pageerror ou overflow horizontal (qa-artifacts/c112-browser/report.json; screenshots no diretório).
- TypeScript global: exit 2 somente por 3 erros TS2322 em `src/routes/checkout.tsx` (linhas 1466–1468); as mesmas 3 ocorrências já estavam presentes no log C111. Nenhum novo diagnóstico do portal.
- Vitest integral FINAL C112: **1011/1011 PASS**, **136/136 arquivos PASS**, exit 0 (`qa-artifacts/c112-full-r3.log` e `.exit.txt`, máximo 3 workers, testTimeout 20000). Diagnóstico histórico: tentativa inicial 1006 PASS / 5 falhas (maioria timeout) sob paralelismo alto; segunda 1009 PASS / 2 falhas de expectativas legadas, corrigidas após reavaliar o novo comportamento. Nenhuma falha remanescente.

## Integridade e honestidade
- Avaliações em destaque são publicadas por clientes **sobre produtos**, e não validam participação, renda ou parcerias de afiliadas.
- Nenhuma candidatura real, dado pessoal, credencial, token, gateway ou e-mail foi enviado durante a QA; requisições de navegador diferentes de GET/HEAD e APIs reais foram barradas.
- As mudanças C112 ficam exclusivamente no PR #279 DRAFT. O projeto publicado não recebe este checkpoint automaticamente; bloqueios e homologação permanecem separados.

## Liberação
- Não autorizar publicação por este checkpoint isolado.
- Revisão comercial/operacional, CI compartilhado com e-commerce e homologação completa do Lovable continuam pré-condições.
