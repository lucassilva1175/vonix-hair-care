import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const server = vi.hoisted(() => ({ submit: vi.fn() }));
const analytics = vi.hoisted(() => ({ track: vi.fn() }));
vi.mock("@/lib/affiliate-functions", () => ({
  submitSimpleAffiliateApplication: server.submit,
}));
vi.mock("@/lib/analytics", () => ({ track: analytics.track }));
import { AffiliateSimpleForm } from "@/components/affiliate-simple-form";

beforeEach(() => vi.clearAllMocks());
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  window.sessionStorage.removeItem("vonix-affiliate-unconfirmed-code");
  window.sessionStorage.removeItem("vonix-affiliate-once-code");
});

const progress = () => screen.getByTestId("affiliate-c70-form-progress");
const value = () =>
  screen.getByRole("progressbar", {
    name: "Progresso de preenchimento dos campos obrigatórios",
  });
function change(label: RegExp, text: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value: text } });
}
function fillContact() {
  change(/Nome completo/, "Pessoa Exemplo");
  change(/^E-mail/, "pessoa@example.invalid");
  change(/Telefone com DDD/, "(31) 99999-9999");
}
function fillAddress() {
  change(/CEP/, "30110012");
  change(/Rua \/ Avenida/, "Rua Exemplo");
  change(/^Número/, "100");
  change(/^Bairro/, "Centro");
  change(/^Cidade/, "Belo Horizonte");
  fireEvent.change(screen.getByRole("combobox", { name: /Estado \(UF\)/ }), {
    target: { value: "MG" },
  });
}
function fillSocial() {
  change(/^Instagram/, "@perfilteste");
  change(/Seguidores no Instagram/, "1250");
}

describe("C70 form progress — presence only, no applicant data", () => {
  it("starts at 0/3 and identifies missing groups without claiming validation", () => {
    render(<AffiliateSimpleForm />);
    expect(value()).toHaveAttribute("aria-valuemin", "0");
    expect(value()).toHaveAttribute("aria-valuemax", "3");
    expect(value()).toHaveAttribute("aria-valuenow", "0");
    expect(within(progress()).getByText("0 de 3 grupos informados")).toBeInTheDocument();
    expect(within(progress()).getAllByText("Pendente")).toHaveLength(3);
    expect(progress()).toHaveTextContent("não validação");
    expect(progress()).toHaveTextContent("aceite de privacidade é separado");
    expect(server.submit).not.toHaveBeenCalled();
  });

  it("counts required contact, address and Instagram once; TikTok and consent are separate", () => {
    render(<AffiliateSimpleForm />);
    fillSocial();
    expect(value()).toHaveAttribute("aria-valuenow", "1");
    expect(within(progress()).getByText("1 de 3 grupos informados")).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Também tem TikTok\?/));
    change(/^TikTok/, "@perfilopcional");
    change(/Seguidores no TikTok/, "800");
    expect(value()).toHaveAttribute("aria-valuenow", "1");
    fillContact();
    expect(value()).toHaveAttribute("aria-valuenow", "2");
    fillAddress();
    expect(value()).toHaveAttribute("aria-valuenow", "3");
    expect(within(progress()).getAllByText("Informado")).toHaveLength(3);
    expect(screen.getByRole("checkbox", { name: /Autorizo o uso destes dados/ })).not.toBeChecked();
    const progressText = progress().textContent ?? "";
    expect(progressText).not.toMatch(
      /Pessoa Exemplo|pessoa@example.invalid|99999|Rua Exemplo|perfilteste|1250/,
    );
    expect(analytics.track.mock.calls.some(([name]) => name === "sign_up")).toBe(false);
    expect(server.submit).not.toHaveBeenCalled();
  });

  it("reduces the count again when a required field is cleared and never counts optional fields", () => {
    render(<AffiliateSimpleForm preview />);
    fillContact();
    expect(value()).toHaveAttribute("aria-valuenow", "1");
    change(/^E-mail/, "");
    expect(value()).toHaveAttribute("aria-valuenow", "0");
    fillSocial();
    expect(value()).toHaveAttribute("aria-valuenow", "1");
    change(/^Instagram/, "");
    expect(value()).toHaveAttribute("aria-valuenow", "0");
    expect(analytics.track).not.toHaveBeenCalled();
    expect(server.submit).not.toHaveBeenCalled();
  });
});
