# C69 — Vonix Hair Afiliadas: simulador opcional e inscrição mais próxima

Data: 20/11/2026, horário do Brasil. Projeto **exclusivo do portal de afiliadas** Vonix Hair. Base GitHub main `27469488cd4cb1f6d4d65fc471b80f9b37744cde`, branch `feat/afiliadas-c69-simulador-opcional-20261120`.

## Por que a mudança é importante

O portal já oferece botão de inscrição fixo no cabeçalho; outra CTA flutuante criaria competição visual. A área de condições comerciais antes do formulário traz três fatos que devem permanecer visíveis: **comissão de 8% sobre vendas confirmadas e pagas após aprovação**, **bônus condicional de R$ 500 a cada R$ 10 mil elegíveis** e **possibilidade não automática de supervisão com regra informada de 4% sobre equipe**. O simulador numérico entre os cartões e o botão de candidatura era apenas **hipotético**, não é proposta, garantia nem renda de afiliadas reais.

Foi feito um ajuste editorial do ritmo da página: simulador dentro de `<details>` nativo, inicialmente fechado, com `<summary>` visível indicando que é opcional e sem promessa de ganhos. O componente funcional original fica disponível sob demanda, sem alterar cálculo, regras, porcentagens, campos privados, API ou disponibilidade de inscrição. O componente aceita a propriedade opcional `compact` apenas quando embutido no painel, evitando espaço e bordas duplicadas ao abrir. O uso standalone preserva a aparência padrão anterior.

## Arquivos

- `src/components/affiliate-landing.tsx`: disclosure opcional dentro do bloco de condições, antes da CTA intacta.
- `src/components/affiliate-creator-opportunity.tsx`: opção compact para o simulador, mantendo valores e cálculos.
- `src/test/affiliate-c69-optional-simulator.test.tsx`: testes de status aberto/fechado do recrutamento, termos comerciais permanentemente visíveis, âncora da inscrição, abrir/fechar e cálculo ilustrativo intacto.

## Antes × depois (Chrome local com rede externa, POSTs e MP4 bloqueados)

| Largura | Posição vertical do formulário antes | Depois | Menos rolagem |
| --- | ---: | ---: | ---: |
| 360 px | 4246 px | 3778 px | 468 px (11,0%) |
| 390 px | 4114 px | 3646 px | 468 px (11,4%) |
| 768 px | 4114 px | 3574 px | 540 px (13,1%) |
| 1440 px | 3079 px | 2779 px | 300 px (9,7%) |

As posições são coordenadas do DOM do Chrome em localhost, não são melhora comprovada de conversão ou dados de uso da versão publicada. Em 4/4 tamanhos, resumo fechado por padrão, abrir/fechar com Enter, controle range funcional até R$20.000, total demonstrativo R$2.600,00, sem vídeos iniciais, POST, erros JavaScript, scroll lateral ou âncoras duplicadas.

## Proteções e release

Não usar depoimentos, vídeos de creators ou promessa de renda de terceiros. As avaliações C62/C65 são sobre produtos e não sobre resultado financeiro do programa. Sem mudanças em e-commerce, preços, frete, checkout, admin, Auth, gateways, candidaturas, Supabase, contabilidade, dados pessoais, segredos ou integração real. Novo código não transmite informações de candidatas. Preservar os recursos C61–C68.

A loja e o portal compartilham publicação no Lovable. Main contém alterações comerciais dos PRs #250–#252 ainda sem homologação independente dentro deste projeto de afiliadas. **Não publicar o aplicativo todo apenas por este PR**. Integrar o código e executar gates não prova que está live. Esperar validação comercial da loja antes de um deploy unificado, verificar em seguida as duas áreas.

QA local do C69 certificado: Vitest direcionado **36/36 PASS** em cinco arquivos; TypeScript `tsc --noEmit` PASS, ESLint e Prettier escopados PASS, Nitro/Vite build PASS, `git diff --check` PASS. Chrome headless 360/390/768/1440 **4/4 PASS** com interação real por teclado, slider End e total ilustrativo de R$ 2.600,00, zero POST/MP4/erros JavaScript/overflow. A suíte integral do projeto será verificada pelo CI do PR em runner isolado; o resultado do CI e o status de publicação devem constar também no recibo final, e **não são presumidos pelo QA local**.
