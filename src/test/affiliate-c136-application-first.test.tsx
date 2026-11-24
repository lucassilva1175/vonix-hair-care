import { cleanup, render, screen, within } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { afterEach, describe, expect, it } from "vitest";
import { AffiliateProductDiscoveryStrip } from "@/components/affiliate-product-discovery-strip";
afterEach(cleanup);
describe("C136 — a candidatura precede o catálogo exploratório adicional", () => {
  it("conserva prova inicial e guia de inscrição antes do formulário, e move a vitrine C132 para depois", () => {
    const source = readFileSync("src/routes/seja-afiliada.tsx", "utf8");
    const order = [
      "<AffiliateLandingOffer",
      "<AffiliateCustomerVoiceTeaser",
      "<AffiliateApplicationBridge",
      'id="inscricao"',
      " <AffiliateNextSteps",
      "<AffiliateProductDiscoveryStrip",
      "<AffiliateApplicationStepsPreview",
    ];
    const positions = order.map((key) => source.indexOf(key));
    for (const [i, at] of positions.entries()) {
      expect(at, `ordem: ${order[i]}`).toBeGreaterThan(-1);
      if (i > 0) expect(at, `ordem após ${order[i - 1]}`).toBeGreaterThan(positions[i - 1]!);
    }
    expect(source.match(/<AffiliateProductDiscoveryStrip\b/g)).toHaveLength(1);
    expect(source.match(/<AffiliateApplicationBridge\b/g)).toHaveLength(1);
    expect(source.match(/id="inscricao"/g)).toHaveLength(1);
    expect(source).not.toContain("<AffiliatePublicProductVoices");
  });
  it("rotula as ideias como opcionais, mantém três produtos reais e não simula afiliadas", () => {
    render(<AffiliateProductDiscoveryStrip />);
    const section = screen.getByTestId("affiliate-c132-catalog");
    expect(
      within(section).getByRole("heading", { name: /Ideias para apresentar o catálogo/i }),
    ).toBeInTheDocument();
    expect(section).toHaveTextContent(/opcional/i);
    expect(within(section).getAllByTestId("affiliate-c132-product-card")).toHaveLength(3);
    expect(within(section).getByTestId("affiliate-c135-catalog-toggle")).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(section).not.toHaveTextContent(/depoimentos de afiliadas|renda garantida/i);
  });
});
