import { renderToString } from "react-dom/server";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AffiliateEditorialPlanner } from "@/components/affiliate-editorial-planner";
import { AffiliateEarningsSimulator } from "@/components/affiliate-creator-opportunity";

afterEach(cleanup);

describe("Editorial interaction readiness", () => {
  it.each([
    ["planner", <AffiliateEditorialPlanner />],
    ["simulator", <AffiliateEarningsSimulator />],
  ] as const)(
    "keeps %s controls disabled in server HTML and readable while loading",
    (_name, view) => {
      const html = renderToString(view);
      const container = document.createElement("div");
      container.innerHTML = html;
      expect(container.querySelector('[data-interactive="false"]')).not.toBeNull();
      const controls = Array.from(container.querySelectorAll("select, input, button"));
      expect(controls.length).toBeGreaterThan(0);
      expect(controls.every((node) => node.hasAttribute("disabled"))).toBe(true);
      expect(container.textContent).toMatch(/Preparando/);
    },
  );
  it("enables planner choices only after mount and gives each task its own accessible name", () => {
    render(<AffiliateEditorialPlanner />);
    const planner = screen.getByTestId("affiliate-editorial-planner");
    expect(planner).toHaveAttribute("data-interactive", "true");
    expect(within(planner).getByLabelText("Meu estilo")).toBeEnabled();
    const names = within(planner)
      .getAllByRole("checkbox")
      .map((node) => node.getAttribute("aria-label"));
    expect(new Set(names).size).toBe(3);
    expect(names.every((name) => name?.startsWith("Preparei esta ideia: "))).toBe(true);
    expect(
      within(planner).getByRole("button", { name: "Copiar meu plano editorial" }),
    ).toBeEnabled();
  });
  it("enables the calculator after mount without altering the default illustration", () => {
    render(<AffiliateEarningsSimulator />);
    expect(screen.getByRole("slider")).toBeEnabled();
    expect(screen.getByRole("textbox")).toBeEnabled();
    expect(screen.getByRole("checkbox")).toBeEnabled();
    expect(screen.getByTestId("illustrative-commission")).toHaveTextContent("R$ 200,00");
  });
});
