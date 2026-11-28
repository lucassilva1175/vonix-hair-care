import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createHash } from "node:crypto";
import { affiliateManualSchema } from "@/lib/affiliate-simple";
import { createManualAffiliateApplication } from "@/lib/affiliate-applications.server";
import {
  decryptAffiliateWizardForAdmin,
  issueAffiliateReceiptTicket,
} from "@/lib/affiliate-wizard-crypto.server";

const valid = {
  candidate: {
    fullName: "Pessoa de Teste",
    email: "",
    phone: "(31) 99999-9999",
    postalCode: "30110-012",
    street: "Rua Exemplo",
    number: "123",
    district: "Centro",
    city: "Belo Horizonte",
    state: "MG",
    complement: "",
    instagram: "pessoa.teste",
    instagramFollowers: 100,
    tiktok: "",
    tiktokFollowers: null,
    privacyAccepted: true,
  },
  consentConfirmed: true,
} as const;

const vars = [
  "AFFILIATE_QUESTIONNAIRE_KEY",
  "AFFILIATE_SUPABASE_URL",
  "AFFILIATE_SUPABASE_PROJECT_REF",
  "AFFILIATE_SUPABASE_SERVICE_ROLE_KEY",
  "SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;
const originals = Object.fromEntries(vars.map((key) => [key, process.env[key]]));
beforeEach(() => {
  process.env["AFFILIATE_QUESTIONNAIRE_KEY"] = Buffer.from(
    "0123456789abcdef0123456789abcdef",
    "utf8",
  ).toString("base64url");
  process.env["AFFILIATE_SUPABASE_URL"] = "https://abcdefghijklmnopqrst.supabase.co";
  process.env["AFFILIATE_SUPABASE_PROJECT_REF"] = "abcdefghijklmnopqrst";
  process.env["AFFILIATE_SUPABASE_SERVICE_ROLE_KEY"] = "synthetic-test-service-role";
  delete process.env["SUPABASE_URL"];
  delete process.env["SUPABASE_SERVICE_ROLE_KEY"];
});
afterEach(() => {
  for (const key of vars) {
    if (originals[key] === undefined) delete process.env[key];
    else process.env[key] = originals[key];
  }
  vi.unstubAllGlobals();
});

describe("C77: registro manual isolado de convite e email", () => {
  it("exige confirmação da titular e campos reais, sem duplicar conta Auth", () => {
    expect(affiliateManualSchema.safeParse({ ...valid, consentConfirmed: false }).success).toBe(
      false,
    );
    expect(
      affiliateManualSchema.safeParse({
        ...valid,
        candidate: { ...valid.candidate, privacyAccepted: false },
      }).success,
    ).toBe(false);
    expect(
      affiliateManualSchema.safeParse({
        ...valid,
        candidate: { ...valid.candidate, email: "invalido" },
      }).success,
    ).toBe(false);
    expect(
      affiliateManualSchema.safeParse({
        ...valid,
        candidate: { ...valid.candidate, tiktokFollowers: 50 },
      }).success,
    ).toBe(false);
    expect(affiliateManualSchema.safeParse(valid).success).toBe(true);
  });

  it("grava e-mail ausente como null e cifra telefone/endereço, com recibo privado", async () => {
    const posts: Array<{ url: string; body: Record<string, unknown> }> = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init: RequestInit) => {
        posts.push({ url: String(url), body: JSON.parse(String(init.body)) });
        return new Response(null, { status: 201 });
      }),
    );
    const result = await createManualAffiliateApplication(affiliateManualSchema.parse(valid));
    expect(result).toMatchObject({
      ok: true,
      trackingCode: expect.stringMatching(/^[A-Za-z0-9_-]{32}$/),
    });
    expect(posts).toHaveLength(1);
    expect(posts[0]?.url).toMatch(/\/rest\/v1\/vonix_affiliate_applications$/);
    expect(posts[0]?.body["email"]).toBeNull();
    expect(posts[0]?.body["status_token_hash"]).toBe(
      createHash("sha256")
        .update(result.ok ? result.trackingCode : "")
        .digest("hex"),
    );
    expect(posts[0]?.body).not.toHaveProperty("phone");
    expect(posts[0]?.body).not.toHaveProperty("street");
    expect(posts[0]?.body).not.toHaveProperty("password");
    const decrypted = decryptAffiliateWizardForAdmin(
      String(posts[0]?.body["questionnaire_encrypted"]),
    );
    expect(decrypted?.answers).toMatchObject({ phone: valid.candidate.phone, email: "" });
  });

  it("apresenta conflito de email antigo sem afirmar que criou a candidata", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              code: "23505",
              message:
                'duplicate key value violates unique constraint "vonix_affiliate_applications_email_key"',
            }),
            { status: 409, headers: { "content-type": "application/json" } },
          ),
      ),
    );
    const result = await createManualAffiliateApplication(
      affiliateManualSchema.parse({
        ...valid,
        candidate: { ...valid.candidate, email: "antiga@example.test" },
      }),
    );
    expect(result).toMatchObject({
      ok: false,
      reason: expect.stringMatching(/existe uma inscrição com este e-mail/),
    });
    expect(result).not.toHaveProperty("trackingCode");
  });

  it("distingue conflito do Instagram ativo e nunca acusa email", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(
            JSON.stringify({
              code: "23505",
              message:
                'duplicate key value violates unique constraint "vonix_affiliate_instagram_active_unique"',
            }),
            { status: 409, headers: { "content-type": "application/json" } },
          ),
      ),
    );
    const result = await createManualAffiliateApplication(affiliateManualSchema.parse(valid));
    expect(result).toMatchObject({ ok: false, reason: expect.stringMatching(/Instagram já tem/) });
    expect(result.ok).toBe(false);
  });

  it("não expõe payload SQL quando provider responde erro ou corpo desconhecido", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response('{"code":"23505","message":"secret private record"}', {
            status: 409,
            headers: { "content-type": "application/json" },
          }),
      ),
    );
    const result = await createManualAffiliateApplication(affiliateManualSchema.parse(valid));
    expect(result.ok).toBe(false);
    expect(JSON.stringify(result)).not.toContain("secret private record");
  });
});

it("reconciles an exact manually issued private receipt without confirming altered data", async () => {
  const ticket = issueAffiliateReceiptTicket("staff")!;
  const trackingCode = ticket.trackingCode;
  const input = affiliateManualSchema.parse({ ...valid, ...ticket });
  let stored: Record<string, unknown> | undefined;
  const fetcher = vi.fn(async (url: string, init: RequestInit) => {
    if (init.method === "POST") {
      const incoming = JSON.parse(String(init.body)) as Record<string, unknown>;
      if (!stored) {
        stored = incoming;
        return new Response(null, { status: 201 });
      }
      return new Response(JSON.stringify({ code: "23505", message: "duplicate" }), { status: 409 });
    }
    expect(String(url)).toContain(
      "status_token_hash=eq." + createHash("sha256").update(trackingCode).digest("hex"),
    );
    return new Response(JSON.stringify([stored]), { status: 200 });
  });
  vi.stubGlobal("fetch", fetcher);
  expect(await createManualAffiliateApplication(input)).toEqual({ ok: true, trackingCode });
  expect(await createManualAffiliateApplication(input)).toEqual({ ok: true, trackingCode });
  const changed = affiliateManualSchema.parse({
    ...input,
    candidate: { ...input.candidate, city: "Outra Cidade" },
  });
  expect(await createManualAffiliateApplication(changed)).toMatchObject({ ok: false });
  expect(fetcher).toHaveBeenCalledTimes(5);
  expect(stored).not.toHaveProperty("trackingCode");
  expect(JSON.stringify(stored)).not.toContain(ticket.trackingProof);
  const before = fetcher.mock.calls.length;
  const legacy = affiliateManualSchema.parse({ ...valid, trackingCode });
  expect(await createManualAffiliateApplication(legacy)).toEqual({ ok: true, trackingCode });
  expect(fetcher.mock.calls.length).toBe(before + 1);
  expect(fetcher.mock.calls.at(-1)?.[1].method).toBe("GET");
});
