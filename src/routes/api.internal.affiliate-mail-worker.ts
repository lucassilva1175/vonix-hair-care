import { createFileRoute } from "@tanstack/react-router";
import { env } from "@/lib/env.server";
import { secureEqual, processAffiliateEmails } from "@/lib/affiliate-applications.server";

import {
  affiliateMailWorkerPrivateHeaders as privateHeaders,
  unsupportedAffiliateMailWorkerMethod,
} from "@/lib/affiliate-mail-worker-http";

export async function receiveAffiliateMailWorker(request: Request): Promise<Response> {
  const unsupported = unsupportedAffiliateMailWorkerMethod(request.method);
  if (unsupported) return unsupported;
  const secret = env("AFFILIATE_WORKER_SECRET");
  const header = request.headers.get("authorization");
  if (
    !secret ||
    secret.length < 24 ||
    /\s/.test(secret) ||
    !header?.startsWith("Bearer ") ||
    !secureEqual(header.slice(7), secret)
  ) {
    return new Response("unauthorized", { status: 401, headers: privateHeaders });
  }
  // An authenticated HEAD confirms the deployment and secret without claiming
  // any mail, reading applicant data or contacting the provider.
  if (request.method === "HEAD") {
    return new Response(null, {
      status: 204,
      headers: { ...privateHeaders, "x-vonix-worker-probe": "authenticated-v1" },
    });
  }
  try {
    const result = await processAffiliateEmails(5);
    return Response.json(result, { headers: privateHeaders });
  } catch {
    return new Response("worker unavailable", { status: 503, headers: privateHeaders });
  }
}

export const Route = createFileRoute("/api/internal/affiliate-mail-worker")({
  server: {
    handlers: {
      POST: ({ request }) => receiveAffiliateMailWorker(request),
      HEAD: ({ request }) => receiveAffiliateMailWorker(request),
      GET: ({ request }) => receiveAffiliateMailWorker(request),
      OPTIONS: ({ request }) => receiveAffiliateMailWorker(request),
    },
  },
});
