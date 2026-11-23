import { readFileSync } from "node:fs";
import type { ComponentType, ReactNode, AnchorHTMLAttributes } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/affiliate-functions", () => ({
  getAffiliateRecruitmentStatus: vi.fn().mockResolvedValue({ open: false }),
}));
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: { component: ComponentType }) => options,
  Link: ({
    children,
    to,
    ...rest
  }: { children: ReactNode; to: string } & AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}));
vi.mock("@/components/affiliate-shell", () => ({
  AffiliateShell: ({ children }: { children: ReactNode }) => <main>{children}</main>,
}));
vi.mock("@/lib/store", () => ({ SITE_URL: "https://vonixhair.com" }));
vi.mock("@/components/affiliate-simple-form", () => ({ AffiliateSimpleForm: () => null }));
import { AffiliateApplicationPage } from "@/routes/seja-afiliada";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("C117 — candidatura prioritária, prova autêntica e exploração opcional", () => {
  it("preserva a prova de produto e os requisitos antes do formulário, etapas e ideias depois", () => {
    const source = readFileSync("src/routes/seja-afiliada.tsx", "utf8");
    const tokens = [
      "<AffiliateLandingOffer", // Do not tie source-order check to formatting or extra safe-preview props.
      "<AffiliateCustomerVoiceTeaser />",
      'data-testid="vonix-c64-preparation-details"',
      'id="inscricao"',
      "<AffiliateSimpleForm",
      "<AffiliateNextSteps",
      "<AffiliateApplicationStepsPreview />",
      "<AffiliateCreatorSpotlight />",
      "<AffiliateLandingFAQ />",
    ];
    const positions = tokens.map((token) => source.indexOf(token));
    expect(positions.every((value) => value >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    expect(source.match(/<AffiliateSimpleForm\b/g)).toHaveLength(1);
    expect(source.match(/id="inscricao"/g)).toHaveLength(1);
    expect(source.match(/<AffiliateCustomerVoiceTeaser\s*\/>/g)).toHaveLength(1);
    expect(source.match(/<AffiliateApplicationStepsPreview\s*\/>/g)).toHaveLength(1);
    expect(source.match(/<AffiliateCreatorSpotlight\s*\/>/g)).toHaveLength(1);
  });

  it("mantém navegação contextual e conteúdo de fonte própria no fluxo", async () => {
    const blocked = vi.fn().mockRejectedValue(new Error("C117 blocks all external requests"));
    vi.stubGlobal("fetch", blocked);
    render(<AffiliateApplicationPage />);
    await screen.findByText("Inscrições em preparação");
    const proof = screen.getByTestId("affiliate-c101-customer-voice");
    const prep = screen.getByTestId("vonix-c64-preparation-details");
    const signup = document.getElementById("inscricao");
    const steps = screen.getByTestId("vonix-c66-application-steps");
    const creator = screen.getByTestId("affiliate-c100-creator-spotlight");
    const fullReviews = screen.getByTestId("vonix-c65-review-preview");
    if (!signup) throw Error("Missing application destination");
    const before = (a: Element, b: Element) =>
      Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
    expect(before(proof, prep)).toBe(true);
    expect(before(prep, signup)).toBe(true);
    expect(before(signup, steps)).toBe(true);
    expect(before(steps, creator)).toBe(true);
    expect(before(creator, fullReviews)).toBe(true);
    expect(screen.getByTestId("affiliate-c117-explore-steps")).toHaveAttribute(
      "href",
      "#candidatura-etapas",
    );
    expect(screen.getByTestId("affiliate-c112-form-status")).toHaveAttribute(
      "href",
      "/consultar-candidatura",
    );
    expect(proof).toHaveTextContent("Avaliações de produto, não depoimentos de afiliadas");
    expect(creator).toHaveTextContent("Nenhum estilo garante aprovação");
    expect(document.querySelectorAll("#inscricao")).toHaveLength(1);
    expect(document.querySelectorAll("#candidatura-etapas")).toHaveLength(1);
    expect([...document.querySelectorAll("[id]")].map((el) => el.id).length).toBe(
      new Set([...document.querySelectorAll("[id]")].map((el) => el.id)).size,
    );
    for (const args of blocked.mock.calls) {
      const init = args[1] as RequestInit | undefined;
      expect((init?.method || "GET").toUpperCase()).not.toBe("POST");
    }
  });
});
