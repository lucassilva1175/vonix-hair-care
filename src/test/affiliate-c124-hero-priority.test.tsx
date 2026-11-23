import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AffiliateEditorialHero } from "@/components/affiliate-editorial-hero";

afterEach(cleanup);

describe("C124 — hierarquia de imagens que prioriza o retrato e não a vitrine recolhida", () => {
  it("mantém foto editorial do hero prioritária, mas nunca antecipa a vitrine opcional", () => {
    render(<AffiliateEditorialHero recruitmentStatus="loading" />);

    const main = screen.getByTestId("affiliate-c94-editorial-photo") as HTMLImageElement;
    expect(main).toHaveAttribute("src", "/images/categorias/cachos.jpg");
    expect(main).toHaveAttribute("loading", "eager");
    expect(main).toHaveAttribute("fetchpriority", "high");
    expect(main.alt).toMatch(/não identifica uma afiliada/i);

    const gallery = screen.getByTestId("affiliate-c61-hero-catalog");
    const previews = gallery.querySelectorAll('[data-testid="affiliate-c61-catalog-link"] img');
    expect(previews).toHaveLength(3);
    previews.forEach((preview) => {
      expect(preview).toHaveAttribute("loading", "lazy");
      expect(preview).toHaveAttribute("fetchpriority", "low");
    });
    const hiddenMobilePanel = screen.getByTestId("affiliate-c98-products-panel");
    expect(hiddenMobilePanel).toHaveClass("hidden");
    expect(hiddenMobilePanel).toHaveClass("lg:block");
  });
});
