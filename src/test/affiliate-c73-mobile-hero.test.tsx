import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AffiliateEditorialHero } from "@/components/affiliate-editorial-hero";

afterEach(cleanup);

describe("C73 — editorial product-gallery hero on mobile", () => {
  it("presents a named keyboard-focusable scroll region with horizontal snapping and desktop mosaic", () => {
    render(<AffiliateEditorialHero recruitmentStatus="open" />);
    const gallery = screen.getByTestId("vonix-c73-hero-products-region");
    expect(gallery).toHaveAttribute("role", "region");
    expect(gallery).toHaveAttribute("tabindex", "0");
    expect(gallery).toHaveAttribute(
      "aria-label",
      expect.stringMatching(/deslize horizontalmente/i),
    );
    expect(gallery.className).toContain("overflow-x-auto");
    expect(gallery.className).toContain("snap-mandatory");
    expect(gallery.className).toContain("lg:grid");
    expect(gallery.className).toContain("lg:overflow-visible");
    expect(screen.getByTestId("vonix-c73-gallery-swipe-hint")).toHaveTextContent(
      "Deslize para explorar os produtos",
    );
    expect(screen.getByTestId("vonix-c73-gallery-swipe-hint").className).toContain("lg:hidden");
  });

  it("preserves all 3 authentic store product links and priority of the first image only", () => {
    render(<AffiliateEditorialHero recruitmentStatus="open" />);
    const gallery = screen.getByTestId("vonix-c73-hero-products-region");
    const cards = within(gallery).getAllByTestId("affiliate-c61-catalog-link");
    const slugs = ["kit-banana-e-mel", "mascara-reparacao-nutri-repair", "botox-vonix"];
    expect(cards).toHaveLength(3);
    for (const [index, slug] of slugs.entries()) {
      const card = cards[index];
      if (!card) throw new Error("Missing official catalog card");
      expect(card).toHaveAttribute("href", `/produto/${slug}`);
      expect(card.className).toContain("snap-start");
      expect(card.className).toContain("w-[68vw]");
      const source = card.querySelector("source");
      expect(source).toHaveAttribute("srcset", `/images/products/${slug}.webp`);
      const image = within(card).getByRole("img");
      expect(image).toHaveAttribute("src", `/images/products/${slug}.jpg`);
      expect(image).toHaveAttribute("loading", index === 0 ? "eager" : "lazy");
      expect(image).toHaveAttribute("fetchpriority", index === 0 ? "high" : "auto");
    }
    expect(cards[0]?.className).toContain("lg:row-span-2");
    expect(
      within(screen.getByTestId("affiliate-c61-hero-catalog")).getByRole("link", {
        name: /Ver catálogo/,
      }),
    ).toHaveAttribute("href", "/loja");
  });

  it.each(["open", "loading", "limited", "closed"] as const)(
    "preserves enrollment state, terms and CTA when status is %s",
    (status) => {
      render(<AffiliateEditorialHero recruitmentStatus={status} />);
      const hero = screen.getByTestId("vonix-affiliate-hero");
      const primary = within(hero).getByRole("link", {
        name: status === "open" ? /Quero ser afiliada Vonix/ : /Conhecer a inscrição/,
      });
      expect(primary).toHaveAttribute("href", "#inscricao");
      expect(within(hero).getByRole("link", { name: /Conhecer as condições/ })).toHaveAttribute(
        "href",
        "#ganhos",
      );
      expect(hero).toHaveTextContent("8% sobre vendas após aprovação");
      expect(hero).toHaveTextContent("Inscrição gratuita");
      expect(hero).toHaveTextContent("A candidatura não garante aprovação");
      expect(within(hero).getAllByTestId("affiliate-c61-catalog-link")).toHaveLength(3);
    },
  );

  it("does not mount product videos, creator testimonials, fake social proof or a form", () => {
    const { container } = render(<AffiliateEditorialHero recruitmentStatus="open" />);
    expect(container.querySelector("video,source[src$='.mp4'],iframe,form,[autoplay]")).toBeNull();
    expect(container.querySelectorAll("picture")).toHaveLength(3);
    expect(screen.getByTestId("affiliate-c61-hero-catalog")).toHaveTextContent(
      "Não são imagens de afiliadas",
    );
    expect(screen.getByTestId("vonix-affiliate-hero")).not.toHaveTextContent(
      /15% no site|21% no TikTok|ganhos garantidos|creator contratada/i,
    );
  });
});
