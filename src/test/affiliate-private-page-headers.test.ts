import { describe, it, expect } from "vitest";
import { applyAffiliatePrivatePageHeaders } from "@/lib/affiliate-private-page-headers";
describe("Private affiliate document origin headers", () => {
  it.each([
    "/admin/afiliadas",
    "/acesso-equipe-afiliadas",
    "/acompanhar-inscricao",
    "/consultar-candidatura",
    "/consultar-candidatura/",
  ])("protects %s including query parameters", async (path) => {
    const original = new Response("private shell", {
      status: 200,
      headers: {
        "Content-Type": "text/html",
        "Set-Cookie": "synthetic=example; HttpOnly",
        "Referrer-Policy": "strict-origin-when-cross-origin",
        "Cache-Control": "public,max-age=600",
      },
    });
    const result = applyAffiliatePrivatePageHeaders(
      new Request("https://vonixhair.com" + path + "?source=synthetic"),
      original,
    );
    expect(result.headers.get("Referrer-Policy")).toBe("no-referrer");
    expect(result.headers.get("Cache-Control")).toBe("private, no-store, max-age=0");
    expect(result.headers.get("X-Robots-Tag")).toContain("noindex");
    expect(result.headers.get("Set-Cookie")).toBe(original.headers.get("Set-Cookie"));
    expect(result.headers.get("Content-Type")).toBe("text/html");
    expect(await result.text()).toBe("private shell");
  });
  it.each([
    "/",
    "/seja-afiliada",
    "/checkout",
    "/admin",
    "/admin/afiliadas-preview",
    "/produtos",
    "/assets/index.js",
  ])("leaves unrelated route %s unchanged", (path) => {
    const original = new Response("public", { headers: { "Cache-Control": "public,max-age=60" } });
    expect(
      applyAffiliatePrivatePageHeaders(new Request("https://vonixhair.com" + path), original),
    ).toBe(original);
  });
  it("does not override server functions or non-document requests", () => {
    const original = new Response("ok", { headers: { "Cache-Control": "private" } });
    expect(
      applyAffiliatePrivatePageHeaders(
        new Request("https://vonixhair.com/admin/afiliadas", { method: "POST" }),
        original,
      ),
    ).toBe(original);
  });
  it("protects redirects and HEAD without changing status or location", () => {
    const original = new Response(null, {
      status: 302,
      headers: { Location: "/acesso-equipe-afiliadas" },
    });
    const result = applyAffiliatePrivatePageHeaders(
      new Request("https://vonixhair.com/admin/afiliadas", { method: "HEAD" }),
      original,
    );
    expect(result.status).toBe(302);
    expect(result.headers.get("Location")).toBe("/acesso-equipe-afiliadas");
    expect(result.headers.get("Cache-Control")).toContain("no-store");
  });
});
