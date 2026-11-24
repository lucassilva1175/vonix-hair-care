import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AffiliateCreatorPaths } from "@/components/affiliate-creator-paths";

afterEach(cleanup);

describe("C80 Vonix: três estilos de conteúdo sem prometer vínculo ou ganhos", () => {
  it("apresenta três caminhos com os próprios produtos da Vonix, não pessoas inventadas", () => {
    const { container } = render(<AffiliateCreatorPaths />);
    const section = screen.getByTestId("affiliate-c54-creator-paths");
    const tabs = within(section).getAllByRole("tab");
    expect(tabs).toHaveLength(3);
    expect(tabs.map((tab) => tab.textContent)).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Compartilho minha rotina"),
        expect.stringContaining("Exploro fotos e vídeos"),
        expect.stringContaining("Compartilho dicas de cabelo"),
      ]),
    );
    expect(section).toHaveTextContent("Três jeitos de criar.");
    expect(section).toHaveTextContent("pode combinar todos eles");
    expect(section).toHaveTextContent("não representam participantes");
    fireEvent.click(tabs[2]!);
    const panel = within(section).getByRole("tabpanel");
    expect(panel).toHaveAttribute("aria-labelledby", tabs[2]!.id);
    expect(within(panel).getByRole("img")).toHaveAttribute(
      "src",
      "/images/categorias/hidratacao.jpg",
    );
    expect(panel).toHaveTextContent("sem prometer resultados");
    expect(panel).toHaveTextContent("informação do fabricante");
    expect(container.querySelectorAll("form,input,textarea,video,audio")).toHaveLength(0);
    expect(within(panel).getByRole("link", { name: /Abrir prévia segura/i })).toHaveAttribute(
      "href",
      "#inscricao",
    );
  });

  it("mantém roving tabindex correto em Home, End e setas reversas com 3 opções", () => {
    render(<AffiliateCreatorPaths />);
    const tabs = screen.getAllByRole("tab");
    const [routine, ugc, information] = tabs;
    expect(tabs.map((tab) => tab.getAttribute("tabindex"))).toEqual(["0", "-1", "-1"]);
    fireEvent.keyDown(routine!, { key: "ArrowLeft" });
    expect(information).toHaveFocus();
    expect(information).toHaveAttribute("aria-selected", "true");
    expect(tabs.map((tab) => tab.getAttribute("tabindex"))).toEqual(["-1", "-1", "0"]);
    fireEvent.keyDown(information!, { key: "ArrowLeft" });
    expect(ugc).toHaveFocus();
    fireEvent.keyDown(ugc!, { key: "Home" });
    expect(routine).toHaveFocus();
    fireEvent.keyDown(routine!, { key: "End" });
    expect(information).toHaveFocus();
    fireEvent.keyDown(information!, { key: "ArrowRight" });
    expect(routine).toHaveFocus();
    expect(screen.getByRole("tabpanel")).toHaveAttribute("aria-labelledby", routine!.id);
  });

  it("a troca é local: não envia candidaturas nem produz falsos sinais de sucesso", () => {
    const fetchSpy = vi.fn().mockRejectedValue(new Error("Network disabled in C80 test"));
    vi.stubGlobal("fetch", fetchSpy);
    try {
      render(<AffiliateCreatorPaths />);
      const tabs = screen.getAllByRole("tab");
      for (const tab of tabs) fireEvent.click(tab);
      const section = screen.getByTestId("affiliate-c54-creator-paths");
      expect(section.textContent).not.toMatch(
        /15% do site|21% tiktok|cupom garantido|produtos gr[aá]tis|aprovada automaticamente|renda certa/i,
      );
      expect(fetchSpy).not.toHaveBeenCalled();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
