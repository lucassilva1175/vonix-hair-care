# C84 — Perguntas frequentes com busca acessível e atalhos

20/11/2026. Projeto exclusivo **Vonix Hair — Portal de Afiliadas**, continuidade do C83 main/Lovable `934381c7f2cef9a07205ef81d631bcdd5515a0db`.

## Problema observado e fontes

O portal oficial de afiliadas tem uma seção de dúvidas de 7 perguntas completas sobre aprovação, seguidores, TikTok opcional, compras não obrigatórias, regras condicionais de comissão e privacidade/e-mail. Essa informação estava em sete `<details>` nativos, com respostas longas; requer percorrer várias para localizar uma dúvida. A página de referência Skence Creators tem FAQ, mas suas ofertas, pessoas, imagens, percentuais, cupons, números e aquisição de produtos são próprios da Skence e **não podem ser apresentados como vantagens Vonix**.

Dados de marca/produtos permanecem vinculados às informações oficiais Vonix `https://vonixhair.com/sobre` e `https://vonixhair.com/loja`. Avaliações de clientes de produtos não são depoimentos de afiliadas.

## Implementação C84

Em `src/components/affiliate-landing.tsx`, sem criar uma seção adicional, o FAQ existente ganhou:

- Busca local com rótulo `Encontre sua resposta`, `type=search`, máximo 80 caracteres e foco visível;
- pesquisa que ignora maiúsculas/minúsculas e acentos, encontrando perguntas e respostas em português sem precisar da grafia exata;
- três atalhos acionáveis `TikTok`, `Comissão` e `E-mail`, com `aria-pressed` de estado e alternância, e controle `Limpar busca`;
- contagem `aria-live=polite` para informar quantas respostas foram encontradas e estado vazio claro com link fixo `#inscricao`;
- preservação das 7 perguntas e respostas **sem reescrever qualquer alegação comercial**, comportamento nativo de `<details>` e CTA final.
- Nenhuma informação digitada é adicionada a URL, cookies, banco ou analytics, e nenhum GET/POST é criado pela busca.

Novo teste `src/test/affiliate-c84-faq-discovery.test.tsx` cobre contagem original, texto comercial preservado, busca sem acento, abertura nativa, filtros de assunto, limpeza, estado vazio, links estáticos e nenhuma chamada de rede.

## Evidência de QA

- Vitest C57, V2 landing, recrutamento e C84: **30/30 PASS** em 4 arquivos.
- Chrome real local `http://127.0.0.1:5301/seja-afiliada`: **4/4 PASS** em 360×780, 390×844, 768×1024 e 1440×900. Em cada largura: 7 perguntas iniciais, `comissao` encontra 1, TikTok encontra 2, E-mail encontra 2, termo inexistente mostra estado vazio, limpeza restaura 7. `aria-live`, `autocomplete=off`, âncora `#inscricao`, nenhum overflow de documento, nenhuma exceção JS e **zero POST**.
- A primeira execução capturou, em 390px, o estado anterior do filtro imediatamente após digitação. O script de QA foi corrigido para aguardar a atualização real do DOM e a execução individual de 390px retornou PASS; também foram repetidos 360/768/1440 individualmente, todos PASS.
- Prettier e ESLint direcionado EXIT0; `git diff --check` EXIT0. A suíte de CI do GitHub confirmará TypeScript, testes integrais, lint e build antes da integração.

## Guardas

Nenhum formulário real foi enviado. Nenhuma alteração em checkout, preços, frete, produtos vendidos, pagamentos, autenticação, Supabase, aplicativo, dados privados, canais de envio e regras de comissão. Não há imagens de creators, depoimentos de afiliadas, promessas de aprovação ou números inventados. A publicação no domínio `vonixhair.com` é separada da sincronização GitHub/Lovable: compartilhar o bundle com e-commerce exige homologação independente antes de deploy.
