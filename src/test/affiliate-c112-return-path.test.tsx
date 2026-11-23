import { readFileSync } from "node:fs";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@tanstack/react-router", () => ({
  Link: ({ to, children, ...props }: React.PropsWithChildren<{ to: string }>) => (
    <a href={to} {...props}>
      {children}
    </a>
  ),
}));
import { AffiliateShell } from "@/components/affiliate-shell";
afterEach(cleanup);

describe("C112: navegação objetiva e retorno seguro", () => {
  it("coloca consulta por código primeiro no menu móvel e desktop", () => {
    render(
      <AffiliateShell>
        <p>Programa</p>
      </AffiliateShell>,
    );
    const mobile = within(screen.getByRole("navigation", { name: "Acesso rápido ao programa" }));
    const desktop = within(
      screen.getByRole("navigation", { name: "Navegação da seleção de afiliadas" }),
    );
    for (const nav of [mobile, desktop]) {
      const links = nav.getAllByRole("link");
      expect(links).toHaveLength(5);
      expect(links[0]).toHaveTextContent("Já me inscrevi");
      expect(links[0]).toHaveAttribute("href", "/consultar-candidatura");
      expect(links.slice(1).map((link) => link.getAttribute("href"))).toEqual([
        "#ganhos",
        "#como-funciona",
        "#avaliacoes-rapidas",
        "#duvidas",
      ]);
      expect(nav.queryByText("Depoimentos de afiliadas")).not.toBeInTheDocument();
    }
  });
  it("não sugere candidatura real quando o servidor não abriu inscrições", () => {
    const { rerender } = render(
      <AffiliateShell recruitmentStatus="closed">
        <p>Programa</p>
      </AffiliateShell>,
    );
    expect(
      screen.getByRole("link", { name: /Ver inscrição Conhecer a inscrição/ }),
    ).toHaveAttribute("href", "#inscricao");
    expect(
      screen.getByRole("link", { name: /Ver inscrição Conhecer a inscrição/ }),
    ).toHaveAttribute("href", "#inscricao");
    rerender(
      <AffiliateShell recruitmentStatus="open">
        <p>Programa</p>
      </AffiliateShell>,
    );
    expect(
      screen.getByRole("link", { name: /Quero participar Enviar candidatura/ }),
    ).toHaveAttribute("href", "#inscricao");
    expect(
      screen.getByRole("link", { name: /Quero participar Enviar candidatura/ }),
    ).toHaveAttribute("href", "#inscricao");
  });
  it("explica os dados, diferencia prévia e orienta candidatas já inscritas", () => {
    const source = readFileSync("src/routes/seja-afiliada.tsx", "utf8");
    for (const label of [
      "18 anos ou mais",
      "E-mail válido obrigatório",
      "Instagram com seguidores",
      "TikTok opcional",
      "Consultar meu status pelo código",
    ]) {
      expect(source).toContain(label);
    }
    expect(source).toContain('data-testid="affiliate-c112-form-essentials"');
    expect(source).toContain('data-testid="affiliate-c112-form-status"');
    expect(source).toContain('to="/consultar-candidatura"');
    expect(source).toContain("Após um envio confirmado, guarde o código privado");
    expect(source).not.toContain("ganhos garantidos");
  });
});
