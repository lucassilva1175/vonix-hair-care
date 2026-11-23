import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ children, to, ...rest }: React.PropsWithChildren<{ to: string }>) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}));

import { AffiliateLandingIntro } from "@/components/affiliate-landing";
import { AffiliateCreatorOpportunity } from "@/components/affiliate-creator-opportunity";
import { AffiliateShell } from "@/components/affiliate-shell";
import { AffiliateApplicationStepsPreview } from "@/components/affiliate-application-steps-preview";
import { AffiliateCreatorPaths } from "@/components/affiliate-creator-paths";

afterEach(cleanup);

describe("C60 editorial product evidence and recruitment navigation", () => {
  it("places authentic product reviews after brand trust and early earnings, without duplication", () => {
    const { container } = render(<AffiliateLandingIntro recruitmentStatus="open" />);
    const brand = screen.getByTestId("affiliate-c58-brand-trust");
    const evidence = screen.getByTestId("vonix-c53-real-product-reviews");
    const earnings = screen.getByTestId("vonix-affiliate-earnings");
    expect(brand.compareDocumentPosition(evidence) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(earnings.compareDocumentPosition(brand) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(container.querySelectorAll("#avaliacoes-produtos")).toHaveLength(1);
    expect(
      container.querySelectorAll('[data-testid="vonix-c53-real-product-reviews"]'),
    ).toHaveLength(1);
    expect(evidence.querySelectorAll("blockquote")).toHaveLength(4);
    expect(evidence.querySelectorAll("img")).toHaveLength(2);
    expect(evidence.querySelector('[data-testid="affiliate-c86-customer-photo"]')).toHaveAttribute(
      "src",
      "/depoimentos/depoimento-4.jpg",
    );
  });

  it("preserves actual public review attribution, original imagery and verifiable source", () => {
    render(<AffiliateLandingIntro recruitmentStatus="closed" />);
    const evidence = screen.getByTestId("vonix-c53-real-product-reviews");
    expect(
      within(evidence).getByRole("link", { name: /Conferir avaliações na loja/ }),
    ).toHaveAttribute("href", "/produto/botox-vonix");
    expect(evidence.querySelector("picture source")).toHaveAttribute(
      "srcset",
      "/images/products/botox-vonix.webp",
    );
    expect(evidence.querySelector("picture img")?.getAttribute("alt")).toContain("Vonix");
    for (const person of ["Fernanda Assis", "Ayla Muniz", "Mariana Andrade", "Ana Paula"]) {
      expect(evidence).toHaveTextContent(person);
    }
    expect(evidence).toHaveTextContent("Não são depoimentos de afiliadas");
    expect(evidence).toHaveTextContent("Eles não representam renda, vendas, comissões");
    expect(evidence.textContent).not.toMatch(
      /comissões recebidas por criadoras|15% do site|21% TikTok|3 milhões de contas/i,
    );
  });

  it("avoids repeated product images and preserves genuine links to catalog and application", () => {
    const { container } = render(<AffiliateCreatorOpportunity recruitmentOpen={false} />);
    expect(container.querySelectorAll("blockquote")).toHaveLength(0);
    expect(container.querySelectorAll("#avaliacoes-produtos")).toHaveLength(0);
    expect(container.querySelectorAll("picture img")).toHaveLength(0);
    expect(screen.getByTestId("affiliate-c90-creator-bridge")).toBeInTheDocument();
    expect(
      within(screen.getByTestId("affiliate-c90-creator-bridge")).getByRole("link", {
        name: /Conhecer o catálogo/i,
      }),
    ).toHaveAttribute("href", "/loja");
    expect(screen.getByRole("link", { name: /Conhecer a candidatura/ })).toHaveAttribute(
      "href",
      "#inscricao",
    );
  });

  it("exposes accessible quick navigation to real anchors on mobile and desktop", () => {
    const { container } = render(
      <AffiliateShell recruitmentStatus="open">
        <AffiliateLandingIntro recruitmentStatus="open" />
        <AffiliateApplicationStepsPreview />
        <AffiliateCreatorPaths />
        <section id="inscricao">Inscrição teste sem envio</section>
      </AffiliateShell>,
    );
    const mobile = screen.getByRole("navigation", { name: "Acesso rápido ao programa" });
    expect(mobile).toHaveAttribute("tabindex", "0");
    for (const [label, href] of [
      ["Já me inscrevi", "/consultar-candidatura"],
      ["Comissão e bônus", "#ganhos"],
      ["Como funciona", "#como-funciona"],
      ["Avaliações de produtos", "#avaliacoes-rapidas"],
      ["Dúvidas", "#duvidas"],
    ] as const) {
      expect(within(mobile).getByRole("link", { name: label })).toHaveAttribute("href", href);
    }
    expect(within(mobile).getAllByRole("link")).toHaveLength(5);
    const desktop = screen.getByRole("navigation", { name: "Navegação da seleção de afiliadas" });
    expect(within(desktop).getByRole("link", { name: "Já me inscrevi" })).toHaveAttribute(
      "href",
      "/consultar-candidatura",
    );
    expect(within(desktop).getByRole("link", { name: "Avaliações de produtos" })).toHaveAttribute(
      "href",
      "#avaliacoes-rapidas",
    );
    expect(within(desktop).getAllByRole("link")).toHaveLength(5);
    // Complete discovery content remains available beyond the concise navigation.
    expect(container.querySelector("#perfis")).not.toBeNull();
    expect(container.querySelector("#criterios")).not.toBeNull();
    for (const link of container.querySelectorAll('a[href^="#"]')) {
      const id = link.getAttribute("href")?.slice(1);
      if (id !== "duvidas" && id !== "inscricao")
        expect(id && container.querySelector(`[id="${id}"]`)).toBeTruthy();
    }
    expect(
      container.querySelectorAll('a[href="#avaliacoes-produtos"]').length,
    ).toBeGreaterThanOrEqual(2);
  });
});
