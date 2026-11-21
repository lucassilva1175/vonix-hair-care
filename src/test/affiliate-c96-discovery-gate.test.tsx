import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AffiliateDiscoveryGate } from "@/components/affiliate-discovery-gate";

const fixture = (
  <>
    <div id="avaliacoes-produtos">Quatro avaliações de clientes sobre produtos</div>
    <div id="catalogo-em-video">Vídeos de catálogo oficial</div>
    <div id="criterios">Quatro temas de perfil</div>
    <div id="perfis">Ideias de conteúdo</div>
    <div id="formatos">Exemplos ilustrativos de produção</div>
  </>
);

beforeEach(() => {
  window.history.replaceState(null, "", "/seja-afiliada");
  vi.stubGlobal("fetch", vi.fn());
  if (!Element.prototype.scrollIntoView) {
    Element.prototype.scrollIntoView = vi.fn();
  }
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  window.history.replaceState(null, "", "/seja-afiliada");
});

describe("C96 — conteúdo extra opcional sem perder links existentes", () => {
  it("entrega HTML inicial recolhido, original e navegável pelo summary sem JS", () => {
    const html = renderToStaticMarkup(<AffiliateDiscoveryGate>{fixture}</AffiliateDiscoveryGate>);
    const host = document.createElement("div");
    host.innerHTML = html;
    const gate = host.querySelector<HTMLDetailsElement>(
      '[data-testid="affiliate-c96-discovery-gate"]',
    );
    expect(gate?.open).toBe(false);
    expect(gate?.querySelector("summary")).toHaveTextContent("Conheça a Vonix além da inscrição.");
    expect(gate?.querySelector("summary")).toHaveTextContent("não relatos de afiliadas aprovadas");
    for (const id of [
      "avaliacoes-produtos",
      "catalogo-em-video",
      "criterios",
      "perfis",
      "formatos",
    ]) {
      expect(gate?.querySelector("#" + id)).not.toBeNull();
    }
    expect(gate?.querySelectorAll("summary img")).toHaveLength(2);
    expect(gate?.querySelectorAll("summary img[loading=lazy]")).toHaveLength(2);
    expect(host.querySelector("form, input, video, iframe")).toBeNull();
    expect(gate?.getAttribute("data-interactive")).toBeNull();
  });

  it("abre conteúdo por qualquer link existente e reabre pelo MESMO hash após recolher", () => {
    render(
      <>
        <nav aria-label="Links da página">
          <a href="#perfis">Ideias</a>
          <a href="#avaliacoes-produtos">Avaliações</a>
          <a href="#catalogo-em-video">Vídeos</a>
          <a href="#criterios">Para quem é</a>
          <a href="#formatos">Roteiros</a>
          <a href="#inscricao">Inscrição</a>
        </nav>
        <div id="inscricao">Formulário existente (não alterado)</div>
        <AffiliateDiscoveryGate>{fixture}</AffiliateDiscoveryGate>
      </>,
    );
    const gate = screen.getByTestId("affiliate-c96-discovery-gate") as HTMLDetailsElement;
    expect(gate.open).toBe(false);
    expect(gate).toHaveAttribute("data-interactive", "true");
    for (const name of ["Ideias", "Avaliações", "Vídeos", "Para quem é", "Roteiros"]) {
      gate.open = false;
      fireEvent.click(
        within(screen.getByRole("navigation", { name: "Links da página" })).getByRole("link", {
          name,
        }),
      );
      expect(gate.open).toBe(true);
    }
    gate.open = false;
    fireEvent.click(screen.getByRole("link", { name: "Inscrição" }));
    expect(gate.open).toBe(false);
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it("revela acesso direto por URL e hashchange sem alterar seção de candidatura", () => {
    window.history.replaceState(null, "", "/seja-afiliada#criterios");
    const { rerender } = render(<AffiliateDiscoveryGate>{fixture}</AffiliateDiscoveryGate>);
    let gate = screen.getByTestId("affiliate-c96-discovery-gate") as HTMLDetailsElement;
    expect(gate.open).toBe(true);
    window.history.replaceState(null, "", "/seja-afiliada");
    rerender(<div>Teste troca de página</div>);
    render(<AffiliateDiscoveryGate>{fixture}</AffiliateDiscoveryGate>);
    gate = screen.getByTestId("affiliate-c96-discovery-gate") as HTMLDetailsElement;
    expect(gate.open).toBe(false);
    window.history.replaceState(null, "", "/seja-afiliada#formatos");
    fireEvent(window, new Event("hashchange"));
    expect(gate.open).toBe(true);
  });

  it("mantém conteúdo acessível e atribuições transparentes quando aberto", () => {
    render(<AffiliateDiscoveryGate>{fixture}</AffiliateDiscoveryGate>);
    const gate = screen.getByTestId("affiliate-c96-discovery-gate") as HTMLDetailsElement;
    fireEvent.click(within(gate).getByText("Explorar fotos, vídeos e ideias"));
    expect(gate.open).toBe(true);
    expect(
      within(gate).getByText("Quatro avaliações de clientes sobre produtos"),
    ).toBeInTheDocument();
    expect(within(gate).getByText(/não comprovam parcerias de afiliadas/i)).toBeInTheDocument();
    expect(within(gate).getByRole("link", { name: /Voltar à inscrição/i })).toHaveAttribute(
      "href",
      "#inscricao",
    );
  });
});
