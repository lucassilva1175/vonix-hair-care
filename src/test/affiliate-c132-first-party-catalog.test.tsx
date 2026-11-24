import { cleanup, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import products from "@/data/products.json";
import { AffiliateProductDiscoveryStrip } from "@/components/affiliate-product-discovery-strip";
import { AffiliateCustomerVoiceTeaser } from "@/components/affiliate-customer-voice-teaser";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const selected = ["sos-reconstrutor-capilar", "kit-desmaia", "finalizador-kera-plus"] as const;

describe("C132 — só catálogo próprio, sem duplicar terceiros", () => {
  it("apresenta três produtos do cadastro oficial, com fotos otimizadas e links corretos", () => {
    render(<AffiliateProductDiscoveryStrip />);
    const section = screen.getByTestId("affiliate-c132-catalog");
    const cards = within(section).getAllByTestId("affiliate-c132-product-card");
    expect(cards).toHaveLength(3);
    for (const [i, card] of cards.entries()) {
      const product = products.find((item) => item.slug === selected[i]);
      expect(product).toBeDefined();
      expect(card).toHaveTextContent(product!.name);
      expect(card).toHaveTextContent(product!.categoryLabel);
      expect(card).toHaveTextContent(product!.short);
      expect(within(card).getByRole("img")).toHaveAttribute(
        "src",
        `/images/products/${selected[i]}-480.webp`,
      );
      expect(within(card).getByRole("img")).toHaveAttribute("loading", "lazy");
      expect(within(card).getByRole("link", { name: /ver produto/i })).toHaveAttribute(
        "href",
        `/produto/${selected[i]}`,
      );
    }
  });
  it("é transparente sobre o conteúdo editorial e não finge afiliadas ou resultados", () => {
    const html = renderToStaticMarkup(<AffiliateProductDiscoveryStrip />);
    expect(html).toContain("Ideias para apresentar o catálogo");
    expect(html).toMatch(/exemplos editoriais/i);
    expect(html).not.toMatch(
      /@aleandriele|@darislainedocuras|@irene__soares|lucro garantido|comissões recebidas|parcerias comprovadas|<form|<video|<iframe/i,
    );
  });
  it("remove comentários de rede não autorizados da jornada sem apagar avaliações cadastradas", () => {
    const path = readFileSync("src/routes/seja-afiliada.tsx", "utf8");
    expect(path).toContain("<AffiliateProductDiscoveryStrip");
    expect(path).not.toContain("<AffiliatePublicProductVoices");
    const teaser = readFileSync("src/components/affiliate-customer-voice-teaser.tsx", "utf8");
    expect(teaser).not.toMatch(
      /comentarios-instagram|selectedSocialComments|affiliate-c110-social-toggle|@aleandriele|@darislainedocuras|@irene__soares/,
    );
    render(<AffiliateCustomerVoiceTeaser />);
    const region = screen.getByTestId("affiliate-c101-customer-voice");
    expect(within(region).getAllByTestId("affiliate-c106-review-choice")).toHaveLength(4);
    expect(within(region).queryByTestId("affiliate-c110-social-toggle")).not.toBeInTheDocument();
  });
});
