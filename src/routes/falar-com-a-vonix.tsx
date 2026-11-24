import { createFileRoute, Link } from "@tanstack/react-router";
import { CreditCard, Gift, QrCode, Truck } from "lucide-react";
import { Shell, WhatsAppIcon } from "@/components/site";
import { track } from "@/lib/analytics";
import { linkVendedor } from "@/lib/whatsapp-lead";

export const Route = createFileRoute("/falar-com-a-vonix")({
  head: () => ({
    meta: [
      { title: "Falar com a Vonix — Vonix Hair" },
      { name: "description", content: "Fale com um vendedor da Vonix Hair no WhatsApp ou vá para o site." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: FalarComAVonix,
});

function FalarComAVonix() {
  return (
    <Shell>
      <div className="container-site mx-auto max-w-xl py-8 md:py-12">
        <div className="rounded-2xl bg-card p-6 text-center">
          <h1 className="font-display text-h2">Como você prefere?</h1>
          <p className="mt-2 text-body text-muted-foreground">Comprar com o vendedor, comprar no site ou só olhar.</p>
          <div className="mt-5 grid gap-3">
            <a
              href={linkVendedor()}
              target="_blank"
              rel="noreferrer"
              onClick={() => track("generate_lead", { method: "formulario_whatsapp" })}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-whatsapp px-6 font-medium text-whatsapp-foreground"
            >
              <WhatsAppIcon className="h-5 w-5" /> Comprar com o vendedor
            </a>
            <Link
              to="/loja"
              onClick={() => track("formulario_comprar_no_site", { method: "formulario_whatsapp" })}
              className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-6 font-medium text-primary-foreground"
            >
              Comprar direto no site
            </Link>
            <Link
              to="/"
              onClick={() => track("formulario_so_olhando", { method: "formulario_whatsapp" })}
              className="inline-flex h-12 items-center justify-center rounded-full border border-border bg-white px-6 font-medium text-foreground"
            >
              Somente olhar o site
            </Link>
          </div>
          <p className="mt-3 text-small text-muted-foreground">O vendedor te atende pelo WhatsApp em 3 a 5 minutos.</p>
          <ul className="mt-6 grid gap-2 text-left text-small text-muted-foreground">
            <li className="flex items-center gap-2"><Truck className="h-4 w-4 shrink-0" aria-hidden="true" /> Frete grátis em todos os produtos</li>
            <li className="flex items-center gap-2"><QrCode className="h-4 w-4 shrink-0" aria-hidden="true" /> 5% de desconto no Pix</li>
            <li className="flex items-center gap-2"><CreditCard className="h-4 w-4 shrink-0" aria-hidden="true" /> Cartão em até 6x sem juros</li>
            <li className="flex items-center gap-2"><Gift className="h-4 w-4 shrink-0" aria-hidden="true" /> Sacolinha Vonix de mimo em todo pedido</li>
          </ul>
        </div>
      </div>
    </Shell>
  );
}
