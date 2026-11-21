import { cleanup, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AffiliateEditorialHero } from "@/components/affiliate-editorial-hero";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("C94: hero editorial creator-first com estado verdadeiro de inscrição", () => {
  it("destaca fotografia original Vonix, sem apresentar modelos como afiliadas", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<AffiliateEditorialHero recruitmentStatus="closed" />);
    const hero = screen.getByTestId("vonix-affiliate-hero");
    const editorial = screen.getByTestId("affiliate-c89-hair-editorial");
    const photo = screen.getByTestId("affiliate-c94-editorial-photo");

    expect(photo).toHaveAttribute("src", "/images/categorias/cachos.jpg");
    expect(photo).toHaveAttribute("width", "480");
    expect(photo).toHaveAttribute("height", "480");
    expect(photo).toHaveAttribute("loading", "eager");
    expect(photo).toHaveAttribute("fetchpriority", "high");
    expect(photo).toHaveAttribute("alt", expect.stringContaining("não identifica uma afiliada"));
    expect(editorial.className).toContain("min-h-[16rem]");
    expect(editorial.className).toContain("rounded-[1.75rem]");
    expect(editorial).toHaveTextContent("Movimento, textura e cuidado.");
    expect(editorial).toHaveTextContent("Não retrata afiliada nem comprova parceria.");
    expect(editorial).toHaveTextContent("Acervo editorial Vonix");
    expect(editorial.querySelectorAll("img")).toHaveLength(1);
    expect(within(hero).getAllByTestId("affiliate-c61-catalog-link")).toHaveLength(3);
    expect(hero).not.toHaveTextContent(
      /produto grátis ao se inscrever|15% no site|21% TikTok|cupom garantido/i,
    );
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it.each([
    ["open", "Candidaturas abertas para análise", "Quero ser afiliada Vonix"],
    ["loading", "Consultando disponibilidade de inscrição", "Conhecer a inscrição"],
    ["limited", "Inscrição temporariamente limitada nesta conexão", "Conhecer a inscrição"],
    [
      "unavailable",
      "Não foi possível consultar a disponibilidade das inscrições",
      "Conhecer a inscrição",
    ],
    [
      "closed",
      "Conheça o formulário enquanto as inscrições estão em preparação",
      "Conhecer a inscrição",
    ],
  ] as const)(
    "mostra %s antes do CTA e preserva o sinal de servidor",
    (state, copy, callToAction) => {
      render(<AffiliateEditorialHero recruitmentStatus={state} />);
      const hero = screen.getByTestId("vonix-affiliate-hero");
      const status = screen.getByTestId("affiliate-c94-intake-status");
      const action = within(hero).getByRole("link", { name: callToAction });
      expect(status).toHaveAttribute("role", "status");
      expect(status).toHaveAttribute("aria-live", "polite");
      expect(status).toHaveTextContent(copy);
      expect(
        status.compareDocumentPosition(action) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      expect(action).toHaveAttribute("href", "#inscricao");
      expect(hero).toHaveTextContent("8% sobre vendas após aprovação");
      expect(hero).toHaveTextContent("Inscrição gratuita");
      expect(within(hero).getByRole("link", { name: /Conhecer as condições/i })).toHaveAttribute(
        "href",
        "#ganhos",
      );
    },
  );

  it("mantém os três links de produtos, fonte oficial e avaliações honestas", () => {
    const { container } = render(<AffiliateEditorialHero recruitmentStatus="closed" />);
    const hero = screen.getByTestId("vonix-affiliate-hero");
    const gallery = screen.getByTestId("affiliate-c61-hero-catalog");
    const links = within(gallery).getAllByTestId("affiliate-c61-catalog-link");
    expect(links.map((x) => x.getAttribute("href"))).toEqual([
      "/produto/kit-banana-e-mel",
      "/produto/mascara-reparacao-nutri-repair",
      "/produto/botox-vonix",
    ]);
    expect(within(gallery).getByRole("link", { name: /Ver catálogo/i })).toHaveAttribute(
      "href",
      "/loja",
    );
    expect(within(hero).getByTestId("vonix-c83-gallery-next")).toBeDisabled();
    expect(
      within(hero).getByRole("link", { name: /avaliações de clientes no catálogo Vonix/i }),
    ).toHaveAttribute("href", "#avaliacoes-rapidas");
    expect(hero).toHaveTextContent("não são depoimentos de afiliadas");
    expect(container.querySelectorAll('a[href="#inscricao"]')).toHaveLength(1);
  });

  it("renderiza HTML inicial com foto, estado e CTA seguros sem carregamento externo", () => {
    const html = renderToStaticMarkup(<AffiliateEditorialHero recruitmentStatus="closed" />);
    const host = document.createElement("div");
    host.innerHTML = html;
    const photo = host.querySelector('[data-testid="affiliate-c94-editorial-photo"]');
    const status = host.querySelector('[data-testid="affiliate-c94-intake-status"]');
    const action = host.querySelector('a[href="#inscricao"]');
    expect(photo).not.toBeNull();
    expect(status).not.toBeNull();
    expect(action).not.toBeNull();
    expect(
      status?.compareDocumentPosition(action!) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(host.querySelectorAll('[data-testid="affiliate-c61-catalog-link"]')).toHaveLength(3);
    expect(host.querySelector('[data-testid="vonix-c83-gallery-next"]')).toBeDisabled();
    expect(host.querySelectorAll("form,iframe,video")).toHaveLength(0);
  });
});
