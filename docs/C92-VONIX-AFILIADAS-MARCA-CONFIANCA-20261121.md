# C92 TURBO — credibilidade verificável e uma única explicação da candidatura

## Por que mudar
Após C91, o portal já apresenta as três etapas originais ANTES do formulário, mas repetia as mesmas etapas em uma segunda seção #como-funciona DEPOIS da inscrição (cerca de 705 px de rolagem a 360 px). A área institucional reutilizava dois packshots de embalagens já visíveis em outras seções. O objetivo é diminuir repetição e tornar a história da marca visual e verificável, sem inventar afiliadas, pagamentos ou resultados.

## Fontes verificáveis
- Vonix Hair /sobre (consultado em 21/11/2026): a marca declara **mais de 480 produtos vendidos entre site e atendimento por WhatsApp**. É informação institucional própria, não auditoria independente. O novo bloco aponta explicitamente para /sobre.
- Foto existente no repositório: public/images/categorias/frizz.jpg, 480×480, 28.649 bytes. Imagem editorial de categoria, NÃO representa afiliada nem resultado de parceria.
- Skence Creators: referência de hierarquia visual, sem copiar materiais, condições comerciais ou supostos depoimentos.

## Mudança implementada
1. #como-funciona agora está dentro de AffiliateApplicationStepsPreview, no conteúdo original #candidatura-etapas ANTES de #inscricao. Segunda seção C90 duplicada foi eliminada, navegação e âncoras preservadas.
2. AffiliateBrandTrust troca dois packshots repetidos por uma foto de cabelos e inclui quadro editorial de 480+ produtos vendidos pela marca, segundo /sobre; não é número de afiliadas ou renda, fonte oficial clicável.
3. Preservados três fatos com links oficiais /loja, /sobre, /politica-de-frete; produto reviews, CTA de candidatura, condições comerciais e distinção produto vs prova de afiliadas.
4. Regressões C58/C90/C53/recrutamento atualizadas e novo C92 para SSR, âncoras, fonte e autenticidade.
5. Nenhuma alteração em checkout/e-commerce/frete/estoque, pagamentos, Auth, Supabase, PII, banco ou envios reais.

## Verificações e publicação
- Chrome 360/390/768/1440: altura da página/brand/etapas original, botão Como funciona, assets, links, sem erro JS/overflow/POST/MP4 automático.
- Vitest dirigido e completo, Prettier/ESLint, GitHub Actions e gate 2/2.
- PR #279 permanece DRAFT, não mesclar nem atualizar Lovable enquanto o checkout compartilhado mantiver três TS2322 preexistentes em checkout.tsx 1466-1468; resolver em fluxo separado do e-commerce.
