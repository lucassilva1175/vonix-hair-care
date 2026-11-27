import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AffiliateReadinessActions } from "@/components/affiliate-readiness-actions";
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
