import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AffiliateEditorialHero } from "@/components/affiliate-editorial-hero";
import { AffiliateApplicationStepsPreview } from "@/components/affiliate-application-steps-preview";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("C98 — abertura mobile compacta sem perder produtos nem etapas", () => {
  it("apresenta uma vitrine opcional mobile sem esconder os três links do HTML", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<AffiliateEditorialHero recruitmentStatus="closed" />);
    const hero = screen.getByTestId("vonix-affiliate-hero");
    const summary = within(hero).getByTestId("affiliate-c98-mobile-catalog-summary");
    const toggle = within(summary).getByRole("button", { name: /3 produtos do catálogo Vonix/i });
    const panel = within(hero).getByTestId("affiliate-c98-products-panel");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute("aria-controls", "affiliate-c98-products-panel");
    expect(panel).toHaveAttribute("id", "affiliate-c98-products-panel");
    expect(panel).toHaveClass("hidden", "lg:block");
    expect(summary.querySelector("img")).toHaveAttribute(
      "src",
      "/images/products/botox-vonix-480.webp",
    );
    expect(summary).toHaveTextContent("não fotografias de afiliadas");
    expect(within(panel).getAllByTestId("affiliate-c61-catalog-link")).toHaveLength(3);
    expect(within(panel).getByRole("region", { hidden: true })).toHaveAttribute("tabindex", "0");
    expect(within(hero).getByTestId("vonix-c78-real-review-cta")).toHaveAttribute(
      "href",
      "#avaliacoes-rapidas",
    );
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("abre e fecha a vitrine com botão nativo sem duplicar embalagens ou alterar inscrição", () => {
    render(<AffiliateEditorialHero recruitmentStatus="open" />);
    const hero = screen.getByTestId("vonix-affiliate-hero");
    const toggle = within(hero).getByTestId("affiliate-c98-mobile-catalog-toggle");
    const panel = within(hero).getByTestId("affiliate-c98-products-panel");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(panel).not.toHaveClass("hidden");
    expect(toggle).toHaveTextContent("Recolher vitrine");
    expect(panel.querySelectorAll('[data-testid="affiliate-c61-catalog-link"]')).toHaveLength(3);
    expect(within(hero).getByRole("link", { name: /Quero ser afiliada Vonix/i })).toHaveAttribute(
      "href",
      "#inscricao",
    );
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(panel).toHaveClass("hidden", "lg:block");
    expect(panel.querySelectorAll("img")).toHaveLength(3);
  });

  it.each([
    ["loading", "Consultando disponibilidade de inscrição"],
    ["closed", "Conheça o formulário enquanto as inscrições estão em preparação"],
    ["limited", "Inscrição temporariamente limitada nesta conexão"],
    ["unavailable", "Não foi possível consultar a disponibilidade das inscrições"],
    ["open", "Candidaturas abertas para análise"],
  ] as const)("mantém estado %s real e os termos responsáveis", (status, copy) => {
    render(<AffiliateEditorialHero recruitmentStatus={status} />);
    const hero = screen.getByTestId("vonix-affiliate-hero");
    expect(within(hero).getByRole("status")).toHaveTextContent(copy);
    expect(hero).toHaveTextContent("8% sobre vendas após aprovação");
    expect(hero).toHaveTextContent("A candidatura não garante aprovação");
    expect(within(hero).getByRole("link", { name: /Conhecer as condições/i })).toHaveAttribute(
      "href",
      "#ganhos",
    );
    expect(within(hero).getByTestId("affiliate-c98-mobile-catalog-toggle")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });

  it("mantém textos e fotos verdadeiras das três etapas num formato menor em mobile", () => {
    const { container } = render(<AffiliateApplicationStepsPreview />);
    const section = screen.getByTestId("vonix-c66-application-steps");
    const cards = within(section).getAllByTestId("vonix-c79-step-card");
    expect(cards).toHaveLength(3);
    expect(section).toHaveTextContent("Apresente seu perfil gratuitamente");
    expect(section).toHaveTextContent("Se o envio for confirmado, guarde o código");
    expect(section).toHaveTextContent("Consulte o andamento pelo código");
    expect(section).toHaveTextContent("TikTok é opcional");
    expect(section).toHaveTextContent(/não é preciso comprar produtos/i);
    for (const card of cards) {
      const img = within(card).getByRole("img");
      expect(img.closest("div")).toHaveClass("h-20", "sm:h-36");
      expect(img).toHaveAttribute("loading", "lazy");
      expect(img.getAttribute("src")).toMatch(/^\/images\/products\/.+\.webp$/);
    }
    expect(container.querySelectorAll("form, input, video, audio, [autoplay]")).toHaveLength(0);
  });

  it("gera SSR com três produtos oficiais, sem publicar imagens de criadoras fictícias", () => {
    const html = renderToStaticMarkup(
      <>
        <AffiliateEditorialHero recruitmentStatus="closed" />
        <AffiliateApplicationStepsPreview />
      </>,
    );
    const host = document.createElement("div");
    host.innerHTML = html;
    const panel = host.querySelector("#affiliate-c98-products-panel");
    expect(panel).not.toBeNull();
    expect(panel?.querySelectorAll('[data-testid="affiliate-c61-catalog-link"]')).toHaveLength(3);
    expect(
      host.querySelectorAll('[data-testid="affiliate-c98-mobile-catalog-toggle"]'),
    ).toHaveLength(1);
    expect(host.querySelectorAll('[data-testid="vonix-c79-step-card"]')).toHaveLength(3);
    expect(host.querySelector("#vonix-affiliate-title")).toHaveTextContent(
      "Seja afiliada Vonix Hair.",
    );
    expect(host.querySelectorAll("form")).toHaveLength(0);
  });
});
