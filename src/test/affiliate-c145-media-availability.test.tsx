import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AffiliateCatalogInMotion } from "@/components/affiliate-catalog-in-motion";
import { AffiliateDiscoveryGate } from "@/components/affiliate-discovery-gate";
import { getProduct } from "@/lib/store";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.history.replaceState(null, "", window.location.pathname);
});

describe("C145 official product media and disclosure", () => {
  it("uses only available products and the official Monovonix video", () => {
    render(<AffiliateCatalogInMotion recruitmentOpen />);
    const section = screen.getByTestId("vonix-c63-catalog-motion");
    const cards = within(section).getAllByTestId("vonix-c63-video-card");
    expect(cards).toHaveLength(6);
    for (const card of cards) {
      const slug = within(card)
        .getByRole("link", { name: /ver produto no site/i })
        .getAttribute("href")!
        .replace("/produto/", "");
      expect(getProduct(slug)).toBeDefined();
      expect(slug).not.toBe("plex-vonix");
    }
    const mono = cards.find((card) => card.textContent?.includes("Kit Monovonix"))!;
    expect(mono.querySelector("source")).toHaveAttribute("src", "/provas/ig-07.mp4");
  });
  it("pauses other videos in the catalog and all hidden videos when closing the discovery section", () => {
    render(
      <AffiliateDiscoveryGate>
        <AffiliateCatalogInMotion recruitmentOpen={false} />
      </AffiliateDiscoveryGate>,
    );
    const gate = screen.getByTestId("affiliate-c96-discovery-gate") as HTMLDetailsElement;
    gate.open = true;
    const players = within(gate).getAllByTestId("vonix-c63-product-video") as HTMLVideoElement[];
    for (const player of players) {
      Object.defineProperty(player, "paused", { value: false, configurable: true });
      vi.spyOn(player, "pause").mockImplementation(() => {});
    }
    fireEvent.play(players[0]!);
    expect(players[0]!.pause).not.toHaveBeenCalled();
    expect(players[1]!.pause).toHaveBeenCalledOnce();
    gate.open = false;
    fireEvent(gate, new Event("toggle"));
    expect(players[0]!.pause).toHaveBeenCalledOnce();
    expect(players[1]!.pause).toHaveBeenCalledTimes(2);
  });
});
