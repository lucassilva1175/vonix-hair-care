import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children, ...props }: React.PropsWithChildren<{ to: string }>) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));
const analytics = vi.hoisted(() => ({ track: vi.fn() }));
vi.mock("@/lib/analytics", () => ({ track: analytics.track }));
import { AffiliateShell } from "@/components/affiliate-shell";

beforeEach(() => analytics.track.mockClear());
afterEach(cleanup);

describe("C127 — CTA de cabeçalho segue o estado real da seleção", () => {
  it.each(["loading", "closed", "limited", "unavailable"] as const)(
    "usa prévia segura em %s sem presumir inscrição aberta",
    (status) => {
      const onSafePreview = vi.fn();
      render(
        <AffiliateShell recruitmentStatus={status} onSafePreview={onSafePreview}>
          <p>Jornada de candidatura</p>
        </AffiliateShell>,
      );
      const link = screen.getByTestId("affiliate-c127-header-apply");
      expect(link).toHaveAttribute("href", "#inscricao");
      expect(link).toHaveAccessibleName(/prévia segura/i);
      fireEvent.click(link);
      expect(onSafePreview).toHaveBeenCalledTimes(1);
      expect(analytics.track).toHaveBeenCalledExactlyOnceWith("affiliate_application_interest");
      expect(JSON.stringify(analytics.track.mock.calls)).not.toMatch(
        /sign_up|Lead|email|phone|instagram|https?:/i,
      );
    },
  );

  it("não inicia simulação quando o servidor confirmou OPEN", () => {
    const onSafePreview = vi.fn();
    render(
      <AffiliateShell recruitmentStatus="open" onSafePreview={onSafePreview}>
        <p>Programa</p>
      </AffiliateShell>,
    );
    fireEvent.click(screen.getByTestId("affiliate-c127-header-apply"));
    expect(onSafePreview).not.toHaveBeenCalled();
    expect(analytics.track).toHaveBeenCalledExactlyOnceWith("affiliate_application_interest");
  });

  it("não ativa CTA de inscrição no portal privado", () => {
    const onSafePreview = vi.fn();
    render(
      <AffiliateShell mode="account" onSafePreview={onSafePreview}>
        <p>Consulta privada</p>
      </AffiliateShell>,
    );
    expect(screen.queryByTestId("affiliate-c127-header-apply")).not.toBeInTheDocument();
    expect(onSafePreview).not.toHaveBeenCalled();
    expect(analytics.track).not.toHaveBeenCalled();
  });
});
