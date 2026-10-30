import { createFileRoute, notFound } from "@tanstack/react-router";
import { Md, Page, Shell } from "@/components/site";
import pages from "@/data/pages.json";

const P = pages as Record<string, string>;
const TITLES: Record<string, string> = {
  sobre: "Sobre a Vonix Hair",
  contato: "Contato",
  "politica-de-privacidade": "Política de Privacidade",
  "termos-de-uso": "Termos de Uso",
  "politica-de-trocas-e-devolucoes": "Política de Trocas e Devoluções",
  "politica-de-frete": "Política de Frete e Entrega",
};

export const Route = createFileRoute("/$page")({
  loader: ({ params }) => {
    if (!P[params.page]) throw notFound();
    return { slug: params.page, text: P[params.page]! };
  },
  head: ({ loaderData }) => {
    const t = loaderData ? `${TITLES[loaderData.slug] ?? "Vonix Hair"} — Vonix Hair` : "Página não encontrada — Vonix Hair";
    return {
      meta: [
        { title: t },
        { name: "description", content: `${TITLES[loaderData?.slug ?? ""] ?? "Página"} da loja Vonix Hair.` },
        { property: "og:title", content: t },
        { property: "og:description", content: "Vonix Hair — cosméticos capilares profissionais." },
      ],
    };
  },
  component: InfoPage,
});

function InfoPage() {
  const { text } = Route.useLoaderData();
  return (
    <Shell>
      <Page>
        <Md text={text} />
      </Page>
    </Shell>
  );
}
