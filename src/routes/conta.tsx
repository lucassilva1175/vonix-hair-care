import { createFileRoute, Link } from "@tanstack/react-router";
import { Page, Shell } from "@/components/site";

export const Route = createFileRoute("/conta")({
  head: () => ({
    meta: [
      { title: "Minha conta e pedidos — Vonix Hair" },
      { name: "description", content: "Acesse sua conta e seus pedidos Vonix Hair." },
      { property: "og:title", content: "Minha conta — Vonix Hair" },
      { property: "og:description", content: "Acesse sua conta e seus pedidos." },
    ],
  }),
  component: Conta,
});

function Conta() {
  return (
    <Shell>
      <Page>
        <h1 className="font-display text-5xl">Meus pedidos</h1>
        <p className="mt-4 text-muted-foreground">
          Login de clientes e histórico de pedidos ainda não estão conectados nesta cópia. Nenhum pedido para exibir.
        </p>
        <Link to="/loja" className="mt-6 inline-block rounded-full bg-action px-6 py-3 text-action-foreground">Ver produtos</Link>
      </Page>
    </Shell>
  );
}
