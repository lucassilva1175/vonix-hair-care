# C95 TURBO — contraste real do hero e seleção com quatro temas compactos

## Origem e baseline verificados (21/11/2026)
- Portal de Afiliadas Vonix Hair, PR #279 DRAFT, continuação exclusiva do C94 (HEAD 9bb2c780...). Lovable/main publicado permanece em 68422d2b8cdc371d8d953168c0fbdbbf4274e955.
- Chrome antes do C95: o h1 com classe Tailwind text-white sobre a foto escurecida de cabelos tinha computed color **oklch(0.28 0.04 10)** (escuro), porque o CSS do próprio AffiliateShell aplicava uma regra de maior especificidade a todos os h1. A fotografia tinha overlay escuro, portanto o contraste intencional não existia. A solução deve fixar apenas o h1 sobre foto, sem alterar cabeçalhos do e-commerce ou dados de negócio.
- A seção #criterios mostra quatro embalagens de produtos grandes e já exibidas em outras galerias, com cartões de altura 396px no celular 360 e 483px em 768. Altura total da seção: 930px em 360, 948px em 390, 1587px em 768, 948px em 1440. Fonte de medição: c95-baseline.json. Esses quatro itens não eram depoimentos nem critérios definitivos de aprovação.
- A comparação Skence Creators fornece apenas referência de hierarquia editorial. Não copiar fotos de creators, produtos grátis, cupons, percentuais ou benefícios exclusivos Skence. Website oficial Vonix /seja-afiliada é a fonte dos termos do programa já preservados.

## Mudanças C95
1. H1 original “Seu jeito de criar. Nossa paixão por cabelos.” mantém o hero com foto própria categoria Cachos, e ganha cor inline branca de alta precedência, evitando a regra genérica de H1 escuro do AffiliateShell. Não alterar a loja nem outras páginas.
2. #criterios passou a usar quatro cartões de afinidade compactos, ainda com as **quatro imagens originais do catálogo Vonix** (thumbnails pequenas), quatro tags, quatro títulos e explicações completas; UX mobile horizontal com swipe/teclado e layout em duas/quatro colunas em telas maiores.
3. Texto esclarece que identidade, afinidade capilar, criatividade e comunicação **não são requisitos fixos nem promessa de aprovação**. Elegibilidade continua 18+, TikTok opcional e inscrição gratuita.
4. Preservados #criterios, #perfis, #formatos, #inscricao, quatro reviews reais de produtos, preços/condições, status de recrutamento e todos os links oficiais. Nenhuma integração de candidatos, dados privados, cookies, envios, Auth/Supabase ou checkout/e-commerce alterada.
5. O menu horizontal no celular agora também inclui o atalho **Para quem é** para #criterios; o menu de desktop já continha o destino. Mantidos teclado, foco, swipe e todos os atalhos anteriores.
6. Contratos C95 com SSR, fonte e dimensão das imagens, quatro cards e compatibilidade do status/CTA; atualização dos contratos anteriores C53, V2 e C60 para o novo nome semântico da região e o novo atalho, sem mascarar falhas.

## Gate de entrega
- QA Chromium 360/390/768/1440: computedStyle H1 branco, foto carregada, 4 cards com imagens oficiais, alturas antigas/novas, scroll/navegação, sem JS errors/overflow/POST/MP4 automático; screenshot do hero e da seção.
- Vitest focado e completo, Prettier/ESLint, CI GitHub branch atual, revisar erros de TypeScript e distinguir falhas preexistentes do checkout.
- **NÃO MESCLAR/PUBLICAR** o PR #279 enquanto a main compartilhada apresentar três TS2322 preexistentes em src/routes/checkout.tsx nas linhas 1466–1468; correção/homologação deve ocorrer em fluxo do e-commerce independente.
- Modificações limitadas a componentes do próprio portal (affiliate-editorial-hero.tsx, affiliate-landing.tsx, affiliate-shell.tsx), testes C95/C53/V2/C60 e este documento; não foi alterado nenhum código do checkout/e-commerce. Modo turbo segue a referência global, sem ajustes no Windows.
