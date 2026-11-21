import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import reviews from "@/data/reviews.json";
import { AffiliateProductProof } from "@/components/affiliate-product-proof";
import { AffiliateVerifiedReviewPreview } from "@/components/affiliate-verified-review-preview";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.history.replaceState(null, "", window.location.pathname + window.location.search);
});

const productReviews = reviews.filter((review) => review.slug === "botox-vonix");

describe("C93: quatro avaliações genuínas sem exposição duplicada", () => {
  it("entrega HTML acessível com quatro comentários completos inicialmente recolhidos", () => {
    const html = renderToStaticMarkup(<AffiliateProductProof />);
    const host = document.createElement("div");
    host.innerHTML = html;
    const section = host.querySelector("#avaliacoes-produtos");
    const details = host.querySelector<HTMLDetailsElement>(
      '[data-testid="affiliate-c93-review-disclosure"]',
    );
    expect(section).not.toBeNull();
    expect(details).not.toBeNull();
    expect(details?.open).toBe(false);
    expect(details?.querySelector("summary")).toHaveTextContent("Ver as 4 avaliações completas");
    expect(details?.querySelector("summary")).toHaveTextContent("não oito depoimentos diferentes");
    expect(productReviews).toHaveLength(4);
    expect(details?.querySelectorAll("blockquote")).toHaveLength(4);
    expect(details?.querySelectorAll("video")).toHaveLength(3);
    expect(details?.querySelectorAll('[data-testid="affiliate-c86-customer-photo"]')).toHaveLength(
      1,
    );
    expect(host.querySelectorAll("video[autoplay]")).toHaveLength(0);
    expect(host.querySelectorAll("video[preload=none]")).toHaveLength(3);
    expect(section?.querySelector('a[href="/produto/botox-vonix"]')).not.toBeNull();
  });

  it("abre as quatro evidências completas ao clicar no link da prévia", () => {
    const fetch = vi.spyOn(globalThis, "fetch");
    const { container } = render(
      <>
        <AffiliateVerifiedReviewPreview />
        <AffiliateProductProof />
      </>,
    );
    const details = screen.getByTestId("affiliate-c93-review-disclosure") as HTMLDetailsElement;
    expect(details.open).toBe(false);
    expect(container.querySelectorAll('[data-testid="vonix-c72-review-card"]')).toHaveLength(4);
    fireEvent.click(screen.getByRole("link", { name: "Ver avaliações completas" }));
    expect(details.open).toBe(true);
    expect(within(details).getAllByTestId("affiliate-c62-customer-video")).toHaveLength(3);
    expect(within(details).getByTestId("affiliate-c86-customer-photo")).toHaveAttribute(
      "src",
      "/depoimentos/depoimento-4.jpg",
    );
    for (const review of productReviews) expect(details).toHaveTextContent(review.author);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("abre a avaliação ao clicar numa foto da prévia e permite recolher manualmente", () => {
    render(
      <>
        <AffiliateVerifiedReviewPreview />
        <AffiliateProductProof />
      </>,
    );
    const details = screen.getByTestId("affiliate-c93-review-disclosure") as HTMLDetailsElement;
    fireEvent.click(
      screen.getByRole("link", {
        name: /Ver avaliação com foto de Ana Paula na seção completa/i,
      }),
    );
    expect(details.open).toBe(true);
    fireEvent.click(within(details).getByText(/Ver as 4 avaliações completas/i));
    expect(details.open).toBe(false);
  });

  it("desdobra a seção em acesso direto por URL e hashchange", () => {
    window.history.replaceState(null, "", "#avaliacoes-produtos");
    const { rerender } = render(<AffiliateProductProof />);
    let details = screen.getByTestId("affiliate-c93-review-disclosure") as HTMLDetailsElement;
    expect(details.open).toBe(true);
    window.history.replaceState(null, "", "#inscricao");
    rerender(<div>Outro conteúdo</div>);
    render(<AffiliateProductProof />);
    details = screen.getByTestId("affiliate-c93-review-disclosure") as HTMLDetailsElement;
    expect(details.open).toBe(false);
    window.history.replaceState(null, "", "#avaliacoes-produtos");
    fireEvent(window, new Event("hashchange"));
    expect(details.open).toBe(true);
  });
});
