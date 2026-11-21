import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AffiliateApplicationStepsPreview } from "@/components/affiliate-application-steps-preview";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

function setRailGeometry() {
  const rail = screen.getByTestId("vonix-c79-steps-rail");
  const cards = within(rail).getAllByTestId("vonix-c79-step-card");
  Object.defineProperties(rail, {
    scrollWidth: { configurable: true, value: 920 },
    clientWidth: { configurable: true, value: 320 },
    scrollLeft: { configurable: true, writable: true, value: 0 },
  });
  cards.forEach((card, index) => {
    Object.defineProperty(card, "offsetLeft", { configurable: true, value: index * 304 });
  });
  const scrollBy = vi.fn(({ left }: ScrollToOptions) => {
    rail.scrollLeft = Math.min(600, Math.max(0, rail.scrollLeft + Number(left ?? 0)));
    fireEvent.scroll(rail);
  });
  Object.defineProperty(rail, "scrollBy", { configurable: true, value: scrollBy });
  fireEvent.resize(window);
  return { rail, scrollBy };
}

describe("C99 — guia de três etapas com controles móveis verificáveis", () => {
  it("mantém instruções verdadeiras, três cards e controles sem formulários ou envios", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const { container } = render(<AffiliateApplicationStepsPreview />);
    const section = screen.getByTestId("vonix-c66-application-steps");
    expect(section).toHaveClass("py-6", "sm:py-14");
    const rail = within(section).getByTestId("vonix-c79-steps-rail");
    const controls = within(section).getByTestId("affiliate-c99-steps-controls");
    expect(controls).toHaveClass("flex");
    expect(within(rail).getAllByTestId("vonix-c79-step-card")).toHaveLength(3);
    expect(rail).toHaveAttribute("id", "vonix-affiliate-steps-rail");
    expect(rail).toHaveAttribute("tabindex", "0");
    expect(
      within(controls).getByRole("button", { name: "Etapa anterior da candidatura" }),
    ).toHaveAttribute("aria-controls", "vonix-affiliate-steps-rail");
    expect(
      within(controls).getByRole("button", { name: "Próxima etapa da candidatura" }),
    ).toHaveAttribute("aria-controls", "vonix-affiliate-steps-rail");
    expect(section).toHaveTextContent("TikTok é opcional");
    expect(section).toHaveTextContent("sem prazo ou aprovação garantidos");
    expect(container.querySelectorAll("form, input, video, audio, [autoplay]")).toHaveLength(0);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("avança e volta com índice sincronizado ao scroll e limites reais", () => {
    render(<AffiliateApplicationStepsPreview />);
    const { rail, scrollBy } = setRailGeometry();
    const controls = screen.getByTestId("affiliate-c99-steps-controls");
    const prev = within(controls).getByRole("button", { name: "Etapa anterior da candidatura" });
    const next = within(controls).getByRole("button", { name: "Próxima etapa da candidatura" });
    expect(controls).toHaveTextContent("1 de 3");
    expect(prev).toBeDisabled();
    expect(next).toBeEnabled();

    fireEvent.click(next);
    expect(controls).toHaveTextContent("2 de 3");
    expect(prev).toBeEnabled();
    fireEvent.click(next);
    expect(controls).toHaveTextContent("3 de 3");
    expect(next).toBeDisabled();
    expect(scrollBy).toHaveBeenCalledTimes(2);

    fireEvent.click(prev);
    expect(controls).toHaveTextContent("2 de 3");
    rail.scrollLeft = 0;
    fireEvent.scroll(rail);
    expect(controls).toHaveTextContent("1 de 3");
    expect(prev).toBeDisabled();
  });

  it("reflete gesto horizontal e respeita preferência por movimento reduzido", () => {
    vi.stubGlobal("matchMedia", () => ({ matches: true }));
    render(<AffiliateApplicationStepsPreview />);
    const { rail, scrollBy } = setRailGeometry();
    const controls = screen.getByTestId("affiliate-c99-steps-controls");
    rail.scrollLeft = 304;
    fireEvent.scroll(rail);
    expect(controls).toHaveTextContent("2 de 3");
    fireEvent.click(within(controls).getByRole("button", { name: "Próxima etapa da candidatura" }));
    expect(scrollBy).toHaveBeenCalledWith({ left: 304, behavior: "instant" });
    expect(controls).toHaveTextContent("3 de 3");
  });

  it("suporta página sem overflow sem sugerir navegação falsa", () => {
    render(<AffiliateApplicationStepsPreview />);
    const rail = screen.getByTestId("vonix-c79-steps-rail");
    Object.defineProperties(rail, {
      scrollWidth: { configurable: true, value: 760 },
      clientWidth: { configurable: true, value: 760 },
      scrollLeft: { configurable: true, value: 0 },
    });
    fireEvent.resize(window);
    const controls = screen.getByTestId("affiliate-c99-steps-controls");
    expect(
      within(controls).getByRole("button", { name: "Etapa anterior da candidatura" }),
    ).toBeDisabled();
    expect(
      within(controls).getByRole("button", { name: "Próxima etapa da candidatura" }),
    ).toBeDisabled();
    expect(controls).toHaveTextContent("1 de 3");
  });

  it("preserva SSR acessível sem criar depoimentos de afiliadas fictícias", () => {
    const html = renderToStaticMarkup(<AffiliateApplicationStepsPreview />);
    const root = document.createElement("div");
    root.innerHTML = html;
    expect(root.querySelectorAll('[data-testid="vonix-c79-step-card"]')).toHaveLength(3);
    expect(
      root.querySelectorAll('button[aria-controls="vonix-affiliate-steps-rail"]'),
    ).toHaveLength(2);
    expect(root.querySelectorAll("form")).toHaveLength(0);
    expect(root.textContent).toContain("Imagens do catálogo oficial Vonix Hair");
    expect(root.textContent).toContain("1 de 3");
  });
});
