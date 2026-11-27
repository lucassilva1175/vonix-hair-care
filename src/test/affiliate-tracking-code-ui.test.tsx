import { render, screen, fireEvent, waitFor, cleanup, act } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";

const server = vi.hoisted(() => ({ getAffiliateStatusByCode: vi.fn() }));
vi.mock("@/lib/affiliate-functions", () => ({
  getAffiliateStatusByCode: server.getAffiliateStatusByCode,
}));
vi.mock("@/components/affiliate-shell", () => ({
  AffiliateShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (config: { component: React.ComponentType }) => config,
}));

import { affiliatePrivateReceiptText } from "@/lib/affiliate-private-receipt";
import { AffiliateTrackingCodePage } from "@/routes/consultar-candidatura";

const code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdef";
afterEach(() => {
  cleanup();
  vi.resetAllMocks();
  vi.restoreAllMocks();
  window.sessionStorage.removeItem("vonix-affiliate-once-code");
  window.sessionStorage.removeItem("vonix-affiliate-unconfirmed-code");
});

describe("Private Vonix applicant status portal", () => {
  const pendingKey = "vonix-affiliate-unconfirmed-code";
  const otherCode = "abcdefghijklmnopqrstuvwxyzABCDEF";
  const received = {
    ok: true,
    status: "pendente",
    rejectionReason: null,
    submittedAt: "2026-11-11T12:00:00Z",
    reviewedAt: null,
  };

  it("C177 confirms a recovered attempt, preserves the code until acknowledged, then clears only the local pending marker", async () => {
    window.sessionStorage.setItem(pendingKey, code);
    window.sessionStorage.setItem("vonix-affiliate-once-code", code);
    server.getAffiliateStatusByCode.mockResolvedValue(received);
    render(<AffiliateTrackingCodePage />);
    expect(await screen.findByText("Sua tentativa anterior foi localizada")).toBeInTheDocument();
    const finish = screen.getByRole("button", { name: "Encerrar recuperação neste navegador" });
    expect(finish).toBeDisabled();
    expect(window.sessionStorage.getItem(pendingKey)).toBe(code);
    expect(window.sessionStorage.getItem("vonix-affiliate-once-code")).toBeNull();
    fireEvent.click(
      screen.getByRole("checkbox", { name: "Já guardei meu código privado em local seguro." }),
    );
    fireEvent.click(finish);
    expect(window.sessionStorage.getItem(pendingKey)).toBeNull();
    expect(screen.getByText(/Recuperação encerrada neste navegador/)).toBeInTheDocument();
    expect(screen.getByLabelText("Código privado de acompanhamento")).toHaveValue(code);
    expect(screen.getByText("Candidatura em análise")).toBeInTheDocument();
    expect(server.getAffiliateStatusByCode).toHaveBeenCalledTimes(1);
  });

  it("C177 never clears another pending code or clears on a failed query", async () => {
    window.sessionStorage.setItem(pendingKey, otherCode);
    server.getAffiliateStatusByCode
      .mockResolvedValueOnce(received)
      .mockResolvedValueOnce({ ok: false, reason: "Consulta indisponível" });
    render(<AffiliateTrackingCodePage />);
    const field = screen.getByLabelText("Código privado de acompanhamento");
    fireEvent.change(field, { target: { value: code } });
    fireEvent.click(screen.getByRole("button", { name: "Consultar minha inscrição" }));
    await screen.findByText("Candidatura em análise");
    expect(screen.queryByTestId("affiliate-c177-recovery")).not.toBeInTheDocument();
    fireEvent.change(field, { target: { value: otherCode } });
    fireEvent.click(screen.getByRole("button", { name: "Consultar minha inscrição" }));
    await screen.findByText("Consulta indisponível");
    expect(screen.queryByTestId("affiliate-c177-recovery")).not.toBeInTheDocument();
    expect(window.sessionStorage.getItem(pendingKey)).toBe(otherCode);
  });

  it("C177 fails safely on silent removal failure or a replaced pending code", async () => {
    window.sessionStorage.setItem(pendingKey, code);
    server.getAffiliateStatusByCode.mockResolvedValue(received);
    render(<AffiliateTrackingCodePage />);
    fireEvent.change(screen.getByLabelText("Código privado de acompanhamento"), {
      target: { value: code },
    });
    fireEvent.click(screen.getByRole("button", { name: "Consultar minha inscrição" }));
    await screen.findByTestId("affiliate-c177-recovery");
    fireEvent.click(
      screen.getByRole("checkbox", { name: "Já guardei meu código privado em local seguro." }),
    );
    const finish = screen.getByRole("button", { name: "Encerrar recuperação neste navegador" });
    const remove = vi.spyOn(Storage.prototype, "removeItem").mockImplementation(() => {});
    fireEvent.click(finish);
    expect(screen.getByText(/Não foi possível encerrar a recuperação/)).toBeInTheDocument();
    expect(window.sessionStorage.getItem(pendingKey)).toBe(code);
    remove.mockRestore();
    window.sessionStorage.setItem(pendingKey, otherCode);
    fireEvent.click(finish);
    expect(window.sessionStorage.getItem(pendingKey)).toBe(otherCode);
  });

  it("C177 revokes recovery permission when the code changes or the tab is hidden", async () => {
    window.sessionStorage.setItem(pendingKey, code);
    server.getAffiliateStatusByCode.mockResolvedValue(received);
    render(<AffiliateTrackingCodePage />);
    const field = screen.getByLabelText("Código privado de acompanhamento");
    fireEvent.change(field, { target: { value: code } });
    fireEvent.click(screen.getByRole("button", { name: "Consultar minha inscrição" }));
    await screen.findByTestId("affiliate-c177-recovery");
    fireEvent.click(
      screen.getByRole("checkbox", { name: "Já guardei meu código privado em local seguro." }),
    );
    fireEvent.change(field, { target: { value: otherCode } });
    expect(screen.queryByTestId("affiliate-c177-recovery")).not.toBeInTheDocument();
    fireEvent.change(field, { target: { value: code } });
    fireEvent.click(screen.getByRole("button", { name: "Consultar minha inscrição" }));
    await screen.findByTestId("affiliate-c177-recovery");
    expect(
      screen.getByRole("button", { name: "Encerrar recuperação neste navegador" }),
    ).toBeDisabled();
    const spy = vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    act(() => document.dispatchEvent(new Event("visibilitychange")));
    expect(screen.queryByTestId("affiliate-c177-recovery")).not.toBeInTheDocument();
    expect(window.sessionStorage.getItem(pendingKey)).toBe(code);
    spy.mockRestore();
  });

  it("clarifies that e-mail does not replace the private tracking code", () => {
    render(<AffiliateTrackingCodePage />);
    expect(
      screen.getByText(/todas as candidaturas, inclusive as novas com e-mail/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/O e-mail serve para contato, mas não substitui o código/i),
    ).toBeInTheDocument();
  });
  it("masks the private receipt by default and only reveals it on explicit request", () => {
    render(<AffiliateTrackingCodePage />);
    const field = screen.getByLabelText("Código privado de acompanhamento");
    fireEvent.change(field, { target: { value: code } });
    expect(field).toHaveAttribute("type", "password");
    const reveal = screen.getByRole("button", { name: "Mostrar código privado" });
    expect(reveal).toHaveAttribute("aria-pressed", "false");
    fireEvent.click(reveal);
    expect(field).toHaveAttribute("type", "text");
    expect(screen.getByRole("button", { name: "Ocultar código privado" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    fireEvent.click(screen.getByRole("button", { name: "Ocultar código privado" }));
    expect(field).toHaveAttribute("type", "password");
    expect(field).toHaveValue(code);
  });

  it("hides sensitive lookup status on tab background without deleting the saved code", async () => {
    server.getAffiliateStatusByCode.mockResolvedValue({
      ok: true,
      status: "aprovada",
      rejectionReason: null,
      submittedAt: "2026-11-11T12:00:00Z",
      reviewedAt: "2026-11-11T13:00:00Z",
    });
    render(<AffiliateTrackingCodePage />);
    const field = screen.getByLabelText("Código privado de acompanhamento");
    fireEvent.change(field, { target: { value: code } });
    fireEvent.click(screen.getByRole("button", { name: "Consultar minha inscrição" }));
    expect(await screen.findByText("Candidatura aprovada")).toBeInTheDocument();
    let state: DocumentVisibilityState = "hidden";
    const spy = vi.spyOn(document, "visibilityState", "get").mockImplementation(() => state);
    try {
      act(() => document.dispatchEvent(new Event("visibilitychange")));
      expect(screen.queryByText("Candidatura aprovada")).not.toBeInTheDocument();
      expect(field).toHaveValue(code);
      expect(field).toHaveAttribute("type", "password");
      state = "visible";
      act(() => document.dispatchEvent(new Event("visibilitychange")));
      expect(screen.queryByText("Candidatura aprovada")).not.toBeInTheDocument();
      expect(server.getAffiliateStatusByCode).toHaveBeenCalledTimes(1);
    } finally {
      spy.mockRestore();
    }
  });

  it("ignores an in-flight private status response after its tab becomes hidden", async () => {
    let finish!: (result: unknown) => void;
    server.getAffiliateStatusByCode.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    render(<AffiliateTrackingCodePage />);
    fireEvent.change(screen.getByLabelText("Código privado de acompanhamento"), {
      target: { value: code },
    });
    fireEvent.click(screen.getByRole("button", { name: "Consultar minha inscrição" }));
    expect(screen.getByRole("button", { name: "Consultando..." })).toBeDisabled();
    const spy = vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    try {
      act(() => document.dispatchEvent(new Event("visibilitychange")));
      await act(async () => {
        finish({
          ok: true,
          status: "aprovada",
          rejectionReason: null,
          submittedAt: "2026-11-11T12:00:00Z",
          reviewedAt: null,
        });
        await Promise.resolve();
      });
      expect(screen.queryByText("Candidatura aprovada")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Consultar minha inscrição" })).toBeEnabled();
    } finally {
      spy.mockRestore();
    }
  });

  it("does not initiate private auto-lookup from a one-time code on an initially hidden tab", async () => {
    window.sessionStorage.setItem("vonix-affiliate-once-code", code);
    const spy = vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    try {
      render(<AffiliateTrackingCodePage />);
      await waitFor(() =>
        expect(screen.getByLabelText("Código privado de acompanhamento")).toHaveValue(code),
      );
      expect(server.getAffiliateStatusByCode).not.toHaveBeenCalled();
      expect(screen.queryByText("Candidatura aprovada")).not.toBeInTheDocument();
      expect(window.sessionStorage.getItem("vonix-affiliate-once-code")).toBeNull();
    } finally {
      spy.mockRestore();
    }
  });

  it("ignores private status responses completed while the document is hidden even before a visibility event", async () => {
    let resolve!: (value: unknown) => void;
    server.getAffiliateStatusByCode.mockImplementationOnce(
      () =>
        new Promise((done) => {
          resolve = done;
        }),
    );
    render(<AffiliateTrackingCodePage />);
    fireEvent.change(screen.getByLabelText("Código privado de acompanhamento"), {
      target: { value: code },
    });
    fireEvent.click(screen.getByRole("button", { name: "Consultar minha inscrição" }));
    const spy = vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    try {
      await act(async () => {
        resolve({
          ok: true,
          status: "aprovada",
          rejectionReason: null,
          submittedAt: "2026-11-11T12:00:00Z",
          reviewedAt: null,
        });
        await Promise.resolve();
      });
      expect(screen.queryByText("Candidatura aprovada")).not.toBeInTheDocument();
    } finally {
      spy.mockRestore();
    }
  });

  it("consumes one-time code from signup and auto-consults without URL leakage", async () => {
    const code = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdef";
    window.sessionStorage.setItem("vonix-affiliate-once-code", code);
    server.getAffiliateStatusByCode.mockResolvedValue({
      ok: true,
      status: "pendente",
      rejectionReason: null,
      submittedAt: "2026-11-11T12:00:00Z",
      reviewedAt: null,
    });
    render(<AffiliateTrackingCodePage />);
    await waitFor(() =>
      expect(server.getAffiliateStatusByCode).toHaveBeenCalledWith({ data: { code } }),
    );
    expect(await screen.findByText("Candidatura em análise")).toBeInTheDocument();
    expect(window.sessionStorage.getItem("vonix-affiliate-once-code")).toBeNull();
    expect(window.location.search).not.toContain(code);
    expect(window.location.hash).not.toContain(code);
    expect(screen.getByRole("button", { name: "Copiar código para guardar" })).toBeInTheDocument();
  });

  it("allows copying the private code on the status portal without persisting or logging it in the URL", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const original = Object.getOwnPropertyDescriptor(window.navigator, "clipboard");
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    try {
      render(<AffiliateTrackingCodePage />);
      fireEvent.change(screen.getByLabelText("Código privado de acompanhamento"), {
        target: { value: code },
      });
      fireEvent.click(screen.getByRole("button", { name: "Copiar código para guardar" }));
      await waitFor(() => expect(writeText).toHaveBeenCalledExactlyOnceWith(code));
      expect(screen.getByRole("button", { name: "Código copiado!" })).toBeInTheDocument();
      expect(window.location.search).not.toContain(code);
      expect(window.location.hash).not.toContain(code);
      expect(server.getAffiliateStatusByCode).not.toHaveBeenCalled();
    } finally {
      if (original) Object.defineProperty(window.navigator, "clipboard", original);
      else Reflect.deleteProperty(window.navigator, "clipboard");
    }
  });

  it("requires a strong private code, not a social handle", () => {
    render(<AffiliateTrackingCodePage />);
    expect(screen.getByRole("button", { name: "Consultar minha inscrição" })).toBeDisabled();
    fireEvent.change(screen.getByLabelText("Código privado de acompanhamento"), {
      target: { value: "@instagram-aberto" },
    });
    expect(screen.getByRole("button", { name: "Consultar minha inscrição" })).toBeDisabled();
    expect(server.getAffiliateStatusByCode).not.toHaveBeenCalled();
  });

  it("shows objective follower reason and possibility of retrying after rejection", async () => {
    server.getAffiliateStatusByCode.mockResolvedValue({
      ok: true,
      status: "recusada",
      rejectionReason: "seguidores_insuficientes",
      submittedAt: "2026-11-11T12:00:00Z",
      reviewedAt: "2026-11-11T13:00:00Z",
    });
    render(<AffiliateTrackingCodePage />);
    fireEvent.change(screen.getByLabelText("Código privado de acompanhamento"), {
      target: { value: code },
    });
    fireEvent.click(screen.getByRole("button", { name: "Consultar minha inscrição" }));
    await waitFor(() =>
      expect(server.getAffiliateStatusByCode).toHaveBeenCalledWith({
        data: { code },
      }),
    );
    expect(await screen.findByText(/Poucos seguidores no Instagram/)).toBeInTheDocument();
    expect(screen.getByText(/quantidade de seguidores considerada/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Quero me candidatar novamente" })).toHaveAttribute(
      "href",
      "/seja-afiliada",
    );
    expect(document.body.innerHTML).not.toContain("e-mail da candidata");
  });

  it("C46 does not spend two private-status quotas on same-tick duplicate submissions", async () => {
    let finish!: (result: unknown) => void;
    server.getAffiliateStatusByCode.mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    render(<AffiliateTrackingCodePage />);
    const field = screen.getByLabelText("Código privado de acompanhamento");
    fireEvent.change(field, { target: { value: code } });
    const form = screen.getByRole("button", { name: "Consultar minha inscrição" }).closest("form");
    expect(form).not.toBeNull();
    act(() => {
      fireEvent.submit(form!);
      fireEvent.submit(form!);
    });
    expect(server.getAffiliateStatusByCode).toHaveBeenCalledOnce();
    await act(async () => {
      finish({
        ok: true,
        status: "pendente",
        rejectionReason: null,
        submittedAt: "2026-11-11T12:00:00Z",
        reviewedAt: null,
      });
      await Promise.resolve();
    });
    expect(screen.getByText("Candidatura em análise")).toBeInTheDocument();
  });

  it("C46 permits a fresh retry of the same private code after a finished denied lookup", async () => {
    server.getAffiliateStatusByCode
      .mockResolvedValueOnce({ ok: false, reason: "Consulta temporariamente indisponível." })
      .mockResolvedValueOnce({
        ok: true,
        status: "pendente",
        rejectionReason: null,
        submittedAt: "2026-11-11T12:00:00Z",
        reviewedAt: null,
      });
    render(<AffiliateTrackingCodePage />);
    fireEvent.change(screen.getByLabelText("Código privado de acompanhamento"), {
      target: { value: code },
    });
    fireEvent.click(screen.getByRole("button", { name: "Consultar minha inscrição" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Consulta temporariamente indisponível.",
    );
    fireEvent.click(screen.getByRole("button", { name: "Consultar minha inscrição" }));
    expect(await screen.findByText("Candidatura em análise")).toBeInTheDocument();
    expect(server.getAffiliateStatusByCode).toHaveBeenCalledTimes(2);
  });

  it("never displays a stale rejected result for code A after code B was submitted", async () => {
    const codeB = "abcdefghijklmnopqrstuvwxABCDEFGH";
    let releaseOld!: (result: unknown) => void;
    const oldReply = new Promise((resolve) => {
      releaseOld = resolve;
    });
    server.getAffiliateStatusByCode
      .mockImplementationOnce(() => oldReply)
      .mockResolvedValueOnce({
        ok: true,
        status: "pendente",
        rejectionReason: null,
        submittedAt: "2026-11-11T12:00:00Z",
        reviewedAt: null,
      });
    render(<AffiliateTrackingCodePage />);
    const field = screen.getByLabelText("Código privado de acompanhamento");
    fireEvent.change(field, { target: { value: code } });
    fireEvent.click(screen.getByRole("button", { name: "Consultar minha inscrição" }));
    expect(screen.getByRole("button", { name: "Consultando..." })).toBeDisabled();
    fireEvent.change(field, { target: { value: codeB } });
    expect(screen.getByRole("button", { name: "Consultar minha inscrição" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "Consultar minha inscrição" }));
    expect(await screen.findByText("Candidatura em análise")).toBeInTheDocument();
    await act(async () => {
      releaseOld({
        ok: true,
        status: "recusada",
        rejectionReason: "seguidores_insuficientes",
        submittedAt: "2026-11-11T11:00:00Z",
        reviewedAt: "2026-11-11T11:20:00Z",
      });
      await Promise.resolve();
    });
    expect(field).toHaveValue(codeB);
    expect(screen.getByText("Candidatura em análise")).toBeInTheDocument();
    expect(screen.queryByText("Candidatura não selecionada")).not.toBeInTheDocument();
    expect(server.getAffiliateStatusByCode).toHaveBeenCalledTimes(2);
  });

  it("drops a stale network error when the code changes before lookup finishes", async () => {
    let rejectOld!: (error: Error) => void;
    server.getAffiliateStatusByCode.mockImplementationOnce(
      () =>
        new Promise((_resolve, reject) => {
          rejectOld = reject;
        }),
    );
    render(<AffiliateTrackingCodePage />);
    const field = screen.getByLabelText("Código privado de acompanhamento");
    fireEvent.change(field, { target: { value: code } });
    fireEvent.click(screen.getByRole("button", { name: "Consultar minha inscrição" }));
    fireEvent.change(field, { target: { value: "12345678901234567890123456789012" } });
    await act(async () => {
      rejectOld(new Error("stale offline reply"));
      await Promise.resolve();
    });
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Consultar minha inscrição" })).toBeEnabled();
  });

  it("does not publish a network error after the document becomes hidden without a visibility event", async () => {
    let reject!: (error: Error) => void;
    server.getAffiliateStatusByCode.mockImplementationOnce(
      () =>
        new Promise((_resolve, fail) => {
          reject = fail;
        }),
    );
    render(<AffiliateTrackingCodePage />);
    fireEvent.change(screen.getByLabelText("Código privado de acompanhamento"), {
      target: { value: code },
    });
    fireEvent.click(screen.getByRole("button", { name: "Consultar minha inscrição" }));
    await waitFor(() => expect(server.getAffiliateStatusByCode).toHaveBeenCalledOnce());
    const spy = vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    try {
      await act(async () => {
        reject(new Error("synthetic network lost"));
        await Promise.resolve();
      });
      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
      expect(screen.queryByRole("status")).not.toBeInTheDocument();
    } finally {
      spy.mockRestore();
    }
  });

  it("does not show Invalid Date or an approval for an invalid date returned by an outdated client contract", async () => {
    server.getAffiliateStatusByCode.mockResolvedValue({
      ok: true,
      status: "aprovada",
      rejectionReason: null,
      submittedAt: "not-an-ISO-timestamp",
      reviewedAt: null,
    });
    render(<AffiliateTrackingCodePage />);
    fireEvent.change(screen.getByLabelText("Código privado de acompanhamento"), {
      target: { value: code },
    });
    fireEvent.click(screen.getByRole("button", { name: "Consultar minha inscrição" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/validar os dados/i);
    expect(screen.queryByText("Candidatura aprovada")).not.toBeInTheDocument();
    expect(document.body.textContent).not.toContain("Invalid Date");
  });

  it("fails closed on an unrecognized private status instead of silently showing 'em análise'", async () => {
    server.getAffiliateStatusByCode.mockResolvedValue({
      ok: true,
      status: "estado_desconhecido",
      rejectionReason: null,
      submittedAt: "2026-11-11T12:00:00Z",
      reviewedAt: null,
    });
    render(<AffiliateTrackingCodePage />);
    fireEvent.change(screen.getByLabelText("Código privado de acompanhamento"), {
      target: { value: code },
    });
    fireEvent.click(screen.getByRole("button", { name: "Consultar minha inscrição" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/validar os dados/i);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("rejects invalid codes without exposing candidate data", async () => {
    server.getAffiliateStatusByCode.mockResolvedValue({
      ok: false,
      reason: "Código não encontrado. Confira e tente novamente.",
    });
    render(<AffiliateTrackingCodePage />);
    fireEvent.change(screen.getByLabelText("Código privado de acompanhamento"), {
      target: { value: code },
    });
    fireEvent.click(screen.getByRole("button", { name: "Consultar minha inscrição" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Código não encontrado");
    expect(screen.queryByText(/Motivo:/)).not.toBeInTheDocument();
  });
});

// C37 regression: private clipboard actions must be single-flight, even if React
// has not yet committed the disabled state on rapid repeated user gestures.
it("C37 refuses duplicate private status-code clipboard writes while pending", async () => {
  let resolveCopy!: () => void;
  const pending = new Promise<void>((resolve) => {
    resolveCopy = resolve;
  });
  const writeText = vi.fn().mockReturnValue(pending);
  const original = Object.getOwnPropertyDescriptor(navigator, "clipboard");
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
  try {
    render(<AffiliateTrackingCodePage />);
    fireEvent.change(screen.getByLabelText("Código privado de acompanhamento"), {
      target: { value: code },
    });
    const copy = screen.getByRole("button", { name: "Copiar código para guardar" });
    fireEvent.click(copy);
    fireEvent.click(copy);
    expect(writeText).toHaveBeenCalledTimes(1);
    expect(copy).toBeDisabled();
    await act(async () => {
      resolveCopy();
      await pending;
    });
    expect(screen.getByRole("button", { name: "Código copiado!" })).toBeInTheDocument();
  } finally {
    if (original) Object.defineProperty(navigator, "clipboard", original);
    else Reflect.deleteProperty(navigator, "clipboard");
  }
});

it("C37 never selects a secret field if clipboard fails while tab is hidden before the event", async () => {
  let rejectCopy!: (reason: Error) => void;
  const writeText = vi.fn().mockReturnValue(
    new Promise<void>((_, reject) => {
      rejectCopy = reject;
    }),
  );
  const original = Object.getOwnPropertyDescriptor(navigator, "clipboard");
  Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText } });
  const visibility = vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
  try {
    render(<AffiliateTrackingCodePage />);
    const field = screen.getByLabelText("Código privado de acompanhamento") as HTMLInputElement;
    fireEvent.change(field, { target: { value: code } });
    const select = vi.spyOn(field, "select");
    const focus = vi.spyOn(field, "focus");
    fireEvent.click(screen.getByRole("button", { name: "Copiar código para guardar" }));
    expect(writeText).toHaveBeenCalledOnce();
    visibility.mockReturnValue("hidden");
    await act(async () => {
      rejectCopy(new Error("synthetic permission denied"));
      await Promise.resolve();
    });
    expect(select).not.toHaveBeenCalled();
    expect(focus).not.toHaveBeenCalled();
    expect(field).toHaveAttribute("type", "password");
    expect(screen.queryByRole("button", { name: "Código copiado!" })).not.toBeInTheDocument();
  } finally {
    visibility.mockRestore();
    if (original) Object.defineProperty(navigator, "clipboard", original);
    else Reflect.deleteProperty(navigator, "clipboard");
  }
});

describe("Local private receipt recovery", () => {
  const receipt = () => affiliatePrivateReceiptText(code, false);
  const field = () => screen.getByLabelText("Código privado de acompanhamento");
  const picker = () => screen.getByLabelText("Importar comprovante privado de texto");
  const submit = () => screen.getByRole("button", { name: "Consultar minha inscrição" });
  const received = {
    ok: true,
    status: "pendente",
    rejectionReason: null,
    submittedAt: "2026-11-11T12:00:00Z",
    reviewedAt: null,
  };
  const fileWith = (text: () => Promise<string>, size = 200) => ({ size, text });
  it("imports a saved text file locally, without assuming a confirmed submission", async () => {
    render(<AffiliateTrackingCodePage />);
    const read = vi.fn().mockResolvedValue(receipt());
    fireEvent.change(picker(), { target: { files: [fileWith(read)] } });
    await screen.findByText(/Código carregado neste navegador/);
    expect(field()).toHaveValue(code);
    expect(field()).toHaveAttribute("type", "password");
    expect(server.getAffiliateStatusByCode).not.toHaveBeenCalled();
    expect(screen.queryByText("Candidatura em análise")).toBeNull();
    server.getAffiliateStatusByCode.mockResolvedValue(received);
    fireEvent.click(submit());
    await screen.findByText("Candidatura em análise");
    expect(server.getAffiliateStatusByCode).toHaveBeenCalledExactlyOnceWith({ data: { code } });
  });
  it("accepts pasting the whole generated receipt but never auto-consults", () => {
    render(<AffiliateTrackingCodePage />);
    fireEvent.paste(field(), { clipboardData: { getData: () => receipt() } });
    expect(field()).toHaveValue(code);
    expect(server.getAffiliateStatusByCode).not.toHaveBeenCalled();
    fireEvent.paste(field(), {
      clipboardData: { getData: () => receipt() + "\nCódigo privado: " + code },
    });
    expect(screen.getByText(/Cole somente o código/)).toBeInTheDocument();
    expect(field()).toHaveValue(code);
  });
  it("rejects oversized files without reading them and keeps an existing code", async () => {
    render(<AffiliateTrackingCodePage />);
    fireEvent.change(field(), { target: { value: code } });
    const read = vi.fn();
    fireEvent.change(picker(), { target: { files: [fileWith(read, 4097)] } });
    await screen.findByText(/Não foi possível ler um código Vonix válido/);
    expect(read).not.toHaveBeenCalled();
    expect(field()).toHaveValue(code);
  });
  it("ignores delayed file reads after manual edits or backgrounding", async () => {
    render(<AffiliateTrackingCodePage />);
    let resolve!: (s: string) => void;
    fireEvent.change(picker(), {
      target: {
        files: [
          fileWith(
            () =>
              new Promise((r) => {
                resolve = r;
              }),
          ),
        ],
      },
    });
    const other = "abcdefghijklmnopqrstuvwxyzABCDEF";
    fireEvent.change(field(), { target: { value: other } });
    await act(async () => {
      resolve(receipt());
    });
    expect(field()).toHaveValue(other);
    fireEvent.change(picker(), {
      target: {
        files: [
          fileWith(
            () =>
              new Promise((r) => {
                resolve = r;
              }),
          ),
        ],
      },
    });
    const visibility = vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    try {
      act(() => document.dispatchEvent(new Event("visibilitychange")));
      await act(async () => {
        resolve(receipt());
      });
      expect(field()).toHaveValue(other);
    } finally {
      visibility.mockRestore();
    }
    expect(server.getAffiliateStatusByCode).not.toHaveBeenCalled();
  });
  it("clears the screen without deleting the pending receipt or accepting a stale lookup", async () => {
    let finish!: (v: unknown) => void;
    server.getAffiliateStatusByCode.mockImplementation(
      () =>
        new Promise((r) => {
          finish = r;
        }),
    );
    render(<AffiliateTrackingCodePage />);
    window.sessionStorage.setItem("vonix-affiliate-unconfirmed-code", code);
    fireEvent.change(field(), { target: { value: code } });
    fireEvent.click(submit());
    fireEvent.click(screen.getByRole("button", { name: "Limpar consulta nesta tela" }));
    await act(async () => {
      finish(received);
    });
    expect(field()).toHaveValue("");
    expect(screen.queryByText("Candidatura em análise")).toBeNull();
    expect(window.sessionStorage.getItem("vonix-affiliate-unconfirmed-code")).toBe(code);
  });
  it("releases a stalled lookup after the local deadline, then ignores its late reply", async () => {
    vi.useFakeTimers();
    try {
      let late!: (v: unknown) => void;
      server.getAffiliateStatusByCode
        .mockImplementationOnce(
          () =>
            new Promise((r) => {
              late = r;
            }),
        )
        .mockResolvedValueOnce(received);
      render(<AffiliateTrackingCodePage />);
      fireEvent.change(field(), { target: { value: code } });
      fireEvent.click(submit());
      await act(async () => {
        await vi.advanceTimersByTimeAsync(30000);
      });
      expect(screen.getByRole("alert")).toHaveTextContent("Falha ao consultar");
      expect(submit()).toBeEnabled();
      await act(async () => {
        fireEvent.click(submit());
      });
      expect(screen.getByText("Candidatura em análise")).toBeInTheDocument();
      await act(async () => {
        late({ ...received, status: "aprovada" });
      });
      expect(screen.queryByText("Candidatura aprovada")).toBeNull();
      expect(server.getAffiliateStatusByCode).toHaveBeenCalledTimes(2);
    } finally {
      vi.useRealTimers();
    }
  });
});

it("restores a pending receipt only after explicit action without consulting or deleting it", async () => {
  window.sessionStorage.setItem("vonix-affiliate-unconfirmed-code", code);
  render(<AffiliateTrackingCodePage />);
  const field = screen.getByLabelText("Código privado de acompanhamento");
  expect(field).toHaveValue("");
  fireEvent.click(
    screen.getByRole("button", { name: "Recuperar código de uma tentativa anterior" }),
  );
  expect(field).toHaveValue(code);
  expect(field).toHaveAttribute("type", "password");
  expect(server.getAffiliateStatusByCode).not.toHaveBeenCalled();
  expect(window.sessionStorage.getItem("vonix-affiliate-unconfirmed-code")).toBe(code);
});
