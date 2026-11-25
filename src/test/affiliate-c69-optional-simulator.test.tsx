import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AffiliateLandingOffer } from "@/components/affiliate-landing";

afterEach(cleanup);

describe("C69 — exemplo de ganhos opcional antes da candidatura", () => {
  it.each(["open", "closed"] as const)(
    "keeps all published conditions and a truthful CTA visible in %s state",
    (status) => {
      render(<AffiliateLandingOffer recruitmentStatus={status} />);
      const earnings = screen.getByTestId("vonix-affiliate-earnings");
      const optional = screen.getByTestId("vonix-c69-optional-simulator") as HTMLDetailsElement;
      const action = screen.getByTestId("vonix-c64-immediate-signup");
      expect(optional.open).toBe(false);
      expect(within(earnings).getByText("8%")).toBeInTheDocument();
      expect(earnings).toHaveTextContent("Comissão de 8% em cada venda");
      expect(earnings).toHaveTextContent("Bônus a cada R$ 10 mil vendidos");
      expect(earnings).toHaveTextContent("Cresça para supervisora");
      expect(earnings).toHaveTextContent("Não há promoção automática");
      expect(action.querySelector('a[href="#inscricao"]')).not.toBeNull();
      expect(
        optional.compareDocumentPosition(action) & Node.DOCUMENT_POSITION_FOLLOWING,
      ).toBeTruthy();
      expect(screen.getByTestId("vonix-affiliate-hero")).toBeInTheDocument();
      expect(screen.getByText("Explorar um cálculo ilustrativo de comissões")).toBeInTheDocument();
      expect(optional).toHaveTextContent("não é previsão nem garantia de ganhos");
    },
  );

  it("opens and closes the native disclosure while keeping the original calculator functional", () => {
    render(<AffiliateLandingOffer recruitmentStatus="open" />);
    const optional = screen.getByTestId("vonix-c69-optional-simulator") as HTMLDetailsElement;
    const summary = within(optional)
      .getByText("Explorar um cálculo ilustrativo de comissões")
      .closest("summary");
    if (!summary) throw new Error("Missing native summary");
    expect(optional.open).toBe(false);
    fireEvent.click(summary);
    expect(optional.open).toBe(true);
    const slider = within(optional).getByRole("slider", { name: /Valor hipotético de vendas/ });
    fireEvent.change(slider, { target: { value: "10000" } });
    expect(within(optional).getByTestId("illustrative-commission")).toHaveTextContent("R$ 800,00");
    expect(within(optional).getByTestId("illustrative-bonus")).toHaveTextContent("R$ 0,00");
    expect(within(optional).getByTestId("illustrative-total")).toHaveTextContent("R$ 800,00");
    const bonus = within(optional).getByRole("checkbox", { name: /Simular bônus, se elegível/ });
    expect(bonus).not.toBeChecked();
    fireEvent.click(bonus);
    expect(within(optional).getByTestId("illustrative-bonus")).toHaveTextContent("R$ 500,00");
    expect(within(optional).getByTestId("illustrative-total")).toHaveTextContent("R$ 1.300,00");
    expect(optional).toHaveTextContent("Não é promessa de ganhos");
    fireEvent.click(summary);
    expect(optional.open).toBe(false);
  });
});
