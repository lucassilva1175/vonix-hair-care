# C72 — Afiliadas Vonix Hair: avaliações visuais autênticas

**Data:** 20/11/2026, Brasil. **Escopo exclusivo:** recrutamento público de afiliadas Vonix Hair, independente do e-commerce operacional e do painel de administração. **Base:** `87172528a33cc2cadde15a7c242bde7ab527821f`, branch `feat/afiliadas-c72-prova-visual-20261120`.

## Referências e fontes auditadas

- A referência `https://skence.com.br/pages/skence-creators` mostra identidade visual baseada em criadoras, fotos e benefícios próprios daquela marca. Isso é apenas referência de composição e clareza, **não autoriza copiar criadoras, vídeos, imagens, comissões ou promessas**.
- O portal Vonix `https://vonixhair.com/seja-afiliada` já contém C61/C62 na versão publicada e tem uma aplicação C63–C71 no código sincronizado do Lovable, não necessariamente publicado.
- O catálogo oficial possui três vídeos e três pôsteres de avaliações de **clientes de produto** em `src/data/reviews.json`, todos do Botox Vonix: Mariana Andrade (`/depoimentos/depoimento-1-poster.jpg`), Ayla Muniz (`/depoimentos/depoimento-2-poster.jpg`) e Fernanda Assis (`/depoimentos/depoimento-3-poster.jpg`). Os vídeos correspondentes estão na seção C62 `#avaliacoes-produtos`; nomes, comentários e pôsteres não foram inventados.
- O C65, antes da inscrição, mostrava apenas dois comentários com miniaturas de 64×80 px. Uma divulgação visual mais convincente pode usar as provas já existentes, mas **não transformá-las em testemunhos de afiliadas, vendas verificadas ou prova de renda**.

## Implementação restrita

- `src/components/affiliate-verified-review-preview.tsx`: redesign editorial com três cartões com pôster real, comentário intacto, nome e rótulo explícito **Cliente · Botox Vonix**. Deslize horizontalmente no celular com foco de teclado, `scroll-snap` e indicação acessível; grade em tablet/desktop; links dos pôsteres apontam para a seção original de vídeos completos. O link de produto `/produto/botox-vonix` e o link `#avaliacoes-produtos` foram preservados.
- O texto factual foi mantido: **“Não são depoimentos de afiliadas e não comprovam compra verificada, vendas, renda ou participação no programa.”** Nenhuma estrela, avaliação de compra verificada, prêmio, número de afiliadas, renda, UGC ou aprovação foi criada.
- Os três pôsteres são imagens locais leves `loading="lazy"`; C72 não incorpora `<video>`, `autoplay`, `iframe`, solicitações de MP4 ou integrações adicionais antes do formulário.
- `src/test/affiliate-c65-review-preview.test.tsx` atualiza a expectativa histórica de 2 para 3 clientes reais e preserva verificação de fonte e ordem antes de `#inscricao`.
- `src/test/affiliate-c72-editorial-proof.test.tsx` acrescenta quatro contratos: fonte original e pôster, navegação/acessibilidade, identificação correta de produto e ausência de chamadas externas/conversões.

## Evidências locais verificadas

Os testes direcionados C72/C65/C62/rota terminaram **26/26 PASS** em quatro arquivos. Foi executada compilação TypeScript e build Nitro/Vite. Também foram realizadas inspeções em Chrome headless nas mesmas quatro resoluções, com todo POST e vídeo MP4 bloqueados e sem acessar candidaturas reais.

| Largura | Altura C65 antes | Altura C72 | Posição da inscrição antes | Depois |
| --- | ---: | ---: | ---: | ---: |
| 360 px | 392 px | 393 px | 3.778 px | 3.779 px |
| 390 px | 364 px | 367 px | 3.646 px | 3.649 px |
| 768 px | 313 px | 378 px | 3.574 px | 3.638 px |
| 1440 px | 313 px | 363 px | 2.779 px | 2.828 px |

No Chrome local a faixa C72 passou **4/4** em 360×780, 390×844, 768×1024, 1440×900; três pôsteres efetivamente carregados (`naturalWidth > 0`), nenhum overflow de documento, sem erros JS, sem POST, sem MP4 e com `#inscricao` único. O mobile apresenta rolagem interna acessível; tablet/desktop apresentam três cartões. Arquivos e screenshots de QA são locais e não devem entrar no PR. **Essas medidas são de layout, não de conversão.**

## Próximos gates e publicação

Registrar no recibo do C72 os resultados finais de ESLint, Prettier, TypeScript, build e os dois jobs completos do CI GitHub. Mesmo um merge aprovado **não é produção**: o projeto Lovable compartilha publicação com o e-commerce, cujo main inclui alterações comerciais PR #250–252 em preço, frete e checkout ainda sem homologação independente neste fluxo. Não executar deploy compartilhado. Publicar apenas após revisão comercial e aprovação, então confirmar site e loja. Não mexer em .env, segredos, cadastros reais, banco ou pagamentos.
