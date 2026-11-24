import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AffiliateCustomerVoiceTeaser } from "@/components/affiliate-customer-voice-teaser";
import { AffiliateVerifiedReviewPreview } from "@/components/affiliate-verified-review-preview";
import { AffiliateProductProof } from "@/components/affiliate-product-proof";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  window.history.replaceState(null, "", window.location.pathname + window.location.search);
});

describe("C144 official review journey", () => {
  it("labels three video choices and one photo without loading video players in the teaser", () => {
    render(<AffiliateCustomerVoiceTeaser />);
    const section = screen.getByTestId("affiliate-c101-customer-voice");
    const choices = within(section).getAllByTestId("affiliate-c106-review-choice");
    expect(choices.map((choice) => choice.textContent?.trim())).toEqual([
      "MarianaVídeo",
      "Ayla MunizVídeo",
      "FernandaVídeo",
      "Ana PaulaFoto",
    ]);
    expect(section.querySelector("video")).toBeNull();
  });
  it("opens and focuses the exact requested original review", async () => {
    render(
      <>
        <AffiliateVerifiedReviewPreview />
        <AffiliateProductProof />
      </>,
    );
    fireEvent.click(screen.getByRole("link", { name: /Ver avaliação com foto de Ana Paula/ }));
    const details = screen.getByTestId("affiliate-c93-review-disclosure") as HTMLDetailsElement;
    expect(details.open).toBe(true);
    const card = details.querySelector('[data-review-card-author="Ana Paula"]');
    await waitFor(() => expect(card).toHaveFocus());
    expect(card).toContainElement(within(details).getByTestId("affiliate-c86-customer-photo"));
  });
  it("does not open the disclosure on a modified link click", () => {
    render(
      <>
        <AffiliateVerifiedReviewPreview />
        <AffiliateProductProof />
      </>,
    );
    const link = screen.getByRole("link", { name: /Ver avaliação com foto de Ana Paula/ });
    fireEvent.click(link, { ctrlKey: true });
    expect((screen.getByTestId("affiliate-c93-review-disclosure") as HTMLDetailsElement).open).toBe(
      false,
    );
  });
  it("pauses only other review videos on play, and pauses when the full disclosure closes", () => {
    render(
      <>
        <AffiliateCustomerVoiceTeaser />
        <AffiliateProductProof />
      </>,
    );
    const details = screen.getByTestId("affiliate-c93-review-disclosure") as HTMLDetailsElement;
    details.open = true;
    fireEvent.click(screen.getByTestId("affiliate-c107-video-toggle"));
    const preview = screen.getByTestId("affiliate-c107-review-video") as HTMLVideoElement;
    const full = within(details).getAllByTestId(
      "affiliate-c62-customer-video",
    ) as HTMLVideoElement[];
    const unrelated = document.createElement("video");
    document.body.append(unrelated);
    try {
      for (const video of [preview, ...full, unrelated]) {
        Object.defineProperty(video, "paused", { value: false, configurable: true });
        vi.spyOn(video, "pause").mockImplementation(() => {});
      }
      fireEvent.play(full[0]!);
      expect(preview.pause).toHaveBeenCalledOnce();
      expect(full[0]!.pause).not.toHaveBeenCalled();
      expect(full[1]!.pause).toHaveBeenCalledOnce();
      expect(unrelated.pause).not.toHaveBeenCalled();
      details.open = false;
      fireEvent(details, new Event("toggle"));
      expect(full[0]!.pause).toHaveBeenCalledOnce();
      expect(unrelated.pause).not.toHaveBeenCalled();
    } finally {
      unrelated.remove();
    }
  });
});
