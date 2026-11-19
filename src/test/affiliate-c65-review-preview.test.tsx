import type { ComponentType, ReactNode } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import reviews from "@/data/reviews.json";
import { AffiliateVerifiedReviewPreview } from "@/components/affiliate-verified-review-preview";

const server = vi.hoisted(() => ({ status: vi.fn() }));
vi.mock("@/lib/affiliate-functions", () => ({ getAffiliateRecruitmentStatus: server.status }));
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: { component: ComponentType }) => options,
  Link: ({ children }: { children: ReactNode }) => <a href="/">{children}</a>,
}));
vi.mock("@/components/affiliate-shell", () => ({
  AffiliateShell: ({ children }: { children: ReactNode }) => <main>{children}</main>,
}));
vi.mock("@/lib/store", () => ({ SITE_URL: "https://vonixhair.com" }));
vi.mock("@/components/affiliate-simple-form", () => ({
  AffiliateSimpleForm: ({ preview }: { preview: boolean }) => (
    <div data-testid="c65-form-mode">{preview ? "Prévia sem envio" : "Envio habilitado"}</div>
  ),
}));
import { AffiliateApplicationPage } from "@/routes/seja-afiliada";

beforeEach(() => {
  server.status.mockResolvedValue({ open: false });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  server.status.mockReset();
});

describe("C65 — compact published product reviews", () => {
  it.each(["Mariana Andrade", "Ayla Muniz"])(
    "derives %s's quote and poster from public JSON",
    (author) => {
      render(<AffiliateVerifiedReviewPreview />);
      const review = reviews.find((item) => item.author === author && item.slug === "botox-vonix");
      if (!review?.media.poster) throw new Error("Missing published review poster");
      const figure = screen.getByText(review.author).closest("figure");
      if (!figure) throw new Error("Missing review figure");
      expect(within(figure).getByText(`“${review.comment}”`)).toBeInTheDocument();
      expect(within(figure).getByRole("img")).toHaveAttribute("src", review.media.poster);
      expect(within(figure).getByRole("img")).toHaveAttribute(
        "alt",
        `Imagem de prévia da avaliação de ${review.author} sobre Botox Vonix`,
      );
    },
  );

  it("keeps honest product-only labeling, two quotes, local links and no media playback or submission", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const { container } = render(<AffiliateVerifiedReviewPreview />);
    expect(container.querySelectorAll("blockquote")).toHaveLength(2);
    expect(screen.getByText(/Não são depoimentos de afiliadas/)).toHaveTextContent(
      "não comprovam compra verificada, vendas, renda ou participação no programa",
    );
    expect(screen.getByRole("link", { name: "Ver avaliações completas" })).toHaveAttribute(
      "href",
      "#avaliacoes-produtos",
    );
    expect(screen.getByRole("link", { name: "Ver produto na loja" })).toHaveAttribute(
      "href",
      "/produto/botox-vonix",
    );
    expect(container.querySelector("video, audio, source, [autoplay], form")).toBeNull();
    expect(container.querySelector('[src$=".mp4"]')).toBeNull();
    expect(container.textContent).not.toMatch(/★|estrelas|nota 5/i);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("preserves C64 order and protected preview without candidate POST", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<AffiliateApplicationPage />);
    await screen.findByText("Inscrições em preparação");
    const signup = document.getElementById("inscricao");
    if (!signup) throw new Error("Missing application anchor");
    const sequence = [
      screen.getByTestId("vonix-affiliate-hero"),
      screen.getByTestId("vonix-affiliate-earnings"),
      screen.getByTestId("vonix-c65-review-preview"),
      screen.getByTestId("vonix-c64-preparation-details"),
      signup,
      screen.getByTestId("vonix-c53-real-product-reviews"),
    ];
    sequence.slice(0, -1).forEach((before, index) => {
      const after = sequence[index + 1];
      if (!after) throw new Error("Missing next section");
      expect(before.compareDocumentPosition(after) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });
    expect(document.querySelectorAll("#avaliacoes-produtos")).toHaveLength(1);
    expect(document.querySelectorAll("#inscricao")).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: /Visualizar formulário/ }));
    expect(screen.getByTestId("c65-form-mode")).toHaveTextContent("Prévia sem envio");
    expect(fetchSpy).not.toHaveBeenCalled();
  });
});
