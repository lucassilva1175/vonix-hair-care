import { afterEach, describe, expect, it, vi } from "vitest";
import { boletoDueDateLabel, readBoletoPayment } from "@/lib/boleto";

const line = "23793.38128 60000.000003 00000.000400 1 84340000034900";
const pdf = "https://api.appmax.com.br/boleto/4305.pdf";

afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); });

describe("boleto da Appmax", () => {
  it("lê o retorno documentado e preserva a data sem mudar o fuso", () => {
    const boleto = readBoletoPayment({ data: { boleto: { pdf_url: pdf, digitable_line: line, due_date: "2026-11-24" } } });
    expect(boleto).toEqual({ pdfUrl: pdf, digitableLine: line, dueDate: "2026-11-24" });
    expect(boletoDueDateLabel(boleto.dueDate)).toBe("24/11/2026");
  });
  it("aceita o envelope payment e os nomes usados nas notificações Appmax", () => {
    expect(readBoletoPayment({ data: { payment: { boleto_url: pdf, boleto_digitable_line: line, boleto_overdue_date: "2026-11-24 23:59:59" } } }))
      .toEqual({ pdfUrl: pdf, digitableLine: line, dueDate: "2026-11-24 23:59:59" });
    expect(boletoDueDateLabel("2026-11-24 23:59:59")).toBe("24/11/2026");
  });
  it("não inventa vencimento quando a resposta não o informa", () => {
    expect(readBoletoPayment({ data: { boleto: { pdf_url: pdf, digitable_line: line } } }).dueDate).toBeNull();
    expect(boletoDueDateLabel(null)).toBeNull();
  });
  it.each(["javascript:alert(1)", "http://api.appmax.com.br/boleto.pdf", "https://usuario:senha@api.appmax.com.br/boleto.pdf"])("recusa endereço inseguro: %s", (url) => {
    expect(() => readBoletoPayment({ data: { boleto: { pdf_url: url, digitable_line: line } } })).toThrow();
  });
  it("não apresenta um boleto incompleto como gerado", () => {
    expect(() => readBoletoPayment({ data: { boleto: { pdf_url: pdf, digitable_line: "123" } } })).toThrow();
    expect(() => readBoletoPayment({ data: {} })).toThrow();
  });
  it("envia CPF e pedido ao endpoint de boleto sem tokenização de cartão", async () => {
    vi.resetModules();
    vi.stubEnv("APPMAX_ENV", "sandbox");
    vi.stubEnv("APPMAX_CLIENT_ID", "test-client");
    vi.stubEnv("APPMAX_CLIENT_SECRET", "test-secret");
    const fetcher = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ access_token: "test-token", expires_in: 3600 }), { status: 200 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({ data: { boleto: { pdf_url: pdf, digitable_line: line, due_date: "2026-11-24" } } }), { status: 201 }));
    vi.stubGlobal("fetch", fetcher);
    const { payWithBoleto } = await import("@/lib/appmax.server");
    await expect(payWithBoleto(4305, "52998224725")).resolves.toMatchObject({ pdfUrl: pdf, digitableLine: line });
    expect(fetcher.mock.calls[1]?.[0]).toBe("https://api.sandboxappmax.com.br/v1/payments/boleto");
    expect(JSON.parse(fetcher.mock.calls[1]?.[1].body)).toEqual({ order_id: 4305, payment_data: { boleto: { document_number: "52998224725" } } });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });
});
