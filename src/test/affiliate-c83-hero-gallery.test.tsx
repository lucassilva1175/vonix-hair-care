import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AffiliateEditorialHero } from "@/components/affiliate-editorial-hero";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function setGeometry(element: HTMLElement, width: number, total: number) {
  Object.defineProperty(element, "clientWidth", { configurable: true, value: width });
  Object.defineProperty(element, "scrollWidth", { configurable: true, value: total });
  Object.defineProperty(element, "scrollLeft", {
    configurable: true,
    writable: true,
    value: 0,
  });
}

describe("C83 Vonix: vitrine editorial navegável e fonte real", () => {
  it("preserva catálogo e aviso correto, sem imagens ou números de afiliadas fictícias", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const { container } = render(<AffiliateEditorialHero recruitmentStatus="closed" />);
    const hero = screen.getByTestId("vonix-affiliate-hero");
    const gallery = screen.getByTestId("vonix-c73-hero-products-region");
    const cards = within(gallery).getAllByTestId("affiliate-c61-catalog-link");
    expect(cards).toHaveLength(3);
    expect(cards.map((a) => a.getAttribute("href"))).toEqual([
      "/produto/kit-banana-e-mel",
      "/produto/mascara-reparacao-nutri-repair",
      "/produto/botox-vonix",
    ]);
    expect(
      within(hero).getByRole("link", { name: /Conhecer a marca por trás da seleção/i }),
    ).toHaveAttribute("href", "#conheca-a-vonix");
    expect(screen.getByTestId("vonix-c83-gallery-toolbar")).toHaveClass("lg:hidden");
    expect(screen.getByTestId("vonix-c83-gallery-position")).toHaveTextContent("1 / 3");
    expect(screen.getByTestId("vonix-c83-gallery-back")).toBeDisabled();
    expect(screen.getByTestId("vonix-c83-gallery-next")).toHaveAttribute("type", "button");
    expect(hero).toHaveTextContent("Não são imagens de afiliadas");
    expect(hero).not.toHaveTextContent(
      /15% no site|21% TikTok|ganhos garantidos|3 milhões de contas/i,
    );
    expect(container.querySelector("form, video, audio, iframe, [autoplay]")).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("atualiza setas e contador segundo a posição real do trilho, inclusive os extremos", () => {
    render(<AffiliateEditorialHero recruitmentStatus="open" />);
    const gallery = screen.getByTestId("vonix-c73-hero-products-region");
    setGeometry(gallery, 340, 900);
    const firstCard = within(gallery).getAllByTestId("affiliate-c61-catalog-link")[0]!;
    vi.spyOn(firstCard, "getBoundingClientRect").mockReturnValue({ width: 260 } as DOMRect);
    const scroll = vi.fn(({ left }: { left: number }) => {
      gallery.scrollLeft = Math.max(0, Math.min(560, gallery.scrollLeft + left));
      fireEvent.scroll(gallery);
    });
    Object.defineProperty(gallery, "scrollBy", { configurable: true, value: scroll });
    fireEvent.scroll(gallery);
    const back = screen.getByTestId("vonix-c83-gallery-back");
    const next = screen.getByTestId("vonix-c83-gallery-next");
    const position = screen.getByTestId("vonix-c83-gallery-position");
    expect(back).toBeDisabled();
    expect(next).toBeEnabled();
    fireEvent.click(next);
    expect(scroll).toHaveBeenCalledWith(expect.objectContaining({ left: 272 }));
    expect(position).toHaveTextContent("2 / 3");
    expect(back).toBeEnabled();
    fireEvent.click(next);
    fireEvent.click(next);
    expect(gallery.scrollLeft).toBe(560);
    expect(position).toHaveTextContent("3 / 3");
    expect(next).toBeDisabled();
    fireEvent.click(back);
    expect(scroll).toHaveBeenLastCalledWith(expect.objectContaining({ left: -272 }));
    expect(next).toBeEnabled();
    expect(position).toHaveTextContent("2 / 3");
  });

  it("não anuncia itens inexistentes e desabilita controles quando não há rolagem", () => {
    render(<AffiliateEditorialHero recruitmentStatus="limited" />);
    const gallery = screen.getByTestId("vonix-c73-hero-products-region");
    setGeometry(gallery, 1100, 1100);
    fireEvent.scroll(gallery);
    expect(screen.getByTestId("vonix-c83-gallery-back")).toBeDisabled();
    expect(screen.getByTestId("vonix-c83-gallery-next")).toBeDisabled();
    expect(screen.getByTestId("vonix-c83-gallery-position")).toHaveTextContent("1 / 3");
    expect(screen.getByRole("link", { name: /Conhecer a inscrição/i })).toHaveAttribute(
      "href",
      "#inscricao",
    );
    expect(screen.getByRole("status")).toHaveTextContent(/temporariamente limitada/);
    expect(screen.getAllByTestId("affiliate-c61-catalog-link")).toHaveLength(3);
  });

  it("navegação por roda e swipe atualiza o contador sem qualquer mutação de dados", () => {
    const network = vi.spyOn(globalThis, "fetch");
    render(<AffiliateEditorialHero recruitmentStatus="unavailable" />);
    const gallery = screen.getByTestId("vonix-c73-hero-products-region");
    setGeometry(gallery, 350, 850);
    gallery.scrollLeft = 500;
    fireEvent.scroll(gallery);
    expect(screen.getByTestId("vonix-c83-gallery-position")).toHaveTextContent("3 / 3");
    expect(screen.getByTestId("vonix-c83-gallery-next")).toBeDisabled();
    expect(screen.getByTestId("vonix-c83-gallery-back")).toBeEnabled();
    expect(network).not.toHaveBeenCalled();
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});
