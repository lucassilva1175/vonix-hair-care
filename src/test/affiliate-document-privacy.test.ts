import { afterEach, describe, expect, it, vi } from "vitest";
import {
  affiliateDocumentCheckScript,
  affiliateDocumentNeedsReload,
  affiliateDocumentPaths,
  affiliateTrackersAllowed,
  isAffiliateDocumentPath,
} from "@/lib/affiliate-document-privacy";
import { track } from "@/lib/analytics";
import { Route } from "@/routes/__root";

const trackerMarkers = /googletagmanager|connect\.facebook\.net|clarity\.ms|gtag\('config'/;
async function headScripts(pathname: string) {
  const head = Route.options.head;
  if (!head) throw new Error("Missing root head");
  const result = await head({ matches: [{ pathname: "/" }, { pathname }] } as never);
  return (result?.scripts ?? []).map((item) =>
    typeof item?.children === "string" ? item.children : "",
  );
}

afterEach(() => {
  window.history.replaceState(null, "", "/");
  vi.unstubAllGlobals();
});
describe("Affiliate document privacy isolation", () => {
  it.each(affiliateDocumentPaths)(
    "protects %s, with the same SSR and runtime normalization",
    async (path) => {
      const evaluate = new Function("location", "return " + affiliateDocumentCheckScript);
      for (const pathname of [path, path + "/", path.toUpperCase(), path.replace("a", "%61")]) {
        expect(isAffiliateDocumentPath(pathname)).toBe(true);
        expect(evaluate({ pathname })).toBe(true);
        expect(affiliateTrackersAllowed(["/", pathname], null)).toBe(false);
        expect(affiliateDocumentNeedsReload(pathname, false)).toBe(true);
        expect(affiliateDocumentNeedsReload(pathname, true)).toBe(false);
        expect((await headScripts(pathname)).some((s) => trackerMarkers.test(s))).toBe(false);
      }
    },
  );
  it.each([
    "/",
    "/loja",
    "/checkout",
    "/produto/kit-banana-e-mel",
    "/seja-afiliada-outra",
    "/admin/pedidos",
  ])("keeps %s outside the affiliate privacy boundary", async (path) => {
    expect(isAffiliateDocumentPath(path)).toBe(false);
    expect(affiliateDocumentNeedsReload(path, false)).toBe(false);
    expect(affiliateDocumentNeedsReload(path, true)).toBe(true);
    expect(affiliateTrackersAllowed([path], true)).toBe(false);
    expect(affiliateTrackersAllowed([path], null)).toBe(true);
    expect((await headScripts(path)).some((s) => trackerMarkers.test(s))).toBe(true);
  });
  it("fails safely for malformed encodings and does not match external URL lookalikes", () => {
    expect(isAffiliateDocumentPath("/%ZZ")).toBe(false);
    expect(isAffiliateDocumentPath("https://example.invalid/seja-afiliada")).toBe(false);
  });
  it("never sends generic telemetry or Meta events from affiliate documents even if old globals remain", () => {
    const gtag = vi.fn(),
      clarity = vi.fn(),
      fbq = vi.fn(),
      fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 204 })),
      boot = vi.fn();
    vi.stubGlobal("gtag", gtag);
    vi.stubGlobal("clarity", clarity);
    vi.stubGlobal("fbq", fbq);
    vi.stubGlobal("fetch", fetcher);
    vi.stubGlobal("__vonixLoadTrackers", boot);
    for (const path of affiliateDocumentPaths) {
      window.history.replaceState(null, "", path);
      track("affiliate_form_started");
      track("sign_up");
    }
    for (const spy of [gtag, clarity, fbq, fetcher, boot]) expect(spy).not.toHaveBeenCalled();
    window.history.replaceState(null, "", "/loja");
    track("view_item");
    expect(gtag).toHaveBeenCalledOnce();
    expect(clarity).toHaveBeenCalledOnce();
    expect(fbq).toHaveBeenCalledOnce();
    expect(fetcher).toHaveBeenCalledOnce();
    expect(boot).toHaveBeenCalledOnce();
  });
});

it("guards previously scheduled commerce tracker callbacks after navigation into a protected affiliate route", async () => {
  const { runInNewContext } = await import("node:vm");
  const location = {
    pathname: "/",
    origin: "https://vonixhair.com",
    href: "https://vonixhair.com/",
    search: "",
  };
  const listeners = new Map<string, Array<() => void>>();
  const timers: Array<() => void> = [];
  const scripts: unknown[] = [];
  const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
  const ctx: Record<string, unknown> = {
    location,
    fetch: fetcher,
    document: {
      cookie: "",
      createElement: () => ({}),
      head: { appendChild: (node: unknown) => scripts.push(node) },
      getElementsByTagName: () => [
        { parentNode: { insertBefore: (node: unknown) => scripts.push(node) } },
      ],
    },
    addEventListener: (name: string, fn: () => void) =>
      listeners.set(name, [...(listeners.get(name) ?? []), fn]),
    removeEventListener: () => undefined,
    setTimeout: (fn: () => void) => timers.push(fn),
  };
  ctx["window"] = ctx;
  for (const script of (await headScripts("/")).filter((s) => trackerMarkers.test(s))) {
    runInNewContext(script, ctx);
  }
  expect(typeof ctx["__vonixLoadTrackers"]).toBe("function");
  expect(typeof ctx["__vonixMetaServer"]).toBe("function");
  for (const fn of listeners.get("load") ?? []) fn();
  location.pathname = "/consultar-candidatura";
  location.href = "https://vonixhair.com/consultar-candidatura";
  for (const fn of listeners.get("pointerdown") ?? []) fn();
  for (const fn of timers) fn();
  (ctx["__vonixLoadMeta"] as () => void)();
  (ctx["__vonixMetaServer"] as () => void)();
  expect(scripts).toHaveLength(0);
  expect(fetcher).not.toHaveBeenCalled();
});
