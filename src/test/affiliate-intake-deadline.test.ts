import { afterEach, describe, expect, it, vi } from "vitest";
import { createAffiliateIntakeDeadline } from "@/lib/affiliate-intake-deadline";

afterEach(() => vi.useRealTimers());

describe("one bounded intake attempt", () => {
  it("limits issuance to 15 seconds and never invokes an expired submission", async () => {
    vi.useFakeTimers();
    const deadline = createAffiliateIntakeDeadline();
    const issue = deadline.wait("issue", () => new Promise<string>(() => {}));
    const failed = expect(issue).rejects.toThrow("affiliate-intake-wait-expired");
    await vi.advanceTimersByTimeAsync(15000);
    await failed;
    await vi.advanceTimersByTimeAsync(30000);
    const submit = vi.fn(async () => "saved");
    await expect(deadline.wait("submit", submit)).rejects.toThrow();
    expect(submit).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it("shares the 45-second total between issuance and submission, without accepting a late response", async () => {
    vi.useFakeTimers();
    const deadline = createAffiliateIntakeDeadline();
    const issue = deadline.wait(
      "issue",
      () => new Promise<string>((r) => setTimeout(() => r("ticket"), 12000)),
    );
    await vi.advanceTimersByTimeAsync(12000);
    expect(await issue).toBe("ticket");
    let finish!: (value: string) => void;
    const submit = deadline.wait(
      "submit",
      () =>
        new Promise<string>((r) => {
          finish = r;
        }),
    );
    const failed = expect(submit).rejects.toThrow("affiliate-intake-wait-expired");
    await vi.advanceTimersByTimeAsync(33000);
    await failed;
    finish("late receipt");
    await vi.advanceTimersByTimeAsync(1);
    expect(vi.getTimerCount()).toBe(0);
  });

  it("clears local timers after immediate success or a synchronous provider error", async () => {
    vi.useFakeTimers();
    const deadline = createAffiliateIntakeDeadline();
    expect(await deadline.wait("issue", async () => "ticket")).toBe("ticket");
    await expect(
      deadline.wait("submit", () => {
        throw Error("synthetic");
      }),
    ).rejects.toThrow("synthetic");
    expect(vi.getTimerCount()).toBe(0);
  });
});
