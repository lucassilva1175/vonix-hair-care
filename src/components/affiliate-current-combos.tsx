import { useRef, useState } from "react";
import { affiliateSearchTerms, matchesAffiliateSearch } from "@/lib/affiliate-catalog-search";
import { ArrowUpRight, Search, PackageOpen } from "lucide-react";
import { vitrine } from "@/lib/store";
import { trackAffiliateFunnel } from "@/lib/affiliate-funnel";

const featured = [
  "combo-botox-vonix-nutri-repair",
  "combo-sos-reconstrutor",
  "combo-fio-de-luz-completo",
  "combo-finalizacao-serum",
  "combo-trio-shampoos-hidratantes",
  "combo-teia-coco-nutri-shampoo",
];

export function AffiliateCurrentCombos() {
  const [open, setOpen] = useState(false);
  const [all, setAll] = useState(false);
  const [query, setQuery] = useState("");
  // The perfume is currently excluded as a standalone product; do not promote
  // its combo until the brand confirms component availability.
  const combos = vitrine.filter(
    (p) => p.slug.startsWith("combo-") && p.slug !== "combo-perfume-e-serum",
  );
  const ordered = [...combos].sort((a, b) => {
    const rank = (slug: string) =>
      featured.includes(slug) ? featured.indexOf(slug) : featured.length;
    return rank(a.slug) - rank(b.slug);
  });
  const searchRef = useRef<HTMLInputElement>(null);
  const search = affiliateSearchTerms(query).length > 0;
  const matches = ordered.filter((p) => matchesAffiliateSearch(p.name + " " + p.slug, query));
  const visible = all || search ? matches : matches.slice(0, 6);
  if (!combos.length) return null;
  return (
    <section
      aria-labelledby="affiliate-c161-combos-title"
      data-testid="affiliate-c161-combos"
      className="bg-[#fbf5f2] px-5 py-5 sm:py-8"
    >
      <div className="mx-auto max-w-6xl rounded-2xl border border-[#e3ccc9] bg-white p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#89586a]">
              <PackageOpen aria-hidden="true" className="size-4" /> Vitrine atual da loja
            </p>
            <h2
              id="affiliate-c161-combos-title"
              className="mt-2 font-display text-2xl text-[#523342] sm:text-3xl"
            >
              Novas combinações para inspirar seu conteúdo
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#755d66]">
              {combos.length} combos selecionados do catálogo atual. Conheça as composições na loja
              oficial. São produtos comerciais, não brindes ou kits de inscrição.
            </p>
          </div>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="affiliate-c161-combo-panel"
            onClick={() => setOpen((value) => !value)}
            className="min-h-12 rounded-full bg-[#784254] px-5 py-3 text-sm font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            {open ? "Recolher combos" : "Explorar novos combos"}
          </button>
        </div>
        <div id="affiliate-c161-combo-panel" hidden={!open}>
          {open && (
            <>
              <label
                className="mt-5 block text-xs font-bold text-[#724155]"
                htmlFor="affiliate-c161-combo-search"
              >
                Buscar pelo nome do combo
              </label>
              <div className="mt-2 flex items-center gap-2 rounded-xl border border-[#d8bfc5] px-3">
                <Search aria-hidden="true" className="size-4 shrink-0 text-[#89586a]" />
                <input
                  ref={searchRef}
                  id="affiliate-c161-combo-search"
                  type="search"
                  maxLength={80}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ex.: Botox, hidratação, Fio de Luz"
                  className="min-h-12 w-full min-w-0 bg-transparent text-sm text-[#523342] focus-visible:outline-2"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      searchRef.current?.focus();
                    }}
                    className="min-h-11 px-2 text-xs font-bold text-[#724155]"
                  >
                    Limpar
                  </button>
                )}
              </div>
              <p aria-live="polite" className="mt-3 text-xs text-[#755d66]">
                Mostrando {visible.length} de {matches.length} combos encontrados.
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {visible.map((p) => (
                  <a
                    key={p.slug}
                    href={"/produto/" + p.slug}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => trackAffiliateFunnel("affiliate_catalog_source_open")}
                    className="flex min-w-0 items-center gap-3 rounded-xl border border-[#e5d2d4] p-3 hover:bg-[#fff8f6] focus-visible:outline-2 focus-visible:outline-offset-2"
                  >
                    <img
                      src={"/images/products/" + p.slug + "-480.webp"}
                      alt=""
                      width={480}
                      height={480}
                      loading="lazy"
                      decoding="async"
                      className="size-24 shrink-0 rounded-lg bg-[#fbf5f2] object-contain"
                    />
                    <span className="min-w-0 text-sm font-bold text-[#724155]">
                      <span className="block">{p.name}</span>
                      <span className="mt-2 inline-flex items-center gap-1 text-xs underline underline-offset-4">
                        Ver composição (nova aba){" "}
                        <ArrowUpRight aria-hidden="true" className="size-3.5 shrink-0" />
                      </span>
                    </span>
                  </a>
                ))}
              </div>
              {!matches.length && (
                <p className="mt-4 text-sm text-[#755d66]">
                  Nenhum combo encontrado. Experimente outro nome.
                </p>
              )}
              {!search && matches.length > 6 && (
                <button
                  type="button"
                  onClick={() => setAll((value) => !value)}
                  aria-expanded={all}
                  className="mt-4 min-h-12 w-full rounded-full border border-[#d8bfc5] px-4 text-sm font-bold text-[#724155]"
                >
                  {all ? "Mostrar apenas destaques" : "Ver todos os " + matches.length + " combos"}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
