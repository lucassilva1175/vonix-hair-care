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
  variants: [Variant, ...Variant[]];
  compareBase: number | null;
  reviews: number;
};

export const products = raw as unknown as Product[];
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
export const pixPrice = (v: number) => Math.round((cents(v) * 95) / 100) / 100;

/** Splits a total into up to 6 interest-free parcels; the first absorbs leftover cents. */
export function installments(total: number, n = MAX_INSTALLMENTS) {
  const t = cents(total);
  const base = Math.floor(t / n);
  const first = t - base * (n - 1);
  return { count: n, value: base / 100, first: first / 100 };
}

/** Free shipping strictly ABOVE R$ 150,00 of product subtotal (after discounts). */
export const hasFreeShipping = (subtotal: number) => subtotal > FREE_SHIPPING_ABOVE;

const CEP_KEY = "vonix-cep";
export const getSavedCep = () => (typeof window === "undefined" ? "" : (localStorage.getItem(CEP_KEY) ?? ""));
export const saveCep = (cep: string) => {
  if (typeof window !== "undefined") localStorage.setItem(CEP_KEY, cep);
};
export const maskCep = (v: string) => {
  const d = v.replace(/\D/g, "").slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
};
export const missingForFreeShipping = (subtotal: number) =>
  hasFreeShipping(subtotal) ? 0 : Math.max(0, cents(FREE_SHIPPING_ABOVE + 0.01 - subtotal) / 100);

export const discountPct = (compare: number | null, price: number) =>
  compare && compare > price ? Math.round((1 - price / compare) * 100) : 0;

/* ---------- professional classification (explicit metadata) ---------- */
/**
 * Salon-only products: progressivas and the Fio de Luz line (user-confirmed),
 * plus items whose own description/short text confirms salon use.
 * Everything else is "both" (home + professional).
 */
export const PRO_ONLY = new Set([
  "progressiva-fio-de-luz",
  "progressiva-diamond",
  "progressiva-lift-em-gel",
  "progressiva-vonix-special-matizadora",
  "shampoo-fio-de-luz-anti-residuo",
  "botox-vonix",
  "kit-cauterizacao",
]);
export const isProOnly = (slug: string) => PRO_ONLY.has(slug);

/* ---------- line offers: 5% complement, pro kits 2un/12% and 3un/20% ---------- */
export type Offer = "comp5" | "kit2" | "kit3";
export const OFFER_LABEL: Record<Offer, string> = {
  comp5: "5% OFF neste item",
  kit2: "Kit 2 unidades · 12% OFF",
  kit3: "Kit 3 unidades · 20% OFF",
};

/** Line totals in cents-safe math. qty = units for comp5/normal, kits for kit2/kit3. */
export function lineTotals(price: number, qty: number, offer?: Offer) {
  const u = cents(price);
  if (offer === "kit2") {
    const kit = Math.round((u * 2 * 88) / 100);
    return { gross: (u * 2 * qty) / 100, net: (kit * qty) / 100, units: 2 * qty };
  }
  if (offer === "kit3") {
    const kit = Math.round((u * 3 * 80) / 100);
    return { gross: (u * 3 * qty) / 100, net: (kit * qty) / 100, units: 3 * qty };
  }
  if (offer === "comp5") {
    const unit = Math.round((u * 95) / 100);
    return { gross: (u * qty) / 100, net: (unit * qty) / 100, units: qty };
  }
  return { gross: (u * qty) / 100, net: (u * qty) / 100, units: qty };
}

/* ---------- persistent cart & favorites ---------- */
export type CartItem = { slug: string; variant: string; qty: number; offer?: Offer };

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
      if (!p || !v) return null;
      const t = lineTotals(v.price, i.qty, i.offer);
      return { ...i, product: p, price: v.price, gross: t.gross, net: t.net, units: t.units, total: t.net };
    })
    .filter((x): x is NonNullable<typeof x> => !!x);
  const subtotal = cents(lines.reduce((s, l) => s + l.gross, 0)) / 100;
  const netSubtotal = cents(lines.reduce((s, l) => s + l.net, 0)) / 100;
  const count = lines.reduce((s, l) => s + l.units, 0);
  const key = (i: { slug: string; variant: string; offer?: Offer }) => `${i.slug}|${i.variant}|${i.offer ?? ""}`;
  return {
    lines,
    subtotal,
    netSubtotal,
    count,
    add: (slug: string, variant: string, qty = 1, offer?: Offer) =>
      cartStore.set((s) => {
        const k = key({ slug, variant, offer });
        const ex = s.find((i) => key(i) === k);
        return ex
          ? s.map((i) => (key(i) === k ? { ...i, qty: i.qty + qty } : i))
          : [...s, { slug, variant, qty, ...(offer ? { offer } : {}) }];
      }),
    setQty: (slug: string, variant: string, qty: number, offer?: Offer) =>
      cartStore.set((s) => {
        const k = key({ slug, variant, offer });
        return qty <= 0
          ? s.filter((i) => key(i) !== k)
          : s.map((i) => (key(i) === k ? { ...i, qty } : i));
      }),
    remove: (slug: string, variant: string, offer?: Offer) =>
      cartStore.set((s) => {
        const k = key({ slug, variant, offer });
        return s.filter((i) => key(i) !== k);
      }),
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

export const MAX_DISCOUNT = Math.max(...products.map((p) => discountPct(p.compareBase, p.variants[0].price)));

/**
 * Checkout totals in cents. Free-shipping eligibility uses the product subtotal
 * BEFORE coupon and payment discounts: a Pix discount or valid coupon never
 * removes free shipping once the base is above R$ 150.
 */
export function checkoutTotals(subtotal: number, method: "pix" | "card", couponPct = 0) {
  const gross = cents(subtotal);
  const afterCoupon = gross - Math.round(gross * couponPct);
  const net = method === "pix" ? Math.round((afterCoupon * 95) / 100) : afterCoupon;
  return {
    gross: gross / 100,
    couponDiscount: (gross - afterCoupon) / 100,
    pixDiscount: (afterCoupon - net) / 100,
    discount: (gross - net) / 100,
    net: net / 100,
    freeShipping: gross > FREE_SHIPPING_ABOVE * 100,
  };
}

/* ---------- audience shortcut (casa / salão), persisted per browser ---------- */
export type Audience = "casa" | "salao" | null;
const audienceStore = createStore<Audience>("vonix-audience", null);
export function useAudience() {
  const audience = useSyncExternalStore(audienceStore.sub, audienceStore.get, audienceStore.server);
  return { audience, set: (a: Audience) => audienceStore.set(() => a) };
}

/** Usage filters based only on indications confirmed in the catalog descriptions. */
export const USAGE: Record<string, (p: Product) => boolean> = {
  casa: (p) =>
    p.category === "kits" ||
    p.category === "finalizadores" ||
    /casa|doméstic|dia a dia|diário/i.test(p.name + " " + p.description),
  salao: (p) => /profissional|salão/i.test(p.name + " " + p.description),
};
