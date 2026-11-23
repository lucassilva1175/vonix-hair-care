import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ProductGallery } from "@/components/product-gallery";
import { productGalleryVideosFor } from "@/lib/product-media";
import catalog from "@/data/products.json";

afterEach(cleanup);
const product = catalog.find((p) => p.slug === "progressiva-fio-de-luz")!;
const videos = productGalleryVideosFor(product.slug)!;

describe("Fio de Luz: fotos e vídeos na mesma galeria", () => {
  it("mantém todas as fotos e inicia o vídeo somente depois do clique na miniatura", () => {
    const { container } = render(<ProductGallery images={product.images} name={product.name} videos={videos} />);
    expect(screen.getByRole("img", { name: product.name })).toHaveAttribute("src", expect.stringContaining("progressiva-fio-de-luz.webp"));
    expect(screen.getAllByRole("button", { name: /^Ver imagem/ })).toHaveLength(product.images.length);
    expect(screen.getAllByRole("button", { name: /^Ver vídeo/ })).toHaveLength(videos.length);
    expect(container.querySelector("video")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /^Ver vídeo 1$/ }));
    const video = container.querySelector("video")!;
    expect(video).toHaveAttribute("src", videos[0]!.src);
    expect(video).toHaveAttribute("poster", videos[0]!.poster);
    expect(video).toHaveAttribute("controls");
    expect(video).toHaveAttribute("playsinline");
    expect(video).toHaveAttribute("preload", "none");
    expect(video).toHaveAttribute("autoplay");
    expect(video).not.toHaveAttribute("muted");
    fireEvent.click(screen.getByRole("button", { name: /^Ver imagem 1$/ }));
    expect(container.querySelector("video")).toBeNull();
    expect(screen.getByRole("img", { name: product.name })).toHaveAttribute("src", expect.stringContaining("progressiva-fio-de-luz.webp"));
  });

  it("permite navegar das fotos para os vídeos no visualizador ampliado", () => {
    render(<ProductGallery images={product.images} name={product.name} videos={videos} />);
    fireEvent.click(screen.getByRole("button", { name: /^Ver imagem 4$/ }));
    fireEvent.click(screen.getByRole("button", { name: "Ampliar imagem do produto" }));
    const dialog = screen.getByRole("dialog");
    fireEvent.click(dialog.querySelector('[aria-label="Próxima imagem"]')!);
    expect(dialog.querySelector("video")).toHaveAttribute("src", videos[0]!.src);
    expect(dialog.querySelector("video")).toHaveAttribute("autoplay");
    expect(dialog.querySelector('[aria-label="Ampliar"]')).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: /^Fechar$/ }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("preserva a grade das outras galerias sem vídeos", () => {
    render(<ProductGallery images={product.images} name={product.name} />);
    expect(screen.getByTestId("gallery-grid").querySelectorAll("img")).toHaveLength(4);
    expect(screen.queryByRole("button", { name: /^Ver vídeo/ })).not.toBeInTheDocument();
  });

  it("exibe a foto branca do Botox e os cinco vídeos dele, incluindo os três depoimentos", () => {
    const botox = catalog.find((p) => p.slug === "botox-vonix")!;
    const ownVideos = productGalleryVideosFor(botox.slug)!;
    const { container } = render(<ProductGallery images={botox.images.slice(0, 1)} name={botox.name} videos={ownVideos} />);
    expect(screen.getAllByRole("button", { name: /^Ver imagem/ })).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: /^Ver vídeo/ })).toHaveLength(5);
    expect(ownVideos.map((video) => video.src)).toEqual(expect.arrayContaining([
      "/depoimentos/depoimento-1.mp4", "/depoimentos/depoimento-2.mp4", "/depoimentos/depoimento-3.mp4",
    ]));
    expect(screen.getByRole("img", { name: botox.name })).toHaveAttribute("src", expect.stringContaining("botox-vonix.webp"));
    fireEvent.click(screen.getByRole("button", { name: /^Ver vídeo 2$/ }));
    expect(container.querySelector("video")).toHaveAttribute("src", "/provas/botox-2.mp4");
  });

  it("inclui os seis vídeos específicos de Fio de Luz sem as duas cópias repetidas", () => {
    expect(videos).toHaveLength(6);
    expect(videos.map((video) => video.id)).not.toContain("fio-4");
    expect(videos.map((video) => video.id)).not.toContain("ig-03");
    expect(videos.map((video) => video.src)).toContain("/provas/ig-26.mp4");
    expect(productGalleryVideosFor("kit-coco-nutri")).toBeUndefined();
  });

  it("mostra os três vídeos próprios do Banana e Mel junto da foto branca", () => {
    const banana = catalog.find((p) => p.slug === "kit-banana-e-mel")!;
    const ownVideos = productGalleryVideosFor(banana.slug)!;
    const { container } = render(<ProductGallery images={banana.images.slice(0, 1)} name={banana.name} videos={ownVideos} />);
    expect(screen.getAllByRole("button", { name: /^Ver imagem/ })).toHaveLength(1);
    expect(screen.getAllByRole("button", { name: /^Ver vídeo/ })).toHaveLength(3);
    expect(ownVideos.map((video) => video.src)).toEqual([
      "/provas/banana-mel.mp4", "/provas/banana-mel-kit-3.mp4", "/provas/banana-mel-banho-cliente.mp4",
    ]);
    fireEvent.click(screen.getByRole("button", { name: /^Ver vídeo 1$/ }));
    expect(container.querySelector("video")).toHaveAttribute("src", "/provas/banana-mel.mp4");
    expect(container.querySelector("video")).toHaveAttribute("autoplay");
  });
});
