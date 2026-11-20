import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AffiliateProgramShare } from "@/components/affiliate-program-share";
import { AffiliateEditorialHero } from "@/components/affiliate-editorial-hero";
import { PUBLIC_AFFILIATE_PAGE, PUBLIC_AFFILIATE_SHARE_TEXT } from "@/lib/affiliate-public-share";

const shareDescriptor = Object.getOwnPropertyDescriptor(navigator, "share");
const clipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, "clipboard");

function configureBrowser({
  share,
  writeText,
}: {
  share?: (payload: ShareData) => Promise<void>;
  writeText?: (text: string) => Promise<void>;
}) {
  Object.defineProperty(navigator, "share", {
    configurable: true,
    value: share,
  });
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: writeText ? { writeText } : undefined,
  });
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  if (shareDescriptor) Object.defineProperty(navigator, "share", shareDescriptor);
  else Reflect.deleteProperty(navigator, "share");
  if (clipboardDescriptor) Object.defineProperty(navigator, "clipboard", clipboardDescriptor);
  else Reflect.deleteProperty(navigator, "clipboard");
});

describe("C67 public program sharing without tracking or referral claims", () => {
  it("shows accessible sharing in C61 hero without changing selection conditions", () => {
    configureBrowser({});
    render(<AffiliateEditorialHero recruitmentStatus="open" />);
    const share = screen.getByTestId("vonix-c67-public-share");
    expect(share).toContainElement(screen.getByRole("button", { name: "Compartilhar programa" }));
    expect(share).toHaveTextContent("sem link de venda ou indicação remunerada");
    expect(screen.getByRole("link", { name: /Quero ser afiliada Vonix/i })).toHaveAttribute(
      "href",
      "#inscricao",
    );
    expect(screen.getByText("Candidaturas abertas para análise")).toBeInTheDocument();
    expect(PUBLIC_AFFILIATE_PAGE).toBe("https://vonixhair.com/seja-afiliada");
    expect(PUBLIC_AFFILIATE_PAGE).not.toMatch(/[?#]|token|code|email/i);
    expect(PUBLIC_AFFILIATE_SHARE_TEXT).toMatch(/não garante aprovação/i);
    expect(PUBLIC_AFFILIATE_SHARE_TEXT).not.toMatch(
      /indicação remunerada|cupom garantido|ganhos garantidos|15%|21%/i,
    );
  });

  it("shares using native Web Share without fallback copying", async () => {
    const share = vi.fn().mockResolvedValue(undefined);
    const writeText = vi.fn().mockResolvedValue(undefined);
    configureBrowser({ share, writeText });
    render(<AffiliateProgramShare />);
    fireEvent.click(screen.getByRole("button", { name: "Compartilhar programa" }));
    await waitFor(() => expect(share).toHaveBeenCalledOnce());
    expect(share).toHaveBeenCalledWith({
      title: "Programa de afiliadas Vonix Hair",
      text: PUBLIC_AFFILIATE_SHARE_TEXT,
      url: PUBLIC_AFFILIATE_PAGE,
    });
    await waitFor(() =>
      expect(screen.getByTestId("vonix-c67-share-feedback")).toHaveTextContent(
        "Compartilhamento concluído",
      ),
    );
    expect(writeText).not.toHaveBeenCalled();
  });

  it("copies a factual public invitation if Web Share is unavailable", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    configureBrowser({ writeText });
    render(<AffiliateProgramShare />);
    fireEvent.click(screen.getByRole("button", { name: "Compartilhar programa" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledOnce());
    expect(writeText).toHaveBeenCalledWith(
      PUBLIC_AFFILIATE_SHARE_TEXT + "\n" + PUBLIC_AFFILIATE_PAGE,
    );
    expect(screen.getByTestId("vonix-c67-share-feedback")).toHaveTextContent(
      "Convite público copiado",
    );
  });

  it("does not copy or claim success when the native sharing is canceled", async () => {
    const aborted = Object.assign(new Error("Canceled by user"), { name: "AbortError" });
    const share = vi.fn().mockRejectedValue(aborted);
    const writeText = vi.fn().mockResolvedValue(undefined);
    configureBrowser({ share, writeText });
    render(<AffiliateProgramShare />);
    fireEvent.click(screen.getByRole("button", { name: "Compartilhar programa" }));
    await waitFor(() =>
      expect(screen.getByTestId("vonix-c67-share-feedback")).toHaveTextContent(
        "Compartilhamento cancelado",
      ),
    );
    expect(writeText).not.toHaveBeenCalled();
  });

  it("does not invent success if native share and clipboard both fail", async () => {
    const share = vi.fn().mockRejectedValue(new Error("NotAllowedError"));
    const writeText = vi.fn().mockRejectedValue(new Error("blocked"));
    configureBrowser({ share, writeText });
    render(<AffiliateProgramShare />);
    fireEvent.click(screen.getByRole("button", { name: "Compartilhar programa" }));
    await waitFor(() => expect(writeText).toHaveBeenCalledOnce());
    await waitFor(() =>
      expect(screen.getByTestId("vonix-c67-share-feedback")).toHaveTextContent(
        "Não foi possível copiar ou compartilhar",
      ),
    );
  });

  it("has an honest unavailable state without browser capabilities", async () => {
    configureBrowser({});
    render(<AffiliateProgramShare />);
    fireEvent.click(screen.getByRole("button", { name: "Compartilhar programa" }));
    await waitFor(() =>
      expect(screen.getByTestId("vonix-c67-share-feedback")).toHaveTextContent(
        "Compartilhamento indisponível",
      ),
    );
  });
});
