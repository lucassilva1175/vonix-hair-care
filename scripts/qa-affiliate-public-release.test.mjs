import test from "node:test";
import assert from "node:assert/strict";
import { checkAffiliatePublicRelease } from "./check-affiliate-public-release.mjs";
const official = "https://vonixhair.com";
const worker = "/api/internal/affiliate-mail-worker";
const entry = "index-synthetic.js";
function fixture(overrides = {}) {
  const calls = [];
  const fetchImpl = async (input, options) => {
    const url = new URL(input);
    calls.push({ url: input, method: options.method });
    assert.ok(["vonixhair.com", "vonix-haircare-showcase.lovable.app"].includes(url.hostname));
    assert.ok(["GET", "HEAD"].includes(options.method));
    assert.equal(options.credentials, "omit");
    assert.equal(options.redirect, "manual");
    assert.equal(options.cache, "no-store");
    assert.equal(options.headers, undefined);
    const alias = url.origin !== official;
    const path = url.pathname;
    const special = overrides.response?.({ alias, path, method: options.method });
    if (special) return special;
    if (alias && !overrides.directAlias)
      return new Response(null, { status: 301, headers: { location: official + path } });
    if (path === "/seja-afiliada")
      return new Response(
        options.method === "HEAD"
          ? null
          : '<script src="/assets/' +
              (overrides.entry ?? entry) +
              '"></script> Montar minha lista de referências Já me inscrevi',
      );
    return new Response(null, {
      status: path === worker ? (options.method === "GET" ? 405 : 401) : 200,
      headers: {
        "cache-control": "private, no-store, max-age=0",
        "x-robots-tag": "noindex, nofollow, noarchive",
        "referrer-policy": overrides.edge ?? "no-referrer",
        allow: "POST, HEAD",
      },
    });
  };
  return { calls, fetchImpl };
}
test("read-only audit covers 24 requests and accepts exact canonical alias redirects", async () => {
  const f = fixture();
  const r = await checkAffiliatePublicRelease({
    fetchImpl: f.fetchImpl,
    expectedEntry: entry,
    strictReferrer: true,
  });
  assert.equal(r.ok, true);
  assert.equal(r.checked, 24);
  assert.equal(r.deployedEntry, entry);
  assert.equal(r.results.filter((x) => x.canonicalRedirect).length, 12);
  assert.equal(r.realApplicationTested, false);
  assert.equal(r.realDeliveryTested, false);
  assert.equal(f.calls.length, 24);
});
test("detects a stale release, worker fallback and wrong alias destination", async () => {
  const f = fixture({
    entry: "index-old.js",
    response: ({ alias, path, method }) => {
      if (alias && path === worker)
        return new Response(null, {
          status: 301,
          headers: { location: "https://untrusted.invalid/" },
        });
      if (!alias && path === worker && method === "GET") return new Response("generic fallback");
    },
  });
  const r = await checkAffiliatePublicRelease({ fetchImpl: f.fetchImpl, expectedEntry: entry });
  assert.equal(r.ok, false);
  assert.ok(r.results.some((x) => x.issues.includes("release_entry_mismatch")));
  assert.ok(r.results.some((x) => x.issues.includes("unexpected_status")));
  assert.ok(r.results.some((x) => x.issues.includes("unexpected_alias_redirect")));
});
test("treats hosting header divergence as warning or strict failure", async () => {
  const f = fixture({ edge: "strict-origin-when-cross-origin" });
  const r = await checkAffiliatePublicRelease({ fetchImpl: f.fetchImpl });
  assert.equal(r.ok, true);
  assert.equal(r.warningCount, 10);
  const strict = await checkAffiliatePublicRelease({
    fetchImpl: f.fetchImpl,
    strictReferrer: true,
  });
  assert.equal(strict.ok, false);
  assert.equal(strict.warningCount, 0);
});
test("requires private cache directives and no anonymous worker marker", async () => {
  const f = fixture({
    response: ({ alias, path, method }) =>
      !alias && path === worker && method === "HEAD"
        ? new Response(null, {
            status: 401,
            headers: {
              "cache-control": "private,x-no-store",
              "x-vonix-worker-probe": "authenticated-v1",
            },
          })
        : null,
  });
  const r = await checkAffiliatePublicRelease({ fetchImpl: f.fetchImpl });
  const row = r.results.find(
    (x) => x.domain === official && x.route === worker && x.method === "HEAD",
  );
  assert.ok(row.issues.includes("private_cache_missing"));
  assert.ok(row.issues.includes("anonymous_probe_marker"));
  assert.ok(row.issues.includes("noindex_missing"));
});
test("invalid expected asset never reaches network", async () => {
  const f = fixture();
  await assert.rejects(
    checkAffiliatePublicRelease({
      fetchImpl: f.fetchImpl,
      expectedEntry: "https://wrong.invalid/x.js",
    }),
  );
  assert.equal(f.calls.length, 0);
});
test("direct alias also requires the same release marker", async () => {
  const f = fixture({
    directAlias: true,
    response: ({ alias, path, method }) =>
      alias && path === "/seja-afiliada" && method === "GET"
        ? new Response(
            '<script src="/assets/index-other.js"></script> Montar minha lista de referências Já me inscrevi',
          )
        : null,
  });
  const r = await checkAffiliatePublicRelease({ fetchImpl: f.fetchImpl });
  assert.equal(r.ok, false);
  assert.ok(r.results.some((x) => x.issues.includes("domain_entry_mismatch")));
});
