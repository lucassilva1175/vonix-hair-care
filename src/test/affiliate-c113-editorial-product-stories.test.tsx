import { existsSync, readFileSync } from "node:fs";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AffiliateCreatorSpotlight } from "@/components/affiliate-creator-spotlight";
import { affiliateCreatorProductStories } from "@/data/affiliate-creator-product-stories";

afterEach(cleanup);

describe("C113 — histórias de criação com produtos reais Vonix", () => {
  it("tem 3 caminhos ligados a produtos e arquivos oficiais existentes", () => {
    const products = JSON.parse(readFileSync("src/data/products.json", "utf8")) as Array<{
      slug: string;
      name: string;
    }>;
    expect(affiliateCreatorProductStories).toHaveLength(3);
    expect(new Set(affiliateCreatorProductStories.map((product) => product.profileId)).size).toBe(
      3,
    );
    for (const product of affiliateCreatorProductStories) {
      const slug = product.href.replace("/produto/", "");
      expect(product.href).toMatch(/^\/produto\/[a-z0-9-]+$/);
      expect(products.some((item) => item.slug === slug)).toBe(true);
      expect(product.image).toBe("/images/products/" + slug + ".webp");
      expect(product.fallback).toBe("/images/products/" + slug + ".jpg");
      expect(existsSync("public" + product.image)).toBe(true);
      expect(existsSync("public" + product.fallback)).toBe(true);
      expect(product.alt).toMatch(/Vonix Hair/);
      expect(product.takes).toHaveLength(3);
    }
  });

  it("oferece prévia fotográfica no convite mobile, sem representar afiliadas", () => {
    render(<AffiliateCreatorSpotlight />);
    const peek = screen.getByTestId("affiliate-c113-mobile-product-peek");
    expect(peek).toHaveAttribute("aria-hidden", "true");
    const photos = Array.from(peek.querySelectorAll("img"));
    expect(photos).toHaveLength(3);
    for (const [index, photo] of photos.entries()) {
      expect(photo).toHaveAttribute("src", affiliateCreatorProductStories[index]!.image);
      expect(photo).toHaveAttribute("alt", "");
      expect(photo).toHaveAttribute("aria-hidden", "true");
      expect(photo).toHaveAttribute("loading", "lazy");
    }
    expect(screen.queryByTestId("affiliate-c113-product-story")).not.toBeInTheDocument();
  });

  it("mostra um produto correspondente a cada estilo sem alterar candidatura ou emitir POST", () => {
    const network = vi.spyOn(globalThis, "fetch");
    render(<AffiliateCreatorSpotlight />);
    expect(screen.queryByTestId("affiliate-c113-product-story")).not.toBeInTheDocument();
    const choices = screen.getAllByTestId("affiliate-c100-path-button");
    for (let i = 0; i < choices.length; i++) {
      fireEvent.click(choices[i]!);
      const story = screen.getByTestId("affiliate-c113-product-story");
      const product = affiliateCreatorProductStories[i]!;
      expect(story).toHaveAttribute("aria-label", "Inspiração editorial com " + product.name);
      expect(within(story).getByTestId("affiliate-c113-official-product-link")).toHaveAttribute(
        "href",
        product.href,
      );
      const image = within(story).getByTestId("affiliate-c113-official-product-image");
      expect(image).toHaveAttribute("src", product.fallback);
      expect(image).toHaveAttribute("alt", product.alt);
      expect(image).toHaveAttribute("loading", "lazy");
      expect(
        within(story).getByTestId("affiliate-c113-story-steps").querySelectorAll("li"),
      ).toHaveLength(3);
      expect(story).toHaveTextContent("não publicação de afiliada ou testemunho de uso");
      expect(story).toHaveTextContent("Não é necessário comprar produtos");
      expect(network).not.toHaveBeenCalled();
      fireEvent.click(choices[i]!);
      expect(screen.queryByTestId("affiliate-c113-product-story")).not.toBeInTheDocument();
    }
    network.mockRestore();
  });

  it("troca produtos sem acumular painéis, controles de escolha ou cartões duplicados", () => {
    render(<AffiliateCreatorSpotlight />);
    const choices = screen.getAllByTestId("affiliate-c100-path-button");
    fireEvent.click(choices[0]!);
    fireEvent.click(choices[2]!);
    expect(screen.getAllByTestId("affiliate-c113-product-story")).toHaveLength(1);
    expect(screen.getByTestId("affiliate-c113-official-product-link")).toHaveAttribute(
      "href",
      affiliateCreatorProductStories[2]!.href,
    );
    expect(choices.filter((button) => button.getAttribute("aria-pressed") === "true")).toHaveLength(
      1,
    );
    expect(screen.getAllByTestId("affiliate-c113-official-product-image")).toHaveLength(1);
  });

  it("recolher estilos no mobile elimina conteúdo temporário, sem persistir respostas", () => {
    render(<AffiliateCreatorSpotlight />);
    const toggle = screen.getByTestId("affiliate-c108-styles-toggle");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(screen.getAllByTestId("affiliate-c100-path-button")[1]!);
    expect(screen.getByTestId("affiliate-c113-product-story")).toBeInTheDocument();
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByTestId("affiliate-c113-product-story")).not.toBeInTheDocument();
    expect(screen.queryByTestId("affiliate-c100-selected-path")).not.toBeInTheDocument();
  });

  it("não produz promessa de ganhos, depoimentos de afiliadas ou disponibilidade falsa", () => {
    const source = readFileSync("src/components/affiliate-creator-product-story.tsx", "utf8");
    expect(source).not.toMatch(
      /fetch\(|axios|localStorage|sessionStorage|submit\(|POST|cupom exclusivo|ganhos garantidos/i,
    );
    for (const product of affiliateCreatorProductStories) {
      expect(product.intro).not.toMatch(
        /garant|afiliada aprovada|parceria fechada|receba gratuitamente/i,
      );
    }
  });
});
