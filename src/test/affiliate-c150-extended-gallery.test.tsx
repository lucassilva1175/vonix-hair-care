import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { existsSync } from "node:fs";
import { AffiliateCatalogInMotion } from "@/components/affiliate-catalog-in-motion";
import media from "@/data/provas-em-video.json";
import { getProduct } from "@/lib/store";
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
describe("C150 additional official videos", () => {
  it("keeps six initially, expands to 12 exact available linked media and restores six", () => {
    render(<AffiliateCatalogInMotion recruitmentOpen />);
    const gallery = screen.getByTestId("vonix-c74-catalog-video-carousel");
    const button = screen.getByTestId("affiliate-c150-extra-videos");
    expect(within(gallery).getAllByTestId("vonix-c63-video-card")).toHaveLength(6);
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    const cards = within(gallery).getAllByTestId("vonix-c63-video-card");
    expect(cards).toHaveLength(12);
    const paths = new Set<string>();
    for (const card of cards) {
      const player = within(card).getByTestId("vonix-c63-product-video");
      const src = player.querySelector("source")!.getAttribute("src")!;
      const slug = within(card)
        .getByRole("link", { name: /Ver produto no site/ })
        .getAttribute("href")!
        .replace("/produto/", "");
      expect(getProduct(slug)).toBeDefined();
      expect(media.find((v) => v.src === src)?.slugs).toContain(slug);
      expect(existsSync("public" + src)).toBe(true);
      expect(existsSync("public" + player.getAttribute("poster"))).toBe(true);
      expect(player).toHaveAttribute("preload", "none");
      paths.add(src);
    }
    expect(paths.size).toBe(12);
    expect(paths.has("/provas/ig-26.mp4")).toBe(false);
    const last = within(gallery)
      .getAllByTestId("vonix-c63-product-video")
      .at(-1) as HTMLVideoElement;
    Object.defineProperty(last, "paused", { value: false, configurable: true });
    const pause = vi.spyOn(last, "pause").mockImplementation(() => {});
    fireEvent.click(button);
    expect(pause).toHaveBeenCalledOnce();
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(within(gallery).getAllByTestId("vonix-c63-video-card")).toHaveLength(6);
  });
});
