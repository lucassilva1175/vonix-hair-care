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
      <span>{preview ? "Pr?via protegida C70" : "Inscri??o real C70"}</span>
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

describe("C70 ? recupera??o da verifica??o de inscri??es sem envio", () => {
  it("n?o apresenta como fechada uma consulta que falhou por conex?o e permite reconsultar", async () => {
    server.status
      .mockRejectedValueOnce(new TypeError("synthetic-network-offline"))
      .mockResolvedValueOnce({ open: true, intakeEnabled: true, rateLimitReady: true });
    render(<AffiliateApplicationPage />);
    expect(
      await screen.findByRole("heading", { name: /n?o foi poss?vel verificar inscri??es/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /verificar novamente/i })).toBeInTheDocument();
    expect(screen.queryByText("Inscri??es em prepara??o")).not.toBeInTheDocument();
    expect(screen.getByTestId("vonix-affiliate-hero")).toHaveTextContent(
      /n?o foi poss?vel consultar a disponibilidade/i,
    );
    expect(document.getElementById("inscricao")).toHaveAttribute(
      "data-storage-check",
      "unavailable",
    );
    expect(screen.queryByText("Inscri??o real C70")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /verificar novamente/i }));
    await waitFor(() => expect(server.status).toHaveBeenCalledTimes(2));
    expect(await screen.findByText("Inscri??o real C70")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /verificar novamente/i })).not.toBeInTheDocument();
  });

  it("respeita status fechado real ap?s retry, sem disparar envio nem abrir cadastro", async () => {
    server.status
      .mockRejectedValueOnce(new TypeError("offline"))
      .mockResolvedValueOnce({ open: false, intakeEnabled: false, rateLimitReady: false });
    render(<AffiliateApplicationPage />);
    await screen.findByRole("heading", { name: /n?o foi poss?vel verificar inscri??es/i });
    fireEvent.click(screen.getByRole("button", { name: /verificar novamente/i }));
    expect(await screen.findByText("Inscri??es em prepara??o")).toBeInTheDocument();
    expect(screen.queryByText("Inscri??o real C70")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /verificar novamente/i })).not.toBeInTheDocument();
    expect(server.status).toHaveBeenCalledTimes(2);
  });

  it("uma falha ap?s formul?rio iniciado preserva o rascunho e bloqueia o envio at? retorno aberto", async () => {
    server.status
      .mockResolvedValueOnce({ open: true })
      .mockRejectedValueOnce(new TypeError("offline"))
      .mockResolvedValueOnce({ open: true });
    render(<AffiliateApplicationPage />);
    expect(await screen.findByText("Inscri??o real C70")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: "Rascunho local C70" }), {
      target: { value: "Rascunho privado sint?tico" },
    });
    await act(async () => window.dispatchEvent(new Event("focus")));
    expect(await screen.findByText("Pr?via protegida C70")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Rascunho local C70" })).toHaveValue(
      "Rascunho privado sint?tico",
    );
    expect(screen.getByRole("button", { name: /verificar novamente/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /verificar novamente/i }));
    expect(await screen.findByText("Inscri??o real C70")).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "Rascunho local C70" })).toHaveValue(
      "Rascunho privado sint?tico",
    );
  });

  it("pr?via nunca vira formul?rio real sozinha quando a conex?o se recupera", async () => {
    server.status.mockRejectedValueOnce(new Error("offline")).mockResolvedValueOnce({ open: true });
    render(<AffiliateApplicationPage />);
    await screen.findByRole("heading", { name: /n?o foi poss?vel verificar inscri??es/i });
    fireEvent.click(screen.getByRole("button", { name: /visualizar formul?rio/i }));
    expect(screen.getByText("Pr?via protegida C70")).toBeInTheDocument();
    await act(async () => window.dispatchEvent(new Event("focus")));
    await waitFor(() => expect(server.status).toHaveBeenCalledTimes(2));
    expect(screen.getByText("Pr?via protegida C70")).toBeInTheDocument();
    expect(screen.queryByText("Inscri??o real C70")).not.toBeInTheDocument();
  });
});
