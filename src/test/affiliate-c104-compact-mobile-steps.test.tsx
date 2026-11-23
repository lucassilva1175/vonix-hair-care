import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { existsSync, readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AffiliateApplicationStepsPreview } from "@/components/affiliate-application-steps-preview";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("C104 — percurso compacto mobile/tablet sem perder a explicação", () => {
  it("reserva as três etapas curtas para telas menores e os cards ilustrados para desktop", () => {
    const { container } = render(<AffiliateApplicationStepsPreview />);
    const region = screen.getByTestId("vonix-c66-application-steps");
    const cards = within(region).getAllByTestId("vonix-c79-step-card");
    expect(region).toHaveClass("py-4", "sm:py-6", "lg:py-14");
    expect(cards).toHaveLength(3);
    for (const card of cards) {
      const compact = card.querySelector(".lg\\:hidden");
      const desktop = card.querySelector(".hidden.lg\\:block");
      expect(compact).not.toBeNull();
      expect(desktop).not.toBeNull();
      expect(within(card).getByTestId("affiliate-c104-step-toggle")).toHaveAttribute(
        "aria-expanded",
        "false",
      );
    }
    expect(container.querySelectorAll('[data-testid="affiliate-c99-steps-controls"]')).toHaveLength(
      0,
    );
    expect(container.querySelectorAll("form, input, video, iframe")).toHaveLength(0);
  });

  it("retém fotos reais da loja só no conjunto desktop e não inventa endossos", () => {
    render(<AffiliateApplicationStepsPreview />);
    const section = screen.getByTestId("vonix-c66-application-steps");
    const images = [...section.querySelectorAll("img")];
    expect(images).toHaveLength(3);
    expect(images.map((item) => item.getAttribute("src"))).toEqual([
      "/images/products/kit-banana-e-mel.webp",
      "/images/products/kit-cronograma-capilar.webp",
      "/images/products/botox-vonix.webp",
    ]);
    for (const img of images) {
      expect(img).toHaveAttribute("loading", "lazy");
      expect(img).toHaveAttribute("decoding", "async");
      expect(img.closest(".hidden.lg\\:block")).not.toBeNull();
      expect(existsSync("public" + img.getAttribute("src"))).toBe(true);
    }
    expect(section).toHaveTextContent("não de afiliadas ou de parcerias");
    expect(section).not.toHaveTextContent(/ganho garantido|testemunho de afiliada|Skence/i);
  });

  it("expõe as condições obrigatórias sem disparar rede e preserva navegação por foco", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<AffiliateApplicationStepsPreview />);
    const toggles = screen.getAllByTestId("affiliate-c104-step-toggle");
    const first = toggles[0]!;
    first.focus();
    expect(document.activeElement).toBe(first);
    fireEvent.click(first);
    expect(first).toHaveAttribute("aria-expanded", "true");
    const detail = screen.getAllByTestId("affiliate-c104-step-detail")[0]!;
    expect(detail).not.toHaveAttribute("hidden");
    expect(detail).toHaveTextContent("TikTok é opcional");
    expect(detail).toHaveTextContent("não é preciso comprar produtos");
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(document.activeElement).toBe(first);
  });

  it("preserva SSR, prova de produto antes e etapas opcionais depois da inscrição", () => {
    const markup = renderToStaticMarkup(<AffiliateApplicationStepsPreview />);
    const source = readFileSync("src/routes/seja-afiliada.tsx", "utf8");
    const stepsIndex = source.indexOf("<AffiliateApplicationStepsPreview />");
    const spotlightIndex = source.indexOf("<AffiliateCreatorSpotlight />");
    const reviewIndex = source.indexOf("<AffiliateCustomerVoiceTeaser />");
    const formIndex = source.indexOf('id="inscricao"');
    expect(stepsIndex).toBeGreaterThan(0);
    expect(stepsIndex).toBeLessThan(spotlightIndex);
    expect(formIndex).toBeLessThan(stepsIndex);
    expect(reviewIndex).toBeLessThan(formIndex);
    const root = document.createElement("div");
    root.innerHTML = markup;
    expect(root.querySelectorAll("#como-funciona")).toHaveLength(1);
    expect(root.querySelectorAll("#candidatura-etapas")).toHaveLength(1);
    expect(root.querySelectorAll('[data-testid="vonix-c79-step-card"]')).toHaveLength(3);
    expect(root.querySelectorAll("form")).toHaveLength(0);
  });
});
