import { cleanup, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AffiliateEditorialHero } from "@/components/affiliate-editorial-hero";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("C105 — CTA mais imediato sem omitir contexto da candidatura", () => {
  it("reordena somente a hierarquia visual mobile e restaura ordem desktop", () => {
    const { container } = render(<AffiliateEditorialHero recruitmentStatus="closed" />);
    const hero = screen.getByTestId("vonix-affiliate-hero");
    const editorial = within(hero).getByTestId("affiliate-c89-hair-editorial");
    const column = editorial.parentElement;
    expect(column).toHaveClass("flex", "flex-col");
    expect(editorial).toHaveClass("order-1", "min-h-[19rem]", "sm:min-h-[23rem]");
    const intro = within(hero).getByText(
      /Sua criatividade e o universo dos cabelos podem se encontrar/i,
    );
    const status = within(hero).getByTestId("affiliate-c94-intake-status");
    const action = within(hero).getByRole("link", { name: "Conhecer a inscrição" });
    expect(intro).toHaveClass("order-4", "lg:order-2");
    expect(status).toHaveClass("order-2", "lg:order-3", "self-start");
    expect(action.closest("div")).toHaveClass("order-3", "lg:order-4");
    expect(
      container.querySelectorAll('[data-testid="vonix-affiliate-hero"] a[href="#inscricao"]'),
    ).toHaveLength(1);
    expect(within(hero).getByRole("link", { name: /Conhecer as condições/ })).toHaveAttribute(
      "href",
      "#ganhos",
    );
    expect(within(hero).getByRole("heading", { level: 1 })).toHaveTextContent(
      "Seu jeito de criar.",
    );
  });

  it.each([
    ["open", "Candidaturas abertas para análise", "Quero ser afiliada Vonix"],
    [
      "closed",
      "Conheça o formulário enquanto as inscrições estão em preparação",
      "Conhecer a inscrição",
    ],
    ["limited", "Inscrição temporariamente limitada nesta conexão", "Conhecer a inscrição"],
    [
      "unavailable",
      "Não foi possível consultar a disponibilidade das inscrições",
      "Conhecer a inscrição",
    ],
    ["loading", "Consultando disponibilidade de inscrição", "Conhecer a inscrição"],
  ] as const)(
    "status %s permanece fiel à consulta sem CTA de envio indevido",
    (status, copy, action) => {
      const network = vi.spyOn(globalThis, "fetch");
      const { container } = render(<AffiliateEditorialHero recruitmentStatus={status} />);
      const hero = screen.getByTestId("vonix-affiliate-hero");
      expect(within(hero).getByTestId("affiliate-c94-intake-status")).toHaveTextContent(copy);
      expect(within(hero).getByRole("link", { name: action })).toHaveAttribute(
        "href",
        "#inscricao",
      );
      expect(hero).toHaveTextContent("8% sobre vendas após aprovação");
      expect(hero).toHaveTextContent("A candidatura não garante aprovação");
      expect(hero).toHaveTextContent("nem compra de produtos para se candidatar");
      expect(network).not.toHaveBeenCalled();
      expect(container.querySelectorAll("form, video, iframe, [autoplay]")).toHaveLength(0);
    },
  );

  it("conserva todos os produtos do catálogo sem atribuir imagens a criadoras", () => {
    render(<AffiliateEditorialHero recruitmentStatus="closed" />);
    const hero = screen.getByTestId("vonix-affiliate-hero");
    expect(within(hero).getByTestId("affiliate-c94-editorial-photo")).toHaveAttribute(
      "src",
      "/images/categorias/cachos.jpg",
    );
    expect(within(hero).getAllByTestId("affiliate-c61-catalog-link")).toHaveLength(3);
    expect(hero).toHaveTextContent("Não retrata afiliada nem comprova parceria.");
    expect(hero).not.toHaveTextContent(
      /cupom garantido|renda garantida|depoimentos de afiliadas reais/i,
    );
  });

  it("SSR público conserva a fotografia editorial, status, H1 e CTA sem duplicações", () => {
    const html = renderToStaticMarkup(<AffiliateEditorialHero recruitmentStatus="closed" />);
    const root = document.createElement("div");
    root.innerHTML = html;
    expect(root.querySelectorAll("#vonix-affiliate-title")).toHaveLength(1);
    expect(root.querySelectorAll('[data-testid="affiliate-c94-intake-status"]')).toHaveLength(1);
    expect(root.querySelectorAll('a[href="#inscricao"]')).toHaveLength(1);
    expect(root.querySelectorAll('[data-testid="affiliate-c61-catalog-link"]')).toHaveLength(3);
    expect(root.querySelectorAll("form")).toHaveLength(0);
  });
});
