# Rotina diária do Vonix (leia ANTES de agir; vale para qualquer conversa nova)

Dono: Lucas (português, respostas curtas e simples). Missão: fazer vonixhair.com **vender**. Nunca use o chat do Lovable (só o botão Publicar). Sem WhatsApp.

## Ordem de prioridade (sempre)
1. Google Analytics (só Brasil) → 2. Clarity → 3. Site (UM problema por dia) → 4. Meta (só observar).

## Horários (tarefas automáticas já agendadas)
| Horário | O que | Tarefa |
|---|---|---|
| 0h20, 3h20, 6h20 | Madrugada: só observar (site, Pix, robô, anúncio reprovado). Não publica. | vonix-madrugada-observar |
| 8h00 | Clarity: funil, gravações do checkout, corrigir 1 problema do site | vonix-clarity-melhorar-site |
| 8h10 | Meta + site no ar + checkout + pixel | vonix-rotina-diaria-site-e-anuncios |
| 8h40 e 20h40 | Google Analytics só do Brasil, robô, valor da compra | vonix-analytics-brasil |
| 12h, 17h, 22h | Clarity + melhorar o site (conferir se a correção do dia melhorou) | vonix-clarity-melhorar-site |
| 12h10, 16h10, 20h10 | Meta: só observar gasto/compras | vonix-rotina-diaria-site-e-anuncios |
| 17h30 | Relatório do dia (checkout, preços, frete) | vonix-relatorio-diario-fim-tarde |

## Regras
- Só UMA mudança no site por dia (para saber o que deu resultado). Depois de publicar, conferir ao vivo (celular e computador).
- Meta: só observar; mudança grande de anúncio no máximo 1x a cada 7 dias. Avisar o Lucas se anúncio for reprovado ou pixel der erro.
- Perguntar ao Lucas ANTES de mudar: preço, oferta, frete, anúncio (Meta), pixel.
- Sem pedir: robô/Analytics, correções do site, diário, PRs.
- Preço único, Pix sem desconto; teste de preços até 20/11/2026 23h59 (src/data/teste-precos.json, não mexer). Só Playfair Display e Inter. Sem urgência falsa.
- Pix gerado sem pagamento ou erro de pagamento = PRIORIDADE MÁXIMA e avisar o Lucas.
- Anotar tudo no DIARIO-VONIX.md (em PR curta, juntar com squash). Diário e PRs podem dar conflito: resolver mantendo as duas entradas.

## Como acessar
- Clarity: https://clarity.microsoft.com/projects/view/zaq09ea2zy/dashboard (ignorar lovable.dev, 127.0.0.1, adsmanager, /admin; usuários lju9gu e 17tq9hl são do Lucas).
- Google Analytics: propriedade 557116983 (G-J8TYLB425K), no Chrome do Lucas pela 3ª conta: `?authuser=2`. Filtro 'Internal Traffic' em Teste: NÃO ativar (irreversível) sem conferir os IPs.
- Robô: o site devolve 403 para Hong Kong e China (src/lib/bot-block.ts, BLOCKED_COUNTRIES). Candidatos novos: Singapura, França, Espanha, Reino Unido, EUA (0% de engajamento).
- Lovable (publicar): https://lovable.dev/projects/203d2f84-1058-4ca4-acc3-41a4a5d4e2b5 (ícone azul no canto superior direito → Publicar alterações).
- Frete: 3 opções no checkout (rápida, econômica, Correios PAC); a mais barata vem marcada; peso por tamanho (1 L = 1,25 kg) em src/lib/melhorenvio.server.ts.
- Cloudflare: o domínio passa por ele, mas não está na conta do Lucas (provavelmente gerido pelo Lovable): bloquear pelo código.
