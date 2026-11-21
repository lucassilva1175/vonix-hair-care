# C93 TURBO — uma prova social verdadeira, detalhes completos sob demanda

## Problema real
Portal de Afiliadas Vonix Hair, PR #279. A mesma base oficial de **quatro avaliações de clientes sobre Botox Vonix** era exibida duas vezes:
- 4 prévias no início da página, com imagem ou pôster, nome e trecho do comentário;
- outras 4 versões integrais com 3 vídeos e 1 foto depois do formulário.

Isso não representa oito pessoas distintas nem depoimentos de afiliadas. Como a página ainda é longa no celular, repetir quatro cards completos sem necessidade prejudica a leitura.

## Solução C93
- Preservada a prévia original completa das 4 avaliações de CLIENTES sobre PRODUTOS, com links de origem. Não foram criadas avaliações, nomes, notas ou afirmações comerciais.
- A seção de detalhes abaixo do formulário continua completa em HTML, mas as mídias/relatos são apresentados dentro de um disclosure nativo fechado inicialmente. Resumo: quatro avaliações completas, três vídeos e uma foto; são **as mesmas quatro avaliações da prévia**, não oito diferentes.
- Clique em links existentes #avaliacoes-produtos a partir das prévias, navegação com hashchange ou acesso direto com hash abre o disclosure automaticamente. Usuários também podem expandir/recolher pelo summary, teclado e tecnologias assistivas. Links de produto e fonte oficiais permanecem visíveis.
- Os vídeos continuam com preload=none, controls, playsInline e sem autoplay; as imagens continuam lazy. Nenhum POST, dados pessoais, formulários, backend, analytics real ou integração foi alterado.

## Fonte e honestidade
- Base src/data/reviews.json da loja Vonix, vinculada a /produto/botox-vonix: **4 autoras, 3 mídias em vídeo e 1 foto**.
- Essas opiniões não comprovam compras verificadas, vendas por afiliadas, renda ou parcerias; a página mantém o aviso.
- Referência Skence Creators somente hierarquia editorial e experiência, sem copiar fotos, benefícios, testemunhos ou percentuais.

## Verificação e gate
- Comparar C92→C93 na rota /seja-afiliada em 360/390/768/1440 px: altura da página e de #avaliacoes-produtos fechada/aberta, preservação dos 4 autores, mídias e links, abertura pelo link real e URL com hash, 0 POST/MP4 automático, sem erro JS e overflow.
- Executar Vitest focado e completo, Prettier/ESLint, TypeScript e CI GitHub.
- **PR #279 segue OPEN DRAFT**, sem merge, sincronização Lovable ou publicação enquanto persistirem os 3 erros TS2322 preexistentes em checkout compartilhado (linhas 1466–1468), fora do escopo do portal de afiliadas.
