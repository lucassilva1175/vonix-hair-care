# C59 — Vonix Afiliadas: acompanhamento privado e orientação pós-inscrição

Data: 18/11/2026. Projeto exclusivo: Sistema de Afiliadas Vonix Hair. Não modificar e-commerce.
Base: C58 PR #244 merged em main SHA 813fb0ac7a649e4bb3ee466eca036da403efa755, Lovable alinhado e produção C58 confirmada.
Workspace C59 isolado: C:\Users\JL\code\vonix-afiliadas-c59-status-20261118.

## Problema verificado
A rota /consultar-candidatura dizia que o código era principalmente para cadastros sem e-mail, mas C57 tornou o e-mail obrigatório para novas candidaturas; o código privado continua necessário a todas. A visualização de status não oferecia orientação específica de próximos passos, além de mensagens curtas.

## Alterações delimitadas
- src/routes/consultar-candidatura.tsx: texto consistente para inscrições históricas e novas com e-mail, e orientação exibida somente após resposta privada válida.
- src/components/affiliate-status-guidance.tsx: instruções públicas por estado (pendente, aprovada, recusada), sem alegar aprovação automática, remuneração, prazo ou ativação de link/cupom.
- src/test/affiliate-tracking-code-ui.test.tsx: contrato de comunicação do código para todos os cadastros.
- src/test/affiliate-c59-status-guidance.test.tsx: 4 cenários de orientação e ausência de dados privados.

## Segurança e escopo
Sem ler candidatos, segredos, .env ou tabelas reais. Sem alterar backend, RLS, autenticação, formulário, checkout, preço ou qualquer módulo comercial. Manteve código mascarado, limpeza quando aba oculta, validação e noindex. Link público /sobre para canais oficiais; código privado nunca entra em URL.

## Verificações locais
- Vitest integral: 754/754 testes PASS em 80 arquivos; focused 25/25 PASS antes da formatação.
- TypeScript --noEmit: PASS. Vite/Nitro build: PASS.
- ESLint e Prettier nos 4 arquivos: PASS após formatação. Git diff --check: PASS.
- Chrome headless local: 4/4 (360x780, 390x844, 768x1024, 1440x900), HTTP 200, código mascarado/mostrar/ocultar, validação de formato, sem consulta real, links legados, sem exceções JS nem overflow e 0 POSTs. Log: C59-browser-final.log; screenshots locais C59-browser-shots/ excluídos do PR.
- Limite: decisões em testes sintéticos; sem login E2E real de proprietários, consulta de dados operacionais nem aumento de conversão medido.

## Publicação
Liberar somente por PR delimitado, CI verde, merge, sincronização do SHA Lovable e confirmação de versão no domínio oficial. Atualizar após evidências.
