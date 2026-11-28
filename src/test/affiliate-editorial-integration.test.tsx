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

describe("Local project restoration across the commercial journey", () => {
  function file(raw: string, name = "meu-projeto-vonix.json") {
    const f = new File([raw], name, { type: "application/json" });
    Object.defineProperty(f, "text", { value: () => Promise.resolve(raw) });
    return f;
  }
  const project = {
    version: 1,
    profile: "ugc",
    cadence: 2,
    format: "video",
    done: ["Sexta"],
    references: ["botox-vonix"],
  };
  it("previews an imported project before applying it to planner, video and catalog", async () => {
    render(<AffiliateLandingDiscovery sourceLinked recruitmentStatus="open" />);
    const planner = screen.getByTestId("affiliate-editorial-planner");
    const input = within(planner).getByLabelText("Abrir arquivo de projeto (.json)");
    fireEvent.change(input, {
      target: {
        files: [
          file(
            JSON.stringify({ ...project, references: [...project.references, "retired-product"] }),
          ),
        ],
      },
    });
    const group = await within(planner).findByRole("group", {
      name: "Confirmar restauração do planejamento",
    });
    expect(within(group).getByText(/1 referência\(s\) não estão mais/)).toBeInTheDocument();
    expect(within(planner).getByLabelText("Ideias por semana")).toHaveValue("3");
    expect(within(planner).getByText("0 de 3 ideias preparadas")).toBeInTheDocument();
    fireEvent.click(within(group).getByRole("button", { name: "Restaurar projeto" }));
    expect(within(planner).getByLabelText("Meu estilo")).toHaveValue("ugc");
    expect(within(planner).getByLabelText("Ideias por semana")).toHaveValue("2");
    expect(within(planner).getByLabelText("Formato preferido")).toHaveValue("video");
    expect(within(planner).getByText("1 de 2 ideias preparadas")).toBeInTheDocument();
    const videos = screen.getByTestId("affiliate-c156-source-videos");
    expect(
      within(videos).getAllByRole("button", { name: /Remover .* do planejamento/ }).length,
    ).toBe(1);
    const catalog = screen.getByTestId("affiliate-c161-combos");
    fireEvent.click(within(catalog).getByRole("button", { name: "Explorar novos combos" }));
    expect(within(catalog).getByRole("list", { name: "Produtos selecionados" })).toHaveTextContent(
      /Botox/i,
    );
  });
  it("keeps an existing plan after malformed import or explicit cancellation", async () => {
    render(<AffiliateLandingDiscovery sourceLinked recruitmentStatus="open" />);
    const planner = screen.getByTestId("affiliate-editorial-planner");
    const input = within(planner).getByLabelText("Abrir arquivo de projeto (.json)");
    fireEvent.click(within(planner).getAllByRole("checkbox")[0]!);
    fireEvent.change(input, {
      target: { files: [file(JSON.stringify({ ...project, trackingCode: "SYNTHETIC_PRIVATE" }))] },
    });
    expect(
      await within(planner).findByText(/Arquivo inválido ou incompatível/),
    ).toBeInTheDocument();
    expect(within(planner).getByText("1 de 3 ideias preparadas")).toBeInTheDocument();
    fireEvent.change(input, { target: { files: [file(JSON.stringify(project))] } });
    await within(planner).findByRole("group", { name: "Confirmar restauração do planejamento" });
    fireEvent.click(within(planner).getByRole("button", { name: "Cancelar restauração" }));
    expect(within(planner).getByText("1 de 3 ideias preparadas")).toBeInTheDocument();
    expect(within(planner).queryByText(/SYNTHETIC_PRIVATE/)).toBeNull();
  });
  it("ignores a late file read after cancellation or another selection", async () => {
    render(<AffiliateLandingDiscovery sourceLinked recruitmentStatus="open" />);
    const planner = screen.getByTestId("affiliate-editorial-planner");
    const input = within(planner).getByLabelText("Abrir arquivo de projeto (.json)");
    let finish!: (value: string) => void;
    const slow = new File(["{}"], "slow.json");
    Object.defineProperty(slow, "text", {
      value: () =>
        new Promise<string>((r) => {
          finish = r;
        }),
    });
    fireEvent.change(input, { target: { files: [slow] } });
    fireEvent.click(within(planner).getByRole("button", { name: "Cancelar leitura" }));
    await act(async () => finish(JSON.stringify(project)));
    expect(
      within(planner).queryByRole("group", { name: "Confirmar restauração do planejamento" }),
    ).toBeNull();
    expect(within(planner).getByText("0 de 3 ideias preparadas")).toBeInTheDocument();
  });
  it("exports an allowlisted editable project through manual fallback without storing data", () => {
    const storage = vi.spyOn(Storage.prototype, "setItem");
    const noDownload = vi.spyOn(URL, "createObjectURL").mockImplementation(() => {
      throw Error("blocked");
    });
    render(<AffiliateLandingDiscovery sourceLinked recruitmentStatus="open" />);
    const planner = screen.getByTestId("affiliate-editorial-planner");
    fireEvent.click(within(planner).getAllByRole("checkbox")[0]!);
    fireEvent.click(within(planner).getByRole("button", { name: "Guardar arquivo do projeto" }));
    const raw = (within(planner).getByLabelText("Conteúdo JSON do projeto") as HTMLTextAreaElement)
      .value;
    expect(JSON.parse(raw)).toEqual({
      version: 1,
      profile: "rotina",
      cadence: 3,
      format: "misto",
      done: ["Segunda"],
      references: [],
    });
    expect(storage).not.toHaveBeenCalled();
    noDownload.mockRestore();
  });
});
