import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AffiliateCreatorSpotlight } from "@/components/affiliate-creator-spotlight";
import { affiliateCreatorPaths } from "@/data/affiliate-creator-paths";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("C100 — descoberta criativa compacta antes da inscrição", () => {
  it("reusa as três trilhas oficiais sem formulário, cadastro ou falsa prova social", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const { container } = render(<AffiliateCreatorSpotlight />);
    const region = screen.getByTestId("affiliate-c100-creator-spotlight");
    const options = within(region).getAllByTestId("affiliate-c100-path-button");
    expect(options).toHaveLength(3);
    expect(affiliateCreatorPaths).toHaveLength(3);
    expect(options[0]).toHaveAttribute("aria-pressed", "false");
    expect(screen.queryByTestId("affiliate-c100-selected-path")).not.toBeInTheDocument();
    expect(region).toHaveTextContent("Nenhum estilo garante aprovação");
    expect(container.querySelectorAll("form, input, video, [autoplay]")).toHaveLength(0);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("troca ideias e foto editorial por ação explícita, sem deixar seleção múltipla", () => {
    render(<AffiliateCreatorSpotlight />);
    const buttons = screen.getAllByTestId("affiliate-c100-path-button");
    expect(screen.queryByTestId("affiliate-c100-selected-path")).not.toBeInTheDocument();
    fireEvent.click(buttons[0]!);
    const panel = screen.getByTestId("affiliate-c100-selected-path");
    expect(within(panel).getByRole("img")).toHaveAttribute("src", affiliateCreatorPaths[0].image);
    buttons[1]!.focus();
    fireEvent.click(buttons[1]!);
    expect(buttons[1]).toHaveFocus();
    expect(buttons[1]).toHaveAttribute("aria-pressed", "true");
    expect(buttons[0]).toHaveAttribute("aria-pressed", "false");
    expect(panel).toHaveTextContent(affiliateCreatorPaths[1].title);
    expect(within(panel).getByRole("img")).toHaveAttribute("src", affiliateCreatorPaths[1].image);
    fireEvent.click(buttons[2]!);
    expect(buttons.filter((button) => button.getAttribute("aria-pressed") === "true")).toHaveLength(
      1,
    );
    expect(panel).toHaveTextContent(affiliateCreatorPaths[2].prompts[0]);
    fireEvent.click(buttons[2]!);
    expect(screen.queryByTestId("affiliate-c100-selected-path")).not.toBeInTheDocument();
  });

  it("mantém CTA para o formulário existente e descoberta detalhada sem dados ou rede", () => {
    const { container } = render(<AffiliateCreatorSpotlight />);
    expect(Array.from(container.querySelectorAll("a")).map((a) => a.getAttribute("href"))).toEqual([
      "#inscricao",
    ]);
    fireEvent.click(screen.getAllByTestId("affiliate-c100-path-button")[1]!);
    const hrefs = Array.from(container.querySelectorAll("a")).map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual([
      "#inscricao",
      "#inscricao",
      "#perfis",
      "/produto/mascara-reparacao-nutri-repair",
    ]);
    expect(
      screen.getByRole("group", { name: "Escolha seu estilo de conteúdo" }),
    ).toBeInTheDocument();
    expect(
      screen
        .getAllByTestId("affiliate-c100-path-button")
        .every((button) => button.getAttribute("type") === "button"),
    ).toBe(true);
    expect(container.querySelectorAll("[aria-live='polite']")).toHaveLength(1);
  });

  it("SSR estável e exploração complementar após o formulário único na rota", () => {
    const markup = renderToStaticMarkup(<AffiliateCreatorSpotlight />);
    expect(markup).toContain("affiliate-c100-creator-spotlight");
    expect(markup).toContain("Rotina e comunidade");
    expect(markup).not.toContain("affiliate-c100-selected-path");
    const source = readFileSync("src/routes/seja-afiliada.tsx", "utf8");
    const step = source.indexOf("<AffiliateApplicationStepsPreview />");
    const spotlight = source.indexOf("<AffiliateCreatorSpotlight />");
    const form = source.indexOf("<AffiliateSimpleForm");
    expect(step).toBeGreaterThan(-1);
    expect(spotlight).toBeGreaterThan(step);
    expect(form).toBeLessThan(step);
  });
});
