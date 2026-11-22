import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import catalog from "@/data/products.json";
import sacolinhas from "@/data/sacolinhas.json";
import { ProductGallery } from "@/components/product-gallery";
import { productGalleryImagesFor, productGalleryVideosFor } from "@/lib/product-media";

afterEach(cleanup);

describe("sacolinhas nas galerias do catálogo", () => {
  it("cobre todos os produtos com arquivos completos e miniaturas locais", () => {
    expect(Object.keys(sacolinhas).sort()).toEqual(catalog.map((p) => p.slug).sort());
    for (const p of catalog) {
      const photos = productGalleryImagesFor(p.slug, p.images);
      const bag = photos[1]!;
      expect(photos[0]).toBe(p.images[0]);
      expect(bag).toBe(`/images/sacolinhas/${p.slug}.webp`);
      expect(existsSync(resolve("public", bag.slice(1)))).toBe(true);
      expect(existsSync(resolve("public", bag.slice(1).replace(/\.webp$/, "-480.webp")))).toBe(true);
      const previous = productGalleryVideosFor(p.slug) ? p.images.slice(0, 1) : p.images;
      expect(photos.filter((src) => src !== bag)).toEqual(previous);
      expect(photos.filter((src) => src === bag)).toHaveLength(1);
    }
  });

  it("alterna foto branca e sacolinha e mantém reprodução dos vídeos com um clique", () => {
    const product = catalog.find((p) => p.slug === "kit-banana-e-mel")!;
    const videos = productGalleryVideosFor(product.slug)!;
    const images = productGalleryImagesFor(product.slug, product.images);
    const { container } = render(<ProductGallery name={product.name} images={images} videos={videos} />);
    expect(container.querySelector("video")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Ver imagem 2", exact: true }));
    expect(screen.getByRole("img", { name: product.name })).toHaveAttribute("src", images[1]);
    fireEvent.click(screen.getByRole("button", { name: "Ver vídeo 1", exact: true }));
    expect(container.querySelector("video")).toHaveAttribute("src", videos[0]!.src);
    expect(container.querySelector("video")).toHaveAttribute("autoplay");
    fireEvent.click(screen.getByRole("button", { name: "Ver imagem 1", exact: true }));
    expect(container.querySelector("video")).toBeNull();
  });
});
