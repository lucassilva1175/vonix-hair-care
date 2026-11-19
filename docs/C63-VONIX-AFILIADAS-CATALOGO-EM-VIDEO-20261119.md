# C63 — Portal de afiliadas Vonix | Catálogo em movimento

Data local: 19/11/2026; base GitHub main c24f3000030e350f9cba807512d9ba8d456f3fb7 (branch isolada feat/afiliadas-c63-vitrine-videos-20261119). Fonte visual de referência: https://skence.com.br/pages/skence-creators — apenas ritmo editorial, agrupamento de imagens e CTA, não comissões, materiais, criadoras ou promessas da Skence.

## Material verificado

- Fonte existente do próprio site: src/data/provas-em-video.json. Produto e vídeo mapeados pela chave id e slug oficial, sem criação de material.
- banana-mel: /provas/banana-mel.mp4 e poster /provas/banana-mel.jpg → /produto/kit-banana-e-mel
- botox-1: /provas/botox-1.mp4 e poster /provas/botox-1.jpg → /produto/botox-vonix
- fio-1: /provas/fio-1.mp4 e poster /provas/fio-1.jpg → /produto/progressiva-fio-de-luz
- Os três MP4s já estavam em public/provas, todos HEAD HTTP200 video/mp4 em https://vonixhair.com; imagens correspondentes existentes no repositório.
- Esses arquivos são mídia de PRODUTO do catálogo e NÃO depoimentos, provas de resultados de afiliadas, creators contratadas ou promessas de parceria, comissão e faturamento. Nenhuma atribuição de pessoa ou consentimento foi inventada.

## Implementação

- Novo src/components/affiliate-catalog-in-motion.tsx: seção visual premium e compacta com três vídeos em cards, scroll horizontal no celular e grade no desktop, links de cada produto, explicação de que as imagens ilustram catálogo e não parceria, CTA para #inscricao com copy dependente de recruitmentOpen.
- Videoplayer nativo com controls, playsInline, preload=none, poster real, sem autoplay e sem dependência de tracker/terceiro. Nenhum conteúdo de inscrição armazenado.
- src/components/affiliate-landing.tsx: inserção logo após AffiliateSellingFlow e antes dos critérios, preservando hero C61, avaliações C62, comissões e todo formulário/admin existentes.
- src/test/affiliate-c63-catalog-motion.test.tsx: quatro casos de origem/vínculo id+slug+arquivo, poster, controls e preload, CTA conforme abertura, e ordenação das seções.

## Verificações

- Vitest integral 777/777 PASS em 85 arquivos em 19/11/2026, TypeScript --noEmit PASS após corrigir narrowing de testes, ESLint e Prettier dos arquivos alterados PASS, Vite/Nitro build PASS, git diff --check PASS.
- Chrome headless local 360x780,390x844,768x1024,1440x900 PASS na execução final: três vídeos originais e links, zero requests MP4 antes de clique, zero POST de candidatas, nenhum overflow horizontal ou erro JS, âncora de candidatura acessível abaixo do cabeçalho, vídeo da linha Banana e Mel reproduzido no desktop (duration 30s). A primeira execução de navegador teve falso negativo no tablet porque leu o hash antes de navegação terminar; corrigido o teste para aguardar explicitamente a âncora. Nenhuma alteração de formulário foi necessária.
- Artefatos locais de QA: C63-browser-qa.cjs, C63-browser-retry.log, C63-local-shots (não subir ao GitHub).

## Gate de publicação

- Live https://vonixhair.com/seja-afiliada já tem C61 e C62 no bundle index-Dm6EFbP6.js, mas a main atual inclui o PR #250/#251/#252 (preços, política/frete, checkout, várias novas mídias) ainda sem validação explícita em produção nesta auditoria. Lovable deploy publica TODO o projeto, não somente a rota do programa.
- Publicar a C63 via Lovable somente após conferência/validação separada das mudanças do e-commerce. Não substituir ou reverter decisões da equipe de e-commerce.
- Descoberta importante: o commit do PR #250 removeu links de “Seja afiliada” do menu, home e popup, preservando rodapé e URL direta; pode reduzir descobrimento orgânico do programa, mas só reintroduzir em navegação geral mediante decisão de negócio.
