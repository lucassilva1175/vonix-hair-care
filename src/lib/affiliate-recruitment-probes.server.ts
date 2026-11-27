type DatabaseConfig = { url: string; headers: Record<string, string> };

type RecruitmentProbeOptions = {
  config: DatabaseConfig | null;
  publicUrl: string;
  publicKey: string;
  operatorIntakeEnabled: () => Promise<boolean>;
  rateLimitAllowed: () => Promise<boolean>;
  fetcher?: typeof fetch;
};

const emptyApplicationsPath = "/rest/v1/vonix_affiliate_applications?select=id&limit=0";

function classifyAffiliateFetchFailure(error: unknown): string {
  const name =
    typeof error === "object" && error !== null && "name" in error ? String(error.name) : "";
  const message = error instanceof Error ? error.message : "";
  if (/timeout|abort/i.test(name + " " + message)) return "timeout";
  if (/redirect/i.test(message)) return "redirect";
  if (/header/i.test(message)) return "invalid-header";
  if (name === "TypeError") return "type-error";
  return "network-error";
}

/** Read-only availability checks. Public egress is diagnostic, never authorization. */
export async function probeAffiliateRecruitment({
  config,
  publicUrl,
  publicKey,
  operatorIntakeEnabled,
  rateLimitAllowed,
  fetcher = fetch,
}: RecruitmentProbeOptions) {
  async function publicDiagnostic() {
    try {
      const response = await fetcher(publicUrl + emptyApplicationsPath, {
        method: "GET",
        headers: { apikey: publicKey },
        redirect: "manual",
        signal: AbortSignal.timeout(6500),
      });
      return response.status === 401
        ? "unauthorized"
        : response.status === 403
          ? "forbidden"
          : response.ok
            ? "reachable"
            : "http-" + response.status;
    } catch (error) {
      return classifyAffiliateFetchFailure(error);
    }
  }

  async function storageAndIntake() {
    let storageReachable = false;
    let storageDiagnostic = config ? "network-error" : "not-configured";
    if (config) {
      try {
        const response = await fetcher(config.url + emptyApplicationsPath, {
          method: "GET",
          headers: config.headers,
          redirect: "manual",
          signal: AbortSignal.timeout(4000),
        });
        storageReachable = response.ok;
        storageDiagnostic = response.ok
          ? "reachable"
          : response.status === 401
            ? "unauthorized"
            : response.status === 403
              ? "forbidden"
              : response.status === 404
                ? "not-found"
                : response.status >= 300 && response.status < 400
                  ? "redirect-blocked"
                  : "server-error";
      } catch (error) {
        storageDiagnostic = classifyAffiliateFetchFailure(error);
      }
    }
    // Authorization remains sequential and fail closed. Only the independent
    // public diagnostic is concurrent; it cannot open intake or bypass quota.
    const intakeEnabled = storageReachable && (await operatorIntakeEnabled());
    const rateLimitReady = intakeEnabled && (await rateLimitAllowed());
    return {
      open: rateLimitReady,
      intakeEnabled,
      rateLimitReady,
      storageReachable,
      storageDiagnostic,
    };
  }

  const [publicNetworkDiagnostic, intake] = await Promise.all([
    publicDiagnostic(),
    storageAndIntake(),
  ]);
  return { ...intake, publicNetworkDiagnostic };
}
