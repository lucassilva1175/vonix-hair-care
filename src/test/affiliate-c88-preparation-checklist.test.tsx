import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AffiliateApplicationPrep } from "@/components/affiliate-application-prep";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

const labels = [
  "Tenho 18 anos ou mais",
  "Separei meus dados de contato",
  "Separei meu endereço com CEP e número",
  "Tenho meu Instagram e o número aproximado de seguidores",
];

describe("C88: affiliate checklist is guidance, never a real application", () => {
  it("disables all four controls in server HTML until handlers are connected", () => {
    const html = renderToStaticMarkup(<AffiliateApplicationPrep />);
    const element = document.createElement("div");
    element.innerHTML = html;
    expect(element.querySelectorAll('input[type="checkbox"]:disabled')).toHaveLength(4);
  });

  it("renders four local checkboxes and retains existing requirements and optional TikTok", () => {
    render(<AffiliateApplicationPrep />);
    const guide = screen.getByTestId("affiliate-c54-preparation");
    const progress = within(guide).getByTestId("affiliate-c88-preparation-progress");
    expect(within(guide).getAllByRole("listitem")).toHaveLength(4);
    expect(within(guide).getAllByRole("checkbox")).toHaveLength(4);
    for (const label of labels) {
      expect(within(guide).getByRole("checkbox", { name: label })).not.toBeChecked();
    }
    expect(progress).toHaveTextContent("0 de 4 itens organizados");
    expect(within(progress).getByRole("progressbar")).toHaveAttribute("value", "0");
    expect(guide).toHaveTextContent("É opcional");
    expect(guide).toHaveTextContent("Não é necessário criar um portfólio");
    expect(guide).toHaveTextContent("não garante aprovação");
    expect(within(guide).getByRole("link", { name: /Política de Privacidade/i })).toHaveAttribute(
      "href",
      "/politica-de-privacidade",
    );
    expect(within(guide).getByTestId("affiliate-c88-safe-next-step")).toHaveAttribute(
      "href",
      "#inscricao",
    );
    expect(
      guide.querySelector('input:not([type="checkbox"]), form, button[type="submit"]'),
    ).toBeNull();
  });

  it("updates preparation progress without personal data, storage, enrollment, or network calls", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const storeSpy = vi.spyOn(Storage.prototype, "setItem");
    render(<AffiliateApplicationPrep />);
    const guide = screen.getByTestId("affiliate-c54-preparation");
    const progress = within(guide).getByRole("progressbar");

    for (const [index, label] of labels.entries()) {
      fireEvent.click(within(guide).getByRole("checkbox", { name: label }));
      expect(within(guide).getByText(index + 1 + " de 4 itens organizados")).toBeInTheDocument();
      expect(progress).toHaveAttribute("value", String(index + 1));
    }
    expect(guide).toHaveTextContent("não valida idade");
    expect(guide).toHaveTextContent("não realiza candidatura");
    fireEvent.click(within(guide).getByRole("checkbox", { name: labels[2] }));
    expect(progress).toHaveAttribute("value", "3");
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(storeSpy).not.toHaveBeenCalled();
  });

  it("never persists the checked items on unmount or page revisit", () => {
    const first = render(<AffiliateApplicationPrep />);
    fireEvent.click(screen.getByRole("checkbox", { name: labels[0] }));
    expect(screen.getByText("1 de 4 itens organizados")).toBeInTheDocument();
    first.unmount();
    render(<AffiliateApplicationPrep />);
    expect(screen.getByText("0 de 4 itens organizados")).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: labels[0] })).not.toBeChecked();
  });
});
