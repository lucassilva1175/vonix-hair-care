import { describe, expect, it } from "vitest";
import { pendingReviewAge, reviewPageRange } from "@/lib/affiliate-review-queue";
describe("Pending review snapshot", () => {
  const now = Date.parse("2026-11-27T12:00:00Z");
  it.each([
    ["2026-11-27T11:59:00Z", "Aguardando há menos de 1 hora"],
    ["2026-11-27T11:00:00Z", "Aguardando há 1 hora"],
    ["2026-11-27T09:00:00Z", "Aguardando há 3 horas"],
    ["2026-11-26T12:00:00Z", "Aguardando há 1 dia"],
    ["2026-11-24T12:00:00Z", "Aguardando há 3 dias"],
    ["2026-11-27T12:01:00Z", null],
    ["invalid", null],
  ])("reports elapsed time only for valid snapshots %s", (date, expected) => {
    expect(pendingReviewAge(date, now)).toBe(expected);
    expect(pendingReviewAge(date, null)).toBeNull();
  });
  it("reports valid partial pages without fabricating rows", () => {
    expect(reviewPageRange(81, 2, 40, 1)).toEqual({ first: 81, last: 81, pages: 3 });
    expect(reviewPageRange(81, 0, 40, 40)).toEqual({ first: 1, last: 40, pages: 3 });
    expect(reviewPageRange(81, 2, 40, 2)).toBeNull();
    expect(reviewPageRange(0, 0, 40, 0)).toBeNull();
    expect(reviewPageRange(81, 1.5, 40, 1)).toBeNull();
    expect(reviewPageRange(81, 0, 0, 1)).toBeNull();
  });
});
