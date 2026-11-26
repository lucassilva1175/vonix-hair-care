import { describe, expect, it, vi } from "vitest";
import { BF_END, BF_START, bfEsquentaAberto, bfPct, bfPhase, vipPct } from "@/lib/black-friday";
import { checkoutTotals, lineTotals, linePct } from "@/lib/store";
import { couponCheck, findCoupon } from "@/lib/coupons";

const antes = new Date("2026-11-20T12:00:00-03:00");
const durante = new Date("2026-11-28T12:00:00-03:00");
const depois = new Date("2026-12-02T12:00:00-03:00");

describe("Black Friday 2026", () => {
  it("fases pelas datas reais", () => {
    expect(bfPhase(antes)).toBe("esquenta");
    expect(bfPhase(BF_START)).toBe("ativa");
    expect(bfPhase(durante)).toBe("ativa");
    expect(bfPhase(BF_END)).toBe("ativa");
    expect(bfPhase(depois)).toBe("encerrada");
    expect(bfEsquentaAberto(antes)).toBe(true);
    expect(bfEsquentaAberto(durante)).toBe(false);
  });
  it("não existe desconto público: o preço do site não muda em nenhuma fase", () => {
    for (const d of [antes, durante, depois]) {
      expect(bfPct("botox-vonix", d)).toBe(0);
      expect(bfPct("combo-fio-de-luz-shampoo-anti-residuo", d)).toBe(0);
      expect(lineTotals(180.9, 1, undefined, "botox-vonix", d).net).toBe(180.9);
    }
    expect(linePct(2, "botox-vonix", durante)).toBe(12);
  });
  it("cupom do grupo VIP: combos 30%, principais 20%, sem somar com Pix nem combo", () => {
    expect(vipPct("combo-fio-de-luz-shampoo-anti-residuo")).toBe(30);
    expect(vipPct("progressiva-fio-de-luz")).toBe(20);
    expect(vipPct("shampoo-fio-de-luz-anti-residuo")).toBe(0);
    const linhas = [
      { slug: "combo-fio-de-luz-shampoo-anti-residuo", ...lineTotals(216.8, 1, undefined, "combo-fio-de-luz-shampoo-anti-residuo") },
      { slug: "progressiva-fio-de-luz", ...lineTotals(145.9, 1, undefined, "progressiva-fio-de-luz") },
    ];
    for (const metodo of ["pix", "card"] as const) {
      const t = checkoutTotals(linhas, metodo, 0, true);
      expect(t.net).toBe(268.48);
      expect(t.pixDiscount).toBe(0);
    }
    const comShampoo = [...linhas, { slug: "shampoo-fio-de-luz-anti-residuo", ...lineTotals(70.9, 1, undefined, "shampoo-fio-de-luz-anti-residuo") }];
    expect(checkoutTotals(comShampoo, "pix", 0, true).pixDiscount).toBe(3.54);
  });
  it("o cupom só vale dentro do prazo", () => {
    const c = findCoupon("vipblack")!;
    expect(c.vip).toBe(true);
    vi.useFakeTimers();
    vi.setSystemTime(antes);
    expect(couponCheck(c, 200).ok).toBe(false);
    vi.setSystemTime(durante);
    expect(couponCheck(c, 200).ok).toBe(true);
    vi.setSystemTime(new Date("2026-11-30T00:01:00-03:00"));
    expect(couponCheck(c, 200).ok).toBe(false);
    vi.useRealTimers();
  });
});

import { validWhatsapp } from "@/components/bf-vip-form";
describe("WhatsApp da lista VIP", () => {
  it("aceita celular e fixo do Brasil em formatos comuns e recusa lixo", () => {
    expect(validWhatsapp("(31) 99999-8888")).toBe(true);
    expect(validWhatsapp("+55 31 99999-8888")).toBe(true);
    expect(validWhatsapp("3133334444")).toBe(true);
    expect(validWhatsapp("")).toBe(false);
    expect(validWhatsapp("12345")).toBe(false);
    expect(validWhatsapp("11111111111")).toBe(false);
  });
});
