-- Dados de envio de cada pedido do site, guardados na hora do checkout para a etiqueta do Melhor Envio
-- sair sozinha quando o pagamento for aprovado. Rode uma vez no editor SQL do Supabase / Lovable Cloud.
create table if not exists public.envios (
  appmax_order_id bigint primary key,
  service_id int not null,                 -- serviço (transportadora) que o cliente escolheu no checkout
  cliente jsonb not null,                  -- nome, email, cpf, whatsapp
  endereco jsonb not null,                 -- cep, rua, numero, complemento, bairro, cidade, uf
  itens jsonb not null,                    -- [{ nome, quantidade, valor_unitario, unidades }]
  valor_seguro numeric not null default 0,
  -- pendente: aguardando pagamento | processando: compra em andamento | etiqueta_gerada | erro
  status text not null default 'pendente' check (status in ('pendente', 'processando', 'etiqueta_gerada', 'erro')),
  melhorenvio_id text,
  rastreio text,
  erro text,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);

alter table public.envios enable row level security;

-- Para tentar de novo um pedido com erro:  update public.envios set status = 'pendente', erro = null where appmax_order_id = 123;
-- (depois reenvie o webhook de pagamento na Appmax, ou peça para rodar a etiqueta de novo.)
