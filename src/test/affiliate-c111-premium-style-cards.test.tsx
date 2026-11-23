import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AffiliateCreatorSpotlight } from "@/components/affiliate-creator-spotlight";
import { affiliateCreatorPaths } from "@/data/affiliate-creator-paths";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("C111 — vitrine visual de estilos Vonix sem afiliação fictícia", () => {
  it("exibe três cartões fotográficos com material da marca e seleção acessível", () => {
    const { container } = render(<AffiliateCreatorSpotlight />);
    const photos = screen.getAllByTestId("affiliate-c111-style-photo");
    const cards = screen.getAllByTestId("affiliate-c100-path-button");
    expect(cards).toHaveLength(3);
    expect(photos.map((img) => img.getAttribute("src"))).toEqual(
      affiliateCreatorPaths.map((path) => path.image),
    );
    for (const [index, photo] of photos.entries()) {
      expect(photo).toHaveAttribute("alt", affiliateCreatorPaths[index]!.alt);
      expect(photo).toHaveAttribute("loading", "lazy");
      expect(photo).toHaveAttribute("decoding", "async");
    }
    for (const card of cards) {
      expect(card).toHaveAttribute("type", "button");
      expect(card).toHaveAttribute("aria-pressed", "false");
      expect(card).not.toHaveAttribute("aria-controls");
      expect(card).toHaveClass("min-h-36", "sm:min-h-64");
    }
    expect(container).toHaveTextContent(/não mostram afiliadas/i);
    expect(screen.queryByTestId("affiliate-c100-selected-path")).not.toBeInTheDocument();
  });

  it("revela três ideias de conteúdo do estilo escolhido, sem perder foco nem CTA", () => {
    render(<AffiliateCreatorSpotlight />);
    const buttons = screen.getAllByTestId("affiliate-c100-path-button");
    for (let index = 0; index < buttons.length; index += 1) {
      buttons[index]!.focus();
      fireEvent.click(buttons[index]!);
      const panel = screen.getByTestId("affiliate-c100-selected-path");
      expect(buttons[index]).toHaveFocus();
      expect(buttons[index]).toHaveAttribute("aria-pressed", "true");
      expect(buttons[index]).toHaveAttribute("aria-controls", "affiliate-c100-selected-path");
      const prompts = affiliateCreatorPaths[index]!.prompts;
      for (const prompt of prompts) expect(panel).toHaveTextContent(prompt);
      expect(within(panel).getByRole("link", { name: /Conhecer o formulário/ })).toHaveAttribute(
        "href",
        "#inscricao",
      );
      expect(
        buttons.filter((button) => button.getAttribute("aria-pressed") === "true"),
      ).toHaveLength(1);
    }
    fireEvent.click(buttons[2]!);
    expect(screen.queryByTestId("affiliate-c100-selected-path")).not.toBeInTheDocument();
    expect(buttons[2]).toHaveAttribute("aria-pressed", "false");
  });

  it("mantém fotos recolhidas inicialmente no mobile e reinicia a seleção ao recolher", () => {
    render(<AffiliateCreatorSpotlight />);
    const toggle = screen.getByTestId("affiliate-c108-styles-toggle");
    const options = screen.getByRole("group", { name: "Escolha seu estilo de conteúdo" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(options).toHaveClass("hidden", "sm:grid", "sm:grid-cols-3");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(options).toHaveClass("grid");
    fireEvent.click(screen.getAllByTestId("affiliate-c100-path-button")[1]!);
    expect(screen.getByTestId("affiliate-c100-selected-path")).toBeInTheDocument();
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(options).toHaveClass("hidden");
    expect(screen.queryByTestId("affiliate-c100-selected-path")).not.toBeInTheDocument();
  });

  it("preserva SSR, disclaimers e não gera inscrição, formulário ou rede", () => {
    const network = vi.spyOn(globalThis, "fetch");
    const { container } = render(<AffiliateCreatorSpotlight />);
    expect(container.querySelectorAll("form,input,video,iframe,[autoplay]")).toHaveLength(0);
    expect(network).not.toHaveBeenCalled();
    expect(screen.getByRole("link", { name: /Ir direto à inscrição/ })).toHaveAttribute(
      "href",
      "#inscricao",
    );
    expect(container).toHaveTextContent("Nenhum estilo garante aprovação");
    const ssr = renderToStaticMarkup(<AffiliateCreatorSpotlight />);
    expect((ssr.match(/data-testid="affiliate-c111-style-photo"/g) || []).length).toBe(3);
    expect(ssr).not.toContain('data-testid="affiliate-c100-selected-path"');
    expect(ssr).toContain("Fotografias editoriais de categorias");
  });
});
