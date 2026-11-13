import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/env.server", () => ({ env: (_k: string, d = "") => d, requireEnv: () => "x" }));
vi.mock("../lib/env.server", () => ({ env: (_k: string, d = "") => d, requireEnv: () => "x" }));

describe("unitWeightKg", () => {
  it("1 L pesa 1,25 kg", async () => {
    const { unitWeightKg } = await import("@/lib/melhorenvio.server");
    expect(unitWeightKg("1L")).toBe(1.25);
    expect(unitWeightKg("1 L")).toBe(1.25);
    expect(unitWeightKg("1Kg")).toBe(1.25);
    expect(unitWeightKg("1000ml")).toBe(1.25);
  });
  it("pequenos e kits ficam no peso padrão 0,6 kg", async () => {
    const { unitWeightKg } = await import("@/lib/melhorenvio.server");
    expect(unitWeightKg("35ml")).toBe(0.6);
    expect(unitWeightKg("Kit")).toBe(0.6);
    expect(unitWeightKg("500ml")).toBe(0.75);
  });
});
