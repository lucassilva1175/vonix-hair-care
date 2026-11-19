import type { ComponentType, ReactNode } from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AffiliateApplicationStepsPreview } from "@/components/affiliate-application-steps-preview";

vi.mock("@/lib/affiliate-functions", () => ({
  getAffiliateRecruitmentStatus: vi.fn().mockResolvedValue({ open: false }),
}));
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (options: { component: ComponentType }) => options,
  Link: ({ children }: { children: ReactNode }) => <a href="/">{children}</a>,
}));
vi.mock("@/components/affiliate-shell", () => ({
  AffiliateShell: ({ children }: { children: ReactNode }) => <main>{children}</main>,
}));
vi.mock("@/lib/store", () => ({ SITE_URL: "https://vonixhair.com" }));
vi.mock("@/components/affiliate-simple-form", () => ({ AffiliateSimpleForm: () => null }));
import { AffiliateApplicationPage } from "@/routes/seja-afiliada";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("C66 application guidance without submission", () => {
  it("keeps three informational steps without network, forms or media", () => {
    const request = vi.fn().mockRejectedValue(new Error("Network forbidden in C66 test"));
    vi.stubGlobal("fetch", request);
    const { container } = render(<AffiliateApplicationStepsPreview />);
    const steps = screen.getAllByRole("listitem");
    expect(steps).toHaveLength(3);
    expect(steps[0]).toHaveTextContent("Apresente seu perfil gratuitamente.");
    expect(steps[1]).toHaveTextContent("Se o envio for confirmado, guarde o código de acompanhamento.");
    expect(steps[2]).toHaveTextContent("Consulte o andamento pelo código, sem prazo ou aprovação garantidos.");
    expect(screen.getAllByRole("heading", { level: 2 })).toHaveLength(1);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/consultar-candidatura");
    expect(container.querySelector("form, input, video, audio, source, [autoplay]")).toBeNull();
    expect(request).not.toHaveBeenCalled();
  });

  it("inserts only between C65 and the unchanged C64 preparation and application", async () => {
    const request = vi.fn().mockRejectedValue(new Error("Network forbidden in C66 route test"));
    vi.stubGlobal("fetch", request);
    render(<AffiliateApplicationPage />);
    await screen.findByText("Inscrições em preparação");
    const preview = screen.getByTestId("vonix-c66-application-steps");
    const reviews = screen.getByTestId("vonix-c65-review-preview");
    const prep = screen.getByTestId("vonix-c64-preparation-details");
    expect(reviews.nextElementSibling).toBe(preview);
    expect(preview.nextElementSibling).toContainElement(prep);
    const signup = document.getElementById("inscricao");
    if (!signup) throw new Error("Missing application section");
    expect(prep.compareDocumentPosition(signup) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(within(preview).getByRole("link")).toHaveAttribute("href", "/consultar-candidatura");
    const ids = [...document.querySelectorAll("[id]")].map((node) => node.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(request).not.toHaveBeenCalled();
  });
});