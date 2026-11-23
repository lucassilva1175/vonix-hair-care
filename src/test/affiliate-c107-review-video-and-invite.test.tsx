import { existsSync, statSync } from "node:fs";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AffiliateCustomerVoiceTeaser } from "@/components/affiliate-customer-voice-teaser";
import { AffiliateProgramShare } from "@/components/affiliate-program-share";
import {
  PUBLIC_AFFILIATE_PAGE,
  PUBLIC_AFFILIATE_SHARE_MESSAGE,
  PUBLIC_AFFILIATE_SHARE_TEXT,
  PUBLIC_AFFILIATE_WHATSAPP_URL,
} from "@/lib/affiliate-public-share";
import reviews from "@/data/reviews.json";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const authors = ["Mariana Andrade", "Ayla Muniz", "Fernanda Assis"] as const;
const media = [
  "/depoimentos/depoimento-1.mp4",
  "/depoimentos/depoimento-2.mp4",
  "/depoimentos/depoimento-3.mp4",
] as const;

describe("C107 — vídeo de produto verdadeiro, somente sob escolha expressa", () => {
  it("na carga inicial e no SSR não existe vídeo, player ou reprodução automática", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const { container } = render(<AffiliateCustomerVoiceTeaser />);
    expect(container.querySelectorAll("video, source, iframe, [autoplay]")).toHaveLength(0);
    const toggle = screen.getByTestId("affiliate-c107-video-toggle");
    expect(toggle).toHaveAttribute(
      "aria-label",
      "Assistir vídeo da avaliação de produto de Mariana Andrade",
    );
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).not.toHaveAttribute("aria-controls");
    const ssr = renderToStaticMarkup(<AffiliateCustomerVoiceTeaser />);
    expect(ssr).not.toContain("<video");
    expect(ssr).not.toContain("autoplay");
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it.each(authors.map((author, i) => [author, media[i], i] as const))(
    "abre vídeo autêntico de %s com controles sem autoplay",
    (author, source, index) => {
      render(<AffiliateCustomerVoiceTeaser />);
      const section = screen.getByTestId("affiliate-c101-customer-voice");
      const chosen = within(section).getAllByTestId("affiliate-c106-review-choice")[index]!;
      fireEvent.click(chosen);
      const toggle = within(section).getByTestId("affiliate-c107-video-toggle");
      expect(toggle).toHaveAttribute("aria-expanded", "false");
      expect(section.querySelector("video")).toBeNull();
      fireEvent.click(toggle);
      const player = within(section).getByTestId("affiliate-c107-review-video");
      expect(player.tagName).toBe("VIDEO");
      expect(player).toHaveAttribute("controls");
      expect(player).toHaveAttribute("playsinline");
      expect(player).toHaveAttribute("preload", "none");
      expect(player).not.toHaveAttribute("autoplay");
      expect(player).toHaveAttribute("src", source);
      const review = reviews.find(
        (record) => record.slug === "botox-vonix" && record.author === author,
      );
      if (!review || review.media.type !== "video") throw new Error("Public review missing");
      expect(player).toHaveAttribute("poster", review.media.poster);
      expect(within(section).getByTestId("affiliate-c107-video-region")).toHaveTextContent(author);
      expect(within(section).getByTestId("affiliate-c107-video-region")).toHaveTextContent(
        "avaliação de produto, não um depoimento de afiliada",
      );
      expect(toggle).toHaveAttribute("aria-expanded", "true");
      expect(toggle).toHaveAttribute("aria-controls", "affiliate-c107-video-region");
      expect(existsSync("public" + source)).toBe(true);
      expect(statSync("public" + source).size).toBeGreaterThan(100000);
    },
  );

  it("botão Fechar desmonta o player e devolve o foco ao controle de origem", () => {
    render(<AffiliateCustomerVoiceTeaser />);
    const toggle = screen.getByTestId("affiliate-c107-video-toggle");
    fireEvent.click(toggle);
    expect(screen.getByTestId("affiliate-c107-review-video")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /^Fechar vídeo$/ }));
    expect(screen.queryByTestId("affiliate-c107-review-video")).not.toBeInTheDocument();
    expect(toggle).toHaveFocus();
    expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  it("trocar de cliente desativa e desmonta o vídeo anterior sem carregar outro", () => {
    const { container } = render(<AffiliateCustomerVoiceTeaser />);
    fireEvent.click(screen.getByTestId("affiliate-c107-video-toggle"));
    expect(screen.getByTestId("affiliate-c107-review-video")).toHaveAttribute("src", media[0]);
    const options = within(screen.getByTestId("affiliate-c101-customer-voice")).getAllByTestId(
      "affiliate-c106-review-choice",
    );
    fireEvent.click(options[2]!);
    expect(screen.queryByTestId("affiliate-c107-review-video")).not.toBeInTheDocument();
    expect(screen.getByTestId("affiliate-c107-video-toggle")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(
      within(screen.getByTestId("affiliate-c101-customer-voice")).getByTestId(
        "affiliate-c106-active-author",
      ),
    ).toHaveTextContent("Fernanda Assis");
    expect(container.querySelectorAll("video")).toHaveLength(0);
  });

  it("a avaliação com foto não oferece player nem vídeo fictício", () => {
    render(<AffiliateCustomerVoiceTeaser />);
    const region = screen.getByTestId("affiliate-c101-customer-voice");
    const options = within(region).getAllByTestId("affiliate-c106-review-choice");
    fireEvent.click(within(region).getByTestId("affiliate-c107-video-toggle"));
    fireEvent.click(options[3]!);
    expect(within(region).queryByTestId("affiliate-c107-video-toggle")).not.toBeInTheDocument();
    expect(within(region).queryByTestId("affiliate-c107-review-video")).not.toBeInTheDocument();
    expect(within(region).getByTestId("affiliate-c106-review-image")).toHaveAttribute(
      "src",
      "/depoimentos/depoimento-4.jpg",
    );
    expect(within(region).getByTestId("affiliate-c106-active-author")).toHaveTextContent(
      "Ana Paula",
    );
  });

  it("o vídeo não cria formulário nem muda a navegação da inscrição", () => {
    const { container } = render(<AffiliateCustomerVoiceTeaser />);
    fireEvent.click(screen.getByTestId("affiliate-c107-video-toggle"));
    const section = screen.getByTestId("affiliate-c101-customer-voice");
    const links = within(section).getAllByRole("link");
    expect(links.map((a) => a.getAttribute("href"))).toEqual([
      "#avaliacoes-produtos",
      "#avaliacoes-produtos",
      "#inscricao",
    ]);
    expect(container.querySelectorAll("form, input, [autoplay]")).toHaveLength(0);
  });
});

describe("C107 — convite público objetivo, sem falsa promessa", () => {
  it("menciona termos oficiais e limitações no mesmo convite, sem pessoa ou código privado", () => {
    expect(PUBLIC_AFFILIATE_SHARE_TEXT).toContain("candidatura gratuita");
    expect(PUBLIC_AFFILIATE_SHARE_TEXT).toContain("8%");
    expect(PUBLIC_AFFILIATE_SHARE_TEXT).toMatch(/Após aprovação/);
    expect(PUBLIC_AFFILIATE_SHARE_TEXT).toMatch(/vendas confirmadas e pagas/);
    expect(PUBLIC_AFFILIATE_SHARE_TEXT).toMatch(/sem compra de produtos ou estoque/);
    expect(PUBLIC_AFFILIATE_SHARE_TEXT).toMatch(/não garante aprovação nem ganhos/);
    expect(PUBLIC_AFFILIATE_SHARE_TEXT).toMatch(/disponibilidade e as regras/);
    expect(PUBLIC_AFFILIATE_SHARE_MESSAGE).toBe(
      PUBLIC_AFFILIATE_SHARE_TEXT + "\n" + PUBLIC_AFFILIATE_PAGE,
    );
    const whatsapp = new URL(PUBLIC_AFFILIATE_WHATSAPP_URL);
    expect(whatsapp.hostname).toBe("wa.me");
    expect([...whatsapp.searchParams.keys()]).toEqual(["text"]);
    expect(whatsapp.searchParams.get("text")).toBe(PUBLIC_AFFILIATE_SHARE_MESSAGE);
    expect(PUBLIC_AFFILIATE_PAGE).toBe("https://vonixhair.com/seja-afiliada");
    expect(PUBLIC_AFFILIATE_SHARE_MESSAGE).not.toMatch(
      /cupom garantido|ganhos garantidos|aprovação garantida|pague para entrar|15%|21%|CPF|senha|token|@|\\?code=/i,
    );
  });

  it("compartilhamento do site continua voluntário sem POST e com fallback para link público", () => {
    const networkSpy = vi.spyOn(globalThis, "fetch");
    render(<AffiliateProgramShare />);
    const share = screen.getByTestId("vonix-c67-public-share");
    const whatsapp = within(share).getByRole("link", {
      name: "Compartilhar programa pelo WhatsApp",
    });
    expect(whatsapp).toHaveAttribute("href", PUBLIC_AFFILIATE_WHATSAPP_URL);
    expect(whatsapp).toHaveAttribute("rel", "noopener noreferrer");
    expect(whatsapp).toHaveAttribute("target", "_blank");
    expect(within(share).getByRole("button", { name: "Compartilhar programa" })).toBeVisible();
    expect(networkSpy).not.toHaveBeenCalled();
  });
});
