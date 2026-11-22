import { cleanup, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AffiliateEarlyValueBand } from "@/components/affiliate-early-value-band";
import { AffiliateLandingOffer } from "@/components/affiliate-landing";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("C102 — benefícios transparentes antes da candidatura", () => {
  it("mostra exatamente as três condições comerciais oficiais, sempre após aprovação", () => {
    render(<AffiliateEarlyValueBand />);
    const band = screen.getByTestId("affiliate-c61-eligibility-facts");
    const cards = within(band).getByTestId("affiliate-c102-commercial-terms");
    expect(within(cards).getAllByRole("listitem")).toHaveLength(3);
    expect(cards).toHaveTextContent("8%");
    expect(cards).toHaveTextContent("venda confirmada");
    expect(cards).toHaveTextContent("+ R$ 500");
    expect(cards).toHaveTextContent("R$ 10 mil vendidos");
    expect(cards).toHaveTextContent("Em média");
    expect(cards).toHaveTextContent("após metas");
    expect(band).toHaveTextContent("nenhuma remuneração é garantida pela inscrição");
    expect(band).not.toHaveTextContent(
      /ganhos garantidos|renda garantida|aprovação automática|15%|21%|Skence|TikTok Shop/i,
    );
  });

  it("preserva todos os fatos públicos da candidatura e o acesso às regras completas", () => {
    render(<AffiliateEarlyValueBand />);
    const band = screen.getByTestId("affiliate-c61-eligibility-facts");
    for (const fact of [
      "Candidatura gratuita",
      "Seleção individual",
      "Maiores de 18 anos",
      "TikTok opcional",
      "Sem comprar produto para se candidatar",
    ]) {
      expect(band).toHaveTextContent(fact);
    }
    expect(within(band).getByRole("link", { name: "Ver regras" })).toHaveAttribute(
      "href",
      "#ganhos",
    );
    expect(within(band).getByRole("heading", { level: 2 })).toHaveTextContent(
      "afiliadas aprovadas",
    );
  });

  it("não cria formulário, botões de envio, recursos externos ou requisições", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const { container } = render(<AffiliateEarlyValueBand />);
    expect(container.querySelector("form, input, button, video, iframe")).toBeNull();
    expect(container.querySelectorAll("a")).toHaveLength(1);
    expect(container.querySelectorAll("img")).toHaveLength(0);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("aparece logo após o hero no intro e antes das etapas de inscrição", () => {
    const { container } = render(
      <AffiliateLandingOffer recruitmentStatus="closed" placement="intro" />,
    );
    const hero = screen.getByTestId("vonix-affiliate-hero");
    const band = screen.getByTestId("affiliate-c61-eligibility-facts");
    expect(hero.compareDocumentPosition(band) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(
      container.querySelectorAll('[data-testid="affiliate-c61-eligibility-facts"]'),
    ).toHaveLength(1);
    const route = readFileSync("src/routes/seja-afiliada.tsx", "utf8");
    expect(route.indexOf('placement="intro"')).toBeLessThan(
      route.indexOf("<AffiliateApplicationStepsPreview"),
    );
    expect(container.querySelector("form")).toBeNull();
  });

  it("mantém SSR estável e as mesmas informações da sessão detalhada de ganhos", () => {
    const html = renderToStaticMarkup(<AffiliateEarlyValueBand />);
    expect(html).toContain("affiliate-c102-commercial-terms");
    expect(html).toContain("grid-cols-3");
    expect(html).toContain("Candidatura gratuita");
    const source = readFileSync("src/components/affiliate-landing.tsx", "utf8");
    expect(source).toContain('big: "8%"');
    expect(source).toContain('big: "+ R$ 500"');
    expect(source).toContain("supervisora");
  });
});
