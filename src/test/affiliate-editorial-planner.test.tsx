import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AffiliateEditorialPlanner } from "@/components/affiliate-editorial-planner";
import { buildEditorialPlan, editorialProfiles } from "@/lib/affiliate-editorial-plan";
import { AffiliateLandingDiscovery } from "@/components/affiliate-landing";
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
describe("Vonix editorial planner", () => {
  it("builds all 27 combinations with unique days, original editorial ideas and no commercial promises", () => {
    for (const profile of editorialProfiles)
      for (const cadence of [2, 3, 5] as const)
        for (const format of ["video", "foto", "misto"] as const) {
          const plan = buildEditorialPlan(profile.id, cadence, format);
          expect(plan.entries).toHaveLength(cadence);
          expect(new Set(plan.entries.map((x) => x.day)).size).toBe(cadence);
          expect(new Set(plan.entries.map((x) => x.title)).size).toBe(cadence);
          expect(plan.entries.every((x) => x.task && x.verify && x.opening)).toBe(true);
          expect(plan.text).toContain("https://vonixhair.com/loja");
          expect(plan.text).toContain("não é campanha contratada");
          if (format === "video")
            expect(plan.entries.every((x) => x.format === "Vídeo curto")).toBe(true);
          if (format === "foto")
            expect(plan.entries.every((x) => x.format === "Foto ou carrossel")).toBe(true);
        }
  });
  it("tracks preparation locally, resets progress on plan change and offers official references", () => {
    const set = vi.spyOn(Storage.prototype, "setItem");
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    render(<AffiliateEditorialPlanner recruitmentOpen />);
    expect(screen.getAllByRole("checkbox")).toHaveLength(3);
    fireEvent.click(screen.getAllByRole("checkbox")[0]!);
    expect(screen.getByText("1 de 3 ideias preparadas")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Meu estilo"), { target: { value: "ugc" } });
    fireEvent.change(screen.getByLabelText("Ideias por semana"), { target: { value: "5" } });
    fireEvent.change(screen.getByLabelText("Formato preferido"), { target: { value: "foto" } });
    expect(screen.getAllByRole("checkbox")).toHaveLength(5);
    expect(screen.getByText("0 de 5 ideias preparadas")).toBeInTheDocument();
    expect(screen.getByText("Composição visual")).toBeInTheDocument();
    expect(screen.getAllByText("Foto ou carrossel")).toHaveLength(5);
    fireEvent.click(screen.getAllByRole("checkbox")[1]!);
    fireEvent.click(screen.getByRole("button", { name: "Limpar marcações" }));
    expect(screen.getByText("0 de 5 ideias preparadas")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Consultar produtos oficiais" })).toHaveAttribute(
      "href",
      "#vitrine-afiliadas",
    );
    expect(screen.getByRole("link", { name: "Apresentar meu perfil à Vonix" })).toHaveAttribute(
      "href",
      "#inscricao",
    );
    expect(fetcher).not.toHaveBeenCalled();
    expect(set).not.toHaveBeenCalled();
  });
  it("exports the current plan and preparation checklist as a local text file", async () => {
    const create = vi.fn((_blob: Blob) => "blob:local-plan");
    const revoke = vi.fn();
    vi.stubGlobal(
      "URL",
      class extends URL {
        static override createObjectURL = create;
        static override revokeObjectURL = revoke;
      },
    );
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      expect(this.download).toBe("meu-plano-editorial-vonix.txt");
    });
    render(<AffiliateEditorialPlanner referenceSlugs={["kit-cachos"]} />);
    fireEvent.click(screen.getAllByRole("checkbox")[0]!);
    fireEvent.click(screen.getByRole("button", { name: "Baixar plano e checklist" }));
    expect(click).toHaveBeenCalledOnce();
    expect(create).toHaveBeenCalledOnce();
    const blob = create.mock.calls[0]![0];
    const content = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsText(blob);
    });
    expect(content).toContain("MINHA LISTA DE PREPARAÇÃO");
    expect(content).toContain("[x] ");
    expect(content).toContain("[ ] ");
    expect(content).toContain("PLANO EDITORIAL PESSOAL");
    expect(document.querySelector('a[download="meu-plano-editorial-vonix.txt"]')).toBeNull();
  });
  it("keeps the copy option available when local export is unavailable", () => {
    vi.stubGlobal(
      "URL",
      class extends URL {
        static override createObjectURL(): never {
          throw new Error("not available");
        }
      },
    );
    render(<AffiliateEditorialPlanner />);
    fireEvent.click(screen.getByRole("button", { name: "Baixar plano e checklist" }));
    expect(screen.getByText(/Não foi possível iniciar o download/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copiar meu plano editorial" })).toBeEnabled();
  });
  it("offers a manual copy fallback without a browser clipboard", async () => {
    vi.stubGlobal("navigator", { ...navigator, clipboard: undefined });
    render(<AffiliateEditorialPlanner />);
    fireEvent.click(screen.getByRole("button", { name: "Copiar meu plano editorial" }));
    const field = await screen.findByLabelText("Plano editorial para copiar manualmente");
    expect(field).toHaveAttribute("readonly");
    expect((field as HTMLTextAreaElement).value).toContain("PLANO EDITORIAL PESSOAL");
    expect((field as HTMLTextAreaElement).value).toContain("não é campanha contratada");
  });
  it("does not report an outdated copy as successful after plan changes", async () => {
    let resolve!: () => void;
    const write = vi.fn(() => new Promise<void>((r) => (resolve = r)));
    vi.stubGlobal("navigator", { ...navigator, clipboard: { writeText: write } });
    render(<AffiliateEditorialPlanner />);
    fireEvent.click(screen.getByRole("button", { name: "Copiar meu plano editorial" }));
    fireEvent.change(screen.getByLabelText("Meu estilo"), { target: { value: "informacao" } });
    expect(screen.getByRole("button", { name: "Copiando plano..." })).toBeDisabled();
    await act(async () => resolve());
    expect(screen.queryByText(/Plano copiado/)).toBeNull();
    expect(screen.getByRole("button", { name: "Copiar meu plano editorial" })).toBeEnabled();
    expect(write).toHaveBeenCalledOnce();
  });
  it("renders only in the source-linked portal and keeps previews separate", () => {
    const preview = vi.fn();
    const { rerender } = render(
      <AffiliateLandingDiscovery recruitmentStatus="closed" onSafePreview={preview} />,
    );
    expect(screen.queryByTestId("affiliate-editorial-planner")).toBeNull();
    rerender(
      <AffiliateLandingDiscovery recruitmentStatus="closed" sourceLinked onSafePreview={preview} />,
    );
    const plan = screen.getByTestId("affiliate-editorial-planner");
    fireEvent.click(within(plan).getByText("Conhecer a prévia sem envio"));
    expect(preview).toHaveBeenCalledOnce();
  });
});
