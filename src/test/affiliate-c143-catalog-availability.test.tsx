import { render, screen, cleanup, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AffiliateProductDiscoveryStrip } from "@/components/affiliate-product-discovery-strip";
import { getProduct, OUT_OF_STOCK } from "@/lib/store";
import { existsSync } from "node:fs";

afterEach(cleanup);
describe("C143 official stock-aware editorial catalog", () => {
  it("links only to products offered by the current store with existing optimized imagery", () => {
    render(<AffiliateProductDiscoveryStrip />);
    const cards = screen.getAllByTestId("affiliate-c132-product-card");
    expect(cards).toHaveLength(3);
    for (const card of cards) {
      const link = within(card).getByRole("link", { name: /ver produto/i });
      const slug = link.getAttribute("href")!.replace("/produto/", "");
      expect(getProduct(slug)).toBeDefined();
      expect(OUT_OF_STOCK.has(slug)).toBe(false);
      expect(existsSync("public" + within(card).getByRole("img").getAttribute("src"))).toBe(true);
      expect(card).toHaveTextContent("Ideia de conteúdo");
    }
    expect(screen.queryByText(/perfume capilar/i)).not.toBeInTheDocument();
  });
});
