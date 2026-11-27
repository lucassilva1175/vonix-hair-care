import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ dispatch: vi.fn(), blocked: vi.fn(), errorPage: vi.fn() }));
vi.mock("@tanstack/react-start/server-entry", () => ({
  default: { fetch: mocks.dispatch },
}));
vi.mock("@/lib/error-capture", () => ({ consumeLastCapturedError: () => undefined }));
vi.mock("@/lib/error-page", () => ({ renderErrorPage: mocks.errorPage }));
vi.mock("@/lib/bot-block", () => ({
  isBlockedCountry: mocks.blocked,
  blockedResponse: () => new Response("blocked", { status: 403 }),
}));
import server from "../server";

const path = "/api/internal/affiliate-mail-worker";
const req = (method: string, suffix = path) =>
  new Request("https://vonixhair.com" + suffix, { method });

describe("Affiliate notification boundary through actual server entry", () => {
  beforeEach(() => {
    mocks.dispatch.mockReset();
    mocks.blocked.mockReset().mockReturnValue(false);
    mocks.errorPage.mockReset().mockReturnValue("generic error page");
  });
  it.each(["GET", "OPTIONS", "PUT", "PATCH", "DELETE"])(
    "rejects %s before framework dispatch",
    async (method) => {
      const res = await server.fetch(req(method), {}, {});
      expect(res.status).toBe(405);
      expect(res.headers.get("allow")).toBe("POST, HEAD");
      expect(res.headers.get("cache-control")).toContain("no-store");
      expect(res.headers.get("x-robots-tag")).toContain("noindex");
      expect(res.headers.get("referrer-policy")).toBe("no-referrer");
      expect(mocks.dispatch).not.toHaveBeenCalled();
    },
  );
  it.each(["POST", "HEAD"])(
    "preserves the framework's private authorization response for %s",
    async (method) => {
      mocks.dispatch.mockResolvedValue(new Response(null, { status: 401 }));
      const res = await server.fetch(req(method), {}, {});
      expect(res.status).toBe(401);
      expect(res.headers.get("cache-control")).toContain("no-store");
      expect(res.headers.get("x-robots-tag")).toContain("noindex");
      expect(mocks.dispatch).toHaveBeenCalledTimes(1);
    },
  );
  it("protects a framework failure without leaking its body or exception", async () => {
    mocks.dispatch.mockResolvedValue(
      Response.json({ unhandled: true, message: "HTTPError" }, { status: 500 }),
    );
    const res = await server.fetch(req("POST"), {}, {});
    expect(res.status).toBe(500);
    expect(res.headers.get("cache-control")).toContain("no-store");
    expect(res.headers.get("x-robots-tag")).toContain("noindex");
    expect(await res.text()).toBe("generic error page");
  });
  it("does not intercept the public checkout, landing or similarly named route", async () => {
    for (const target of ["/checkout", "/seja-afiliada", path + "-other"]) {
      mocks.dispatch.mockResolvedValueOnce(
        new Response("public", { headers: { "cache-control": "public,max-age=60" } }),
      );
      const res = await server.fetch(req("GET", target), {}, {});
      expect(res.status).toBe(200);
      expect(res.headers.get("cache-control")).toBe("public,max-age=60");
      expect(res.headers.get("x-robots-tag")).toBeNull();
    }
    expect(mocks.dispatch).toHaveBeenCalledTimes(3);
  });
  it("preserves pre-existing country blocking and does not process requests", async () => {
    mocks.blocked.mockReturnValue(true);
    const res = await server.fetch(req("GET"), {}, {});
    expect(res.status).toBe(403);
    expect(res.headers.get("cache-control")).toContain("no-store");
    expect(mocks.dispatch).not.toHaveBeenCalled();
  });
});
