# C109 — primeira dobra premium: CTA e regras mais cedo no celular

**Sistema:** EXCLUSIVAMENTE Portal de Afiliadas Vonix Hair. Nada do e-commerce.
**Data:** 22/11/2026 BRT.
**Base intocada:** C108 e6a7f979c84324b23951e19b1f78a433729a68c0, branch feat/afiliadas-c86-prova-social-foto-20261121, PR #279 OPEN DRAFT.
**Clone isolado:** C:\Users\JL\code\vonix-afiliadas-c109-20261122; diretório C108 e seus testes/capturas preservados.

## Fontes / fundamento comercial

- Página oficial: https://vonixhair.com/seja-afiliada. Inscrição gratuita, status/seleção individual, 8% sobre vendas elegíveis **após aprovação**; nenhum cadastro garante afiliação, produto grátis ou rendimentos.
- Marca: https://vonixhair.com/. Referência visual da linguagem de creators: https://skence.com.br/pages/skence-creators, **somente inspiração de apresentação**, nunca copiar ofertas, porcentagens, depoimentos nem fotos.
- Lovable: projeto 203d2f84-1058-4ca4-acc3-41a4a5d4e2b5, main bbe1cf06ecdae11b414c5cdc8e2d459899488ec9, revisado somente leitura. Edições mais recentes de e-commerce/catálogo NÃO importadas. PR não está publicado.
- Provas C106/C107: quatro avaliações públicas **de clientes de um produto**, NÃO depoimentos de afiliadas. Três MP4 oficiais com reprodução voluntária e foto original preservados sem mudanças.

## Diagnóstico

O bloco hero inicial ainda ocupava **1.112 px em 360px**, apesar do C108 ter encurtado as etapas e ideias posteriores. O CTA principal aparecia no topo aproximado de **523 px**, e o bloco de fatos oficiais só começava após o hero. Havia espaços largos entre imagem, status, CTAs, descrição, avisos, mini-catálogos e convite às avaliações; todos eram legítimos, mas muitos redundantes para visitante mobile.

## Intervenção

**Arquivo de implementação:** src/components/affiliate-editorial-hero.tsx.

- Compactado **apenas no mobile e tablet (<1024px)**: hero padding vertical 32→20px em celular; grid gap 28→12px; fotografia editorial com mínimo 19→16rem no celular e 23→19rem no tablet, preservando 25rem desktop; microespaços internos, cantos, badges e título de 2.5rem→2.1rem no celular.
- Status real de inscrição continua imediatamente antes do CTA, com componente aria-live/status idêntico e estados OPEN, LOADING, LIMITED, CLOSED, UNAVAILABLE intactos.
- Textos de orientação e ressalvas **não foram excluídos**: descrição da seleção, 8% após aprovação, inscrição gratuita, ausência de estoque e compra obrigatória, aviso de candidatura sem aprovação/vínculo garantido; reduziu-se apenas a escala, espaçamento e leading no celular.
- Link primário #inscricao, secundário #ganhos, acesso às três etapas, convite de compartilhar/WhatsApp e fonte pública oficial preservados.
- Vitrine original com três produtos, miniatura e painel expandível mobile, e ligação com quatro avaliações genuínas de PRODUTO mantida, com resumos visualmente mais compactos; nada de afiliadas inventadas, depoimentos falsos nem vídeo automático.
- Classes lg mantêm altura, layout e espaçamento desktop anterior. Não alterou formulário, dados, consentimento, estados, back-end, carrinho, loja, checkout, Supabase, emails, analytics ou publicação.

## Chrome antes/depois e tradeoff

Viewports reais 360, 390, 768 e 1440, sessão local GET/HEAD, nenhuma candidatura real nem POST, redes terceirizadas tentadas pela loja mas abortadas no QA.

| Viewport | Hero C108 | Hero C109 | Diferença | CTA topo C108→C109 | #inscricao topo C108→C109 |
|---|---:|---:|---:|---:|---:|
| 360 | 1.112 | 920 | **–192 px** | 523→455 (**–68**) | 2.566→2.375 (**–191**) |
| 390 | 1.072 | 874 | **–198 px** | 523→425 (**–98**) | 2.457→2.259 (**–198**) |
| 768 | 1.174 | 957 | **–217 px** | 630→522 (**–108**) | 2.619→2.402 (**–217**) |
| 1440 | 1.117 | 1.117 | **0** | 843→843 | 2.832→2.832 |

Os 4 viewports passaram HTTP 200, zero erro JS, POST ou overflow horizontal, navegação até #inscricao válido com destino único, botões de etapas/estilos acessíveis, 4 avaliações reais disponíveis sem video inicial. A altura da fotografia foi ajustada sem cortar o H1. No navegador, a aparência e origem dos ativos continuam oficiais. **Esses números demonstram redução de rolagem, não aumento de taxa de conversão.** Telas muito pequenas ainda merecem homologação visual antes do lançamento.

Evidências locais não commitadas: qa-artifacts/c109-before/report.json, c109-after/report.json, screenshots page-*.png, steps-*.png, spotlight-*.png e logs. O runner bloqueou requisições externas GTM/Clarity no browser; não declarar ausência de tentativa nem tracking novo.

## Testes e status de liberação

- Novos: src/test/affiliate-c109-first-fold-mobile.test.tsx (9 casos: classe responsive e restauração lg, foto oficial e alt, copy comercial e links, status 5 estados, três produtos, link de avaliação genuína, SSR sem form/POST).
- Contratos existentes C94/C105 foram atualizados SOMENTE para as alturas CSS novas, sem enfraquecer verificações de status/CTA/prova; C89 fica inalterado.
- Suite focada C109/C94/C105/C89 **28/28 PASS em 4 arquivos** com Vitest --pool=threads 1 worker.
- **Vitest integral: 994/994 PASS em 133/133 arquivos, exit 0**, execução `--pool=threads --maxWorkers=1 --fileParallelism=false`, log `qa-artifacts/c109-full-threads.log`. **Prettier --check, ESLint escopado e git diff --check: exit 0**, recibo `qa-artifacts/c109-quality.exit.txt`. **Chrome rigoroso 4/4 PASS** em 360/390/768/1440, incluindo `naturalWidth>0` da foto, H1 completamente dentro do cartão, status `aria-live`, CTA anterior às vantagens, 3 produtos oficiais, link de avaliação genuína, links de inscrição, steps e estilos; arquivo `qa-artifacts/c109-after-final/report.json`. **TypeScript local `tsc --noEmit` exit 2 exclusivamente pelos 3 erros TS2322 herdados do `src/routes/checkout.tsx` (1466–1468), sem erro nos arquivos C109**, log `qa-artifacts/c109-tsc.log`. Resultado CI remoto do SHA será registrado separadamente após o push; não confundir testes locais com aprovação de release.
- Bloqueio anterior conhecido do pipeline: 17 erros TypeScript antigos **fora do portal**, em boleto.ts (7), checkout.tsx (3), produto.$slug.tsx (1) e product-gallery-video.test.tsx (6). Corrigir em escopo e-commerce separado. Local tsc C108 exibia apenas três erros checkout.
- **RELEASE_BLOCKED**: PR #279 OPEN DRAFT, não fazer merge/deploy/publicação; teste real de inscrição, e-mail, admin e código só com permissão específica. Depoimentos de afiliadas aprovadas somente mediante origem verificável e consentimento.
