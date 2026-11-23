import { cleanup, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  AffiliateEditorialHero,
  type RecruitmentStatus,
} from "@/components/affiliate-editorial-hero";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("C123 — CTA editorial na primeira dobra do desktop", () => {
  it("compacta somente o desktop e preserva a fotografia, status e âncora única", () => {
    const { container } = render(<AffiliateEditorialHero recruitmentStatus="loading" />);
    const hero = screen.getByTestId("vonix-affiliate-hero");
    const photo = within(hero).getByTestId("affiliate-c89-hair-editorial");
    const title = within(hero).getByRole("heading", { level: 1 });
    const status = within(hero).getByTestId("affiliate-c94-intake-status");
    const cta = within(hero).getByRole("link", { name: "Conhecer a inscrição" });
    expect(hero).toHaveClass("py-5", "sm:py-8", "lg:py-10");
    expect(photo).toHaveClass("min-h-[16rem]", "sm:min-h-[19rem]", "lg:min-h-[25rem]");
    expect(title).toHaveClass(
      "text-[clamp(2.1rem,5vw,4.25rem)]",
      "sm:text-[clamp(2.5rem,5vw,4.25rem)]",
      "lg:text-[clamp(2.75rem,3.7vw,3.6rem)]",
    );
    expect(title.parentElement).toHaveClass("max-w-[28rem]", "lg:max-w-[34rem]");
    expect(status).toHaveClass("order-2", "lg:order-3", "lg:mt-3", "lg:mb-0");
    expect(status).toHaveAttribute("role", "status");
    expect(status).toHaveTextContent("Consultando disponibilidade");
    expect(cta.closest("div")).toHaveClass("order-3", "lg:order-4", "lg:mt-2");
    expect(cta).toHaveAttribute("href", "#inscricao");
    expect(status.compareDocumentPosition(cta) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(
      container.querySelectorAll('[data-testid="vonix-affiliate-hero"] a[href="#inscricao"]'),
    ).toHaveLength(1);
    expect(within(hero).getByTestId("affiliate-c94-editorial-photo")).toHaveAttribute(
      "src",
      "/images/categorias/cachos.jpg",
    );
    expect(hero).toHaveTextContent("Foto editorial do catálogo da loja");
    expect(hero).toHaveTextContent("Não retrata afiliada nem comprova parceria.");
  });

  it.each([
    ["open", "Quero ser afiliada Vonix", "Candidaturas abertas para análise"],
    [
      "closed",
      "Conhecer a inscrição",
      "Conheça o formulário enquanto as inscrições estão em preparação",
    ],
    ["limited", "Conhecer a inscrição", "Inscrição temporariamente limitada nesta conexão"],
    [
      "unavailable",
      "Conhecer a inscrição",
      "Não foi possível consultar a disponibilidade das inscrições",
    ],
    ["loading", "Conhecer a inscrição", "Consultando disponibilidade de inscrição"],
  ] as const)("conserva o CTA e o status verdadeiro no modo %s", (state, label, statusText) => {
    render(<AffiliateEditorialHero recruitmentStatus={state as RecruitmentStatus} />);
    const hero = screen.getByTestId("vonix-affiliate-hero");
    expect(within(hero).getByRole("link", { name: label })).toHaveAttribute("href", "#inscricao");
    expect(within(hero).getByTestId("affiliate-c94-intake-status")).toHaveTextContent(statusText);
    expect(hero).toHaveTextContent("Vendas elegíveis e confirmadas");
    expect(hero).toHaveTextContent("A candidatura não garante aprovação");
  });

  it("SSR conserva uma única CTA, H1, imagem de catálogo real e nenhuma ação de envio", () => {
    const markup = renderToStaticMarkup(<AffiliateEditorialHero recruitmentStatus="loading" />);
    const root = document.createElement("main");
    root.innerHTML = markup;
    expect(root.querySelectorAll("#vonix-affiliate-title")).toHaveLength(1);
    expect(root.querySelectorAll('a[href="#inscricao"]')).toHaveLength(1);
    expect(root.querySelectorAll('[data-testid="affiliate-c94-editorial-photo"]')).toHaveLength(1);
    expect(root.querySelectorAll('[data-testid="affiliate-c61-catalog-link"]')).toHaveLength(3);
    expect(root.querySelectorAll("form,input,video,iframe,[autoplay]")).toHaveLength(0);
    expect(markup).toContain("Inscrição gratuita");
    expect(markup).not.toMatch(
      /renda garantida|afiliação automática|produto grátis ao se inscrever/i,
    );
  });
});
