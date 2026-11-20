import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AffiliateLandingFAQ } from "@/components/affiliate-landing";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("C84 Vonix: perguntas frequentes encontráveis sem coleta de dados", () => {
  it("mostra as sete respostas e os termos originais antes da pesquisa", () => {
    const requests = vi.spyOn(globalThis, "fetch");
    render(<AffiliateLandingFAQ />);
    const faq = screen.getByTestId("vonix-affiliate-faq");
    expect(faq.querySelectorAll("details")).toHaveLength(7);
    expect(within(faq).getByTestId("vonix-c84-faq-result-count")).toHaveTextContent(
      "7 respostas encontradas",
    );
    expect(within(faq).getByRole("searchbox", { name: "Encontre sua resposta" })).toHaveAttribute(
      "autocomplete",
      "off",
    );
    expect(faq).toHaveTextContent("Preciso comprar algum produto para me inscrever?");
    expect(faq).toHaveTextContent("O envio da candidatura não garante produtos gratuitos");
    expect(faq).toHaveTextContent("E-mail é obrigatório para se candidatar?");
    expect(within(faq).getByRole("button", { name: "TikTok" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(requests).not.toHaveBeenCalled();
  });

  it("filtra sem acentos e abre a resposta nativa no teclado", () => {
    render(<AffiliateLandingFAQ />);
    const faq = screen.getByTestId("vonix-affiliate-faq");
    const search = within(faq).getByRole("searchbox", { name: "Encontre sua resposta" });
    fireEvent.change(search, { target: { value: "comissao" } });
    expect(faq.querySelectorAll("details")).toHaveLength(1);
    expect(within(faq).getByTestId("vonix-c84-faq-result-count")).toHaveTextContent(
      "1 resposta encontrada",
    );
    const disclosure = faq.querySelector("details");
    expect(disclosure).not.toHaveAttribute("open");
    const summary = within(faq).getByText(/Vou receber produtos, cupom, pagamento ou comissão/i);
    fireEvent.click(summary);
    expect(disclosure).toHaveAttribute("open");
    expect(disclosure).toHaveTextContent("8%");
    expect(disclosure).toHaveTextContent("dependem de elegibilidade");
  });

  it("oferece atalhos acessíveis para TikTok e E-mail, com toggle e limpeza", () => {
    render(<AffiliateLandingFAQ />);
    const faq = screen.getByTestId("vonix-affiliate-faq");
    const tiktok = within(faq).getByRole("button", { name: "TikTok" });
    fireEvent.click(tiktok);
    expect(tiktok).toHaveAttribute("aria-pressed", "true");
    expect(faq.querySelectorAll("details")).toHaveLength(2);
    expect(within(faq).getByRole("searchbox", { name: "Encontre sua resposta" })).toHaveValue(
      "TikTok",
    );
    fireEvent.click(within(faq).getByRole("button", { name: "E-mail" }));
    expect(within(faq).getByRole("button", { name: "E-mail" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(faq.querySelectorAll("details")).toHaveLength(2);
    fireEvent.click(within(faq).getByRole("button", { name: "Limpar busca" }));
    expect(faq.querySelectorAll("details")).toHaveLength(7);
    expect(within(faq).queryByRole("button", { name: "Limpar busca" })).not.toBeInTheDocument();
  });

  it("mostra estado vazio útil e não registra palavras em URL ou requisições", () => {
    const requests = vi.spyOn(globalThis, "fetch");
    const locationBefore = window.location.href;
    render(<AffiliateLandingFAQ />);
    const faq = screen.getByTestId("vonix-affiliate-faq");
    fireEvent.change(within(faq).getByRole("searchbox", { name: "Encontre sua resposta" }), {
      target: { value: "TERMO_SEM_CORRESPONDENCIA_TESTE" },
    });
    expect(faq.querySelectorAll("details")).toHaveLength(0);
    const empty = within(faq).getByTestId("vonix-c84-faq-empty");
    expect(empty).toHaveTextContent("Não encontramos uma pergunta");
    expect(within(empty).getByRole("link", { name: /conhecer o formulário/i })).toHaveAttribute(
      "href",
      "#inscricao",
    );
    expect(empty.textContent).not.toContain("TERMO_SEM_CORRESPONDENCIA_TESTE");
    expect(window.location.href).toBe(locationBefore);
    expect(requests).not.toHaveBeenCalled();
  });
});
