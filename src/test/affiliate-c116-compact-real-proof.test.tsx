import { existsSync, readFileSync } from "node:fs";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import reviews from "@/data/reviews.json";
import { AffiliateCustomerVoiceTeaser } from "@/components/affiliate-customer-voice-teaser";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("C116 — prova social autêntica compacta antes da inscrição", () => {
  it("apresenta a prova real de PRODUTO em prévia compacta mobile sem prometer parcerias", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const { container } = render(<AffiliateCustomerVoiceTeaser />);
    const region = screen.getByTestId("affiliate-c101-customer-voice");
    const toggle = within(region).getByTestId("affiliate-c116-mobile-proof-toggle");
    const panel = within(region).getByTestId("affiliate-c116-proof-content");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute("aria-controls", "affiliate-c116-proof-content");
    expect(toggle).toHaveClass("sm:hidden");
    expect(toggle).toHaveTextContent("4 avaliações de produto com fotos e vídeos");
    expect(toggle).toHaveTextContent("Opiniões sobre produtos, não relatos de afiliadas");
    expect(panel).toHaveClass("hidden", "sm:grid");
    expect(panel).toHaveAttribute("id", "affiliate-c116-proof-content");
    const preview = within(toggle).getByTestId("affiliate-c116-mobile-review-poster");
    const actual = reviews.find(
      (item) => item.author === "Mariana Andrade" && item.slug === "botox-vonix",
    );
    if (!actual || actual.media.type !== "video") throw Error("Missing original published review");
    expect(preview).toHaveStyle({ backgroundImage: `url("${actual.media.poster}")` });
    expect(preview).toHaveAttribute("aria-hidden", "true");
    expect(toggle.querySelectorAll("img")).toHaveLength(0);
    expect(existsSync("public" + actual.media.poster)).toBe(true);
    expect(region).not.toHaveTextContent(/ganhos garantidos|parceria garantida/i);
    expect(container.querySelectorAll("form,input,iframe,video,[autoplay]")).toHaveLength(0);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("expande as quatro avaliações na mesma página e mantém o vídeo sob decisão da visitante", () => {
    render(<AffiliateCustomerVoiceTeaser />);
    const toggle = screen.getByTestId("affiliate-c116-mobile-proof-toggle");
    const panel = screen.getByTestId("affiliate-c116-proof-content");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(panel).toHaveClass("grid");
    expect(panel).not.toHaveClass("hidden");
    expect(within(panel).getAllByTestId("affiliate-c106-review-choice")).toHaveLength(4);
    expect(screen.queryByTestId("affiliate-c107-review-video")).not.toBeInTheDocument();
    fireEvent.click(screen.getByTestId("affiliate-c107-video-toggle"));
    expect(screen.getByTestId("affiliate-c107-review-video")).toHaveAttribute("preload", "none");
    expect(screen.getByTestId("affiliate-c107-review-video")).not.toHaveAttribute("autoplay");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(panel).toHaveClass("hidden");
    expect(screen.queryByTestId("affiliate-c107-review-video")).not.toBeInTheDocument();
  });

  it("restaura o depoimento inicial quando fecha e mantém três links e SSR acessíveis", () => {
    const { container } = render(<AffiliateCustomerVoiceTeaser />);
    const toggle = screen.getByTestId("affiliate-c116-mobile-proof-toggle");
    fireEvent.click(toggle);
    fireEvent.click(screen.getAllByTestId("affiliate-c106-review-choice")[2]!);
    expect(screen.getByTestId("affiliate-c106-active-author")).toHaveTextContent("Fernanda Assis");
    fireEvent.click(toggle);
    expect(screen.getByTestId("affiliate-c106-active-author")).toHaveTextContent("Mariana Andrade");
    expect(
      within(screen.getByTestId("affiliate-c101-customer-voice"))
        .getAllByRole("link")
        .map((link) => link.getAttribute("href")),
    ).toEqual(["#avaliacoes-produtos", "#avaliacoes-produtos", "#inscricao"]);
    expect(container.querySelectorAll("form,video,iframe")).toHaveLength(0);
    const markup = renderToStaticMarkup(<AffiliateCustomerVoiceTeaser />);
    expect(markup).toContain("affiliate-c116-mobile-proof-toggle");
    expect(markup).toContain('aria-expanded="false"');
    expect(markup).not.toContain("<video");
    const route = readFileSync("src/routes/seja-afiliada.tsx", "utf8");
    expect(route.indexOf("<AffiliateCustomerVoiceTeaser")).toBeLessThan(
      route.indexOf("<AffiliateCreatorSpotlight"),
    );
    expect(route.indexOf('id="inscricao"')).toBeGreaterThan(
      route.indexOf("<AffiliateCustomerVoiceTeaser"),
    );
  });
});
