import { readFileSync } from "node:fs";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AffiliateApplicationStepsPreview } from "@/components/affiliate-application-steps-preview";
import { AffiliateCreatorSpotlight } from "@/components/affiliate-creator-spotlight";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("C108 — descoberta opcional acessível, inscrição mais perto no celular", () => {
  it("resumo inicial traz condições essenciais e mantém todas as 3 etapas disponíveis", () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const { container } = render(<AffiliateApplicationStepsPreview />);
    const root = screen.getByTestId("vonix-c66-application-steps");
    const toggle = within(root).getByTestId("affiliate-c108-steps-toggle");
    const rail = within(root).getByTestId("vonix-c79-steps-rail");
    expect(toggle).toHaveAttribute("type", "button");
    expect(toggle).toHaveAttribute("aria-controls", "vonix-affiliate-steps-rail");
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveTextContent("3 etapas · sem portfólio obrigatório");
    expect(rail).toHaveAttribute("id", "vonix-affiliate-steps-rail");
    expect(rail).toHaveClass("hidden", "lg:block");
    expect(within(root).getAllByTestId("vonix-c79-step-card")).toHaveLength(3);
    expect(root).toHaveTextContent("não garante aprovação");
    expect(within(root).getByRole("link", { name: /Já se inscreveu/ })).toHaveAttribute(
      "href",
      "/consultar-candidatura",
    );
    expect(container.querySelectorAll("form, input, iframe, video")).toHaveLength(0);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("expande detalhes e mantém os três tópicos, fechamento reseta etapa anterior", () => {
    render(<AffiliateApplicationStepsPreview />);
    const toggle = screen.getByTestId("affiliate-c108-steps-toggle");
    const rail = screen.getByTestId("vonix-c79-steps-rail");
    toggle.focus();
    fireEvent.click(toggle);
    expect(toggle).toHaveFocus();
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(rail).not.toHaveClass("hidden");
    expect(rail).toHaveClass("block");
    const steps = within(rail).getAllByTestId("affiliate-c104-step-toggle");
    const panels = within(rail).getAllByTestId("affiliate-c104-step-detail");
    expect(steps).toHaveLength(3);
    fireEvent.click(steps[0]!);
    expect(steps[0]).toHaveAttribute("aria-expanded", "true");
    expect(panels[0]).not.toHaveAttribute("hidden");
    expect(panels[0]).toHaveTextContent("TikTok é opcional");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(rail).toHaveClass("hidden");
    expect(steps[0]).toHaveAttribute("aria-expanded", "false");
    expect(panels[0]).toHaveAttribute("hidden");
    fireEvent.click(toggle);
    fireEvent.click(steps[2]!);
    expect(panels[2]).toHaveTextContent("não ativa um vínculo");
  });

  it("painel de ideias inicia recolhido só no celular e CTA continua explícito", () => {
    const network = vi.spyOn(globalThis, "fetch");
    const { container } = render(<AffiliateCreatorSpotlight />);
    const root = screen.getByTestId("affiliate-c100-creator-spotlight");
    const toggle = within(root).getByTestId("affiliate-c108-styles-toggle");
    const group = within(root).getByRole("group", { name: "Escolha seu estilo de conteúdo" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(toggle).toHaveAttribute("aria-controls", "affiliate-c100-path-options");
    expect(group).toHaveAttribute("id", "affiliate-c100-path-options");
    expect(group).toHaveClass("hidden", "sm:grid");
    expect(within(root).getAllByTestId("affiliate-c100-path-button")).toHaveLength(3);
    expect(root).toHaveTextContent("Nenhum estilo garante aprovação");
    expect(within(root).getByRole("link", { name: /Ir direto à inscrição/ })).toHaveAttribute(
      "href",
      "#inscricao",
    );
    expect(container.querySelectorAll("form, video, iframe")).toHaveLength(0);
    expect(network).not.toHaveBeenCalled();
  });

  it("abre ideias sob escolha, troca o estilo e recolhe descartando só a seleção editorial", () => {
    render(<AffiliateCreatorSpotlight />);
    const toggle = screen.getByTestId("affiliate-c108-styles-toggle");
    const choices = screen.getAllByTestId("affiliate-c100-path-button");
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("group", { name: "Escolha seu estilo de conteúdo" })).not.toHaveClass(
      "hidden",
    );
    fireEvent.click(choices[1]!);
    expect(screen.getByTestId("affiliate-c100-selected-path")).toHaveTextContent(
      "Sua criatividade",
    );
    expect(choices.filter((b) => b.getAttribute("aria-pressed") === "true")).toHaveLength(1);
    fireEvent.click(toggle);
    expect(screen.queryByTestId("affiliate-c100-selected-path")).not.toBeInTheDocument();
    expect(choices.every((b) => b.getAttribute("aria-pressed") === "false")).toBe(true);
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("group", { name: "Escolha seu estilo de conteúdo" })).toHaveClass(
      "hidden",
    );
  });

  it("SSR preserva acesso aos detalhes de ambos sem introduzir prova social inventada", () => {
    const html = renderToStaticMarkup(
      <>
        <AffiliateApplicationStepsPreview />
        <AffiliateCreatorSpotlight />
      </>,
    );
    const root = document.createElement("div");
    root.innerHTML = html;
    expect(root.querySelectorAll('[data-testid="affiliate-c108-steps-toggle"]')).toHaveLength(1);
    expect(root.querySelectorAll('[data-testid="affiliate-c108-styles-toggle"]')).toHaveLength(1);
    expect(root.querySelectorAll('[data-testid="vonix-c79-step-card"]')).toHaveLength(3);
    expect(root.querySelectorAll('[data-testid="affiliate-c100-path-button"]')).toHaveLength(3);
    expect(root.querySelectorAll('[aria-pressed="true"]')).toHaveLength(0);
    expect(root.querySelectorAll("form, input, video, [autoplay]")).toHaveLength(0);
    expect(root.textContent).toContain("não garante aprovação");
    expect(root.textContent).not.toMatch(
      /afiliada aprovada garantida|15% no site|21% TikTok|produto grátis/i,
    );
  });

  it("fluxo mantém prova social autêntica antes do único formulário e inscrição real isolada", () => {
    const source = readFileSync("src/routes/seja-afiliada.tsx", "utf8");
    const steps = source.indexOf("<AffiliateApplicationStepsPreview />");
    const creator = source.indexOf("<AffiliateCreatorSpotlight />");
    const reviews = source.indexOf("<AffiliateCustomerVoiceTeaser />");
    const prep = source.indexOf("vonix-c64-preparation-details");
    const form = source.indexOf("<AffiliateSimpleForm");
    expect(steps).toBeGreaterThan(-1);
    expect(creator).toBeGreaterThan(steps);
    expect(reviews).toBeGreaterThan(-1);
    expect(prep).toBeGreaterThan(reviews);
    expect(form).toBeGreaterThan(prep);
    expect(steps).toBeGreaterThan(form);
  });
});
