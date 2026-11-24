import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { AffiliateProductDiscoveryStrip } from "@/components/affiliate-product-discovery-strip";

afterEach(cleanup);

describe("C149 official packaging presentation", () => {
  it("loads product photos by default, switches on request, and preserves the original product links", () => {
    render(<AffiliateProductDiscoveryStrip />);
    const cards = screen.getAllByTestId("affiliate-c132-product-card");
    const images = () => cards.map((card) => within(card).getByRole("img"));
    expect(images().every((img) => img.getAttribute("src")?.includes("/images/products/"))).toBe(
      true,
    );
    const button = screen.getByTestId("affiliate-c149-packaging-toggle");
    expect(button).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-pressed", "true");
    for (const card of cards) {
      const slug = within(card)
        .getByRole("link", { name: /ver produto/i })
        .getAttribute("href")!
        .split("/")
        .pop();
      const img = within(card).getByRole("img");
      expect(img).toHaveAttribute("src", "/images/sacolinhas/" + slug + ".webp");
      expect(img).toHaveAccessibleName(/Imagem de apresentação da embalagem/);
      expect(existsSync("public" + img.getAttribute("src"))).toBe(true);
    }
    expect(screen.getByText(/Não representam brindes/)).toBeInTheDocument();
    fireEvent.click(button);
    expect(images().every((img) => img.getAttribute("src")?.includes("/images/products/"))).toBe(
      true,
    );
  });

  it("falls back to a product photo if the packaging image fails, without altering the other cards", () => {
    render(<AffiliateProductDiscoveryStrip />);
    fireEvent.click(screen.getByTestId("affiliate-c149-packaging-toggle"));
    const cards = screen.getAllByTestId("affiliate-c132-product-card");
    fireEvent.error(within(cards[0]!).getByRole("img"));
    expect(within(cards[0]!).getByRole("img")).toHaveAttribute(
      "src",
      "/images/products/sos-reconstrutor-capilar-480.webp",
    );
    expect(within(cards[1]!).getByRole("img")).toHaveAttribute(
      "src",
      "/images/sacolinhas/kit-desmaia.webp",
    );
  });
});
