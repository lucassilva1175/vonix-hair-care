import { readFileSync } from "node:fs";
import type { AnchorHTMLAttributes, ComponentType, ReactNode } from "react";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/affiliate-functions", () => ({
  getAffiliateRecruitmentStatus: vi.fn().mockResolvedValue({ open: false }),
}));
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
vi.mock("@/lib/store", () => ({ SITE_URL: "https://vonixhair.com" }));
vi.mock("@/components/affiliate-simple-form", () => ({
  AffiliateSimpleForm: ({ preview }: { preview: boolean }) => (
    <div data-testid="c120-form-stub">{preview ? "Simulação protegida" : "Inscrição real"}</div>
  ),
}));
import { AffiliateApplicationPage } from "@/routes/seja-afiliada";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("C120 — entrada compacta com ação real preservada", () => {
  it("remove apenas duplicação visual no telefone, sem ocultar as condições", async () => {
    const outbound = vi.fn();
    vi.stubGlobal("fetch", outbound);
    render(<AffiliateApplicationPage />);
    await screen.findByRole("heading", { name: "Inscrições em preparação" });
    const section = document.getElementById("inscricao");
    if (!section) throw new Error("Inscrição ausente");
    const intro = within(section).getByTestId("affiliate-c115-form-intro");
    expect(intro).toHaveClass("mb-4", "sm:mb-7", "p-4", "sm:p-7");
    expect(
      within(intro).getByRole("heading", {
        name: "Sua inscrição, de um jeito simples.",
      }),
    ).toBeInTheDocument();
    expect(intro).toHaveTextContent("e-mail válido");
    expect(intro).toHaveTextContent("TikTok é opcional");
    expect(intro).toHaveTextContent("não garante aprovação");
    expect(intro).toHaveTextContent("Após um envio confirmado, guarde o código privado");
    const essentials = within(intro).getByTestId("affiliate-c112-form-essentials");
    expect(essentials).toHaveClass("hidden", "sm:flex");
    expect(essentials).toHaveTextContent("18 anos ou mais");
    expect(essentials).toHaveTextContent("E-mail válido obrigatório");
    expect(essentials).toHaveTextContent("Instagram com seguidores");
    expect(essentials).toHaveTextContent("TikTok opcional");
    expect(screen.getByTestId("affiliate-c119-clarity-summary")).toHaveTextContent(
      "18 anos ou mais",
    );
    expect(within(intro).getByTestId("affiliate-c112-form-status")).toHaveAttribute(
      "href",
      "/consultar-candidatura",
    );
    expect(within(intro).getByTestId("affiliate-c117-explore-steps")).toHaveAttribute(
      "href",
      "#candidatura-etapas",
    );
    expect(outbound).not.toHaveBeenCalled();
  });

  it("mantém o botão útil e a prévia isolada sem enviar candidatura", async () => {
    const outbound = vi.fn();
    vi.stubGlobal("fetch", outbound);
    render(<AffiliateApplicationPage />);
    await screen.findByRole("heading", { name: "Inscrições em preparação" });
    const section = document.getElementById("inscricao");
    if (!section) throw new Error("Âncora única ausente");
    expect(section).toHaveClass("py-6", "sm:py-14");
    fireEvent.click(
      within(section).getByRole("button", {
        name: /Visualizar formulário \(prévia\)/,
      }),
    );
    expect(within(section).getByTestId("c120-form-stub")).toHaveTextContent("Simulação protegida");
    expect(within(section).getByRole("status")).toHaveTextContent(
      "Esta prévia nunca envia ou armazena candidaturas",
    );
    expect(document.querySelectorAll("#inscricao")).toHaveLength(1);
    expect(document.querySelectorAll("#candidatura-etapas")).toHaveLength(1);
    fireEvent.click(within(section).getByRole("button", { name: "Fechar prévia" }));
    expect(
      within(section).getByRole("heading", { name: "Inscrições em preparação" }),
    ).toBeInTheDocument();
    expect(outbound).not.toHaveBeenCalled();
  });

  it("não altera handlers de submissão, backend ou outras seções da rota", () => {
    const source = readFileSync("src/routes/seja-afiliada.tsx", "utf8");
    expect(source.match(/<AffiliateSimpleForm\b/g)).toHaveLength(1);
    expect(source.match(/id="inscricao"/g)).toHaveLength(1);
    expect(source.match(/<AffiliateCustomerVoiceTeaser\s*\/>/g)).toHaveLength(1);
    expect(source).toContain('data-testid="vonix-c64-preparation-details"');
    expect(source).toContain("<AffiliateApplicationEditorialArt />");
    expect(source).toContain('to="/consultar-candidatura"');
    expect(source).toContain('data-testid="affiliate-c117-explore-steps"');
    expect(source).not.toContain("ganhos garantidos");
  });
});
