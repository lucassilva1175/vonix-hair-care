import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AffiliateLandingIntro, AffiliateLandingFAQ } from "@/components/affiliate-landing";
import { AffiliateEarningsSimulator } from "@/components/affiliate-creator-opportunity";
import { illustrativeEarnings } from "@/lib/affiliate-marketing-math";

afterEach(cleanup);

describe("Vonix affiliate V2 editorial journey", () => {
  it("keeps the mobile galleries keyboard-accessible and swipeable, without importing third-party claims", () => {
    render(<AffiliateLandingIntro recruitmentStatus="closed" />);
    const topics = screen.getByRole("region", { name: /Quatro aspectos de afinidade Vonix Hair/ });
    const ideas = screen.getByRole("region", { name: /Formatos criativos ilustrados/ });
    expect(topics).toHaveAttribute("tabindex", "0");
    expect(ideas).toHaveAttribute("tabindex", "0");
    expect(topics.className).toContain("snap-x");
    expect(ideas.className).toContain("snap-x");
    expect(within(ideas).getAllByRole("article")).toHaveLength(4);
    expect(screen.getByTestId("vonix-affiliate-hero")).toBeInTheDocument();
    expect(
      screen.getAllByRole("link", {
        name: /Conhecer a inscrição|Visualizar formulário|Conhecer a candidatura/i,
      }).length,
    ).toBeGreaterThan(0);
    expect(document.body.textContent).not.toMatch(
      /Skence|Pliv Pro|3 milhões|21% de comissão|PIX no dia 10/i,
    );
  });

  it("preserves six independent, native and accessible FAQ disclosures", () => {
    render(<AffiliateLandingFAQ />);
    const faq = screen.getByTestId("vonix-affiliate-faq");
    expect(faq.querySelectorAll("details")).toHaveLength(7);
    expect(within(faq).getAllByText(/Quem pode apresentar uma candidatura/i)).toHaveLength(1);
  });

  it.each([
    [0, 0, 0, 0],
    [2500, 200, 0, 200],
    [10000, 800, 500, 1300],
    [20000, 1600, 1000, 2600],
    [NaN, 0, 0, 0],
  ])(
    "illustrates %s in sales without changing operational commission rules",
    (sales, commission, bonus, total) => {
      expect(illustrativeEarnings(sales)).toEqual({
        sales: Number.isNaN(sales) ? 0 : sales,
        commission,
        bonus,
        total,
      });
    },
  );

  it("bounds invalid and out-of-range simulator input", () => {
    expect(illustrativeEarnings(-500).total).toBe(0);
    expect(illustrativeEarnings(25000)).toEqual({
      sales: 20000,
      commission: 1600,
      bonus: 1000,
      total: 2600,
    });
    expect(illustrativeEarnings(Infinity).total).toBe(0);
  });

  it("updates all illustrative amounts and distinguishes conditional bonus from earnings", () => {
    render(<AffiliateEarningsSimulator />);
    const slider = screen.getByRole("slider", { name: /Valor hipotético de vendas/ });
    expect(slider).toHaveAttribute("min", "0");
    expect(slider).toHaveAttribute("max", "20000");
    // Cent precision keeps typed amounts and the slider synchronized.
    expect(slider).toHaveAttribute("step", "0.01");
    fireEvent.change(slider, { target: { value: "10000" } });
    expect(screen.getByTestId("illustrative-commission").textContent?.replace(/\s/g, " ")).toBe(
      "R$ 800,00",
    );
    expect(screen.getByTestId("illustrative-bonus")).toHaveTextContent("R$ 0,00");
    expect(screen.getByTestId("illustrative-total")).toHaveTextContent("R$ 800,00");
    fireEvent.click(screen.getByRole("checkbox", { name: /Simular bônus, se elegível/ }));
    expect(screen.getByTestId("illustrative-bonus").textContent?.replace(/\s/g, " ")).toBe(
      "R$ 500,00",
    );
    expect(screen.getByTestId("illustrative-total").textContent?.replace(/\s/g, " ")).toBe(
      "R$ 1.300,00",
    );
    expect(screen.getByText(/Não é promessa de ganhos/)).toBeInTheDocument();
    expect(screen.getByText(/Sem elegibilidade, o bônus não se aplica/)).toBeInTheDocument();
    const scenarios = screen.getByRole("group", { name: "Cenários ilustrativos de vendas" });
    fireEvent.click(within(scenarios).getByRole("button", { name: /R\$\s*20\.000,00/ }));
    expect(slider).toHaveValue("20000");
    expect(screen.getByTestId("illustrative-total")).toHaveTextContent("R$ 2.600,00");
    fireEvent.click(screen.getByRole("checkbox", { name: /Simular bônus, se elegível/ }));
    expect(screen.getByTestId("illustrative-total")).toHaveTextContent("R$ 1.600,00");
    expect(within(scenarios).getByRole("button", { name: /R\$\s*20\.000,00/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    fireEvent.click(within(scenarios).getByRole("button", { name: /R\$\s*5\.000,00/ }));
    expect(screen.getByTestId("illustrative-total")).toHaveTextContent("R$ 400,00");
  });
});

describe("Brazilian currency examples", () => {
  it("accepts formatted pasted BRL and preserves cent precision", () => {
    render(<AffiliateEarningsSimulator />);
    const input = screen.getByRole("textbox", { name: /Ou informe um valor/ });
    fireEvent.change(input, { target: { value: "R$ 1.234,56" } });
    expect(screen.getByRole("slider")).toHaveValue("1234.56");
    expect(screen.getByTestId("illustrative-commission")).toHaveTextContent("R$ 98,76");
    fireEvent.change(input, { target: { value: "9.999,99" } });
    fireEvent.click(screen.getByRole("checkbox", { name: /Simular bônus, se elegível/ }));
    expect(screen.getByTestId("illustrative-bonus")).toHaveTextContent("R$ 0,00");
    fireEvent.change(input, { target: { value: "10.000,00" } });
    expect(screen.getByTestId("illustrative-bonus")).toHaveTextContent("R$ 500,00");
  });
  it("does not silently interpret malformed money or change the last valid result", () => {
    render(<AffiliateEarningsSimulator />);
    const input = screen.getByRole("textbox", { name: /Ou informe um valor/ });
    fireEvent.change(input, { target: { value: "1234,56" } });
    for (const bad of ["1.2", "12,345", "-10", "1e3", "abc"]) {
      fireEvent.change(input, { target: { value: bad } });
      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(screen.getByRole("slider")).toHaveValue("1234.56");
    }
    fireEvent.change(input, { target: { value: "30.000,01" } });
    expect(input).toHaveValue("20000");
    expect(input).toHaveAttribute("aria-invalid", "false");
  });
});
