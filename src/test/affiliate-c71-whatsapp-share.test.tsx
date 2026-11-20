import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AffiliateProgramShare } from "@/components/affiliate-program-share";
import { AffiliateEditorialHero } from "@/components/affiliate-editorial-hero";
import {
  PUBLIC_AFFILIATE_PAGE,
  PUBLIC_AFFILIATE_SHARE_MESSAGE,
  PUBLIC_AFFILIATE_SHARE_TEXT,
  PUBLIC_AFFILIATE_WHATSAPP_URL,
} from "@/lib/affiliate-public-share";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("C71 — divulgação pública Vonix pelo WhatsApp", () => {
  it("compõe exclusivamente o convite factual existente e a URL pública canônica", () => {
    expect(PUBLIC_AFFILIATE_SHARE_MESSAGE).toBe(
      PUBLIC_AFFILIATE_SHARE_TEXT + "\n" + PUBLIC_AFFILIATE_PAGE,
    );
    const link = new URL(PUBLIC_AFFILIATE_WHATSAPP_URL);
    expect(link.origin).toBe("https://wa.me");
    expect(link.pathname).toBe("/");
    expect([...link.searchParams.keys()]).toEqual(["text"]);
    expect(link.searchParams.get("text")).toBe(PUBLIC_AFFILIATE_SHARE_MESSAGE);
    expect(link.searchParams.get("text")).toContain("candidatura gratuita");
    expect(link.searchParams.get("text")).toContain("não garante aprovação");
    expect(link.searchParams.get("text")).toContain("https://vonixhair.com/seja-afiliada");
    expect(PUBLIC_AFFILIATE_PAGE).not.toMatch(/[?#]|token|code|email/i);
    expect(PUBLIC_AFFILIATE_SHARE_MESSAGE).not.toMatch(
      /ganhos garantidos|cupom garantido|15%|21%|telefone|CPF|@|indicação remunerada/i,
    );
  });

  it("mostra ações independentes com rótulos acessíveis e link voluntário protegido", () => {
    render(<AffiliateProgramShare />);
    const section = screen.getByTestId("vonix-c67-public-share");
    expect(within(section).getByRole("button", { name: "Compartilhar programa" })).toBeVisible();
    const link = within(section).getByRole("link", {
      name: "Compartilhar programa pelo WhatsApp",
    });
    expect(link).toHaveAttribute("href", PUBLIC_AFFILIATE_WHATSAPP_URL);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link).toHaveAttribute("aria-describedby", "vonix-c67-share-disclaimer");
    expect(link.className).toContain("min-h-[44px]");
    expect(within(section).getByText(/sem link de venda ou indicação remunerada/)).toBeVisible();
    expect(screen.getByTestId("vonix-c67-share-feedback")).toBeEmptyDOMElement();
  });

  it.each(["open", "closed"] as const)(
    "preserva o CTA de candidatura em estado %s, com WhatsApp no próprio hero",
    (status) => {
      render(<AffiliateEditorialHero recruitmentStatus={status} />);
      const hero = screen.getByTestId("vonix-affiliate-hero");
      const action = within(hero).getByRole("link", {
        name: "Compartilhar programa pelo WhatsApp",
      });
      expect(action).toHaveAttribute("href", PUBLIC_AFFILIATE_WHATSAPP_URL);
      expect(within(hero).getByTestId("vonix-c67-public-share")).toContainElement(action);
      expect(hero.querySelector('a[href="#inscricao"]')).not.toBeNull();
      expect(hero).not.toHaveTextContent("afiliadas aprovadas garantidas");
    },
  );

  it("clicar em compartilhar normalmente não aciona URL externa automaticamente", () => {
    render(<AffiliateProgramShare />);
    const link = screen.getByRole("link", { name: "Compartilhar programa pelo WhatsApp" });
    expect(link).toHaveAttribute("href", PUBLIC_AFFILIATE_WHATSAPP_URL);
    expect(screen.getByTestId("vonix-c67-share-feedback")).toBeEmptyDOMElement();
    // A navegação para o WhatsApp fica inteiramente sob controle do usuário.
    expect(link.tagName).toBe("A");
    expect(link).not.toHaveAttribute("download");
    expect(link).not.toHaveAttribute("ping");
    expect(screen.queryByRole("button", { name: /Enviar mensagem automaticamente/i })).toBeNull();
  });
});
