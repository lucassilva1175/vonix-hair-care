import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const privilegedModules = [
  "affiliate-applications.server.ts",
  "affiliate-invites.server.ts",
  "affiliate-member-auth.server.ts",
  "affiliate-throttle.server.ts",
  "affiliate-recruitment-probes.server.ts",
] as const;

describe("Vonix affiliate private requests on Cloudflare Workers", () => {
  it.each(privilegedModules)("does not use unsupported redirect:error in %s", (filename) => {
    // Cloudflare Workers' Request does not support redirect:'error':
    // this throws a TypeError BEFORE sending the request to Supabase.
    // Manual mode returns 3xx without forwarding private auth headers.
    const source = readFileSync(join(process.cwd(), "src", "lib", filename), "utf8");
    expect(source).not.toMatch(/redirect:\s*["']error["']/);
    expect(source).toMatch(/redirect:\s*["']manual["']/);
  });

  it("delegates public readiness to the protected probe module without unsafe redirects", () => {
    const source = readFileSync(
      join(process.cwd(), "src", "lib", "affiliate-functions.ts"),
      "utf8",
    );
    expect(source).not.toMatch(/redirect:\s*["']error["']/);
    expect(source).toContain('from "./affiliate-recruitment-probes.server"');
    expect(source).toMatch(/await probeAffiliateRecruitment\(/);
  });
});
