import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { existsSync } from "node:fs";
import { AffiliateCurrentCombos } from "@/components/affiliate-current-combos";
import { isProOnly, vitrine } from "@/lib/store";
import packagingImages from "@/data/sacolinhas.json";
import { matchesAffiliateSearch } from "@/lib/affiliate-catalog-search";
const analytics = vi.hoisted(() => ({ track: vi.fn() }));
vi.mock("@/lib/analytics", () => ({ track: analytics.track }));
afterEach(() => {
  cleanup();
  analytics.track.mockClear();
});
describe("C161 current official combo catalog", () => {
  it("defers images and shows six curated combos on demand, with no tracking before link click", () => {
    const html = renderToStaticMarkup(<AffiliateCurrentCombos />);
    expect(html).not.toContain("<img");
    render(<AffiliateCurrentCombos />);
    const section = screen.getByTestId("affiliate-c161-combos");
    expect(section.querySelectorAll("img")).toHaveLength(0);
    const toggle = within(section).getByRole("button", { name: "Explorar novos combos" });
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(within(section).getAllByRole("link")).toHaveLength(6);
    expect(analytics.track).not.toHaveBeenCalled();
    fireEvent.click(within(section).getAllByRole("link")[0]!);
    expect(analytics.track).toHaveBeenCalledExactlyOnceWith("affiliate_catalog_source_open");
  });
  it("uses current storefront products and real image files, excludes uncertain perfume combo", () => {
    render(<AffiliateCurrentCombos />);
    fireEvent.click(screen.getByRole("button", { name: "Explorar novos combos" }));
    const eligible = vitrine.filter(
      (p) => p.slug.startsWith("combo-") && p.slug !== "combo-perfume-e-serum",
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Ver todos os " + eligible.length + " combos" }),
    );
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(20);
    expect(new Set(links.map((l) => l.getAttribute("href")))).toEqual(
      new Set(eligible.map((p) => "/produto/" + p.slug)),
    );
    for (const link of links) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
      const src = link.querySelector("img")!.getAttribute("src")!;
      expect(existsSync("public" + src)).toBe(true);
    }
    expect(screen.queryByText(/Combo Perfume Capilar/)).toBeNull();
  });
  it("matches reordered words with punctuation and restores focus after clearing", () => {
    render(<AffiliateCurrentCombos />);
    fireEvent.click(screen.getByRole("button", { name: "Explorar novos combos" }));
    const search = screen.getByRole("searchbox");
    fireEvent.change(search, { target: { value: "LUZ, fio" } });
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
    expect(links.every((link) => link.getAttribute("href")?.includes("fio-de-luz"))).toBe(true);
    expect(links[0]).toHaveTextContent("nova aba");
    const clear = screen.getByRole("button", { name: "Limpar" });
    clear.focus();
    fireEvent.click(clear);
    expect(search).toHaveFocus();
    expect(screen.getAllByRole("link")).toHaveLength(6);
    expect(analytics.track).not.toHaveBeenCalled();
  });

  it("searches all combos without accents, handles empty results and resets search", () => {
    render(<AffiliateCurrentCombos />);
    fireEvent.click(screen.getByRole("button", { name: "Explorar novos combos" }));
    const search = screen.getByRole("searchbox");
    fireEvent.change(search, { target: { value: "SERUM" } });
    const results = screen.getAllByRole("link");
    expect(results.length).toBeGreaterThan(0);
    expect(results.length).toBeLessThan(20);
    fireEvent.change(search, { target: { value: "nada-1234" } });
    expect(screen.getByText(/Nenhum combo encontrado/)).toBeInTheDocument();
    expect(screen.queryAllByRole("link")).toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: "Limpar" }));
    expect(screen.getAllByRole("link")).toHaveLength(6);
    fireEvent.click(screen.getByRole("button", { name: "Recolher combos" }));
    expect(screen.queryAllByRole("link")).toHaveLength(0);
    expect(analytics.track).not.toHaveBeenCalled();
  });

  it("explores every eligible individual product, classifies professional products and resets the tabs", () => {
    render(<AffiliateCurrentCombos />);
    fireEvent.click(screen.getByRole("button", { name: "Explorar novos combos" }));
    const individual = vitrine.filter((p) => !p.slug.startsWith("combo-"));
    fireEvent.click(screen.getByRole("button", { name: /Produtos individuais/ }));
    expect(screen.getAllByRole("link")).toHaveLength(6);
    fireEvent.click(
      screen.getByRole("button", { name: "Ver todos os " + individual.length + " produtos" }),
    );
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(individual.length);
    expect(new Set(links.map((l) => l.getAttribute("href")))).toEqual(
      new Set(individual.map((p) => "/produto/" + p.slug)),
    );
    for (const link of links) {
      expect(existsSync("public" + link.querySelector("img")!.getAttribute("src"))).toBe(true);
      const slug = link.getAttribute("href")!.split("/").pop()!;
      expect(link.textContent?.includes("Uso profissional")).toBe(isProOnly(slug));
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
    fireEvent.change(screen.getByLabelText("Orientação de uso"), {
      target: { value: "professional" },
    });
    expect(screen.getAllByRole("link").map((l) => l.getAttribute("href"))).toEqual(
      individual.filter((p) => isProOnly(p.slug)).map((p) => "/produto/" + p.slug),
    );
    fireEvent.change(screen.getByLabelText("Categoria"), { target: { value: "Química" } });
    expect(
      screen
        .getAllByRole("link")
        .every((l) =>
          individual.some(
            (p) => "/produto/" + p.slug === l.getAttribute("href") && p.categoryLabel === "Química",
          ),
        ),
    ).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Limpar todos os filtros" }));
    expect(screen.getByRole("searchbox")).toHaveFocus();
    fireEvent.click(screen.getByRole("button", { name: /Combos \(/ }));
    expect(screen.getByRole("searchbox")).toHaveValue("");
    expect(screen.getAllByRole("link")).toHaveLength(6);
    expect(analytics.track).not.toHaveBeenCalled();
  });

  it("uses registered packaging photos only on demand, with original image fallback", () => {
    render(<AffiliateCurrentCombos />);
    fireEvent.click(screen.getByRole("button", { name: "Explorar novos combos" }));
    fireEvent.click(screen.getByRole("button", { name: /Produtos individuais/ }));
    const individual = vitrine.filter((p) => !p.slug.startsWith("combo-"));
    fireEvent.click(
      screen.getByRole("button", { name: "Ver todos os " + individual.length + " produtos" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Ver embalagens disponíveis" }));
    const links = screen.getAllByRole("link");
    let tested = false;
    for (const link of links) {
      const slug = link.getAttribute("href")!.split("/").pop()!;
      const img = link.querySelector("img")!;
      const image = (packagingImages as Record<string, string>)[slug];
      expect(img.getAttribute("src")).toBe(
        image && slug !== "kit-monovonix" ? image : "/images/products/" + slug + "-480.webp",
      );
      expect(existsSync("public" + img.getAttribute("src"))).toBe(true);
      if (!tested && image && slug !== "kit-monovonix") {
        fireEvent.error(img);
        expect(img.getAttribute("src")).toBe("/images/products/" + slug + "-480.webp");
        tested = true;
      }
    }
    expect(tested).toBe(true);
    expect(analytics.track).not.toHaveBeenCalled();
  });
  it("offers an alternative catalog mode for a matching query and a single reset", () => {
    render(<AffiliateCurrentCombos />);
    fireEvent.click(screen.getByRole("button", { name: "Explorar novos combos" }));
    const comboSlugs = vitrine.filter((p) => p.slug.startsWith("combo-"));
    const candidate = vitrine.find(
      (p) =>
        !p.slug.startsWith("combo-") &&
        !comboSlugs.some((c) =>
          matchesAffiliateSearch(c.name + " " + c.slug + " " + c.categoryLabel, p.slug),
        ),
    );
    expect(candidate).toBeDefined();
    const search = screen.getByRole("searchbox");
    fireEvent.change(search, { target: { value: candidate!.slug } });
    expect(screen.queryAllByRole("link")).toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: /produtos individuais com esta busca/ }));
    expect(search).toHaveValue(candidate!.slug);
    expect(
      screen
        .getAllByRole("link")
        .some((l) => l.getAttribute("href") === "/produto/" + candidate!.slug),
    ).toBe(true);
    fireEvent.change(screen.getByLabelText("Orientação de uso"), {
      target: { value: "professional" },
    });
    fireEvent.change(search, { target: { value: "semresultadozxqx" } });
    expect(screen.getAllByRole("button", { name: "Limpar todos os filtros" })).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Limpar todos os filtros" }));
    expect(search).toHaveValue("");
    expect(search).toHaveFocus();
    expect(analytics.track).not.toHaveBeenCalled();
  });
});

describe("Local editorial reference shortlist", () => {
  it("keeps official references across catalog modes, without analytics or storage", () => {
    render(<AffiliateCurrentCombos />);
    fireEvent.click(screen.getByRole("button", { name: "Explorar novos combos" }));
    const shortlist = screen.getByTestId("affiliate-reference-shortlist");
    const first = screen.getAllByRole("button", {
      name: /Adicionar .* à lista de referências/,
    })[0]!;
    fireEvent.click(first);
    expect(within(shortlist).getByText("1 de 6 itens")).toBeInTheDocument();
    const firstHref = within(shortlist).getByRole("link").getAttribute("href");
    fireEvent.click(screen.getByRole("button", { name: /Produtos individuais/ }));
    fireEvent.click(
      screen.getAllByRole("button", { name: /Adicionar .* à lista de referências/ })[0]!,
    );
    expect(within(shortlist).getByText("2 de 6 itens")).toBeInTheDocument();
    expect(
      within(shortlist)
        .getAllByRole("link")
        .map((x) => x.getAttribute("href")),
    ).toContain(firstHref);
    fireEvent.click(screen.getByRole("button", { name: "Limpar minha lista" }));
    expect(within(shortlist).getByText("0 de 6 itens")).toBeInTheDocument();
    expect(analytics.track).not.toHaveBeenCalled();
  });

  it("caps the list at six and allows removal without navigating", () => {
    render(<AffiliateCurrentCombos />);
    fireEvent.click(screen.getByRole("button", { name: "Explorar novos combos" }));
    fireEvent.click(screen.getByRole("button", { name: /Ver todos os .* combos/ }));
    for (let i = 0; i < 6; i++)
      fireEvent.click(
        screen.getAllByRole("button", { name: /Adicionar .* à lista de referências/ })[0]!,
      );
    const shortlist = screen.getByTestId("affiliate-reference-shortlist");
    expect(within(shortlist).getByText("6 de 6 itens")).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: /Adicionar .* à lista de referências/ })[0],
    ).toBeDisabled();
    fireEvent.click(within(shortlist).getAllByRole("button", { name: /Remover .* da lista/ })[0]!);
    expect(within(shortlist).getByText("5 de 6 itens")).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: /Adicionar .* à lista de referências/ })[0],
    ).toBeEnabled();
  });

  it("provides a selectable fallback containing only catalog references if clipboard fails", async () => {
    const descriptor = Object.getOwnPropertyDescriptor(navigator, "clipboard");
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: vi.fn().mockRejectedValue(new Error("synthetic clipboard denied")) },
    });
    try {
      render(<AffiliateCurrentCombos />);
      fireEvent.click(screen.getByRole("button", { name: "Explorar novos combos" }));
      fireEvent.click(
        screen.getAllByRole("button", { name: /Adicionar .* à lista de referências/ })[0]!,
      );
      fireEvent.click(screen.getByRole("button", { name: "Copiar lista de referências" }));
      const field = await screen.findByLabelText("Lista de referências para copiar manualmente");
      expect((field as HTMLTextAreaElement).value).toContain("https://vonixhair.com/produto/");
      expect((field as HTMLTextAreaElement).value).toContain("Não é pedido");
      expect(analytics.track).not.toHaveBeenCalled();
    } finally {
      if (descriptor) Object.defineProperty(navigator, "clipboard", descriptor);
      else Reflect.deleteProperty(navigator, "clipboard");
    }
  });

  it("never reports an obsolete clipboard success when the selected references changed", async () => {
    let resolve!: () => void;
    const promise = new Promise<void>((r) => {
      resolve = r;
    });
    const writeText = vi.fn().mockReturnValue(promise);
    const descriptor = Object.getOwnPropertyDescriptor(navigator, "clipboard");
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    try {
      render(<AffiliateCurrentCombos />);
      fireEvent.click(screen.getByRole("button", { name: "Explorar novos combos" }));
      fireEvent.click(
        screen.getAllByRole("button", { name: /Adicionar .* à lista de referências/ })[0]!,
      );
      fireEvent.click(screen.getByRole("button", { name: "Copiar lista de referências" }));
      fireEvent.click(
        screen.getAllByRole("button", { name: /Adicionar .* à lista de referências/ })[0]!,
      );
      expect(screen.getByRole("button", { name: "Copiando lista..." })).toBeDisabled();
      await act(async () => resolve());
      await waitFor(() =>
        expect(screen.getByRole("button", { name: "Copiar lista de referências" })).toBeEnabled(),
      );
      expect(screen.queryByText("Lista copiada com os links oficiais.")).toBeNull();
      expect(writeText).toHaveBeenCalledOnce();
    } finally {
      if (descriptor) Object.defineProperty(navigator, "clipboard", descriptor);
      else Reflect.deleteProperty(navigator, "clipboard");
    }
  });
});
