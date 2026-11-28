import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const server = vi.hoisted(() => ({
  createManualAffiliateAdmin: vi.fn(),
  issuePrivateAffiliateReceipt: vi.fn(),
}));
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
  server.issuePrivateAffiliateReceipt.mockImplementation(() => ({
    ok: true,
    trackingCode: btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(24))))
      .replace(/\+/g, "-")
      .replace(/\//g, "_"),
    trackingProof: "B".repeat(43),
  }));
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
    server.createManualAffiliateAdmin.mockImplementationOnce(async ({ data }) => ({
      ok: true,
      trackingCode: data.trackingCode,
    }));
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
    expect(data.trackingProof).toMatch(/^[A-Za-z0-9_-]{43}$/);
    expect(server.issuePrivateAffiliateReceipt).toHaveBeenCalledWith({ data: { scope: "staff" } });
    expect(data.candidate.privacyAccepted).toBe(true);
    expect(data.candidate.instagramFollowers).toBe(500);
    expect(screen.getByText(/Candidatura registrada como pendente/)).toBeInTheDocument();
    expect(screen.getByLabelText("Código privado da candidata")).toHaveValue(data.trackingCode);
    expect(screen.getByLabelText("Código privado da candidata")).toHaveAttribute(
      "type",
      "password",
    );
    expect(screen.getByRole("button", { name: "Cadastrar para análise" })).toBeDisabled();
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

it("keeps one manual code across an ambiguous response and an identical retry", async () => {
  server.createManualAffiliateAdmin
    .mockRejectedValueOnce(new Error("synthetic lost response"))
    .mockImplementationOnce(async ({ data }) => ({ ok: true, trackingCode: data.trackingCode }));
  render(<AffiliateManualRegistration />);
  fireEvent.click(screen.getByText("Cadastrar candidata manualmente"));
  populate();
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.click(screen.getByRole("button", { name: "Cadastrar para análise" }));
  await screen.findByRole("alert");
  const code = server.createManualAffiliateAdmin.mock.calls[0]![0].data.trackingCode;
  expect(code).toMatch(/^[A-Za-z0-9_-]{32}$/);
  expect(screen.getByLabelText("Código privado da candidata")).toHaveValue(code);
  fireEvent.change(screen.getByLabelText("Cidade"), { target: { value: "Outra Cidade" } });
  fireEvent.click(screen.getByRole("button", { name: "Cadastrar para análise" }));
  expect(server.createManualAffiliateAdmin).toHaveBeenCalledTimes(1);
  expect(screen.getByRole("alert")).toHaveTextContent("Os dados mudaram");
  fireEvent.change(screen.getByLabelText("Cidade"), { target: { value: "Belo Horizonte" } });
  fireEvent.click(screen.getByRole("button", { name: "Cadastrar para análise" }));
  await screen.findByText(/Candidatura registrada como pendente/);
  expect(server.createManualAffiliateAdmin.mock.calls[1]![0].data.trackingCode).toBe(code);
  const close = screen.getByRole("button", {
    name: "Encerrar comprovante e cadastrar outra candidata",
  });
  expect(close).toBeDisabled();
  fireEvent.click(screen.getByLabelText("Já guardei o código em local privado."));
  fireEvent.click(close);
  expect(screen.queryByLabelText("Código privado da candidata")).toBeNull();
});

it("does not expose a mismatched receipt as a confirmed registration", async () => {
  server.createManualAffiliateAdmin.mockResolvedValueOnce({
    ok: true,
    trackingCode: "A".repeat(32),
  });
  render(<AffiliateManualRegistration />);
  fireEvent.click(screen.getByText("Cadastrar candidata manualmente"));
  populate();
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.click(screen.getByRole("button", { name: "Cadastrar para análise" }));
  await screen.findByText(/não pôde ser confirmado com o mesmo código/);
  expect(screen.queryByText(/Candidatura registrada como pendente/)).toBeNull();
  expect(screen.getByLabelText("Código privado da candidata")).not.toHaveValue("A".repeat(32));
});

it("conceals manual details and ignores an obsolete completion when the tab becomes hidden", async () => {
  let finish!: (v: unknown) => void;
  server.createManualAffiliateAdmin.mockImplementationOnce(
    () =>
      new Promise((r) => {
        finish = r;
      }),
  );
  const visibility = vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
  try {
    render(<AffiliateManualRegistration />);
    fireEvent.click(screen.getByText("Cadastrar candidata manualmente"));
    populate();
    fireEvent.click(screen.getByRole("checkbox"));
    fireEvent.click(screen.getByRole("button", { name: "Cadastrar para análise" }));
    expect(screen.getByLabelText("Nome completo")).toBeDisabled();
    await waitFor(() => expect(server.createManualAffiliateAdmin).toHaveBeenCalledOnce());
    const code = server.createManualAffiliateAdmin.mock.calls[0]![0].data.trackingCode;
    visibility.mockReturnValue("hidden");
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    expect(screen.getByLabelText("Nome completo")).toHaveValue("");
    expect(screen.queryByLabelText("Código privado da candidata")).toBeNull();
    await act(async () => finish({ ok: true, trackingCode: code }));
    expect(screen.queryByText(/Candidatura registrada como pendente/)).toBeNull();
  } finally {
    visibility.mockRestore();
  }
});

it("releases a stalled staff issuance after 15 seconds without sending a candidate", async () => {
  vi.useFakeTimers();
  try {
    server.issuePrivateAffiliateReceipt.mockReturnValueOnce(new Promise(() => {}));
    render(<AffiliateManualRegistration />);
    fireEvent.click(screen.getByText("Cadastrar candidata manualmente"));
    populate();
    fireEvent.click(screen.getByRole("checkbox"));
    await act(async () =>
      fireEvent.click(screen.getByRole("button", { name: "Cadastrar para análise" })),
    );
    await act(async () => vi.advanceTimersByTimeAsync(15000));
    expect(screen.getByRole("alert")).toHaveTextContent("Nenhum cadastro foi enviado");
    expect(server.createManualAffiliateAdmin).not.toHaveBeenCalled();
    expect(screen.getByLabelText("Nome completo")).toHaveValue("Pessoa Exemplo");
    expect(screen.getByRole("button", { name: "Cadastrar para análise" })).toBeEnabled();
    expect(screen.queryByLabelText("Código privado da candidata")).toBeNull();
  } finally {
    vi.useRealTimers();
  }
});

it("releases a stalled registration, retains exact ticket for retry and ignores late completion", async () => {
  vi.useFakeTimers();
  let finish!: (v: unknown) => void;
  try {
    server.createManualAffiliateAdmin
      .mockImplementationOnce(
        () =>
          new Promise((r) => {
            finish = r;
          }),
      )
      .mockImplementationOnce(async ({ data }) => ({ ok: true, trackingCode: data.trackingCode }));
    const onCreated = vi.fn();
    render(<AffiliateManualRegistration onCreated={onCreated} />);
    fireEvent.click(screen.getByText("Cadastrar candidata manualmente"));
    populate();
    fireEvent.click(screen.getByRole("checkbox"));
    await act(async () =>
      fireEvent.click(screen.getByRole("button", { name: "Cadastrar para análise" })),
    );
    const first = server.createManualAffiliateAdmin.mock.calls[0]![0].data;
    await act(async () => vi.advanceTimersByTimeAsync(45000));
    expect(screen.getByRole("alert")).toHaveTextContent("Não foi possível confirmar o cadastro");
    expect(screen.getByLabelText("Código privado da candidata")).toHaveValue(first.trackingCode);
    await act(async () => finish({ ok: true, trackingCode: first.trackingCode }));
    expect(onCreated).not.toHaveBeenCalled();
    await act(async () =>
      fireEvent.click(screen.getByRole("button", { name: "Cadastrar para análise" })),
    );
    expect(server.issuePrivateAffiliateReceipt).toHaveBeenCalledOnce();
    expect(server.createManualAffiliateAdmin.mock.calls[1]![0].data).toEqual(first);
    expect(onCreated).toHaveBeenCalledOnce();
  } finally {
    vi.useRealTimers();
  }
});

it("clears private data at pagehide even without a visibility event and ignores a late ticket", async () => {
  let finish!: (v: unknown) => void;
  server.issuePrivateAffiliateReceipt.mockReturnValueOnce(
    new Promise((r) => {
      finish = r;
    }),
  );
  render(<AffiliateManualRegistration />);
  fireEvent.click(screen.getByText("Cadastrar candidata manualmente"));
  populate();
  fireEvent.click(screen.getByRole("checkbox"));
  fireEvent.click(screen.getByRole("button", { name: "Cadastrar para análise" }));
  act(() => window.dispatchEvent(new PageTransitionEvent("pagehide", { persisted: true })));
  expect(screen.getByLabelText("Nome completo")).toHaveValue("");
  await act(async () =>
    finish({ ok: true, trackingCode: "A".repeat(32), trackingProof: "B".repeat(43) }),
  );
  expect(server.createManualAffiliateAdmin).not.toHaveBeenCalled();
  expect(screen.queryByLabelText("Código privado da candidata")).toBeNull();
});
