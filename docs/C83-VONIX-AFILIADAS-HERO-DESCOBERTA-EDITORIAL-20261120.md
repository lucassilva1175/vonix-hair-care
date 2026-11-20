# C83 — Hero de descoberta editorial e vitrine responsiva Vonix Afiliadas

Data: 20/11/2026. Projeto **exclusivo de Afiliadas Vonix Hair**, após C82, base GitHub/Lovable `640224c4e56b2337fc61f85816a74a6a02823d2d`.

## Referência e evidência

- Referência editorial `https://skence.com.br/pages/skence-creators`: experiência visual de creator e navegação por formatos, mas não copiar layout pixel a pixel, imagens, pessoas, métricas, cupons, descontos, promessas de comissões, produtos, benefícios ou resultados.
- Vonix oficial `https://vonixhair.com/sobre` e catálogo `/loja`: origem para a informação institucional, produtos e comunicação real. Nenhuma avaliação de cliente é depoimento de afiliada; não há creators com autorização para prova social.
- O hero mantém seus três links de **produtos oficiais** (`/produto/kit-banana-e-mel`, `/produto/mascara-reparacao-nutri-repair`, `/produto/botox-vonix`) e as fotos existentes em WebP/JPG. Não adicionamos imagens externas, campanhas fictícias ou mídia autoplay.

## Mudanças C83

1. `src/components/affiliate-editorial-hero.tsx`: setas **Anterior/Próximo** em celulares e tablets (`<1024 px`), contagem dinâmica **1 / 3** a **3 / 3**, botões com mínimo de 44 px, `aria-label`, `aria-live`, foco visível, disabled de verdade nas extremidades. A rolagem continua por toque e teclado no elemento original.
2. Medições reais `scrollWidth`, `clientWidth`, `scrollLeft`, largura do card e gap (12 px), `ResizeObserver` no trilho e nos 3 cards, `requestAnimationFrame` + `load` + `resize` para atualização após hidratação. Respeita `prefers-reduced-motion`. Desktop conserva mosaico original sem setas.
3. Atalho `#conheca-a-vonix` leva da legenda da vitrine ao bloco institucional existente. Não há duplicação de seções nem formulário. CTA `#inscricao`, estados `open/loading/limited/closed/unavailable`, condições e advertência de seleção permanecem.
4. Novo `src/test/affiliate-c83-hero-gallery.test.tsx`: fontes dos 3 produtos, ausência de prova falsa, banner, contador/limites/scroll, nenhum fetch, botão e atalho institucional.

## QA

- Vitest C61+C73+C78+C83: **21/21 PASS**, 4 arquivos, sem alteração de contratos antigos.
- Chrome real em `http://127.0.0.1:5301/seja-afiliada`, 360×780, 390×844, 768×1024, 1024×768, 1440×900: **C83_CHROME PASS failures=0**, 5/5. Em 360,390,768 as setas avançam 2 vezes ao fim, contador 3/3, botão Próximo desabilitado e Anterior restaura navegação; em 1024/1440 botões não aparecem, mosaico preservado. Links aos produtos originais e ao bloco institucional, sem overflow horizontal, sem console error, sem 404 de fotos, sem POST ou vídeo.
- A primeira tentativa de browser falhou por indisponibilidade do servidor local (ERR_CONNECTION_REFUSED), não por defeito da interface; ambiente Vite foi reiniciado e 5/5 verificações passaram.
- Formatação Prettier PASS. CI GitHub deve validar todos os testes, TypeScript, ESLint e build de toda a aplicação antes de integrar.

## Regras de segurança

Trabalhar apenas frontend editorial de afiliadas e testes; não alterar e-commerce, pedidos, cálculo de frete, preços, Auth, Supabase, DB, e-mails, ingressos, senhas, tokens ou dados reais de candidatas. Não ler `.env`, segredos, PII ou banco. Sem inscrição real nem publicação da loja compartilhada, que ainda requer homologação comercial independente. Nenhuma alegação de aumento de conversão sem métricas reais.
