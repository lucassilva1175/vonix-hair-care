# C64 — Vonix Hair Afiliadas: benefícios primeiro, formulário acessível

Data: 19/11/2026. Somente sistema de afiliadas; repositório compartilhado lucassilva1175/vonix-hair-care, branch isolada feat/afiliadas-c64-beneficios-first-20261119, base main 502145bc2831b71a7f172ec04c7cd5e9c38783c4. Referência editorial https://skence.com.br/pages/skence-creators, sem copiar UGC, imagens, benefícios, comissões, produtos ou contratos Skence.

## Diagnóstico verificável (Chrome real sem candidaturas)

No domínio oficial https://vonixhair.com/seja-afiliada, viewport 390 × 844: #ganhos a 4.294 px, #inscricao a 15.533 px, documento 21.403 px de altura (fechamento da coleta às ~15h, hora local). A consulta pública exibia candidaturas abertas para análise, storage ok e encryption ok. O navegador fez requests técnicos do próprio site, NÃO enviou dados de candidata. Não foi testada uma inscrição real.

A versão C64 em localhost (mesma viewport): #ganhos a 1.424 px, #inscricao a 3.441 px, documento 20.376 px. Assim, a inscrição aparece 12.092 px mais cedo (~77,8% menos rolagem) e a comissão 2.870 px antes (~66,8%). Os dois builds não são idênticos: versão oficial pode estar em C62, versão local inclui C63, portanto essas métricas medem posição do conteúdo, não variação de conversão ou comparação A/B controlada.

## Alteração

- src/components/affiliate-landing.tsx extrai duas seções reutilizáveis mantendo um Intro completo para testes/integrações: AffiliateLandingOffer (hero e condições reais logo no início) e AffiliateLandingDiscovery (marca, avaliações de produtos, fluxo, vídeos do catálogo, seleção, caminhos, ideias). Mantém 8% após aprovação e venda confirmada/paga, bônus condicional, metas e simulador sem prometer ganhos.
- Novo CTA dentro de #ganhos: apresenta candidatura gratuita e sujeita a análise; oferece atalhos para #inscricao, #como-funciona, #avaliacoes-produtos.
- src/routes/seja-afiliada.tsx: ordem real da rota alterada para Offer, preparo opcional recolhido em details sem perder seu conteúdo, formulário ORIGINAL sem tocar funções/banco, próximos passos, Discovery e FAQ. URL, âncora #inscricao, status da seleção, pós-inscrição e prévia sem envio permanecem intocados.
- Teste de integração em src/test/affiliate-recruitment-page.test.tsx verifica a ordem REAL do DOM e a abertura do bloco de preparação, sem envio de dados.
- As quatro assertions históricas de ordem em testes C58/C60/C61/C63 foram atualizadas para refletir benefícios antes de provas de produto; continuam exigindo imagem e mídias autênticas.

## Verificações

- Vitest completo na worktree local: 778/778 casos PASS em 85 arquivos. TypeScript, lint e build local verificados; relatórios individuais no clone, revalidar os gates finais após qualquer edição.
- Chrome headless 360×780, 390×844, 768×1024 e 1440×900: 4/4 PASS para vídeos C63, URLs de produtos, zero carregamento antecipado MP4, sem overflow/erro JS, âncora #inscricao visível abaixo do cabeçalho e sem POST de candidata. Chrome local status closed porque worktree não foi configurada com segredo ou ambiente de produção; testes simulam closed/open e não fazem chamadas reais de cadastro.
- Áudios de vídeos do catálogo e depoimentos não têm legendas/transcrições integrais confirmadas, portanto ainda é melhoria de acessibilidade pendente. Avaliações reais são de PRODUTO e NÃO provas de ganhos/contratação de afiliadas.
- Não acessar .env, candidatos, senhas, Supabase, admin, gateways, pagamentos, checkout, preços, frete ou outros projetos.

## Gate de deploy

Lovable projeto 203d2f84-1058-4ca4-acc3-41a4a5d4e2b5 usa deploy compartilhado com o e-commerce. Main já continha PR250-252 com frete, preços e checkout quando iniciamos. Só fazer deploy quando o pacote de alterações comerciais estiver aprovado e validado separadamente, pois Lovable deploy_project publica todas as rotas simultaneamente. GitHub merge não prova publicação no domínio. Comparar SHA, bundle e validar novamente o formulário com teste SEM envio real.
