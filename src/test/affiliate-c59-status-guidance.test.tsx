import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { AffiliateStatusGuidance } from "@/components/affiliate-status-guidance";

afterEach(cleanup);

describe("C59 private tracking result guidance", () => {
  it("gives a pending applicant a useful next action without a deadline", () => {
    render(<AffiliateStatusGuidance status="pendente" />);
    expect(screen.getByText("Sua inscrição está na fila de avaliação.")).toBeInTheDocument();
    expect(screen.getByText(/não precisa enviar outro cadastro/)).toBeInTheDocument();
    expect(screen.getByText(/Não há prazo de resposta garantido/)).toBeInTheDocument();
  });
  it("does not promise an activated link, coupon or payment on approval", () => {
    render(<AffiliateStatusGuidance status="aprovada" />);
    expect(
      screen.getByText(/não ativa automaticamente um link, cupom, pagamento ou contrato/),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Conhecer os canais oficiais/ })).toHaveAttribute(
      "href",
      "/sobre",
    );
  });
  it("treats a rejected candidate as a closed evaluation rather than success", () => {
    render(<AffiliateStatusGuidance status="recusada" />);
    expect(screen.getByText("Esta avaliação foi encerrada.")).toBeInTheDocument();
    expect(screen.getByText(/quando as inscrições estiverem abertas/)).toBeInTheDocument();
  });
  it("does not render private code or applicant fields from public guidance", () => {
    const { container } = render(<AffiliateStatusGuidance status="aprovada" />);
    expect(container.querySelector("input")).toBeNull();
    expect(
      container.querySelector("[data-testid='affiliate-c59-next-action']"),
    ).toBeInTheDocument();
    expect(container.textContent).not.toMatch(/@|32 caracteres|senha de acesso/i);
  });
});
