import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

const server = vi.hoisted(() => ({ submit: vi.fn() }));
vi.mock("@/lib/affiliate-functions", () => ({
  submitSimpleAffiliateApplication: server.submit,
  issuePrivateAffiliateReceipt: () => ({
    ok: true,
    trackingCode: btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(24))))
      .replace(/\+/g, "-")
      .replace(/\//g, "_"),
    trackingProof: "B".repeat(43),
  }),
}));
vi.mock("@/lib/analytics", () => ({ track: vi.fn() }));

import { AffiliateApplicationStepsPreview } from "@/components/affiliate-application-steps-preview";
import { AffiliateSimpleForm } from "@/components/affiliate-simple-form";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  window.sessionStorage.removeItem("vonix-affiliate-unconfirmed-code");
});

describe("C79: convite editorial com provas de produto e navegação sem coleta extra", () => {
  it("mostra tres passos ilustrados por materiais oficiais sem se passar por depoimentos de criadoras", () => {
    const { container } = render(<AffiliateApplicationStepsPreview />);
    const section = screen.getByTestId("vonix-c66-application-steps");
    expect(within(section).getAllByRole("listitem")).toHaveLength(3);
    expect(within(section).getAllByTestId("vonix-c79-step-card")).toHaveLength(3);
    expect(within(section).getByRole("heading", { level: 2 })).toHaveTextContent(
      "Da sua ideia à sua candidatura.",
    );
    const images = within(section).getAllByRole("img");
    expect(images).toHaveLength(3);
    expect(images.map((img) => img.getAttribute("src"))).toEqual([
      "/images/products/kit-banana-e-mel.webp",
      "/images/products/kit-cronograma-capilar.webp",
      "/images/products/botox-vonix.webp",
    ]);
    expect(images.every((img) => img.getAttribute("alt")?.includes("Vonix"))).toBe(true);
    expect(section).toHaveTextContent(/não de afiliadas ou de parcerias/i);
    expect(
      within(section).getByRole("link", { name: /Acompanhe sua candidatura/i }),
    ).toHaveAttribute("href", "/consultar-candidatura");
    expect(container.querySelector("form, input, video, audio, source, [autoplay]")).toBeNull();
  });

  it("os atalhos alcançam os campos certos sem guardar PII em URL, em modo prévia", () => {
    render(<AffiliateSimpleForm preview />);
    const progress = screen.getByTestId("affiliate-c70-form-progress");
    const links = within(progress).getAllByTestId("vonix-c79-group-jump");
    expect(links).toHaveLength(4);
    expect(links.map((el) => el.getAttribute("href"))).toEqual([
      "#simple-contact-heading",
      "#simple-social-heading",
      "#simple-address-heading",
      "#simple-privacyAccepted",
    ]);
    for (const link of links) {
      const target = document.querySelector(link.getAttribute("href") ?? "");
      expect(target).toBeInTheDocument();
      expect(target).toHaveClass("scroll-mt-40");
      expect(link).toHaveClass("min-h-14");
    }
    expect(progress).toHaveTextContent("não validação");
    expect(within(progress).getAllByText("Pendente")).toHaveLength(4);
    fireEvent.change(screen.getByLabelText(/Nome completo/), {
      target: { value: "Candidata Teste Privada" },
    });
    expect(progress.textContent).not.toContain("Candidata Teste Privada");
    expect(links.map((el) => el.getAttribute("href")).join(" ")).not.toContain("Privada");
    expect(server.submit).not.toHaveBeenCalled();
  });

  it("indicadores de grupos continuam reativos, com acesso por teclado e sem envio automatico", () => {
    render(<AffiliateSimpleForm preview />);
    const progress = screen.getByTestId("affiliate-c70-form-progress");
    const links = within(progress).getAllByTestId("vonix-c79-group-jump");
    expect(links.every((el) => el.tagName === "A")).toBe(true);
    expect(links[0]).toHaveAccessibleName(/Contato Pendente/);
    fireEvent.change(screen.getByLabelText(/Nome completo/), {
      target: { value: "Pessoa Exemplo" },
    });
    fireEvent.change(screen.getByLabelText(/^E-mail/), {
      target: { value: "pessoa@example.invalid" },
    });
    fireEvent.change(screen.getByLabelText(/Telefone com DDD/), {
      target: { value: "31999999999" },
    });
    expect(links[0]).toHaveTextContent("Informado");
    expect(links[1]).toHaveTextContent("Pendente");
    expect(server.submit).not.toHaveBeenCalled();
  });
});
