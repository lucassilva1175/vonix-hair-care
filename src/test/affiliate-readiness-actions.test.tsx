import { fireEvent, render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { AffiliateReadinessActions } from "@/components/affiliate-readiness-actions";
import { buildAffiliateAcceptanceWorksheet } from "@/lib/affiliate-readiness-worksheet";
describe("Read-only readiness actions", () => {
  it("separates failed reads from a positive opening switch and maps unresolved checks", () => {
    render(
      <AffiliateReadinessActions
        readiness={{
          checks: [
            { id: "migration", label: "Migração", ok: false },
            { id: "resend", label: "E-mail", ok: false },
            { id: "launch", label: "Abertura", ok: true },
          ],
          databaseResponding: false,
          governanceResponding: false,
          recruitmentOpen: true,
        }}
      />,
    );
    expect(screen.getByText(/1 de 3 verificações/)).toBeInTheDocument();
    expect(screen.getByText("Consulta ao banco não confirmada.")).toBeInTheDocument();
    expect(screen.getByText("Governança não confirmada.")).toBeInTheDocument();
    expect(screen.getByText(/Homologue remetente, worker e caixa de teste/)).toBeInTheDocument();
    expect(screen.queryByText("Configuração e consultas responderam.")).toBeNull();
  });
  it("exports only aggregate diagnostic facts and leaves all real acceptance gates pending", () => {
    const worksheet = buildAffiliateAcceptanceWorksheet({
      checks: [{ id: "synthetic", label: "candidate@example.invalid", ok: true }],
      databaseResponding: true,
      governanceResponding: false,
      recruitmentOpen: false,
      checkedAt: Date.UTC(2026, 10, 27, 12),
    });
    expect(worksheet).toContain("2026-11-27T12:00:00.000Z");
    expect(worksheet).toContain("Configuração: 1 de 1");
    expect(worksheet).toContain("Consulta de governança: não confirmada");
    expect(worksheet.match(/Resultado: PENDENTE DE VERIFICAÇÃO/g)).toHaveLength(6);
    expect(worksheet).not.toContain("candidate@example.invalid");
  });
  it("does not display an invalid diagnostic date or certify a missing timestamp", () => {
    const readiness = {
      checks: [],
      databaseResponding: true,
      governanceResponding: true,
      recruitmentOpen: false,
      checkedAt: 9e15,
    };
    render(<AffiliateReadinessActions readiness={readiness} />);
    expect(screen.queryByText(/Diagnóstico desta consulta/)).toBeNull();
    expect(buildAffiliateAcceptanceWorksheet(readiness)).toContain(
      "Horário da consulta não informado.",
    );
  });
  it("provides a manual worksheet when object URL creation is unavailable", () => {
    const original = Object.getOwnPropertyDescriptor(URL, "createObjectURL");
    Object.defineProperty(URL, "createObjectURL", {
      configurable: true,
      value: vi.fn(() => {
        throw new Error("Synthetic denied");
      }),
    });
    try {
      render(
        <AffiliateReadinessActions
          readiness={{
            checks: [],
            databaseResponding: false,
            governanceResponding: false,
            recruitmentOpen: false,
          }}
        />,
      );
      fireEvent.click(screen.getByText("Roteiro de aceite real"));
      fireEvent.click(screen.getByRole("button", { name: "Baixar roteiro de homologação" }));
      expect((screen.getByRole("textbox") as HTMLTextAreaElement).value).toContain(
        "PENDENTE DE VERIFICAÇÃO",
      );
    } finally {
      if (original) Object.defineProperty(URL, "createObjectURL", original);
      else Reflect.deleteProperty(URL, "createObjectURL");
    }
  });
  it("never turns all green configuration into operational acceptance", () => {
    render(
      <AffiliateReadinessActions
        readiness={{
          checks: [{ id: "launch", label: "Abertura", ok: true }],
          databaseResponding: true,
          governanceResponding: true,
          recruitmentOpen: true,
        }}
      />,
    );
    expect(screen.getByText("Configuração e consultas responderam.")).toBeInTheDocument();
    expect(screen.getByText(/antes de declarar a operação homologada/)).toBeInTheDocument();
  });
});
