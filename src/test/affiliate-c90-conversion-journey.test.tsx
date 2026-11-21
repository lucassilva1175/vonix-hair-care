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
  it("mantém o resumo de três momentos, âncoras e detalhes sem repetir o módulo longo", () => {
    const { container } = render(
      <>
        <AffiliateApplicationStepsPreview />
        <AffiliateLandingIntro recruitmentStatus="closed" />
        <section id="inscricao">Inscrição segura</section>
      </>,
    );
    const journey = screen.getByTestId("affiliate-c90-compact-journey");
    expect(journey).toHaveAttribute("id", "como-funciona");
    expect(within(journey).getByRole("heading", { name: /Três momentos/i })).toBeInTheDocument();
    expect(within(journey).getAllByRole("listitem")).toHaveLength(3);
    for (const title of ["Apresente seu perfil", "Análise individual", "Próximos passos"]) {
      expect(within(journey).getByRole("heading", { name: title })).toBeInTheDocument();
    }
    expect(
      within(journey).getByRole("link", { name: /Ver o passo a passo completo/i }),
    ).toHaveAttribute("href", "#candidatura-etapas");
    expect(within(journey).getByRole("link", { name: /Ver disponibilidade/i })).toHaveAttribute(
      "href",
      "#inscricao",
    );
    expect(container.querySelectorAll("#como-funciona")).toHaveLength(1);
    expect(container.querySelectorAll("#candidatura-etapas")).toHaveLength(1);
    expect(container.querySelectorAll("#inscricao")).toHaveLength(1);
    expect(journey).toHaveTextContent("sem promessa de aprovação");
    expect(journey).not.toHaveTextContent(/cupom garantido|15%|21%|ganhos garantidos/i);
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
