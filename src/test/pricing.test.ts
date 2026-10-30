import { describe, expect, it } from "vitest";
import { getProduct, hasFreeShipping, installments, pixPrice, products } from "@/lib/store";

describe("regras comerciais", () => {
  it("catálogo tem 43 produtos", () => expect(products.length).toBe(43));
  it("preço já inclui +15 uma vez", () => {
    expect(getProduct("progressiva-fio-de-luz")!.variants[0]?.price).toBe(174.9);
    expect(getProduct("kit-cachos")!.variants.map((v) => v.price)).toEqual([74.9, 194.9]);
  });
  it("frete grátis somente acima de 150", () => {
    expect(hasFreeShipping(150)).toBe(false);
    expect(hasFreeShipping(150.01)).toBe(true);
  });
  it("6x sem juros soma o total exato", () => {
    const i = installments(174.9);
    expect(i.count).toBe(6);
    expect(Math.round((i.first + i.value * 5) * 100)).toBe(17490);
  });
  it("Pix 5% sobre o novo preço", () => expect(pixPrice(174.9)).toBe(166.16));
});
