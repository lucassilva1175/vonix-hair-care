import { cleanup, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AffiliateEditorialHero } from "@/components/affiliate-editorial-hero";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("C118 — hero premium com proposta condicional e CTA claro", () => {
  it("mostra somente condições reais e mantém valor com prioridade legível", () => {
    const network = vi.spyOn(globalThis, "fetch");
    render(<AffiliateEditorialHero recruitmentStatus="closed" />);
    const hero = screen.getByTestId("vonix-affiliate-hero");
    const rail = within(hero).getByTestId("affiliate-c118-hero-benefits");
    const commission = within(rail).getByTestId("affiliate-c118-commission");
    expect(rail).toHaveAttribute("aria-label", "Condições e informações da candidatura");
    expect(within(rail).getAllByRole("listitem")).toHaveLength(3);
    expect(rail).toHaveClass("grid-cols-2", "sm:flex");
    expect(commission).toHaveClass("col-span-2", "sm:col-span-1");
    expect(commission).toHaveTextContent("8% sobre vendas após aprovação");
    expect(commission).toHaveTextContent("Vendas elegíveis e confirmadas");
    expect(rail).toHaveTextContent("Sem estoque próprio");
    expect(rail).toHaveTextContent("Inscrição gratuita");
    expect(hero).toHaveTextContent("A candidatura não garante aprovação");
    expect(hero).toHaveTextContent("sem compra obrigatória");
    expect(hero).not.toHaveTextContent(/renda garantida|aprovação automática|parceria garantida/i);
    expect(network).not.toHaveBeenCalled();
  });

  it.each([
    ["loading", "Consultando disponibilidade", "Conhecer a inscrição"],
    ["closed", "inscrições estão em preparação", "Conhecer a inscrição"],
    ["unavailable", "Não foi possível consultar", "Conhecer a inscrição"],
    ["limited", "temporariamente limitada", "Conhecer a inscrição"],
    ["open", "Candidaturas abertas para análise", "Quero ser afiliada Vonix"],
  ] as const)(
    "prioriza CTA em %s sem confundir candidatura com aprovação",
    (status, stateText, label) => {
      render(<AffiliateEditorialHero recruitmentStatus={status} />);
      const hero = screen.getByTestId("vonix-affiliate-hero");
      const state = within(hero).getByTestId("affiliate-c94-intake-status");
      const cta = within(hero).getByRole("link", { name: label });
      expect(state).toHaveAttribute("aria-live", "polite");
      expect(state).toHaveTextContent(stateText);
      expect(cta).toHaveAttribute("href", "#inscricao");
      expect(cta).toHaveClass("w-full", "sm:w-auto");
      expect(state.compareDocumentPosition(cta) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(within(hero).getByRole("link", { name: "Conhecer as condições" })).toHaveAttribute(
        "href",
        "#ganhos",
      );
      expect(within(hero).getByTestId("affiliate-c94-editorial-photo")).toHaveAttribute(
        "src",
        "/images/categorias/cachos.jpg",
      );
    },
  );

  it("preserva SSR, uma única ação de inscrição e todas as referências reais", () => {
    const markup = renderToStaticMarkup(<AffiliateEditorialHero recruitmentStatus="loading" />);
    const root = document.createElement("div");
    root.innerHTML = markup;
    expect(root.querySelectorAll("#vonix-affiliate-title")).toHaveLength(1);
    expect(root.querySelectorAll('[data-testid="affiliate-c118-hero-benefits"]')).toHaveLength(1);
    expect(root.querySelectorAll('[data-testid="affiliate-c118-commission"]')).toHaveLength(1);
    expect(root.querySelectorAll('a[href="#inscricao"]')).toHaveLength(1);
    expect(root.querySelectorAll('a[href="#ganhos"]')).toHaveLength(1);
    expect(root.querySelectorAll('[data-testid="affiliate-c61-catalog-link"]')).toHaveLength(3);
    expect(root.querySelectorAll("form,input,iframe,video,[autoplay]")).toHaveLength(0);
    expect(root.textContent).toContain("Vendas elegíveis e confirmadas");
    expect(root.textContent).toContain("Fotos reais dos produtos");
  });
});
