import { cleanup, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AffiliateLandingOffer } from "@/components/affiliate-landing";

const server = vi.hoisted(() => ({ status: vi.fn() }));
vi.mock("@/lib/affiliate-functions", () => ({ getAffiliateRecruitmentStatus: server.status }));
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
vi.mock("@/lib/store", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/store")>()),
  SITE_URL: "https://vonixhair.com",
}));
vi.mock("@/components/affiliate-simple-form", () => ({
  AffiliateSimpleForm: () => <div data-testid="c97-form-boundary" />,
}));

import { AffiliateApplicationPage } from "@/routes/seja-afiliada";

beforeEach(() => {
  vi.resetAllMocks();
  server.status.mockResolvedValue({ open: false });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("C97: candidatura antes de galerias e das condições completas", () => {
  it("mantém formulário e próximos passos antes das explorações, FAQ e ganhos detalhados", () => {
    const { container } = render(<AffiliateApplicationPage />);
    const hero = screen.getByTestId("vonix-affiliate-hero");
    const facts = screen.getByTestId("affiliate-c61-eligibility-facts");
    const steps = screen.getByTestId("vonix-c66-application-steps");
    const creator = screen.getByTestId("affiliate-c100-creator-spotlight");
    const form = container.querySelector("#inscricao");
    const next = screen.getByTestId("affiliate-c55-next-steps");
    const faq = container.querySelector("#duvidas");
    const reviews = screen.getByTestId("vonix-c65-review-preview");
    const earnings = screen.getByTestId("vonix-affiliate-earnings");
    const guide = screen.getByTestId("affiliate-c91-explore-paths");
    const gate = screen.getByTestId("affiliate-c96-discovery-gate");
    if (!form || !faq) throw new Error("C97 essential form/FAQ not rendered");
    for (const [a, b] of [
      [hero, facts],
      [facts, form],
      [next, steps],
      [form, next],
      [steps, creator],
      [creator, faq],
      [faq, reviews],
      [reviews, earnings],
      [earnings, guide],
      [guide, gate],
    ] as const) {
      expect(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    }
    expect(faq.querySelectorAll("details")).toHaveLength(7);
    expect(screen.getByTestId("vonix-c97-offer-details")).toContainElement(earnings);
    expect(screen.getByTestId("vonix-c64-early-offer")).not.toContainElement(earnings);
  });

  it("conserva os benefícios reais, 4 avaliações distintas e todos os destinos originais", () => {
    const { container } = render(<AffiliateApplicationPage />);
    const hero = screen.getByTestId("vonix-affiliate-hero");
    const details = screen.getByTestId("vonix-c97-offer-details");
    const cards = within(details).getAllByTestId("vonix-c72-review-card");
    expect(cards).toHaveLength(4);
    expect(within(details).getAllByTestId("vonix-c77-benefit-editorial")).toHaveLength(3);
    expect(within(details).getByText("Comissão de 8% em cada venda")).toBeInTheDocument();
    expect(within(details).getByText("Bônus a cada R$ 10 mil vendidos")).toBeInTheDocument();
    expect(details).toHaveTextContent("Sobre vendas confirmadas e pagas");
    expect(details).toHaveTextContent("Não há promoção automática");
    expect(hero).toHaveTextContent("8% sobre vendas após aprovação");
    expect(hero).toHaveTextContent("A candidatura não garante aprovação");
    for (const id of [
      "inscricao",
      "duvidas",
      "avaliacoes-rapidas",
      "ganhos",
      "avaliacoes-produtos",
      "perfis",
    ]) {
      expect(container.querySelectorAll("#" + id)).toHaveLength(1);
    }
    expect(within(hero).getByRole("link", { name: /Conhecer as condições/i })).toHaveAttribute(
      "href",
      "#ganhos",
    );
    expect(within(hero).getByTestId("vonix-c78-real-review-cta")).toHaveAttribute(
      "href",
      "#avaliacoes-rapidas",
    );
    expect(details.textContent).not.toMatch(
      /Skence|15%|21%|ganhos garantidos|aprovadas participaram/i,
    );
  });

  it("preserva oferta completa em uso standalone e separa blocos sem duplicações", () => {
    const { unmount } = render(<AffiliateLandingOffer recruitmentStatus="closed" />);
    expect(screen.getByTestId("vonix-affiliate-hero")).toBeInTheDocument();
    expect(screen.getByTestId("vonix-affiliate-earnings")).toBeInTheDocument();
    expect(screen.getByTestId("vonix-c65-review-preview")).toBeInTheDocument();
    unmount();
    const { container } = render(
      <>
        <AffiliateLandingOffer recruitmentStatus="closed" placement="intro" />
        <AffiliateLandingOffer recruitmentStatus="closed" placement="details" />
      </>,
    );
    expect(container.querySelectorAll('[data-testid="vonix-affiliate-hero"]')).toHaveLength(1);
    expect(container.querySelectorAll("#ganhos")).toHaveLength(1);
    expect(container.querySelectorAll("#avaliacoes-rapidas")).toHaveLength(1);
    expect(container.querySelectorAll('[data-testid="vonix-c77-benefit-editorial"]')).toHaveLength(
      3,
    );
  });

  it("entrega HTML inicial com H1, regras e fonte oficial sem submissão externa", () => {
    const html = renderToStaticMarkup(<AffiliateApplicationPage />);
    const host = document.createElement("div");
    host.innerHTML = html;
    const hero = host.querySelector("#vonix-affiliate-title");
    const form = host.querySelector("#inscricao");
    const earning = host.querySelector("#ganhos");
    const faq = host.querySelector("#duvidas");
    if (!hero || !form || !earning || !faq) throw new Error("C97 missing initial SSR sections");
    expect(hero.compareDocumentPosition(form) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(form.compareDocumentPosition(faq) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(faq.compareDocumentPosition(earning) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(host.querySelector('[data-testid="affiliate-c96-discovery-gate"]')).not.toHaveAttribute(
      "open",
    );
    expect(host.querySelectorAll("form")).toHaveLength(0);
    expect(host.querySelectorAll("#ganhos")).toHaveLength(1);
  });
});
