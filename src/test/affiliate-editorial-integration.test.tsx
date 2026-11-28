import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AffiliateLandingDiscovery } from "@/components/affiliate-landing";
import {
  appendEditorialReferences,
  resolveEditorialReferences,
} from "@/lib/affiliate-editorial-references";
import { isProOnly, vitrine } from "@/lib/store";
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("Integrated Vonix editorial journey", () => {
  it("validates, deduplicates and caps only real catalogue references", () => {
    const pro = vitrine.find((p) => isProOnly(p.slug) && p.slug !== "combo-perfume-e-serum")!;
    const slugs = [
      pro.slug,
      pro.slug,
      "combo-perfume-e-serum",
      "https://untrusted.invalid",
      ...vitrine.map((p) => p.slug),
    ];
    const refs = resolveEditorialReferences(slugs);
    expect(refs).toHaveLength(6);
    expect(new Set(refs.map((p) => p.slug)).size).toBe(6);
    expect(refs[0]?.professional).toBe(true);
    expect(refs.every((p) => p.href === "/produto/" + p.slug)).toBe(true);
    const text = appendEditorialReferences("PLANO", slugs);
    expect(text).toContain("MINHAS REFERÊNCIAS DO CATÁLOGO OFICIAL");
    expect(text).toContain("uso exclusivamente profissional");
    expect(text).not.toContain("untrusted.invalid");
    expect(text).not.toContain("combo-perfume-e-serum");
    expect(appendEditorialReferences("PLANO", ["invalid"])).toBe("PLANO");
  });
  it("shares catalog selection with the planner, preserves completed ideas, and exports official links", async () => {
    vi.stubGlobal("navigator", { ...navigator, clipboard: undefined });
    render(<AffiliateLandingDiscovery sourceLinked recruitmentStatus="open" />);
    const catalog = screen.getByTestId("affiliate-c161-combos");
    const planner = screen.getByTestId("affiliate-editorial-planner");
    fireEvent.click(within(planner).getAllByRole("checkbox")[0]!);
    fireEvent.click(within(catalog).getByRole("button", { name: "Explorar novos combos" }));
    fireEvent.click(
      within(catalog).getAllByRole("button", { name: /Adicionar .* à lista de referências/ })[0]!,
    );
    const selected = within(catalog).getByRole("list", { name: "Produtos selecionados" });
    const href = within(selected).getByRole("link").getAttribute("href");
    const refs = within(planner).getByRole("complementary", {
      name: "Referências do seu planejamento",
    });
    expect(
      within(refs).getByRole("link", { name: within(selected).getByRole("link").textContent! }),
    ).toHaveAttribute("href", href);
    expect(within(planner).getByText("1 de 3 ideias preparadas")).toBeInTheDocument();
    expect(
      within(catalog).getByRole("link", { name: "Usar referências no planejamento" }),
    ).toHaveAttribute("href", "#planejamento-criativo");
    fireEvent.click(within(planner).getByRole("button", { name: "Copiar meu plano editorial" }));
    const manual = await within(planner).findByLabelText("Plano editorial para copiar manualmente");
    expect((manual as HTMLTextAreaElement).value).toContain("https://vonixhair.com" + href);
    fireEvent.click(within(catalog).getByRole("button", { name: "Limpar minha lista" }));
    expect(
      within(planner).queryByRole("complementary", { name: "Referências do seu planejamento" }),
    ).toBeNull();
    expect(within(planner).queryByLabelText("Plano editorial para copiar manualmente")).toBeNull();
    expect(within(planner).getByText("1 de 3 ideias preparadas")).toBeInTheDocument();
  });
  it("connects video inspiration, the current catalog and the planner with a shared bounded list", () => {
    render(<AffiliateLandingDiscovery sourceLinked recruitmentStatus="open" />);
    const videos = screen.getByTestId("affiliate-c156-source-videos");
    const catalog = screen.getByTestId("affiliate-c161-combos");
    const planner = screen.getByTestId("affiliate-editorial-planner");
    const buttons = within(videos).getAllByRole("button", { name: /Adicionar .* ao planejamento/ });
    fireEvent.click(buttons[0]!);
    expect(buttons[0]).toHaveAttribute("aria-pressed", "true");
    const refs = within(planner).getByRole("complementary", {
      name: "Referências do seu planejamento",
    });
    expect(within(refs).getAllByRole("link").length).toBeGreaterThan(0);
    expect(within(videos).getByRole("link", { name: "Abrir meu planejamento" })).toHaveAttribute(
      "href",
      "#planejamento-criativo",
    );
    fireEvent.click(within(catalog).getByRole("button", { name: "Explorar novos combos" }));
    const list = within(catalog).getByRole("list", { name: "Produtos selecionados" });
    expect(within(list).getAllByRole("link")).toHaveLength(1);
    fireEvent.click(within(refs).getByRole("button", { name: /Remover .* das referências/ }));
    expect(buttons[0]).toHaveAttribute("aria-pressed", "false");
    expect(
      within(planner).queryByRole("complementary", { name: "Referências do seu planejamento" }),
    ).toBeNull();
    expect(within(catalog).queryByRole("list", { name: "Produtos selecionados" })).toBeNull();
  });
  it("invalidates a pending clipboard result when the catalog selection changes", async () => {
    let finish!: () => void;
    const write = vi.fn(() => new Promise<void>((r) => (finish = r)));
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText: write } });
    render(<AffiliateLandingDiscovery sourceLinked recruitmentStatus="open" />);
    const planner = screen.getByTestId("affiliate-editorial-planner");
    const catalog = screen.getByTestId("affiliate-c161-combos");
    fireEvent.click(within(planner).getByRole("button", { name: "Copiar meu plano editorial" }));
    fireEvent.click(within(catalog).getByRole("button", { name: "Explorar novos combos" }));
    fireEvent.click(
      within(catalog).getAllByRole("button", { name: /Adicionar .* à lista de referências/ })[0]!,
    );
    await act(async () => finish());
    expect(within(planner).queryByText(/Plano copiado/)).toBeNull();
    expect(
      within(planner).getByRole("button", { name: "Copiar meu plano editorial" }),
    ).toBeEnabled();
  });
});
