import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { AffiliateOfficialEvidenceLinks } from "@/components/affiliate-official-evidence-links";

const analytics = vi.hoisted(() => ({ track: vi.fn() }));
vi.mock("@/lib/analytics", () => ({ track: analytics.track }));
afterEach(() => {
  cleanup();
  analytics.track.mockClear();
});

describe("C164 official media discovery", () => {
  it("searches the complete catalog without exposing creator media or tracking search terms", () => {
    render(<AffiliateOfficialEvidenceLinks variant="videos" />);
    const section = screen.getByTestId("affiliate-c156-source-videos");
    const search = within(section).getByRole("searchbox");
    expect(within(section).getAllByRole("link")).toHaveLength(6);
    fireEvent.change(search, { target: { value: "MATIZADOR" } });
    expect(within(section).getAllByRole("link").length).toBeGreaterThan(0);
    expect(
      within(section)
        .getAllByRole("link")
        .every((link) => /matizador/.test(link.getAttribute("href") || "")),
    ).toBe(true);
    fireEvent.change(search, { target: { value: "nao-existe-1234" } });
    expect(within(section).queryAllByRole("link")).toHaveLength(0);
    expect(section).toHaveTextContent("Nenhuma inspiração encontrada");
    fireEvent.click(within(section).getByRole("button", { name: "Limpar filtros do acervo" }));
    expect(search).toHaveValue("");
    expect(within(section).getAllByRole("link")).toHaveLength(6);
    expect(section.innerHTML).not.toMatch(/<video|\/depoimentos\/|\/provas\//);
    expect(analytics.track).not.toHaveBeenCalled();
  });
  it("matches reordered words and punctuation and returns keyboard focus to search", () => {
    render(<AffiliateOfficialEvidenceLinks variant="videos" />);
    const section = screen.getByTestId("affiliate-c156-source-videos");
    const search = within(section).getByRole("searchbox");
    fireEvent.change(search, { target: { value: "LUZ, fio" } });
    const links = within(section).getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
    expect(links.every((link) => link.getAttribute("href")?.includes("fio-de-luz"))).toBe(true);
    const clear = within(section).getByRole("button", { name: "Limpar filtros do acervo" });
    clear.focus();
    fireEvent.click(clear);
    expect(search).toHaveFocus();
    expect(within(section).getAllByRole("link")).toHaveLength(6);
    expect(analytics.track).not.toHaveBeenCalled();
  });

  it("combines filters and preserves the expanded state after reset", () => {
    render(<AffiliateOfficialEvidenceLinks variant="videos" />);
    const section = screen.getByTestId("affiliate-c156-source-videos");
    fireEvent.click(within(section).getByRole("button", { name: /Explorar mais/ }));
    const category = within(section).getByRole("combobox");
    const options = within(category).getAllByRole("option");
    expect(options.length).toBeGreaterThan(1);
    const value = (options[1] as HTMLOptionElement).value;
    fireEvent.change(category, { target: { value } });
    expect(within(section).getAllByRole("link").length).toBeLessThan(14);
    fireEvent.change(within(section).getByRole("searchbox"), { target: { value: "no-match-123" } });
    expect(within(section).queryAllByRole("link")).toHaveLength(0);
    fireEvent.click(within(section).getByRole("button", { name: "Limpar filtros do acervo" }));
    expect(category).toHaveValue("");
    expect(within(section).getAllByRole("link")).toHaveLength(14);
  });
  it("keeps review variants free of the catalog filter", () => {
    render(<AffiliateOfficialEvidenceLinks variant="reviews" />);
    expect(screen.queryByRole("searchbox")).toBeNull();
    expect(screen.getByText(/4 avaliações publicadas/)).toBeInTheDocument();
  });
});
