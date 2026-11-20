import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const server = vi.hoisted(() => ({ status: vi.fn() }));
vi.mock("@/lib/affiliate-functions", () => ({ getAffiliateRecruitmentStatus: server.status }));
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: { component: React.ComponentType }) => options,
  Link: ({ children }: { children: React.ReactNode }) => <a href="/">{children}</a>,
}));
vi.mock("@/components/affiliate-shell", () => ({
  AffiliateShell: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));
vi.mock("@/lib/store", () => ({ SITE_URL: "https://vonixhair.com" }));
vi.mock("@/components/affiliate-simple-form", () => ({
  AffiliateSimpleForm: ({
    preview,
    onDraftChange,
  }: {
    preview: boolean;
    onDraftChange?: (dirty: boolean) => void;
  }) => (
    <div data-testid="c70-form">
      <span>{preview ? "Prévia protegida C70" : "Inscrição real C70"}</span>
      <input
        aria-label="Rascunho local C70"
        onChange={(event) => onDraftChange?.(event.target.value.length > 0)}
      />
    </div>
  ),
}));
import { AffiliateApplicationPage } from "@/routes/seja-afiliada";

beforeEach(() => server.status.mockReset());
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("C70 — recuperação da verificação de inscrições sem envio", () => {
  it("não apresenta como fechada uma consulta que falhou por conexão e permite reconsultar", async () => {
    server.status
      .mockRejectedValueOnce(new TypeError("synthetic-network-offline"))
      .mockResolvedValueOnce({ open: true, intakeEnabled: true, rateLimitReady: true });
    render(<AffiliateApplicationPage />);
    expect(
      await screen.findByRole("heading", { name: /não foi possível verificar inscrições/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /verificar novamente/i })).toBeInTheDocument();
    expect(screen.queryByText("Inscrições em preparação")).not.toBeInTheDocument();
    expect(screen.getByTestId("vonix-affiliate-hero")).toHaveTextContent(
      /não foi possível consultar a disponibilidade/i,
    );
    expect(document.getElementById("inscricao")).toHaveAttribute(
      "data-storage-check",
      "unavailable",
    );
    expect(screen.queryByText("Inscrição real C70")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /verificar novamente/i }));
    await waitFor(() => expect(server.status).toHaveBeenCalledTimes(2));
    expect(await screen.findByText("Inscrição real C70")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /verificar novamente/i })).not.toBeInTheDocument();
  });

  it("respeita status fechado real após retry, sem disparar envio nem abrir cadastro", async () => {
    server.status
      .mockRejectedValueOnce(new TypeError("offline"))
      .mockResolvedValueOnce({ open: false, intakeEnabled: false, rateLimitReady: false });
    render(<AffiliateApplicationPage />);
    await screen.findByRole("heading", { name: /não foi possível verificar inscrições/i });
    fireEvent.click(screen.getByRole("button", { name: /verificar novamente/i }));
    expect(await screen.findByText("Inscrições em preparação")).toBeInTheDocument();
    expect(screen.queryByText("Inscrição real C70")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /verificar novamente/i })).not.toBeInTheDocument();
    expect(server.status).toHaveBeenCalledTimes(2);
  });

  it("uma falha após formulário iniciado preserva o rascunho e bloqueia o envio até retorno aberto", async () => {
    server.status
      .mockResolvedValueOnce({ open: true })
      .mockRejectedValueOnce(new TypeError("offline"))
      .mockResolvedValueOnce({ open: true });
    render(<AffiliateApplicationPage />);
    expect(await screen.findByText("Inscrição real C70")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: "Rascunho local C70" }), {
      target: { value: "Rascunho privado sintético" },
    });
    await act(async () => window.dispatchEvent(new Event("focus")));
    expect(await screen.findByText("Prévia protegida C70")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Rascunho local C70" })).toHaveValue(
      "Rascunho privado sintético",
    );
    expect(screen.getByRole("button", { name: /verificar novamente/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /verificar novamente/i }));
    expect(await screen.findByText("Inscrição real C70")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Rascunho local C70" })).toHaveValue(
      "Rascunho privado sintético",
    );
  });

  it("prévia nunca vira formulário real sozinha quando a conexão se recupera", async () => {
    server.status.mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce({ open: true });
    render(<AffiliateApplicationPage />);
    await screen.findByRole("heading", { name: /não foi possível verificar inscrições/i });
    fireEvent.click(screen.getByRole("button", { name: /visualizar formulário/i }));
    expect(screen.getByText("Prévia protegida C70")).toBeInTheDocument();
    await act(async () => window.dispatchEvent(new Event("focus")));
    await waitFor(() => expect(server.status).toHaveBeenCalledTimes(2));
    expect(screen.getByText("Prévia protegida C70")).toBeInTheDocument();
    expect(screen.queryByText("Inscrição real C70")).not.toBeInTheDocument();
  });
});
