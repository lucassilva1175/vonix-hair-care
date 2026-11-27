import { createFileRoute } from "@tanstack/react-router";
import { env } from "@/lib/env.server";
import { secureEqual, processAffiliateEmails } from "@/lib/affiliate-applications.server";

const privateHeaders = {
  "cache-control": "private, no-store, max-age=0",
  "referrer-policy": "no-referrer",
};

export async function receiveAffiliateMailWorker(request: Request): Promise<Response> {
  if (request.method !== "POST" && request.method !== "HEAD")
    return new Response("method not allowed", {
      status: 405,
      headers: { ...privateHeaders, allow: "POST, HEAD" },
    });
  const secret = env("AFFILIATE_WORKER_SECRET");
  const header = request.headers.get("authorization");
  if (
    !secret ||
    secret.length < 24 ||
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
    },
  },
});
