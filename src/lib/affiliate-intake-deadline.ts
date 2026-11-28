// A local wait limit does not cancel a server transaction. Do not report
// failure to save after the submission starts: only its receipt can reconcile it.
export const affiliateIntakeWaitMs = 45_000;
export const affiliateReceiptIssueWaitMs = 15_000;
type IntakePhase = "issue" | "submit";

export function createAffiliateIntakeDeadline() {
  const deadline = Date.now() + affiliateIntakeWaitMs;
  return {
    async wait<T>(phase: IntakePhase, request: () => Promise<T>): Promise<T> {
      const remaining = Math.min(
        deadline - Date.now(),
        phase === "issue" ? affiliateReceiptIssueWaitMs : affiliateIntakeWaitMs,
      );
      if (remaining <= 0) throw new Error("affiliate-intake-wait-expired");
      let timer: ReturnType<typeof setTimeout> | undefined;
      try {
        return await Promise.race([
          request(),
          new Promise<never>((_resolve, reject) => {
            timer = setTimeout(() => reject(new Error("affiliate-intake-wait-expired")), remaining);
          }),
        ]);
      } finally {
        if (timer !== undefined) clearTimeout(timer);
      }
    },
  };
}
