# C67 — Vonix Hair Afiliadas: compartilhar o programa com segurança

Data: 19/11/2026 (horário de Brasília). Escopo EXCLUSIVO do portal de afiliadas, branch feat/afiliadas-c67-compartilhamento-20261119, base 31c5a3859176712b0ae10a7c52249fd248bc9237.

## Fundamento e referência

A referência https://skence.com.br/pages/skence-creators mostra integração editorial e caminhos claros de descoberta; não foram reproduzidas imagens, criadoras, depoimentos, comissões 15%/21%, acordos ou outros benefícios Skence. O conteúdo próprio verificado da Vonix serve como fonte. O programa tem candidatura gratuita, seleção individual quando disponível e não garante aprovação.

Na experiência anterior, somente o fim longo da página C55 oferecia copiar o link público para outra criadora; na abertura hero C61 havia apenas CTA para inscrição/condições. A atualização fornece divulgação voluntária já no primeiro contato, sem exigir cadastro, formulário, cookies ou programas de indicação remunerada.

## Implementação

- src/lib/affiliate-public-share.ts centraliza URL canônica pública https://vonixhair.com/seja-afiliada e texto compartilhável sem promessas, tokens, códigos privados, parâmetros de rastreamento ou remuneração de indicação.
- src/components/affiliate-program-share.tsx oferece ação nativa Web Share API por gesto explícito, fallback para clipboard. Cancelamento da janela nativa não copia de forma inesperada. Reporta resultado somente após conclusão real; rejeições geram mensagem de erro verdadeira.
- src/components/affiliate-editorial-hero.tsx monta compartilhamento próximo aos CTAs de inscrição e condições, mantendo status recruitmentOpen e informações C61 inalterados.
- src/components/affiliate-next-steps.tsx preserva export público C55 de URL e compartilha a origem única do endereço.
- src/test/affiliate-c67-public-share.test.tsx valida nativo, fallback, cancelamento, erro, indisponibilidade, URL, copy honesta e integração C61.

Nenhuma mudança em src/data/reviews.json, C62/C63/C64/C65/C66, dados de candidatas, Supabase, admin, e-commerce, frete, preços, checkout, env, integrações reais ou envio de mensagens.

## QA e publicação

QA local efetivo: 23/23 testes direcionados PASS (C55, C61, C65, C66, C67); TypeScript --noEmit PASS; ESLint e Prettier dos arquivos alterados PASS; build Nitro/Vite PASS; Chrome headless 360×780, 390×844, 768×1024 e 1440×900 4/4 PASS após aguardar hidratação: convite público copiado e feedback honesto, URL canônica sem tokens e texto sem ganhos garantidos. Zero POST de candidatura, zero MP4 carregado, zero overflow e erro JavaScript. O primeiro ensaio clicou antes da hidratação e falhou somente nesse teste de temporização; a execução final aguarda networkidle. Suíte integral local não rodada: testes de leads do e-commerce podem depender de destinos configurados e não devem contatar serviços reais. Publicação pendente. C67 no código não é publicação: Lovable publica também o e-commerce de main que possui PR250-252 (frete, preços e checkout), ainda sem aprovação/validação comercial independente. Não executar deploy_project neste fluxo sem esse gate.
