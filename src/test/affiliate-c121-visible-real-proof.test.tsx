import { existsSync } from "node:fs";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import reviews from "@/data/reviews.json";
import { AffiliateCustomerVoiceTeaser } from "@/components/affiliate-customer-voice-teaser";

const verifiedCustomerReviews = [
  "Mariana Andrade",
  "Ayla Muniz",
  "Fernanda Assis",
  "Ana Paula",
].map((author) => reviews.find((entry) => entry.author === author && entry.slug === "botox-vonix"));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("C121 — trecho real de avaliação de PRODUTO visível no celular", () => {
  it("exibe texto, nome e mídia de uma mesma avaliação publicada, sem depoimento inventado", () => {
    const network = vi.spyOn(globalThis, "fetch");
    const [review] = verifiedCustomerReviews;
    if (!review || review.media.type !== "video") throw Error("Fonte oficial ausente");
    const { container } = render(<AffiliateCustomerVoiceTeaser />);
    const toggle = screen.getByTestId("affiliate-c116-mobile-proof-toggle");
    const quote = within(toggle).getByTestId("affiliate-c121-real-review-quote");
    const credit = within(toggle).getByTestId("affiliate-c121-review-credit");
    const poster = within(toggle).getByTestId("affiliate-c116-mobile-review-poster");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute("aria-controls", "affiliate-c116-proof-content");
    expect(toggle).toHaveClass("sm:hidden");
    expect(quote).toHaveTextContent(review.comment);
    expect(quote).toHaveClass("line-clamp-2");
    expect(credit).toHaveTextContent(review.author + " · cliente");
    expect(poster).toHaveStyle({ backgroundImage: `url("${review.media.poster}")` });
    expect(existsSync("public" + review.media.poster)).toBe(true);
    expect(toggle).toHaveTextContent("Opiniões sobre produtos, não relatos de afiliadas");
    expect(toggle).toHaveTextContent("4 avaliações de produto com fotos e vídeos");
    expect(container.querySelectorAll("form,input,iframe,video,[autoplay]")).toHaveLength(0);
    expect(network).not.toHaveBeenCalled();
  });

  it("ao selecionar outra avaliação, atualiza trecho e autor da mesma fonte; ao fechar restaura a original", () => {
    const [, second, third] = verifiedCustomerReviews;
    if (!second || !third) throw Error("Avaliações oficiais insuficientes");
    render(<AffiliateCustomerVoiceTeaser />);
    const toggle = screen.getByTestId("affiliate-c116-mobile-proof-toggle");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    const selections = screen.getAllByTestId("affiliate-c106-review-choice");
    expect(selections).toHaveLength(4);
    fireEvent.click(selections[1]!);
    expect(within(toggle).getByTestId("affiliate-c121-real-review-quote")).toHaveTextContent(
      second.comment,
    );
    expect(within(toggle).getByTestId("affiliate-c121-review-credit")).toHaveTextContent(
      second.author,
    );
    fireEvent.click(selections[2]!);
    expect(within(toggle).getByTestId("affiliate-c121-real-review-quote")).toHaveTextContent(
      third.comment,
    );
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(within(toggle).getByTestId("affiliate-c121-review-credit")).toHaveTextContent(
      "Mariana Andrade",
    );
    expect(screen.queryByTestId("affiliate-c107-review-video")).not.toBeInTheDocument();
  });

  it("mantém um único convite de leitura, SSR acessível e nunca alega aprovação ou ganhos", () => {
    const markup = renderToStaticMarkup(<AffiliateCustomerVoiceTeaser />);
    expect(markup).toContain('data-testid="affiliate-c121-real-review-quote"');
    expect(markup).toContain('data-testid="affiliate-c121-review-credit"');
    expect(markup).toContain('aria-expanded="false"');
    expect(markup).toContain("Mariana Andrade");
    expect(markup).toContain("Produto maravilhoso");
    expect(markup).toContain("não relatos de afiliadas");
    expect(markup).not.toMatch(
      /ganhos garantidos|parceria garantida|afiliada aprovada|aprovada pela vonix/i,
    );
    expect(markup).not.toContain("<video");
    expect(markup.match(/data-testid="affiliate-c116-mobile-proof-toggle"/g)).toHaveLength(1);
    expect(markup).toContain('href="#inscricao"');
  });
});
