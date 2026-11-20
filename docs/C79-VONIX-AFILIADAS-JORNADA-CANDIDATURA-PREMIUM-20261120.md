# C79 — Jornada premium de candidatura Vonix Hair

20/11/2026, continuação **exclusiva** do portal de afiliadas Vonix Hair após C78 SHA `84797f82a714c893237d2575fb64284659f13aa7`.

## Pesquisa e limites

Comparação entre site público `https://vonixhair.com/seja-afiliada`, Lovable `203d2f84-1058-4ca4-acc3-41a4a5d4e2b5`, código da mesma branch main e o modelo de referência `https://skence.com.br/pages/skence-creators`. A Skence possui creators, fotografias e ofertas próprias (desconto em produto, comissões diferentes, benefícios VIP), sem comprovação de que essas ofertas se apliquem à Vonix. **Não reproduzir essas promessas, assets, números ou fotos e não apresentar clientes como creators.**

Já havia 3 etapas públicas de candidatura em texto, formulário único com 3 grupos de progresso (contato/endereço/Instagram) e catálogo oficial com fotos reais. Lacunas observadas: a orientação anterior ao cadastro era pouco visual e os itens do progresso não permitiam navegação direta.

## Implementado

1. `affiliate-application-steps-preview.tsx`: guia editorial de **3 cartões visuais** responsivos (trilho horizontal no celular e grade em desktop), com fotos WebP do catálogo real Kit Banana e Mel, Kit Cronograma Capilar e Botox Vonix. Sem fotos de afiliadas, vídeo carregado automaticamente, novos links externos ou marketing fictício. Mantém as três mensagens originais de avaliação e código privado e o caminho para `/consultar-candidatura`. Introduz `#candidatura-etapas` e aviso de que são fotos de produtos.
2. `affiliate-simple-form.tsx`: indicador de 3 grupos existente passou a ter **três links de salto** para as seções de contato, endereço e Instagram, com altura mínima de alvo 56 px, estados informados/pendentes, foco e scroll offset adequado ao header sticky. Âncoras são IDs fixos, sem dados de candidatas nem código privado nos URLs. Nenhuma mudança no schema, quantidade de dados, assinatura de request, consentimento LGPD, backend, emissão de código, anti-duplo-envio ou estados de prévia.
3. `affiliate-editorial-hero.tsx`: link de baixo atrito para ler o passo a passo antes de enviar, preservando o CTA principal e a divulgação condicional do programa.
4. `affiliate-c79-creator-journey.test.tsx`: valida a origem local das 3 imagens, ausência de afirmações falsas, estado preview sem POST e navegação sem expor dados.

## QA local

- Formatação Prettier aprovada.
- 17/17 testes focados nos componentes C79 e contratos C66/C70/C53/C78 aprovados.
- Chrome real em 360x780, 390x844, 768x1024 e 1440x900: `C79_CHROME PASS failures=0` no `C79-browser-qa2.log`. A página não apresentou overflow horizontal, JS errors, imagens 404, autoplay ou candidaturas POST. O link do hero para o guia e o salto do progresso ao grupo Instagram funcionaram, mantendo alvo após o header. Um teste inicial requeria o botão prévia mesmo quando o cadastro está aberto; o teste foi corrigido para aceitar a exibição direta de formulário em estado aberto.
- ESLint, TypeScript e git diff check aprovados (ver `C79-build-status.txt`).

## Restrições de release e autenticação

Somente arquivos de frontend de afiliadas + testes e este documento serão integrados. Sem ações em Supabase, contas, dados reais, eventos de lead, pagamentos, checkout, preço, frete ou publicação. O site oficial pode continuar com bundle antigo apesar da sincronização Lovable/GitHub. Qualquer publicação exige homologação separada das alterações comerciais do projeto compartilhado.

### C79B — regressão de navegação testada na página integral

O CI inicial mostrou um teste legado C60 que montava apenas a landing introdutória, sem o novo guia `#candidatura-etapas` presente na rota real. A correção inclui `AffiliateApplicationStepsPreview` na mesma árvore de teste, em vez de dispensar a verificação de âncoras. Nova rodada C60/C79/C66/C70: 12/12 PASS; TypeScript, ESLint, Prettier e diff check 0. A integridade dos destinos dos links continua exigida.
