# C78 — Vonix Afiliadas: prova real antes da decisão e navegação responsável

Data 20/11/2026. Exclusivamente frontend do portal de afiliadas Vonix Hair /seja-afiliada e shell de recrutamento. Base `main` C77 SHA `03b07c34e0670ba04eaf3100899f9b3e22b0caab` (conferir antes de PR).

## Referência e evidências

- Inspecionado o site Vonix Hair, o catálogo oficial, `src/data/reviews.json` e o projeto Lovable `203d2f84-1058-4ca4-acc3-41a4a5d4e2b5`.
- Analisada a referência `https://skence.com.br/pages/skence-creators`: hierarquia editorial, benefícios visíveis, comunidade. A Skence oferece condições distintas; nenhum percentual, benefício, foto ou depoimento dela foi reutilizado.
- O portal Vonix já possuía produtos oficiais, benefícios 8%/R$500/supervisão condicionados, seis vídeos do catálogo, três avaliações em vídeo de **produtos** e CTA. **Não existe, nas fontes auditadas, prova suficiente de depoimentos de afiliadas autorizadas. Não inventar creators, compras verificadas, cupons, números ou renda.**
- O problema mensurável era a posição: em Chrome local a 360 px, a régua de três avaliações em vídeo só começava por volta de 3.159 px do topo, depois dos benefícios, apesar de ser um diferencial real de credibilidade.

## Modificações

1. Mantida **uma única** faixa `AffiliateVerifiedReviewPreview`, movida de baixo dos benefícios para depois do hero e da barra de elegibilidade, antes dos cartões financeiros. Nenhuma duplicação de prova social.
2. Ancoragem `#avaliacoes-rapidas`, com o nav desktop/mobile "Avaliações" apontando para a prova curta; vídeos completos de produtos continuam em `#avaliacoes-produtos`.
3. Hero ganhou convite editorial para **3 vídeos de avaliações de clientes sobre produtos**, contagem derivada de `src/data/reviews.json`/filtro da faixa existente. Há texto claro "não são depoimentos de afiliadas"; não diz compras verificadas. Link navegável à faixa.
4. Faixa de avaliações ganhou CTA `Ver candidatura` → `#inscricao`, sem indicar falsamente que o programa abriu; os estados `open/limited/closed/unavailable` e formulário não foram alterados.
5. Espaçamentos hero, benefícios e bloco de inscrição compactados moderadamente para ajudar fluxo mobile, preservando separação visual e legibilidade.

## QA e segurança

- Browser Chrome headless real em dev local `127.0.0.1:5301`, com bloqueio de todos os POST, fontes externas e vídeo mp4: 360×780, 390×844 e 1440×900, todos **PASS** em `C78_ANCHORS`. No overflow horizontal, 3 avaliações de produtos, uma única âncora de prova, sem JS error, sem POST. Clique real do hero na prova e CTA da prova no formulário levou o topo do alvo para cerca de 122px mobile e 144px desktop (sem esconder no header sticky).
- No browser final, início da faixa de avaliações em 360 px foi ~1.437 px, início de benefícios ~1.870 px e formulário ~3.752 px; comparações exatas de um mesmo elemento antes/depois disponíveis em `C78-audit.log` e `C78-audit-after.log` (região do carrossel ~3.159→~1.594 antes do ajuste de espaçamento final).
- Testes `src/test/affiliate-c78-early-proof.test.tsx` e regressão. Os testes usam dados públicos, sem PII nova; não disparam cadastros reais.
- Sem alteração de Supabase, contas administrativas, checkout, preços, pagamentos, frete ou integrações. Nada publicado ao vivo.

## Bloqueios honestos

A sincronização GitHub → Lovable **não publica** automaticamente a versão no domínio. A publicação global do projeto continua bloqueada até aprovação separada das alterações comerciais de e-commerce PR250–252. A prova de afiliadas real requer casos e permissões de uso verificáveis, ainda não obtidos. Nenhum benefício da referência Skence pode ser tratado como benefício Vonix.

### C78B — atualização dos contratos de regressão

O primeiro CI GitHub encontrou quatro testes legados (C53, C60, C65, C66) que presumiam a posição antiga da faixa de avaliações e o destino antigo da navegação. Os testes foram corrigidos para verificar a nova ordem real e as duas camadas de avaliações de **produtos** (resumo perto do topo e seção completa depois da candidatura), sem enfraquecer os controles de envio, origem, acesso ou privacidade. Rodada focada após o ajuste: 20/20 PASS; TypeScript/ESLint/Prettier e verificação de diff PASS. A homologação final exige novo CI completo com dois jobs verde antes do merge.
