import { env } from "./env.server";
import { buyLabel } from "./melhorenvio.server";
import { dbEnabled, rest } from "./reviews.server";

/**
 * Etiqueta automática do Melhor Envio. O checkout grava os dados de envio (tabela public.envios,
 * veja supabase/envios.sql); quando a Appmax confirma o pagamento, o webhook chama `issueLabel`.
 * Só roda com MELHORENVIO_AUTO_LABEL=true, porque comprar etiqueta gasta saldo real da conta.
 */
export const autoLabelEnabled = () => env("MELHORENVIO_AUTO_LABEL") === "true" && dbEnabled();

export type EnvioInput = {
  appmaxOrderId: number;
  serviceId: number;
  cliente: { nome: string; email: string; cpf: string; whatsapp: string };
  endereco: { cep: string; rua: string; numero: string; complemento: string; bairro: string; cidade: string; uf: string };
  itens: { nome: string; quantidade: number; valor_unitario: number; unidades: number }[];
  valorSeguro: number;
};

/** Chamado no checkout. Nunca derruba a venda: se o banco falhar, só registra o erro. */
export async function saveEnvio(e: EnvioInput) {
  if (!dbEnabled()) return;
  try {
    await rest("envios", {
      method: "POST",
      headers: { prefer: "resolution=ignore-duplicates" },
      body: JSON.stringify({
        appmax_order_id: e.appmaxOrderId,
        service_id: e.serviceId,
        cliente: e.cliente,
        endereco: e.endereco,
        itens: e.itens,
        valor_seguro: e.valorSeguro,
      }),
    });
  } catch (err) {
    console.error("[envios] não salvou os dados de envio do pedido", e.appmaxOrderId, err);
  }
}

type Row = {
  appmax_order_id: number;
  service_id: number;
  cliente: EnvioInput["cliente"];
  endereco: EnvioInput["endereco"];
  itens: EnvioInput["itens"];
  valor_seguro: number;
  melhorenvio_id: string | null;
};

/** Compra a etiqueta de um pedido pago. Idempotente: só o primeiro webhook "pago" passa de `pendente`. */
export async function issueLabel(orderId: number): Promise<string> {
  if (!autoLabelEnabled()) return "etiqueta automática desligada";
  const q = `envios?appmax_order_id=eq.${orderId}`;
  const claimed = await rest<Row[]>(`${q}&status=eq.pendente`, {
    method: "PATCH",
    headers: { prefer: "return=representation" },
    body: JSON.stringify({ status: "processando", atualizado_em: new Date().toISOString() }),
  });
  const row = claimed[0];
  if (!row) return "sem envio pendente (já processado ou sem dados de envio)";

  const patch = (b: Record<string, unknown>) =>
    rest(q, { method: "PATCH", body: JSON.stringify({ ...b, atualizado_em: new Date().toISOString() }) });
  try {
    const c = row.cliente;
    const a = row.endereco;
    const label = await buyLabel(
      {
        serviceId: row.service_id,
        to: {
          name: c.nome,
          email: c.email,
          document: c.cpf.replace(/\D/g, ""),
          phone: c.whatsapp.replace(/\D/g, ""),
          postal_code: a.cep.replace(/\D/g, ""),
          address: a.rua,
          number: a.numero,
          complement: a.complemento ?? "",
          district: a.bairro,
          city: a.cidade,
          state_abbr: a.uf.toUpperCase(),
        },
        items: row.itens.map((i) => ({ name: i.nome, quantity: i.quantidade, unitary_value: i.valor_unitario })),
        units: row.itens.reduce((s, i) => s + i.unidades, 0),
        insuranceValue: row.valor_seguro,
        existingId: row.melhorenvio_id ?? undefined,
      },
      (id) => patch({ melhorenvio_id: id }),
    );
    await patch({ status: "etiqueta_gerada", melhorenvio_id: label.id, rastreio: label.tracking || null, erro: null });
    return `etiqueta gerada (${label.id})`;
  } catch (e) {
    await patch({ status: "erro", erro: String(e instanceof Error ? e.message : e).slice(0, 500) }).catch(() => {});
    throw e;
  }
}
