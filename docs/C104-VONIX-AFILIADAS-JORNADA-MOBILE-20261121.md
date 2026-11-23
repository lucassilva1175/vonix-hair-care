# C104 — etapas mobile compactas e candidatura mais próxima

**Data:** 21/11/2026 (America/Sao_Paulo). **Projeto exclusivo:** Portal de Afiliadas Vonix Hair. Não é o e-commerce Vonix Hair.
**Base segura:** C103 `37ed58e81e45497f6e5051b7d25b918c18034643`, branch do PR DRAFT #279 `feat/afiliadas-c86-prova-social-foto-20261121`.
**Cópia isolada:** `C:\Users\JL\code\vonix-afiliadas-c104-20261121`; checkpoints C103/C102 não modificados.

## Contexto e fontes

- Material público do programa em [Vonix Hair — Seja uma afiliada](https://vonixhair.com/seja-afiliada), catálogo oficial, avaliações de clientes claramente identificadas; a referência [Skence Creators](https://skence.com.br/pages/skence-creators) foi considerada só como inspiração de apresentação. Não importar benefícios, porcentagens, cupons, imagens de pessoas, depoimentos ou promessas de outras empresas.
- Projeto Lovable `Vonix Haircare Showcase` `203d2f84-1058-4ca4-acc3-41a4a5d4e2b5`, main publicado `fdb503eacd0d69499f549f1b6e4f13699698a3a0` consultado; alterações C100–C104 vivem **apenas no PR GitHub**, sem deploy.
- A etapa anterior C103 já simplificou Contato → Instagram → Endereço e tornou TikTok opcional recolhido. A análise C104 deve avançar o funil sem acrescentar mais blocos e sem inventar provas de afiliadas.

## Problema confirmado em navegador real

Na cópia **intacta C103**, auditamos o navegador Chrome headless em 360, 390, 768 e 1440 px. A seção `#candidatura-etapas` ocupava até 850 px antes da inscrição. O usuário via um carrossel com cartões extensos e controles de deslize, antes do formulário real; o objetivo era preservar as informações, reduzindo o percurso até o CTA.

| Largura | Etapas C103 | Etapas C104 | Redução da seção | Início do formulário C103 | Início C104 medido |
|---|---:|---:|---:|---:|---:|
| 360 px | 670 px | 342 px | 328 px | 2.937 px | 2.609 px |
| 390 px | 638 px | 342 px | 296 px | 2.813 px | 2.548 px* |
| 768 px | 850 px | 433 px | 417 px | 3.094 px | 2.677 px |
| 1440 px | 698 px | 702 px | −4 px | 2.734 px | 2.738 px |

*Em 390 px, a posição absoluta do formulário pode variar com a altura final do hero após hidratação, mas a redução medida da própria seção foi de 296 px. Não confundir economia de pixels com conversão comprovada.*

Métricas originais: `C103/qa-artifacts/c104-baseline.json`; novas medidas, estado interativo e capturas: `C104/qa-artifacts/c104-browser/report.json`, imagens `compact-<largura>.png` e `expanded-<largura>.png`. Esses artefatos locais não contêm dados reais de candidatas e ficam **fora do commit**.

## Implementação

- `src/components/affiliate-application-steps-preview.tsx`: a tela até 1023 px apresenta **três linhas compactas e expansíveis**; cada etapa mostra ícone, título e número, com detalhes abertos **somente por ação da pessoa**. Um novo clique recolhe; abrir outra etapa fecha a anterior.
- Interações com `<button type="button">`, `aria-expanded`, `aria-controls`, controle de foco por teclado e conteúdo condicionalmente oculto pelo atributo `hidden`. Respeita preferência `prefers-reduced-motion` nas transições. Sem autoplay, rede ou segunda inscrição.
- Desktop a partir de 1024 px mantém três cartões com as mesmas imagens dos produtos oficiais, as mesmas instruções e apresentação editorial.
- Preservei `#candidatura-etapas`, `#como-funciona`, `vonix-c66-application-steps`, `vonix-c79-steps-rail` e três `vonix-c79-step-card` para navegação e contratos existentes. A navegação por setas de um carrossel que não existe mais no celular foi retirada, para não apresentar controle enganoso.
- Informações mantidas integralmente: inscrição gratuita, Instagram e seguidores, TikTok opcional, endereço, guardar código privado, seleção individual, sem prazos de aprovação ou remuneração garantidos, fotos do catálogo que **não representam afiliadas**.
- C100 (estilos), C101 (avaliação real de produto), C102 (condições comerciais com ressalvas) e C103 (formulário) permanecem intactos. Nenhuma alteração em backend, token privado, políticas, API, Supabase, pagamentos, checkout, boleto, taxas ou publicação.

## Evidência de qualidade

- Testes existentes de C66/C79/C90/C92/C98/C99 ajustados/validados sem descaracterizar contratos; a suíte antiga de setas/scroll C99 foi atualizada para conferir o comportamento novo, acessibilidade, foto legítima, HTML inicial e ausência de POST.
- Novo `src/test/affiliate-c104-compact-mobile-steps.test.tsx` protege marcadores de responsividade, três imagens originais e disponibilidade local dos assets, atributos acessíveis, dados seguros, SSR e ordem do funil.
- QA Chrome real **4/4** nas larguras 360, 390, 768 e 1440: HTTP 200, JavaScript error 0, POST/requisições externas 0, overflow horizontal 0. Em celulares o Enter abre etapa, alternar fecha a anterior e botão recolhe; no desktop imagens oficiais visíveis. A primeira tentativa de teste em SSR antes da hidratação foi reconhecida como falsa negativa; a repetição final aguarda o indicador de interatividade e passou.
- **Vitest integral final: 956/956 PASS, 128/128 arquivos**, exit 0 com `--maxWorkers=1 --fileParallelism=false`. Antes disso, a primeira execução com dois workers teve 955/956 (falha intermitente de revalidação da sessão administrativa C41, arquivo fora do C104); repetição isolada da suíte administrativa 49/49 PASS, e execução integral posterior 956/956 PASS. Logs locais `qa-artifacts/c104-full-final.log`, `c104-admin-retry.log` e `c104-full-r2.log` com recibos `.exit.txt`.
- **Prettier --check e ESLint escopados: ambos exit 0**, zero erros ou avisos; `git diff --check` PASS.
- **TypeScript `tsc --noEmit` local: exit 2 por 3 erros TS2322 exclusivamente em `src/routes/checkout.tsx` (linhas 1466–1468), presentes antes do C104**. Nenhum erro em arquivos modificados. No CI anterior havia ainda 7 TS4111 em `src/lib/boleto.ts`; essas falhas não autorizam mudanças no e-commerce.

## Gates de lançamento

- **PR #279 DRAFT / RELEASE_BLOCKED**. Sem merge ou deploy. Corrigir os sete TS4111 `src/lib/boleto.ts` e três TS2322 `src/routes/checkout.tsx` pelo projeto independente de e-commerce e só afirmar CI verde após execução integral.
- Antes de produção: E2E autorizado inscrição real, aprovação/rejeição em painel admin, entrega/diagnóstico de e-mails e código privado. Depoimentos de **afiliadas** precisam ser genuínos, identificados e autorizados; comentários de clientes sobre produtos não comprovam ganhos, vínculo ou sucesso no programa.
- Não foram observados dados de conversão controlados; a redução de pixels é **qualidade de usabilidade medida**, não garantia de mais candidaturas.
