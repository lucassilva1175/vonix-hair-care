import { describe, expect, it, vi } from "vitest";
import { probeAffiliateRecruitment } from "@/lib/affiliate-recruitment-probes.server";

const config = {
  url: "https://private-test.invalid",
  headers: { apikey: "synthetic-private", authorization: "Bearer synthetic-private" },
};
const publicUrl = "https://public-test.invalid";
const publicKey = "synthetic-public";
const response = (status: number) => new Response(null, { status });

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((yes) => {
    resolve = yes;
  });
  return { promise, resolve };
}
function options(fetcher: typeof fetch, db: typeof config | null = config) {
  return {
    config: db,
    publicUrl,
    publicKey,
    fetcher,
    operatorIntakeEnabled: vi.fn(async () => true),
    rateLimitAllowed: vi.fn(async () => true),
  };
}

describe("Independent affiliate readiness probes", () => {
  it("starts both empty reads immediately and completes the authorized chain while the public probe is pending", async () => {
    const publicRead = deferred<Response>();
    const privateRead = deferred<Response>();
    const fetcher = vi
      .fn<typeof fetch>()
      .mockImplementation((url) =>
        String(url).startsWith(publicUrl) ? publicRead.promise : privateRead.promise,
      );
    const opts = options(fetcher);
    const work = probeAffiliateRecruitment(opts);
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(opts.operatorIntakeEnabled).not.toHaveBeenCalled();
    expect(fetcher.mock.calls[0]?.[1]).toMatchObject({
      method: "GET",
      redirect: "manual",
      headers: { apikey: publicKey },
    });
    expect(fetcher.mock.calls[1]?.[1]).toMatchObject({
      method: "GET",
      redirect: "manual",
      headers: config.headers,
    });
    expect(fetcher.mock.calls.every(([url]) => String(url).endsWith("?select=id&limit=0"))).toBe(
      true,
    );
    privateRead.resolve(response(200));
    await vi.waitFor(() => expect(opts.rateLimitAllowed).toHaveBeenCalledTimes(1));
    publicRead.resolve(response(401));
    await expect(work).resolves.toEqual({
      open: true,
      intakeEnabled: true,
      rateLimitReady: true,
      storageReachable: true,
      storageDiagnostic: "reachable",
      publicNetworkDiagnostic: "unauthorized",
    });
  });

  it("never authorizes intake from a reachable public endpoint when private storage rejects access", async () => {
    const fetcher = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(response(200))
      .mockResolvedValueOnce(response(403));
    const opts = options(fetcher);
    await expect(probeAffiliateRecruitment(opts)).resolves.toMatchObject({
      open: false,
      intakeEnabled: false,
      rateLimitReady: false,
      storageReachable: false,
      storageDiagnostic: "forbidden",
      publicNetworkDiagnostic: "reachable",
    });
    expect(opts.operatorIntakeEnabled).not.toHaveBeenCalled();
    expect(opts.rateLimitAllowed).not.toHaveBeenCalled();
  });

  it("does not send privileged headers or check quota without a dedicated database configuration", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response(401));
    const opts = options(fetcher, null);
    await expect(probeAffiliateRecruitment(opts)).resolves.toMatchObject({
      open: false,
      storageDiagnostic: "not-configured",
      publicNetworkDiagnostic: "unauthorized",
    });
    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(opts.operatorIntakeEnabled).not.toHaveBeenCalled();
    expect(opts.rateLimitAllowed).not.toHaveBeenCalled();
  });

  it("keeps timeout diagnostics private and does not allow a failed private check to open intake", async () => {
    const error = new DOMException("synthetic sensitive detail", "TimeoutError");
    const fetcher = vi.fn<typeof fetch>().mockRejectedValueOnce(error).mockRejectedValueOnce(error);
    const opts = options(fetcher);
    const result = await probeAffiliateRecruitment(opts);
    expect(result).toMatchObject({
      open: false,
      storageDiagnostic: "timeout",
      publicNetworkDiagnostic: "timeout",
    });
    expect(JSON.stringify(result)).not.toContain("sensitive detail");
    expect(opts.operatorIntakeEnabled).not.toHaveBeenCalled();
  });

  it("still distinguishes a deliberately closed program and a limited connection", async () => {
    const fetcher = vi.fn<typeof fetch>().mockResolvedValue(response(200));
    const opts = options(fetcher);
    opts.operatorIntakeEnabled.mockResolvedValueOnce(false);
    await expect(probeAffiliateRecruitment(opts)).resolves.toMatchObject({
      open: false,
      intakeEnabled: false,
      rateLimitReady: false,
    });
    expect(opts.rateLimitAllowed).not.toHaveBeenCalled();
    opts.rateLimitAllowed.mockResolvedValueOnce(false);
    await expect(probeAffiliateRecruitment(opts)).resolves.toMatchObject({
      open: false,
      intakeEnabled: true,
      rateLimitReady: false,
    });
  });
});
