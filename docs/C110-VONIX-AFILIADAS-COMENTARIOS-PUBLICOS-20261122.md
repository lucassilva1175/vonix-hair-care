# C110 — comentários públicos reais de três produtos Vonix, sem falsa prova de afiliação

Data: 22/11/2026 (BRT). Projeto exclusivo: Portal de Afiliadas Vonix Hair. Base C109 SHA 60d968a39ab83e731b24be2be120f761513a8546 em PR #279 DRAFT. Clone isolado C:\Users\JL\code\vonix-afiliadas-c110-20261122; checkpoint C109 e e-commerce preservados.

## Fontes
A homepage oficial https://vonixhair.com/ já exibe uma seção de comentários públicos em redes sobre produtos Vonix, e o projeto possui a fonte exata src/data/comentarios-instagram.json usada pela vitrine e-commerce existente. Três comentários, de linhas diferentes, são agora acessíveis de forma opcional:
- @aleandriele: “Impecável, um cabelo bem hidratado” — SOS Reconstrutor Capilar — https://www.instagram.com/bellaoliverpxt/reel/DfilOYyh_Zz/
- @darislainedocuras: “Desmaia mesmo amei” — Kit Desmaia Cabelo — https://www.instagram.com/bellaoliverpxt/reel/DfZllsnOx6I/
- @irene__soares: “Amo queria o meu tá acabando” — Perfume Capilar Vonix — https://www.instagram.com/vonixhairoficial/p/DfXTxhHxjHZ/

As fontes são postagens sobre produtos, algumas de terceiros. Os links NÃO provam que o comentário ainda está visível nem compra verificada. As pessoas NÃO são identificadas como afiliadas, creators contratadas, ganhadoras de comissão, nem existe atribuição de vendas. As quatro avaliações publicadas de Botox Vonix permanecem separadas e intactas. Referência https://skence.com.br/pages/skence-creators usada apenas para inspiração visual; taxas, fotos, depoimentos e promessas Skence não são termos Vonix. Site de programa https://vonixhair.com/seja-afiliada é fonte das condições oficiais: candidatura gratuita, seleção individual e remuneração de aprovadas condicionada a vendas confirmadas. Projeto Lovable read-only 203d2f84-1058-4ca4-acc3-41a4a5d4e2b5, main cfcfa79520df715e9a7cb2b52c8f21dc199093ad: últimas mudanças e-commerce, não importadas.

## Implementação
Arquivo alterado exclusivamente no portal: src/components/affiliate-customer-voice-teaser.tsx. O código do e-commerce e o JSON fonte NÃO foram modificados. Botão nativo “Ver comentários sobre outros 3 produtos”, atributo aria-expanded e aria-controls apenas aberto. Ao abrir, seção acessível com três cards de origem: comentário literal, @ exato, nome do produto, URL HTTPS da publicação; target=_blank, rel=noopener noreferrer. Painel fechado NÃO monta links externos, iframe, vídeo, tracking ou POST. O aviso informa que são comentários já exibidos na loja, alguns em postagens de terceiros, não prova de compra ou participação no programa; publicações podem mudar. O botão fecha e desmonta os cards. Mantém original C106 (quatro avaliações Botox e fotos) e C107 (três vídeos voluntários), CTA #inscricao e status reais do portal.

Novo teste src/test/affiliate-c110-public-product-comments.test.tsx: 10 cenários originais de SSR sem painel, disclosure acessível e foco, fidelidade @↔texto↔produto↔URL, origem e limitações, fechamento sem requests, 4 avaliações originais, vídeos sem autoplay. Focused C101/C106/C107/C110: 29/29 PASS.

## Medição antes/depois no Chrome, viewport altura 900 px
| Largura | Teaser fechado C109 → C110 | Topo do formulário C109 → C110 | Teaser após abertura voluntária |
|---|---:|---:|---:|
| 360px | 443→490 (+47px) | 2375→2422 (+47px) | 1126px |
| 390px | 409→456 (+47px) | 2259→2307 (+48px) | 1071px |
| 768px | 366→414 (+48px) | 2402→2450 (+48px) | 767px |
| 1440px | 349→397 (+48px) | 2832→2880 (+48px) | 710px |

É uma troca explícita: botão adicional ocupa 47–48px antes do formulário, enquanto três outros comentários reais permanecem opcionais. Nenhuma melhoria de conversão ou faturamento foi medida. Chrome 4/4 PASS, HTTP200, autor/texto/URL correspondentes, links Instagram nunca abertos automaticamente, nenhuma chamada nova externa causada pelo clique; POST 0, JS errors 0, overflow 0, #inscricao único preservado. GTM/Clarity do site existente tentaram carregar, mas o QA bloqueou requests externos. Logs e capturas locais não versionados: qa-artifacts/c110-before e c110-after.

## Gates
Regressão integral local Vitest: **1.004/1.004 PASS em 134/134 arquivos**, exit 0, pool threads, apenas 1 worker; logs qa-artifacts/c110-full.log e c110-full.exit.txt. Focados C101/C106/C107/C110: **29/29 PASS**. Prettier --check, ESLint escopado e git diff --check: **exit 0**, recibo qa-artifacts/c110-quality.exit.txt. TypeScript local tsc --noEmit exit2 somente pelos **3 erros TS2322 anteriores** em src/routes/checkout.tsx linhas 1466–1468; **zero C110 errors**, log qa-artifacts/c110-tsc.log. Chrome: 4/4 principais e mais 3/3 larguras extras **320/414/1024**, total 7/7 verificações PASS, além de snapshots screenshots locais e comentários abrindo/fechando. No teste extra a primeira tentativa falhou APENAS por conversão indevida de texto acentuado em PowerShell no próprio script de QA (Mojibake na query da âncora e label dos estilos); corrigida para seletores ASCII por ID e repetido 3/3 PASS sem mudar o código. Erros CI de checkout, boleto e galerias de e-commerce historicamente preexistentes não pertencem a este Workloop. O CI do SHA exato será documentado depois de push, sem ser presumido verde. Gate RELEASE_BLOCKED, PR #279 aberto DRAFT, sem merge, deploy, writes no Lovable, contas/PII ou envios reais. Depoimentos de AFILIADAS reais exigem relatos e consentimento antes da inclusão.
