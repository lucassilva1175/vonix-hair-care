import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const analytics = vi.hoisted(() => ({ track: vi.fn() }));
vi.mock("@/lib/analytics", () => ({ track: analytics.track }));
import { AffiliateApplicationBridge } from "@/components/affiliate-application-bridge";
import { AffiliateSimpleForm } from "@/components/affiliate-simple-form";

beforeEach(() => analytics.track.mockReset());
afterEach(() => {
  cleanup();
  window.sessionStorage.removeItem("vonix-affiliate-unconfirmed-code");
  window.sessionStorage.removeItem("vonix-affiliate-once-code");
});

describe("C125 — confiança visual e medição anônima sem falso Lead", () => {
  it("explica três etapas reais e não atribui aprovação à candidata", () => {
    render(<AffiliateApplicationBridge status="closed" />);
    expect(screen.getByRole("heading", { name: /Seu próximo passo/ })).toBeInTheDocument();
    expect(screen.getAllByText(/ETAPA/)).toHaveLength(3);
    expect(screen.getByText(/Sem aprovação ou prazo garantido/)).toBeInTheDocument();
    expect(screen.getByText(/TikTok é opcional/)).toBeInTheDocument();
    expect(screen.getByText(/nenhuma parceria, produto ou renda é garantida/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Conhecer o formulário/ })).toHaveAttribute(
      "href",
      "#inscricao",
    );
    expect(analytics.track).not.toHaveBeenCalled();
  });

  it("mede apenas o clique no CTA, sem dados pessoais e sem Meta Lead", () => {
    render(<AffiliateApplicationBridge status="open" />);
    fireEvent.click(screen.getByRole("link", { name: /Começar candidatura/ }));
    expect(analytics.track).toHaveBeenCalledExactlyOnceWith("affiliate_application_interest");
    expect(JSON.stringify(analytics.track.mock.calls)).not.toMatch(
      /sign_up|Lead|email|phone|instagram|http/i,
    );
  });

  it("mede bloqueio de validação somente na inscrição real, sem divulgar campos", () => {
    const { container } = render(<AffiliateSimpleForm />);
    const form = container.querySelector("form");
    expect(form).not.toBeNull();
    fireEvent.submit(form!);
    expect(analytics.track).toHaveBeenCalledExactlyOnceWith("affiliate_form_invalid");
    expect(JSON.stringify(analytics.track.mock.calls)).not.toMatch(
      /name|email|phone|instagram|url|sign_up/i,
    );
  });

  it("não conta erro da prévia como tentativa real", () => {
    const { container } = render(<AffiliateSimpleForm preview />);
    fireEvent.submit(container.querySelector("form")!);
    expect(analytics.track).not.toHaveBeenCalled();
  });
});
