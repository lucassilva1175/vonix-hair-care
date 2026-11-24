import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
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
  AffiliateSimpleForm: ({ preview }: { preview: boolean }) => (
    <div data-testid="c124-form">
      <span>{preview ? "Prévia protegida" : "Inscrição real verificada"}</span>
      <button type="button" disabled={preview} aria-label="Envio simulado">
        Enviar
      </button>
    </div>
  ),
}));

import { AffiliateApplicationPage } from "@/routes/seja-afiliada";

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((yes) => {
    resolve = yes;
  });
  return { resolve, promise };
}

const open = { open: true, intakeEnabled: true, rateLimitReady: true };
const closed = { open: false, intakeEnabled: false, rateLimitReady: false };

beforeEach(() => {
  server.status.mockReset();
  vi.useFakeTimers();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("C124 — disponibilidade com prazo máximo, sem assumir abertura", () => {
  it("uma consulta que nunca responde sai do loading em 25 segundos e permite retry", async () => {
    const first = deferred<typeof open>();
    server.status.mockReturnValueOnce(first.promise).mockResolvedValueOnce(closed);
    render(<AffiliateApplicationPage />);
    const section = document.getElementById("inscricao");
    if (!section) throw Error("Seção de inscrição ausente");

    expect(
      within(section).getByRole("heading", { name: "Verificando inscrições..." }),
    ).toBeInTheDocument();
    expect(within(section).getByTestId("affiliate-c122-safe-preview")).toBeEnabled();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(24_999);
    });
    expect(
      within(section).getByRole("heading", { name: "Verificando inscrições..." }),
    ).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(
      within(section).getByRole("heading", { name: "Não foi possível verificar inscrições" }),
    ).toBeInTheDocument();
    expect(within(section).getByRole("button", { name: "Verificar novamente" })).toBeEnabled();
    expect(within(section).queryByText("Inscrição real verificada")).not.toBeInTheDocument();

    await act(async () => {
      fireEvent.click(within(section).getByRole("button", { name: "Verificar novamente" }));
      await Promise.resolve();
    });
    expect(
      within(section).getByRole("heading", { name: "Inscrições em preparação" }),
    ).toBeInTheDocument();
    await act(async () => first.resolve(open));
    expect(
      within(section).getByRole("heading", { name: "Inscrições em preparação" }),
    ).toBeInTheDocument();
    expect(server.status).toHaveBeenCalledTimes(2);
  });

  it("a prévia aberta durante timeout permanece sem envio mesmo após OPEN tardio", async () => {
    const first = deferred<typeof open>();
    server.status.mockReturnValue(first.promise);
    render(<AffiliateApplicationPage />);
    const section = document.getElementById("inscricao");
    if (!section) throw Error("Seção ausente");
    fireEvent.click(within(section).getByTestId("affiliate-c122-safe-preview"));
    expect(within(section).getByTestId("c124-form")).toHaveTextContent("Prévia protegida");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(25_000);
    });
    expect(within(section).getByTestId("c124-form")).toHaveTextContent("Prévia protegida");
    expect(within(section).getByRole("button", { name: "Envio simulado" })).toBeDisabled();
    await act(async () => first.resolve(open));
    expect(within(section).getByTestId("c124-form")).toHaveTextContent("Prévia protegida");
    expect(within(section).getByRole("button", { name: "Envio simulado" })).toBeDisabled();
  });

  it("aceita resposta válida após o antigo prazo de 10s sem abrir cadastro prematuramente", async () => {
    const delayed = deferred<typeof open>();
    server.status.mockReturnValue(delayed.promise);
    render(<AffiliateApplicationPage />);
    const section = document.getElementById("inscricao")!;
    await act(async () => {
      await vi.advanceTimersByTimeAsync(19_000);
    });
    expect(
      within(section).getByRole("heading", { name: "Verificando inscrições..." }),
    ).toBeInTheDocument();
    expect(within(section).queryByText("Inscrição real verificada")).not.toBeInTheDocument();
    await act(async () => delayed.resolve(open));
    expect(within(section).getByTestId("c124-form")).toHaveTextContent("Inscrição real verificada");
  });

  it("uma resposta OPEN rápida continua funcionando e cancela o timer", async () => {
    server.status.mockResolvedValue(open);
    render(<AffiliateApplicationPage />);
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByTestId("c124-form")).toHaveTextContent("Inscrição real verificada");
    await act(async () => {
      await vi.advanceTimersByTimeAsync(25_001);
    });
    expect(screen.getByTestId("c124-form")).toHaveTextContent("Inscrição real verificada");
    expect(
      screen.queryByRole("heading", { name: "Não foi possível verificar inscrições" }),
    ).not.toBeInTheDocument();
  });
});
