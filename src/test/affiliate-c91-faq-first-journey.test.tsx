import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

const server = vi.hoisted(() => ({ status: vi.fn() }));
vi.mock("@/lib/affiliate-functions", () => ({
  getAffiliateRecruitmentStatus: server.status,
}));
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: { component: React.ComponentType }) => options,
  Link: ({ to, children, ...props }: React.PropsWithChildren<{ to: string }>) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));
vi.mock("@/components/affiliate-shell", () => ({
  AffiliateShell: ({ children }: React.PropsWithChildren) => <main>{children}</main>,
}));
vi.mock("@/lib/store", () => ({ SITE_URL: "https://vonixhair.com" }));
vi.mock("@/components/affiliate-simple-form", () => ({
  AffiliateSimpleForm: () => <div data-testid="c91-form-boundary" />,
}));

import { AffiliateApplicationPage } from "@/routes/seja-afiliada";
import { AffiliateLandingFAQ } from "@/components/affiliate-landing";

beforeEach(() => {
  vi.resetAllMocks();
  server.status.mockResolvedValue({ open: false });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("C91: perguntas da candidatura antes de conteúdo editorial opcional", () => {
  it("servidor entrega busca e filtros inertes até React conectar os eventos", () => {
    const html = renderToStaticMarkup(<AffiliateLandingFAQ />);
    const root = document.createElement("div");
    root.innerHTML = html;
    const search = root.querySelector("#vonix-c84-faq-search");
    expect(search).not.toBeNull();
    expect(search).toBeDisabled();
    expect(
      root.querySelectorAll('[data-testid="vonix-c84-faq-discovery"] button:disabled'),
    ).toHaveLength(3);
    expect(root.querySelectorAll("details")).toHaveLength(7);
  });

  it("mantém inscrição → próximos passos → FAQ → exploração → Discovery, com todos os links", () => {
    const { container } = render(<AffiliateApplicationPage />);
    const signup = container.querySelector("#inscricao");
    const next = screen.getByTestId("affiliate-c55-next-steps");
    const faq = container.querySelector("#duvidas");
    const guide = screen.getByTestId("affiliate-c91-explore-paths");
    const discovery = screen.getByTestId("vonix-c64-discovery");
    if (!signup || !faq) throw new Error("C91 missing essential form/FAQ sections");
    for (const [a, b] of [
      [signup, next],
      [next, faq],
      [faq, guide],
      [guide, discovery],
    ] as const) {
      expect(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
    expect(faq.querySelectorAll("details")).toHaveLength(7);
    expect(guide).toHaveTextContent("Avaliações são de clientes sobre produtos");
    expect(guide).toHaveTextContent("não relatos de afiliadas aprovadas");
    const destination = [
      ["Avaliações de produtos", "#avaliacoes-produtos"],
      ["Vídeos do catálogo", "#catalogo-em-video"],
      ["Ideias de conteúdo", "#perfis"],
    ] as const;
    for (const [name, href] of destination) {
      expect(within(guide).getByRole("link", { name })).toHaveAttribute("href", href);
      expect(container.querySelectorAll('[id="' + href.slice(1) + '"]')).toHaveLength(1);
    }
    expect(container.querySelectorAll("#duvidas")).toHaveLength(1);
    expect(container.querySelectorAll("#inscricao")).toHaveLength(1);
    expect(guide.querySelectorAll("input,button,form,video,img")).toHaveLength(0);
  });

  it("FAQ mantém descoberta local por termo e conteúdo de inscrição gratuita", () => {
    const { container } = render(<AffiliateApplicationPage />);
    const faq = container.querySelector("#duvidas");
    if (!(faq instanceof HTMLElement)) throw new Error("Missing HTML FAQ");
    const find = within(faq).getByRole("searchbox", { name: "Encontre sua resposta" });
    const all = faq.querySelectorAll("details");
    expect(all).toHaveLength(7);
    expect(faq.textContent).toContain("Preciso comprar algum produto para me inscrever?");
    fireEvent.change(find, { target: { value: "TikTok" } });
    expect(faq.querySelectorAll("details").length).toBeGreaterThan(0);
    expect(faq.querySelectorAll("details").length).toBeLessThan(7);
    expect(faq.textContent).toContain(
      "A busca acontece nesta página, sem enviar os termos digitados.",
    );
    fireEvent.change(find, { target: { value: "" } });
    expect(faq.querySelectorAll("details")).toHaveLength(7);
  });

  it("continua apresentando caminho real e não inventa benefícios do programa", () => {
    render(<AffiliateApplicationPage />);
    const guide = screen.getByTestId("affiliate-c91-explore-paths");
    const catalog = screen.getByTestId("vonix-c53-real-product-reviews");
    expect(guide.compareDocumentPosition(catalog) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(catalog).toHaveTextContent("Não são depoimentos de afiliadas");
    expect(guide.textContent).not.toMatch(
      /ganhos garantidos|cupom garantido|aprovadas participam|15%|21%/i,
    );
    expect(
      screen.getByRole("heading", { name: /Sua inscrição, de um jeito simples/i }),
    ).toBeInTheDocument();
  });
});
