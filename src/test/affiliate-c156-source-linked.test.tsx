import type { ComponentType, ReactNode, AnchorHTMLAttributes } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const server = vi.hoisted(() => ({ status: vi.fn(), submit: vi.fn() }));
const analytics = vi.hoisted(() => ({ track: vi.fn() }));
vi.mock("@/lib/analytics", () => ({ track: analytics.track }));
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
  analytics.track.mockReset();
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
    expect(within(proof).getByTestId("affiliate-c157-review-count")).toHaveTextContent(
      "4 avaliações publicadas",
    );
    const reviewLink = within(proof).getByRole("link", { name: /Ver avaliações na loja oficial/ });
    expect(reviewLink).toHaveAttribute("target", "_blank");
    expect(reviewLink).toHaveAttribute("rel", "noopener noreferrer");
    fireEvent.click(reviewLink);
    expect(analytics.track).toHaveBeenCalledExactlyOnceWith("affiliate_review_source_open");
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
    expect(videos.querySelectorAll("img")).toHaveLength(6);
    expect(within(videos).getByTestId("affiliate-c157-video-count")).toHaveTextContent(
      "6 linhas · 15 vínculos",
    );
    expect(videos).toHaveTextContent("6 vídeos associados");
    expect(videos).toHaveTextContent("1 vídeo associado");
    const videoLinks = within(videos).getAllByRole("link");
    for (const link of videoLinks) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
    fireEvent.click(videoLinks[0]!);
    expect(analytics.track).toHaveBeenCalledWith("affiliate_catalog_source_open");
    expect(analytics.track.mock.calls.every((call) => call.length === 1)).toBe(true);
    for (const image of videos.querySelectorAll("img"))
      expect(image.getAttribute("src")).toMatch(/^\/images\/products\/[a-z0-9-]+-480\.webp$/);
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
