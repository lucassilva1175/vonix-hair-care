import { readFileSync } from "node:fs";
import type { ComponentType, ReactNode, AnchorHTMLAttributes } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/affiliate-functions", () => ({
  getAffiliateRecruitmentStatus: vi.fn().mockResolvedValue({ open: false }),
}));
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: { component: ComponentType }) => options,
  Link: ({
    children,
    to,
    ...props
  }: {
    children: ReactNode;
    to: string;
  } & AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));
vi.mock("@/components/affiliate-shell", () => ({
  AffiliateShell: ({ children }: { children: ReactNode }) => <main>{children}</main>,
}));
vi.mock("@/lib/store", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/store")>()),
  SITE_URL: "https://vonixhair.com",
}));
vi.mock("@/components/affiliate-simple-form", () => ({
  AffiliateSimpleForm: () => null,
}));
import { AffiliateApplicationPage } from "@/routes/seja-afiliada";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("C119 — requisitos acolhedores sem promessa de aprovação", () => {
  it("mantém um único guia nativo antes de uma única inscrição, sem nova coleta", () => {
    const source = readFileSync("src/routes/seja-afiliada.tsx", "utf8");
    expect(source.match(/data-testid="vonix-c64-preparation-details"/g)).toHaveLength(1);
    expect(source.match(/data-testid="affiliate-c119-clarity-summary"/g)).toHaveLength(1);
    expect(source.indexOf('data-testid="affiliate-c119-clarity-summary"')).toBeLessThan(
      source.indexOf('id="inscricao"'),
    );
    expect(source.match(/<AffiliateApplicationPrep\b/g)).toHaveLength(1);
    expect(source.match(/id="inscricao"/g)).toHaveLength(1);
    expect(source).not.toContain("aprovação garantida");
  });

  it("mostra elegibilidade e portfólio dispensado sem esconder requisitos na abertura", async () => {
    const network = vi.fn();
    vi.stubGlobal("fetch", network);
    render(<AffiliateApplicationPage />);
    await screen.findByText("Inscrições em preparação");
    const panel = screen.getByTestId("vonix-c64-preparation-details") as HTMLDetailsElement;
    const summary = within(panel).getByTestId("affiliate-c119-clarity-summary");
    expect(panel.open).toBe(false);
    expect(summary).toHaveTextContent("Não precisa ter portfólio para se candidatar");
    expect(summary).toHaveTextContent("18 anos ou mais");
    expect(summary).toHaveTextContent("Instagram");
    expect(summary).toHaveTextContent("TikTok opcional");
    expect(panel).not.toHaveAttribute("open");
    fireEvent.click(summary);
    expect(panel.open).toBe(true);
    expect(within(panel).getByTestId("affiliate-c54-preparation")).toHaveTextContent(
      "Nome completo, e-mail válido e telefone com DDD",
    );
    expect(within(panel).getByTestId("affiliate-c54-preparation")).toHaveTextContent(
      "CEP, rua, número, bairro, cidade e estado",
    );
    expect(within(panel).getByTestId("affiliate-c54-preparation")).toHaveTextContent(
      "Não é necessário criar um portfólio",
    );
    fireEvent.click(summary);
    expect(panel.open).toBe(false);
    expect(screen.getByTestId("affiliate-c112-form-essentials")).toHaveTextContent(
      "18 anos ou mais",
    );
    expect(document.querySelectorAll("#inscricao")).toHaveLength(1);
    expect(network).not.toHaveBeenCalled();
  });

  it("preserva avaliações de produto e a indisponibilidade real sem sugerir aceite", async () => {
    render(<AffiliateApplicationPage />);
    await screen.findByText("Inscrições em preparação");
    expect(screen.getByTestId("affiliate-c101-customer-voice")).toHaveTextContent(
      "não relatos de afiliadas",
    );
    expect(screen.getByTestId("affiliate-c94-intake-status")).toHaveTextContent(
      "inscrições estão em preparação",
    );
    expect(screen.getByTestId("affiliate-c117-explore-steps")).toHaveAttribute(
      "href",
      "#candidatura-etapas",
    );
  });
});
