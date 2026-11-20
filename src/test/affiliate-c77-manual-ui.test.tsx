import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const server = vi.hoisted(() => ({ createManualAffiliateAdmin: vi.fn() }));
vi.mock("@/lib/affiliate-functions", () => server);
import { AffiliateManualRegistration } from "@/components/affiliate-manual-registration";

function populate() {
  fireEvent.change(screen.getByLabelText("Nome completo"), { target: { value: "Pessoa Exemplo" } });
  fireEvent.change(screen.getByLabelText("Telefone com DDD"), {
    target: { value: "(31) 99999-9999" },
  });
  fireEvent.change(screen.getByLabelText("CEP"), { target: { value: "30110-012" } });
  fireEvent.change(screen.getByLabelText("Rua / avenida"), { target: { value: "Rua Exemplo" } });
  fireEvent.change(screen.getByLabelText("Número ou s/n"), { target: { value: "123" } });
  fireEvent.change(screen.getByLabelText("Bairro"), { target: { value: "Centro" } });
  fireEvent.change(screen.getByLabelText("Cidade"), { target: { value: "Belo Horizonte" } });
  fireEvent.change(screen.getByLabelText("Estado"), { target: { value: "MG" } });
  fireEvent.change(screen.getByLabelText("Instagram (@usuário)"), {
    target: { value: "@pessoa.exemplo" },
  });
  fireEvent.change(screen.getByLabelText("Seguidores do Instagram"), { target: { value: "500" } });
}
beforeEach(() => {
  vi.resetAllMocks();
});
afterEach(() => {
  cleanup();
});

describe("C77: cadastro manual no painel autenticado", () => {
  it("não cadastra sem confirmação expressa da equipe", async () => {
    render(<AffiliateManualRegistration />);
    fireEvent.click(screen.getByText("Cadastrar candidata manualmente"));
    populate();
    const button = screen.getByRole("button", { name: "Cadastrar para análise" });
    expect(button).toBeDisabled();
    fireEvent.click(screen.getByRole("checkbox"));
    expect(button).toBeEnabled();
    expect(server.createManualAffiliateAdmin).not.toHaveBeenCalled();
  });

  it("permite candidatura sem email, não envia Auth/email e só sinaliza sucesso confirmado", async () => {
    server.createManualAffiliateAdmin.mockResolvedValueOnce({
      ok: true,
      trackingCode: "A".repeat(32),
    });
    const onCreated = vi.fn();
    render(<AffiliateManualRegistration onCreated={onCreated} />);
    fireEvent.click(screen.getByText("Cadastrar candidata manualmente"));
    populate();
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar para análise" }));
    await waitFor(() => expect(server.createManualAffiliateAdmin).toHaveBeenCalledTimes(1));
    const data = server.createManualAffiliateAdmin.mock.calls[0]?.[0]?.data;
    expect(data.candidate.email).toBe("");
    expect(data.consentConfirmed).toBe(true);
    expect(data.candidate.privacyAccepted).toBe(true);
    expect(data.candidate.instagramFollowers).toBe(500);
    expect(screen.getByText(/Candidatura registrada como pendente/)).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: /Código privado da candidata/ })).toHaveValue(
      "A".repeat(32),
    );
    expect(onCreated).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText("Nome completo")).toHaveValue("");
  });

  it("mostra erro de email inválido antes da API sem apagar rascunho", async () => {
    render(<AffiliateManualRegistration />);
    fireEvent.click(screen.getByText("Cadastrar candidata manualmente"));
    populate();
    fireEvent.change(screen.getByLabelText("E-mail da candidata (opcional)"), {
      target: { value: "endereco-invalido" },
    });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.submit(
      screen.getByRole("button", { name: "Cadastrar para análise" }).closest("form")!,
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(/e-mail válido/i);
    expect(server.createManualAffiliateAdmin).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Nome completo")).toHaveValue("Pessoa Exemplo");
  });

  it("exibe conflito de email do banco sem inventar aprovação ou perder dados", async () => {
    server.createManualAffiliateAdmin.mockResolvedValueOnce({
      ok: false,
      reason: "Já existe uma inscrição com este e-mail.",
    });
    render(<AffiliateManualRegistration />);
    fireEvent.click(screen.getByText("Cadastrar candidata manualmente"));
    populate();
    fireEvent.change(screen.getByLabelText("E-mail da candidata (opcional)"), {
      target: { value: "anterior@example.test" },
    });
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar para análise" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/existe uma inscrição/);
    expect(screen.getByLabelText("E-mail da candidata (opcional)")).toHaveValue(
      "anterior@example.test",
    );
    expect(screen.queryByText(/Candidatura registrada como pendente/)).not.toBeInTheDocument();
  });
});
