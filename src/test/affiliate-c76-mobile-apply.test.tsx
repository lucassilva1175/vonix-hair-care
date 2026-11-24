import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AffiliateMobileApplyBar } from "@/components/affiliate-mobile-apply-bar";

let observers: Array<{ callback: IntersectionObserverCallback; nodes: Element[] }> = [];
function trigger(target: Element, visible: boolean) {
  act(() => {
    observers.forEach((o) => {
      if (o.nodes.includes(target))
        o.callback(
          [{ target, isIntersecting: visible } as IntersectionObserverEntry],
          {} as IntersectionObserver,
        );
    });
  });
}
function targets() {
  const hero = document.createElement("section");
  hero.setAttribute("data-testid", "vonix-affiliate-hero");
  const form = document.createElement("section");
  form.id = "inscricao";
  document.body.append(hero, form);
  return { hero, form };
}
beforeEach(() => {
  observers = [];
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      private record: { callback: IntersectionObserverCallback; nodes: Element[] };
      constructor(callback: IntersectionObserverCallback) {
        this.record = { callback, nodes: [] };
        observers.push(this.record);
      }
      observe = (node: Element) => this.record.nodes.push(node);
      disconnect = () => {
        this.record.nodes.length = 0;
      };
    },
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  document.getElementById("inscricao")?.remove();
  document.querySelector('[data-testid="vonix-affiliate-hero"]')?.remove();
});

describe("C76: CTA mobile do programa sem envio nem sobreposição", () => {
  it("C126 abre a prévia apenas se não estiver OPEN, sem trocar disponibilidade", () => {
    const { hero, form } = targets();
    const onSafePreview = vi.fn();
    const { rerender } = render(
      <AffiliateMobileApplyBar recruitmentStatus="closed" onSafePreview={onSafePreview} />,
    );
    trigger(hero, false);
    trigger(form, false);
    fireEvent.click(screen.getByRole("link", { name: /conhecer o formulário/i }));
    expect(onSafePreview).toHaveBeenCalledTimes(1);

    rerender(<AffiliateMobileApplyBar recruitmentStatus="open" onSafePreview={onSafePreview} />);
    fireEvent.click(screen.getByRole("link", { name: /fazer minha inscrição/i }));
    expect(onSafePreview).toHaveBeenCalledTimes(1);
  });

  it("aguarda a primeira medição e só aparece fora da hero e do formulário", () => {
    const { hero, form } = targets();
    const { rerender } = render(<AffiliateMobileApplyBar recruitmentStatus="loading" />);
    expect(screen.queryByRole("navigation", { name: /atalho mobile/i })).not.toBeInTheDocument();
    trigger(hero, false);
    trigger(form, false);
    expect(screen.getByRole("link", { name: /ver prévia segura/i })).toHaveAttribute(
      "href",
      "#inscricao",
    );
    expect(screen.getByText("Consultando disponibilidade")).toBeInTheDocument();
    rerender(<AffiliateMobileApplyBar recruitmentStatus="open" />);
    expect(screen.getByRole("link", { name: /fazer minha inscrição/i })).toHaveAttribute(
      "href",
      "#inscricao",
    );
    expect(screen.getByTestId("affiliate-c76-mobile-apply")).toHaveAttribute("data-status", "open");
    trigger(form, true);
    expect(screen.queryByTestId("affiliate-c76-mobile-apply")).not.toBeInTheDocument();
    trigger(form, false);
    trigger(hero, true);
    expect(screen.queryByTestId("affiliate-c76-mobile-apply")).not.toBeInTheDocument();
    trigger(hero, false);
    expect(screen.getByTestId("affiliate-c76-mobile-apply")).toBeInTheDocument();
  });
  it("reflete honestamente open, closed, limited e unavailable e não envia dados", () => {
    const { hero, form } = targets();
    const { rerender, container } = render(<AffiliateMobileApplyBar recruitmentStatus="open" />);
    trigger(hero, false);
    trigger(form, false);
    rerender(<AffiliateMobileApplyBar recruitmentStatus="closed" />);
    expect(screen.getByRole("link", { name: /conhecer o formulário/i })).toHaveAttribute(
      "href",
      "#inscricao",
    );
    rerender(<AffiliateMobileApplyBar recruitmentStatus="limited" />);
    expect(screen.getByRole("link", { name: /ver prévia segura/i })).toHaveAttribute(
      "href",
      "#inscricao",
    );
    rerender(<AffiliateMobileApplyBar recruitmentStatus="unavailable" />);
    expect(screen.getByText("Disponibilidade não confirmada")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /ver prévia segura/i })).toHaveAttribute(
      "href",
      "#inscricao",
    );
    expect(container.querySelector("form")).toBeNull();
    expect(container.querySelector('a[href^="http"]')).toBeNull();
    expect(container.querySelector("input")).toBeNull();
  });
  it("com IntersectionObserver ausente não cria barra sobre campos", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    targets();
    render(<AffiliateMobileApplyBar recruitmentStatus="open" />);
    expect(screen.queryByTestId("affiliate-c76-mobile-apply")).not.toBeInTheDocument();
  });
  it("usa safe-area, tamanho mínimo 48px e movimento reduzido no link", () => {
    const { hero, form } = targets();
    const { container } = render(<AffiliateMobileApplyBar recruitmentStatus="open" />);
    trigger(hero, false);
    trigger(form, false);
    const nav = container.querySelector("[data-testid=affiliate-c76-mobile-apply]");
    const anchor = screen.getByRole("link", { name: /fazer minha inscrição/i });
    expect(nav).toHaveClass("md:hidden");
    expect(nav?.className).toContain("safe-area-inset-bottom");
    expect(anchor).toHaveClass("min-h-12");
    expect(anchor).toHaveClass("motion-reduce:transition-none");
  });
});
