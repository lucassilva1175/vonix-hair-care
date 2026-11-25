import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const analytics = vi.hoisted(() => ({ track: vi.fn() }));
const server = vi.hoisted(() => ({ submit: vi.fn() }));
vi.mock("@/lib/analytics", () => ({ track: analytics.track }));
vi.mock("@/lib/affiliate-functions", () => ({
  submitSimpleAffiliateApplication: server.submit,
}));
import { AffiliateSimpleForm } from "@/components/affiliate-simple-form";

type Observation = { isIntersecting: boolean };
let notify: ((entries: Observation[]) => void) | undefined;
let observed = 0;
let disconnected = 0;

beforeEach(() => {
  vi.clearAllMocks();
  notify = undefined;
  observed = 0;
  disconnected = 0;
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      constructor(callback: (entries: Observation[]) => void) {
        notify = callback;
      }
      observe() {
        observed++;
      }
      disconnect() {
        disconnected++;
      }
      unobserve() {}
      takeRecords() {
        return [];
      }
    },
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  window.sessionStorage.removeItem("vonix-affiliate-unconfirmed-code");
  window.sessionStorage.removeItem("vonix-affiliate-once-code");
});

describe("C68 anonymous affiliate application funnel", () => {
  it("counts actual visible form exposure only once, with an event name and no metadata", () => {
    render(<AffiliateSimpleForm />);
    expect(observed).toBe(1);
    expect(analytics.track).not.toHaveBeenCalled();
    notify?.([{ isIntersecting: false }]);
    expect(analytics.track).not.toHaveBeenCalled();
    notify?.([{ isIntersecting: true }]);
    notify?.([{ isIntersecting: true }]);
    expect(analytics.track).toHaveBeenCalledExactlyOnceWith("affiliate_form_visible");
    expect(disconnected).toBeGreaterThanOrEqual(1);
    expect(server.submit).not.toHaveBeenCalled();
  });

  it("counts first change only; sends no name, email, phone, social profile, token or URL", () => {
    render(<AffiliateSimpleForm />);
    fireEvent.change(screen.getByLabelText(/Nome completo/), {
      target: { value: "Pessoa Teste Sigilosa" },
    });
    fireEvent.change(screen.getByLabelText(/Nome completo/), {
      target: { value: "Pessoa Teste Sigilosa 2" },
    });
    fireEvent.change(screen.getByLabelText(/^E-mail/), {
      target: { value: "sigilosa@example.invalid" },
    });
    expect(analytics.track).toHaveBeenCalledTimes(1);
    expect(analytics.track).toHaveBeenCalledWith("affiliate_form_started");
    const content = JSON.stringify(analytics.track.mock.calls);
    expect(content).not.toMatch(
      /Sigilosa|example.invalid|http|email|phone|instagram|trackingCode|\d{32}/i,
    );
    expect(server.submit).not.toHaveBeenCalled();
  });

  it("never measures non-submitting previews as real candidate funnel events", () => {
    render(<AffiliateSimpleForm preview />);
    expect(observed).toBe(0);
    notify?.([{ isIntersecting: true }]);
    fireEvent.change(screen.getByLabelText(/Nome completo/), {
      target: { value: "Usuária em prévia" },
    });
    expect(analytics.track).not.toHaveBeenCalled();
    expect(server.submit).not.toHaveBeenCalled();
  });

  it("ignores a queued observer after live intake changes to a protected preview", () => {
    const { rerender } = render(<AffiliateSimpleForm />);
    const stale = notify;
    rerender(<AffiliateSimpleForm preview />);
    stale?.([{ isIntersecting: true }]);
    expect(analytics.track).not.toHaveBeenCalled();
    rerender(<AffiliateSimpleForm />);
    notify?.([{ isIntersecting: true }]);
    expect(analytics.track).toHaveBeenCalledExactlyOnceWith("affiliate_form_visible");
    expect(server.submit).not.toHaveBeenCalled();
  });

  it("does not claim a visible form in browsers without IntersectionObserver", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    render(<AffiliateSimpleForm />);
    expect(analytics.track).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText(/Nome completo/), { target: { value: "Teste" } });
    expect(analytics.track).toHaveBeenCalledExactlyOnceWith("affiliate_form_started");
  });
});
