import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AffiliateCatalogInMotion } from "@/components/affiliate-catalog-in-motion";
import media from "@/data/provas-em-video.json";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const ids = ["banana-mel", "botox-1", "fio-1", "desmaia", "plex", "ig-05"];
const slugs = [
  "kit-banana-e-mel",
  "botox-vonix",
  "progressiva-fio-de-luz",
  "kit-desmaia",
  "plex-vonix",
  "kit-cachos",
];

describe("C74 — six real product videos with one accessible carousel", () => {
  it("uses precisely six local products with original data sources and truthful labels", () => {
    render(<AffiliateCatalogInMotion recruitmentOpen={false} />);
    const section = screen.getByTestId("vonix-c63-catalog-motion");
    const cards = within(section).getAllByTestId("vonix-c63-video-card");
    expect(cards).toHaveLength(6);
    for (const [index, id] of ids.entries()) {
      const source = media.find((item) => item.id === id);
      const card = cards[index];
      if (!source || !card) throw new Error("Missing official media source or card");
      expect(source.slugs).toContain(slugs[index]);
      const video = within(card).getByTestId("vonix-c63-product-video");
      expect(video).toHaveAttribute("poster", source.poster);
      expect(video.querySelector("source")).toHaveAttribute("src", source.src);
      expect(video).toHaveAttribute("preload", "none");
      expect(video).not.toHaveAttribute("autoplay");
      expect(within(card).getByRole("link", { name: /Ver produto no site/ })).toHaveAttribute(
        "href",
        "/produto/" + slugs[index],
      );
    }
    expect(section).toHaveTextContent(
      "não representam trabalho, ganhos ou participação de afiliadas",
    );
    expect(section).toHaveTextContent("Vídeos ilustram o catálogo, não comprovam parcerias");
  });

  it("keeps one line, a focusable scroll region, 44px navigation and visible video variety", () => {
    render(<AffiliateCatalogInMotion recruitmentOpen />);
    const carousel = screen.getByTestId("vonix-c74-catalog-video-carousel");
    expect(carousel).toHaveAttribute("role", "region");
    expect(carousel).toHaveAttribute("tabindex", "0");
    expect(carousel).toHaveAttribute("aria-label", expect.stringContaining("Seis vídeos"));
    expect(carousel.className).toContain("overflow-x-auto");
    expect(carousel.className).toContain("snap-mandatory");
    expect(carousel.className).not.toContain("grid-cols");
    expect(screen.getByRole("button", { name: "Ver vídeos anteriores" })).toHaveClass("size-11");
    expect(screen.getByRole("button", { name: "Ver próximos vídeos" })).toHaveClass("size-11");
    expect(screen.getByText(/Seis vídeos do catálogo: deslize ou use as setas/)).toBeVisible();
    expect(within(carousel).getAllByTestId("vonix-c63-video-card")).toHaveLength(6);
  });

  it("supports browsing by buttons after the scroll region reports actual dimensions", () => {
    const scrollBy = vi.fn();
    const original = HTMLElement.prototype.scrollBy;
    Object.defineProperty(HTMLElement.prototype, "scrollBy", {
      configurable: true,
      value: scrollBy,
    });
    try {
      render(<AffiliateCatalogInMotion recruitmentOpen />);
      const region = screen.getByTestId("vonix-c74-catalog-video-carousel");
      Object.defineProperty(region, "clientWidth", { configurable: true, value: 390 });
      Object.defineProperty(region, "scrollWidth", { configurable: true, value: 1300 });
      fireEvent.scroll(region);
      const next = screen.getByRole("button", { name: "Ver próximos vídeos" });
      expect(next).not.toBeDisabled();
      fireEvent.click(next);
      expect(scrollBy).toHaveBeenCalledWith(
        expect.objectContaining({ left: expect.any(Number), behavior: "smooth" }),
      );
      Object.defineProperty(region, "scrollLeft", {
        configurable: true,
        value: 420,
        writable: true,
      });
      fireEvent.scroll(region);
      const prev = screen.getByRole("button", { name: "Ver vídeos anteriores" });
      expect(prev).not.toBeDisabled();
      fireEvent.click(prev);
      expect(scrollBy).toHaveBeenCalledWith(
        expect.objectContaining({ left: expect.any(Number), behavior: "smooth" }),
      );
      Object.defineProperty(region, "scrollLeft", {
        configurable: true,
        value: 930,
        writable: true,
      });
      fireEvent.scroll(region);
      expect(next).toBeDisabled();
    } finally {
      Object.defineProperty(HTMLElement.prototype, "scrollBy", {
        configurable: true,
        value: original,
      });
    }
  });

  it.each([true, false])("retains status-based application CTA, when intake open=%s", (open) => {
    render(<AffiliateCatalogInMotion recruitmentOpen={open} />);
    expect(
      screen.getByRole("link", { name: open ? "Quero me candidatar" : "Conhecer a inscrição" }),
    ).toHaveAttribute("href", "#inscricao");
    expect(screen.getByTestId("vonix-c63-catalog-motion")).toHaveTextContent(
      "Inscrição sem compra obrigatória",
    );
  });
});
