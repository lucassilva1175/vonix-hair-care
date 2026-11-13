import { describe, expect, it } from "vitest";
import { isBlockedCountry } from "@/lib/bot-block";

describe("isBlockedCountry", () => {
  it("bloqueia Hong Kong e China", () => {
    expect(isBlockedCountry("HK")).toBe(true);
    expect(isBlockedCountry("cn")).toBe(true);
  });
  it("não bloqueia o Brasil, outros países nem a ausência do cabeçalho", () => {
    expect(isBlockedCountry("BR")).toBe(false);
    expect(isBlockedCountry("US")).toBe(false);
    expect(isBlockedCountry(null)).toBe(false);
    expect(isBlockedCountry("")).toBe(false);
  });
});
