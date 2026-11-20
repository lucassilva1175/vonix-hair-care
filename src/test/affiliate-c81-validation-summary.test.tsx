import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const server = vi.hoisted(() => ({ submit: vi.fn() }));
const analytics = vi.hoisted(() => ({ track: vi.fn(), funnel: vi.fn() }));
vi.mock("@/lib/affiliate-functions", () => ({ submitSimpleAffiliateApplication: server.submit }));
vi.mock("@/lib/analytics", () => ({ track: analytics.track }));
vi.mock("@/lib/affiliate-funnel", () => ({ trackAffiliateFunnel: analytics.funnel }));

import { AffiliateSimpleForm } from "@/components/affiliate-simple-form";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  window.sessionStorage.removeItem("vonix-affiliate-unconfirmed-code");
  window.sessionStorage.removeItem("vonix-affiliate-once-code");
});

function change(label: RegExp, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
}

function fillValidApplicantWithoutConsent() {
  change(/Nome completo/, "Pessoa Fictícia");
  change(/^E-mail/, "pessoa@example.invalid");
  change(/Telefone com DDD/, "31999999999");
  change(/CEP/, "30110012");
  change(/Rua \/ Avenida/, "Rua Exemplo");
  change(/^Número/, "123");
  change(/^Bairro/, "Centro");
  change(/^Cidade/, "Belo Horizonte");
  fireEvent.change(screen.getByRole("combobox", { name: /Estado \(UF\)/ }), {
    target: { value: "MG" },
  });
  change(/^Instagram/, "@perfilficticio");
  change(/Seguidores no Instagram/, "2000");
}

describe("C81: erros visíveis da inscrição sem POST ou bloqueio nativo", () => {
  it("executa o Zod com campos vazios e oferece resumo focado e âncoras estáticas", async () => {
    const { container } = render(<AffiliateSimpleForm preview />);
    const form = container.querySelector("form");
    expect(form).toHaveAttribute("novalidate");
    expect(screen.getByLabelText(/Nome completo/)).toHaveAttribute("required");
    expect(screen.getByLabelText(/^E-mail/)).toHaveAttribute("type", "email");
    fireEvent.click(screen.getByRole("button", { name: /Simular envio/i }));
    const summary = await screen.findByTestId("vonix-c81-validation-summary");
    await waitFor(() => expect(summary).toHaveFocus());
    expect(summary).toHaveAttribute("role", "region");
    expect(summary).toHaveAttribute("aria-live", "polite");
    expect(summary).toHaveTextContent(/Revise \d+ campos antes de enviar/);
    const hrefs = within(summary)
      .getAllByRole("link")
      .map((link) => link.getAttribute("href"));
    expect(hrefs).toContain("#simple-fullName");
    expect(hrefs).toContain("#simple-email");
    expect(hrefs).toContain("#simple-instagramFollowers");
    expect(hrefs).toContain("#simple-privacyAccepted");
    expect(hrefs.every((href) => /^#simple-[A-Za-z]+$/.test(href ?? ""))).toBe(true);
    expect(summary).toHaveTextContent("Confirme o aceite de privacidade");
    expect(screen.getByLabelText(/Nome completo/)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByRole("checkbox", { name: /Autorizo o uso destes dados/ })).toHaveAttribute(
      "aria-describedby",
      "simple-error-privacyAccepted",
    );
    expect(server.submit).not.toHaveBeenCalled();
    expect(analytics.track).not.toHaveBeenCalled();
    expect(window.sessionStorage.getItem("vonix-affiliate-unconfirmed-code")).toBeNull();
  });

  it("mostra e-mail inválido e nome curto, sem recair na validação nativa do browser", async () => {
    render(<AffiliateSimpleForm preview />);
    change(/Nome completo/, "X");
    change(/^E-mail/, "email-invalido");
    fireEvent.click(screen.getByRole("button", { name: /Simular envio/i }));
    const summary = await screen.findByTestId("vonix-c81-validation-summary");
    await waitFor(() => expect(summary).toHaveFocus());
    expect(within(summary).getByRole("link", { name: /E-mail/i })).toHaveAttribute(
      "href",
      "#simple-email",
    );
    expect(summary).toHaveTextContent("Informe um e-mail válido para contato.");
    expect(screen.getByLabelText(/^E-mail/)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText(/^E-mail/)).toHaveAttribute("type", "email");
    expect(server.submit).not.toHaveBeenCalled();
  });

  it("não permite simular inscrição sem LGPD e some com erros quando corrigidos", async () => {
    render(<AffiliateSimpleForm preview />);
    fillValidApplicantWithoutConsent();
    fireEvent.click(screen.getByRole("button", { name: /Simular envio/i }));
    const summary = await screen.findByTestId("vonix-c81-validation-summary");
    await waitFor(() => expect(summary).toHaveFocus());
    const links = within(summary).getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveAttribute("href", "#simple-privacyAccepted");
    const checkbox = screen.getByRole("checkbox", { name: /Autorizo o uso destes dados/ });
    expect(checkbox).toHaveAttribute("required");
    expect(checkbox).toHaveAttribute("aria-invalid", "true");
    fireEvent.click(checkbox);
    fireEvent.click(screen.getByRole("button", { name: /Simular envio/i }));
    await waitFor(() => {
      expect(screen.queryByTestId("vonix-c81-validation-summary")).not.toBeInTheDocument();
      expect(
        screen.getByText(/Esta é apenas uma prévia. Nenhuma candidatura foi enviada/),
      ).toBeInTheDocument();
    });
    expect(server.submit).not.toHaveBeenCalled();
    expect(analytics.track).not.toHaveBeenCalled();
  });

  it("não inclui valores de candidatas no resumo nem no caminho dos links", async () => {
    render(<AffiliateSimpleForm preview />);
    change(/Nome completo/, "PESSOA-TESTE-PRIVADA");
    change(/^E-mail/, "segredo-invalido@");
    fireEvent.click(screen.getByRole("button", { name: /Simular envio/i }));
    const summary = await screen.findByTestId("vonix-c81-validation-summary");
    expect(summary.textContent).not.toMatch(/PESSOA-TESTE-PRIVADA|segredo-invalido/);
    const links = within(summary).getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href")).join("|")).not.toMatch(/PESSOA|segredo/);
    expect(server.submit).not.toHaveBeenCalled();
  });
});
