import { existsSync, readFileSync } from "node:fs";
import { cleanup, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import reviews from "@/data/reviews.json";
import { AffiliateCustomerVoiceTeaser } from "@/components/affiliate-customer-voice-teaser";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("C101 — depoimento de produto autêntico antes do formulário", () => {
  it("usa o comentário publicado na loja, sem atribuir parceria ou compra verificada", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const actual = reviews.find(
      (item) => item.slug === "botox-vonix" && item.author === "Mariana Andrade",
    );
    expect(actual).toBeTruthy();
    const { container } = render(<AffiliateCustomerVoiceTeaser />);
    const region = screen.getByTestId("affiliate-c101-customer-voice");
    expect(region).toHaveTextContent(actual!.comment);
    expect(region).toHaveTextContent(actual!.author);
    expect(region).toHaveTextContent("Avaliação de produto, não depoimento de afiliada");
    expect(region).toHaveTextContent("Não comprova compra verificada");
    expect(region).toHaveTextContent("Ver as 4 avaliações completas");
    expect(container.querySelectorAll("form, input, video, [autoplay], button")).toHaveLength(0);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("apresenta a imagem do mesmo registro da avaliação, que existe no catálogo", () => {
    const review = reviews.find(
      (item) => item.author === "Mariana Andrade" && item.slug === "botox-vonix",
    );
    if (!review || review.media.type !== "video") throw new Error("Review with poster missing");
    render(<AffiliateCustomerVoiceTeaser />);
    const image = screen.getByRole("img");
    expect(image).toHaveAttribute("src", review.media.poster);
    expect(image.getAttribute("alt")).toContain(review.author);
    expect(existsSync("public" + review.media.poster)).toBe(true);
  });

  it("permite acessar avaliações completas e formulário real, sem criar cadastro paralelo", () => {
    render(<AffiliateCustomerVoiceTeaser />);
    const links = within(screen.getByTestId("affiliate-c101-customer-voice")).getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "#avaliacoes-produtos",
      "#avaliacoes-produtos",
      "#inscricao",
    ]);
    expect(
      screen.getByRole("navigation", { name: "Ações relacionadas à avaliação de produto" }),
    ).toBeInTheDocument();
  });

  it("mantém SSR estável, depois do seletor C100 e antes do formulário", () => {
    const markup = renderToStaticMarkup(<AffiliateCustomerVoiceTeaser />);
    expect(markup).toContain("affiliate-c101-customer-voice");
    expect(markup).not.toContain("Autoplay");
    const source = readFileSync("src/routes/seja-afiliada.tsx", "utf8");
    const c100 = source.indexOf("<AffiliateCreatorSpotlight />");
    const c101 = source.indexOf("<AffiliateCustomerVoiceTeaser />");
    const form = source.indexOf("<AffiliateSimpleForm");
    expect(c100).toBeGreaterThan(-1);
    expect(c101).toBeGreaterThan(c100);
    expect(form).toBeGreaterThan(c101);
  });
});
