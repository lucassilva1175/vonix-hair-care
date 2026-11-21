import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AffiliateEditorialHero } from "@/components/affiliate-editorial-hero";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("C89 Vonix: hair editorial and hydrated mobile gallery", () => {
  it("uses owned category photo for editorial hair inspiration, without claiming creator proof", () => {
    const network = vi.spyOn(globalThis, "fetch");
    render(<AffiliateEditorialHero recruitmentStatus="closed" />);
    const hero = screen.getByTestId("vonix-affiliate-hero");
    const editorial = screen.getByTestId("affiliate-c89-hair-editorial");
    const image = within(editorial).getByRole("img");

    expect(image).toHaveAttribute("src", "/images/categorias/cachos.jpg");
    expect(image).toHaveAttribute("width", "480");
    expect(image).toHaveAttribute("height", "480");
    expect(image).toHaveAttribute("loading", "eager");
    expect(image).toHaveAttribute("alt", expect.stringContaining("não identifica uma afiliada"));
    expect(editorial).toHaveTextContent("Movimento, textura e cuidado.");
    expect(editorial).toHaveTextContent("Não retrata afiliada nem comprova parceria.");
    expect(within(hero).getAllByTestId("affiliate-c61-catalog-link")).toHaveLength(3);
    expect(within(hero).getByRole("link", { name: /Conhecer a inscrição/i })).toHaveAttribute(
      "href",
      "#inscricao",
    );
    expect(network).not.toHaveBeenCalled();
  });

  it("renders the next-gallery control disabled on SSR before handlers can attach", () => {
    const markup = renderToStaticMarkup(<AffiliateEditorialHero recruitmentStatus="loading" />);
    const root = document.createElement("div");
    root.innerHTML = markup;
    const next = root.querySelector('[data-testid="vonix-c83-gallery-next"]');
    expect(next).not.toBeNull();
    expect(next).toBeDisabled();
    expect(root.querySelectorAll('[data-testid="affiliate-c61-catalog-link"]')).toHaveLength(3);
    expect(root.querySelector('img[src="/images/categorias/cachos.jpg"]')).not.toBeNull();
  });

  it("enables the first meaningful next-click after measuring real overflow", () => {
    render(<AffiliateEditorialHero recruitmentStatus="open" />);
    const rail = screen.getByTestId("vonix-c73-hero-products-region");
    Object.defineProperty(rail, "clientWidth", { configurable: true, value: 350 });
    Object.defineProperty(rail, "scrollWidth", { configurable: true, value: 950 });
    Object.defineProperty(rail, "scrollLeft", { configurable: true, writable: true, value: 0 });
    const first = within(rail).getAllByTestId("affiliate-c61-catalog-link")[0];
    if (!first) throw new Error("Missing first Vonix catalog card");
    vi.spyOn(first, "getBoundingClientRect").mockReturnValue({ width: 260 } as DOMRect);
    const scrollBy = vi.fn(({ left }: { left: number }) => {
      rail.scrollLeft = Math.max(0, Math.min(600, rail.scrollLeft + left));
      fireEvent.scroll(rail);
    });
    Object.defineProperty(rail, "scrollBy", { configurable: true, value: scrollBy });
    fireEvent.scroll(rail);
    const next = screen.getByTestId("vonix-c83-gallery-next");
    expect(next).toBeEnabled();
    fireEvent.click(next);
    expect(scrollBy).toHaveBeenCalledTimes(1);
    expect(rail.scrollLeft).toBe(272);
    expect(screen.getByTestId("vonix-c83-gallery-position")).toHaveTextContent("2 / 3");
  });
});
