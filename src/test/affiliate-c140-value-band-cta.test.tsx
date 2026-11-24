import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const metrics = vi.hoisted(() => ({ trackAffiliateFunnel: vi.fn() }));
vi.mock("@/lib/affiliate-funnel", () => metrics);
import { AffiliateEarlyValueBand } from "@/components/affiliate-early-value-band";
import { AffiliateLandingOffer } from "@/components/affiliate-landing";

afterEach(() => {
  cleanup();
  metrics.trackAffiliateFunnel.mockClear();
});

describe("C140 — conversão direta na faixa de valor, sem falsas promessas", () => {
  it("mantém CTA real após aprovação OPEN com foco, destino único e regras acessíveis", () => {
    const preview = vi.fn();
    render(<AffiliateEarlyValueBand recruitmentOpen onSafePreview={preview} />);
    const band = screen.getByTestId("affiliate-c61-eligibility-facts");
    const action = within(band).getByTestId("affiliate-c140-value-apply");
    expect(action).toHaveAttribute("href", "#inscricao");
    expect(action).toHaveTextContent("Fazer inscrição");
    expect(action).toHaveAttribute("data-availability", "open");
    expect(action).toHaveClass("min-h-11", "focus-visible:outline-2");
    expect(within(band).getByRole("link", { name: "Ver regras" })).toHaveAttribute(
      "href",
      "#ganhos",
    );
    fireEvent.click(action);
    expect(preview).not.toHaveBeenCalled();
    expect(metrics.trackAffiliateFunnel).toHaveBeenCalledWith("affiliate_application_interest");
  });

  it("quando fechado mostra prévia sem envio e nunca trata interesse como cadastro", () => {
    const preview = vi.fn();
    const network = vi.spyOn(globalThis, "fetch");
    render(<AffiliateEarlyValueBand recruitmentOpen={false} onSafePreview={preview} />);
    const band = screen.getByTestId("affiliate-c61-eligibility-facts");
    const action = within(band).getByTestId("affiliate-c140-value-apply");
    expect(action).toHaveTextContent("Ver prévia sem envio");
    expect(action).toHaveAttribute("data-availability", "preview-only");
    expect(action).toHaveAttribute("href", "#inscricao");
    fireEvent.click(action);
    expect(preview).toHaveBeenCalledTimes(1);
    expect(network).not.toHaveBeenCalled();
    expect(band).toHaveTextContent("nenhuma remuneração é garantida pela inscrição");
    network.mockRestore();
  });

  it("propaga status para o intro, sem novo formulário ou CTA duplicado em detalhes", () => {
    const preview = vi.fn();
    render(
      <AffiliateLandingOffer
        recruitmentStatus="closed"
        placement="intro"
        onSafePreview={preview}
      />,
    );
    const band = screen.getByTestId("affiliate-c61-eligibility-facts");
    const cta = within(band).getByTestId("affiliate-c140-value-apply");
    fireEvent.click(cta);
    expect(preview).toHaveBeenCalledTimes(1);
    expect(document.querySelectorAll('[data-testid="affiliate-c140-value-apply"]')).toHaveLength(1);
    expect(document.querySelector("form")).toBeNull();
    const html = renderToStaticMarkup(<AffiliateEarlyValueBand recruitmentOpen />);
    expect(html).toContain("Fazer inscrição");
    expect(html).not.toMatch(/renda garantida|aprovação automática|15% no site|21% no TikTok/i);
  });
});
