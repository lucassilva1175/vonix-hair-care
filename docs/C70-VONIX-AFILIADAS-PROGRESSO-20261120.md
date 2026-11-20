# C70 — Vonix Hair Afiliadas: progresso de preenchimento sem dados pessoais

**Data:** 20/11/2026 (Brasil). Projeto exclusivo: portal público de afiliadas Vonix Hair. **Base de código:** main `1a88da0d735bd463730d26e2c70a63d82b7cb2a7`; branch `feat/afiliadas-c70-progresso-candidatura-20261120`. Respeitar e não alterar as alterações comerciais do e-commerce compartilhado.

## Problema e solução

O formulário contém todos os campos exigidos pela seleção e já oferece proteção de dados, rastreamento por código e prévia. Entretanto, em telas móveis, o visitante percorre três áreas longas sem um sinal de quanto já preencheu.

No topo do formulário, foi acrescentado **apenas um resumo local de presença** dos campos obrigatórios, com medidor acessível de 0 a 3 e rótulos **Contato, Endereço, Instagram**. Contato requer nome, e-mail e telefone; endereço requer CEP, rua, número, bairro, cidade e UF; Instagram requer perfil e contagem de seguidores. **TikTok e complemento são opcionais e jamais entram no progresso**. O aceite LGPD de privacidade e a declaração de idade continuam separados, obrigatórios para envio. Todos os valores ficam no formulário original, não entram em dados analíticos do novo componente, seus atributos ou rótulos.

O indicador **não verifica a validade dos campos** nem comprova registro, aprovação, comissão, benefício ou consentimento. O texto visível explica essa distinção. Reduz a incerteza sem transformar a inscrição em wizard, sem impedir correções e sem tocar na lógica do envio.

## Escopo dos arquivos

- `src/components/affiliate-simple-form.tsx`: três flags derivadas de state local para presença dos grupos; barra progressiva nativa acessível e três legendas, sem novo estado persistente, requisições, trackers ou mudança de regra.
- `src/test/affiliate-c70-form-progress.test.tsx`: verificações 0/3 → 1/3 → 2/3 → 3/3 e retorno ao zerar requisito, TikTok opcional, consentimento separado, ausência de dados pessoais nos novos indicadores, ausência de `sign_up`/envio, prévia sem analytics.
- `docs/C70-VONIX-AFILIADAS-PROGRESSO-20261120.md`: documentação e recibo parcial.

Nenhuma alteração no e-commerce, checkout, frete, preços, gateway, admins, Auth, Supabase, backend, submissão do formulário, redes sociais públicas, review de produtos, comissões, créditos, dados de candidatas, segredos, publicação ou publicidade.

## Verificações locais

**61/61 testes direcionados PASS** em quatro arquivos (inclui regressões completas do formulário e do funil anônimo C68); TypeScript `tsc --noEmit`, ESLint escopado, Prettier check e Nitro/Vite build sem erros.

Chrome headless localhost, **4/4**: 360×780, 390×844, 768×1024, 1440×900; em cada resolução o progresso foi `[0,1,2,2,3]` ao preencher contato/endereço, depois TikTok opcional, depois Instagram. A prévia não enviou candidatura, a barra e legendas não divulgaram nome/e-mail/telefone/endereço/Instagram, não houve POST, MP4 inicial, erro JavaScript ou overflow, nem ruptura do cabeçalho fixo ou dos IDs da inscrição. Todas as chamadas externas foram bloqueadas no navegador.

A suíte integral da aplicação é responsabilidade do CI GitHub isolado, pois testes de leads do e-commerce não devem ser rodados irrestritos no computador com ambiente configurado. Não há evidência de crescimento de conversão e não fazer alegações de incremento de inscrições.

## Gate de publicação

O Lovable publica o aplicativo **inteiro**. O projeto GitHub `lucassilva1175/vonix-hair-care` contém mudanças comerciais de preço, frete e checkout (PRs #250–252) ainda sem aprovação operacional independente neste fluxo restrito às afiliadas. **Merge do C70 não autoriza deploy compartilhado**. Mesmo com `is_published: true`, confirmar commit do código e versão do bundle público separadamente; C63–C70 só serão live após liberação comercial.

Registrar PR, CI remoto, merge SHA, Lovable SHA e domínio público no recibo local após confirmação efetiva.
