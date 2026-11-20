# C77 — Cadastro manual da equipe e vitrine editorial fiel à Vonix

Data: 20/11/2026. Exclusivamente Portal de Afiliadas Vonix Hair, repositório compartilhado `lucassilva1175/vonix-hair-care`, a partir de main C76 `6d0902d507213855d16520ff97edc454af1bbce6`.

## Evidências de diagnóstico

- O painel `/admin/afiliadas` autenticava proprietária/revisoras para análise, mas não tinha fluxo próprio de cadastro manual.
- O Supabase dedicado `jewbzrbbvxyqmxqbrwrq` responde e possui `email` NULÁVEL, embora haja UNIQUE global `vonix_affiliate_applications_email_key`, inclusive sobre inscrições recusadas antigas. Instagram/TikTok usam indexes ativos apenas para `pendente/aprovada`. Esse conflito é uma causa plausível da falha de e-mail relatada, **não uma confirmação do erro particular sem a mensagem**.
- A inscrição pública exige e-mail, e não deve ser modificada para permitir coleta não autorizada.
- Skence Creators é inspiração de hierarquia e editorial, não fonte de benefícios Vonix. Fotos reais do catálogo Vonix verificadas (Botox Vonix, Kit Banana e Mel, Kit Cronograma).

## Implementação segura

1. `affiliateManualSchema`: valida nome, telefone brasileiro, CEP/endereço, Instagram/seguidores, TikTok opcional, e-mail opcional e confirmação explícita de autorização da titular. Sem documentos, senha, cartão ou perfil falso.
2. Servidor `createManualAffiliateAdmin`: POST privado, Same-Origin, sessão atual da equipe com verificação de role/ativação, limite administrativo e cabeçalhos no-store/no-referrer. Não depende de abertura da inscrição pública. Usa apenas o banco dedicado e o mesmo AES-256-GCM já em uso para telefone/endereço; e-mail vazio vira SQL NULL e o código privado vira apenas SHA-256 no banco. Nunca cria Auth, dispara Resend ou aprova automaticamente.
3. Conflitos 409: mensagem específica e fixa para email já existente, IG/TikTok ativos, erro desconhecido sem dados SQL, e orientação para procurar a inscrição anterior. Não retorna sucesso num conflito.
4. UI: `Cadastrar candidata manualmente` em painel autenticado, formulário recolhido por padrão, consentimento explícito, feedback pós-persistência, código privado de acompanhamento exibido na sessão e ocultado quando a aba é escondida. Em falha incerta, orientar busca no painel antes de reenviar (evita duplicidade).
5. Landing: cards de benefícios com miniaturas leves de três produtos próprios, lazy, sem adicionar seções extensas nem copiar UGC/benefícios Skence. Condições 8%, R$500 e supervisão inalteradas; aviso explícito de imagens ilustrativas, não evidências de ganhos.

## QA e limites

Testes usam valores sintéticos/fetch mockado. Nenhuma inscrição real, e-mail ou operação de banco foi realizada. Alterações limitadas a arquivos de afiliadas e documentação, sem alterar e-commerce, checkout, preço, frete, gateway, conta admin ou schema.

Pendente: CI completo antes de merge; QA Chrome de interface; verificação de sincronização Lovable separada de deploy. A publicação global continua **bloqueada** enquanto PR250–252 de e-commerce não estiverem homologados. Nenhum teste mockado comprova cadastro real em produção.
