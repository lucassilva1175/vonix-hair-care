import { execFileSync, spawnSync } from "node:child_process";
import { createHash, randomUUID } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const boundary = vi.hoisted(() => ({ origin: true, session: true }));
vi.mock("@tanstack/react-start", () => ({
  createServerFn: () => {
    let schema: { parse: (value: unknown) => unknown } | undefined;
    return {
      validator(value: typeof schema) {
        schema = value;
        return this;
      },
      handler(fn: (args: { data: unknown }) => unknown) {
        return (args: { data: unknown }) =>
          fn({ data: schema ? schema.parse(args.data) : args.data });
      },
    };
  },
}));
vi.mock("@tanstack/react-router", () => ({ createFileRoute: () => (config: unknown) => config }));
vi.mock("@tanstack/react-start/server", () => ({
  setResponseHeader: vi.fn(),
  getRequestHeader: (name: string) =>
    name === "cf-connecting-ip" ? "192.0.2.17" : name === "cf-ray" ? "synthetic-edge" : "",
}));
vi.mock("@/lib/affiliate-admin-session.server", () => ({
  affiliateAdminSameOrigin: () => boundary.origin,
  affiliateMutationSameOrigin: () => boundary.origin,
  affiliateAdminSessionAuthorized: async () => boundary.session,
  affiliateAdminMayErase: () => false,
  affiliateLegacyAdminSessionValid: () => false,
  destroyAffiliateAdminSession: vi.fn(),
}));
import {
  issuePrivateAffiliateReceipt,
  submitSimpleAffiliateApplication,
  createManualAffiliateAdmin,
  getAffiliateStatusByCode,
  getAffiliateApplicationPrivateDetail,
  reviewAffiliateApplication,
} from "@/lib/affiliate-functions";
import { receiveAffiliateMailWorker } from "@/routes/api.internal.affiliate-mail-worker";

type Row = Record<string, unknown> & {
  id: string;
  email: string | null;
  status: string;
  status_token_hash: string;
  instagram_url: string;
  tiktok_url: string | null;
  rejection_reason: string | null;
  created_at: string;
  reviewed_at: string | null;
};
type Mail = {
  id: string;
  application_id: string;
  decision: string;
  status: string;
  attempts: number;
  uncertain: boolean;
  provider_id: string | null;
};
type Body = Record<string, unknown>;
const dbHost = "abcdefghijklmnopqrst.supabase.co";
const dbKey = "synthetic-affiliate-test-service-key";
const workerKey = "synthetic-operational-worker-secret";
const providerKey = "synthetic-operational-resend-key";
const useSql = process.env["VONIX_QA_OPERATIONS_SQL"] === "1";
const qaContainer = "vonix-pr343-operational-qa-20261128";
const qaDatabase = "vonix_pr343_qa";
const qaContainerId = process.env["VONIX_QA_OPERATIONS_CONTAINER_ID"];

// This transport can use real SQL ONLY in a disposable, labelled, networkless
// fixture created by the local QA runner. No provider request is ever sent.
function isolatedContainerId(): string {
  if (!qaContainerId || !/^[a-f0-9]{64}$/.test(qaContainerId))
    throw Error("SQL fixture must be created by the isolated journey runner");
  return qaContainerId;
}
function assertSqlFixture() {
  const id = isolatedContainerId();
  const value = execFileSync(
    "docker",
    [
      "inspect",
      "--format",
      '{{.Id}}|{{.Name}}|{{.HostConfig.NetworkMode}}|{{index .Config.Labels "vonix.qa"}}|{{.Config.Image}}',
      id,
    ],
    { encoding: "utf8", timeout: 10000 },
  ).trim();
  if (value !== id + "|/" + qaContainer + "|none|affiliate-operational-20261128|postgres:16")
    throw Error("Refusing non-isolated or different SQL fixture");
}
function sql(statement: string, service = true) {
  const result = spawnSync(
    "docker",
    [
      "exec",
      "-i",
      isolatedContainerId(),
      "psql",
      "-X",
      "-qAt",
      "-v",
      "ON_ERROR_STOP=1",
      "-U",
      "postgres",
      "-d",
      qaDatabase,
    ],
    {
      input:
        "\\set VERBOSITY verbose\n" +
        (service ? "SET ROLE service_role;\n" : "") +
        statement +
        "\n",
      encoding: "utf8",
      timeout: 15000,
      windowsHide: true,
    },
  );
  if (result.status !== 0) {
    if (result.stderr?.includes("23505")) return { duplicate: true, text: "" };
    throw Error(
      "Isolated SQL fixture error: " +
        (result.stderr || result.error?.message || "unknown").slice(0, 300),
    );
  }
  return { duplicate: false, text: result.stdout.trim() };
}
function literal(value: unknown) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number" && Number.isSafeInteger(value)) return String(value);
  if (typeof value !== "string") throw Error("Unexpected synthetic SQL literal");
  return "convert_from(decode('" + Buffer.from(value).toString("base64") + "','base64'),'UTF8')";
}
function jsonRows(query: string) {
  return JSON.parse(
    sql("SELECT coalesce(jsonb_agg(to_jsonb(q)), '[]'::jsonb) FROM (" + query + ") q;").text,
  ) as Body[];
}
const timestamp = "2026-11-28T12:00:00.000Z";

class Fixture {
  rows: Row[] = [];
  mail: Mail[] = [];
  provider: { key: string; body: Body }[] = [];
  requests: string[] = [];
  loseInsertResponse = false;
  loseProviderResponse = false;
  dropDecisionOutbox = false;
  finishFailure: "before" | "after" | null = null;
  loseDispositionResponse = false;
  nowDue = new Set<string>();
  async fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    const url = new URL(String(input));
    const method = init?.method ?? "GET";
    const headers = new Headers(init?.headers);
    const data = init?.body ? (JSON.parse(String(init.body)) as Body) : {};
    this.requests.push(method + " " + url.pathname);
    expect(init?.redirect).toBe("manual");
    if (
      url.origin === "https://api.resend.com" &&
      url.pathname === "/emails" &&
      method === "POST"
    ) {
      expect(headers.get("authorization")).toBe("Bearer " + providerKey);
      expect(data["to"]).toEqual([expect.stringMatching(/@example\.invalid$/)]);
      this.provider.push({ key: headers.get("idempotency-key") ?? "", body: data });
      if (this.loseProviderResponse) {
        this.loseProviderResponse = false;
        throw new TypeError("synthetic provider response lost");
      }
      return Response.json({ id: "synthetic-provider-acceptance" });
    }
    if (
      url.hostname !== dbHost ||
      url.protocol !== "https:" ||
      !url.pathname.startsWith("/rest/v1/")
    )
      throw Error("Blocked unexpected QA network");
    expect(headers.get("apikey")).toBe(dbKey);
    const route = url.pathname.slice("/rest/v1/".length);
    const equal = (name: string) => url.searchParams.get(name)?.replace(/^eq\./, "") ?? "";
    if (route === "vonix_affiliate_applications" && method === "POST") {
      expect(data).not.toHaveProperty("phone");
      expect(data).not.toHaveProperty("street");
      expect(data).not.toHaveProperty("trackingCode");
      expect(data).not.toHaveProperty("trackingProof");
      let duplicate: boolean;
      if (useSql) {
        const columns = [
          "status_token_hash",
          "full_name",
          "email",
          "city",
          "state",
          "instagram_url",
          "tiktok_url",
          "questionnaire_encrypted",
          "consent_at",
        ];
        expect(Object.keys(data).sort()).toEqual([...columns].sort());
        duplicate = sql(
          "INSERT INTO public.vonix_affiliate_applications (" +
            columns.join(",") +
            ") VALUES (" +
            columns
              .map((c) => literal(data[c]) + (c === "consent_at" ? "::timestamptz" : ""))
              .join(",") +
            ");",
        ).duplicate;
      } else {
        duplicate = this.rows.some(
          (r) =>
            r.status_token_hash === data["status_token_hash"] ||
            (data["email"] !== null && r.email === data["email"]) ||
            (r.status !== "recusada" && r.instagram_url === data["instagram_url"]),
        );
        if (!duplicate)
          this.rows.push({
            ...data,
            id: randomUUID(),
            status: "pendente",
            created_at: timestamp,
            reviewed_at: null,
            rejection_reason: null,
          } as Row);
      }
      if (duplicate) return Response.json({ code: "23505" }, { status: 409 });
      if (this.loseInsertResponse) {
        this.loseInsertResponse = false;
        throw new TypeError("synthetic committed insert response lost");
      }
      return new Response(null, { status: 201 });
    }
    if (route === "vonix_affiliate_applications" && method === "GET") {
      const columns = (url.searchParams.get("select") ?? "").split(",");
      const allowed = [
        "id",
        "email",
        "status",
        "rejection_reason",
        "created_at",
        "reviewed_at",
        "status_token_hash",
        "instagram_url",
        "questionnaire_encrypted",
      ];
      if (!columns.every((c) => allowed.includes(c))) throw Error("Unexpected private projection");
      const key = url.searchParams.has("id") ? "id" : "status_token_hash";
      const value = equal(key);
      if (!value || !url.searchParams.has("limit")) throw Error("Unbounded fixture lookup");
      const rejectedOnly = url.searchParams.has("status");
      if (useSql)
        return Response.json(
          jsonRows(
            "SELECT " +
              columns.join(",") +
              " FROM public.vonix_affiliate_applications WHERE " +
              key +
              "=" +
              literal(value) +
              (key === "id" ? "::uuid" : "") +
              (rejectedOnly ? " AND status='recusada'" : "") +
              " LIMIT 1",
          ),
        );
      return Response.json(
        this.rows
          .filter((r) => r[key] === value && (!rejectedOnly || r.status === "recusada"))
          .map((r) => Object.fromEntries(columns.map((c) => [c, r[c]]))),
      );
    }
    if (route === "vonix_affiliate_mail_outbox" && method === "GET") {
      if (this.loseDispositionResponse) throw new TypeError("synthetic disposition read failed");
      expect(url.searchParams.get("select")).toBe("status");
      const id = equal("application_id");
      if (useSql)
        return Response.json(
          jsonRows(
            "SELECT status FROM public.vonix_affiliate_mail_outbox WHERE application_id=" +
              literal(id) +
              "::uuid LIMIT 1",
          ),
        );
      return Response.json(
        this.mail.filter((m) => m.application_id === id).map((m) => ({ status: m.status })),
      );
    }
    if (method !== "POST" || !route.startsWith("rpc/"))
      throw Error("Unexpected fixture request " + route);
    const rpc = route.slice(4);
    if (
      rpc === "vonix_affiliate_rate_limit_allowed" ||
      rpc === "vonix_affiliate_consume_rate_limit"
    ) {
      if (useSql)
        return Response.json(
          sql(
            "SELECT public." +
              rpc +
              "(" +
              literal(data["p_scope"]) +
              "," +
              literal(data["p_fingerprint"]) +
              ");",
          ).text === "t",
        );
      return Response.json(true);
    }
    if (rpc === "vonix_affiliate_decide") {
      const id = String(data["p_id"]);
      if (useSql) {
        const committed =
          sql(
            "SELECT public.vonix_affiliate_decide(" +
              literal(id) +
              "::uuid," +
              literal(data["p_decision"]) +
              "," +
              literal(data["p_reason"]) +
              ");",
          ).text === "t";
        if (committed && this.dropDecisionOutbox)
          sql(
            "DELETE FROM public.vonix_affiliate_mail_outbox WHERE application_id=" +
              literal(id) +
              "::uuid;",
            false,
          );
        return Response.json(committed);
      }
      const row = this.rows.find((r) => r.id === id && r.status === "pendente");
      if (!row) return Response.json(false);
      row.status = String(data["p_decision"]);
      row.rejection_reason = data["p_reason"] === null ? null : String(data["p_reason"]);
      row.reviewed_at = timestamp;
      if (row.email && !this.dropDecisionOutbox)
        this.mail.push({
          id: randomUUID(),
          application_id: id,
          decision: row.status,
          status: "pendente",
          attempts: 0,
          uncertain: false,
          provider_id: null,
        });
      return Response.json(true);
    }
    if (rpc === "vonix_affiliate_claim_mail") {
      if (useSql)
        return Response.json(
          jsonRows(
            "SELECT * FROM public.vonix_affiliate_claim_mail(" +
              literal(data["p_application_id"]) +
              "::uuid)",
          ),
        );
      const mail = this.mail.find(
        (m) =>
          ((m.status === "pendente" && (m.attempts === 0 || this.nowDue.has(m.id))) ||
            (m.status === "processando" && this.nowDue.has(m.id))) &&
          (data["p_application_id"] === null || m.application_id === data["p_application_id"]),
      );
      if (!mail) return Response.json([]);
      mail.attempts++;
      mail.uncertain ||= mail.status === "processando";
      mail.status = "processando";
      this.nowDue.delete(mail.id);
      const app = this.rows.find((r) => r.id === mail.application_id)!;
      return Response.json([
        {
          mail_id: mail.id,
          application_id: mail.application_id,
          decision: mail.decision,
          recipient: app.email,
          attempt: mail.attempts,
        },
      ]);
    }
    if (rpc === "vonix_affiliate_finish_mail") {
      const fail = this.finishFailure;
      this.finishFailure = null;
      if (fail === "before") throw new TypeError("synthetic finish request lost before commit");
      if (useSql) {
        const response = Response.json(
          sql(
            "SELECT public.vonix_affiliate_finish_mail(" +
              literal(data["p_mail_id"]) +
              "::uuid," +
              literal(data["p_attempt"]) +
              "," +
              literal(data["p_success"]) +
              "," +
              literal(data["p_provider_id"]) +
              "," +
              literal(data["p_unknown"]) +
              "," +
              literal(data["p_permanent"]) +
              ");",
          ).text === "t",
        );
        if (fail === "after") throw new TypeError("synthetic committed finish response lost");
        return response;
      }
      const m = this.mail.find(
        (x) =>
          x.id === data["p_mail_id"] &&
          x.attempts === data["p_attempt"] &&
          x.status === "processando",
      );
      if (!m) return Response.json(false);
      m.status = data["p_success"]
        ? "enviado"
        : data["p_permanent"]
          ? data["p_unknown"] || m.uncertain
            ? "incerto"
            : "falhou"
          : "pendente";
      m.uncertain = data["p_success"] ? false : Boolean(data["p_unknown"] || m.uncertain);
      m.provider_id = data["p_success"] ? String(data["p_provider_id"]) : null;
      if (fail === "after") throw new TypeError("synthetic committed finish response lost");
      return Response.json(true);
    }
    throw Error("Unexpected fixture RPC " + rpc);
  }
  record(code: string) {
    const hash = createHash("sha256").update(code).digest("hex");
    return (
      useSql
        ? jsonRows(
            "SELECT * FROM public.vonix_affiliate_applications WHERE status_token_hash=" +
              literal(hash),
          )
        : this.rows.filter((r) => r.status_token_hash === hash)
    )[0] as Row | undefined;
  }
  outbox(id: string) {
    return (
      useSql
        ? jsonRows(
            "SELECT * FROM public.vonix_affiliate_mail_outbox WHERE application_id=" +
              literal(id) +
              "::uuid",
          )
        : this.mail.filter((m) => m.application_id === id)
    ) as Mail[];
  }
  makeDue(id: string) {
    if (useSql)
      sql(
        "UPDATE public.vonix_affiliate_mail_outbox SET next_attempt_at=now()-interval '1 second', last_attempt_at=now()-interval '11 minutes' WHERE application_id=" +
          literal(id) +
          "::uuid;",
        false,
      );
    else for (const m of this.outbox(id)) this.nowDue.add(m.id);
  }
}

const candidate = {
  fullName: "Pessoa Sintética QA",
  email: "public@example.invalid",
  phone: "31999999999",
  postalCode: "30110-012",
  street: "Rua Exclusiva Sintética",
  number: "123",
  district: "Centro",
  city: "Belo Horizonte",
  state: "MG" as const,
  complement: "",
  instagram: "qa.operational.public",
  instagramFollowers: 1200,
  tiktok: "",
  tiktokFollowers: null,
  privacyAccepted: true as const,
  website: "",
};
type Ticket = { trackingCode: string; trackingProof: string };
async function ticket(scope: "public" | "staff"): Promise<Ticket> {
  const issued = await issuePrivateAffiliateReceipt({ data: { scope } });
  if (!issued.ok) throw Error("Synthetic ticket denied");
  return { trackingCode: issued.trackingCode, trackingProof: issued.trackingProof };
}
const worker = (method = "POST", auth = workerKey) =>
  new Request("https://vonixhair.com/api/internal/affiliate-mail-worker", {
    method,
    headers: { authorization: "Bearer " + auth },
  });
let fixture: Fixture;
beforeEach(() => {
  if (useSql) assertSqlFixture();
  boundary.origin = true;
  boundary.session = true;
  for (const [key, value] of Object.entries({
    AFFILIATE_SUPABASE_URL: "https://" + dbHost,
    AFFILIATE_SUPABASE_PROJECT_REF: "abcdefghijklmnopqrst",
    AFFILIATE_SUPABASE_SERVICE_ROLE_KEY: dbKey,
    SUPABASE_URL: "",
    SUPABASE_SERVICE_ROLE_KEY: "",
    AFFILIATE_QUESTIONNAIRE_KEY: "0123456789abcdef".repeat(4),
    AFFILIATE_RECRUITMENT_OPEN: "true",
    AFFILIATE_GOVERNANCE_MIGRATED: "true",
    AFFILIATE_PRIVACY_POLICY_APPROVED: "true",
    AFFILIATE_PROVIDER_VERIFIED: "true",
    AFFILIATE_TRAFFIC_PEPPER: "synthetic-traffic-pepper-not-real-123456",
    AFFILIATE_ADMIN_PASSWORD: "synthetic-admin-password",
    AFFILIATE_ADMIN_SESSION_SECRET: "synthetic-admin-session-secret-123456",
    AFFILIATE_ADMIN_TOTP_SECRET: "A".repeat(32),
    AFFILIATE_TRUSTED_IP_HEADER: "cf-connecting-ip",
    AFFILIATE_RESEND_API_KEY: providerKey,
    RESEND_API_KEY: "",
    AFFILIATE_FROM_EMAIL: "qa@example.invalid",
    AFFILIATE_WORKER_SECRET: workerKey,
  }))
    vi.stubEnv(key, value);
  fixture = new Fixture();
  vi.stubGlobal("fetch", vi.fn(fixture.fetch.bind(fixture)));
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe(
  "Vonix operational journey using real handlers, synthetic transport" +
    (useSql ? " and isolated PostgreSQL" : ""),
  () => {
    it("reconciles a lost registration response, protects private details, records a decision and retries the same notification once", async () => {
      const code = await ticket("public");
      const forged = await submitSimpleAffiliateApplication({
        data: { ...candidate, trackingCode: "A".repeat(32) },
      });
      expect(forged.ok).toBe(false);
      expect(fixture.record("A".repeat(32))).toBeUndefined();
      fixture.loseInsertResponse = true;
      const first = await submitSimpleAffiliateApplication({ data: { ...candidate, ...code } });
      expect(first.ok).toBe(false);
      const stored = fixture.record(code.trackingCode)!;
      expect(stored.status).toBe("pendente");
      expect(JSON.stringify(stored)).not.toContain(candidate.phone);
      expect(JSON.stringify(stored)).not.toContain(candidate.street);
      expect(JSON.stringify(stored)).not.toContain(code.trackingCode);
      expect(JSON.stringify(stored)).not.toContain(code.trackingProof);
      expect(await submitSimpleAffiliateApplication({ data: { ...candidate, ...code } })).toEqual({
        ok: true,
        trackingCode: code.trackingCode,
      });
      const pending = await getAffiliateStatusByCode({ data: { code: code.trackingCode } });
      expect(pending).toMatchObject({ ok: true, status: "pendente" });
      for (const secret of [
        candidate.fullName,
        candidate.email,
        candidate.phone,
        candidate.street,
        code.trackingCode,
      ])
        expect(JSON.stringify(pending)).not.toContain(secret);
      expect((await getAffiliateStatusByCode({ data: { code: "Z".repeat(32) } })).ok).toBe(false);
      boundary.session = false;
      expect((await getAffiliateApplicationPrivateDetail({ data: { id: stored.id } })).ok).toBe(
        false,
      );
      expect(
        (
          await reviewAffiliateApplication({
            data: { id: stored.id, decision: "recusada", reason: "perfil_privado" },
          })
        ).ok,
      ).toBe(false);
      expect(fixture.record(code.trackingCode)?.status).toBe("pendente");
      boundary.session = true;
      const detail = await getAffiliateApplicationPrivateDetail({ data: { id: stored.id } });
      expect(detail).toMatchObject({
        ok: true,
        detail: { kind: "simple", answers: { phone: candidate.phone, street: candidate.street } },
      });
      fixture.loseProviderResponse = true;
      expect(
        await reviewAffiliateApplication({
          data: { id: stored.id, decision: "recusada", reason: "perfil_privado" },
        }),
      ).toMatchObject({ ok: true, emailSent: false, notification: "review" });
      expect(await getAffiliateStatusByCode({ data: { code: code.trackingCode } })).toMatchObject({
        ok: true,
        status: "recusada",
        rejectionReason: "perfil_privado",
      });
      expect(fixture.outbox(stored.id)).toHaveLength(1);
      expect(fixture.outbox(stored.id)[0]).toMatchObject({
        status: "pendente",
        attempts: 1,
        uncertain: true,
      });
      expect(fixture.provider).toHaveLength(1);
      expect(fixture.provider[0]?.body["text"]).toContain("Perfil privado ou indisponível");
      expect(JSON.stringify(fixture.provider)).not.toContain(code.trackingCode);
      const before = fixture.requests.length;
      expect((await receiveAffiliateMailWorker(worker("HEAD"))).status).toBe(204);
      expect((await receiveAffiliateMailWorker(worker("POST", "wrong"))).status).toBe(401);
      expect(fixture.requests).toHaveLength(before);
      fixture.makeDue(stored.id);
      const res = await receiveAffiliateMailWorker(worker());
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ sent: 1, failed: 0, configured: true });
      expect(fixture.outbox(stored.id)[0]).toMatchObject({
        status: "enviado",
        attempts: 2,
        uncertain: false,
        provider_id: "synthetic-provider-acceptance",
      });
      expect(fixture.provider).toHaveLength(2);
      expect(fixture.provider[0]).toEqual(fixture.provider[1]);
      expect(
        (
          await reviewAffiliateApplication({
            data: { id: stored.id, decision: "aprovada", reason: null },
          })
        ).ok,
      ).toBe(false);
      expect(await (await receiveAffiliateMailWorker(worker())).json()).toEqual({
        sent: 0,
        failed: 0,
        configured: true,
      });
      expect(fixture.provider).toHaveLength(2);
    }, 90000);

    it("reconciles committed finish response loss without a second provider request", async () => {
      const receipt = await ticket("public");
      expect(
        (
          await submitSimpleAffiliateApplication({
            data: {
              ...candidate,
              email: "finish.after@example.invalid",
              instagram: "qa.operational.finishafter",
              ...receipt,
            },
          })
        ).ok,
      ).toBe(true);
      const row = fixture.record(receipt.trackingCode)!;
      fixture.finishFailure = "after";
      expect(
        await reviewAffiliateApplication({
          data: { id: row.id, decision: "aprovada", reason: null },
        }),
      ).toMatchObject({ ok: true, emailSent: true, notification: "accepted" });
      expect(fixture.outbox(row.id)).toHaveLength(1);
      expect(fixture.outbox(row.id)[0]).toMatchObject({
        status: "enviado",
        attempts: 1,
        provider_id: "synthetic-provider-acceptance",
      });
      expect(fixture.provider).toHaveLength(1);
      expect(await (await receiveAffiliateMailWorker(worker())).json()).toEqual({
        sent: 0,
        failed: 0,
        configured: true,
      });
      expect(fixture.provider).toHaveLength(1);
    }, 90000);

    it("keeps a lost uncommitted finish uncertain, then reclaims the expired lease with the same idempotency key", async () => {
      const receipt = await ticket("public");
      expect(
        (
          await submitSimpleAffiliateApplication({
            data: {
              ...candidate,
              email: "finish.before@example.invalid",
              instagram: "qa.operational.finishbefore",
              ...receipt,
            },
          })
        ).ok,
      ).toBe(true);
      const row = fixture.record(receipt.trackingCode)!;
      fixture.finishFailure = "before";
      expect(
        await reviewAffiliateApplication({
          data: { id: row.id, decision: "aprovada", reason: null },
        }),
      ).toMatchObject({ ok: true, emailSent: false, notification: "review" });
      expect(fixture.outbox(row.id)[0]).toMatchObject({
        status: "processando",
        attempts: 1,
        provider_id: null,
      });
      expect(await (await receiveAffiliateMailWorker(worker())).json()).toEqual({
        sent: 0,
        failed: 0,
        configured: true,
      });
      expect(fixture.provider).toHaveLength(1);
      fixture.makeDue(row.id);
      expect(await (await receiveAffiliateMailWorker(worker())).json()).toEqual({
        sent: 1,
        failed: 0,
        configured: true,
      });
      expect(fixture.provider).toHaveLength(2);
      expect(fixture.provider[0]).toEqual(fixture.provider[1]);
      expect(fixture.outbox(row.id)[0]).toMatchObject({
        status: "enviado",
        attempts: 2,
        uncertain: false,
      });
    }, 90000);

    it("does not claim acceptance when both the finish response and durable status read are unavailable", async () => {
      const receipt = await ticket("public");
      expect(
        (
          await submitSimpleAffiliateApplication({
            data: {
              ...candidate,
              email: "finish.read@example.invalid",
              instagram: "qa.operational.finishread",
              ...receipt,
            },
          })
        ).ok,
      ).toBe(true);
      const row = fixture.record(receipt.trackingCode)!;
      fixture.finishFailure = "after";
      fixture.loseDispositionResponse = true;
      expect(
        await reviewAffiliateApplication({
          data: { id: row.id, decision: "aprovada", reason: null },
        }),
      ).toMatchObject({ ok: true, emailSent: false, notification: "review" });
      expect(fixture.outbox(row.id)[0]).toMatchObject({ status: "enviado", attempts: 1 });
      expect(fixture.provider).toHaveLength(1);
    }, 90000);

    it("distinguishes phone-only decisions from a missing notification row without false success", async () => {
      const manual = await ticket("staff");
      const { website: _website, ...fields } = candidate;
      expect(
        await createManualAffiliateAdmin({
          data: {
            candidate: { ...fields, email: "", instagram: "qa.operational.manual" },
            consentConfirmed: true,
            ...manual,
          },
        }),
      ).toEqual({ ok: true, trackingCode: manual.trackingCode });
      const record = fixture.record(manual.trackingCode)!;
      expect(record.email).toBeNull();
      expect(
        await reviewAffiliateApplication({
          data: { id: record.id, decision: "aprovada", reason: null },
        }),
      ).toMatchObject({ ok: true, emailSent: false, notification: "not_applicable" });
      expect(fixture.outbox(record.id)).toHaveLength(0);
      const another = await ticket("public");
      expect(
        (
          await submitSimpleAffiliateApplication({
            data: {
              ...candidate,
              email: "missing@example.invalid",
              instagram: "qa.operational.missing",
              ...another,
            },
          })
        ).ok,
      ).toBe(true);
      const missing = fixture.record(another.trackingCode)!;
      fixture.dropDecisionOutbox = true;
      expect(
        await reviewAffiliateApplication({
          data: { id: missing.id, decision: "aprovada", reason: null },
        }),
      ).toMatchObject({ ok: true, emailSent: false, notification: "review" });
      expect(fixture.outbox(missing.id)).toHaveLength(0);
      expect(fixture.provider).toHaveLength(0);
      expect(
        await getAffiliateStatusByCode({ data: { code: another.trackingCode } }),
      ).toMatchObject({ ok: true, status: "aprovada" });
    }, 90000);
  },
);
