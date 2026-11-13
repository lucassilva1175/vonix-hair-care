import { describe, expect, it } from "vitest";
import { Route } from "@/routes/api.public.meta-catalog";
import { products } from "@/lib/store";

type Handler = () => Response | Promise<Response>;
const getFeed = async () => {
  const handlers = (Route as unknown as { options: { server: { handlers: { GET: Handler } } } }).options.server.handlers;
  const res = await handlers.GET();
  return { res, text: await res.text() };
};

// Lê o CSV respeitando aspas, já que o título/descrição podem ter vírgula.
type Row = { id: string; link: string; image_link: string; price: string; sale_price: string };
const parse = (csv: string): Row[] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < csv.length; i++) {
    const c = csv[i]!;
    if (quoted) {
      if (c === '"' && csv[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && csv[i + 1] === "\n") i++;
      row.push(cell); cell = "";
      if (row.some((v) => v !== "")) rows.push(row);
      row = [];
    } else cell += c;
  }
  const [head, ...body] = rows;
  return body.map((r) => Object.fromEntries(head!.map((h, i) => [h, r[i] ?? ""])) as Row);
};

describe("feed do catálogo da Meta", () => {
  it("responde CSV com uma linha por produto que tem foto", async () => {
    const { res, text } = await getFeed();
    expect(res.headers.get("content-type")).toContain("text/csv");
    expect(parse(text)).toHaveLength(products.filter((p) => p.images[0]).length);
  });

  it("usa o preço atual do site como preço de venda", async () => {
    const rows = parse((await getFeed()).text);
    const botox = rows.find((r) => r.link === "https://vonixhair.com/produto/botox-vonix")!;
    expect(botox.sale_price).toBe("164.90 BRL");
    expect(botox.price).toBe("197.90 BRL");
  });

  it("todo item tem código, link e imagem no domínio do site", async () => {
    for (const r of parse((await getFeed()).text)) {
      expect(r.id).toMatch(/^VONIX-[A-Z0-9-]+$/);
      expect(r.link).toMatch(/^https:\/\/vonixhair\.com\/produto\//);
      expect(r.image_link).toMatch(/^https:\/\/vonixhair\.com\/images\//);
    }
  });
});
