import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import type { AnchorHTMLAttributes, ComponentType, ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const server = vi.hoisted(() => ({ status: vi.fn() }));
vi.mock("@/lib/affiliate-functions", () => ({ getAffiliateRecruitmentStatus: server.status }));
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: { component: ComponentType }) => options,
  Link: ({
    children,
    to,
    ...rest
  }: { children: ReactNode; to: string } & AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={to} {...rest}>
      {children}
    </a>
  ),
}));
vi.mock("@/components/affiliate-shell", () => ({
  AffiliateShell: ({ children }: { children: ReactNode }) => <main>{children}</main>,
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
    <div data-testid="c122-form">
      <span>{preview ? "Prévia protegida, sem envio" : "Inscrição real verificada"}</span>
      <input
        aria-label="Rascunho local C122"
        onChange={(event) => onDraftChange?.(event.target.value.length > 0)}
      />
      <button type="button" disabled={preview} aria-label="Enviar candidatura sintética">
        Enviar
      </button>
    </div>
  ),
}));
import { AffiliateApplicationPage } from "@/routes/seja-afiliada";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((yes, no) => {
    resolve = yes;
    reject = no;
  });
  return { promise, resolve, reject };
}
const open = { open: true, intakeEnabled: true, rateLimitReady: true };

beforeEach(() => {
  server.status.mockReset();
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("C122 — prévia disponível enquanto a consulta permanece pendente", () => {
  it("remove o bloqueio de leitura sem anunciar abertura ou permitir envio", async () => {
    const pending = deferred<typeof open>();
    const network = vi.fn();
    vi.stubGlobal("fetch", network);
    server.status.mockReturnValue(pending.promise);
    render(<AffiliateApplicationPage />);

    const section = document.getElementById("inscricao");
    if (!section) throw new Error("Faltou a única âncora de inscrição");
    expect(
      within(section).getByRole("heading", { name: "Verificando inscrições..." }),
    ).toBeInTheDocument();
    expect(
      within(section).getByText(/Enquanto isso, você pode explorar a prévia/),
    ).toHaveTextContent("nunca envia nem armazena candidaturas");
    const action = within(section).getByTestId("affiliate-c122-safe-preview");
    expect(action).toHaveTextContent("Visualizar formulário (prévia)");
    expect(action).toBeEnabled();
    expect(within(section).queryByTestId("c122-form")).not.toBeInTheDocument();

    fireEvent.click(action);
    expect(within(section).getByTestId("c122-form")).toHaveTextContent("Prévia protegida");
    expect(
      within(section).getByText(/Esta prévia nunca envia ou armazena candidaturas/),
    ).toBeInTheDocument();
    expect(
      within(section).getByRole("button", { name: "Enviar candidatura sintética" }),
    ).toBeDisabled();
    expect(document.querySelectorAll("#inscricao")).toHaveLength(1);
    expect(network).not.toHaveBeenCalled();
    await waitFor(() => expect(server.status).toHaveBeenCalledTimes(1));
    await act(async () =>
      pending.resolve({ open: false, intakeEnabled: false, rateLimitReady: false }),
    );
    expect(
      within(section).getByText(/Esta prévia nunca envia ou armazena candidaturas/),
    ).toBeInTheDocument();
  });

  it("OPEN verificado depois nunca promove a prévia antiga a formulário enviável", async () => {
    const pending = deferred<typeof open>();
    server.status.mockReturnValue(pending.promise);
    render(<AffiliateApplicationPage />);
    const section = document.getElementById("inscricao");
    if (!section) throw Error("Âncora não encontrada");
    fireEvent.click(within(section).getByTestId("affiliate-c122-safe-preview"));
    fireEvent.change(within(section).getByRole("textbox", { name: "Rascunho local C122" }), {
      target: { value: "Dados inventados na prévia" },
    });
    await act(async () => pending.resolve(open));
    expect(within(section).getByTestId("c122-form")).toHaveTextContent("Prévia protegida");
    expect(
      within(section).getByRole("button", { name: "Enviar candidatura sintética" }),
    ).toBeDisabled();
    expect(within(section).getByRole("textbox", { name: "Rascunho local C122" })).toHaveValue(
      "Dados inventados na prévia",
    );

    fireEvent.click(within(section).getByRole("button", { name: /Iniciar inscrição real/ }));
    expect(within(section).getByText(/Descartar os dados desta prévia/)).toBeInTheDocument();
    expect(
      within(section).getByRole("button", { name: "Enviar candidatura sintética" }),
    ).toBeDisabled();
    fireEvent.click(
      within(section).getByRole("button", { name: "Descartar dados e iniciar inscrição real" }),
    );
    expect(within(section).getByTestId("c122-form")).toHaveTextContent("Inscrição real verificada");
    expect(within(section).getByRole("textbox", { name: "Rascunho local C122" })).toHaveValue("");
    expect(
      within(section).getByRole("button", { name: "Enviar candidatura sintética" }),
    ).toBeEnabled();
  });

  it("erro de conexão enquanto a prévia está aberta mantém envio bloqueado", async () => {
    const pending = deferred<typeof open>();
    server.status.mockReturnValue(pending.promise);
    render(<AffiliateApplicationPage />);
    const section = document.getElementById("inscricao");
    if (!section) throw Error("Âncora não encontrada");
    fireEvent.click(within(section).getByTestId("affiliate-c122-safe-preview"));
    await waitFor(() => expect(server.status).toHaveBeenCalledTimes(1));
    await act(async () => pending.reject(new TypeError("simulated offline")));
    expect(within(section).getByTestId("c122-form")).toHaveTextContent("Prévia protegida");
    expect(
      within(section).getByRole("button", { name: "Enviar candidatura sintética" }),
    ).toBeDisabled();
    fireEvent.click(within(section).getByRole("button", { name: "Fechar prévia" }));
    expect(
      within(section).getByRole("heading", { name: "Não foi possível verificar inscrições" }),
    ).toBeInTheDocument();
    expect(
      within(section).getByRole("button", { name: "Verificar novamente" }),
    ).toBeInTheDocument();
    expect(within(section).queryByText("Inscrição real verificada")).not.toBeInTheDocument();
  });

  it("preserva um rascunho real durante limitação, atalhos e nova consulta", async () => {
    const pending = deferred<typeof open>();
    server.status
      .mockResolvedValueOnce(open)
      .mockReturnValueOnce(pending.promise)
      .mockResolvedValueOnce(open);
    render(<AffiliateApplicationPage />);
    const section = document.getElementById("inscricao")!;
    await waitFor(() =>
      expect(within(section).getByTestId("c122-form")).toHaveTextContent(
        "Inscrição real verificada",
      ),
    );
    const draft = within(section).getByRole("textbox", { name: "Rascunho local C122" });
    fireEvent.change(draft, { target: { value: "Rascunho preservado" } });
    await act(async () => {
      vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
      window.dispatchEvent(new Event("focus"));
      document.dispatchEvent(new Event("visibilitychange"));
    });
    expect(server.status).toHaveBeenCalledTimes(2);
    expect(
      within(section).getByRole("button", { name: "Enviar candidatura sintética" }),
    ).toBeDisabled();
    await act(async () =>
      pending.resolve({ open: false, intakeEnabled: true, rateLimitReady: false }),
    );
    fireEvent.click(screen.getByTestId("affiliate-c125-bridge-cta"));
    expect(within(section).getByRole("textbox", { name: "Rascunho local C122" })).toBe(draft);
    expect(draft).toHaveValue("Rascunho preservado");
    fireEvent.click(within(section).getByRole("button", { name: "Verificar novamente" }));
    await waitFor(() =>
      expect(
        within(section).getByRole("button", { name: "Enviar candidatura sintética" }),
      ).toBeEnabled(),
    );
    expect(draft).toHaveValue("Rascunho preservado");
    expect(server.status).toHaveBeenCalledTimes(3);
  });

  it("não modifica envio real quando status OPEN é confirmado sem prévia", async () => {
    server.status.mockResolvedValue(open);
    render(<AffiliateApplicationPage />);
    await waitFor(() =>
      expect(screen.getByTestId("c122-form")).toHaveTextContent("Inscrição real verificada"),
    );
    expect(screen.getByRole("button", { name: "Enviar candidatura sintética" })).toBeEnabled();
    expect(screen.queryByTestId("affiliate-c122-safe-preview")).not.toBeInTheDocument();
  });
});
