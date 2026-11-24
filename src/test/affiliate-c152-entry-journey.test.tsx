import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { AffiliateEditorialHero } from "@/components/affiliate-editorial-hero";
import { AffiliateApplicationBridge } from "@/components/affiliate-application-bridge";
import { AffiliateDiscoveryGate } from "@/components/affiliate-discovery-gate";
afterEach(() => {
  cleanup();
  window.history.replaceState(null, "", window.location.pathname);
});
describe("C152 clear program entry", () => {
  it("names the program directly while preserving the brand slogan and correct CTA", () => {
    render(<AffiliateEditorialHero recruitmentStatus="open" />);
    const hero = screen.getByTestId("vonix-affiliate-hero");
    expect(within(hero).getByRole("heading", { level: 1 })).toHaveTextContent(
      "Seja afiliada Vonix Hair.",
    );
    expect(
      within(hero).getByText("Seu jeito de criar. Nossa paixão por cabelos."),
    ).toBeInTheDocument();
    expect(within(hero).getByRole("link", { name: "Quero ser afiliada Vonix" })).toHaveAttribute(
      "href",
      "#inscricao",
    );
  });
  it("reveals optional videos directly without opening a candidate form", () => {
    render(
      <>
        <AffiliateApplicationBridge status="closed" />
        <AffiliateDiscoveryGate>
          <section id="catalogo-em-video">Official media</section>
          <section id="formatos">Creative ideas</section>
        </AffiliateDiscoveryGate>
      </>,
    );
    const gate = screen.getByTestId("affiliate-c96-discovery-gate") as HTMLDetailsElement;
    expect(gate.open).toBe(false);
    const link = screen.getByTestId("affiliate-c152-video-link");
    expect(link).toHaveAttribute("href", "#catalogo-em-video");
    fireEvent.click(link, { ctrlKey: true });
    expect(gate.open).toBe(false);
    fireEvent.click(link);
    expect(gate.open).toBe(true);
    expect(screen.getByTestId("affiliate-c125-bridge-cta")).toHaveTextContent("prévia segura");
  });
});
