import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AffiliateLandingOffer } from "@/components/affiliate-landing";
import { officialProductReviewCount } from "@/components/affiliate-verified-review-preview";

afterEach(cleanup);

describe("C78: prova de produto verdadeira antes das condições e sem bloqueio do cadastro", () => {
  it("aproxima avaliações de produtos do topo sem duplicar a faixa ou inventar afiliadas", () => {
    render(<AffiliateLandingOffer recruitmentStatus="closed" />);
    const offer = screen.getByTestId("vonix-c64-early-offer");
    const hero = within(offer).getByTestId("vonix-affiliate-hero");
    const early = within(offer).getByTestId("vonix-c65-review-preview");
    const earnings = within(offer).getByTestId("vonix-affiliate-earnings");
    expect(hero.compareDocumentPosition(early) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(early.compareDocumentPosition(earnings) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(within(offer).getAllByTestId("vonix-c65-review-preview")).toHaveLength(1);
    expect(early).toHaveAttribute("id", "avaliacoes-rapidas");
    expect(early).toHaveTextContent(/Não são depoimentos de afiliadas/);
    expect(screen.getAllByRole("link", { name: /Ver candidatura/i }).length).toBeGreaterThan(0);
    expect(early).toHaveTextContent(/não comprovam compra verificada/i);
    const reviewCards = within(early).getAllByTestId("vonix-c72-review-card");
    expect(reviewCards).toHaveLength(4);
    expect(officialProductReviewCount).toBe(reviewCards.length);
    expect(within(offer).getAllByTestId("vonix-c77-benefit-editorial")).toHaveLength(3);
    expect(within(early).getByTestId("vonix-c78-proof-signup-link")).toHaveAttribute(
      "href",
      "#inscricao",
    );
  });

  it("leva do catálogo do hero à prova disponível, sem chamar cliente de afiliada", () => {
    render(<AffiliateLandingOffer recruitmentStatus="open" />);
    const hero = screen.getByTestId("vonix-affiliate-hero");
    const cue = within(hero).getByTestId("vonix-c78-real-review-cta");
    expect(cue).toHaveAttribute("href", "#avaliacoes-rapidas");
    expect(cue).toHaveTextContent("3 avaliações em vídeo no catálogo Vonix");
    expect(cue).toHaveTextContent(/não são depoimentos de afiliadas/);
    expect(within(hero).getByRole("link", { name: /Quero ser afiliada Vonix/i })).toHaveAttribute(
      "href",
      "#inscricao",
    );
    expect(earlyAnchor()).toBe(true);
  });

  it("não oferece inscrição ativa quando recrutamento está indisponível", () => {
    render(<AffiliateLandingOffer recruitmentStatus="unavailable" />);
    const hero = screen.getByTestId("vonix-affiliate-hero");
    expect(hero).toHaveTextContent(/Não foi possível consultar a disponibilidade/);
    expect(within(hero).queryByRole("link", { name: /Quero ser afiliada Vonix/i })).toBeNull();
    expect(within(hero).getByRole("link", { name: /Conhecer a inscrição/i })).toHaveAttribute(
      "href",
      "#inscricao",
    );
  });

  it("jamais copia vantagens, ganhos ou depoimentos do modelo Skence", () => {
    render(<AffiliateLandingOffer recruitmentStatus="closed" />);
    const text = screen.getByTestId("vonix-c64-early-offer").textContent ?? "";
    expect(text).not.toMatch(/Skence|21%|15%|PIX no dia 10|renda garantida|benefícios VIP/i);
    expect(text).toContain("8%");
    expect(text).toContain("R$ 500");
  });
});

function earlyAnchor() {
  return document.querySelectorAll("#avaliacoes-rapidas").length === 1;
}
