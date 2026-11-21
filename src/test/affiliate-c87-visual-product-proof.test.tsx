import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import reviews from "@/data/reviews.json";
import { AffiliateVerifiedReviewPreview } from "@/components/affiliate-verified-review-preview";

afterEach(cleanup);

const expectedAuthors = ["Mariana Andrade", "Ayla Muniz", "Fernanda Assis", "Ana Paula"] as const;

describe("C87: visual-first product reviews preserve genuine media and identity", () => {
  it("gives each source-backed product review prominent media before its original quote", () => {
    render(<AffiliateVerifiedReviewPreview />);
    const section = screen.getByTestId("vonix-c65-review-preview");
    const cards = within(section).getAllByTestId("vonix-c72-review-card");
    expect(cards).toHaveLength(4);

    expectedAuthors.forEach((author, i) => {
      const record = reviews.find((review) => review.author === author && review.slug === "botox-vonix");
      if (!record) throw new Error("Missing catalog review: " + author);
      const card = cards[i];
      const link = within(card).getByRole("link");
      const img = within(card).getByRole("img");
      const quote = within(card).getByText((_, element) => {
        return element?.tagName.toLowerCase() === "blockquote" &&
          element.textContent?.includes(record.comment) === true;
      });
      const source = record.media.type === "video" ? record.media.poster : record.media.src;
      expect(card.className).toContain("flex-col");
      expect(link.className).toContain("aspect-[5/4]");
      expect(link).toHaveAttribute("href", "#avaliacoes-produtos");
      expect(link).toContainElement(img);
      expect(img).toHaveAttribute("src", source);
      expect(img).toHaveAttribute("loading", "lazy");
      expect(img.className).toContain("object-contain");
      expect(card.contains(quote)).toBe(true);
      expect(link.compareDocumentPosition(quote) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(card).toHaveTextContent(author);
      expect(card).toHaveTextContent("Avaliação de produto · não de afiliada");
    });
    expect(within(section).getByText("Não são depoimentos de afiliadas", { exact:false })).toBeInTheDocument();
    expect(section.querySelectorAll("video, audio, iframe, [autoplay]")).toHaveLength(0);
  });

  it("preserves 3 actual video previews and one customer photo without fictional creator results", () => {
    render(<AffiliateVerifiedReviewPreview />);
    const section = screen.getByTestId("vonix-c65-review-preview");
    const cards = within(section).getAllByTestId("vonix-c72-review-card");
    expect(cards.filter(card => card.textContent?.includes("Avaliação de produto em vídeo"))).toHaveLength(3);
    expect(cards.filter(card => card.textContent?.includes("Avaliação de produto com foto"))).toHaveLength(1);
    expect(within(section).getByRole("link", {name:/Ver avaliação com foto de Ana Paula/}))
      .toHaveAttribute("href", "#avaliacoes-produtos");
    expect(within(section).getByTestId("vonix-c78-proof-signup-link"))
      .toHaveAttribute("href", "#inscricao");
    expect(within(section).getByTestId("vonix-c72-product-reviews-carousel"))
      .toHaveAttribute("tabindex", "0");
  });
});
