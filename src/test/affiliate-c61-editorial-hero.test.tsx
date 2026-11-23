import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { AffiliateEditorialHero } from "@/components/affiliate-editorial-hero";
import { AffiliateLandingIntro } from "@/components/affiliate-landing";

afterEach(cleanup);

describe("C61 public recruitment hero with real Vonix catalogue", () => {
  it("shows 3 real, separately sourced Vonix products, not imaginary creators", () => {
    const { container } = render(<AffiliateEditorialHero recruitmentStatus="open" />);
    const hero = screen.getByTestId("vonix-affiliate-hero");
    const photoGallery = within(hero).getByTestId("affiliate-c61-hero-catalog");
    const links = within(photoGallery).getAllByTestId("affiliate-c61-catalog-link");
    expect(links).toHaveLength(3);

    const products = [
      ["kit-banana-e-mel", "/produto/kit-banana-e-mel"],
      ["mascara-reparacao-nutri-repair", "/produto/mascara-reparacao-nutri-repair"],
      ["botox-vonix", "/produto/botox-vonix"],
    ] as const;
    for (const [slug, source] of products) {
      const product = links.find((link) => link.getAttribute("href") === source);
      expect(product).toBeDefined();
      const img = product?.querySelector("img");
      expect(img).toHaveAttribute("src", `/images/products/${slug}.jpg`);
      expect(img).toHaveAttribute("alt", expect.stringContaining("Vonix Hair"));
      expect(product?.querySelector("source")).toHaveAttribute(
        "srcset",
        `/images/products/${slug}.webp`,
      );
    }
    // The first catalogue item is behind a mobile disclosure; the portrait is LCP.
    expect(screen.getByTestId("affiliate-c94-editorial-photo")).toHaveAttribute(
      "fetchpriority",
      "high",
    );
    expect(links[0]?.querySelector("img")).toHaveAttribute("fetchpriority", "low");
    expect(links[0]?.querySelector("img")).toHaveAttribute("loading", "lazy");
    expect(within(photoGallery).getByRole("link", { name: /Ver catálogo/ })).toHaveAttribute(
      "href",
      "/loja",
    );
    expect(photoGallery).toHaveTextContent("Não são imagens de afiliadas");
    expect(hero).not.toHaveTextContent(
      /15% no site|21% no TikTok|3 milhões|produtos grátis para afiliadas/i,
    );
    expect(container.querySelectorAll('a[href="#inscricao"]')).toHaveLength(1);
  });

  it.each([
    ["open", "Candidaturas abertas para análise", "Quero ser afiliada Vonix"],
    ["loading", "Consultando disponibilidade de inscrição", "Conhecer a inscrição"],
    ["limited", "Inscrição temporariamente limitada nesta conexão", "Conhecer a inscrição"],
    [
      "closed",
      "Conheça o formulário enquanto as inscrições estão em preparação",
      "Conhecer a inscrição",
    ],
  ] as const)("preserves truthful %s intake state and conditional CTA", (status, copy, label) => {
    render(<AffiliateEditorialHero recruitmentStatus={status} />);
    const hero = screen.getByTestId("vonix-affiliate-hero");
    expect(within(hero).getByRole("status")).toHaveTextContent(copy);
    expect(within(hero).getByRole("link", { name: new RegExp(label) })).toHaveAttribute(
      "href",
      "#inscricao",
    );
    expect(within(hero).getByRole("heading", { level: 1 })).toHaveTextContent(
      "Seu jeito de criar.",
    );
    expect(within(hero).getByRole("link", { name: /Conhecer as condições/ })).toHaveAttribute(
      "href",
      "#ganhos",
    );
    expect(hero).toHaveTextContent("8% sobre vendas após aprovação");
    expect(hero).toHaveTextContent("Sem estoque próprio");
    expect(hero).toHaveTextContent("A candidatura não garante aprovação");
  });

  it("shows real entry facts, early conditions, then brand and product reviews", () => {
    const { container } = render(<AffiliateLandingIntro recruitmentStatus="closed" />);
    const hero = screen.getByTestId("vonix-affiliate-hero");
    const facts = screen.getByTestId("affiliate-c61-eligibility-facts");
    const brand = screen.getByTestId("affiliate-c58-brand-trust");
    const reviews = screen.getByTestId("vonix-c53-real-product-reviews");
    const earnings = screen.getByTestId("vonix-affiliate-earnings");
    expect(hero.compareDocumentPosition(facts) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(facts.compareDocumentPosition(earnings) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(earnings.compareDocumentPosition(brand) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(brand.compareDocumentPosition(reviews) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    for (const fact of [
      "Candidatura gratuita",
      "Seleção individual",
      "Maiores de 18 anos",
      "TikTok opcional",
    ]) {
      expect(facts).toHaveTextContent(fact);
    }
    expect(container.querySelectorAll("#avaliacoes-produtos")).toHaveLength(1);
    expect(container.querySelectorAll('[data-testid="vonix-affiliate-hero"]')).toHaveLength(1);
  });
});
