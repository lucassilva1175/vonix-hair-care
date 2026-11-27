import test from "node:test";
import assert from "node:assert/strict";
import { runAffiliateMailScheduler as run } from "./run-affiliate-mail-scheduler.mjs";

const secret = "synthetic-worker-secret-not-real";
const validProbe = () =>
  new Response(null, {
    status: 204,
    headers: { "x-vonix-worker-probe": "authenticated-v1", "cache-control": "private, no-store" },
  });
const response = (value) => Response.json(value);
function fixture(...responses) {
  const calls = [];
  const fetchImpl = async (url, options) => {
    calls.push({ url, method: options.method });
    assert.equal(url, "https://vonixhair.com/api/internal/affiliate-mail-worker");
    assert.equal(options.redirect, "error");
    assert.equal(options.cache, "no-store");
    assert.equal(options.headers.authorization, "Bearer " + secret);
    const next = responses.shift();
    if (next instanceof Error) throw next;
    return next;
  };
  return { calls, fetchImpl };
}

test("probe is authenticated HEAD only; no processing", async () => {
  const f = fixture(validProbe());
  assert.deepEqual(await run({ secret, fetchImpl: f.fetchImpl }), {
    mode: "probe",
    authenticated: true,
    processed: false,
  });
  assert.deepEqual(
    f.calls.map((x) => x.method),
    ["HEAD"],
  );
});

test("no network with absent secret, invalid mode or disabled processing", async () => {
  const f = fixture();
  for (const options of [
    { secret: "" },
    { secret, mode: "unexpected" },
    { secret, mode: "process" },
  ]) {
    await assert.rejects(run({ ...options, fetchImpl: f.fetchImpl }));
  }
  assert.equal(f.calls.length, 0);
});

test("processing requires verified deployment marker and cannot follow redirects", async () => {
  for (const invalid of [
    new Response(null, { status: 401 }),
    new Response(null, { status: 204 }),
    new Error("redirect"),
  ]) {
    const f = fixture(invalid);
    await assert.rejects(run({ secret, enabled: true, mode: "process", fetchImpl: f.fetchImpl }));
    assert.deepEqual(
      f.calls.map((x) => x.method),
      ["HEAD"],
    );
  }
});

test("one bounded POST and only aggregate output after probe", async () => {
  const f = fixture(validProbe(), response({ sent: 2, failed: 1, configured: true }));
  assert.deepEqual(await run({ secret, enabled: true, mode: "process", fetchImpl: f.fetchImpl }), {
    mode: "process",
    authenticated: true,
    processed: true,
    configured: true,
    accepted: 2,
    failed: 1,
  });
  assert.deepEqual(
    f.calls.map((x) => x.method),
    ["HEAD", "POST"],
  );
});

test("ambiguous response never retries and cannot expose response details", async () => {
  for (const invalid of [
    new Error("private provider detail"),
    response({ sent: 6, failed: 0, configured: true }),
    response({ sent: 1, failed: 0, configured: false }),
    response({ sent: 0, failed: 0, configured: true, recipient: "private" }),
    response({ sent: 0, failed: 0, configured: true, detail: "x".repeat(1000) }),
    new Response("private upstream failure", { status: 503 }),
  ]) {
    const f = fixture(validProbe(), invalid);
    await assert.rejects(
      run({ secret, enabled: true, mode: "process", fetchImpl: f.fetchImpl }),
      (error) => /^processing_/.test(error.message) && !error.message.includes("private"),
    );
    assert.deepEqual(
      f.calls.map((x) => x.method),
      ["HEAD", "POST"],
    );
  }
});
