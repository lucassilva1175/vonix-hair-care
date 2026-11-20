import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AffiliateCreatorPaths } from "@/components/affiliate-creator-paths";
import { AffiliateLandingDiscovery } from "@/components/affiliate-landing";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("C85 Vonix: imagens editoriais capilares existentes, sem prova social falsa", () => {
  it("usa as três fotos da categoria do site Vonix nos caminhos criativos sem inventar afiliadas", () => {
    const network = vi.spyOn(globalThis, "fetch");
    render(<AffiliateCreatorPaths />);
    const section = screen.getByTestId("affiliate-c54-creator-paths");
    const tabs = within(section).getAllByRole("tab");
    const panel = within(section).getByRole("tabpanel");
    const sources = [
      "/images/categorias/cachos.jpg",
      "/images/categorias/frizz.jpg",
      "/images/categorias/hidratacao.jpg",
    ];
    for (const [index, source] of sources.entries()) {
      fireEvent.click(tabs[index]!);
      const image = within(panel).getByRole("img");
      expect(image).toHaveAttribute("src", source);
      expect(image).toHaveAttribute("loading", "lazy");
      expect(image.className).toContain("object-cover");
      expect(image.getAttribute("alt")).toMatch(/ilustrativa|ilustrativa de cabelos/i);
      expect(panel).toHaveTextContent("não é depoimento");
      expect(panel).toHaveAttribute("aria-labelledby", tabs[index]!.id);
    }
    expect(section).toHaveTextContent("não representam participantes");
    expect(section).toHaveTextContent("resultados de parcerias");
    expect(screen.getByRole("link", { name: "Apresentar meu perfil" })).toHaveAttribute(
      "href",
      "#inscricao",
    );
    expect(network).not.toHaveBeenCalled();
  });

  it("combina catálogo real com três fotografias ilustrativas no roteiro de conteúdo", () => {
    const requests = vi.spyOn(globalThis, "fetch");
    const { container } = render(<AffiliateLandingDiscovery recruitmentStatus="closed" />);
    const gallery = screen.getByTestId("vonix-original-products");
    const cards = within(gallery).getAllByRole("article");
    expect(cards).toHaveLength(4);
    expect(within(cards[1]!).getByRole("img")).toHaveAttribute(
      "src",
      "/images/products/kit-cronograma-capilar.jpg",
    );
    const categorySources = [
      [0, "/images/categorias/nutricao.jpg"],
      [2, "/images/categorias/quimica.jpg"],
      [3, "/images/categorias/reconstrucao.jpg"],
    ] as const;
    for (const [index, source] of categorySources) {
      const card = cards[index]!;
      const image = within(card).getByRole("img");
      expect(image).toHaveAttribute("src", source);
      expect(image.getAttribute("alt")).toMatch(/editorial|ilustrativa/i);
      expect(image).toHaveAttribute("loading", "lazy");
      expect(image).toHaveAttribute("width", "480");
      expect(image).toHaveAttribute("height", "480");
      expect(image.className).toContain("object-cover");
      expect(card).toHaveTextContent("não é depoimento de afiliada");
      expect(card.querySelector("source[srcset*='/images/categorias/']")).toBeNull();
    }
    expect(gallery.querySelectorAll("video, audio, iframe, [autoplay]")).toHaveLength(0);
    expect(gallery).toHaveTextContent("Foto editorial de cabelos");
    expect(gallery).not.toHaveTextContent(
      /conteúdo de afiliada real|ganhos garantidos|produto gratuito/i,
    );
    expect(requests).not.toHaveBeenCalled();
  });

  it("mantém os quatro briefings originais com disclosures nativos para inspiração autêntica", () => {
    render(<AffiliateLandingDiscovery recruitmentStatus="closed" />);
    const region = screen.getByTestId("vonix-original-products");
    const disclosures = within(region).getAllByText("Ver ideia de roteiro");
    expect(disclosures).toHaveLength(4);
    const [routine, unboxing, review, editorial] = disclosures;
    for (const summary of disclosures) {
      const details = summary.closest("details");
      expect(details).not.toHaveAttribute("open");
      fireEvent.click(summary);
      expect(details).toHaveAttribute("open");
      expect(details).toHaveTextContent("Abertura original sugerida");
      expect(details).toHaveTextContent("Identifique publicidade quando houver parceria");
    }
    expect(unboxing?.closest("article")).toHaveTextContent("Unboxing");
    expect(routine?.closest("article")).toHaveTextContent("Rotina capilar");
    expect(review?.closest("article")).toHaveTextContent("Resenha sincera");
    expect(editorial?.closest("article")).toHaveTextContent("Foto editorial de cabelos");
  });

  it("não converte imagem ilustrativa em depoimento nem cria falsas promessas comerciais", () => {
    render(
      <>
        <AffiliateCreatorPaths />
        <AffiliateLandingDiscovery recruitmentStatus="closed" />
      </>,
    );
    const content = document.body.textContent ?? "";
    expect(content).toContain("Fotografias ilustrativas não identificam criadoras do programa");
    expect(content).toContain("não representam participantes");
    expect(content).not.toMatch(
      /15% no site|21% TikTok|R\$ ?30 de desconto|amostras grátis garantidas|renda garantida/i,
    );
    expect(
      screen.getAllByRole("link", { name: /Apresentar meu perfil|Conhecer a candidatura/i }).length,
    ).toBeGreaterThan(0);
  });
});
