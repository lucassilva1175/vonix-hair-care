import { statSync } from "node:fs";
import { renderToString } from "react-dom/server";
import { join } from "node:path";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import reviews from "@/data/reviews.json";
import {
  AffiliateVerifiedReviewPreview,
  officialProductReviewCount,
  officialProductVideoReviewCount,
} from "@/components/affiliate-verified-review-preview";
import { AffiliateProductProof } from "@/components/affiliate-product-proof";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
const productReviews = reviews.filter((review) => review.slug === "botox-vonix");
const imageReview = productReviews.find((review) => review.author === "Ana Paula");

describe("C86: authentic mixed-media proof without fabricated creator results", () => {
  it("keeps carousel arrows disabled in server HTML before hydration attaches click handlers", () => {
    const markup = renderToString(<AffiliateVerifiedReviewPreview />);
    const host = document.createElement("div");
    host.innerHTML = markup;
    const next = host.querySelector('[data-testid="vonix-c82-review-next"]');
    const back = host.querySelector('[data-testid="vonix-c82-review-back"]');
    expect(next).not.toBeNull();
    expect(next).toHaveAttribute("disabled");
    expect(back).toHaveAttribute("disabled");
  });

  it("uses exactly four original product reviews, preserving all author/media associations", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<AffiliateVerifiedReviewPreview />);
    const section = screen.getByTestId("vonix-c65-review-preview");
    const cards = within(section).getAllByTestId("vonix-c72-review-card");
    expect(productReviews).toHaveLength(4);
    expect(cards).toHaveLength(4);
    expect(officialProductReviewCount).toBe(4);
    expect(officialProductVideoReviewCount).toBe(3);
    for (const record of productReviews) {
      const card = cards.find((figure) => figure.textContent?.includes(record.author));
      if (!card) throw new Error("No card for " + record.author);
      expect(card).toHaveTextContent(record.comment);
      const thumbnail = within(card).getByRole("img");
      const expected =
        record.media.type === "video" && "poster" in record.media
          ? record.media.poster
          : record.media.src;
      expect(thumbnail).toHaveAttribute("src", expected);
      expect(thumbnail).toHaveAttribute("loading", "lazy");
    }
    const photo = cards.find((card) => card.textContent?.includes("Ana Paula"));
    if (!photo) throw new Error("No authentic photo card");
    expect(photo).toHaveTextContent("Avaliação de produto com foto");
    expect(
      within(photo).getByRole("link", { name: /Ver avaliação com foto de Ana Paula/ }),
    ).toHaveAttribute("href", "#avaliacoes-produtos");
    expect(within(photo).getByRole("img")).toHaveAttribute(
      "alt",
      "Foto publicada junto à avaliação de Ana Paula sobre Botox Vonix",
    );
    expect(section.querySelector("video, audio, iframe, source, form, [autoplay]")).toBeNull();
    expect(section).toHaveTextContent("Não são depoimentos de afiliadas");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("renders a genuine photo in the full section without creating a fourth video", () => {
    if (!imageReview || imageReview.media.type !== "image")
      throw new Error("No published image review");
    expect(imageReview.media.src).toBe("/depoimentos/depoimento-4.jpg");
    expect(
      statSync(join(process.cwd(), "public", imageReview.media.src.slice(1))).size,
    ).toBeGreaterThan(1000);
    render(<AffiliateProductProof />);
    const section = screen.getByTestId("vonix-c53-real-product-reviews");
    expect(section.querySelectorAll("blockquote")).toHaveLength(4);
    expect(within(section).getAllByTestId("affiliate-c62-customer-video")).toHaveLength(3);
    const photo = within(section).getByTestId("affiliate-c86-customer-photo");
    expect(photo).toHaveAttribute("src", imageReview.media.src);
    expect(photo).toHaveAttribute(
      "alt",
      "Foto publicada junto à avaliação de Ana Paula sobre Botox Vonix",
    );
    expect(photo.closest("blockquote")).toHaveTextContent(imageReview.comment);
    expect(photo.closest("blockquote")).toHaveTextContent("Avaliação de produto com foto");
    for (const video of within(section).getAllByTestId("affiliate-c62-customer-video")) {
      expect(video).toHaveAttribute("preload", "none");
      expect(video).not.toHaveAttribute("autoplay");
    }
    expect(section).toHaveTextContent("Não são depoimentos de afiliadas");
    expect(section).toHaveTextContent("Eles não representam renda, vendas, comissões");
  });
});
