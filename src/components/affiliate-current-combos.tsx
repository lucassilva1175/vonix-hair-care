import { useEffect, useRef, useState } from "react";
import { affiliateSearchTerms, matchesAffiliateSearch } from "@/lib/affiliate-catalog-search";
import { ArrowUpRight, Search, PackageOpen, Bookmark, Check, X, ClipboardCopy } from "lucide-react";
import { isProOnly, vitrine } from "@/lib/store";
import packagingImages from "@/data/sacolinhas.json";
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
  const [mode, setMode] = useState<"combos" | "products">("combos");
  const [category, setCategory] = useState("");
  const [usage, setUsage] = useState<"" | "professional" | "other">("");
  const [packaging, setPackaging] = useState(false);
  const [failedPackaging, setFailedPackaging] = useState<string[]>([]);
  const [shortlist, setShortlist] = useState<string[]>([]);
  const [copyState, setCopyState] = useState<"idle" | "copying" | "copied" | "failed">("idle");
  const shortlistCopyVersion = useRef(0);
  const shortlistCopying = useRef(false);
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
  const individual = vitrine.filter((p) => !p.slug.startsWith("combo-"));
  const items = mode === "combos" ? ordered : individual;
  const selectedProducts = shortlist.flatMap((slug) => {
    const item = [...ordered, ...individual].find((p) => p.slug === slug);
    return item ? [item] : [];
  });
  const shortlistText = [
    "VONIX HAIR — referências de conteúdo",
    ...selectedProducts.map(
      (p) =>
        p.name +
        (isProOnly(p.slug) ? " (uso exclusivamente profissional)" : "") +
        "\nhttps://vonixhair.com/produto/" +
        p.slug,
    ),
    "Lista editorial pessoal. Não é pedido, kit de inscrição ou garantia de parceria. Confira as orientações oficiais de uso.",
  ].join("\n\n");

  function invalidateCopy() {
    shortlistCopyVersion.current++;
    // A clipboard write cannot be cancelled. Keep the lock until it settles
    // so an older write cannot overwrite a newer explicit copy.
    if (!shortlistCopying.current) setCopyState("idle");
  }
  function toggleShortlist(slug: string) {
    invalidateCopy();
    setShortlist((prev) =>
      prev.includes(slug)
        ? prev.filter((x) => x !== slug)
        : prev.length < 6
          ? [...prev, slug]
          : prev,
    );
  }
  async function copyShortlist() {
    if (!selectedProducts.length || shortlistCopying.current) return;
    const version = ++shortlistCopyVersion.current;
    shortlistCopying.current = true;
    setCopyState("copying");
    try {
      await navigator.clipboard.writeText(shortlistText);
      if (version === shortlistCopyVersion.current) setCopyState("copied");
    } catch {
      if (version === shortlistCopyVersion.current) setCopyState("failed");
    } finally {
      shortlistCopying.current = false;
      if (version !== shortlistCopyVersion.current) setCopyState("idle");
    }
  }
  const categories = [...new Set(individual.map((p) => p.categoryLabel))].sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );
  const noun = mode === "combos" ? "combos" : "produtos";
  const search = affiliateSearchTerms(query).length > 0 || !!category || !!usage;
  const matches = items.filter(
    (p) =>
      (!category || p.categoryLabel === category) &&
      (!usage || isProOnly(p.slug) === (usage === "professional")) &&
      matchesAffiliateSearch(p.name + " " + p.slug + " " + p.categoryLabel, query),
  );
  const visible = all || search ? matches : matches.slice(0, 6);
  const otherMode = mode === "combos" ? "products" : "combos";
  const otherMatches = affiliateSearchTerms(query).length
    ? (otherMode === "products" ? individual : ordered).filter((p) =>
        matchesAffiliateSearch(p.name + " " + p.slug + " " + p.categoryLabel, query),
      ).length
    : 0;
  function clearFilters() {
    setQuery("");
    setCategory("");
    setUsage("");
    setAll(false);
    searchRef.current?.focus();
  }
  function switchMode(next: "combos" | "products") {
    setMode(next);
    setQuery("");
    setCategory("");
    setUsage("");
    setAll(false);
    setPackaging(false);
  }
  useEffect(() => {
    const reveal = () => {
      if (window.location.hash === "#vitrine-afiliadas") setOpen(true);
    };
    const onClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        event.altKey
      )
        return;
      if (event.target instanceof Element && event.target.closest('a[href="#vitrine-afiliadas"]'))
        setOpen(true);
    };
    document.addEventListener("click", onClick);
    window.addEventListener("hashchange", reveal);
    reveal();
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("hashchange", reveal);
    };
  }, []);
  if (!combos.length && !individual.length) return null;
  return (
    <section
      id="vitrine-afiliadas"
      aria-labelledby="affiliate-c161-combos-title"
      data-testid="affiliate-c161-combos"
      className="scroll-mt-32 bg-[#fbf5f2] px-5 py-5 sm:py-8"
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
              Produtos reais para inspirar seu conteúdo
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#755d66]">
              {combos.length} combos e {individual.length} produtos individuais da vitrine atual.
              Explore as linhas, embalagens e orientações da loja oficial. São produtos comerciais,
              não brindes ou kits de inscrição.
            </p>
          </div>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="affiliate-c161-combo-panel"
            onClick={() => setOpen((value) => !value)}
            className="min-h-[48px] rounded-full bg-[#784254] px-5 py-3 text-sm font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            {open ? "Recolher combos" : "Explorar novos combos"}
          </button>
        </div>
        <div id="affiliate-c161-combo-panel" hidden={!open}>
          {open && (
            <>
              <div
                role="group"
                aria-label="Tipo de catálogo"
                className="mt-5 grid grid-cols-2 gap-2 rounded-xl bg-[#fbf5f2] p-2"
              >
                {(["combos", "products"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={mode === value}
                    onClick={() => switchMode(value)}
                    className={
                      "min-h-[48px] rounded-lg px-3 py-2 text-xs font-bold focus-visible:outline-2 " +
                      (mode === value ? "bg-[#784254] text-white" : "bg-white text-[#724155]")
                    }
                  >
                    {value === "combos"
                      ? "Combos (" + combos.length + ")"
                      : "Produtos individuais (" + individual.length + ")"}
                  </button>
                ))}
              </div>
              <div
                data-testid="affiliate-reference-shortlist"
                className="mt-4 rounded-xl border border-[#e5d2d4] bg-[#fff8f6] p-3 sm:p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="inline-flex items-center gap-2 text-sm font-bold text-[#724155]">
                    <Bookmark aria-hidden="true" className="size-4" /> Minha lista de referências
                  </h3>
                  <span
                    aria-live="polite"
                    className="text-xs font-bold tabular-nums text-[#89586a]"
                  >
                    {selectedProducts.length} de 6 itens
                  </span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-[#755d66]">
                  Separe produtos para ideias de conteúdo. A lista fica apenas nesta página, sem
                  compra, cadastro ou armazenamento de dados.
                </p>
                {selectedProducts.length > 0 && (
                  <>
                    <ul
                      aria-label="Produtos selecionados"
                      className="mt-3 grid gap-2 sm:grid-cols-2"
                    >
                      {selectedProducts.map((p) => (
                        <li
                          key={p.slug}
                          className="flex items-center justify-between gap-2 rounded-lg border border-[#e5d2d4] bg-white px-3 py-2"
                        >
                          <div className="min-w-0">
                            <a
                              href={"/produto/" + p.slug}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={() => trackAffiliateFunnel("affiliate_catalog_source_open")}
                              className="text-xs font-bold text-[#724155] underline underline-offset-2"
                            >
                              {p.name}
                            </a>
                            <p className="text-[10px] leading-relaxed text-[#755d66]">
                              {p.categoryLabel}
                              {isProOnly(p.slug) ? " · uso exclusivamente profissional" : ""}
                            </p>
                          </div>
                          <button
                            type="button"
                            aria-label={"Remover " + p.name + " da lista"}
                            onClick={() => toggleShortlist(p.slug)}
                            className="grid size-[44px] shrink-0 place-items-center rounded-lg border border-[#e5d2d4] text-[#724155] focus-visible:outline-2"
                          >
                            <X aria-hidden="true" className="size-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={copyState === "copying"}
                        onClick={() => void copyShortlist()}
                        className="inline-flex min-h-[44px] items-center gap-2 rounded-lg bg-[#784254] px-4 text-xs font-bold text-white disabled:opacity-50"
                      >
                        <ClipboardCopy aria-hidden="true" className="size-4" />
                        {copyState === "copying"
                          ? "Copiando lista..."
                          : "Copiar lista de referências"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          invalidateCopy();
                          setShortlist([]);
                        }}
                        className="min-h-[44px] rounded-lg border border-[#d8bfc5] bg-white px-3 text-xs font-bold text-[#724155]"
                      >
                        Limpar minha lista
                      </button>
                    </div>
                    {copyState === "copied" && (
                      <p role="status" className="mt-2 text-xs font-semibold text-[#58734f]">
                        Lista copiada com os links oficiais.
                      </p>
                    )}
                    {copyState === "failed" && (
                      <div className="mt-2">
                        <p className="text-xs font-semibold text-[#724155]">
                          Selecione o texto para copiar manualmente.
                        </p>
                        <textarea
                          aria-label="Lista de referências para copiar manualmente"
                          readOnly
                          rows={5}
                          value={shortlistText}
                          onFocus={(event) => event.currentTarget.select()}
                          className="mt-1 w-full rounded-lg border border-[#d8bfc5] bg-white p-3 text-xs text-[#724155]"
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
              <label
                className="mt-5 block text-xs font-bold text-[#724155]"
                htmlFor="affiliate-c161-combo-search"
              >
                {mode === "combos"
                  ? "Buscar pelo nome do combo"
                  : "Buscar pelo nome ou categoria do produto"}
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
                  className="min-h-[48px] w-full min-w-0 bg-transparent text-sm text-[#523342] focus-visible:outline-2"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      searchRef.current?.focus();
                    }}
                    className="min-h-[44px] px-2 text-xs font-bold text-[#724155]"
                  >
                    Limpar
                  </button>
                )}
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {mode === "products" && (
                  <label className="block text-xs font-bold text-[#724155]">
                    Categoria
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="mt-1 block min-h-[48px] w-full rounded-xl border border-[#d8bfc5] bg-white px-3 text-sm"
                    >
                      <option value="">Todas as categorias</option>
                      {categories.map((name) => (
                        <option key={name}>{name}</option>
                      ))}
                    </select>
                  </label>
                )}
                <label className="block text-xs font-bold text-[#724155]">
                  Orientação de uso
                  <select
                    value={usage}
                    onChange={(e) => setUsage(e.target.value as typeof usage)}
                    className="mt-1 block min-h-[48px] w-full rounded-xl border border-[#d8bfc5] bg-white px-3 text-sm"
                  >
                    <option value="">Todos os itens</option>
                    <option value="professional">Uso exclusivamente profissional</option>
                    <option value="other">Demais itens do catálogo</option>
                  </select>
                </label>
              </div>
              {mode === "products" && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    aria-pressed={packaging}
                    onClick={() => setPackaging((v) => !v)}
                    className="min-h-[44px] rounded-full border border-[#d8bfc5] px-4 text-xs font-bold text-[#724155]"
                  >
                    {packaging ? "Ver fotos dos produtos" : "Ver embalagens disponíveis"}
                  </button>
                  <span className="text-xs text-[#755d66]">
                    Quando não houver embalagem cadastrada, mostramos a foto do produto.
                  </span>
                </div>
              )}
              {(category || usage) && matches.length > 0 && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-2 min-h-[44px] text-xs font-bold text-[#724155] underline"
                >
                  Limpar todos os filtros
                </button>
              )}
              <p aria-live="polite" className="mt-3 text-xs text-[#755d66]">
                Mostrando {visible.length} de {matches.length} {noun} encontrados.
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {visible.map((p) => (
                  <div key={p.slug} className="flex min-w-0 flex-col gap-1">
                    <a
                      href={"/produto/" + p.slug}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackAffiliateFunnel("affiliate_catalog_source_open")}
                      className="group flex min-w-0 flex-1 items-center gap-3 overflow-hidden rounded-2xl border border-[#e5d2d4] bg-white p-3 shadow-[0_8px_24px_rgba(83,42,58,.06)] transition-colors hover:border-[#b98b9c] hover:bg-[#fff8f6] focus-visible:outline-2 focus-visible:outline-offset-2 sm:flex-col sm:items-stretch sm:p-4"
                    >
                      <img
                        src={
                          packaging &&
                          p.slug !== "kit-monovonix" &&
                          !failedPackaging.includes(p.slug) &&
                          (packagingImages as Record<string, string>)[p.slug]
                            ? (packagingImages as Record<string, string>)[p.slug]
                            : "/images/products/" + p.slug + "-480.webp"
                        }
                        onError={() => {
                          if (packaging)
                            setFailedPackaging((prev) =>
                              prev.includes(p.slug) ? prev : [...prev, p.slug],
                            );
                        }}
                        alt=""
                        width={480}
                        height={480}
                        loading="lazy"
                        decoding="async"
                        className="size-24 shrink-0 rounded-xl bg-[#fbf5f2] object-contain sm:aspect-square sm:h-auto sm:w-full sm:p-3"
                      />
                      <span className="min-w-0 text-sm font-bold text-[#724155]">
                        <span className="block text-[10px] font-semibold uppercase tracking-wide text-[#89586a]">
                          {p.categoryLabel}
                        </span>
                        <span className="mt-1 block leading-snug sm:text-base">{p.name}</span>
                        {isProOnly(p.slug) && (
                          <span className="mt-1 block text-[11px] text-[#755d66]">
                            Uso profissional · consulte o rótulo
                          </span>
                        )}
                        <span className="mt-2 inline-flex items-center gap-1 text-xs underline underline-offset-4">
                          {mode === "combos"
                            ? "Ver composição (nova aba)"
                            : "Ver produto (nova aba)"}{" "}
                          <ArrowUpRight aria-hidden="true" className="size-3.5 shrink-0" />
                        </span>
                      </span>
                    </a>
                    <button
                      type="button"
                      aria-label={
                        (shortlist.includes(p.slug) ? "Remover " : "Adicionar ") +
                        p.name +
                        (shortlist.includes(p.slug)
                          ? " da lista de referências"
                          : " à lista de referências")
                      }
                      aria-pressed={shortlist.includes(p.slug)}
                      disabled={!shortlist.includes(p.slug) && shortlist.length >= 6}
                      onClick={() => toggleShortlist(p.slug)}
                      className={
                        "flex min-h-[44px] items-center justify-center gap-2 rounded-lg border px-3 text-xs font-bold focus-visible:outline-2 disabled:opacity-50 " +
                        (shortlist.includes(p.slug)
                          ? "border-[#784254] bg-[#f0e2e4] text-[#724155]"
                          : "border-[#e5d2d4] bg-white text-[#724155]")
                      }
                    >
                      {shortlist.includes(p.slug) ? (
                        <Check aria-hidden="true" className="size-4" />
                      ) : (
                        <Bookmark aria-hidden="true" className="size-4" />
                      )}
                      {shortlist.includes(p.slug) ? "Na minha lista" : "Guardar referência"}
                    </button>
                  </div>
                ))}
              </div>
              {!matches.length && (
                <div className="mt-4 rounded-xl border border-[#e5d2d4] bg-[#fff8f6] p-4 text-sm text-[#755d66]">
                  <p>
                    {mode === "combos" ? "Nenhum combo encontrado." : "Nenhum produto encontrado."}{" "}
                    Experimente outro nome ou filtro.
                  </p>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-2 min-h-[44px] font-bold text-[#724155] underline underline-offset-4 focus-visible:outline-2"
                  >
                    Limpar todos os filtros
                  </button>
                  {otherMatches > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const term = query;
                        switchMode(otherMode);
                        setQuery(term);
                        searchRef.current?.focus();
                      }}
                      className="ml-0 block min-h-[44px] rounded-xl bg-[#784254] px-4 py-2 text-xs font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 sm:ml-3 sm:inline-flex sm:items-center"
                    >
                      Ver {otherMatches}{" "}
                      {otherMode === "products" ? "produtos individuais" : "combos"} com esta busca
                      <ArrowUpRight aria-hidden="true" className="ml-1 size-4" />
                    </button>
                  )}
                </div>
              )}
              {!search && matches.length > 6 && (
                <button
                  type="button"
                  onClick={() => setAll((value) => !value)}
                  aria-expanded={all}
                  className="mt-4 min-h-[48px] w-full rounded-full border border-[#d8bfc5] px-4 text-sm font-bold text-[#724155]"
                >
                  {all ? "Mostrar apenas destaques" : "Ver todos os " + matches.length + " " + noun}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
