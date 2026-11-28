// Runs only against a newly created networkless PostgreSQL fixture.
// Preload postgres:16; never auto-pull an image or contact a live service here.
const fs = require("node:fs"),
  path = require("node:path"),
  cp = require("node:child_process"),
  crypto = require("node:crypto");
const stage = path.resolve(__dirname, ".."),
  name = "vonix-pr343-operational-qa-20261128",
  db = "vonix_pr343_qa",
  label = "affiliate-operational-20261128";
const env = {
  CI: "true",
  NODE_ENV: "test",
  NO_COLOR: "1",
  NPM_CONFIG_OFFLINE: "true",
  VONIX_QA_OPERATIONS_SQL: "1",
};
for (const k of [
  "PATH",
  "Path",
  "SystemRoot",
  "SYSTEMROOT",
  "WINDIR",
  "windir",
  "TEMP",
  "TMP",
  "COMSPEC",
  "PATHEXT",
  "USERPROFILE",
  "APPDATA",
  "LOCALAPPDATA",
  "NUMBER_OF_PROCESSORS",
  "OS",
  "PROCESSOR_ARCHITECTURE",
])
  if (process.env[k] !== undefined) env[k] = process.env[k];
const report = {
  mode: "isolated real PostgreSQL + real app handlers + simulated provider and session boundary",
  container: name,
  db,
  network: "none",
  migrations: [],
  steps: [],
  cleaned: false,
  ok: false,
};
// Keep only aggregate synthetic evidence in CI stdout. No persistent local build or database.

function docker(args, input) {
  return cp.spawnSync("docker", args, {
    input,
    encoding: "utf8",
    timeout: 20000,
    windowsHide: true,
    env,
    maxBuffer: 4 * 1024 * 1024,
  });
}
function must(args, input) {
  const r = docker(args, input);
  if (r.status !== 0)
    throw Error(
      "Docker " + args[0] + " failed: " + (r.stderr || r.error?.message || "").slice(0, 400),
    );
  return r.stdout.trim();
}
function psql(id, sql) {
  return must(
    ["exec", "-i", id, "psql", "-X", "-qAt", "-v", "ON_ERROR_STOP=1", "-U", "postgres", "-d", db],
    sql,
  );
}
async function main() {
  let id;
  try {
    if (docker(["inspect", name]).status === 0) throw Error("Refusing existing container");
    must(["image", "inspect", "postgres:16", "--format", "{{.Id}}"]);
    id = must([
      "run",
      "--pull=never",
      "--rm",
      "-d",
      "--name",
      name,
      "--network",
      "none",
      "--label",
      "vonix.qa=" + label,
      "--memory",
      "384m",
      "--cpus",
      "1",
      "-e",
      "POSTGRES_PASSWORD=synthetic-disposable-only",
      "-e",
      "POSTGRES_DB=" + db,
      "postgres:16",
    ]);
    if (!/^[a-f0-9]{64}$/.test(id)) throw Error("Invalid own container ID");
    const inspect = must([
      "inspect",
      "--format",
      '{{.HostConfig.NetworkMode}}|{{index .Config.Labels "vonix.qa"}}|{{.Config.Image}}',
      id,
    ]);
    if (inspect !== "none|" + label + "|postgres:16") throw Error("Isolation not verified");
    report.containerId = id;
    console.log("Isolated container created");
    let ready = false;
    for (let i = 0; i < 45; i++) {
      const log = docker(["logs", id]);
      if (
        (log.stdout + log.stderr).includes("PostgreSQL init process complete") &&
        docker([
          "exec",
          id,
          "psql",
          "-X",
          "-qAt",
          "-v",
          "ON_ERROR_STOP=1",
          "-U",
          "postgres",
          "-d",
          db,
          "-c",
          "SELECT 1",
        ]).stdout?.trim() === "1"
      ) {
        ready = true;
        break;
      }
      await new Promise((r) => setTimeout(r, 1000));
    }
    if (!ready) throw Error("Database not ready");
    psql(
      id,
      "CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN; CREATE ROLE service_role NOLOGIN BYPASSRLS;\n",
    );
    const migrations = [
      "vonix-affiliate-applications.sql",
      "vonix-affiliate-governance.sql",
      "vonix-affiliate-auth-qa-scaffold.sql",
      "vonix-affiliate-portal-status.sql",
      "vonix-affiliate-admin-activation-guard-20261112.sql",
      "vonix-affiliate-verified-email-rls.sql",
      "vonix-affiliate-simple-form-20261110.sql",
      "vonix-affiliate-phone-only-portal-fix-20261111.sql",
      "vonix-affiliate-reapply-reasons-20261111.sql",
      "vonix-affiliate-status-quota-20261111.sql",
      "vonix-affiliate-admin-social-search-20261113.sql",
    ];
    for (const file of migrations) {
      const bytes = fs.readFileSync(path.join(stage, "supabase", file));
      psql(id, bytes);
      report.migrations.push({
        file,
        sha256: crypto.createHash("sha256").update(bytes).digest("hex"),
      });
    }
    console.log("Migrated " + report.migrations.length + " SQL files");
    const cli = path.join(path.dirname(require.resolve("vitest/package.json")), "vitest.mjs");
    // The child receives only synthetic configuration and minimal OS variables.
    // Its Docker calls are further bound to the exact container ID created here.
    env.VONIX_QA_OPERATIONS_CONTAINER_ID = id;
    const r = cp.spawnSync(
      process.execPath,
      [
        cli,
        "run",
        "--config",
        "vitest.config.ts",
        "--maxWorkers=1",
        "src/test/affiliate-operational-journey.test.ts",
      ],
      {
        cwd: stage,
        env,
        stdio: ["ignore", "inherit", "inherit"],
        windowsHide: true,
        timeout: 240000,
      },
    );
    report.steps.push({ name: "journey", exit: r.status, error: r.error?.message ?? null });
    if (r.status !== 0) throw Error("SQL journey did not pass");
    const aggregate = psql(
      id,
      "SELECT jsonb_build_object('applications',(SELECT count(*) FROM public.vonix_affiliate_applications),'decisions',(SELECT count(*) FROM public.vonix_affiliate_audit_events WHERE event_type IN ('aprovada','recusada')),'mail',(SELECT count(*) FROM public.vonix_affiliate_mail_outbox),'accepted',(SELECT count(*) FROM public.vonix_affiliate_mail_outbox WHERE status='enviado'),'mailAttempts',(SELECT coalesce(sum(attempts),0) FROM public.vonix_affiliate_mail_outbox));",
    );
    report.aggregate = JSON.parse(aggregate);
    if (
      report.aggregate.applications !== 6 ||
      report.aggregate.decisions !== 6 ||
      report.aggregate.mail !== 4 ||
      report.aggregate.accepted !== 4 ||
      report.aggregate.mailAttempts !== 6
    )
      throw Error("Unexpected isolated aggregate");
    report.ok = true;
  } catch (e) {
    report.error = String(e.message).slice(0, 400);
    process.exitCode = 1;
  } finally {
    if (id && /^[a-f0-9]{64}$/.test(id)) {
      const r = docker(["stop", "--time", "5", id]);
      report.cleaned = r.status === 0 && docker(["inspect", id]).status !== 0;
      if (!report.cleaned) {
        report.ok = false;
        process.exitCode = 1;
      }
    }
    console.log(JSON.stringify(report));
  }
}
main().catch((e) => {
  console.error(e.message);
  process.exitCode = 1;
});
