import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AffiliateProductDiscoveryStrip } from "@/components/affiliate-product-discovery-strip";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("C142 catalog navigation", () => {
  it("offers explicit mobile controls, updates position and prevents moving beyond bounds", () => {
    render(<AffiliateProductDiscoveryStrip />);
    const list = screen.getByTestId("affiliate-c132-products");
    const scrollTo = vi.fn();
    Object.defineProperty(list, "scrollTo", { value: scrollTo, configurable: true });
    fireEvent.click(screen.getByTestId("affiliate-c135-catalog-toggle"));
    const controls = screen.getByTestId("affiliate-c142-catalog-controls");
    const prev = within(controls).getByRole("button", { name: "Produto anterior" });
    const next = within(controls).getByRole("button", { name: "Próximo produto" });
    expect(prev).toBeDisabled();
    expect(within(controls).getByRole("status")).toHaveTextContent("1 de 3");
    fireEvent.click(next);
    expect(within(controls).getByRole("status")).toHaveTextContent("2 de 3");
    fireEvent.click(next);
    expect(within(controls).getByRole("status")).toHaveTextContent("3 de 3");
    expect(next).toBeDisabled();
    fireEvent.click(prev);
    expect(within(controls).getByRole("status")).toHaveTextContent("2 de 3");
    expect(scrollTo).toHaveBeenCalledTimes(3);
  });
  it("returns to the single application anchor when open", () => {
    const preview = vi.fn();
    render(<AffiliateProductDiscoveryStrip recruitmentOpen onSafePreview={preview} />);
    const link = screen.getByTestId("affiliate-c142-catalog-apply");
    expect(link).toHaveAttribute("href", "#inscricao");
    expect(link).toHaveTextContent("Quero me candidatar");
    fireEvent.click(link);
    expect(preview).not.toHaveBeenCalled();
  });
  it("opens only the safe preview when recruitment is not confirmed open", () => {
    const preview = vi.fn();
    render(<AffiliateProductDiscoveryStrip onSafePreview={preview} />);
    const link = screen.getByTestId("affiliate-c142-catalog-apply");
    expect(link).toHaveAttribute("href", "#inscricao");
    expect(link).toHaveTextContent(/prévia/i);
    fireEvent.click(link);
    expect(preview).toHaveBeenCalledOnce();
  });
});
