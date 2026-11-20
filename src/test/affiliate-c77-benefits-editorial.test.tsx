import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AffiliateLandingOffer } from "@/components/affiliate-landing";

afterEach(cleanup);

describe("C77: benefícios Vonix com imagens reais sem promessas inventadas", () => {
  it("mantém três condições comerciais e fotos leves do catálogo original", () => {
    render(<AffiliateLandingOffer recruitmentStatus="open" />);
    const section = screen.getByTestId("vonix-affiliate-earnings");
    const cards = within(section).getAllByTestId("vonix-c77-benefit-editorial");
    expect(cards).toHaveLength(3);
    expect(cards[0]).toHaveTextContent("8%");
    expect(cards[1]).toHaveTextContent("+ R$ 500");
    expect(cards[2]).toHaveTextContent("Supervisora");
    const imgs = cards.map((card) => card.querySelector("img")!);
    expect(imgs.map((img) => img.getAttribute("src"))).toEqual([
      "/images/products/botox-vonix.webp",
      "/images/products/kit-banana-e-mel.webp",
      "/images/products/kit-cronograma-capilar.webp",
    ]);
    imgs.forEach((img) => {
      expect(img).toHaveAttribute("loading", "lazy");
      expect(img).toHaveAttribute("decoding", "async");
      expect(img).toHaveAttribute("aria-hidden", "true");
      expect(img).toHaveAttribute("alt", "");
    });
    expect(section).toHaveTextContent(/não representam ganhos ou depoimentos de afiliadas/);
    expect(section).toHaveTextContent(/sujeita à análise individual/i);
    expect(section).not.toHaveTextContent(/produto grátis|cupom garantido|renda garantida/i);
    expect(within(section).getByRole("link", { name: /quero me candidatar/i })).toHaveAttribute(
      "href",
      "#inscricao",
    );
  });
});
