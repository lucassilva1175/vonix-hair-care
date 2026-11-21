import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import reviews from "@/data/reviews.json";
import { AffiliateVerifiedReviewPreview } from "@/components/affiliate-verified-review-preview";

afterEach(cleanup);

const authors = ["Mariana Andrade", "Ayla Muniz", "Fernanda Assis"] as const;

describe("C72 — editorial customer-product evidence", () => {
  it("retains three real video reviews alongside a fourth photo with authentic captions and posters", () => {
    render(<AffiliateVerifiedReviewPreview />);
    const section = screen.getByTestId("vonix-c65-review-preview");
    const cards = within(section).getAllByTestId("vonix-c72-review-card");
    expect(cards).toHaveLength(4);
    for (const [index, author] of authors.entries()) {
      const source = reviews.find((item) => item.author === author && item.slug === "botox-vonix");
      if (!source?.media.poster || source.media.type !== "video")
        throw new Error("Missing real video poster");
      const card = cards[index];
      if (!card) throw new Error("Missing source-backed review card");
      expect(within(card).getByText(author)).toBeInTheDocument();
      expect(within(card).getByText(`“${source.comment}”`)).toBeInTheDocument();
      const image = within(card).getByRole("img");
      expect(image).toHaveAttribute("src", source.media.poster);
      expect(image).toHaveAttribute("loading", "lazy");
      expect(image).toHaveAttribute("decoding", "async");
      expect(image).toHaveAttribute(
        "alt",
        `Imagem de prévia da avaliação de ${author} sobre Botox Vonix`,
      );
      expect(within(card).getByText("Cliente · Botox Vonix")).toBeInTheDocument();
      expect(
        within(card).getByRole("link", { name: new RegExp(`Ver avaliação em vídeo de ${author}`) }),
      ).toHaveAttribute("href", "#avaliacoes-produtos");
    }
  });

  it("exposes a keyboard-focusable swipe region and keeps both original official destinations", () => {
    render(<AffiliateVerifiedReviewPreview />);
    const carousel = screen.getByTestId("vonix-c72-product-reviews-carousel");
    expect(carousel).toHaveAttribute("role", "region");
    expect(carousel).toHaveAttribute("tabindex", "0");
    expect(carousel).toHaveAttribute(
      "aria-label",
      expect.stringMatching(/deslize horizontalmente/i),
    );
    expect(carousel.className).toMatch(/snap-x|overflow-x-auto/);
    expect(screen.getByRole("link", { name: /Ver avaliações completas/ })).toHaveAttribute(
      "href",
      "#avaliacoes-produtos",
    );
    expect(screen.getByRole("link", { name: /Ver produto na loja/ })).toHaveAttribute(
      "href",
      "/produto/botox-vonix",
    );
  });

  it("never represents a customer comment as creator-partnership proof, income or a verified purchase", () => {
    render(<AffiliateVerifiedReviewPreview />);
    const preview = screen.getByTestId("vonix-c65-review-preview");
    expect(preview).toHaveTextContent("Não são depoimentos de afiliadas");
    expect(preview).toHaveTextContent(
      "não comprovam compra verificada, vendas, renda ou participação no programa",
    );
    expect(within(preview).getAllByText("Avaliação de produto em vídeo")).toHaveLength(3);
    expect(preview.querySelector("video, audio, source, form, [autoplay]")).toBeNull();
    expect(preview.querySelector('[src$=".mp4"]')).toBeNull();
    expect(preview.querySelectorAll("img")).toHaveLength(4);
  });

  it("uses no analytics, network, submission, or external video player to render the proof", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<AffiliateVerifiedReviewPreview />);
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(document.querySelector("#inscricao")).toBeNull();
    expect(document.querySelector("iframe")).toBeNull();
  });
});
