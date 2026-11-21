import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AffiliateLandingIntro } from "@/components/affiliate-landing";
import { AffiliateCreatorOpportunity } from "@/components/affiliate-creator-opportunity";
import { AffiliateApplicationStepsPreview } from "@/components/affiliate-application-steps-preview";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("C90: portal mais objetivo, sem duplicar galeria e processo", () => {
  it("mantém um único passo a passo antes do formulário e preserva dois atalhos", () => {
    const { container } = render(
      <>
        <AffiliateApplicationStepsPreview />
        <AffiliateLandingIntro recruitmentStatus="closed" />
        <section id="inscricao">Inscrição segura</section>
      </>,
    );
    const original = screen.getByTestId("vonix-c66-application-steps");
    expect(original).toHaveAttribute("id", "candidatura-etapas");
    expect(original.querySelector("#como-funciona")).not.toBeNull();
    expect(
      within(original).getByRole("heading", { name: /Da sua ideia à sua candidatura/i }),
    ).toBeInTheDocument();
    expect(original.querySelectorAll('[data-testid="vonix-c79-step-card"]')).toHaveLength(3);
    for (const text of ["Apresente seu perfil", "Guarde seu acesso", "Acompanhe a seleção"]) {
      expect(original).toHaveTextContent(text);
    }
    expect(original).toHaveTextContent("não garante aprovação");
    expect(original).not.toHaveTextContent(/cupom garantido|15%|21%|ganhos garantidos/i);
    expect(container.querySelectorAll("#como-funciona")).toHaveLength(1);
    expect(container.querySelectorAll("#candidatura-etapas")).toHaveLength(1);
    expect(container.querySelectorAll("#inscricao")).toHaveLength(1);
    expect(
      container.querySelectorAll('[data-testid="affiliate-c90-compact-journey"]'),
    ).toHaveLength(0);
  });

  it("substitui as três imagens repetidas por um convite compacto para loja e candidatura", () => {
    const network = vi.spyOn(globalThis, "fetch");
    render(<AffiliateCreatorOpportunity recruitmentOpen={false} />);
    const bridge = screen.getByTestId("affiliate-c90-creator-bridge");
    expect(bridge.querySelectorAll("img, picture, video, iframe")).toHaveLength(0);
    expect(bridge).toHaveTextContent("Explore a marca.");
    expect(bridge).toHaveTextContent("Não é preciso criar um portfólio");
    expect(bridge).toHaveTextContent("não garante aprovação");
    const nav = within(bridge).getByRole("navigation", { name: /Próximos passos para conhecer/i });
    expect(within(nav).getByRole("link", { name: /Conhecer o catálogo/i })).toHaveAttribute(
      "href",
      "/loja",
    );
    expect(within(nav).getByRole("link", { name: /Conhecer a candidatura/i })).toHaveAttribute(
      "href",
      "#inscricao",
    );
    expect(network).not.toHaveBeenCalled();
    expect(bridge.querySelector("input, form")).toBeNull();
  });

  it("continua mostrando ação de inscrição real apenas com status aberto, sem prometer resultados", () => {
    render(<AffiliateCreatorOpportunity recruitmentOpen />);
    const bridge = screen.getByTestId("affiliate-c90-creator-bridge");
    expect(within(bridge).getByRole("link", { name: /Preencher candidatura/i })).toHaveAttribute(
      "href",
      "#inscricao",
    );
    expect(bridge).not.toHaveTextContent(/inscrição aprovada|renda garantida|produto grátis/i);
    expect(bridge.querySelectorAll("img")).toHaveLength(0);
  });
});
