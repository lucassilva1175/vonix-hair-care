import { cleanup, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AffiliateEditorialHero } from "@/components/affiliate-editorial-hero";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("C109 — primeira dobra compacta do portal, sem apagar termos", () => {
  it("usa fotografia original e reduz somente altura/espacamento mobile, mantendo desktop", () => {
    const network = vi.spyOn(globalThis, "fetch");
    render(<AffiliateEditorialHero recruitmentStatus="closed" />);
    const hero = screen.getByTestId("vonix-affiliate-hero");
    const visual = within(hero).getByTestId("affiliate-c89-hair-editorial");
    const photo = within(hero).getByTestId("affiliate-c94-editorial-photo");
    const heading = within(hero).getByRole("heading", { level: 1 });
    expect(hero).toHaveClass("py-5", "sm:py-8", "lg:py-10");
    expect(visual).toHaveClass("min-h-[16rem]", "sm:min-h-[19rem]", "lg:min-h-[25rem]");
    expect(visual).toHaveClass("rounded-[1.6rem]", "lg:rounded-[1.8rem]");
    expect(photo).toHaveAttribute("src", "/images/categorias/cachos.jpg");
    expect(photo).toHaveAttribute("loading", "eager");
    expect(photo).toHaveAttribute("alt", expect.stringContaining("não identifica uma afiliada"));
    expect(heading).toHaveAttribute("id", "vonix-affiliate-title");
    expect(heading).toHaveClass(
      "text-[clamp(2.1rem,5vw,4.25rem)]",
      "sm:text-[clamp(2.5rem,5vw,4.25rem)]",
    );
    expect(visual).toHaveTextContent("Não retrata afiliada nem comprova parceria.");
    expect(network).not.toHaveBeenCalled();
  });

  it("expõe a candidatura e a situação real antes dos atalhos secundarios", () => {
    render(<AffiliateEditorialHero recruitmentStatus="closed" />);
    const hero = screen.getByTestId("vonix-affiliate-hero");
    const status = within(hero).getByTestId("affiliate-c94-intake-status");
    const action = within(hero).getByRole("link", { name: "Conhecer a inscrição" });
    expect(status).toHaveAttribute("role", "status");
    expect(status).toHaveAttribute("aria-live", "polite");
    expect(status).toHaveTextContent("inscrições estão em preparação");
    expect(status.compareDocumentPosition(action) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(action).toHaveAttribute("href", "#inscricao");
    expect(within(hero).getByRole("link", { name: /Conhecer as condições/ })).toHaveAttribute(
      "href",
      "#ganhos",
    );
    expect(within(hero).getByRole("link", { name: /Entenda as três etapas/ })).toHaveAttribute(
      "href",
      "#candidatura-etapas",
    );
    expect(hero).toHaveTextContent("8% sobre vendas após aprovação");
    expect(hero).toHaveTextContent("Sem estoque próprio");
    expect(hero).toHaveTextContent("Inscrição gratuita");
    expect(hero).toHaveTextContent("A candidatura não garante aprovação");
    expect(hero).toHaveTextContent("nem compra de produtos para se candidatar");
  });

  it("preserva as fotos oficiais e a prova social REAL de produtos sem sugerir endosso de afiliadas", () => {
    const { container } = render(<AffiliateEditorialHero recruitmentStatus="closed" />);
    const hero = screen.getByTestId("vonix-affiliate-hero");
    const gallery = within(hero).getByTestId("affiliate-c61-hero-catalog");
    expect(
      within(gallery)
        .getAllByTestId("affiliate-c61-catalog-link")
        .map((link) => link.getAttribute("href")),
    ).toEqual([
      "/produto/kit-banana-e-mel",
      "/produto/mascara-reparacao-nutri-repair",
      "/produto/botox-vonix",
    ]);
    const galleryControl = within(gallery).getByTestId("affiliate-c98-mobile-catalog-toggle");
    expect(galleryControl).toHaveAttribute("aria-expanded", "false");
    expect(galleryControl).toHaveAttribute("aria-controls", "affiliate-c98-products-panel");
    expect(
      within(gallery).getByRole("link", { name: /avaliações de clientes no catálogo Vonix/ }),
    ).toHaveAttribute("href", "#avaliacoes-rapidas");
    expect(gallery).toHaveTextContent("não são depoimentos de afiliadas");
    expect(container.querySelectorAll("form,iframe,video, [autoplay]")).toHaveLength(0);
    expect(hero).not.toHaveTextContent(
      /renda garantida|parceria automática|produto grátis ao se inscrever/i,
    );
  });

  it.each([
    ["open", "Candidaturas abertas para análise", "Quero ser afiliada Vonix"],
    [
      "closed",
      "Conheça o formulário enquanto as inscrições estão em preparação",
      "Conhecer a inscrição",
    ],
    ["limited", "Inscrição temporariamente limitada nesta conexão", "Conhecer a inscrição"],
    [
      "unavailable",
      "Não foi possível consultar a disponibilidade das inscrições",
      "Conhecer a inscrição",
    ],
    ["loading", "Consultando disponibilidade de inscrição", "Conhecer a inscrição"],
  ] as const)(
    "mantém status %s fiel à resposta e nunca inventa abertura",
    (state, label, action) => {
      render(<AffiliateEditorialHero recruitmentStatus={state} />);
      expect(screen.getByTestId("affiliate-c94-intake-status")).toHaveTextContent(label);
      expect(screen.getByRole("link", { name: action })).toHaveAttribute("href", "#inscricao");
    },
  );

  it("SSR da primeira tela apresenta H1, foto, estado e uma chamada de inscrição sem POST", () => {
    const html = renderToStaticMarkup(<AffiliateEditorialHero recruitmentStatus="loading" />);
    const root = document.createElement("div");
    root.innerHTML = html;
    expect(root.querySelectorAll("#vonix-affiliate-title")).toHaveLength(1);
    expect(root.querySelectorAll('[data-testid="affiliate-c94-editorial-photo"]')).toHaveLength(1);
    expect(root.querySelectorAll('[data-testid="affiliate-c94-intake-status"]')).toHaveLength(1);
    expect(root.querySelectorAll('a[href="#inscricao"]')).toHaveLength(1);
    expect(root.querySelectorAll('[data-testid="affiliate-c61-catalog-link"]')).toHaveLength(3);
    expect(root.querySelectorAll("form,input,iframe,video")).toHaveLength(0);
    expect(root.textContent).toContain("Inscrição gratuita");
  });
});
