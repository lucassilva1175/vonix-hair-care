import { existsSync } from "node:fs";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import reviews from "@/data/reviews.json";
import { AffiliateCustomerVoiceTeaser } from "@/components/affiliate-customer-voice-teaser";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const authors = ["Mariana Andrade", "Ayla Muniz", "Fernanda Assis", "Ana Paula"] as const;
const mediaPaths = [
  "/depoimentos/depoimento-1-poster.jpg",
  "/depoimentos/depoimento-2-poster.jpg",
  "/depoimentos/depoimento-3-poster.jpg",
  "/depoimentos/depoimento-4.jpg",
] as const;

describe("C106 — experiências autênticas de PRODUTO antes do formulário", () => {
  it("origem e vínculo entre pessoa, comentário, mídia e produto são exatos", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<AffiliateCustomerVoiceTeaser />);
    const root = screen.getByTestId("affiliate-c101-customer-voice");
    const choices = within(root).getAllByTestId("affiliate-c106-review-choice");
    expect(choices).toHaveLength(4);
    expect(root).toHaveTextContent("Avaliações de produto, não depoimentos de afiliadas");
    expect(root).toHaveTextContent("Não comprovam compra verificada");
    const group = within(root).getByRole("group", { name: /Selecionar avaliações de clientes/ });
    expect(group).toHaveAttribute("data-testid", "affiliate-c106-review-choices");
    authors.forEach((name, index) => {
      const button = within(root).getByRole("button", {
        name: "Ver avaliação de produto de " + name,
      });
      expect(button).toBe(choices[index]);
      expect(button).toHaveAttribute("type", "button");
      expect(button).toHaveAttribute("aria-controls", "affiliate-c106-review-panel");
      expect(button).toHaveAttribute("aria-pressed", index === 0 ? "true" : "false");
      expect(existsSync("public" + mediaPaths[index])).toBe(true);
      expect(
        reviews.find((entry) => entry.slug === "botox-vonix" && entry.author === name),
      ).toBeTruthy();
    });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("permite alternância manual de 4 comentários com autor e mídia correspondentes", () => {
    render(<AffiliateCustomerVoiceTeaser />);
    const root = screen.getByTestId("affiliate-c101-customer-voice");
    const buttons = within(root).getAllByTestId("affiliate-c106-review-choice");
    for (const [index, name] of authors.entries()) {
      buttons[index]!.focus();
      fireEvent.click(buttons[index]!);
      const record = reviews.find((entry) => entry.author === name && entry.slug === "botox-vonix");
      if (!record) throw new Error("Missing review: " + name);
      expect(within(root).getByTestId("affiliate-c106-active-author")).toHaveTextContent(name);
      expect(within(root).getByTestId("affiliate-c106-active-comment")).toHaveTextContent(
        record.comment,
      );
      expect(within(root).getByTestId("affiliate-c106-review-image")).toHaveAttribute(
        "src",
        mediaPaths[index],
      );
      expect(within(root).getByTestId("affiliate-c106-review-image").getAttribute("alt")).toContain(
        name,
      );
      expect(buttons[index]).toHaveFocus();
      expect(buttons.filter((item) => item.getAttribute("aria-pressed") === "true")).toHaveLength(
        1,
      );
    }
    fireEvent.click(buttons[0]!);
    expect(within(root).getByTestId("affiliate-c106-active-comment")).toHaveTextContent(
      "Produto maravilhoso ❤️ eu amei trabalhar com ele",
    );
  });

  it("imagem de Ana Paula é foto, não cria vídeo ou falso selo de compra", () => {
    render(<AffiliateCustomerVoiceTeaser />);
    const section = screen.getByTestId("affiliate-c101-customer-voice");
    fireEvent.click(
      within(section).getByRole("button", { name: /Ver avaliação de produto de Ana Paula/i }),
    );
    const img = within(section).getByTestId("affiliate-c106-review-image");
    expect(img).toHaveAttribute("src", "/depoimentos/depoimento-4.jpg");
    expect(img.getAttribute("alt")).toContain("Foto publicada junto à avaliação");
    expect(section.querySelectorAll("video, iframe, [autoplay], form, input")).toHaveLength(0);
    expect(section.textContent).not.toMatch(
      /afiliada aprovada|compra verificada de Ana|renda comprovada/i,
    );
  });

  it("mantém links e ação original única sem inserir formulário paralelo", () => {
    const { container } = render(<AffiliateCustomerVoiceTeaser />);
    const section = screen.getByTestId("affiliate-c101-customer-voice");
    expect(
      within(section).getByRole("navigation", {
        name: /Ações relacionadas à avaliação de produto/,
      }),
    ).toBeInTheDocument();
    const hrefs = [...section.querySelectorAll("a")].map((a) => a.getAttribute("href"));
    expect(hrefs).toEqual(["#avaliacoes-produtos", "#avaliacoes-produtos", "#inscricao"]);
    expect(container.querySelectorAll("form")).toHaveLength(0);
    expect(within(section).getAllByRole("img")).toHaveLength(1);
  });

  it("SSR inicial é estável e não contém endosso inventado de afiliadas", () => {
    const html = renderToStaticMarkup(<AffiliateCustomerVoiceTeaser />);
    const root = document.createElement("div");
    root.innerHTML = html;
    expect(root.querySelectorAll('[data-testid="affiliate-c106-review-choice"]')).toHaveLength(4);
    expect(root.querySelectorAll('[aria-pressed="true"]')).toHaveLength(1);
    expect(root.querySelectorAll("img")).toHaveLength(1);
    expect(root.querySelectorAll("form, video, iframe, [autoplay]")).toHaveLength(0);
    expect(root.textContent).toContain("Mariana Andrade");
    expect(root.textContent).toContain("não depoimentos de afiliadas");
  });
});
