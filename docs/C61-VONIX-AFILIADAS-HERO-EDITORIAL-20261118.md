# C61 Vonix Afiliadas — hero editorial e catálogo original

Data: 18/11/2026 em São Paulo. Base: main 5161ede4c105359cad38a96f5c942ad2192dd4f5. Projeto EXCLUSIVO: Sistema de Afiliadas Vonix Hair. Clone isolado C:\Users\JL\code\vonix-afiliadas-c61-editorial-20261118.

## Referências auditadas
- Skence Creators: https://skence.com.br/pages/skence-creators — apenas composição editorial, não imagens, depoimentos, comissões 15/21%, benefícios VIP, descontos, comunidade nem alegações de resultados.
- Vonix institucional: https://vonixhair.com/sobre e https://vonixhair.com/loja.
- Produtos oficiais e páginas verificadas: https://vonixhair.com/produto/kit-banana-e-mel ; https://vonixhair.com/produto/mascara-reparacao-nutri-repair ; https://vonixhair.com/produto/botox-vonix.
- 3 fotos JPG/WEBP já existem em public/images/products; fotografias de PRODUTOS, não imagens de afiliadas ou creators.
- Lovable project 203d2f84-1058-4ca4-acc3-41a4a5d4e2b5, sincronizado à mesma main antes de começar.

## Código
- src/components/affiliate-editorial-hero.tsx (novo): hero responsivo original, duas colunas; fotos oficiais clicáveis que levam à página correta de cada produto. H1, CTAs e informação de 8% após aprovação preservados; disponibilidade realmente carregada, sem fingir abertura. Sem alegação de produtos grátis, parcerias ou resultados.
- src/components/affiliate-landing.tsx: substitui hero antigo com única foto translúcida, remove tarja decorativa; adiciona faixa informativa verdadeira (candidatura gratuita, seleção individual, 18+, TikTok opcional). Mantém C60 confiança -> reviews autênticos de produto -> condições de ganhos.
- src/routes/seja-afiliada.tsx: scroll-mt-36 para o botão de inscrição alcançar início visível da seção abaixo do cabeçalho sticky.
- src/test/affiliate-c61-editorial-hero.test.tsx: 6 casos sobre proveniência, fontes, atributos de fotos e links, quatro estados do recrutamento, CTA correto e ordem de conteúdo.

## QA
- Full Vitest 764/764 PASS em 82 arquivos; focused 20/20 e expanded 33/33; TypeScript noEmit PASS, ESLint/Prettier PASS, Vite/Nitro build PASS.
- Chrome headless local 360x780,390x844,768x1024,1440x900: fotos carregadas, sem overflow/errors, zero POST de candidatura, CTA chega à seção de inscrição e não fica coberto pelo cabeçalho. Depois do ajuste: topo seção 122/122/144/144px e header 107/107/118/73px.
- Scripts, screenshots e logs C61- são QA local, fora do PR.

## Privacidade e pendências
Sem leitura de candidatas reais, credenciais, arquivos .env, DB; sem alteração em Supabase, admin, e-commerce, checkout ou contratos. Não há depoimentos de afiliadas autorizados nem estatísticas de conversão verificadas; NÃO fabricá-los. A publicação só pode ser declarada após CI, Lovable e custom domain confirmado em Chrome real.
