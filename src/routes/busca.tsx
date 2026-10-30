import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/busca")({
  beforeLoad: ({ search }) => {
    const q = (search as Record<string, unknown>)["q"];
    throw redirect({ to: "/loja", search: typeof q === "string" && q ? { q } : {} });
  },
});
