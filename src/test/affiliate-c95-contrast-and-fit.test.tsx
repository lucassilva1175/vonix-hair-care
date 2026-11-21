import { cleanup, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AffiliateEditorialHero } from "@/components/affiliate-editorial-hero";
import { AffiliateLandingDiscovery } from "@/components/affiliate-landing";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("C95: contraste do hero e quatro temas reais em cartões compactos", () => {
  it("força contraste branco no H1 mesmo com a regra global do portal", () => {
    render(<AffiliateEditorialHero recruitmentStatus="closed" />);
    const hero = screen.getByTestId("vonix-affiliate-hero");
    const heading = within(hero).getByRole("heading", { level: 1 });
    const editorial = screen.getByTestId("affiliate-c89-hair-editorial");
    expect(heading).toHaveStyle({ color: "#fff" });
    expect(editorial).toContainElement(heading);
    expect(editorial).toHaveTextContent("Não retrata afiliada nem comprova parceria.");
    expect(within(hero).getAllByTestId("affiliate-c61-catalog-link")).toHaveLength(3);
    const status = screen.getByTestId("affiliate-c94-intake-status");
    const action = within(hero).getByRole("link", { name: /Conhecer a inscrição/i });
    expect(status.compareDocumentPosition(action) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("explica quatro aspectos sem fingir que são requisitos ou creators aprovadas", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<AffiliateLandingDiscovery recruitmentStatus="closed" />);
    const section = screen.getByTestId("affiliate-c95-fit-section");
    const rail = screen.getByTestId("affiliate-c95-fit-rail");
    const cards = within(rail).getAllByTestId("affiliate-c95-fit-card");
    expect(section).toHaveAttribute("id", "criterios");
    expect(rail).toHaveAttribute("tabindex", "0");
    expect(rail).toHaveAttribute("role", "region");
    expect(cards).toHaveLength(4);
    for (const phrase of [
      "Sua história importa",
      "Afinidade de verdade",
      "Ideias com personalidade",
      "Seu jeito de comunicar",
    ])
      expect(section).toHaveTextContent(phrase);
    expect(section).toHaveTextContent("não são exigências fixas nem promessa de aprovação");
    expect(section).toHaveTextContent("18 anos");
    expect(section).toHaveTextContent("TikTok é opcional");
    expect(section).toHaveTextContent("não retratam candidatas ou parcerias");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("preserva os quatro itens e fotografias do catálogo, mas sem packshot gigante", () => {
    render(<AffiliateLandingDiscovery recruitmentStatus="closed" />);
    const section = screen.getByTestId("affiliate-c95-fit-section");
    const cards = within(section).getAllByTestId("affiliate-c95-fit-card");
    const paths = [
      "/images/products/kit-banana-e-mel.jpg",
      "/images/products/progressiva-fio-de-luz.jpg",
      "/images/products/mascara-reparacao-nutri-repair.jpg",
      "/images/products/botox-vonix.jpg",
    ];
    cards.forEach((card, index) => {
      const img = within(card).getByRole("img");
      expect(img).toHaveAttribute("src", paths[index]);
      expect(img).toHaveAttribute("loading", "lazy");
      expect(img.getAttribute("alt")).toContain("Vonix");
      expect(card.querySelectorAll("img")).toHaveLength(1);
      expect(card).toHaveTextContent(["IDENTIDADE", "BELEZA CAPILAR", "CRIAÇÃO", "CONEXÃO"][index]);
    });
    expect(section.querySelectorAll("img")).toHaveLength(4);
    expect(section.querySelectorAll("picture source[type='image/webp']")).toHaveLength(4);
  });

  it("renderiza cards e título acessíveis no HTML inicial sem eventos ou candidaturas reais", () => {
    const html = renderToStaticMarkup(
      <>
        <AffiliateEditorialHero recruitmentStatus="closed" />
        <AffiliateLandingDiscovery recruitmentStatus="closed" />
      </>,
    );
    const host = document.createElement("div");
    host.innerHTML = html;
    const h1 = host.querySelector("#vonix-affiliate-title");
    expect(h1?.getAttribute("style")).toContain("color:#fff");
    expect(host.querySelectorAll('[data-testid="affiliate-c95-fit-card"]')).toHaveLength(4);
    expect(host.querySelectorAll("#criterios")).toHaveLength(1);
    expect(host.querySelectorAll("#avaliacoes-produtos")).toHaveLength(1);
    expect(host.querySelectorAll("form")).toHaveLength(0);
  });
});
