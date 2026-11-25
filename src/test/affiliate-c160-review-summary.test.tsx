import { describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach } from "vitest";
import { summarizeAffiliateProductReviews } from "@/lib/affiliate-review-summary";
import { AffiliateOfficialEvidenceLinks } from "@/components/affiliate-official-evidence-links";
vi.mock("@/lib/analytics", () => ({ track: vi.fn() }));
afterEach(cleanup);
describe("C160 catalog-only review summary", () => {
  it("counts only valid whole-star ratings for the chosen product", () => {
    const summary = summarizeAffiliateProductReviews(
      [
        { slug: "a", rating: 5 },
        { slug: "a", rating: 3 },
        { slug: "b", rating: 1 },
        ...[null, NaN, Infinity, 6, 0, 4.5, "5"].map((rating) => ({ slug: "a", rating })),
      ],
      "a",
    );
    expect(summary).toEqual({
      count: 2,
      average: 4,
      distribution: [
        { stars: 5, count: 1 },
        { stars: 4, count: 0 },
        { stars: 3, count: 1 },
        { stars: 2, count: 0 },
        { stars: 1, count: 0 },
      ],
    });
    expect(summarizeAffiliateProductReviews([], "a").average).toBeNull();
  });
  it("renders real sample size and note, without customer identity or embedded media", () => {
    const { container } = render(<AffiliateOfficialEvidenceLinks variant="reviews" />);
    expect(screen.getByTestId("affiliate-c160-rating")).toHaveTextContent("5,0 de 5");
    expect(screen.getByTestId("affiliate-c157-review-count")).toHaveTextContent(
      "4 avaliações publicadas",
    );
    const distribution = screen.getByTestId("affiliate-c160-rating-distribution");
    expect(within(distribution).getByRole("progressbar", { name: "5 estrelas" })).toHaveAttribute(
      "value",
      "4",
    );
    expect(within(distribution).getByRole("progressbar", { name: "1 estrela" })).toHaveAttribute(
      "value",
      "0",
    );
    expect(distribution).toHaveTextContent("Não é uma avaliação do programa de afiliadas");
    expect(container.innerHTML).not.toMatch(
      /Mariana Andrade|Ayla Muniz|Fernanda Assis|Ana Paula|\/depoimentos\/|\/provas\//,
    );
    expect(container.querySelectorAll("video,iframe,blockquote")).toHaveLength(0);
  });
  it("puts attributed brand evidence and official catalog inspiration beside the product rating", () => {
    render(<AffiliateOfficialEvidenceLinks variant="teaser" />);
    expect(screen.getByTestId("affiliate-c160-rating")).toHaveTextContent("5,0 de 5");
    expect(screen.queryByTestId("affiliate-c160-rating-distribution")).toBeNull();
    const evidence = screen.getByTestId("affiliate-c170-early-brand-evidence");
    expect(evidence).toHaveTextContent("480+");
    expect(evidence).toHaveTextContent("segundo a marca. Não é número de afiliadas");
    expect(evidence).toHaveTextContent("14 linhas do acervo");
    expect(evidence).toHaveTextContent("28 vínculos de vídeos");
    expect(within(evidence).getByRole("link", { name: /Conhecer a história/ })).toHaveAttribute(
      "href",
      "/sobre",
    );
    expect(within(evidence).getByRole("link", { name: /Conhecer a história/ })).toHaveAttribute(
      "rel",
      "noopener noreferrer",
    );
    expect(within(evidence).getByRole("link", { name: /Explorar inspirações/ })).toHaveAttribute(
      "href",
      "#catalogo-em-video",
    );
    expect(screen.getAllByRole("link")).toHaveLength(3);
    expect(evidence.querySelectorAll("video,iframe,blockquote")).toHaveLength(0);
  });
});
