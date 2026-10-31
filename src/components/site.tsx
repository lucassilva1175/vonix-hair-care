import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Heart, House, Menu, MessageCircle, Scissors, Search, ShoppingBag, User, X } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  MAX_DISCOUNT,
  brl,
  discountPct,
  installments,
  pixPrice,
  cardPricing,
  useAudience,
  useCart,
  useFavorites,
  WHATSAPP,
  type Audience,
  type Product,
} from "@/lib/store";

export const SRC = "https://vonixhaircosmeticos.com.br";
export const LOGO = `${SRC}/assets/vonix-logo-optimized-BP5ZgeGC.webp`;

const MARQUEE = [
  `ATÉ ${MAX_DISCOUNT}% OFF EM PRODUTOS SELECIONADOS`,
  "FRETE GRÁTIS ACIMA DE R$ 150 EM PRODUTOS, ANTES DOS DESCONTOS",
  "PARCELAMENTO EM ATÉ 6X SEM JUROS",
  "5% NO PIX EM ITENS SEM OUTRA OFERTA",
  "ESQUENTA BLACK FRIDAY",
];

const NAV = [
  { label: "Mais vendidos", search: { secao: "mais-vendidos" } },
  { label: "Todos os produtos", search: {} },
  { label: "Progressiva", search: { tiposProduto: "Progressiva" } },
  { label: "Máscara", search: { tiposProduto: "Máscara" } },
  { label: "Kits", search: { tiposProduto: "Kits" } },
];

function SearchBox({ onDone }: { onDone?: () => void }) {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  return (
    <form
      className="relative w-full"
      onSubmit={(e) => {
        e.preventDefault();
        nav({ to: "/loja", search: { q } });
        onDone?.();
      }}
    >
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Buscar produtos, kits, tratamentos..."
        aria-label="Buscar"
        className="h-11 w-full rounded-full border border-border bg-background px-4 pr-10 text-sm outline-none focus:border-foreground"
      />
      <button aria-label="Buscar" className="absolute right-3 top-3">
        <Search className="h-4 w-4" />
      </button>
    </form>
  );
}

function AudienceChoice() {
  const { audience, set } = useAudience();
  const nav = useNavigate();
  const go = (a: Audience) => {
    set(a);
    nav({ to: "/loja", search: a ? { uso: a } : {} });
  };
  return (
    <section aria-label="Escolha seu ambiente" className="w-full min-w-0">
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-2">
        {([
          { value: "casa", label: "PARA MIM", support: "Cuidados em casa", Icon: House },
          { value: "salao", label: "PARA CABELEIREIRAS", support: "Produtos para salão", Icon: Scissors },
        ] as const).map(({ value, label, support, Icon }) => (
          <Button key={value} type="button" variant="outline" aria-pressed={audience === value}
            onClick={() => go(value)}
            className={`h-auto min-h-16 min-w-0 gap-2 whitespace-normal border-foreground px-2 py-2 shadow-none ${audience === value ? "bg-foreground text-background hover:bg-foreground hover:text-background" : "bg-background text-foreground hover:bg-muted"}`}>
            <Icon aria-hidden="true" />
            <span className="min-w-0 text-left"><span className="block text-[11px] font-semibold sm:text-xs">{label}</span><span className="block text-[11px] font-normal">{support}</span></span>
          </Button>
        ))}
      </div>
      <div className="flex justify-end"><Button type="button" variant="link" className="h-6 px-0 text-xs text-muted-foreground" onClick={() => go(null)}>Ver todos</Button></div>
    </section>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const path = useLocation().pathname;
  const hideWhatsApp = path === "/carrinho" || path === "/checkout";
  return (
    <div className="min-h-screen bg-background font-sans text-foreground">
      <div className="overflow-hidden bg-marquee py-2.5 text-xs font-medium tracking-wide text-marquee-foreground">
        <div className="flex w-max animate-marquee gap-12 whitespace-nowrap">
          {[...MARQUEE, ...MARQUEE, ...MARQUEE].map((m, i) => (
            <span key={i}>{m} &nbsp;✧</span>
          ))}
        </div>
      </div>
      <header className="sticky top-0 z-40 border-b border-border bg-background">
        <div className="container-site flex items-center gap-4 py-3">
          <button className="lg:hidden" aria-label="Abrir menu" onClick={() => setOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>
          <Link to="/" className="shrink-0">
            <img src={LOGO} alt="Vonix Hair" className="h-11 w-auto brightness-0" />
          </Link>
          <div className="mx-auto hidden min-w-0 w-full max-w-xl flex-col items-center gap-1.5 lg:flex">
            <SearchBox />
            <AudienceChoice />
            <nav className="flex whitespace-nowrap gap-5 text-xs uppercase">
              {NAV.map((n) => (
                <Link key={n.label} to="/loja" search={n.search} className="shrink-0 hover:underline">
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="ml-auto flex items-center gap-4 text-sm">
            <Link to="/favoritos" aria-label="Favoritos">
              <Heart className="h-5 w-5" />
            </Link>
            <Link to="/conta" className="hidden items-center gap-1 sm:flex">
              <User className="h-4 w-4" /> Entrar
            </Link>
            <Link to="/carrinho" aria-label="Carrinho" className="relative">
              <ShoppingBag className="h-5 w-5" />
              {count > 0 && (
                <span className="absolute -right-2 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-foreground px-1 text-[10px] text-background">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
        <div className="container-site space-y-2 pb-3 lg:hidden">
          <SearchBox />
          <AudienceChoice />
        </div>
      </header>
      {open && (
        <div className="fixed inset-0 z-50 bg-foreground/50" onClick={() => setOpen(false)}>
          <aside
            className="h-full w-72 bg-background p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <button aria-label="Fechar menu" onClick={() => setOpen(false)} className="mb-6">
              <X className="h-6 w-6" />
            </button>
            <nav className="flex flex-col gap-4 text-sm uppercase">
              {NAV.map((n) => (
                <Link key={n.label} to="/loja" search={n.search} onClick={() => setOpen(false)}>
                  {n.label}
                </Link>
              ))}
              <Link to="/favoritos" onClick={() => setOpen(false)}>Favoritos</Link>
              <Link to="/conta" onClick={() => setOpen(false)}>Entrar / Meus pedidos</Link>
              <Link to="/carrinho" onClick={() => setOpen(false)}>Carrinho</Link>
            </nav>
          </aside>
        </div>
      )}
      <main>{children}</main>
      <Footer />
      {!hideWhatsApp && (
        <a
          href={WHATSAPP}
          target="_blank"
          rel="noreferrer"
          aria-label="Falar no WhatsApp"
          className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-lg"
        >
          <MessageCircle className="h-7 w-7" />
        </a>
      )}
    </div>
  );
}

function Footer() {
  return (
    <footer className="mt-20 bg-marquee text-marquee-foreground">
      <div className="container-site grid gap-6 border-b border-marquee-foreground/15 py-6 text-center text-sm sm:grid-cols-4">
        <span>Entrega para todo o Brasil</span>
        <span>Compra 100% segura</span>
        <span>Até 6x sem juros no cartão</span>
        <span>Frete grátis acima de R$ 150 em produtos</span>
      </div>
      <div className="container-site grid gap-10 py-12 text-sm sm:grid-cols-4">
        <div>
          <img src={LOGO} alt="Vonix Hair" className="mb-4 h-12 invert" />
          <p className="opacity-80">
            Cosméticos da maior indústria brasileira, com qualidade e entrega rápida.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="mb-2 font-semibold">Comprar</h4>
          <Link to="/loja">Todos os Produtos</Link>
          <Link to="/loja" search={{ tiposProduto: "Kits" }}>Kits</Link>
          <Link to="/loja" search={{ tiposProduto: "Finalizadores" }}>Finalizadores</Link>
          <Link to="/loja" search={{ necessidades: "Hidratação" }}>Hidratação</Link>
        </div>
        <div className="flex flex-col gap-2">
          <h4 className="mb-2 font-semibold">Ajuda</h4>
          <Link to="/$page" params={{ page: "sobre" }}>Sobre a Vonix Hair</Link>
          <Link to="/conta">Meus pedidos</Link>
          <Link to="/favoritos">Favoritos</Link>
          <Link to="/$page" params={{ page: "contato" }}>Contato</Link>
        </div>
        <div className="flex flex-col gap-2 opacity-90">
          <h4 className="mb-2 font-semibold">Atendimento</h4>
          <span>Seg. a sex., 9h às 18h</span>
          <span>contato@vonixhaircosmeticos.com.br</span>
          <span>+55 31 9 9008-6296</span>
          <span>Rua José Pedro de Carvalho, 30 — MG</span>
          <span>CNPJ: 68.272.005/0001-07</span>
          <a href="https://instagram.com/vonixhairoficial" target="_blank" rel="noreferrer">Instagram</a>
        </div>
      </div>
      <div className="container-site flex flex-wrap justify-between gap-3 border-t border-marquee-foreground/15 py-5 text-xs opacity-80">
        <span>© 2026 Vonix Hair. Todos os direitos reservados.</span>
        <div className="flex flex-wrap gap-4">
          <Link to="/$page" params={{ page: "politica-de-privacidade" }}>Política de Privacidade</Link>
          <Link to="/$page" params={{ page: "termos-de-uso" }}>Termos de Uso</Link>
          <Link to="/$page" params={{ page: "politica-de-trocas-e-devolucoes" }}>Política de Troca e Devoluções</Link>
          <Link to="/$page" params={{ page: "politica-de-frete" }}>Política de Frete</Link>
        </div>
      </div>
    </footer>
  );
}

export function PriceBlock({ price, compare, big, offer = false }: { price: number; compare?: number | null; big?: boolean; offer?: boolean }) {
  const i = installments(price);
  return (
    <div className={big ? "space-y-1" : "space-y-0.5 text-sm"}>
      <div className="flex items-baseline gap-2">
        {compare && compare > price && (
          <span className="text-muted-foreground line-through">{brl(compare)}</span>
        )}
        <span className={big ? "text-3xl font-semibold" : "font-semibold"}>{brl(price)}</span>
      </div>
      {!offer && <div>
        <b>{brl(pixPrice(price))}</b> no Pix
      </div>}
      <div className="text-muted-foreground">
        ou até {i.count}x de {brl(i.value)} sem juros
      </div>
    </div>
  );
}

export function Stars({ count }: { count: number }) {
  if (!count) return null;
  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      <span className="text-star">★★★★★</span>({count})
    </div>
  );
}

export function ProductCard({ p }: { p: Product }) {
  const fav = useFavorites();
  const { audience } = useAudience();
  const pricing = cardPricing(p, audience);
  const off = discountPct(p.compareBase, pricing.price);
  return (
    <div className="group flex flex-col">
      <div className="relative overflow-hidden rounded-xl bg-card-image">
        {(pricing.professional || off > 0) && (
          <span className="absolute left-2 top-2 z-10 rounded-full bg-foreground px-2.5 py-1 text-[11px] font-medium text-background">
            {pricing.professional ? "5% profissional" : `${off}% OFF`}
          </span>
        )}
        <button
          aria-label="Favoritar"
          onClick={() => fav.toggle(p.slug)}
          className="absolute right-2 top-2 z-10 grid h-8 w-8 place-items-center rounded-full bg-background"
        >
          <Heart className={`h-4 w-4 ${fav.has(p.slug) ? "fill-foreground" : ""}`} />
        </button>
        <Link to="/produto/$slug" params={{ slug: p.slug }}>
          <img src={p.images[0]} alt={`Vonix Hair ${p.name}`} loading="lazy" className="aspect-square w-full object-contain transition-transform duration-500 group-hover:scale-105" />
        </Link>
      </div>
      <Link to="/produto/$slug" params={{ slug: p.slug }} className="mt-3 font-medium hover:underline">
        {p.name}
      </Link>
      <Stars count={p.reviews} />
      <div className="mt-1 flex-1">
        <PriceBlock price={pricing.price} compare={pricing.professional ? p.variants[0].price : p.compareBase} offer={pricing.professional} />
      </div>
      <Link
        to="/produto/$slug"
        params={{ slug: p.slug }}
        className="mt-3 rounded-full bg-action py-2.5 text-center text-sm font-medium text-action-foreground"
      >
        Comprar agora
      </Link>
    </div>
  );
}

export function Grid({ items }: { items: Product[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
      {items.map((p) => (
        <ProductCard key={p.slug} p={p} />
      ))}
    </div>
  );
}

/** Minimal markdown renderer for verified source texts. */
export function Md({ text }: { text: string }) {
  const inline = (s: string) =>
    s.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
      part.startsWith("**") ? <b key={i}>{part.slice(2, -2)}</b> : part,
    );
  return (
    <div className="space-y-3 leading-relaxed">
      {text.split(/\n{2,}/).map((b, i) => {
        const t = b.trim();
        if (!t) return null;
        if (t === "---") return <hr key={i} className="border-border" />;
        if (t.startsWith("# ")) return <h1 key={i} className="font-display text-4xl">{t.slice(2)}</h1>;
        if (t.startsWith("## ")) return <h2 key={i} className="pt-3 text-lg font-semibold">{t.slice(3)}</h2>;
        const ls = t.split("\n");
        if (ls.every((l) => /^(- |\d+\. )/.test(l)))
          return (
            <ul key={i} className="list-disc space-y-1 pl-5">
              {ls.map((l, j) => <li key={j}>{inline(l.replace(/^(- |\d+\. )/, ""))}</li>)}
            </ul>
          );
        return (
          <p key={i}>
            {ls.map((l, j) => (
              <span key={j}>{inline(l)}{j < ls.length - 1 && <br />}</span>
            ))}
          </p>
        );
      })}
    </div>
  );
}

export function Page({ children }: { children: ReactNode }) {
  return <div className="container-site max-w-3xl py-12">{children}</div>;
}
