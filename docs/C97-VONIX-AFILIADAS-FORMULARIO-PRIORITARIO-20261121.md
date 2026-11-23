# C97 TURBO — formulário prioritário, condições completas preservadas

## Diagnóstico em 21/11/2026
Continuação EXCLUSIVA Portal de Afiliadas Vonix Hair após C96, PR #279 OPEN DRAFT, branch feat/afiliadas-c86-prova-social-foto-20261121. Main e Lovable publicada SHA 68422d2b8cdc371d8d953168c0fbdbbf4274e955, sem alterações.

Referência Skence Creators apresenta candidatura cedo, mas suas fotografias, descontos, percentuais e benefícios comerciais não podem ser copiados. Acervo Vonix: produtos originais e 4 opiniões verdadeiras de CLIENTES sobre produtos (3 vídeos e 1 foto), não depoimentos de afiliadas comprovadas. Não criar testemunhos ou ganhos.

No Chrome C96 a seção real de inscrição começava em Y4716 (360px), Y4578 (390px), Y5032 (768px), Y3736 (1440px), pois prévia de avaliações e cartões extensos de ganhos ocupavam juntos cerca de 2245px antes do formulário no celular 360. A comissão essencial de 8% após aprovação, disponibilidade oficial e seleção individual já aparecem no hero, então era possível inverter a ordem.

## Mudanças C97
1. Componente de oferta agora aceita placement intro (hero + requisitos essenciais), details (4 prévias reais de produtos, 3 benefícios condicionais, cálculo ilustrativo opcional, CTA) e all (comportamento antigo padrão para consumidores e contratos independentes).
2. Ordem da rota agora é: HERO → elegibilidade gratuita/18+/TikTok opcional → etapas → checklist recolhível → FORMULÁRIO → próximos passos → FAQ → avaliações rápidas reais → ganhos/condições completos → guia C91 → gate C96 de catálogo/criação opcional.
3. Preservados links/IDs #inscricao, #ganhos, #avaliacoes-rapidas, #avaliacoes-produtos, #duvidas e demais âncoras; todos blocos renderizados uma única vez. API do estado de recrutamento permanece fonte de verdade: não habilita envios fechados ou indisponíveis, e prévia não submete.
4. Condições após aprovação: 8% sobre vendas confirmadas/pagas; R$500 a cada R$10 mil em vendas elegíveis se regras de bônus satisfeitas; supervisora sujeita a metas/acordo. Sem promessa de renda, sem obrigatoriedade de comprar produtos para candidatar-se.
5. Mudanças apenas affiliate-landing.tsx, rota seja-afiliada.tsx, novo teste C97, atualizações pontuais dos contratos affiliate-recruitment-page.test.tsx e affiliate-c66-application-steps.test.tsx, este documento. Nenhum checkout/e-commerce, Auth, Supabase, banco, dados pessoais, envios reais ou publicação.

## Evidência Chrome Playwright — início do formulário C96 → C97
| Tela | Antes | Depois | Redução |
| --- | ---: | ---: | ---: |
| 360px | 4.716px | 2.472px | 2.244px (47,6%) |
| 390px | 4.578px | 2.402px | 2.176px (47,5%) |
| 768px | 5.032px | 2.653px | 2.379px (47,3%) |
| 1440px | 3.736px | 2.051px | 1.685px (45,1%) |

Chrome 4/4 PASS: ordem real dos elementos; hero com 8%; 4 avaliações originais e 3 benefícios preservados; links #ganhos, #inscricao, #avaliacoes-rapidas operacionais; link #avaliacoes-produtos abre o gate C96 com 4 opiniões verdadeiras de PRODUTOS (3 vídeos e uma foto); zero POST, MP4 automático, erros JS ou overflow. Relatórios e screenshots em C:\Users\JL\code\vonix-afiliadas-c86-20261121\browser-artifacts-c97\c97-browser-report.json, c97-before.json e c97-after.json. Isso mede layout, NÃO taxa de conversão.

## QA e bloqueio de publicação
Testes novos C97 de ordem, SSR, links, condições e preservação de contrato standalone; contratos antigos C64/C66 atualizados apenas à nova ordem real. Vitest completo, Prettier/ESLint e GitHub Actions sobre HEAD definitivo são exigidos. PR #279 OPEN DRAFT, sem merge ou publicação Lovable. Os 3 TS2322 preexistentes do checkout em src/routes/checkout.tsx linhas 1466-1468 são do e-commerce compartilhado: corrigir e homologar somente em fluxo independente, sem misturar com Afiliadas. CI geral 2/2 e autorização explícita antes de publicar.

Regra permanente modo turbo documentada em C:\Users\JL\Documents\Autonomous-Global-Modo-Turbo.md, sem ajustes do computador.
