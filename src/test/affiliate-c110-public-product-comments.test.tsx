import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AffiliateCustomerVoiceTeaser } from "@/components/affiliate-customer-voice-teaser";
import source from "@/data/comentarios-instagram.json";

const originals = [
  { user: "aleandriele", produto: "SOS Reconstrutor Capilar" },
  { user: "darislainedocuras", produto: "Kit Desmaia Cabelo" },
  { user: "irene__soares", produto: "Perfume Capilar Vonix" },
] as const;

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("C110 — comentários públicos sobre PRODUTOS, nunca depoimentos de afiliadas", () => {
  it("inicia recolhido no SSR e no cliente, sem novo conteúdo remoto nem anúncios falsos", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const html = renderToStaticMarkup(<AffiliateCustomerVoiceTeaser />);
    const root = document.createElement("div");
    root.innerHTML = html;
    expect(root.querySelectorAll('[data-testid="affiliate-c110-social-toggle"]')).toHaveLength(1);
    expect(root.querySelector('[data-testid="affiliate-c110-social-toggle"]')).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(root.querySelectorAll('[data-testid="affiliate-c110-social-card"]')).toHaveLength(0);
    expect(root.querySelectorAll("iframe, video, [autoplay], form, input")).toHaveLength(0);
    expect(root.textContent).not.toMatch(
      /afiliadas aprovadas|ganho comprovado|compras verificadas/i,
    );
    render(<AffiliateCustomerVoiceTeaser />);
    expect(screen.queryByTestId("affiliate-c110-social-panel")).not.toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("abre somente sob clique, anuncia estado e mantém foco no botão", () => {
    render(<AffiliateCustomerVoiceTeaser />);
    const toggle = screen.getByTestId("affiliate-c110-social-toggle");
    toggle.focus();
    expect(toggle).toHaveAttribute("type", "button");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).not.toHaveAttribute("aria-controls");
    fireEvent.click(toggle);
    const panel = screen.getByTestId("affiliate-c110-social-panel");
    expect(toggle).toHaveFocus();
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(toggle).toHaveAttribute("aria-controls", "affiliate-c110-social-comments");
    expect(panel).toHaveAttribute("id", "affiliate-c110-social-comments");
    expect(panel).toHaveAccessibleName(
      "Comentários em publicações sobre diferentes produtos Vonix",
    );
    expect(within(panel).getAllByTestId("affiliate-c110-social-card")).toHaveLength(3);
  });

  it.each(originals.map(({ user, produto }, index) => [user, produto, index] as const))(
    "preserva autoria, texto, produto e link da publicação de @%s sem reescrever",
    (user, produto, index) => {
      render(<AffiliateCustomerVoiceTeaser />);
      fireEvent.click(screen.getByTestId("affiliate-c110-social-toggle"));
      const panel = screen.getByTestId("affiliate-c110-social-panel");
      const cards = within(panel).getAllByTestId("affiliate-c110-social-card");
      const record = source.find((item) => item.user === user && item.produto === produto);
      if (!record) throw Error("Comentário oficial ausente do acervo");
      const card = cards[index]!;
      expect(card).toHaveTextContent("@" + user);
      expect(card).toHaveTextContent(record.text);
      expect(card).toHaveTextContent(produto);
      const link = within(card).getByRole("link", { name: new RegExp(user) });
      expect(link).toHaveAttribute("href", record.url);
      expect(new URL(record.url).origin).toBe("https://www.instagram.com");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    },
  );

  it("descreve honestamente origem, postagem de terceiros e ausência de compra ou afiliação comprovadas", () => {
    render(<AffiliateCustomerVoiceTeaser />);
    fireEvent.click(screen.getByTestId("affiliate-c110-social-toggle"));
    const panel = screen.getByTestId("affiliate-c110-social-panel");
    expect(panel).toHaveTextContent("Comentários já exibidos na loja Vonix");
    expect(panel).toHaveTextContent("inclusive de terceiros");
    expect(panel).toHaveTextContent("não comprovam a autoria de uma compra");
    expect(panel).toHaveTextContent("nem participação no programa de afiliadas");
    expect(panel).toHaveTextContent("Publicações e comentários podem mudar");
    expect(panel).not.toHaveTextContent(/cupom garantido|renda garantida|afiliada aprovada/i);
  });

  it("fecha e desmonta os três cards, sem carregar Instagram por iframe ou POST", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const { container } = render(<AffiliateCustomerVoiceTeaser />);
    const toggle = screen.getByTestId("affiliate-c110-social-toggle");
    fireEvent.click(toggle);
    expect(screen.getAllByTestId("affiliate-c110-social-card")).toHaveLength(3);
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).not.toHaveAttribute("aria-controls");
    expect(screen.queryByTestId("affiliate-c110-social-card")).not.toBeInTheDocument();
    expect(container.querySelectorAll("iframe, form, input, video")).toHaveLength(0);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("mantém as 4 avaliações originais do Botox e exatamente os dois destinos de ação", () => {
    render(<AffiliateCustomerVoiceTeaser />);
    const section = screen.getByTestId("affiliate-c101-customer-voice");
    fireEvent.click(screen.getByTestId("affiliate-c110-social-toggle"));
    const reviews = within(section).getAllByTestId("affiliate-c106-review-choice");
    expect(reviews).toHaveLength(4);
    fireEvent.click(reviews[3]!);
    expect(within(section).getByTestId("affiliate-c106-active-author")).toHaveTextContent(
      "Ana Paula",
    );
    expect(within(section).getByTestId("affiliate-c106-review-image")).toHaveAttribute(
      "src",
      "/depoimentos/depoimento-4.jpg",
    );
    const local = within(section)
      .getAllByRole("link")
      .filter((x) => x.getAttribute("href")?.startsWith("#"));
    expect(local.map((x) => x.getAttribute("href"))).toEqual([
      "#avaliacoes-produtos",
      "#avaliacoes-produtos",
      "#inscricao",
    ]);
    expect(within(section).getAllByTestId("affiliate-c110-social-card")).toHaveLength(3);
  });

  it("vídeo original C107 continua opcional e sem autoplay enquanto os comentários estão abertos", () => {
    const { container } = render(<AffiliateCustomerVoiceTeaser />);
    fireEvent.click(screen.getByTestId("affiliate-c110-social-toggle"));
    expect(container.querySelector("video")).toBeNull();
    fireEvent.click(screen.getAllByTestId("affiliate-c106-review-choice")[0]!);
    fireEvent.click(screen.getByTestId("affiliate-c107-video-toggle"));
    const video = screen.getByTestId("affiliate-c107-review-video");
    expect(video).toHaveAttribute("controls");
    expect(video).toHaveAttribute("preload", "none");
    expect(video).not.toHaveAttribute("autoplay");
    expect(screen.getAllByTestId("affiliate-c110-social-card")).toHaveLength(3);
    fireEvent.click(screen.getByRole("button", { name: "Fechar vídeo" }));
    expect(screen.queryByTestId("affiliate-c107-review-video")).not.toBeInTheDocument();
    expect(screen.getAllByTestId("affiliate-c110-social-card")).toHaveLength(3);
  });

  it("amostra é de três linhas de produtos distintas, sem fonte e-commerce nova ou contas fictícias", () => {
    expect(new Set(originals.map((item) => item.produto)).size).toBe(3);
    for (const item of originals) {
      const matches = source.filter(
        (record) => record.user === item.user && record.produto === item.produto,
      );
      expect(matches).toHaveLength(1);
      expect(matches[0]!.url).toMatch(/^https:\/\/www\.instagram\.com\/[^?#]+\/$/);
      expect(matches[0]!.text.length).toBeGreaterThan(8);
    }
  });
});
