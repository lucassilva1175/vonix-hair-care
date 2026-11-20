# C76 — atalho mobile para candidatura, sem encobrir conteúdo

20/11/2026. Exclusivo ao Portal público de Afiliadas Vonix Hair, após C75 main `8419bc1d5911bd49f9cb79c54525b489a04aa2c6`.

## Motivo
A experiência mobile editorial inspirada na hierarquia Skence tem conteúdos de marca, vídeos reais de produtos, reviews reais sobre produtos, benefícios e formulário. O visitante que passou da hero pode precisar recuperar o acesso ao formulário sem voltar ao início.

## Implementação
- Reaproveita somente o componente de atalho mobile **previamente desenvolvido no clone isolado C69**, atualizado para a versão C75 atual; **não** adota estilos, imagens, depoimentos nem promessas da Skence.
- O atalho fixo no mobile é uma navegação para `#inscricao` e não dispara envio, POST, formulário, analytics ou dados pessoais.
- IntersectionObserver observa hero e formulário: só exibe quando ambos estão fora da tela e o status não é loading. Caso não haja observer/targets, o atalho fica oculto; não interfere no formulário.
- Respeita `open`, `closed`, `limited`, `unavailable` com textos honestos, nunca promete aprovação. Altura mínima 48px, safe-area iOS e reduced-motion.
- Escopo: `src/components/affiliate-mobile-apply-bar.tsx`, `src/routes/seja-afiliada.tsx`, `src/test/affiliate-c76-mobile-apply.test.tsx` e esta documentação; sem tocar ecommerce, checkout, frete, preços, login, admin ou backend.

## Verificação e release
Testes sintéticos e CI remoto devem comprovar comportamento; sem POST de candidatura. Design de desktop permanece como está. Medição visual Chrome de C76 será explicitamente classificada como não verificada quando recursos e preview não permitirem.

**Não publicar** deploy Lovable compartilhado antes da homologação independente das mudanças comerciais PR250–252 e validação visual. PR merge no GitHub e sincronização Lovable não significam produção atualizada.
