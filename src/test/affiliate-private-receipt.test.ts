import { afterEach, describe, expect, it, vi } from "vitest";
import {
  affiliatePrivateReceiptText,
  parseAffiliatePrivateReceipt,
  downloadAffiliatePrivateReceipt,
} from "@/lib/affiliate-private-receipt";

const token = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdef";

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("local-only, user-triggered private candidate receipt", () => {
  it("formats a confirmed receipt without candidate PII or analytics", () => {
    const text = affiliatePrivateReceiptText(token, true);
    expect(text).toContain(token);
    expect(text).toContain("INSCRIÇÃO RECEBIDA");
    expect(text).toContain("https://vonixhair.com/consultar-candidatura");
    expect(text).not.toContain("Maria");
    expect(text).not.toContain("telefone");
    expect(text).not.toContain("CPF");
    expect(text).not.toContain("endereço");
    expect(text).not.toContain("?code=");
  });

  it("distinguishes uncertain attempts from saved candidatures", () => {
    const text = affiliatePrivateReceiptText(token, false);
    expect(text).toContain("TENTATIVA AINDA NÃO CONFIRMADA");
    expect(text).toContain("não comprova");
    expect(text).not.toContain("INSCRIÇÃO RECEBIDA");
  });

  it("blocks malformed or missing receipts without a Blob or URL", () => {
    const create = vi.fn();
    vi.stubGlobal("URL", { createObjectURL: create });
    expect(downloadAffiliatePrivateReceipt("short", true)).toBe(false);
    expect(downloadAffiliatePrivateReceipt("", false)).toBe(false);
    expect(create).not.toHaveBeenCalled();
  });

  it("downloads a text-only Blob after a click and revokes its object URL", () => {
    vi.useFakeTimers();
    const create = vi.fn().mockReturnValue("blob:https://vonixhair.com/local-receipt");
    const revoke = vi.fn();
    vi.stubGlobal("URL", { createObjectURL: create, revokeObjectURL: revoke });
    const clicked = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      expect(this.download).toBe("vonixhair-codigo-candidatura.txt");
      expect(this.href).toBe("blob:https://vonixhair.com/local-receipt");
      expect(this.isConnected).toBe(true);
    });
    expect(downloadAffiliatePrivateReceipt(token, true)).toBe(true);
    expect(create).toHaveBeenCalledOnce();
    expect(create.mock.calls[0]![0]).toBeInstanceOf(Blob);
    expect(clicked).toHaveBeenCalledOnce();
    expect(document.querySelector('a[download="vonixhair-codigo-candidatura.txt"]')).toBeNull();
    vi.runAllTimers();
    expect(revoke).toHaveBeenCalledExactlyOnceWith("blob:https://vonixhair.com/local-receipt");
  });

  it("does not claim a download when the browser blocks the object URL", () => {
    const create = vi.fn().mockImplementation(() => {
      throw new DOMException("blocked", "SecurityError");
    });
    vi.stubGlobal("URL", { createObjectURL: create, revokeObjectURL: vi.fn() });
    expect(downloadAffiliatePrivateReceipt(token, true)).toBe(false);
  });
});

describe("strict local receipt import", () => {
  it("loads generated receipts regardless of claimed status and accepts CRLF", () => {
    expect(parseAffiliatePrivateReceipt(affiliatePrivateReceiptText(token, true))).toBe(token);
    expect(
      parseAffiliatePrivateReceipt(
        affiliatePrivateReceiptText(token, false).replace(/\n/g, "\r\n"),
      ),
    ).toBe(token);
    expect(parseAffiliatePrivateReceipt("  " + token + "  ")).toBe(token);
  });
  it("rejects oversized, ambiguous, malformed and unrelated documents", () => {
    const original = affiliatePrivateReceiptText(token, true);
    expect(parseAffiliatePrivateReceipt(original + "\nCódigo privado: " + token)).toBeNull();
    expect(parseAffiliatePrivateReceipt(original + "x".repeat(4097))).toBeNull();
    expect(parseAffiliatePrivateReceipt("Código privado: " + token)).toBeNull();
    expect(parseAffiliatePrivateReceipt(original.replace(token, "@social"))).toBeNull();
    expect(
      parseAffiliatePrivateReceipt(original.replace("INSCRIÇÃO RECEBIDA", "PAGAMENTO GARANTIDO")),
    ).toBeNull();
  });
});
