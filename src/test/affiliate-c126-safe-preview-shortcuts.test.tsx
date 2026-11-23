import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const analytics = vi.hoisted(() => ({ track: vi.fn() }));
vi.mock("@/lib/analytics", () => ({ track: analytics.track }));

import { AffiliateApplicationBridge } from "@/components/affiliate-application-bridge";
import { AffiliateEditorialHero } from "@/components/affiliate-editorial-hero";

beforeEach(() => analytics.track.mockReset());
afterEach(() => cleanup());

describe("C126 — atalhos para prévia segura, sem candidatura implícita", () => {
  it("abre a prévia diretamente na ponte quando o envio não está disponível", () => {
    const onSafePreview = vi.fn();
    render(<AffiliateApplicationBridge status="closed" onSafePreview={onSafePreview} />);
    const link = screen.getByTestId("affiliate-c125-bridge-cta");
    expect(link).toHaveAttribute("href", "#inscricao");
    expect(link).toHaveTextContent(/prévia segura/i);
    fireEvent.click(link);
    expect(onSafePreview).toHaveBeenCalledTimes(1);
    expect(analytics.track).toHaveBeenCalledExactlyOnceWith("affiliate_application_interest");
    expect(JSON.stringify(analytics.track.mock.calls)).not.toMatch(
      /sign_up|Lead|email|phone|instagram|https?:/i,
    );
  });

  it("mantém a inscrição real na ponte apenas quando o servidor sinalizou OPEN", () => {
    const onSafePreview = vi.fn();
    render(<AffiliateApplicationBridge status="open" onSafePreview={onSafePreview} />);
    fireEvent.click(screen.getByTestId("affiliate-c125-bridge-cta"));
    expect(onSafePreview).not.toHaveBeenCalled();
    expect(screen.getByTestId("affiliate-c125-bridge-cta")).toHaveTextContent(
      "Começar candidatura",
    );
  });

  it("oferece prévia de um clique pelo CTA principal mesmo durante loading", () => {
    const onSafePreview = vi.fn();
    render(<AffiliateEditorialHero recruitmentStatus="loading" onSafePreview={onSafePreview} />);
    const cta = screen.getByRole("link", { name: /Conhecer a inscrição/i });
    expect(screen.getByText(/abre apenas uma prévia segura/i)).toBeInTheDocument();
    expect(cta).toHaveAttribute("href", "#inscricao");
    fireEvent.click(cta);
    expect(onSafePreview).toHaveBeenCalledTimes(1);
    expect(analytics.track).toHaveBeenCalledExactlyOnceWith("affiliate_application_interest");
  });

  it("não inicia prévia se o recrutamento já estiver OPEN", () => {
    const onSafePreview = vi.fn();
    render(<AffiliateEditorialHero recruitmentStatus="open" onSafePreview={onSafePreview} />);
    fireEvent.click(screen.getByRole("link", { name: /Quero ser afiliada Vonix/i }));
    expect(onSafePreview).not.toHaveBeenCalled();
    expect(analytics.track).toHaveBeenCalledExactlyOnceWith("affiliate_application_interest");
  });
});
