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
vi.mock("@/lib/store", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/store")>()),
  SITE_URL: "https://vonixhair.com",
}));
vi.mock("@/components/affiliate-simple-form", () => ({
  AffiliateSimpleForm: ({
    preview,
    onDraftChange,
  }: {
    preview: boolean;
    onDraftChange?: (dirty: boolean) => void;
  }) => (
    <div data-testid="c71-form">
      <span>{preview ? "Envio bloqueado C71" : "Envio autorizado C71"}</span>
      <input
        aria-label="Rascunho C71"
        onChange={(e) => onDraftChange?.(e.target.value.length > 0)}
      />
      <button type="button" disabled={preview} aria-label="Botão de envio sintético C71">
        Enviar
      </button>
    </div>
  ),
}));
import { AffiliateApplicationPage } from "@/routes/seja-afiliada";

beforeEach(() => server.status.mockReset());
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function pending<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((a, b) => {
    resolve = a;
    reject = b;
  });
  return { promise, resolve, reject };
}
const open = { open: true, intakeEnabled: true, rateLimitReady: true };
const closed = { open: false, intakeEnabled: false, rateLimitReady: false };

describe("C71: consulta de retomada não confia em OPEN antigo", () => {
  it("pausa envio durante GET pendente no foco e restaura apenas após OPEN verificado", async () => {
    const next = pending<typeof open>();
    server.status.mockResolvedValueOnce(open).mockReturnValueOnce(next.promise);
    render(<AffiliateApplicationPage />);
    expect(await screen.findByText("Envio autorizado C71")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: "Rascunho C71" }), {
      target: { value: "Meu perfil privado, sem envio" },
    });
    await act(async () => window.dispatchEvent(new Event("focus")));
    await waitFor(() => expect(server.status).toHaveBeenCalledTimes(2));
    expect(screen.getByText("Envio bloqueado C71")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Botão de envio sintético C71" })).toBeDisabled();
    expect(screen.getByText(/verificando novamente a disponibilidade/i)).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Rascunho C71" })).toHaveValue(
      "Meu perfil privado, sem envio",
    );
    await act(async () => next.resolve(open));
    expect(await screen.findByText("Envio autorizado C71")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Rascunho C71" })).toHaveValue(
      "Meu perfil privado, sem envio",
    );
  });

  it("revalidação com fechamento confirmado não libera o rascunho anterior", async () => {
    const next = pending<typeof closed>();
    server.status.mockResolvedValueOnce(open).mockReturnValueOnce(next.promise);
    render(<AffiliateApplicationPage />);
    await screen.findByText("Envio autorizado C71");
    await act(async () => window.dispatchEvent(new Event("focus")));
    expect(screen.getByText("Envio bloqueado C71")).toBeInTheDocument();
    await act(async () => next.resolve(closed));
    expect(screen.getByText("Envio bloqueado C71")).toBeInTheDocument();
    expect(screen.getByText(/cadastro não recebe candidaturas/i)).toBeInTheDocument();
  });

  it("falha de rede após rechecagem mantém bloqueio e oferece GET retry", async () => {
    const next = pending<typeof open>();
    server.status
      .mockResolvedValueOnce(open)
      .mockReturnValueOnce(next.promise)
      .mockResolvedValueOnce(open);
    render(<AffiliateApplicationPage />);
    await screen.findByText("Envio autorizado C71");
    await act(async () => window.dispatchEvent(new Event("focus")));
    expect(screen.getByText("Envio bloqueado C71")).toBeInTheDocument();
    await act(async () => next.reject(new TypeError("C71 synthetic network loss")));
    expect(screen.getByRole("button", { name: /verificar novamente/i })).toBeInTheDocument();
    expect(screen.getByText("Envio bloqueado C71")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /verificar novamente/i }));
    await waitFor(() => expect(server.status).toHaveBeenCalledTimes(3));
    expect(await screen.findByText("Envio autorizado C71")).toBeInTheDocument();
  });

  it("GET antigo OPEN não anula CLOSED mais recente após restauração pelo histórico", async () => {
    const earlier = pending<typeof open>();
    const latest = pending<typeof closed>();
    server.status
      .mockResolvedValueOnce(open)
      .mockReturnValueOnce(earlier.promise)
      .mockReturnValueOnce(latest.promise);
    render(<AffiliateApplicationPage />);
    await screen.findByText("Envio autorizado C71");
    await act(async () => window.dispatchEvent(new Event("focus")));
    await act(async () => window.dispatchEvent(new Event("focus")));
    expect(server.status).toHaveBeenCalledTimes(2);
    expect(screen.getByText("Envio bloqueado C71")).toBeInTheDocument();
    act(() => window.dispatchEvent(new PageTransitionEvent("pagehide", { persisted: true })));
    act(() => window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true })));
    expect(server.status).toHaveBeenCalledTimes(3);
    await act(async () => latest.resolve(closed));
    expect(screen.getByText(/cadastro não recebe candidaturas/i)).toBeInTheDocument();
    await act(async () => earlier.resolve(open));
    expect(screen.queryByText("Envio autorizado C71")).not.toBeInTheDocument();
    expect(screen.getByText("Envio bloqueado C71")).toBeInTheDocument();
  });

  it("uma prévia iniciada fechada não passa a ser enviável durante a rechecagem", async () => {
    const next = pending<typeof open>();
    server.status.mockResolvedValueOnce(closed).mockReturnValueOnce(next.promise);
    render(<AffiliateApplicationPage />);
    await screen.findByText("Inscrições em preparação");
    fireEvent.click(screen.getByRole("button", { name: /visualizar formulário/i }));
    expect(screen.getByText("Envio bloqueado C71")).toBeInTheDocument();
    await act(async () => window.dispatchEvent(new Event("focus")));
    expect(screen.getByText("Envio bloqueado C71")).toBeInTheDocument();
    await act(async () => next.resolve(open));
    expect(screen.getByText("Envio bloqueado C71")).toBeInTheDocument();
  });
});
