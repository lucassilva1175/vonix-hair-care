import { existsSync, readFileSync } from "node:fs";
import { cleanup, render, screen } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AffiliateApplicationEditorialArt } from "@/components/affiliate-application-editorial-art";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("C115 — entrada editorial da candidatura, sem criar passos", () => {
  it("usa apenas fotografia existente de produto oficial, com origem e limites explícitos", () => {
    render(<AffiliateApplicationEditorialArt />);
    const art = screen.getByTestId("affiliate-c115-form-editorial-art");
    const photo = screen.getByTestId("affiliate-c115-form-product-photo");
    expect(photo).toHaveAttribute("src", "/images/products/kit-cronograma-capilar.jpg");
    expect(photo).toHaveAttribute("alt", expect.stringContaining("catálogo oficial Vonix Hair"));
    expect(photo).toHaveAttribute("loading", "lazy");
    expect(photo).toHaveAttribute("decoding", "async");
    expect(existsSync("public/images/products/kit-cronograma-capilar.jpg")).toBe(true);
    expect(existsSync("public/images/products/kit-cronograma-capilar.webp")).toBe(true);
    expect(art).toHaveTextContent("A candidatura é gratuita");
    expect(art).toHaveTextContent("não de afiliada participante");
    expect(art).toHaveTextContent("não garante aprovação, kits ou remuneração");
  });

  it("oculta somente o conteúdo decorativo em mobile, mantendo o formulário visível", () => {
    const network = vi.spyOn(globalThis, "fetch");
    const { container } = render(<AffiliateApplicationEditorialArt />);
    const art = screen.getByTestId("affiliate-c115-form-editorial-art");
    expect(art).toHaveClass("hidden", "lg:flex");
    expect(art.querySelectorAll("img")).toHaveLength(1);
    expect(container.querySelectorAll("form,input,button,iframe,video,textarea")).toHaveLength(0);
    expect(container.querySelectorAll("a")).toHaveLength(0);
    expect(network).not.toHaveBeenCalled();
    const ssr = renderToStaticMarkup(<AffiliateApplicationEditorialArt />);
    expect(ssr).toContain("kit-cronograma-capilar.webp");
    expect(ssr).toContain("A candidatura é gratuita");
  });

  it("preserva dados e navegação C112, muda apenas o cabeçalho sem inserir novo cadastro", () => {
    const source = readFileSync("src/routes/seja-afiliada.tsx", "utf8");
    expect(source).toContain('data-testid="affiliate-c115-form-intro"');
    expect(source).toContain("<AffiliateApplicationEditorialArt />");
    expect(source).toContain("lg:grid-cols-[minmax(0,1.25fr)_minmax(15rem,.75fr)]");
    expect(source).toContain('id="inscricao"');
    expect(source).toContain("Sua inscrição, de um jeito simples.");
    expect(source).toContain('data-testid="affiliate-c112-form-essentials"');
    expect(source).toContain('data-testid="affiliate-c112-form-status"');
    expect(source).toContain('to="/consultar-candidatura"');
    expect(source).toContain("Após um envio confirmado, guarde o código privado");
    expect(source).toContain("<AffiliateSimpleForm");
    for (const label of [
      "18 anos ou mais",
      "E-mail válido obrigatório",
      "Instagram com seguidores",
      "TikTok opcional",
      "Consultar meu status pelo código",
    ]) {
      expect(source).toContain(label);
    }
    expect(source).not.toContain("ganhos garantidos");
  });
});
