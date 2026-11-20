import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import sourceReviews from "@/data/reviews.json";
import {
  AffiliateVerifiedReviewPreview,
  officialProductVideoReviewCount,
} from "@/components/affiliate-verified-review-preview";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function layoutRail(element: HTMLElement, width: number, scrollWidth: number) {
  Object.defineProperty(element, "clientWidth", { configurable: true, value: width });
  Object.defineProperty(element, "scrollWidth", { configurable: true, value: scrollWidth });
  Object.defineProperty(element, "scrollLeft", { configurable: true, writable: true, value: 0 });
}

describe("C82: navegação de avaliações reais de produtos, nunca afiliadas fictícias", () => {
  it("mostra exatamente três depoimentos do catálogo oficial sem vídeos ou chamadas de rede", () => {
    const request = vi.spyOn(globalThis, "fetch");
    const { container } = render(<AffiliateVerifiedReviewPreview />);
    const section = screen.getByTestId("vonix-c65-review-preview");
    const controls = screen.getByTestId("vonix-c82-review-controls");
    expect(controls).toHaveClass("md:hidden");
    expect(officialProductVideoReviewCount).toBe(3);
    expect(controls).toHaveTextContent("3 avaliações reais de produto");
    expect(within(section).getAllByTestId("vonix-c72-review-card")).toHaveLength(3);
    for (const author of ["Mariana Andrade", "Ayla Muniz", "Fernanda Assis"]) {
      const record = sourceReviews.find((r) => r.author === author && r.slug === "botox-vonix");
      expect(record).toBeDefined();
      const card = within(section).getByText(author).closest("figure");
      expect(card).toHaveTextContent(record?.comment ?? "registro ausente");
    }
    expect(section).toHaveTextContent("Não são depoimentos de afiliadas");
    expect(
      within(section).getByRole("button", { name: "Ver avaliações anteriores" }),
    ).toBeDisabled();
    expect(within(section).getByRole("button", { name: "Ver próximas avaliações" })).toBeDisabled();
    expect(container.querySelector("video, audio, source, [autoplay], form")).toBeNull();
    expect(request).not.toHaveBeenCalled();
  });

  it("habilita setas quando o trilho excede a largura e respeita limites esquerdo/direito", () => {
    render(<AffiliateVerifiedReviewPreview />);
    const rail = screen.getByTestId("vonix-c72-product-reviews-carousel");
    layoutRail(rail, 360, 1000);
    const firstCard = within(rail).getAllByTestId("vonix-c72-review-card")[0]!;
    vi.spyOn(firstCard, "getBoundingClientRect").mockReturnValue({ width: 300 } as DOMRect);
    const scroll = vi.fn(({ left }: { left: number }) => {
      rail.scrollLeft = Math.max(
        0,
        Math.min(rail.scrollWidth - rail.clientWidth, rail.scrollLeft + left),
      );
      fireEvent.scroll(rail);
    });
    Object.defineProperty(rail, "scrollBy", { configurable: true, value: scroll });
    fireEvent.scroll(rail);
    const back = screen.getByTestId("vonix-c82-review-back");
    const next = screen.getByTestId("vonix-c82-review-next");
    expect(back).toBeDisabled();
    expect(next).toBeEnabled();
    fireEvent.click(next);
    expect(scroll).toHaveBeenCalledWith(expect.objectContaining({ left: 312 }));
    expect(back).toBeEnabled();
    fireEvent.click(next);
    fireEvent.click(next);
    expect(rail.scrollLeft).toBe(640);
    expect(next).toBeDisabled();
    fireEvent.click(back);
    expect(scroll).toHaveBeenLastCalledWith(expect.objectContaining({ left: -312 }));
    expect(next).toBeEnabled();
  });

  it("não exibe controles como ativos sem overflow e preserva links internos de conversão", () => {
    render(<AffiliateVerifiedReviewPreview />);
    const rail = screen.getByTestId("vonix-c72-product-reviews-carousel");
    layoutRail(rail, 1000, 1000);
    fireEvent.scroll(rail);
    expect(screen.getByTestId("vonix-c82-review-back")).toBeDisabled();
    expect(screen.getByTestId("vonix-c82-review-next")).toBeDisabled();
    expect(screen.getByRole("link", { name: "Ver avaliações completas" })).toHaveAttribute(
      "href",
      "#avaliacoes-produtos",
    );
    expect(screen.getByTestId("vonix-c78-proof-signup-link")).toHaveAttribute("href", "#inscricao");
  });
});
