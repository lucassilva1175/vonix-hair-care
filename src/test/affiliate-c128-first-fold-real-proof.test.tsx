import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AffiliateEditorialHero } from "@/components/affiliate-editorial-hero";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("C128 — conteúdo real da Vonix na primeira dobra", () => {
  it("mostra três miniaturas oficiais de produtos no mobile sem exigir abertura da vitrine", () => {
    render(<AffiliateEditorialHero recruitmentStatus="closed" />);
    const strip = screen.getByTestId("affiliate-c128-product-peek");
    const thumbs = Array.from(strip.querySelectorAll("img"));
    expect(thumbs).toHaveLength(3);
    expect(thumbs.map((img) => img.getAttribute("src"))).toEqual([
      "/images/products/botox-vonix-480.webp",
      "/images/products/kit-banana-e-mel-480.webp",
      "/images/products/mascara-reparacao-nutri-repair-480.webp",
    ]);
    for (const thumb of thumbs) {
      expect(thumb).toHaveAttribute("alt", "");
      expect(thumb).toHaveAttribute("loading", "lazy");
      expect(thumb).toHaveAttribute("decoding", "async");
    }
    expect(screen.getByTestId("affiliate-c98-mobile-catalog-toggle")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(strip).toHaveAttribute("aria-hidden", "true");
  });

  it("substitui o ícone abstrato de prova por fotografias já publicadas por clientes", () => {
    render(<AffiliateEditorialHero recruitmentStatus="loading" />);
    const proof = screen.getByTestId("vonix-c78-real-review-cta");
    const mosaic = within(proof).getByTestId("affiliate-c128-authentic-review-mosaic");
    const imgs = Array.from(mosaic.querySelectorAll("img"));
    expect(imgs).toHaveLength(3);
    for (const img of imgs) {
      expect(img.getAttribute("src")).toMatch(/^\/depoimentos\/depoimento-[1-4](?:-poster)?\.jpg$/);
      expect(img).toHaveAttribute("alt", "");
      expect(img).toHaveAttribute("loading", "lazy");
    }
    expect(proof).toHaveAttribute("href", "#avaliacoes-rapidas");
    expect(proof).toHaveTextContent(/avaliações de clientes/i);
    expect(proof).toHaveTextContent(/não são depoimentos de afiliadas/i);
    expect(proof).not.toHaveTextContent(/resultados garantidos|renda|cupom de afiliada/i);
  });

  it("convida criadoras iniciantes de forma clara sem prometer aprovação", () => {
    const network = vi.spyOn(globalThis, "fetch");
    render(<AffiliateEditorialHero recruitmentStatus="closed" />);
    const hero = screen.getByTestId("vonix-affiliate-hero");
    expect(hero).toHaveTextContent(/não precisa montar portfólio/i);
    expect(hero).toHaveTextContent(/apresente seu Instagram/i);
    expect(hero).toHaveTextContent(/sem compra obrigatória/i);
    expect(hero).toHaveTextContent(/a candidatura não garante aprovação/i);
    const cta = within(hero).getByRole("link", { name: /Conhecer a inscrição/ });
    expect(cta).toHaveAttribute("href", "#inscricao");
    expect(within(hero).getAllByTestId("affiliate-c61-catalog-link")).toHaveLength(3);
    expect(network).not.toHaveBeenCalled();
    fireEvent.click(screen.getByTestId("affiliate-c98-mobile-catalog-toggle"));
    expect(screen.getByTestId("affiliate-c98-products-panel")).not.toHaveClass("hidden");
  });
});
