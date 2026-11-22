import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { ProductGallery } from "@/components/product-gallery";
import { provasFor } from "@/components/provas-em-video";
import catalog from "@/data/products.json";

afterEach(cleanup);
const product = catalog.find((p) => p.slug === "progressiva-fio-de-luz")!;
const videos = provasFor(product.slug);

describe("Fio de Luz: fotos e vídeos na mesma galeria", () => {
  it("mantém todas as fotos e só carrega o vídeo selecionado, com controles e sem autoplay", () => {
    const { container } = render(<ProductGallery images={product.images} name={product.name} videos={videos} />);
    expect(screen.getByRole("img", { name: product.name })).toHaveAttribute("src", expect.stringContaining("progressiva-fio-de-luz.webp"));
    expect(screen.getAllByRole("button", { name: /^Ver imagem/ })).toHaveLength(product.images.length);
    expect(screen.getAllByRole("button", { name: /^Ver vídeo/ })).toHaveLength(videos.length);
    expect(container.querySelector("video")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Ver vídeo 1", exact: true }));
    const video = container.querySelector("video")!;
    expect(video).toHaveAttribute("src", videos[0]!.src);
    expect(video).toHaveAttribute("poster", videos[0]!.poster);
    expect(video).toHaveAttribute("controls");
    expect(video).toHaveAttribute("playsinline");
    expect(video).toHaveAttribute("preload", "none");
    expect(video).not.toHaveAttribute("autoplay");
    expect(video).not.toHaveAttribute("muted");
    fireEvent.click(screen.getByRole("button", { name: "Ver imagem 1", exact: true }));
    expect(container.querySelector("video")).toBeNull();
    expect(screen.getByRole("img", { name: product.name })).toHaveAttribute("src", expect.stringContaining("progressiva-fio-de-luz.webp"));
  });

  it("permite navegar das fotos para os vídeos no visualizador ampliado", () => {
    render(<ProductGallery images={product.images} name={product.name} videos={videos} />);
    fireEvent.click(screen.getByRole("button", { name: "Ver imagem 4", exact: true }));
    fireEvent.click(screen.getByRole("button", { name: "Ampliar imagem do produto" }));
    const dialog = screen.getByRole("dialog");
    fireEvent.click(dialog.querySelector('[aria-label="Próxima imagem"]')!);
    expect(dialog.querySelector("video")).toHaveAttribute("src", videos[0]!.src);
    expect(dialog.querySelector('[aria-label="Ampliar"]')).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Fechar", exact: true }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("preserva a grade das outras galerias sem vídeos", () => {
    render(<ProductGallery images={product.images} name={product.name} />);
    expect(screen.getByTestId("gallery-grid").querySelectorAll("img")).toHaveLength(4);
    expect(screen.queryByRole("button", { name: /^Ver vídeo/ })).not.toBeInTheDocument();
  });
});
