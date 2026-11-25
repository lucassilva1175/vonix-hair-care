import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import { existsSync } from "node:fs";
import { AffiliateEditorialHero } from "@/components/affiliate-editorial-hero";
import { vitrine } from "@/lib/store";
afterEach(cleanup);
describe("C162 current storefront hero", () => {
  it.each(["open", "closed", "unavailable"] as const)(
    "keeps current catalog and truthful intake in %s",
    (status) => {
      render(<AffiliateEditorialHero recruitmentStatus={status} sourceLinked />);
      const hero = screen.getByTestId("vonix-affiliate-hero");
      const gallery = within(hero).getByTestId("affiliate-c61-hero-catalog");
      const links = within(gallery).getAllByTestId("affiliate-c61-catalog-link");
      const expected = [
        "combo-botox-vonix-nutri-repair",
        "combo-fio-de-luz-completo",
        "combo-finalizacao-serum",
      ];
      expect(links.map((link) => link.getAttribute("href"))).toEqual(
        expected.map((slug) => "/produto/" + slug),
      );
      for (const [i, link] of links.entries()) {
        const slug = expected[i]!;
        expect(vitrine.some((p) => p.slug === slug)).toBe(true);
        expect(link).toHaveAttribute("target", "_blank");
        expect(link).toHaveAttribute("rel", "noopener noreferrer");
        for (const suffix of [".jpg", ".webp", "-480.webp"])
          expect(existsSync("public/images/products/" + slug + suffix)).toBe(true);
      }
      expect(within(gallery).getByRole("link", { name: /Ver catálogo/ })).toHaveAttribute(
        "target",
        "_blank",
      );
      expect(
        within(hero).getByRole("link", {
          name: status === "open" ? /Quero ser afiliada Vonix/ : /Conhecer a inscrição/,
        }),
      ).toHaveAttribute("href", "#inscricao");
      expect(hero).toHaveTextContent("A candidatura não garante aprovação");
      expect(hero.innerHTML).not.toMatch(/\/depoimentos\//);
    },
  );
});
