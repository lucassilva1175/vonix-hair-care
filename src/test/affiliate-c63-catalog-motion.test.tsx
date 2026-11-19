import { statSync } from "node:fs";
import { join } from "node:path";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AffiliateCatalogInMotion } from "@/components/affiliate-catalog-in-motion";
import { AffiliateLandingIntro } from "@/components/affiliate-landing";
import productMedia from "@/data/provas-em-video.json";

afterEach(cleanup);

const expected = [
  { id: "banana-mel", slug: "kit-banana-e-mel" },
  { id: "botox-1", slug: "botox-vonix" },
  { id: "fio-1", slug: "progressiva-fio-de-luz" },
] as const;

describe("C63 authentic catalogue movie showcase", () => {
  it("shows exactly three matching videos and product pages from the source catalog", () => {
    const { container } = render(<AffiliateCatalogInMotion recruitmentOpen />);
    const section = screen.getByTestId("vonix-c63-catalog-motion");
    const cards = within(section).getAllByTestId("vonix-c63-video-card");
    expect(cards).toHaveLength(3);
    expect(container.querySelectorAll("#catalogo-em-video")).toHaveLength(1);
    expected.forEach(({ id, slug }, index) => {
      const media = productMedia.find((entry) => entry.id === id);
      expect(media).toBeDefined();
      expect(media?.slugs).toContain(slug);
      expect(media?.src).toMatch(/^\/provas\/[a-z0-9-]+\.mp4$/);
      expect(media?.poster).toMatch(/^\/provas\/[a-z0-9-]+\.jpg$/);
      const card = cards[index];
      if (!card) throw new Error(`Missing official product card ${id}`);
      const video = within(card).getByTestId("vonix-c63-product-video");
      expect(video.querySelector("source")).toHaveAttribute("src", media?.src);
      expect(video).toHaveAttribute("poster", media?.poster);
      expect(video).toHaveAttribute("controls");
      expect(video).toHaveAttribute("playsinline");
      expect(video).toHaveAttribute("preload", "none");
      expect(video).not.toHaveAttribute("autoplay");
      expect(within(card).getByRole("link", { name: /ver produto no site/i })).toHaveAttribute(
        "href",
        "/produto/" + slug,
      );
      for (const path of [media?.src, media?.poster]) {
        expect(path).toBeDefined();
        expect(statSync(join(process.cwd(), "public", path!.slice(1))).size).toBeGreaterThan(1000);
      }
    });
    expect(within(section).getByRole("link", { name: /explorar a loja oficial/i })).toHaveAttribute(
      "href",
      "/loja",
    );
    expect(section).toHaveTextContent(
      "não representam trabalho, ganhos ou participação de afiliadas",
    );
  });

  it.each([
    [true, "Quero me candidatar"],
    [false, "Conhecer a inscrição"],
  ] as const)(
    "keeps conversion action conditional on real program availability %s",
    (isOpen, text) => {
      render(<AffiliateCatalogInMotion recruitmentOpen={isOpen} />);
      const section = screen.getByTestId("vonix-c63-catalog-motion");
      expect(within(section).getByRole("link", { name: new RegExp(text) })).toHaveAttribute(
        "href",
        "#inscricao",
      );
      expect(section).toHaveTextContent("Inscrição sem compra obrigatória");
    },
  );

  it("preserves benefits-first and the selling-flow-before-clips sequence", () => {
    render(<AffiliateLandingIntro recruitmentStatus="closed" />);
    const reviews = screen.getByTestId("vonix-c53-real-product-reviews");
    const earnings = screen.getByTestId("vonix-affiliate-earnings");
    const selling = screen.getByTestId("vonix-c57-selling-flow");
    const clips = screen.getByTestId("vonix-c63-catalog-motion");
    const criteria = document.getElementById("criterios");
    if (!criteria) throw new Error("Missing public eligibility section");
    expect(
      earnings.compareDocumentPosition(reviews) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(
      earnings.compareDocumentPosition(selling) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(selling.compareDocumentPosition(clips) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(clips.compareDocumentPosition(criteria) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getAllByTestId("vonix-c63-product-video")).toHaveLength(3);
  });
});
