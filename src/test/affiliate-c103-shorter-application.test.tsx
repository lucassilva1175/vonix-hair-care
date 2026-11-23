import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

const server = vi.hoisted(() => ({ submit: vi.fn() }));
const analytics = vi.hoisted(() => ({ track: vi.fn() }));
vi.mock("@/lib/affiliate-functions", () => ({
  submitSimpleAffiliateApplication: server.submit,
}));
vi.mock("@/lib/analytics", () => ({ track: analytics.track }));
vi.mock("@/lib/affiliate-funnel", () => ({ trackAffiliateFunnel: vi.fn() }));

import { AffiliateSimpleForm } from "@/components/affiliate-simple-form";

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  window.sessionStorage.removeItem("vonix-affiliate-unconfirmed-code");
  window.sessionStorage.removeItem("vonix-affiliate-once-code");
});

function details() {
  return screen.getByTestId("affiliate-c103-tiktok-optional") as HTMLDetailsElement;
}
function toggle() {
  const item = details();
  fireEvent.click(within(item).getByText(/Também tem TikTok\?/));
  return item;
}

describe("C103 — candidatura mobile-first orientada ao Instagram", () => {
  it("coloca contato e Instagram antes do endereço obrigatório, na ordem do progresso", () => {
    const { container } = render(<AffiliateSimpleForm preview />);
    const form = container.querySelector("form");
    expect(form).not.toBeNull();
    const groups = [...form!.querySelectorAll("section[aria-labelledby]")].map((item) =>
      item.getAttribute("aria-labelledby"),
    );
    expect(groups.slice(0, 3)).toEqual([
      "simple-contact-heading",
      "simple-social-heading",
      "simple-address-heading",
    ]);
    const progress = screen.getByTestId("affiliate-c70-form-progress");
    expect(
      within(progress)
        .getAllByTestId("vonix-c79-group-jump")
        .map((item) => item.getAttribute("href")),
    ).toEqual(["#simple-contact-heading", "#simple-social-heading", "#simple-address-heading"]);
    expect(form).toHaveTextContent("Endereço completo");
    expect(form).toHaveTextContent("CEP");
    expect(form).toHaveTextContent("Estado (UF)");
    expect(form!.querySelectorAll("form")).toHaveLength(0);
    expect(server.submit).not.toHaveBeenCalled();
  });

  it("mantém TikTok fora da jornada inicial e permite informar sem sair do formulário", () => {
    render(<AffiliateSimpleForm preview />);
    const optional = details();
    expect(optional.open).toBe(false);
    expect(optional).toHaveTextContent("Opcional");
    toggle();
    expect(optional.open).toBe(true);
    fireEvent.change(screen.getByLabelText(/^TikTok \(opcional\)/), {
      target: { value: "@meuperfil_teste" },
    });
    fireEvent.change(screen.getByLabelText(/Seguidores no TikTok \(opcional\)/), {
      target: { value: "520" },
    });
    toggle();
    expect(optional.open).toBe(false);
    toggle();
    expect(optional.open).toBe(true);
    expect(screen.getByLabelText(/^TikTok \(opcional\)/)).toHaveValue("@meuperfil_teste");
    expect(screen.getByLabelText(/Seguidores no TikTok \(opcional\)/)).toHaveValue("520");
    expect(screen.getByTestId("affiliate-c70-progress-count")).toHaveTextContent("0 de 3");
    expect(analytics.track).not.toHaveBeenCalled();
    expect(server.submit).not.toHaveBeenCalled();
  });

  it("reabre automaticamente campos opcionais inválidos antes de mostrar os erros", () => {
    const { container } = render(<AffiliateSimpleForm preview />);
    toggle();
    fireEvent.change(screen.getByLabelText(/Seguidores no TikTok \(opcional\)/), {
      target: { value: "seguidores?" },
    });
    toggle();
    expect(details().open).toBe(false);
    fireEvent.submit(container.querySelector("form")!);
    expect(details().open).toBe(true);
    expect(screen.getByTestId("vonix-c81-validation-summary")).toHaveTextContent(
      "Seguidores no TikTok",
    );
    expect(server.submit).not.toHaveBeenCalled();
  });

  it("não cria novo cadastro, posta dados ou coloca perfis em URLs/metadados", () => {
    const markup = renderToStaticMarkup(<AffiliateSimpleForm preview />);
    const root = document.createElement("div");
    root.innerHTML = markup;
    expect(root.querySelectorAll("form")).toHaveLength(1);
    const optional = root.querySelector("details[data-testid='affiliate-c103-tiktok-optional']");
    expect(optional).not.toBeNull();
    expect(optional).not.toHaveAttribute("open");
    const anchors = [...root.querySelectorAll("a")];
    expect(anchors.every((item) => !item.href.includes("meuperfil_teste"))).toBe(true);
    expect(anchors.every((item) => !item.hasAttribute("data-pii"))).toBe(true);
    expect(root.querySelectorAll("iframe, video, [autoplay]")).toHaveLength(0);
  });
});
