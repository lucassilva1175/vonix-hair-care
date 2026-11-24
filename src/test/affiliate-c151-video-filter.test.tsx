import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AffiliateCatalogInMotion } from "@/components/affiliate-catalog-in-motion";
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
describe("C151 curated product filter", () => {
  it("filters exact product links and resets to all on reopening", () => {
    render(<AffiliateCatalogInMotion recruitmentOpen />);
    const gallery = screen.getByTestId("vonix-c74-catalog-video-carousel");
    const expand = screen.getByTestId("affiliate-c150-extra-videos");
    fireEvent.click(expand);
    const filter = screen.getByTestId("affiliate-c151-product-filter");
    const first = within(gallery).getAllByTestId("vonix-c63-product-video")[0] as HTMLVideoElement;
    Object.defineProperty(first, "paused", { value: false, configurable: true });
    const pause = vi.spyOn(first, "pause").mockImplementation(() => {});
    fireEvent.change(filter, { target: { value: "progressiva-fio-de-luz" } });
    expect(pause).toHaveBeenCalledOnce();
    const cards = within(gallery).getAllByTestId("vonix-c63-video-card");
    expect(cards).toHaveLength(5);
    for (const card of cards)
      expect(within(card).getByRole("link", { name: /Ver produto no site/ })).toHaveAttribute(
        "href",
        "/produto/progressiva-fio-de-luz",
      );
    expect(screen.getByText("5 de 12 vídeos da seleção.")).toBeInTheDocument();
    expect(gallery.querySelector('source[src="/provas/ig-26.mp4"]')).toBeNull();
    fireEvent.change(filter, { target: { value: "kit-cachos" } });
    expect(within(gallery).getAllByTestId("vonix-c63-video-card")).toHaveLength(2);
    fireEvent.click(expand);
    expect(screen.queryByTestId("affiliate-c151-product-filter")).not.toBeInTheDocument();
    fireEvent.click(expand);
    expect(screen.getByTestId("affiliate-c151-product-filter")).toHaveValue("all");
    expect(within(gallery).getAllByTestId("vonix-c63-video-card")).toHaveLength(12);
  });
});
