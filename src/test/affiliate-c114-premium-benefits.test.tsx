import { cleanup, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AffiliateEarlyValueBand } from "@/components/affiliate-early-value-band";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("C114 — condições legíveis e hierarquia responsável no mobile", () => {
  it("mantém três condições reais, mas só a comissão é destaque primário", () => {
    render(<AffiliateEarlyValueBand />);
    const items = within(screen.getByTestId("affiliate-c102-commercial-terms")).getAllByRole(
      "listitem",
    );
    expect(items).toHaveLength(3);
    expect(items[0]).toHaveAttribute("data-priority", "primary");
    expect(items[0]).toHaveClass("col-span-2", "sm:col-span-1");
    expect(items[0]).toHaveTextContent("8%");
    expect(items[0]).toHaveTextContent("Comissão");
    expect(items[0]).toHaveTextContent("Por venda confirmada");
    expect(items[1]).toHaveAttribute("data-priority", "conditional");
    expect(items[2]).toHaveAttribute("data-priority", "conditional");
    expect(items[1]).toHaveTextContent("Após metas e elegibilidade");
    expect(items[2]).toHaveTextContent("Sujeita à avaliação da equipe");
    expect(items[1]).toHaveTextContent("+ R$ 500");
    expect(items[2]).toHaveTextContent("4%");
    expect(items[1]).toHaveClass("col-span-1");
    expect(items[2]).toHaveClass("col-span-1");
  });

  it("é uma grade de 2 colunas mobile e 3 desktop, sem scroll horizontal nem conteúdo oculto", () => {
    render(<AffiliateEarlyValueBand />);
    const cards = screen.getByTestId("affiliate-c102-commercial-terms");
    expect(cards).toHaveClass("grid-cols-2", "sm:grid-cols-3");
    expect(cards).not.toHaveClass("grid-cols-3");
    expect(cards.querySelectorAll("li")).toHaveLength(3);
    const source = renderToStaticMarkup(<AffiliateEarlyValueBand />);
    expect(source).toContain('data-priority="primary"');
    expect(source).toContain('data-priority="conditional"');
    expect(source).not.toContain("overflow-x-auto");
    expect(source).not.toContain("aria-expanded");
  });

  it("mantém requisitos, aviso jurídico e link às regras sem duplicar ação de candidatura", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const { container } = render(<AffiliateEarlyValueBand />);
    const band = screen.getByTestId("affiliate-c61-eligibility-facts");
    expect(within(band).getByRole("heading", { level: 2 })).toHaveTextContent(
      "Para afiliadas aprovadas",
    );
    expect(within(band).getByRole("link", { name: "Ver regras" })).toHaveAttribute(
      "href",
      "#ganhos",
    );
    for (const fact of [
      "Candidatura gratuita",
      "Seleção individual",
      "Maiores de 18 anos",
      "TikTok opcional",
      "Sem comprar produto para se candidatar",
      "nenhuma remuneração é garantida pela inscrição",
    ]) {
      expect(band).toHaveTextContent(fact);
    }
    expect(container.querySelectorAll("a")).toHaveLength(2);
    expect(container.querySelectorAll("img, form, input, button, video, iframe")).toHaveLength(0);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(band).not.toHaveTextContent(
      /15%|21%|ganhos garantidos|produto grátis|cupom garantido|Skence|TikTok Shop/i,
    );
  });
});
