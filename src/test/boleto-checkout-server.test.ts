import { beforeEach, describe, expect, it, vi } from "vitest";
import { getProduct } from "@/lib/store";

const mocks = vi.hoisted(() => ({
  disabled: false,
  customer: vi.fn(), order: vi.fn(), boleto: vi.fn(), pix: vi.fn(), card: vi.fn(), status: vi.fn(), notify: vi.fn(),
}));
vi.mock("@tanstack/react-start", () => ({ createServerFn: () => ({
  handler: (fn: unknown) => fn,
  inputValidator: (schema: { parse: (data: unknown) => unknown }) => ({ handler: (fn: (args: { data: unknown }) => unknown) => (args: { data: unknown }) => fn({ data: schema.parse(args.data) }) }),
}) }));
vi.mock("@tanstack/react-start/server", () => ({ getRequestHeader: () => "127.0.0.1" }));
vi.mock("@/lib/env.server", () => ({ env: (name: string, fallback = "") => name === "APPMAX_BOLETO_ENABLED" ? (mocks.disabled ? "false" : "true") : name.startsWith("APPMAX_CLIENT_") ? "test-only" : fallback }));
vi.mock("@/lib/appmax.server", () => ({ createCustomer: mocks.customer, createOrder: mocks.order, payWithBoleto: mocks.boleto, payWithPix: mocks.pix, payWithCard: mocks.card, getOrder: mocks.status, isPaid: () => false }));
vi.mock("@/lib/melhorenvio.server", () => ({ calculateShipping: async () => [{ id: 1, name: "PAC", company: "Correios", price: 0, days: 5 }], unitWeightKg: () => 1 }));
vi.mock("@/lib/affiliate-notify.server", () => ({ notifyAffiliateSale: mocks.notify }));
vi.mock("@/lib/affiliate-coupon.server", () => ({ resolveAffiliateCoupon: vi.fn(), lastAffiliateLookupError: null }));
import { createPayment } from "@/lib/checkout.functions";

const request = () => ({
  customer: { nome: "Pessoa Teste", email: "teste@example.com", cpf: "52998224725", whatsapp: "31999999999" },
  address: { cep: "30140010", rua: "Rua teste", numero: "10", complemento: "", bairro: "Centro", cidade: "BH", uf: "MG" },
  items: [{ slug: "kit-banana-e-mel", variant: "Kit", qty: 1 }],
  serviceId: 1, method: "boleto" as const, ref: "teste",
});
beforeEach(() => {
  vi.clearAllMocks(); mocks.disabled = false;
  mocks.customer.mockResolvedValue(5); mocks.order.mockResolvedValue(42);
  mocks.boleto.mockResolvedValue({ pdfUrl: "https://api.appmax.com.br/boleto/42.pdf", digitableLine: "23793.38128 60000.000003 00000.000400 1 84340000034900", dueDate: "2026-11-24" });
  mocks.notify.mockResolvedValue(undefined);
});
describe("pagamento de boleto no servidor", () => {
  it("usa preço do catálogo, sem desconto Pix, e mantém a venda pendente", async () => {
    const result = await createPayment({ data: request() });
    const price = getProduct("kit-banana-e-mel")!.variants[0]!.price;
    expect(result).toMatchObject({ ok: true, method: "boleto", orderId: 42, total: price });
    expect(mocks.order.mock.calls[0]?.[0]).toMatchObject({ products_value: Math.round(price * 100), discount_value: 0, shipping_value: 0 });
    expect(mocks.boleto).toHaveBeenCalledWith(42, "52998224725");
    expect(mocks.notify).toHaveBeenCalledWith(expect.objectContaining({ status: "pendente" }));
    expect(mocks.notify).not.toHaveBeenCalledWith(expect.objectContaining({ status: "pago" }));
    expect(mocks.pix).not.toHaveBeenCalled(); expect(mocks.card).not.toHaveBeenCalled();
  });
  it("recusa boleto desabilitado antes de criar cliente ou pedido", async () => {
    mocks.disabled = true;
    await expect(createPayment({ data: request() })).resolves.toMatchObject({ ok: false });
    expect(mocks.customer).not.toHaveBeenCalled(); expect(mocks.order).not.toHaveBeenCalled();
  });
  it("não exibe sucesso quando a Appmax rejeita a emissão", async () => {
    mocks.boleto.mockRejectedValue(new Error("test-only failure"));
    const log = vi.spyOn(console, "error").mockImplementation(() => undefined);
    await expect(createPayment({ data: request() })).resolves.toMatchObject({ ok: false });
    expect(mocks.notify).not.toHaveBeenCalledWith(expect.objectContaining({ status: "pago" }));
    log.mockRestore();
  });
});
