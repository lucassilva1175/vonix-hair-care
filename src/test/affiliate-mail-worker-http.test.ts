import { describe, expect, it } from "vitest";
import {
  affiliateMailWorkerPath,
  isAffiliateMailWorkerRequest,
  unsupportedAffiliateMailWorkerMethod,
  applyAffiliateMailWorkerHeaders,
} from "@/lib/affiliate-mail-worker-http";
import { readFileSync } from "node:fs";

describe("Affiliate worker origin boundary", () => {
  it.each(["GET", "OPTIONS", "PUT", "PATCH", "DELETE"])(
    "rejects %s without a route handler or secret",
    async (method) => {
      const res = unsupportedAffiliateMailWorkerMethod(method)!;
      expect(res.status).toBe(405);
      expect(res.headers.get("allow")).toBe("POST, HEAD");
      expect(res.headers.get("cache-control")).toContain("no-store");
      expect(res.headers.get("x-robots-tag")).toContain("noindex");
      expect(res.headers.get("referrer-policy")).toBe("no-referrer");
      expect(await res.text()).toBe("method not allowed");
    },
  );
  it.each(["POST", "HEAD"])("does not bypass authentication for %s", (method) => {
    expect(unsupportedAffiliateMailWorkerMethod(method)).toBeNull();
  });
  it.each([
    affiliateMailWorkerPath,
    affiliateMailWorkerPath + "/",
    affiliateMailWorkerPath.toUpperCase(),
    affiliateMailWorkerPath.replace("affiliate", "%61ffiliate"),
  ])("recognizes only the normalized private endpoint %s", (path) => {
    expect(
      isAffiliateMailWorkerRequest(new Request("https://vonixhair.com" + path + "?qa=1")),
    ).toBe(true);
  });
  it.each([
    "/checkout",
    "/seja-afiliada",
    affiliateMailWorkerPath + "-other",
    "/api/public/appmax-webhook",
  ])("leaves %s alone", (path) => {
    const req = new Request("https://vonixhair.com" + path);
    const res = new Response("public");
    expect(isAffiliateMailWorkerRequest(req)).toBe(false);
    expect(applyAffiliateMailWorkerHeaders(req, res)).toBe(res);
  });
  it("preserves a worker error response and enforces private caching even when the framework fails", async () => {
    const req = new Request("https://vonixhair.com" + affiliateMailWorkerPath, { method: "POST" });
    const res = applyAffiliateMailWorkerHeaders(
      req,
      new Response("generic", {
        status: 503,
        headers: { "cache-control": "public", "content-type": "text/plain" },
      }),
    );
    expect(res.status).toBe(503);
    expect(res.headers.get("cache-control")).toBe("private, no-store, max-age=0");
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
    expect(await res.text()).toBe("generic");
  });
  it("runs unsupported-method protection before dispatching the application server", () => {
    const source = readFileSync("src/server.ts", "utf8");
    expect(source.indexOf("unsupportedAffiliateMailWorkerMethod(request.method)")).toBeLessThan(
      source.indexOf("await getServerEntry()"),
    );
    expect(source).toContain("if (isAffiliateMailWorkerRequest(request))");
  });
});
