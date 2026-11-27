import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const worker = vi.hoisted(() => ({ process: vi.fn() }));
vi.mock("@/lib/affiliate-applications.server", async (original) => ({
  ...(await original<typeof import("@/lib/affiliate-applications.server")>()),
  processAffiliateEmails: worker.process,
}));
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (config: unknown) => config,
}));
import { receiveAffiliateMailWorker } from "@/routes/api.internal.affiliate-mail-worker";
const secret = "synthetic-worker-secret-not-real";
function request(auth?: string, method = "POST") {
  return new Request("https://example.invalid/api/internal/affiliate-mail-worker", {
    method,
    headers: auth ? { authorization: auth } : {},
  });
}
function privateResponse(response: Response) {
  expect(response.headers.get("cache-control")).toContain("no-store");
  expect(response.headers.get("referrer-policy")).toBe("no-referrer");
}
describe("C180 — authenticated notification worker boundary", () => {
  beforeEach(() => {
    vi.stubEnv("AFFILIATE_WORKER_SECRET", secret);
    worker.process.mockReset();
  });
  afterEach(() => vi.unstubAllEnvs());
  it("refuses missing, malformed or incorrect authorization and unsupported methods", async () => {
    for (const auth of [undefined, "Basic " + secret, "Bearer wrong", "Bearer " + secret + "x"]) {
      const response = await receiveAffiliateMailWorker(request(auth));
      expect(response.status).toBe(401);
      privateResponse(response);
    }
    const method = await receiveAffiliateMailWorker(request("Bearer " + secret, "GET"));
    expect(method.status).toBe(405);
    expect(method.headers.get("allow")).toBe("POST, HEAD");
    privateResponse(method);
    expect(worker.process).not.toHaveBeenCalled();
  });
  it("fails closed if the configured secret is missing or too short", async () => {
    for (const value of ["", "short"]) {
      vi.stubEnv("AFFILIATE_WORKER_SECRET", value);
      const response = await receiveAffiliateMailWorker(request("Bearer " + value));
      expect(response.status).toBe(401);
      privateResponse(response);
    }
    expect(worker.process).not.toHaveBeenCalled();
  });
  it("runs a bounded batch only for valid authorization and returns aggregate counts", async () => {
    worker.process.mockResolvedValue({ sent: 2, failed: 1, configured: true });
    const response = await receiveAffiliateMailWorker(request("Bearer " + secret));
    expect(response.status).toBe(200);
    privateResponse(response);
    expect(await response.json()).toEqual({ sent: 2, failed: 1, configured: true });
    expect(worker.process).toHaveBeenCalledExactlyOnceWith(5);
  });
  it("authenticates a HEAD probe without invoking mail processing", async () => {
    const denied = await receiveAffiliateMailWorker(request(undefined, "HEAD"));
    expect(denied.status).toBe(401);
    expect(denied.headers.get("x-vonix-worker-probe")).toBeNull();
    const response = await receiveAffiliateMailWorker(request("Bearer " + secret, "HEAD"));
    expect(response.status).toBe(204);
    expect(response.headers.get("x-vonix-worker-probe")).toBe("authenticated-v1");
    expect(await response.text()).toBe("");
    privateResponse(response);
    expect(worker.process).not.toHaveBeenCalled();
  });
  it("returns a generic private 503 without leaking provider errors", async () => {
    worker.process.mockRejectedValue(new Error("SYNTHETIC_PRIVATE_PROVIDER_DETAIL"));
    const response = await receiveAffiliateMailWorker(request("Bearer " + secret));
    expect(response.status).toBe(503);
    privateResponse(response);
    expect(await response.text()).toBe("worker unavailable");
  });
});
