import { describe, expect, it } from "vitest";
import { cepAtendido, isFreeShippingCep } from "@/lib/free-shipping-region";

describe("frete grátis para SP e MG", () => {
  it("São Paulo (01000-000 a 19999-999)", () => {
    expect(isFreeShippingCep("01001-000")).toBe(true); // capital
    expect(isFreeShippingCep("13010-000")).toBe(true); // Campinas
    expect(isFreeShippingCep("19999-999")).toBe(true);
  });
  it("Minas Gerais (30000-000 a 39999-999)", () => {
    expect(isFreeShippingCep("30140-071")).toBe(true); // Belo Horizonte
    expect(isFreeShippingCep("35640-000")).toBe(true); // Pompéu
    expect(isFreeShippingCep("39999999")).toBe(true);
  });
  it("outros estados e CEP inválido ficam de fora", () => {
    expect(isFreeShippingCep("20040-020")).toBe(false); // RJ
    expect(isFreeShippingCep("40010-000")).toBe(false); // BA
    expect(isFreeShippingCep("80010-000")).toBe(false); // PR
    expect(isFreeShippingCep("00999-000")).toBe(false);
    expect(isFreeShippingCep("3014")).toBe(false);
    expect(isFreeShippingCep("")).toBe(false);
  });
});

describe("atendimento nacional por CEP", () => {
  it.each(["69005-070", "50010000", "70040-010", "80010-000", "01001-000", "30140-071"])(
    "aceita o CEP brasileiro %s",
    (cep) => expect(cepAtendido(cep)).toBe(true),
  );

  it.each(["", "00000-000", "00999-999", "01001", "010010000", "01.001-000", "SP01001000"])(
    "rejeita o CEP inválido %s",
    (cep) => expect(cepAtendido(cep)).toBe(false),
  );
});
