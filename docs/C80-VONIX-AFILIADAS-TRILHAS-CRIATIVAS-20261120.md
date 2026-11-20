# C80 — Três trilhas criativas e navegação premium do portal Vonix Afiliadas

Data: 20/11/2026. Exclusivo programa **Afiliadas Vonix Hair**, continuidade pós C79, base main/Lovable `de1dd0248d6282e330d6d43e069cb3504f6126e3`. Não confundir com e-commerce.

## Fontes e limites

- Portal público oficial: `https://vonixhair.com/seja-afiliada`.
- Catálogo oficial: imagens WebP já existentes `/images/products/kit-banana-e-mel.webp`, `/images/products/mascara-reparacao-nutri-repair.webp`, `/images/products/botox-vonix.webp`.
- Referência editorial: `https://skence.com.br/pages/skence-creators`, apenas quanto à clareza dos caminhos de conteúdo. Skence tem fotos, ofertas de descontos, comissões específicas, comunidade e cupons próprios; não migrar claims, fotos, identidade, pessoas, métricas, ganhos ou programas.
- Nenhuma foto de produto é depoimento de afiliada, nenhum caminho é status de aprovação ou contrato.

## Código C80

1. `src/components/affiliate-creator-paths.tsx`: preserva **Rotina/comunidade** e **UGC/fotos e vídeos**; adiciona terceira trilha de **conteúdo informativo e cuidado capilar**, com foto de catálogo Botox Vonix real, exemplos de pautas responsáveis, sem promessas de eficácia ou de atuação profissional. Cada opção é uma inspiração e pode ser combinada com as outras.
2. Converte navegação de 2 para 3 tabs roving, com Left/Right reversas e wrap, Home/End corretas, `aria-selected`, `aria-controls`, `aria-labelledby`, `tabIndex` de uma única aba ativa, etiquetas acessíveis consistentes e foco visível. Ícones semânticos: Heart/Camera/BookOpen.
3. Tela móvel: 3 seletores compactos em grade, rótulos abreviados visualmente porém nomes completos em `aria-label`, painel de conteúdo sem overflow, âncora `#perfis` com offset para header fixo.
4. `src/components/affiliate-shell.tsx`: novo acesso **Ideias de conteúdo** tanto na barra mobile quanto no menu desktop, com destino real `#perfis`, sem alterar CTA de inscrição ou navegação do e-commerce.
5. Contratos `src/test/affiliate-c54-conversion.test.tsx` e `src/test/affiliate-c60-proof-navigation.test.tsx` atualizados para 3 tabs e âncora real, preservando verificação de navegação/sem depoimentos falsos.
6. Novo `src/test/affiliate-c80-creator-tracks.test.tsx`: verifica terceiro produto oficial, ausência de promessas falsas, ausência de requests/captura de dados, controle por clique, Left/Right/Home/End e segurança da estrutura.

## QA verificado localmente

- Formatação Prettier, ESLint, TypeScript `--noEmit` e `git diff --check`: códigos de saída 0.
- Vitest focal: **17/17**, quatro arquivos, incluindo C54, C60, C79, C80.
- Browser Chrome real local no `http://127.0.0.1:5301/seja-afiliada`: **C80_CHROME PASS failures=0**, 360x780, 390x844, 768x1024, 1440x900. Navegação mobile e desktop para `#perfis` posiciona o título entre 136 e 160px abaixo do viewport, três tabs reais, foto do terceiro produto presente, troca de tabs via click físico e Left/Right/Home/End, sem overflow horizontal, sem exceções JS ou imagens 404. **Zero candidaturas POST**; vídeo MP4 bloqueado no teste.
- Um ensaio de Chrome anterior clicou em uma aba enquanto Playwright ainda fazia scroll automático para essa seção distante: o estado foi medido prematuramente. O teste foi corrigido para rolar e estabilizar o viewport, depois clicar fisicamente, verificar `aria-selected` e percorrer setas; quatro resoluções passaram. Não se corrigiu comportamento de negócio nem se passou a usar clique sintético como substituto de interação real.

## Guardas

GitHub/Lovable podem sincronizar o código sem atualizar o domínio. Produção compartilhada não deve ser publicada sem homologação independente das mudanças de checkout/frete/preço do e-commerce. Sem leituras de PII, senhas ou .env, sem Supabase, Auth, e-mails, dados reais, candidatura, pagamento ou deploy. Sem comprovação de incremento de conversão.
