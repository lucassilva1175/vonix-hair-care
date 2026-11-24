import type { ComponentType, ReactNode, AnchorHTMLAttributes } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const server = vi.hoisted(() => ({ status: vi.fn(), submit: vi.fn() }));
vi.mock("@/lib/affiliate-functions", () => ({
  getAffiliateRecruitmentStatus: server.status,
  submitAffiliateApplication: server.submit,
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
vi.mock("@/lib/store", async (original) => ({
  ...(await original<typeof import("@/lib/store")>()),
  SITE_URL: "https://vonixhair.com",
}));
vi.mock("@/components/affiliate-simple-form", () => ({
  AffiliateSimpleForm: ({ preview }: { preview: boolean }) => (
    <div data-testid="c156-form">{preview ? "Simulação protegida" : "Inscrição real"}</div>
  ),
}));
import { AffiliateApplicationPage, Route } from "@/routes/seja-afiliada";
const forbidden =
  /\/depoimentos\/|\/provas\/|review-depoimento-|Mariana Andrade|Ayla Muniz|Fernanda Assis|Ana Paula/;
beforeEach(() => {
  server.status.mockReset().mockResolvedValue({ open: false });
  server.submit.mockReset();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  window.history.replaceState(null, "", window.location.pathname);
});
describe("C156 public source-linked media release", () => {
  it("uses source links in the actual route and SSR, including forged query flags", async () => {
    const Component = (Route as unknown as { component: ComponentType }).component;
    window.history.replaceState(
      null,
      "",
      "/seja-afiliada?sourceLinked=false&media=embedded#avaliacoes-rapidas",
    );
    const html = renderToStaticMarkup(<Component />);
    expect(html).not.toMatch(forbidden);
    const { container } = render(<Component />);
    await screen.findByText("Inscrições em preparação");
    const proof = screen.getByTestId("affiliate-c156-source-teaser");
    const form = container.querySelector("#inscricao")!;
    expect(proof.compareDocumentPosition(form) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(
      within(proof).getByRole("link", { name: /Ver avaliações na loja oficial/ }),
    ).toHaveAttribute("href", "/produto/botox-vonix");
    expect(proof).toHaveTextContent("não depoimentos de afiliadas");
    for (const id of [
      "inscricao",
      "avaliacoes-rapidas",
      "avaliacoes-produtos",
      "catalogo-em-video",
    ])
      expect(container.querySelectorAll("#" + id)).toHaveLength(1);
    const gate = screen.getByTestId("affiliate-c96-discovery-gate") as HTMLDetailsElement;
    fireEvent.click(screen.getByTestId("affiliate-c152-video-link"));
    expect(gate.open).toBe(true);
    const videos = screen.getByTestId("affiliate-c156-source-videos");
    expect(within(videos).getAllByRole("link")).toHaveLength(6);
    for (const link of within(videos).getAllByRole("link"))
      expect(link.getAttribute("href")).toMatch(/^\/produto\/[a-z0-9-]+$/);
    expect(container.innerHTML).not.toMatch(forbidden);
    expect(container.querySelectorAll("video,iframe,blockquote")).toHaveLength(0);
    expect(server.submit).not.toHaveBeenCalled();
  });
  it("keeps safe preview fail-closed and does not submit or change intake", async () => {
    render(<AffiliateApplicationPage />);
    await screen.findByText("Inscrições em preparação");
    fireEvent.click(screen.getByTestId("affiliate-c122-safe-preview"));
    expect(await screen.findByTestId("c156-form")).toHaveTextContent("Simulação protegida");
    expect(server.submit).not.toHaveBeenCalled();
  });
  it("retains a real intake CTA when the backend confirms open", async () => {
    server.status.mockResolvedValue({ open: true });
    render(<AffiliateApplicationPage />);
    expect(await screen.findByTestId("c156-form")).toHaveTextContent("Inscrição real");
    expect(screen.getByRole("link", { name: /Quero ser afiliada Vonix/ })).toHaveAttribute(
      "href",
      "#inscricao",
    );
    expect(server.submit).not.toHaveBeenCalled();
  });
});
