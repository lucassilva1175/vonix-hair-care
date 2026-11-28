import { describe, expect, it } from "vitest";
import { Route } from "@/routes/api.public.meta-catalog";

describe("feed do catálogo da Meta", () => {
  it("lista só o que a vitrine mostra: solos e combos, sem kits antigos, avulsas e Whey", async () => {
    const handler = (Route as unknown as { options: { server: { handlers: { GET: () => Response } } } }).options.server.handlers.GET;
    const csv = await handler().text();
    const rows = csv.split("\r\n").slice(1).filter(Boolean);
    expect(rows.length).toBeGreaterThan(40);
    expect(rows.filter((r) => r.includes("/produto/combo-"))).toHaveLength(22);
    expect(rows.some((r) => /\/produto\/[^"]*whey/i.test(r))).toBe(false);
    expect(rows.some((r) => r.includes("/produto/kit-banana-e-mel"))).toBe(false);
  });
});
