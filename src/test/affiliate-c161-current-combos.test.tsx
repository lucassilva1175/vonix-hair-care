import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { existsSync } from "node:fs";
import { AffiliateCurrentCombos } from "@/components/affiliate-current-combos";
import { vitrine } from "@/lib/store";
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
});
