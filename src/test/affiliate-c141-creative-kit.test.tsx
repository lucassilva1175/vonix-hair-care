import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AffiliateCreativeKitAction } from "@/components/affiliate-creative-kit-action";
import { buildCreativeBrief } from "@/lib/affiliate-creative-brief";
import { AffiliateApplicationBridge } from "@/components/affiliate-application-bridge";

const input = {
  name: "Unboxing",
  opening: "O que observar na embalagem?",
  takes: [
    "Mostre a embalagem verdadeira.",
    "Leia as informações do rótulo.",
    "Só relate o que realmente usou.",
  ],
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("C141 — kit de ideias para criadoras sem simular parceria", () => {
  it("gera roteiro original sem afirmações de uso, benefício ou renda e sem dados pessoais", () => {
    const text = buildCreativeBrief(input);
    expect(text).toContain("Unboxing");
    expect(text).toContain(input.opening);
    input.takes.forEach((take) => expect(text).toContain(take));
    expect(text).toContain("Roteiro educativo");
    expect(text).toContain("somente com experiências reais");
    expect(text).not.toMatch(/ganhe 15%|ganhe 21%|parceria garantida|resultado garantido/i);
  });

  it("copia apenas após clique e confirma somente quando o clipboard realmente resolve", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    render(<AffiliateCreativeKitAction {...input} />);
    expect(writeText).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: /copiar ideia de roteiro/i }));
    await waitFor(() => expect(screen.getByRole("status")).toHaveTextContent(/roteiro copiado/i));
    expect(writeText).toHaveBeenCalledOnce();
    expect(writeText.mock.calls[0]?.[0]).toBe(buildCreativeBrief(input));
  });

  it("em bloqueio do clipboard dá instrução honesta, sem afirmar cópia nem enviar rede", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("permission denied"));
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    render(<AffiliateCreativeKitAction {...input} />);
    fireEvent.click(screen.getByRole("button", { name: /copiar ideia de roteiro/i }));
    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(/não foi possível copiar/i),
    );
    expect(screen.queryByText(/roteiro copiado/i)).not.toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it("abre um caminho opcional dos requisitos para os quatro roteiros sem coletar dados", () => {
    render(<AffiliateApplicationBridge status="closed" onSafePreview={vi.fn()} />);
    const link = screen.getByRole("link", { name: /explorar 4 ideias de roteiro/i });
    expect(link).toHaveAttribute("href", "#formatos");
    expect(link).toHaveClass("min-h-11");
    expect(document.querySelector("form")).toBeNull();
    expect(screen.getByTestId("affiliate-c125-bridge-cta")).toHaveAttribute("href", "#inscricao");
  });

  it("sem clipboard oferece roteiro selecionável e conserva acessibilidade no mobile", async () => {
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: undefined });
    render(<AffiliateCreativeKitAction {...input} />);
    fireEvent.click(screen.getByRole("button", { name: /copiar ideia de roteiro/i }));
    expect(screen.getByRole("status")).toHaveTextContent(/não foi possível copiar/i);
    const fallback = screen.getByRole("textbox", { name: /roteiro para seleção manual/i });
    expect(fallback).toHaveValue(buildCreativeBrief(input));
    expect(fallback).toHaveAttribute("readonly");
    expect(screen.getByRole("button", { name: /copiar ideia de roteiro/i })).toHaveClass(
      "min-h-11",
    );
  });
});
