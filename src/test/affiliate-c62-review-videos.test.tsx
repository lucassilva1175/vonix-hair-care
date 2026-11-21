import { statSync } from "node:fs";
import { join } from "node:path";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import storeReviews from "@/data/reviews.json";
import { AffiliateProductProof } from "@/components/affiliate-product-proof";

afterEach(cleanup);

const publishedVideoReviews = storeReviews.filter(
  (review) => review.slug === "botox-vonix" && review.media.type === "video",
);

describe("C62 genuine store product-review video evidence", () => {
  it("renders exactly one video corresponding to every existing published review", () => {
    const { container } = render(<AffiliateProductProof />);
    const evidence = screen.getByTestId("vonix-c53-real-product-reviews");
    const quotes = [...evidence.querySelectorAll("blockquote")];
    expect(quotes).toHaveLength(4);
    expect(publishedVideoReviews).toHaveLength(3);
    expect(evidence.querySelectorAll("video")).toHaveLength(3);
    expect(evidence.querySelectorAll('[data-testid="affiliate-c86-customer-photo"]')).toHaveLength(1);
    expect(container.querySelectorAll("#avaliacoes-produtos")).toHaveLength(1);

    for (const review of publishedVideoReviews) {
      const quote = quotes.find((block) => block.textContent?.includes(review.author));
      expect(quote, review.author).toBeDefined();
      expect(quote).toHaveTextContent(review.comment);
      const video = quote?.querySelector("video");
      expect(video).not.toBeNull();
      expect(video?.getAttribute("aria-label")).toContain(review.author);
      expect(video?.querySelector("source")).toHaveAttribute("src", review.media.src);
      expect(video?.querySelector("source")).toHaveAttribute("type", "video/mp4");
      if ("poster" in review.media) expect(video).toHaveAttribute("poster", review.media.poster);
    }
  });

  it("never autoplays, eagerly loads a video file, or falsely calls it creator income evidence", () => {
    render(<AffiliateProductProof />);
    const evidence = screen.getByTestId("vonix-c53-real-product-reviews");
    for (const video of evidence.querySelectorAll("video")) {
      expect(video).toHaveAttribute("preload", "none");
      expect(video).not.toHaveAttribute("autoplay");
      expect(video).toHaveAttribute("controls");
      expect(video).toHaveAttribute("playsinline");
    }
    expect(evidence).toHaveTextContent("Não são depoimentos de afiliadas");
    expect(evidence).toHaveTextContent("não é uma transcrição integral do áudio");
    expect(evidence).toHaveTextContent("Eles não representam renda, vendas, comissões");
    expect(evidence.querySelector('a[href="/produto/botox-vonix"]')).not.toBeNull();
    expect(evidence.textContent).not.toMatch(
      /afiliadas faturaram|ganhos reais das afiliadas|vendas das creators/i,
    );
  });

  it("serves all source-owned mp4 and poster assets, without third-party thumbnails", () => {
    expect(publishedVideoReviews).toHaveLength(3);
    for (const review of publishedVideoReviews) {
      const media = review.media;
      if (!("poster" in media)) throw new Error("Review missing own poster");
      for (const filename of [media.src, media.poster]) {
        expect(filename).toMatch(/^\/depoimentos\/depoimento-[123](?:-poster)?\.(?:mp4|jpg)$/);
        const file = join(process.cwd(), "public", filename.slice(1));
        expect(statSync(file).size).toBeGreaterThan(1000);
      }
    }
  });
});
