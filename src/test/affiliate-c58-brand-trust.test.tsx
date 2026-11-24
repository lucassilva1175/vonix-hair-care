import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-router", () => ({
  Link: ({
    children,
    to,
    ...rest
  }: React.PropsWithChildren<{ to: string; "aria-label"?: string }>) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}));

import { AffiliateBrandTrust } from "@/components/affiliate-brand-trust";
import { AffiliateLandingIntro } from "@/components/affiliate-landing";
import { AffiliateShell } from "@/components/affiliate-shell";

afterEach(cleanup);

describe("C58 genuine Vonix credibility before applying", () => {
  it("shows only verified brand facts, with direct paths to official sources", () => {
    render(<AffiliateBrandTrust recruitmentOpen={false} />);
    const section = screen.getByTestId("affiliate-c58-brand-trust");
    expect(within(section).getByRole("heading", { level: 2 })).toHaveTextContent("Uma loja real");
    expect(within(section).getByRole("link", { name: /Conhecer o catálogo/ })).toHaveAttribute(
      "href",
      "/loja",
    );
    expect(within(section).getByRole("link", { name: /Conhecer a marca/ })).toHaveAttribute(
      "href",
      "/sobre",
    );
    expect(within(section).getByRole("link", { name: /Consultar entregas/ })).toHaveAttribute(
      "href",
      "/politica-de-frete",
    );
    expect(
      within(section).getByRole("link", { name: /Ver avaliações reais de produtos/ }),
    ).toHaveAttribute("href", "#avaliacoes-produtos");
    expect(within(section).getByRole("link", { name: /Abrir prévia segura/ })).toHaveAttribute(
      "href",
      "#inscricao",
    );
    expect(section).toHaveTextContent("Não retrata uma afiliada");
    expect(section).toHaveTextContent("não de afiliadas participantes");
    expect(section.textContent).not.toMatch(
      /3 milh[õo]es|depoimentos de afiliadas aprovadas|cupom garantido|20% de comissão|ganhos garantidos/i,
    );
  });

  it("usa uma fotografia editorial real e prova institucional rastreável, sem inventar criadoras", () => {
    render(<AffiliateBrandTrust recruitmentOpen />);
    const section = screen.getByTestId("affiliate-c58-brand-trust");
    const figure = screen.getByTestId("affiliate-c92-brand-photo");
    const image = within(figure).getByRole("img");
    expect(image).toHaveAttribute("src", "/images/categorias/frizz.jpg");
    expect(image).toHaveAttribute("width", "480");
    expect(image).toHaveAttribute("height", "480");
    expect(image).toHaveAttribute("loading", "lazy");
    expect(image).toHaveAttribute("alt", expect.stringContaining("catálogo oficial Vonix Hair"));
    expect(figure).toHaveTextContent("Não retrata uma afiliada");
    expect(section.querySelectorAll("picture")).toHaveLength(0);

    const publicFact = screen.getByTestId("affiliate-c92-public-store-fact");
    expect(publicFact).toHaveTextContent("480+");
    expect(publicFact).toHaveTextContent(
      "Produtos vendidos entre o site e o atendimento por WhatsApp",
    );
    expect(publicFact).toHaveTextContent("segundo a página institucional da Vonix Hair");
    expect(publicFact).toHaveTextContent("Não é número de afiliadas");
    expect(
      within(publicFact).getByRole("link", { name: /Conferir a fonte oficial/i }),
    ).toHaveAttribute("href", "/sobre");
    expect(
      within(section).getByRole("link", { name: /Quero apresentar meu perfil/i }),
    ).toHaveAttribute("href", "#inscricao");
    expect(within(section).queryByRole("link", { name: /Abrir prévia segura/i })).toBeNull();
    expect(publicFact).not.toHaveTextContent(/resultado de afiliadas|renda garantida|15%|21%/i);
  });

  it("keeps verified store content after clear earnings and product reviews reachable", () => {
    const { container } = render(<AffiliateLandingIntro recruitmentStatus="closed" />);
    const brand = screen.getByTestId("affiliate-c58-brand-trust");
    const earnings = screen.getByTestId("vonix-affiliate-earnings");
    expect(earnings.compareDocumentPosition(brand) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    const productReviews = screen.getByTestId("vonix-c53-real-product-reviews");
    expect(productReviews).toHaveAttribute("id", "avaliacoes-produtos");
    expect(container.querySelectorAll("#avaliacoes-produtos")).toHaveLength(1);
    expect(productReviews).toHaveTextContent("Não são depoimentos de afiliadas");
  });

  it("differentiates open recruitment from form preview in the sticky header", () => {
    const { rerender } = render(
      <AffiliateShell recruitmentStatus="closed">
        <p>Conteúdo</p>
      </AffiliateShell>,
    );
    const before = document.querySelector('header a[href="#inscricao"]');
    expect(before?.textContent).toContain("Ver inscrição");
    expect(before?.textContent).not.toContain("Quero participar");
    rerender(
      <AffiliateShell recruitmentStatus="open">
        <p>Conteúdo</p>
      </AffiliateShell>,
    );
    const after = document.querySelector('header a[href="#inscricao"]');
    expect(after?.textContent).toContain("Quero participar");
    expect(after?.textContent).toContain("Enviar candidatura");
    expect(after?.getAttribute("href")).toBe("#inscricao");
  });
});
