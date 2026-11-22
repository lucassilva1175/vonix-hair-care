import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AffiliateApplicationStepsPreview } from "@/components/affiliate-application-steps-preview";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("C99 → C104: três etapas progressivas sem navegação falsa", () => {
  it("mantém três cards, fontes oficiais e âncoras existentes", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const { container } = render(<AffiliateApplicationStepsPreview />);
    const section = screen.getByTestId("vonix-c66-application-steps");
    const rail = screen.getByTestId("vonix-c79-steps-rail");
    expect(section).toHaveAttribute("id", "candidatura-etapas");
    expect(section.querySelector("#como-funciona")).not.toBeNull();
    expect(rail).toHaveAttribute("id", "vonix-affiliate-steps-rail");
    expect(rail).toHaveAttribute("tabindex", "0");
    expect(within(rail).getAllByTestId("vonix-c79-step-card")).toHaveLength(3);
    expect(section).toHaveTextContent("TikTok é opcional");
    expect(section).toHaveTextContent("sem prazo ou aprovação garantidos");
    expect(section).toHaveTextContent("Imagens do catálogo oficial Vonix Hair");
    expect(container.querySelector("form, input, video, audio, [autoplay]")).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("oferece três botões acessíveis com detalhes inicialmente recolhidos", () => {
    render(<AffiliateApplicationStepsPreview />);
    const toggles = screen.getAllByTestId("affiliate-c104-step-toggle");
    const details = screen.getAllByTestId("affiliate-c104-step-detail");
    expect(toggles).toHaveLength(3);
    expect(details).toHaveLength(3);
    for (let index = 0; index < 3; index += 1) {
      expect(toggles[index]).toHaveAttribute("type", "button");
      expect(toggles[index]).toHaveAttribute("aria-expanded", "false");
      expect(toggles[index]).toHaveAttribute(
        "aria-controls",
        "affiliate-c104-step-detail-" + (index + 1),
      );
      expect(details[index]).toHaveAttribute("id", "affiliate-c104-step-detail-" + (index + 1));
      expect(details[index]).toHaveAttribute("hidden");
      expect(toggles[index]).toHaveClass("min-h-14");
    }
    expect(screen.queryByTestId("affiliate-c99-steps-controls")).toBeNull();
  });

  it("abre uma etapa por vez e recolhe a mesma etapa ao clicar novamente", () => {
    render(<AffiliateApplicationStepsPreview />);
    const toggles = screen.getAllByTestId("affiliate-c104-step-toggle");
    const details = screen.getAllByTestId("affiliate-c104-step-detail");
    fireEvent.click(toggles[0]!);
    expect(toggles[0]).toHaveAttribute("aria-expanded", "true");
    expect(details[0]).not.toHaveAttribute("hidden");
    expect(details[0]).toHaveTextContent("não é preciso comprar produtos");
    fireEvent.click(toggles[2]!);
    expect(details[0]).toHaveAttribute("hidden");
    expect(details[2]).not.toHaveAttribute("hidden");
    expect(details[2]).toHaveTextContent("não ativa um vínculo, comissão ou parceria");
    fireEvent.click(toggles[2]!);
    expect(details.every((item) => item.hasAttribute("hidden"))).toBe(true);
  });

  it("mantém imagens oficiais, rótulos úteis e link real para acompanhar", () => {
    render(<AffiliateApplicationStepsPreview />);
    const section = screen.getByTestId("vonix-c66-application-steps");
    const images = within(section).getAllByRole("img", { hidden: true });
    expect(images.map((image) => image.getAttribute("src"))).toEqual([
      "/images/products/kit-banana-e-mel.webp",
      "/images/products/kit-cronograma-capilar.webp",
      "/images/products/botox-vonix.webp",
    ]);
    expect(images.every((img) => img.getAttribute("alt")?.includes("Vonix"))).toBe(true);
    expect(
      within(section).getByRole("link", { name: /Acompanhe sua candidatura/ }),
    ).toHaveAttribute("href", "/consultar-candidatura");
    expect(section).not.toHaveTextContent(
      /ganhos garantidos|aprovação automática|depoimentos de afiliadas reais/i,
    );
  });

  it("preserva SSR e informações sem criar formulários ou cliques automáticos", () => {
    const html = renderToStaticMarkup(<AffiliateApplicationStepsPreview />);
    const root = document.createElement("div");
    root.innerHTML = html;
    expect(root.querySelectorAll('[data-testid="vonix-c79-step-card"]')).toHaveLength(3);
    expect(root.querySelectorAll('[data-testid="affiliate-c104-step-toggle"]')).toHaveLength(3);
    expect(
      root.querySelectorAll('[data-testid="affiliate-c104-step-detail"][hidden]'),
    ).toHaveLength(3);
    expect(root.querySelectorAll("img")).toHaveLength(3);
    expect(root.querySelectorAll("form, input, video, iframe")).toHaveLength(0);
    expect(root.textContent).toContain("Se o envio for confirmado, guarde o código");
  });
});
