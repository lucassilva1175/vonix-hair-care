export type BoletoPayment = { pdfUrl: string; digitableLine: string; dueDate: string | null };

/** Appmax documents data.boleto; older responses expose the same fields in data.payment. */
export function readBoletoPayment(response: unknown): BoletoPayment {
  const data = (response as { data?: { boleto?: unknown; payment?: unknown } } | null)?.data;
  const value = (data?.boleto ?? data?.payment) as Record<string, unknown> | undefined;
  const pdfUrl = value?.["pdf_url"] ?? value?.["boleto_url"];
  const digitableLine = value?.["digitable_line"] ?? value?.["boleto_digitable_line"];
  const dueDate = value?.["due_date"] ?? value?.["boleto_overdue_date"] ?? value?.["boleto_expiration_date"];
  if (typeof pdfUrl !== "string" || typeof digitableLine !== "string" || !/^\d{47,48}$/.test(digitableLine.replace(/\D/g, "")))
    throw new Error("Appmax retornou um boleto incompleto.");
  const url = new URL(pdfUrl);
  if (url.protocol !== "https:" || url.username || url.password) throw new Error("Endereço do boleto inválido.");
  return { pdfUrl: url.href, digitableLine, dueDate: typeof dueDate === "string" ? dueDate : null };
}

/** Preserve the date printed by Appmax, without shifting a date-only value to the previous day. */
export function boletoDueDateLabel(value: string | null): string | null {
  const date = value?.match(/^(\d{4})-(\d{2})-(\d{2})(?:$|[ T])/);
  return date ? `${date[3]}/${date[2]}/${date[1]}` : null;
}
