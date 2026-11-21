import { cleanup, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AffiliateApplicationStepsPreview } from "@/components/affiliate-application-steps-preview";
import { AffiliateLandingIntro } from "@/components/affiliate-landing";
import { AffiliateBrandTrust } from "@/components/affiliate-brand-trust";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("C92: apresentação editorial e jornada de inscrição sem duplicidade", () => {
  it("ancora Como funciona nas três etapas verdadeiras antes de qualquer formulário", () => {
    const { container } = render(
      <>
        <AffiliateApplicationStepsPreview />
        <section id="inscricao" aria-label="Inscrição">
          Formulário original
        </section>
        <AffiliateLandingIntro recruitmentStatus="closed" />
      </>,
    );
    const steps = screen.getByTestId("vonix-c66-application-steps");
    const target = container.querySelector("#como-funciona");
    expect(target).not.toBeNull();
    expect(steps.contains(target)).toBe(true);
    expect(
      steps.compareDocumentPosition(container.querySelector("#inscricao")!) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      within(steps).getByRole("heading", { name: /Da sua ideia à sua candidatura/i }),
    ).toBeInTheDocument();
    expect(steps.querySelectorAll('[data-testid="vonix-c79-step-card"]')).toHaveLength(3);
    expect(container.querySelectorAll("#como-funciona")).toHaveLength(1);
    expect(container.querySelector('[data-testid="affiliate-c90-compact-journey"]')).toBeNull();
  });

  it("inclui uma fotografia oficial de cabelos, fonte explícita e zero provas falsas", () => {
    const network = vi.spyOn(globalThis, "fetch");
    render(<AffiliateBrandTrust recruitmentOpen={false} />);
    const brand = screen.getByTestId("affiliate-c58-brand-trust");
    const figure = screen.getByTestId("affiliate-c92-brand-photo");
    expect(within(figure).getByRole("img")).toHaveAttribute("src", "/images/categorias/frizz.jpg");
    expect(figure).toHaveTextContent("Não retrata uma afiliada");
    expect(brand.querySelectorAll("img")).toHaveLength(1);
    expect(brand.querySelectorAll("picture")).toHaveLength(0);
    expect(within(brand).getByRole("link", { name: /Conferir a fonte oficial/i })).toHaveAttribute(
      "href",
      "/sobre",
    );
    expect(brand).toHaveTextContent("480+");
    expect(brand).toHaveTextContent("Não é número de afiliadas");
    expect(brand).not.toHaveTextContent(
      /comissões pagas por criadoras|ganhos garantidos|depoimento de afiliada real/i,
    );
    expect(network).not.toHaveBeenCalled();
  });

  it("o HTML inicial contém a âncora e os conteúdos públicos sem exigir JavaScript", () => {
    const html = renderToStaticMarkup(
      <>
        <AffiliateApplicationStepsPreview />
        <AffiliateBrandTrust recruitmentOpen={false} />
      </>,
    );
    const root = document.createElement("div");
    root.innerHTML = html;
    expect(root.querySelectorAll("#como-funciona")).toHaveLength(1);
    expect(root.querySelectorAll("#candidatura-etapas")).toHaveLength(1);
    expect(root.querySelector('[data-testid="affiliate-c92-public-store-fact"]')).toHaveTextContent(
      "480+",
    );
    expect(root.querySelector('img[src="/images/categorias/frizz.jpg"]')).not.toBeNull();
  });
});
