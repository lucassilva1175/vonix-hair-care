import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { existsSync } from "node:fs";
import { AffiliateCreatorOpportunity } from "@/components/affiliate-creator-opportunity";
import { vitrine } from "@/lib/store";

vi.mock("@/lib/analytics", () => ({ track: vi.fn() }));
afterEach(cleanup);

describe("C163 public creator benefits", () => {
  it.each([true, false])("presents three editorial benefits with safe CTA: %s", (open) => {
    render(<AffiliateCreatorOpportunity sourceLinked recruitmentOpen={open} />);
    const section = screen.getByTestId("affiliate-c90-creator-bridge");
    const cards = within(section).getByTestId("affiliate-c163-editorial-benefits");
    expect(within(cards).getAllByRole("article")).toHaveLength(3);
    const images = cards.querySelectorAll("img");
    expect(images).toHaveLength(3);
    for (const image of images) {
      expect(existsSync("public" + image.getAttribute("src"))).toBe(true);
      expect(image).toHaveAttribute("loading", "lazy");
    }
    const product = within(cards).getByRole("link", { name: /Conhecer o combo/ });
    expect(product).toHaveAttribute("target", "_blank");
    expect(product).toHaveAttribute("rel", "noopener noreferrer");
    expect(vitrine.some((p) => "/produto/" + p.slug === product.getAttribute("href"))).toBe(true);
    expect(within(cards).getByRole("link", { name: /Ver ideias/ })).toHaveAttribute(
      "href",
      "#formatos",
    );
    expect(within(cards).getByRole("link", { name: /Entender as condições/ })).toHaveAttribute(
      "href",
      "#ganhos",
    );
    expect(
      within(section).getByRole("link", {
        name: open ? /Preencher candidatura/ : /Abrir prévia segura/,
      }),
    ).toHaveAttribute("href", "#inscricao");
    expect(section).toHaveTextContent("sem garantia de parceria ou remuneração");
    expect(section.innerHTML).not.toMatch(/\/depoimentos\/|<video|<form/);
  });

  it("keeps the safe preview action and existing default component", () => {
    const preview = vi.fn();
    const { rerender } = render(
      <AffiliateCreatorOpportunity sourceLinked onSafePreview={preview} />,
    );
    fireEvent.click(screen.getByRole("link", { name: /Abrir prévia segura/ }));
    expect(preview).toHaveBeenCalledOnce();
    rerender(<AffiliateCreatorOpportunity />);
    expect(screen.queryByTestId("affiliate-c163-editorial-benefits")).toBeNull();
  });
});
