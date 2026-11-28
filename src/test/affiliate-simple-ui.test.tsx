import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";

const server = vi.hoisted(() => ({ submit: vi.fn(), status: vi.fn(), issue: vi.fn() }));
const analytics = vi.hoisted(() => ({ track: vi.fn() }));
const receipts = vi.hoisted(() => ({ download: vi.fn() }));
vi.mock("@/lib/affiliate-private-receipt", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/affiliate-private-receipt")>()),
  downloadAffiliatePrivateReceipt: receipts.download,
}));
vi.mock("@/lib/analytics", () => ({ track: analytics.track }));
vi.mock("@/lib/affiliate-functions", () => ({
  submitSimpleAffiliateApplication: server.submit,
  issuePrivateAffiliateReceipt: server.issue,
  getAffiliateStatusByCode: server.status,
}));
vi.mock("@/components/affiliate-shell", () => ({
  AffiliateShell: ({ children }: { children: React.ReactNode }) => <main>{children}</main>,
}));
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (config: { component: React.ComponentType }) => config,
}));
import { AffiliateSimpleForm } from "@/components/affiliate-simple-form";
import { AffiliateTrackingCodePage } from "@/routes/consultar-candidatura";

/** Only a saved application with an accepted receipt may count as Meta Lead.
 * C68 anonymous view/start events do not change this confirmation contract.
 */
const confirmedSignUpCalls = () =>
  analytics.track.mock.calls.filter(([name]) => name === "sign_up");

beforeEach(() => {
  vi.resetAllMocks();
  server.issue.mockImplementation(() => ({
    ok: true,
    trackingCode: btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(24))))
      .replace(/\+/g, "-")
      .replace(/\//g, "_"),
    trackingProof: "B".repeat(43),
  }));
  server.submit.mockImplementation(async (args: { data: { trackingCode?: string } }) => ({
    ok: true,
    trackingCode: args.data.trackingCode,
  }));
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  window.sessionStorage.removeItem("vonix-affiliate-unconfirmed-code");
  window.sessionStorage.removeItem("vonix-affiliate-once-code");
});

function fill() {
  fireEvent.change(screen.getByLabelText(/Nome completo/), { target: { value: "Maria da Silva" } });
  fireEvent.change(screen.getByLabelText(/^E-mail/), {
    target: { value: "maria.c57@example.com" },
  });
  fireEvent.change(screen.getByLabelText(/Telefone com DDD/), {
    target: { value: "(31) 99999-9999" },
  });
  fireEvent.change(screen.getByLabelText(/CEP/), { target: { value: "30110012" } });
  fireEvent.change(screen.getByLabelText(/Rua \/ Avenida/), { target: { value: "Rua da Bahia" } });
  fireEvent.change(screen.getByLabelText(/Número/), { target: { value: "150" } });
  fireEvent.change(screen.getByLabelText(/Bairro/), { target: { value: "Centro" } });
  fireEvent.change(screen.getByLabelText(/Cidade/), { target: { value: "Belo Horizonte" } });
  fireEvent.change(screen.getByLabelText(/Estado/), { target: { value: "MG" } });
  fireEvent.change(screen.getByLabelText(/^Instagram/), { target: { value: "@maria.exemplo" } });
  fireEvent.change(screen.getByLabelText(/Seguidores no Instagram/), {
    target: { value: "12345" },
  });
  fireEvent.change(screen.getByLabelText(/^TikTok/), { target: { value: "@maria.exemplo" } });
  fireEvent.change(screen.getByLabelText(/Seguidores no TikTok/), { target: { value: "4300" } });
  fireEvent.click(screen.getByRole("checkbox", { name: /Autorizo o uso destes dados/ }));
}

describe("Vonix short single-page application form", () => {
  it("does not send candidate data or claim an uncertain submission when ticket issuance fails", async () => {
    server.issue.mockRejectedValueOnce(new Error("synthetic issuance failure"));
    render(<AffiliateSimpleForm />);
    fill();
    fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Nenhuma inscrição foi enviada");
    expect(server.issue).toHaveBeenCalledWith({ data: { scope: "public" } });
    expect(server.submit).not.toHaveBeenCalled();
    expect(sessionStorage.getItem("vonix-affiliate-unconfirmed-code")).toBeNull();
    expect(screen.getByLabelText(/Nome completo/)).toHaveValue("Maria da Silva");
    expect(confirmedSignUpCalls()).toHaveLength(0);
  });
  it("focuses the masked uncertain outcome, then the confirmed receipt on an exact retry", async () => {
    server.submit.mockRejectedValueOnce(new Error("Synthetic response lost"));
    render(<AffiliateSimpleForm />);
    fill();
    const action = screen.getByRole("button", { name: "Enviar minha inscrição" });
    action.focus();
    fireEvent.click(action);
    const field = await screen.findByLabelText("Código privado da tentativa não confirmada");
    expect(field).toHaveAttribute("type", "password");
    expect(
      screen.getByRole("region", { name: "Tentativa de inscrição não confirmada" }),
    ).toHaveFocus();
    const link = screen.getByRole("link", { name: "Consultar código no portal" });
    fireEvent.click(link, { ctrlKey: true });
    expect(sessionStorage.getItem("vonix-affiliate-once-code")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
    await screen.findByLabelText("Código privado de acompanhamento");
    expect(screen.getByRole("heading", { name: "Inscrição recebida!" })).toHaveFocus();
    expect(server.submit).toHaveBeenCalledTimes(2);
  });

  it("does not steal focus from another section when a delayed receipt arrives", async () => {
    let resolve!: (value: { ok: true; trackingCode: string }) => void;
    server.submit.mockReturnValueOnce(
      new Promise((r) => {
        resolve = r;
      }),
    );
    render(
      <>
        <button type="button">Outra seção</button>
        <AffiliateSimpleForm />
      </>,
    );
    fill();
    fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
    await waitFor(() => expect(server.submit).toHaveBeenCalledOnce());
    const other = screen.getByRole("button", { name: "Outra seção" });
    other.focus();
    await act(async () =>
      resolve({ ok: true, trackingCode: server.submit.mock.calls[0]![0].data.trackingCode }),
    );
    expect(screen.getByRole("heading", { name: "Inscrição recebida!" })).toBeInTheDocument();
    expect(other).toHaveFocus();
  });
  it("confirma declaração explícita de maioridade sem coletar data de nascimento", () => {
    render(<AffiliateSimpleForm />);
    const confirmation = screen.getByRole("checkbox", { name: /Autorizo o uso destes dados/ });
    expect(confirmation).toBeRequired();
    expect(confirmation.closest("label")).toHaveTextContent("Declaro ter 18 anos ou mais");
    expect(document.querySelector('input[name="birthDate"]')).toBeNull();
  });

  it("shows ONLY requested questions plus legal data protection consent", () => {
    render(<AffiliateSimpleForm />);
    expect(screen.getByText("Endereço completo")).toBeInTheDocument();
    expect(screen.getByLabelText(/Telefone com DDD/)).toHaveAttribute("type", "tel");
    expect(screen.getByLabelText(/Telefone com DDD/)).toBeRequired();
    expect(screen.getByLabelText(/^E-mail/)).toHaveAttribute("type", "email");
    expect(screen.getByLabelText(/^E-mail/)).toBeRequired();
    expect(screen.getByLabelText(/CEP/)).toBeRequired();
    expect(screen.getByLabelText(/Número/)).toBeRequired();
    expect(screen.getByLabelText(/^Instagram/)).toBeRequired();
    expect(screen.getByLabelText(/Seguidores no Instagram/)).toBeRequired();
    expect(screen.getByLabelText(/^TikTok/)).not.toBeRequired();
    expect(screen.getByLabelText(/Seguidores no TikTok/)).not.toBeRequired();
    for (const removed of [
      "CPF",
      "CNPJ",
      "Nascimento",
      "Qual é seu nicho",
      "Motivação",

      "Tipo de cabelo",
      "Cupom",
      "Dependentes",
    ]) {
      expect(screen.queryByLabelText(new RegExp(removed, "i"))).not.toBeInTheDocument();
    }
  });

  it("C43 asks for a TikTok profile when follower numbers are supplied, without requiring TikTok otherwise", async () => {
    render(<AffiliateSimpleForm />);
    fill();
    fireEvent.change(screen.getByLabelText(/^TikTok/), { target: { value: "" } });
    fireEvent.change(screen.getByLabelText(/Seguidores no TikTok/), {
      target: { value: "4300" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/TikTok/);
    expect(server.submit).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText(/Seguidores no TikTok/), {
      target: { value: "" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
    await waitFor(() => expect(server.submit).toHaveBeenCalledOnce());
  });

  it("C158 releases a hung request at 45 seconds, preserves its receipt and ignores a late success", async () => {
    let finish!: (result: { ok: true; trackingCode: string }) => void;
    server.submit.mockReturnValueOnce(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    render(<AffiliateSimpleForm />);
    fill();
    vi.useFakeTimers();
    try {
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
      });
      expect(server.submit).toHaveBeenCalledTimes(1);
      const code = server.submit.mock.calls[0]![0].data.trackingCode;
      expect(screen.getByTestId("affiliate-c158-wait-guidance")).toHaveTextContent("45 segundos");
      await act(async () => {
        await vi.advanceTimersByTimeAsync(44999);
      });
      expect(screen.getByRole("button", { name: "Enviando candidatura..." })).toBeDisabled();
      await act(async () => {
        await vi.advanceTimersByTimeAsync(1);
      });
      expect(screen.getByLabelText("Código privado da tentativa não confirmada")).toHaveValue(code);
      expect(screen.getByRole("button", { name: "Enviar minha inscrição" })).toBeEnabled();
      expect(window.sessionStorage.getItem("vonix-affiliate-unconfirmed-code")).toBe(code);
      expect(confirmedSignUpCalls()).toHaveLength(0);
      await act(async () => {
        finish({ ok: true, trackingCode: code });
      });
      expect(screen.queryByText("Inscrição recebida!")).not.toBeInTheDocument();
      expect(confirmedSignUpCalls()).toHaveLength(0);
      await act(async () => {
        fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
      });
      expect(server.submit).toHaveBeenCalledTimes(2);
      expect(server.submit.mock.calls[1]![0].data.trackingCode).toBe(code);
      expect(screen.getByLabelText("Código privado de acompanhamento")).toHaveValue(code);
      expect(confirmedSignUpCalls()).toHaveLength(1);
      expect(
        analytics.track.mock.calls.filter(([event]) => event === "affiliate_application_confirmed"),
      ).toEqual([["affiliate_application_confirmed"]]);
    } finally {
      vi.useRealTimers();
    }
  });

  it("C158 previews neither read nor erase an earlier private receipt; live intake recovers it", async () => {
    const previous = "A".repeat(32);
    window.sessionStorage.setItem("vonix-affiliate-unconfirmed-code", previous);
    const storageRead = vi.spyOn(Storage.prototype, "getItem");
    const { unmount } = render(<AffiliateSimpleForm preview />);
    expect(
      storageRead.mock.calls.filter(([key]) => key === "vonix-affiliate-unconfirmed-code"),
    ).toHaveLength(0);
    expect(
      screen.queryByLabelText("Código privado da tentativa não confirmada"),
    ).not.toBeInTheDocument();
    fill();
    fireEvent.click(screen.getByRole("button", { name: "Simular envio" }));
    expect(screen.getByRole("alert")).toHaveTextContent("Nenhuma candidatura foi enviada");
    expect(server.submit).not.toHaveBeenCalled();
    expect(window.sessionStorage.getItem("vonix-affiliate-unconfirmed-code")).toBe(previous);
    unmount();
    render(<AffiliateSimpleForm />);
    expect(await screen.findByLabelText("Código privado da tentativa não confirmada")).toHaveValue(
      previous,
    );
    expect(
      screen.getByRole("button", { name: "Resolva a tentativa anterior para continuar" }),
    ).toBeDisabled();
    expect(confirmedSignUpCalls()).toHaveLength(0);
  });

  it("locks applicant fields while the private receipt is being committed and unlocks on failure", async () => {
    let finish!: (result: { ok: false; reason: string }) => void;
    server.submit.mockReturnValueOnce(
      new Promise((resolve) => {
        finish = resolve;
      }),
    );
    render(<AffiliateSimpleForm />);
    fill();
    fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
    await waitFor(() => expect(server.submit).toHaveBeenCalledOnce());
    expect(screen.getByRole("button", { name: "Enviando candidatura..." })).toBeDisabled();
    expect(screen.getByLabelText(/Nome completo/)).toBeDisabled();
    expect(screen.getByLabelText(/Telefone com DDD/)).toBeDisabled();
    expect(screen.getByLabelText(/^Instagram/)).toBeDisabled();
    expect(screen.getByRole("checkbox", { name: /Autorizo o uso destes dados/ })).toBeDisabled();
    await act(async () => finish({ ok: false, reason: "Falha simulada de envio" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Falha simulada de envio");
    expect(screen.getByLabelText(/Nome completo/)).toBeEnabled();
    expect(screen.getByLabelText(/^Instagram/)).toBeEnabled();
    expect(screen.getByRole("checkbox", { name: /Autorizo o uso destes dados/ })).toBeEnabled();
  });

  it("submits a minimal payload with required followers and complete address", async () => {
    render(<AffiliateSimpleForm />);
    fill();
    fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
    await waitFor(() => expect(server.submit).toHaveBeenCalledOnce());
    expect(server.submit).toHaveBeenCalledWith({
      data: expect.objectContaining({
        fullName: "Maria da Silva",
        number: "150",
        postalCode: "30110-012",
        instagram: "maria.exemplo",
        instagramFollowers: 12345,
        tiktok: "maria.exemplo",
        tiktokFollowers: 4300,
        privacyAccepted: true,
      }),
    });
    expect(await screen.findByRole("status")).toHaveTextContent("Inscrição recebida!");
    expect(
      analytics.track.mock.calls.filter(([name]) => name === "affiliate_application_confirmed"),
    ).toEqual([["affiliate_application_confirmed"]]);
    expect(confirmedSignUpCalls()).toEqual([
      [
        "sign_up",
        {
          method: "affiliate_application",
        },
      ],
    ]);
  });

  it("keeps a confirmed private tracking code masked until explicitly revealed", async () => {
    server.submit.mockImplementation(async (args: { data: { trackingCode?: string } }) => ({
      ok: true,
      trackingCode: args.data.trackingCode,
    }));
    render(<AffiliateSimpleForm />);
    fill();
    fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
    const field = await screen.findByLabelText("Código privado de acompanhamento");
    expect(field).toHaveAttribute("type", "password");
    fireEvent.click(screen.getByRole("button", { name: "Mostrar código privado" }));
    expect(field).toHaveAttribute("type", "text");
    fireEvent.click(screen.getByRole("button", { name: "Ocultar código privado" }));
    expect(field).toHaveAttribute("type", "password");
    expect(screen.getByRole("button", { name: "Copiar código" })).toBeInTheDocument();
  });

  it("re-masks an exposed confirmation receipt on backgrounding the browser tab", async () => {
    server.submit.mockImplementation(async (args: { data: { trackingCode?: string } }) => ({
      ok: true,
      trackingCode: args.data.trackingCode,
    }));
    render(<AffiliateSimpleForm />);
    fill();
    fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
    const field = await screen.findByLabelText("Código privado de acompanhamento");
    fireEvent.click(screen.getByRole("button", { name: "Mostrar código privado" }));
    expect(field).toHaveAttribute("type", "text");
    const spy = vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    try {
      act(() => document.dispatchEvent(new Event("visibilitychange")));
      expect(field).toHaveAttribute("type", "password");
      expect(screen.getByRole("button", { name: "Copiar código" })).toBeInTheDocument();
    } finally {
      spy.mockRestore();
    }
  });

  it("does not claim a confirmed private receipt was copied after backgrounding the browser", async () => {
    let release!: () => void;
    const delayed = new Promise<void>((resolve) => {
      release = resolve;
    });
    const writeText = vi.fn().mockReturnValueOnce(delayed);
    const original = Object.getOwnPropertyDescriptor(navigator, "clipboard");
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    const spy = vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
    try {
      render(<AffiliateSimpleForm />);
      fill();
      fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
      const input = await screen.findByLabelText("Código privado de acompanhamento");
      fireEvent.click(screen.getByRole("button", { name: "Copiar código" }));
      await waitFor(() =>
        expect(writeText).toHaveBeenCalledWith((input as HTMLInputElement).value),
      );
      spy.mockReturnValue("hidden");
      act(() => document.dispatchEvent(new Event("visibilitychange")));
      await act(async () => {
        release();
        await delayed;
      });
      expect(screen.getByRole("button", { name: "Copiar código" })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Código copiado!" })).not.toBeInTheDocument();
    } finally {
      spy.mockRestore();
      if (original) Object.defineProperty(navigator, "clipboard", original);
      else Reflect.deleteProperty(navigator, "clipboard");
    }
  });

  it("does not claim an unconfirmed attempt code was copied after a hidden-tab return", async () => {
    server.submit.mockRejectedValueOnce(new TypeError("synthetic lost response"));
    let release!: () => void;
    const delayed = new Promise<void>((resolve) => {
      release = resolve;
    });
    const writeText = vi.fn().mockReturnValueOnce(delayed);
    const original = Object.getOwnPropertyDescriptor(navigator, "clipboard");
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    const spy = vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
    try {
      render(<AffiliateSimpleForm />);
      fill();
      fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
      const input = await screen.findByLabelText("Código privado da tentativa não confirmada");
      fireEvent.click(screen.getByRole("button", { name: "Copiar código de tentativa" }));
      await waitFor(() =>
        expect(writeText).toHaveBeenCalledWith((input as HTMLInputElement).value),
      );
      spy.mockReturnValue("hidden");
      act(() => document.dispatchEvent(new Event("visibilitychange")));
      spy.mockReturnValue("visible");
      act(() => document.dispatchEvent(new Event("visibilitychange")));
      await act(async () => {
        release();
        await delayed;
      });
      expect(
        screen.getByRole("button", { name: "Copiar código de tentativa" }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: "Código de tentativa copiado!" }),
      ).not.toBeInTheDocument();
    } finally {
      spy.mockRestore();
      if (original) Object.defineProperty(navigator, "clipboard", original);
      else Reflect.deleteProperty(navigator, "clipboard");
    }
  });

  it("prevents two concurrent clipboard writes from a double click on a confirmed receipt", async () => {
    let release!: () => void;
    const delayed = new Promise<void>((resolve) => {
      release = resolve;
    });
    const writeText = vi.fn().mockReturnValueOnce(delayed).mockResolvedValue(undefined);
    const original = Object.getOwnPropertyDescriptor(navigator, "clipboard");
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    try {
      render(<AffiliateSimpleForm />);
      fill();
      fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
      await screen.findByLabelText("Código privado de acompanhamento");
      const button = screen.getByRole("button", { name: "Copiar código" });
      fireEvent.click(button);
      fireEvent.click(button);
      await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1));
      await act(async () => {
        release();
        await delayed;
      });
      expect(screen.getByRole("button", { name: "Código copiado!" })).toBeInTheDocument();
    } finally {
      if (original) Object.defineProperty(navigator, "clipboard", original);
      else Reflect.deleteProperty(navigator, "clipboard");
    }
  });

  it("does not focus a private receipt field after a clipboard error in a hidden tab", async () => {
    let reject!: (e: Error) => void;
    const delayed = new Promise<void>((_resolve, fail) => {
      reject = fail;
    });
    const writeText = vi.fn().mockReturnValueOnce(delayed);
    const original = Object.getOwnPropertyDescriptor(navigator, "clipboard");
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    const spy = vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
    try {
      render(<AffiliateSimpleForm />);
      fill();
      fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
      const field = await screen.findByLabelText("Código privado de acompanhamento");
      fireEvent.click(screen.getByRole("button", { name: "Copiar código" }));
      await waitFor(() => expect(writeText).toHaveBeenCalledOnce());
      spy.mockReturnValue("hidden");
      act(() => document.dispatchEvent(new Event("visibilitychange")));
      await act(async () => {
        reject(new Error("synthetic clipboard denied"));
        await delayed.catch(() => {});
      });
      expect(document.activeElement).not.toBe(field);
      expect(screen.queryByRole("button", { name: "Código copiado!" })).not.toBeInTheDocument();
    } finally {
      spy.mockRestore();
      if (original) Object.defineProperty(navigator, "clipboard", original);
      else Reflect.deleteProperty(navigator, "clipboard");
    }
  });

  it("does not restore a copied notification after an uncertain receipt is discarded mid-copy", async () => {
    server.submit.mockRejectedValueOnce(new TypeError("synthetic lost network response"));
    let release!: () => void;
    const delayed = new Promise<void>((resolve) => {
      release = resolve;
    });
    const writeText = vi.fn().mockReturnValueOnce(delayed);
    const original = Object.getOwnPropertyDescriptor(navigator, "clipboard");
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    try {
      render(<AffiliateSimpleForm />);
      fill();
      fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
      await screen.findByLabelText("Código privado da tentativa não confirmada");
      fireEvent.click(screen.getByRole("button", { name: "Copiar código de tentativa" }));
      await waitFor(() => expect(writeText).toHaveBeenCalledOnce());
      fireEvent.click(
        screen.getByRole("button", {
          name: "Descartar código e iniciar nova tentativa",
        }),
      );
      fireEvent.click(screen.getByRole("button", { name: "Confirmar descarte do código" }));
      await act(async () => {
        release();
        await delayed;
      });
      expect(
        screen.queryByRole("button", { name: "Código de tentativa copiado!" }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByLabelText("Código privado da tentativa não confirmada"),
      ).not.toBeInTheDocument();
    } finally {
      if (original) Object.defineProperty(navigator, "clipboard", original);
      else Reflect.deleteProperty(navigator, "clipboard");
    }
  });

  it("ignores copying a private receipt when the form is already in a hidden tab", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const original = Object.getOwnPropertyDescriptor(navigator, "clipboard");
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    const spy = vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
    try {
      render(<AffiliateSimpleForm />);
      fill();
      fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
      await screen.findByLabelText("Código privado de acompanhamento");
      spy.mockReturnValue("hidden");
      act(() => document.dispatchEvent(new Event("visibilitychange")));
      fireEvent.click(screen.getByRole("button", { name: "Copiar código" }));
      expect(writeText).not.toHaveBeenCalled();
      expect(screen.queryByRole("button", { name: "Código copiado!" })).not.toBeInTheDocument();
    } finally {
      spy.mockRestore();
      if (original) Object.defineProperty(navigator, "clipboard", original);
      else Reflect.deleteProperty(navigator, "clipboard");
    }
  });

  it("masks an unconfirmed receipt when a network response is lost", async () => {
    server.submit.mockRejectedValue(new Error("synthetic network lost"));
    render(<AffiliateSimpleForm />);
    fill();
    fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
    const field = await screen.findByLabelText("Código privado da tentativa não confirmada");
    expect(field).toHaveAttribute("type", "password");
    fireEvent.click(screen.getByRole("button", { name: "Mostrar código da tentativa" }));
    expect(field).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Copiar código de tentativa" })).toBeInTheDocument();
  });

  it("displays a private tracking code only after successful server receipt", async () => {
    server.submit.mockImplementation(async (args: { data: { trackingCode?: string } }) => ({
      ok: true,
      trackingCode: args.data.trackingCode,
    }));
    render(<AffiliateSimpleForm />);
    expect(screen.queryByLabelText("Código privado de acompanhamento")).not.toBeInTheDocument();
    fill();
    fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
    const receipt = await screen.findByLabelText("Código privado de acompanhamento");
    expect((receipt as HTMLInputElement).value).toMatch(/^[A-Za-z0-9_-]{32}$/);
    expect(server.submit.mock.calls[0]![0].data.trackingCode).toBe(
      (receipt as HTMLInputElement).value,
    );
    expect(screen.getByRole("button", { name: "Copiar código" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Acompanhar inscrição agora" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "vonixhair.com/consultar-candidatura" }),
    ).toHaveAttribute("href", "/consultar-candidatura");
  });

  it("submits successfully with both TikTok fields left empty", async () => {
    render(<AffiliateSimpleForm />);
    fill();
    fireEvent.change(screen.getByLabelText(/^TikTok/), { target: { value: "" } });
    fireEvent.change(screen.getByLabelText(/Seguidores no TikTok/), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
    await waitFor(() => expect(server.submit).toHaveBeenCalledOnce());
    expect(server.submit).toHaveBeenCalledWith({
      data: expect.objectContaining({
        instagram: "maria.exemplo",
        instagramFollowers: 12345,
        tiktok: "",
        tiktokFollowers: null,
      }),
    });
    expect(await screen.findByRole("status")).toHaveTextContent("Inscrição recebida!");
    expect(
      analytics.track.mock.calls.filter(([name]) => name === "affiliate_application_confirmed"),
    ).toEqual([["affiliate_application_confirmed"]]);
    expect(confirmedSignUpCalls()).toEqual([
      [
        "sign_up",
        {
          method: "affiliate_application",
        },
      ],
    ]);
  });

  it("never confirms a honeypot/non-persisted acknowledgement as a Meta Lead", async () => {
    server.submit.mockResolvedValue({ ok: true });
    render(<AffiliateSimpleForm />);
    fill();
    fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Não foi possível confirmar o recebimento",
    );
    expect(screen.queryByText("Inscrição recebida!")).not.toBeInTheDocument();
    expect(confirmedSignUpCalls()).toHaveLength(0);
    expect(
      analytics.track.mock.calls.filter(([name]) => name === "affiliate_application_confirmed"),
    ).toHaveLength(0);
  });

  it("rejects an invalid-length receipt without sending conversion events", async () => {
    server.submit.mockResolvedValue({ ok: true, trackingCode: "incomplete" });
    render(<AffiliateSimpleForm />);
    fill();
    fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Não foi possível confirmar");
    expect(confirmedSignUpCalls()).toHaveLength(0);
    expect(
      analytics.track.mock.calls.filter(([name]) => name === "affiliate_application_confirmed"),
    ).toHaveLength(0);
    expect(screen.queryByText("Inscrição recebida!")).not.toBeInTheDocument();
  });

  it("submits a valid s/n street number instead of falsely rejecting Brazilian addresses", async () => {
    render(<AffiliateSimpleForm />);
    fill();
    fireEvent.change(screen.getByLabelText(/Número/), { target: { value: "s/n" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
    await waitFor(() =>
      expect(server.submit).toHaveBeenCalledWith({
        data: expect.objectContaining({ number: "s/n" }),
      }),
    );
    expect(await screen.findByRole("status")).toHaveTextContent("Inscrição recebida");
  });

  it("keeps an unconfirmed private code when the network loses a committed response, then retries exactly once", async () => {
    let calls = 0;
    server.submit.mockImplementation(async (args: { data: { trackingCode?: string } }) => {
      calls++;
      if (calls === 1) throw new TypeError("response lost after database commit");
      return { ok: true, trackingCode: args.data.trackingCode };
    });
    render(<AffiliateSimpleForm />);
    fill();
    fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
    const privateInput = await screen.findByLabelText("Código privado da tentativa não confirmada");
    const pendingCode = (privateInput as HTMLInputElement).value;
    expect(pendingCode).toMatch(/^[A-Za-z0-9_-]{32}$/);
    expect(window.sessionStorage.getItem("vonix-affiliate-unconfirmed-code")).toBe(pendingCode);
    expect(screen.getByRole("alert")).toHaveTextContent("Não foi possível confirmar o envio");
    expect(confirmedSignUpCalls()).toHaveLength(0);
    expect(
      analytics.track.mock.calls.filter(([name]) => name === "affiliate_application_confirmed"),
    ).toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
    const confirmed = await screen.findByLabelText("Código privado de acompanhamento");
    expect(confirmed).toHaveValue(pendingCode);
    expect(server.submit).toHaveBeenCalledTimes(2);
    expect(server.submit.mock.calls[0]![0].data.trackingCode).toBe(pendingCode);
    expect(server.submit.mock.calls[1]![0].data.trackingCode).toBe(pendingCode);
    expect(window.sessionStorage.getItem("vonix-affiliate-unconfirmed-code")).toBe(pendingCode);
    expect(
      analytics.track.mock.calls.filter(([name]) => name === "affiliate_application_confirmed"),
    ).toEqual([["affiliate_application_confirmed"]]);
    expect(confirmedSignUpCalls()).toEqual([
      [
        "sign_up",
        {
          method: "affiliate_application",
        },
      ],
    ]);
  });

  it("recovers a pending code after browser reload without claiming any enrollment was accepted", async () => {
    server.submit.mockRejectedValue(new TypeError("network lost"));
    render(<AffiliateSimpleForm />);
    fill();
    fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
    const codeBefore = (
      (await screen.findByLabelText(
        "Código privado da tentativa não confirmada",
      )) as HTMLInputElement
    ).value;
    cleanup();
    render(<AffiliateSimpleForm />);
    const codeAfter = (
      (await screen.findByLabelText(
        "Código privado da tentativa não confirmada",
      )) as HTMLInputElement
    ).value;
    expect(codeAfter).toBe(codeBefore);
    expect(screen.getByText(/Este código não comprova que ela foi salva/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Consultar código no portal" })).toHaveAttribute(
      "href",
      "/consultar-candidatura",
    );
    // The status portal receives the private code via a one-time same-tab
    // handoff, never as a URL query, referrer, or analytics event.
    const link = screen.getByRole("link", { name: "Consultar código no portal" });
    link.addEventListener("click", (event) => event.preventDefault());
    fireEvent.click(link);
    expect(window.sessionStorage.getItem("vonix-affiliate-once-code")).toBe(codeBefore);
    expect(window.sessionStorage.getItem("vonix-affiliate-unconfirmed-code")).toBe(codeBefore);
    expect(link.getAttribute("href")).not.toContain(codeBefore);
    expect(screen.queryByText("Inscrição recebida!")).not.toBeInTheDocument();
    expect(confirmedSignUpCalls()).toHaveLength(0);
    expect(
      analytics.track.mock.calls.filter(([name]) => name === "affiliate_application_confirmed"),
    ).toHaveLength(0);
  });

  it("C177 completes a lost-response application journey across the actual form and status page without resubmitting", async () => {
    server.submit.mockRejectedValueOnce(new TypeError("synthetic response lost"));
    render(<AffiliateSimpleForm />);
    fill();
    fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
    const pending = (
      (await screen.findByLabelText(
        "Código privado da tentativa não confirmada",
      )) as HTMLInputElement
    ).value;
    expect(pending).toMatch(/^[A-Za-z0-9_-]{32}$/);
    const link = screen.getByRole("link", { name: "Consultar código no portal" });
    link.addEventListener("click", (event) => event.preventDefault());
    fireEvent.click(link);
    expect(window.sessionStorage.getItem("vonix-affiliate-once-code")).toBe(pending);
    cleanup();
    server.status.mockResolvedValueOnce({
      ok: true,
      status: "pendente",
      rejectionReason: null,
      submittedAt: "2026-11-26T12:00:00Z",
      reviewedAt: null,
    });
    render(<AffiliateTrackingCodePage />);
    await screen.findByText("Sua tentativa anterior foi localizada");
    expect(server.status).toHaveBeenCalledWith({ data: { code: pending } });
    expect(window.sessionStorage.getItem("vonix-affiliate-unconfirmed-code")).toBe(pending);
    receipts.download.mockReturnValue(true);
    fireEvent.click(screen.getByRole("button", { name: "Baixar comprovante do código privado" }));
    expect(receipts.download).toHaveBeenCalledWith(pending, true);
    expect(screen.getByText(/Download solicitado/)).toBeInTheDocument();
    fireEvent.click(
      screen.getByRole("checkbox", { name: "Já guardei meu código privado em local seguro." }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Encerrar recuperação neste navegador" }));
    expect(window.sessionStorage.getItem("vonix-affiliate-unconfirmed-code")).toBeNull();
    expect(window.sessionStorage.getItem("vonix-affiliate-once-code")).toBeNull();
    cleanup();
    render(<AffiliateSimpleForm />);
    expect(
      screen.queryByLabelText("Código privado da tentativa não confirmada"),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enviar minha inscrição" })).toBeEnabled();
    expect(server.submit).toHaveBeenCalledTimes(1);
    expect(confirmedSignUpCalls()).toHaveLength(0);
  });

  it("does not report a Meta Lead if the server returns another private code", async () => {
    server.submit.mockResolvedValue({ ok: true, trackingCode: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdef" });
    render(<AffiliateSimpleForm />);
    fill();
    fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
    expect(
      await screen.findByLabelText("Código privado da tentativa não confirmada"),
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent("Não foi possível confirmar o recebimento");
    expect(screen.queryByText("Inscrição recebida!")).not.toBeInTheDocument();
    expect(confirmedSignUpCalls()).toHaveLength(0);
    expect(
      analytics.track.mock.calls.filter(([name]) => name === "affiliate_application_confirmed"),
    ).toHaveLength(0);
    fireEvent.click(
      screen.getByRole("button", { name: "Descartar código e iniciar nova tentativa" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Confirmar descarte do código" }));
    expect(
      screen.queryByLabelText("Código privado da tentativa não confirmada"),
    ).not.toBeInTheDocument();
    expect(window.sessionStorage.getItem("vonix-affiliate-unconfirmed-code")).toBeNull();
  });

  it("keeps an interactive preview from calling the server", async () => {
    render(<AffiliateSimpleForm preview />);
    fill();
    fireEvent.click(screen.getByRole("button", { name: "Simular envio" }));
    await waitFor(() => expect(screen.getByRole("alert")).toHaveTextContent("apenas uma prévia"));
    expect(server.submit).not.toHaveBeenCalled();
    expect(confirmedSignUpCalls()).toHaveLength(0);
    expect(
      analytics.track.mock.calls.filter(([name]) => name === "affiliate_application_confirmed"),
    ).toHaveLength(0);
  });

  it("never reports a lead when the server rejects a candidature", async () => {
    server.submit.mockResolvedValue({ ok: false, reason: "Inscrições indisponíveis." });
    render(<AffiliateSimpleForm />);
    fill();
    fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Inscrições indisponíveis.");
    expect(confirmedSignUpCalls()).toHaveLength(0);
    expect(
      analytics.track.mock.calls.filter(([name]) => name === "affiliate_application_confirmed"),
    ).toHaveLength(0);
  });

  it("rejects a missing address number before any request", () => {
    render(<AffiliateSimpleForm />);
    fill();
    fireEvent.change(screen.getByLabelText(/Número/), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
    expect(server.submit).not.toHaveBeenCalled();
    expect(confirmedSignUpCalls()).toHaveLength(0);
    expect(
      analytics.track.mock.calls.filter(([name]) => name === "affiliate_application_confirmed"),
    ).toHaveLength(0);
  });

  it("accepts shared official Instagram and TikTok profile links with tracking query parameters", async () => {
    render(<AffiliateSimpleForm />);
    fill();
    fireEvent.change(screen.getByLabelText(/^Instagram/), {
      target: { value: "https://www.instagram.com/maria.exemplo/?igsh=YWIxMTEx" },
    });
    fireEvent.change(screen.getByLabelText(/^TikTok/), {
      target: { value: "https://www.tiktok.com/@maria.exemplo?_t=8xYz&_r=1" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
    await waitFor(() =>
      expect(server.submit).toHaveBeenCalledWith({
        data: expect.objectContaining({
          instagram: "maria.exemplo",
          tiktok: "maria.exemplo",
        }),
      }),
    );
    expect(await screen.findByRole("status")).toHaveTextContent("Inscrição recebida!");
  });

  it("rejects spoofed social domains and non-profile paths despite tracking query strings", async () => {
    render(<AffiliateSimpleForm />);
    fill();
    fireEvent.change(screen.getByLabelText(/^Instagram/), {
      target: { value: "https://instagram.com.evil.io/maria?igsh=x" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
    expect(server.submit).not.toHaveBeenCalled();
    expect(await screen.findByRole("alert")).toHaveTextContent("Informe um usuário válido");
  });

  it("explains an unknown CEP and keeps the manual address form usable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ erro: true })),
    );
    render(<AffiliateSimpleForm />);
    fireEvent.change(screen.getByLabelText(/CEP/), { target: { value: "30110012" } });
    fireEvent.click(screen.getByRole("button", { name: "Buscar CEP" }));
    expect(await screen.findByRole("status")).toHaveTextContent(
      "CEP não encontrado. Preencha o endereço manualmente.",
    );
    expect(screen.getByLabelText(/Rua \/ Avenida/)).toBeEnabled();
    fireEvent.change(screen.getByLabelText(/CEP/), { target: { value: "30120020" } });
    expect(screen.queryByText(/CEP não encontrado/)).not.toBeInTheDocument();
  });

  it("C40 does not silently overwrite a draft from a delayed CEP lookup after the tab is hidden", async () => {
    let resolveFirst!: (value: Response) => void;
    const pending = new Promise<Response>((resolve) => {
      resolveFirst = resolve;
    });
    const provider = vi
      .fn()
      .mockReturnValueOnce(pending)
      .mockResolvedValueOnce(
        Response.json({
          logradouro: "Rua do CEP Atual",
          bairro: "Bairro Novo",
          localidade: "Contagem",
          uf: "MG",
        }),
      );
    vi.stubGlobal("fetch", provider);
    const visibility = vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
    try {
      render(<AffiliateSimpleForm />);
      fireEvent.change(screen.getByLabelText(/CEP/), { target: { value: "30110012" } });
      fireEvent.click(screen.getByRole("button", { name: "Buscar CEP" }));
      await waitFor(() => expect(provider).toHaveBeenCalledTimes(1));
      visibility.mockReturnValue("hidden");
      act(() => document.dispatchEvent(new Event("visibilitychange")));
      await act(async () => {
        resolveFirst(
          Response.json({
            logradouro: "Rua de uma Consulta Oculta",
            bairro: "Bairro Antigo",
            localidade: "Belo Horizonte",
            uf: "MG",
          }),
        );
        await pending;
      });
      expect(screen.getByLabelText(/Rua \/ Avenida/)).toHaveValue("");
      expect(screen.getByLabelText(/Cidade/)).toHaveValue("");
      visibility.mockReturnValue("visible");
      act(() => document.dispatchEvent(new Event("visibilitychange")));
      expect(screen.getByRole("button", { name: "Buscar CEP" })).toBeEnabled();
      fireEvent.click(screen.getByRole("button", { name: "Buscar CEP" }));
      await waitFor(() => expect(provider).toHaveBeenCalledTimes(2));
      expect(await screen.findByDisplayValue("Rua do CEP Atual")).toBeInTheDocument();
    } finally {
      visibility.mockRestore();
    }
  });

  it("clears only validated address errors after a successful CEP lookup", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          logradouro: "Rua Primeira",
          bairro: "C",
          localidade: "Belo Horizonte",
          uf: "MG",
        }),
      ),
    );
    render(<AffiliateSimpleForm />);
    fireEvent.change(screen.getByLabelText(/CEP/), { target: { value: "30110012" } });
    fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
    expect(screen.getByLabelText(/Rua \/ Avenida/)).toHaveAttribute("aria-invalid", "true");
    fireEvent.click(screen.getByRole("button", { name: "Buscar CEP" }));
    await waitFor(() =>
      expect(screen.getByLabelText(/Rua \/ Avenida/)).toHaveAttribute("aria-invalid", "false"),
    );
    expect(screen.getByLabelText(/Cidade/)).toHaveAttribute("aria-invalid", "false");
    expect(screen.getByLabelText(/Estado/)).toHaveAttribute("aria-invalid", "false");
    expect(screen.getByLabelText(/Bairro/)).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByLabelText(/Número/)).toHaveAttribute("aria-invalid", "true");
    expect(server.submit).not.toHaveBeenCalled();
  });

  it("provides a manual fallback when the CEP provider is unavailable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new Error("synthetic offline lookup");
      }),
    );
    render(<AffiliateSimpleForm />);
    fireEvent.change(screen.getByLabelText(/CEP/), { target: { value: "30110012" } });
    fireEvent.click(screen.getByRole("button", { name: "Buscar CEP" }));
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Não foi possível consultar o CEP. Você pode preencher o endereço manualmente.",
    );
    expect(screen.getByRole("button", { name: "Buscar CEP" })).toBeEnabled();
  });

  it("clears only CEP-autofilled address fields on postal code change, preserving manual edits", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          logradouro: "Rua Primeira",
          bairro: "Centro Antigo",
          localidade: "Belo Horizonte",
          uf: "MG",
        }),
      ),
    );
    render(<AffiliateSimpleForm />);
    fireEvent.change(screen.getByLabelText(/CEP/), { target: { value: "30110012" } });
    fireEvent.click(screen.getByRole("button", { name: "Buscar CEP" }));
    expect(await screen.findByDisplayValue("Rua Primeira")).toBeInTheDocument();
    expect(screen.getByLabelText(/Bairro/)).toHaveValue("Centro Antigo");
    fireEvent.change(screen.getByLabelText(/Rua \/ Avenida/), {
      target: { value: "Rua digitada por mim" },
    });
    fireEvent.change(screen.getByLabelText(/CEP/), { target: { value: "30120020" } });
    expect(screen.getByLabelText(/Rua \/ Avenida/)).toHaveValue("Rua digitada por mim");
    expect(screen.getByLabelText(/Bairro/)).toHaveValue("");
    expect(screen.getByLabelText(/Cidade/)).toHaveValue("");
    expect(screen.getByLabelText(/Estado/)).toHaveValue("");
    fireEvent.click(screen.getByRole("button", { name: "Buscar CEP" }));
    await waitFor(() => expect(screen.getByLabelText(/Bairro/)).toHaveValue("Centro Antigo"));
    expect(screen.getByLabelText(/Rua \/ Avenida/)).toHaveValue("Rua digitada por mim");
  });

  it("unlocks lookup after CEP changes mid-flight; stale reply must not overwrite current address", async () => {
    let releaseOld!: (reply: Response) => void;
    const first = new Promise<Response>((resolve) => {
      releaseOld = resolve;
    });
    const provider = vi.fn((url: string) => {
      if (url.includes("/30110012/")) return first;
      return Promise.resolve(
        Response.json({
          logradouro: "Rua do Segundo CEP",
          bairro: "Bairro Atual",
          localidade: "Contagem",
          uf: "MG",
        }),
      );
    });
    vi.stubGlobal("fetch", provider);
    render(<AffiliateSimpleForm />);
    fireEvent.change(screen.getByLabelText(/CEP/), { target: { value: "30110012" } });
    fireEvent.click(screen.getByRole("button", { name: "Buscar CEP" }));
    await waitFor(() => expect(provider).toHaveBeenCalledTimes(1));
    expect(screen.getByRole("button", { name: "Buscando CEP..." })).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/CEP/), { target: { value: "32010000" } });
    expect(screen.getByRole("button", { name: "Buscar CEP" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "Buscar CEP" }));
    await waitFor(() => expect(provider).toHaveBeenCalledTimes(2));
    expect(await screen.findByDisplayValue("Rua do Segundo CEP")).toBeInTheDocument();

    releaseOld(
      Response.json({
        logradouro: "Rua Antiga",
        bairro: "Antigo",
        localidade: "Cidade Antiga",
        uf: "RJ",
      }),
    );
    await waitFor(() => expect(screen.getByRole("button", { name: "Buscar CEP" })).toBeEnabled());
    expect(screen.getByLabelText(/Rua \/ Avenida/)).toHaveValue("Rua do Segundo CEP");
    expect(screen.getByLabelText(/Cidade/)).toHaveValue("Contagem");
    expect(screen.getByLabelText(/Estado/)).toHaveValue("MG");
  });
});

it("keeps the confirmed receipt visible when sessionStorage blocks direct status handoff", async () => {
  const original = Storage.prototype.setItem;
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) {
    if (key === "vonix-affiliate-once-code")
      throw new DOMException("storage blocked", "SecurityError");
    return original.call(this, key, value);
  });
  render(<AffiliateSimpleForm />);
  fill();
  fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
  const receipt = await screen.findByLabelText("Código privado de acompanhamento");
  const code = (receipt as HTMLInputElement).value;
  fireEvent.click(screen.getByRole("button", { name: "Acompanhar inscrição agora" }));
  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Copie e guarde o código antes de abrir o acompanhamento",
  );
  expect(receipt).toHaveValue(code);
  expect(screen.getByRole("button", { name: "Copiar código" })).toBeInTheDocument();
  expect(window.location.pathname).not.toBe("/consultar-candidatura");
});

it("does not abandon an unconfirmed private receipt if browser storage refuses the status handoff", async () => {
  server.submit.mockRejectedValueOnce(new TypeError("connection interrupted"));
  const original = Storage.prototype.setItem;
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) {
    if (key === "vonix-affiliate-once-code") throw new DOMException("blocked", "SecurityError");
    return original.call(this, key, value);
  });
  render(<AffiliateSimpleForm />);
  fill();
  fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
  const field = await screen.findByLabelText("Código privado da tentativa não confirmada");
  const code = (field as HTMLInputElement).value;
  const link = screen.getByRole("link", { name: "Consultar código no portal" });
  const click = fireEvent.click(link);
  expect(click).toBe(false);
  expect(await screen.findByText(/Copie e guarde o código da tentativa/)).toBeInTheDocument();
  expect(field).toHaveValue(code);
  expect(window.sessionStorage.getItem("vonix-affiliate-unconfirmed-code")).toBe(code);
  expect(screen.queryByText("Inscrição recebida!")).not.toBeInTheDocument();
  expect(confirmedSignUpCalls()).toHaveLength(0);
});

it("stops navigation when storage silently drops an unconfirmed receipt", async () => {
  server.submit.mockRejectedValueOnce(new TypeError("upstream unavailable"));
  const original = Storage.prototype.setItem;
  vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key, value) {
    if (key === "vonix-affiliate-once-code") return;
    return original.call(this, key, value);
  });
  render(<AffiliateSimpleForm />);
  fill();
  fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
  const code = await screen.findByLabelText("Código privado da tentativa não confirmada");
  expect(fireEvent.click(screen.getByRole("link", { name: "Consultar código no portal" }))).toBe(
    false,
  );
  expect(await screen.findByText(/Copie e guarde o código da tentativa/)).toBeInTheDocument();
  expect(code).toHaveValue((code as HTMLInputElement).value);
  expect(confirmedSignUpCalls()).toHaveLength(0);
});

it("offers a download of a confirmed code without sending another application or Meta Lead", async () => {
  receipts.download.mockReturnValueOnce(true);
  render(<AffiliateSimpleForm />);
  fill();
  fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
  const code = (
    (await screen.findByLabelText("Código privado de acompanhamento")) as HTMLInputElement
  ).value;
  fireEvent.click(screen.getByRole("button", { name: "Baixar código de acompanhamento" }));
  expect(receipts.download).toHaveBeenCalledExactlyOnceWith(code, true);
  expect(screen.getByText(/Download solicitado/)).toBeInTheDocument();
  expect(server.submit).toHaveBeenCalledOnce();
  expect(confirmedSignUpCalls()).toHaveLength(1);
});

it("allows local backup for an unconfirmed attempt without falsely claiming enrollment", async () => {
  server.submit.mockRejectedValueOnce(new TypeError("response lost"));
  receipts.download.mockReturnValueOnce(true);
  render(<AffiliateSimpleForm />);
  fill();
  fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
  const code = (
    (await screen.findByLabelText("Código privado da tentativa não confirmada")) as HTMLInputElement
  ).value;
  fireEvent.click(screen.getByRole("button", { name: "Baixar código de tentativa" }));
  expect(receipts.download).toHaveBeenCalledExactlyOnceWith(code, false);
  expect(screen.getByText(/Download solicitado/)).toBeInTheDocument();
  expect(screen.queryByText("Inscrição recebida!")).not.toBeInTheDocument();
  expect(confirmedSignUpCalls()).toHaveLength(0);
  expect(server.submit).toHaveBeenCalledOnce();
});

it("keeps the tracking code visible if the browser blocks its backup download", async () => {
  receipts.download.mockReturnValueOnce(false);
  render(<AffiliateSimpleForm />);
  fill();
  fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
  const input = await screen.findByLabelText("Código privado de acompanhamento");
  const code = (input as HTMLInputElement).value;
  fireEvent.click(screen.getByRole("button", { name: "Baixar código de acompanhamento" }));
  expect(screen.getByText(/Este navegador não permitiu baixar o arquivo/)).toBeInTheDocument();
  expect(input).toHaveValue(code);
});

it("blocks reusing an older private code with edited candidate details after an uncertain response", async () => {
  server.submit.mockRejectedValueOnce(new TypeError("response lost"));
  render(<AffiliateSimpleForm />);
  fill();
  fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
  const first = await screen.findByLabelText("Código privado da tentativa não confirmada");
  const code = (first as HTMLInputElement).value;
  fireEvent.change(screen.getByLabelText(/Nome completo/), {
    target: { value: "Pessoa Diferente" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
  expect(server.submit).toHaveBeenCalledOnce();
  expect(first).toHaveValue(code);
  expect(screen.getByRole("alert")).toHaveTextContent("dados foram alterados");
  expect(confirmedSignUpCalls()).toHaveLength(0);
});

it("requires an explicit decision before a recovered code can be reused after a reload", async () => {
  const old = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdef";
  window.sessionStorage.setItem("vonix-affiliate-unconfirmed-code", old);
  render(<AffiliateSimpleForm />);
  expect(await screen.findByLabelText("Código privado da tentativa não confirmada")).toHaveValue(
    old,
  );
  fill();
  const send = screen.getByRole("button", { name: /Resolva a tentativa anterior/ });
  expect(send).toBeDisabled();
  expect(server.submit).not.toHaveBeenCalled();
  expect(screen.getByText(/recuperada de outra visita/)).toBeInTheDocument();
  fireEvent.click(
    screen.getByRole("button", { name: "Descartar código e iniciar nova tentativa" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Confirmar descarte do código" }));
  expect(screen.getByRole("button", { name: "Enviar minha inscrição" })).toBeEnabled();
  fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
  await waitFor(() => expect(server.submit).toHaveBeenCalledOnce());
  const newCode = server.submit.mock.calls[0]![0].data.trackingCode;
  expect(newCode).toMatch(/^[A-Za-z0-9_-]{32}$/);
  expect(newCode).not.toBe(old);
  expect(confirmedSignUpCalls()).toHaveLength(1);
});

it("keeps a retry receipt immutable while the server is still processing", async () => {
  let finish!: (value: unknown) => void;
  server.submit.mockRejectedValueOnce(new TypeError("synthetic outage")).mockImplementationOnce(
    () =>
      new Promise((r) => {
        finish = r;
      }),
  );
  render(<AffiliateSimpleForm />);
  fill();
  fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
  const field = await screen.findByLabelText("Código privado da tentativa não confirmada");
  const code = (field as HTMLInputElement).value;
  fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
  expect(
    screen.getByRole("button", { name: "Descartar código e iniciar nova tentativa" }),
  ).toBeDisabled();
  const link = screen.getByRole("link", { name: "Consultar código no portal" });
  expect(link).toHaveAttribute("aria-disabled", "true");
  fireEvent.click(link);
  expect(window.sessionStorage.getItem("vonix-affiliate-once-code")).toBeNull();
  expect(window.sessionStorage.getItem("vonix-affiliate-unconfirmed-code")).toBe(code);
  await act(async () => {
    finish({ ok: true, trackingCode: code });
  });
  expect(await screen.findByLabelText("Código privado de acompanhamento")).toHaveValue(code);
  expect(confirmedSignUpCalls()).toHaveLength(1);
});
it("does not erase a different local receipt when the current attempt confirms", async () => {
  let finish!: (value: unknown) => void;
  server.submit.mockImplementationOnce(
    () =>
      new Promise((r) => {
        finish = r;
      }),
  );
  render(<AffiliateSimpleForm />);
  fill();
  fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
  await waitFor(() => expect(server.submit).toHaveBeenCalledOnce());
  const code = server.submit.mock.calls[0]![0].data.trackingCode;
  const another = "abcdefghijklmnopqrstuvwxyzABCDEF";
  window.sessionStorage.setItem("vonix-affiliate-unconfirmed-code", another);
  await act(async () => {
    finish({ ok: true, trackingCode: code });
  });
  expect(await screen.findByLabelText("Código privado de acompanhamento")).toHaveValue(code);
  expect(window.sessionStorage.getItem("vonix-affiliate-unconfirmed-code")).toBe(another);
});

describe("candidate continuity safeguards", () => {
  it("retains a confirmed private code after reload without inventing a second confirmation or conversion", async () => {
    render(<AffiliateSimpleForm />);
    fill();
    fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
    const code = (
      (await screen.findByLabelText("Código privado de acompanhamento")) as HTMLInputElement
    ).value;
    expect(window.sessionStorage.getItem("vonix-affiliate-unconfirmed-code")).toBe(code);
    cleanup();
    render(<AffiliateSimpleForm />);
    expect(await screen.findByLabelText("Código privado da tentativa não confirmada")).toHaveValue(
      code,
    );
    expect(screen.queryByText("Inscrição recebida!")).not.toBeInTheDocument();
    expect(confirmedSignUpCalls()).toHaveLength(1);
    expect(server.submit).toHaveBeenCalledOnce();
  });

  it("clears a confirmed receipt only after an explicit acknowledgement", async () => {
    render(<AffiliateSimpleForm />);
    fill();
    fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
    const code = (
      (await screen.findByLabelText("Código privado de acompanhamento")) as HTMLInputElement
    ).value;
    const button = screen.getByRole("button", { name: "Encerrar recuperação nesta aba" });
    expect(button).toBeDisabled();
    fireEvent.click(screen.getByLabelText("Já guardei meu código privado em local seguro."));
    expect(window.sessionStorage.getItem("vonix-affiliate-unconfirmed-code")).toBe(code);
    fireEvent.click(button);
    expect(window.sessionStorage.getItem("vonix-affiliate-unconfirmed-code")).toBeNull();
    expect(screen.getByText(/Recuperação nesta aba encerrada/)).toBeInTheDocument();
  });

  it("does not claim the recovery ended when the browser silently refuses to remove the code", async () => {
    render(<AffiliateSimpleForm />);
    fill();
    fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
    const code = (
      (await screen.findByLabelText("Código privado de acompanhamento")) as HTMLInputElement
    ).value;
    const removal = vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {});
    try {
      fireEvent.click(screen.getByLabelText("Já guardei meu código privado em local seguro."));
      fireEvent.click(screen.getByRole("button", { name: "Encerrar recuperação nesta aba" }));
      expect(screen.getByText(/Não foi possível remover a cópia desta aba/)).toBeInTheDocument();
      expect(window.sessionStorage.getItem("vonix-affiliate-unconfirmed-code")).toBe(code);
    } finally {
      removal.mockRestore();
    }
  });

  it("preserves an uncertain real receipt while the program is paused, without treating it as a preview", async () => {
    server.submit.mockRejectedValueOnce(new Error("synthetic lost response"));
    const { rerender } = render(<AffiliateSimpleForm />);
    fill();
    fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
    const code = (
      (await screen.findByLabelText(
        "Código privado da tentativa não confirmada",
      )) as HTMLInputElement
    ).value;
    rerender(<AffiliateSimpleForm preview paused />);
    expect(screen.getByLabelText("Código privado da tentativa não confirmada")).toHaveValue(code);
    expect(screen.queryByRole("button", { name: "Simular envio" })).not.toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Aguardando disponibilidade para enviar" }),
    ).toBeDisabled();
    fireEvent.submit(screen.getByRole("form"));
    expect(server.submit).toHaveBeenCalledOnce();
    expect(screen.getByRole("alert")).toHaveTextContent(/rascunho está preservado/);
    rerender(<AffiliateSimpleForm />);
    fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
    expect(await screen.findByLabelText("Código privado de acompanhamento")).toHaveValue(code);
    expect(server.submit.mock.calls[1]![0].data.trackingCode).toBe(code);
  });

  it("can cancel destructive discard and keeps the original receipt until confirmation", async () => {
    server.submit.mockRejectedValueOnce(new Error("synthetic lost response"));
    render(<AffiliateSimpleForm />);
    fill();
    fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
    const code = (
      (await screen.findByLabelText(
        "Código privado da tentativa não confirmada",
      )) as HTMLInputElement
    ).value;
    fireEvent.click(
      screen.getByRole("button", { name: "Descartar código e iniciar nova tentativa" }),
    );
    expect(window.sessionStorage.getItem("vonix-affiliate-unconfirmed-code")).toBe(code);
    fireEvent.click(screen.getByRole("button", { name: "Manter código" }));
    expect(screen.getByLabelText("Código privado da tentativa não confirmada")).toHaveValue(code);
    fireEvent.click(
      screen.getByRole("button", { name: "Descartar código e iniciar nova tentativa" }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Confirmar descarte do código" }));
    expect(window.sessionStorage.getItem("vonix-affiliate-unconfirmed-code")).toBeNull();
    expect(screen.queryByLabelText("Código privado da tentativa não confirmada")).toBeNull();
  });

  it("does not transmit a CEP to a third party during a fictional preview", async () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    render(<AffiliateSimpleForm preview />);
    fireEvent.change(screen.getByLabelText(/CEP/), { target: { value: "30110012" } });
    fireEvent.click(screen.getByRole("button", { name: "Buscar CEP" }));
    expect(screen.getByText(/Nenhum CEP é consultado externamente/)).toBeInTheDocument();
    expect(fetcher).not.toHaveBeenCalled();
    expect(server.submit).not.toHaveBeenCalled();
  });
});

it("only requests an address after explicit CEP lookup and avoids referrer or credential transmission", async () => {
  let finish!: (v: Response) => void;
  const fetcher = vi.fn(
    () =>
      new Promise<Response>((r) => {
        finish = r;
      }),
  );
  vi.stubGlobal("fetch", fetcher);
  render(<AffiliateSimpleForm />);
  const cep = screen.getByLabelText(/CEP/);
  fireEvent.change(cep, { target: { value: "30110012" } });
  fireEvent.blur(cep);
  expect(fetcher).not.toHaveBeenCalled();
  expect(screen.getByText(/Buscar CEP é opcional/)).toBeInTheDocument();
  const button = screen.getByRole("button", { name: "Buscar CEP" });
  act(() => {
    fireEvent.click(button);
    fireEvent.click(button);
  });
  expect(fetcher).toHaveBeenCalledTimes(1);
  expect(fetcher).toHaveBeenCalledWith(
    "https://viacep.com.br/ws/30110012/json/",
    expect.objectContaining({ referrerPolicy: "no-referrer", credentials: "omit" }),
  );
  await act(async () =>
    finish(
      Response.json({
        logradouro: "Rua Fictícia",
        bairro: "Centro",
        localidade: "Cidade Fictícia",
        uf: "MG",
      }),
    ),
  );
  expect(screen.getByLabelText(/Rua \/ Avenida/)).toHaveValue("Rua Fictícia");
});

describe("Receipt continuity and paused CEP", () => {
  it("does not replace a valid pending code added after mounting the form", async () => {
    render(<AffiliateSimpleForm />);
    fill();
    const existing = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdef";
    window.sessionStorage.setItem("vonix-affiliate-unconfirmed-code", existing);
    fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
    expect(await screen.findByLabelText("Código privado da tentativa não confirmada")).toHaveValue(
      existing,
    );
    expect(window.sessionStorage.getItem("vonix-affiliate-unconfirmed-code")).toBe(existing);
    expect(server.submit).not.toHaveBeenCalled();
    expect(screen.getByLabelText(/Nome completo/)).toHaveValue("Maria da Silva");
  });
  it("keeps native clipboard copy single-flight through concealment and a second code", async () => {
    server.submit.mockRejectedValueOnce(new Error("synthetic lost response"));
    let finish!: () => void;
    const writeText = vi
      .fn()
      .mockReturnValueOnce(new Promise<void>((r) => (finish = r)))
      .mockResolvedValue(undefined);
    const original = Object.getOwnPropertyDescriptor(navigator, "clipboard");
    Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
    try {
      render(<AffiliateSimpleForm />);
      fill();
      fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
      await screen.findByLabelText("Código privado da tentativa não confirmada");
      fireEvent.click(screen.getByRole("button", { name: "Copiar código de tentativa" }));
      act(() => window.dispatchEvent(new PageTransitionEvent("pagehide", { persisted: true })));
      act(() => window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true })));
      expect(screen.getByRole("button", { name: "Copiar código de tentativa" })).toBeDisabled();
      expect(writeText).toHaveBeenCalledTimes(1);
      fireEvent.click(screen.getByRole("button", { name: "Enviar minha inscrição" }));
      await screen.findByLabelText("Código privado de acompanhamento");
      expect(screen.getByRole("button", { name: /^Copiar código$/ })).toBeDisabled();
      await act(async () => finish());
      expect(screen.queryByRole("button", { name: "Código copiado!" })).toBeNull();
      fireEvent.click(screen.getByRole("button", { name: /^Copiar código$/ }));
      await screen.findByRole("button", { name: "Código copiado!" });
      expect(writeText).toHaveBeenCalledTimes(2);
    } finally {
      if (original) Object.defineProperty(navigator, "clipboard", original);
      else Reflect.deleteProperty(navigator, "clipboard");
    }
  });
  it("ignores a delayed CEP response after readiness pauses and permits manual edits", async () => {
    let finish!: (r: Response) => void;
    const fetcher = vi.fn().mockReturnValue(new Promise<Response>((r) => (finish = r)));
    vi.stubGlobal("fetch", fetcher);
    const { rerender } = render(<AffiliateSimpleForm />);
    fireEvent.change(screen.getByLabelText(/CEP/), { target: { value: "30110012" } });
    fireEvent.click(screen.getByRole("button", { name: "Buscar CEP" }));
    expect(fetcher).toHaveBeenCalledOnce();
    rerender(<AffiliateSimpleForm preview paused />);
    expect(screen.getByRole("button", { name: "Buscar CEP" })).toBeDisabled();
    await act(async () =>
      finish(
        new Response(
          JSON.stringify({
            logradouro: "Rua obsoleta",
            bairro: "Bairro QA",
            localidade: "Cidade QA",
            uf: "MG",
          }),
          { status: 200 },
        ),
      ),
    );
    expect(screen.getByLabelText(/Rua \/ Avenida/)).toHaveValue("");
    fireEvent.change(screen.getByLabelText(/Rua \/ Avenida/), { target: { value: "Rua manual" } });
    rerender(<AffiliateSimpleForm />);
    expect(screen.getByLabelText(/Rua \/ Avenida/)).toHaveValue("Rua manual");
    expect(screen.getByRole("button", { name: "Buscar CEP" })).toBeEnabled();
    expect(fetcher).toHaveBeenCalledOnce();
  });
});
