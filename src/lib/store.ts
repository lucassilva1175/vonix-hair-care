import { useSyncExternalStore } from "react";
import raw from "@/data/products.json";

export type Variant = { label: string; price: number };
export type Product = {
  slug: string;
  name: string;
  category: string;
  categoryLabel: string;
  short: string;
  description: string;
  images: string[];
  variants: Variant[];
  compareBase: number | null;
  reviews: number;
};

export const products = raw as Product[];
export const getProduct = (slug: string) => products.find((p) => p.slug === slug);

export const FREE_SHIPPING_ABOVE = 150;
export const MAX_INSTALLMENTS = 6;
export const PIX_DISCOUNT = 0.05;
export const WHATSAPP =
  "https://wa.me/5531990086296?text=Ol%C3%A1%2C+vim+do+site+e+preciso+de+ajuda.";

export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const cents = (v: number) => Math.round(v * 100);

/** Pix price derived from the (new) sale price. */
export const pixPrice = (v: number) => cents(v * (1 - PIX_DISCOUNT)) / 100;

/** Splits a total into up to 6 interest-free parcels; the first absorbs leftover cents. */
export function installments(total: number, n = MAX_INSTALLMENTS) {
  const t = cents(total);
  const base = Math.floor(t / n);
  const first = t - base * (n - 1);
  return { count: n, value: base / 100, first: first / 100 };
}

/** Free shipping strictly ABOVE R$ 150,00 of product subtotal (after discounts). */
export const hasFreeShipping = (subtotal: number) => subtotal > FREE_SHIPPING_ABOVE;
export const missingForFreeShipping = (subtotal: number) =>
  hasFreeShipping(subtotal) ? 0 : Math.max(0, cents(FREE_SHIPPING_ABOVE + 0.01 - subtotal) / 100);

export const discountPct = (compare: number | null, price: number) =>
  compare && compare > price ? Math.round((1 - price / compare) * 100) : 0;

/* ---------- persistent cart & favorites ---------- */
export type CartItem = { slug: string; variant: string; qty: number };

function createStore<T>(key: string, initial: T) {
  let state = initial;
  let loaded = false;
  const subs = new Set<() => void>();
  const load = () => {
    if (loaded || typeof window === "undefined") return;
    loaded = true;
    try {
      const s = localStorage.getItem(key);
      if (s) state = JSON.parse(s);
    } catch {
      /* ignore */
    }
  };
  return {
    get: () => {
      load();
      return state;
    },
    server: () => initial,
    set: (fn: (s: T) => T) => {
      load();
      state = fn(state);
      localStorage.setItem(key, JSON.stringify(state));
      subs.forEach((f) => f());
    },
    sub: (f: () => void) => {
      subs.add(f);
      return () => subs.delete(f);
    },
  };
}

const cartStore = createStore<CartItem[]>("vonix-cart", []);
const favStore = createStore<string[]>("vonix-favs", []);

export function useCart() {
  const items = useSyncExternalStore(cartStore.sub, cartStore.get, cartStore.server);
  const lines = items
    .map((i) => {
      const p = getProduct(i.slug);
      const v = p?.variants.find((x) => x.label === i.variant) ?? p?.variants[0];
      return p && v ? { ...i, product: p, price: v.price, total: v.price * i.qty } : null;
    })
    .filter((x): x is NonNullable<typeof x> => !!x);
  const subtotal = cents(lines.reduce((s, l) => s + l.total, 0)) / 100;
  const count = lines.reduce((s, l) => s + l.qty, 0);
  return {
    lines,
    subtotal,
    count,
    add: (slug: string, variant: string, qty = 1) =>
      cartStore.set((s) => {
        const ex = s.find((i) => i.slug === slug && i.variant === variant);
        return ex
          ? s.map((i) => (i === ex ? { ...i, qty: i.qty + qty } : i))
          : [...s, { slug, variant, qty }];
      }),
    setQty: (slug: string, variant: string, qty: number) =>
      cartStore.set((s) =>
        qty <= 0
          ? s.filter((i) => !(i.slug === slug && i.variant === variant))
          : s.map((i) => (i.slug === slug && i.variant === variant ? { ...i, qty } : i)),
      ),
    remove: (slug: string, variant: string) =>
      cartStore.set((s) => s.filter((i) => !(i.slug === slug && i.variant === variant))),
    clear: () => cartStore.set(() => []),
  };
}

export function useFavorites() {
  const favs = useSyncExternalStore(favStore.sub, favStore.get, favStore.server);
  return {
    favs,
    has: (s: string) => favs.includes(s),
    toggle: (s: string) =>
      favStore.set((f) => (f.includes(s) ? f.filter((x) => x !== s) : [...f, s])),
  };
}

export const NEEDS: Record<string, RegExp> = {
  "Hidratação": /hidrat/i,
  "Reconstrução": /reconstru|reparação|repair|queratina/i,
  "Controle de Frizz": /frizz/i,
  "Definição de Cachos": /cacho/i,
  "Cabelos com Química": /química|quimica|loir|coloração|matiz/i,
  "Nutrição": /nutri/i,
};
export const TYPES: Record<string, (p: Product) => boolean> = {
  Progressiva: (p) => /progressiva/i.test(p.name),
  "Máscara": (p) => /máscara/i.test(p.name),
  Kits: (p) => p.category === "kits",
  Finalizadores: (p) => p.category === "finalizadores",
};
export const BEST_SELLERS = ["kit-cafe-verde", "kit-banana-e-mel", "kit-cronograma-capilar", "kit-whey-protein"];
