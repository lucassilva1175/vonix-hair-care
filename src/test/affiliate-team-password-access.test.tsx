import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { StrictMode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  loginAffiliateAdminMember: vi.fn(),
  requestAffiliateAccessEmail: vi.fn(),
  getUser: vi.fn(),
  onAuthStateChange: vi.fn(),
  signOut: vi.fn(),
  verifyOtp: vi.fn(),
  from: vi.fn(),
}));

vi.mock("@/lib/affiliate-functions", () => ({
  loginAffiliateAdminMember: mocks.loginAffiliateAdminMember,
  requestAffiliateAccessEmail: mocks.requestAffiliateAccessEmail,
}));
vi.mock("@/lib/vonix-affiliate-auth", () => ({
  affiliateAuthInitialLinkRecoveryReason: null,
  vonixAffiliateAuth: {
    auth: {
      getUser: mocks.getUser,
      onAuthStateChange: mocks.onAuthStateChange,
      signOut: mocks.signOut,
      verifyOtp: mocks.verifyOtp,
    },
    from: mocks.from,
  },
}));
vi.mock("@/components/affiliate-shell", () => ({
  AffiliateShell: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@tanstack/react-router", () => ({
  createFileRoute: () => (config: { component: React.ComponentType }) => config,
  Link: ({ children }: { children: React.ReactNode }) => <a href="/">{children}</a>,
}));

import { AffiliateTeamAccess } from "@/routes/acesso-equipe-afiliadas";

beforeEach(() => {
  window.history.replaceState({}, "", "/acesso-equipe-afiliadas");
  vi.resetAllMocks();
  mocks.getUser.mockResolvedValue({ data: { user: null }, error: null });
  mocks.onAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } });
  mocks.loginAffiliateAdminMember.mockResolvedValue({
    ok: false,
    reason: "Acesso não autorizado. Verifique o e-mail, a senha pessoal e sua permissão de equipe.",
  });
});

afterEach(() => {
  window.history.replaceState({}, "", "/acesso-equipe-afiliadas");
  cleanup();
  vi.restoreAllMocks();
});

describe("Vonix affiliate already-activated owner password sign-in", () => {
  it("requires a human click before redeeming a private owner-shared link", async () => {
    const hash = "a".repeat(64);
    window.history.replaceState({}, "", "/acesso-equipe-afiliadas#vonix_invite=" + hash);
    mocks.verifyOtp.mockResolvedValue({ data: {}, error: { message: "expired" } });
    render(<AffiliateTeamAccess />);
    const confirm = await screen.findByRole("button", { name: "Confirmar ativação" });
    expect(window.location.hash).toBe("");
    expect(mocks.verifyOtp).not.toHaveBeenCalled();
    fireEvent.click(confirm);
    await waitFor(() =>
      expect(mocks.verifyOtp).toHaveBeenCalledWith({ token_hash: hash, type: "magiclink" }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent("expirou");
  });

  it("requires a new personal password after manually verifying the one-use hash", async () => {
    const hash = "b".repeat(64);
    window.history.replaceState({}, "", "/acesso-equipe-afiliadas#vonix_invite=" + hash);
    mocks.verifyOtp.mockResolvedValue({ data: {}, error: null });
    mocks.getUser.mockResolvedValue({
      data: {
        user: {
          email: "pending.owner@example.invalid",
          email_confirmed_at: "2026-11-10T22:00:00Z",
        },
      },
      error: null,
    });
    mocks.from.mockReturnValue({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({
            data: { role: "owner", password_set_at: null, ever_activated_at: null },
            error: null,
          }),
        }),
      }),
    });
    render(<AffiliateTeamAccess />);
    fireEvent.click(await screen.findByRole("button", { name: "Confirmar ativação" }));
    expect(
      await screen.findByRole("heading", { name: "Crie sua senha pessoal" }),
    ).toBeInTheDocument();
    expect(mocks.loginAffiliateAdminMember).not.toHaveBeenCalled();
    expect(window.location.hash).toBe("");
  });

  it("releases a manual invite that completed after tab hiding so a fresh OTP can be requested", async () => {
    const hash = "d".repeat(64);
    window.history.replaceState({}, "", "/acesso-equipe-afiliadas#vonix_invite=" + hash);
    let release!: (answer: unknown) => void;
    mocks.verifyOtp.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          release = resolve;
        }),
    );
    const spy = vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
    try {
      render(<AffiliateTeamAccess />);
      fireEvent.click(await screen.findByRole("button", { name: "Confirmar ativação" }));
      await waitFor(() => expect(mocks.verifyOtp).toHaveBeenCalledOnce());
      spy.mockReturnValue("hidden");
      act(() => document.dispatchEvent(new Event("visibilitychange")));
      await act(async () => {
        release({ data: {}, error: null });
        await Promise.resolve();
      });
      expect(
        await screen.findByRole("heading", { name: "Confirmar e-mail da equipe" }),
      ).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: "Confirmar ativação" })).not.toBeInTheDocument();
    } finally {
      spy.mockRestore();
    }
  });

  it("opens the administrator shortcut directly on personal password sign-in", async () => {
    window.history.replaceState({}, "", "/acesso-equipe-afiliadas?login=senha");
    render(<AffiliateTeamAccess />);
    expect(
      await screen.findByRole("heading", { name: "Entrar com senha pessoal" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("textbox", { name: "E-mail administrativo" })).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Enviar acesso por e-mail" }),
    ).not.toBeInTheDocument();
    expect(mocks.requestAffiliateAccessEmail).not.toHaveBeenCalled();
    expect(mocks.loginAffiliateAdminMember).not.toHaveBeenCalled();
  });

  it("offers direct password sign-in without requesting a new OTP", async () => {
    render(<AffiliateTeamAccess />);
    fireEvent.click(await screen.findByRole("button", { name: /Já tenho senha/ }));
    const emailInput = screen.getByRole("textbox", { name: "E-mail administrativo" });
    const passwordInput = screen.getByLabelText("Senha pessoal");
    expect(emailInput).toBeRequired();
    expect(passwordInput).toHaveAttribute("minlength", "12");
    expect(mocks.requestAffiliateAccessEmail).not.toHaveBeenCalled();

    fireEvent.change(emailInput, { target: { value: " OWNER@EXAMPLE.INVALID " } });
    fireEvent.change(passwordInput, { target: { value: "SecretPersonalPassword2026!" } });
    fireEvent.click(screen.getByRole("button", { name: /Acessar candidaturas/ }));
    await waitFor(() =>
      expect(mocks.loginAffiliateAdminMember).toHaveBeenCalledWith({
        data: { email: "owner@example.invalid", password: "SecretPersonalPassword2026!" },
      }),
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Acesso não autorizado.");
    expect(mocks.requestAffiliateAccessEmail).not.toHaveBeenCalled();
  });

  it("returns to secure invitation enrollment without losing access to the OTP form", async () => {
    render(<AffiliateTeamAccess />);
    fireEvent.click(await screen.findByRole("button", { name: /Já tenho senha/ }));
    fireEvent.click(
      screen.getByRole("button", { name: /Ainda não tenho senha ou preciso recuperar acesso/ }),
    );
    expect(screen.getByRole("button", { name: "Enviar acesso por e-mail" })).toBeInTheDocument();
    expect(screen.getByLabelText("Código recebido, se disponível")).toBeInTheDocument();
    expect(mocks.signOut).not.toHaveBeenCalled();
  });

  it("removes an entered personal password on tab background and rechecks access on return", async () => {
    window.history.replaceState({}, "", "/acesso-equipe-afiliadas?login=senha");
    const spy = vi.spyOn(document, "visibilityState", "get").mockReturnValue("visible");
    try {
      render(<AffiliateTeamAccess />);
      const field = await screen.findByLabelText("Senha pessoal");
      fireEvent.change(field, { target: { value: "SensitiveSyntheticPassword123!" } });
      expect(field).toHaveValue("SensitiveSyntheticPassword123!");
      spy.mockReturnValue("hidden");
      act(() => document.dispatchEvent(new Event("visibilitychange")));
      expect(screen.queryByDisplayValue("SensitiveSyntheticPassword123!")).not.toBeInTheDocument();
      spy.mockReturnValue("visible");
      act(() => document.dispatchEvent(new Event("visibilitychange")));
      expect(await screen.findByLabelText("Senha pessoal")).toHaveValue("");
      await waitFor(() => expect(mocks.getUser).toHaveBeenCalledTimes(2));
    } finally {
      spy.mockRestore();
    }
  });

  it("does not make a password grant with an incomplete password", async () => {
    render(<AffiliateTeamAccess />);
    fireEvent.click(await screen.findByRole("button", { name: /Já tenho senha/ }));
    fireEvent.change(screen.getByRole("textbox", { name: "E-mail administrativo" }), {
      target: { value: "owner@example.invalid" },
    });
    fireEvent.change(screen.getByLabelText("Senha pessoal"), { target: { value: "short" } });
    fireEvent.click(screen.getByRole("button", { name: /Acessar candidaturas/ }));
    expect(mocks.loginAffiliateAdminMember).not.toHaveBeenCalled();
  });
});

describe("Team access lifecycle and duplicate protection", () => {
  it("clears the new rotation password across a back-forward cache restore", async () => {
    mocks.loginAffiliateAdminMember.mockResolvedValueOnce({
      ok: false,
      requiresPasswordChange: true,
      reason: "temporary",
    });
    window.history.replaceState({}, "", "/acesso-equipe-afiliadas?login=senha");
    render(<AffiliateTeamAccess />);
    fireEvent.change(await screen.findByLabelText("E-mail administrativo"), {
      target: { value: "owner@example.invalid" },
    });
    fireEvent.change(screen.getByLabelText("Senha pessoal"), {
      target: { value: "TemporarySyntheticPassword2026!" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Acessar candidaturas/ }));
    const field = await screen.findByLabelText("Nova senha pessoal");
    fireEvent.change(field, { target: { value: "NewSyntheticPassword2026!" } });
    fireEvent.change(screen.getByLabelText("Confirmar nova senha"), {
      target: { value: "NewSyntheticPassword2026!" },
    });
    act(() => window.dispatchEvent(new PageTransitionEvent("pagehide", { persisted: true })));
    expect(screen.queryByDisplayValue("NewSyntheticPassword2026!")).toBeNull();
    act(() => window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true })));
    await screen.findByLabelText("Senha pessoal");
    mocks.loginAffiliateAdminMember.mockResolvedValueOnce({
      ok: false,
      requiresPasswordChange: true,
      reason: "temporary",
    });
    fireEvent.change(screen.getByLabelText("E-mail administrativo"), {
      target: { value: "owner@example.invalid" },
    });
    fireEvent.change(screen.getByLabelText("Senha pessoal"), {
      target: { value: "TemporarySyntheticPassword2026!" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Acessar candidaturas/ }));
    expect(await screen.findByLabelText("Nova senha pessoal")).toHaveValue("");
    expect(screen.getByLabelText("Confirmar nova senha")).toHaveValue("");
  });
  it("sends only one password grant for same-tick submits", async () => {
    let finish!: (v: unknown) => void;
    mocks.loginAffiliateAdminMember.mockReturnValueOnce(
      new Promise((r) => {
        finish = r;
      }),
    );
    render(<AffiliateTeamAccess />);
    fireEvent.click(await screen.findByRole("button", { name: /Já tenho senha/ }));
    fireEvent.change(screen.getByLabelText("E-mail administrativo"), {
      target: { value: "owner@example.invalid" },
    });
    fireEvent.change(screen.getByLabelText("Senha pessoal"), {
      target: { value: "SyntheticPassword2026!" },
    });
    const form = screen.getByRole("button", { name: /Acessar candidaturas/ }).closest("form")!;
    act(() => {
      fireEvent.submit(form);
      fireEvent.submit(form);
    });
    expect(mocks.loginAffiliateAdminMember).toHaveBeenCalledOnce();
    await act(async () => finish({ ok: false, reason: "Synthetic denial" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Synthetic denial");
  });
  it("ignores an older manual invitation response after a restored page has entered password mode", async () => {
    let finish!: (v: unknown) => void;
    window.history.replaceState({}, "", "/acesso-equipe-afiliadas#vonix_invite=" + "z".repeat(64));
    mocks.verifyOtp.mockReturnValueOnce(
      new Promise((r) => {
        finish = r;
      }),
    );
    render(<AffiliateTeamAccess />);
    fireEvent.click(await screen.findByRole("button", { name: "Confirmar ativação" }));
    act(() => window.dispatchEvent(new PageTransitionEvent("pagehide", { persisted: true })));
    act(() => window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true })));
    fireEvent.click(await screen.findByRole("button", { name: /Já tenho senha/ }));
    await act(async () => finish({ data: {}, error: null }));
    expect(screen.getByRole("heading", { name: "Entrar com senha pessoal" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Confirmar ativação" })).toBeNull();
  });
});

it("does not rehydrate a suspended document on an auth callback until pageshow", async () => {
  let callback!: () => void;
  mocks.onAuthStateChange.mockImplementation((fn: () => void) => {
    callback = fn;
    return { data: { subscription: { unsubscribe: vi.fn() } } };
  });
  render(<AffiliateTeamAccess />);
  await screen.findByLabelText("E-mail autorizado");
  act(() => window.dispatchEvent(new PageTransitionEvent("pagehide", { persisted: true })));
  await act(async () => callback());
  expect(mocks.getUser).toHaveBeenCalledOnce();
  expect(screen.getByText(/Verificando sua identidade/)).toBeInTheDocument();
  act(() => window.dispatchEvent(new PageTransitionEvent("pageshow", { persisted: true })));
  await screen.findByLabelText("E-mail autorizado");
  expect(mocks.getUser).toHaveBeenCalledTimes(2);
});
it("preserves explicit confirmation of an unredeemed link through effect replay", async () => {
  window.history.replaceState({}, "", "/acesso-equipe-afiliadas#vonix_invite=" + "k".repeat(64));
  render(
    <StrictMode>
      <AffiliateTeamAccess />
    </StrictMode>,
  );
  expect(await screen.findByRole("button", { name: "Confirmar ativação" })).toBeInTheDocument();
  expect(mocks.getUser).not.toHaveBeenCalled();
  expect(mocks.verifyOtp).not.toHaveBeenCalled();
  expect(window.location.hash).toBe("");
});
