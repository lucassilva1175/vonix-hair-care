import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AffiliateOperationalOverview } from "@/components/affiliate-operational-overview";
import {
  affiliateOperationsReport,
  formatAffiliatePercent,
  summarizeAffiliateOperations,
} from "@/lib/affiliate-operational-overview";

const stats = { pendente: 6, aprovada: 3, recusada: 1 };
const mail = { pendente: 0, processando: 1, enviado: 1, falhou: 0, incerto: 1 };
const checkedAt = Date.parse("2026-11-27T12:00:00Z");
const callbacks = () => ({
  onPending: vi.fn(),
  onDecisions: vi.fn(),
  onMissing: vi.fn(),
  onUncertain: vi.fn(),
  onFailed: vi.fn(),
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("Affiliate aggregate operational overview", () => {
  it("uses only real global denominators, not page size or assumed visits", () => {
    const s = summarizeAffiliateOperations(stats, mail)!;
    expect(s).toMatchObject({
      total: 10,
      pending: 6,
      decided: 4,
      recorded: 3,
      missing: 1,
      attention: 1,
      reviewedPercent: 40,
      approvalPercent: 75,
      notificationPercent: 75,
    });
    const report = affiliateOperationsReport(s, checkedAt)!;
    expect(report).toContain("2026-11-27T12:00:00.000Z");
    expect(report).toContain("Aprovadas / analisadas: 75%");
    expect(report).toContain("não mede visitantes ou conversão de visitas");
    expect(report).toContain("Aceitação pelo provedor não comprova entrega");
    expect(report).not.toMatch(/@|https?:\/\/|segredo da candidata/i);
    expect(affiliateOperationsReport(s, NaN)).toBeNull();
  });
  it("distinguishes zero denominators from zero percent and rejects inconsistent snapshots", () => {
    const zero = summarizeAffiliateOperations(
      { pendente: 0, aprovada: 0, recusada: 0 },
      { pendente: 0, processando: 0, enviado: 0, falhou: 0, incerto: 0 },
    )!;
    expect(zero.reviewedPercent).toBeNull();
    expect(zero.approvalPercent).toBeNull();
    expect(zero.notificationPercent).toBeNull();
    expect(formatAffiliatePercent(null)).toBe("Não aplicável");
    expect(formatAffiliatePercent(0)).toBe("0%");
    expect(summarizeAffiliateOperations({ ...stats, pendente: -1 }, mail)).toBeNull();
    expect(summarizeAffiliateOperations(stats, { ...mail, enviado: 99 })).toBeNull();
    expect(
      summarizeAffiliateOperations({ ...stats, pendente: Number.MAX_SAFE_INTEGER }, mail),
    ).toBeNull();
  });
  it("links only available priorities to the existing authorized queues", () => {
    const actions = callbacks();
    render(
      <AffiliateOperationalOverview
        stats={stats}
        mail={mail}
        fresh
        checkedAt={checkedAt}
        loading={false}
        {...actions}
      />,
    );
    const panel = screen.getByTestId("affiliate-operational-overview");
    fireEvent.click(within(panel).getByText("Panorama da operação"));
    fireEvent.click(within(panel).getByRole("button", { name: "Inscrições pendentes: 6" }));
    fireEvent.click(within(panel).getByRole("button", { name: "Notificações incertas: 1" }));
    fireEvent.click(within(panel).getByRole("button", { name: "Decisões sem registro: 1" }));
    expect(actions.onPending).toHaveBeenCalledOnce();
    expect(actions.onUncertain).toHaveBeenCalledOnce();
    expect(actions.onMissing).toHaveBeenCalledOnce();
    expect(within(panel).getByRole("button", { name: "Notificações com falha: 0" })).toBeDisabled();
  });
  it("withdraws all ratios and export actions when the snapshot is no longer fresh", () => {
    const actions = callbacks();
    const { rerender } = render(
      <AffiliateOperationalOverview
        stats={stats}
        mail={mail}
        fresh
        checkedAt={checkedAt}
        loading={false}
        {...actions}
      />,
    );
    expect(screen.getByText("Análise das inscrições")).toBeInTheDocument();
    rerender(
      <AffiliateOperationalOverview
        stats={stats}
        mail={mail}
        fresh={false}
        checkedAt={null}
        loading
        {...actions}
      />,
    );
    expect(screen.queryByText("Análise das inscrições")).toBeNull();
    expect(screen.queryByText("Baixar resumo interno (.txt)")).toBeNull();
    expect(screen.getByText("Atualizando panorama…")).toBeInTheDocument();
  });
  it("requests a local text download and suppresses downloads while backgrounded", () => {
    let blob: Blob | undefined;
    const create = vi.fn((b: Blob) => {
      blob = b;
      return "blob:qa";
    });
    const revoke = vi.fn();
    vi.stubGlobal(
      "URL",
      Object.assign(class extends URL {}, { createObjectURL: create, revokeObjectURL: revoke }),
    );
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const visibility = vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    render(
      <AffiliateOperationalOverview
        stats={stats}
        mail={mail}
        fresh
        checkedAt={checkedAt}
        loading={false}
        {...callbacks()}
      />,
    );
    const panel = screen.getByTestId("affiliate-operational-overview");
    fireEvent.click(within(panel).getByText("Panorama da operação"));
    const button = within(panel).getByRole("button", { name: "Baixar resumo interno (.txt)" });
    fireEvent.click(button);
    expect(create).not.toHaveBeenCalled();
    visibility.mockReturnValue("visible");
    fireEvent.click(button);
    expect(create).toHaveBeenCalledOnce();
    expect(blob?.type).toBe("text/plain;charset=utf-8");
    expect(click).toHaveBeenCalledOnce();
    expect(within(panel).getByText(/Download solicitado/)).toBeInTheDocument();
  });
});
