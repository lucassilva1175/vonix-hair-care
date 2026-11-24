import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  loginAffiliateAdminMember: vi.fn(),
  requestAffiliateAccessEmail: vi.fn(),
  getUser: vi.fn(),
  onAuthStateChange: vi.fn(),
  signOut: vi.fn(),
  verifyOtp: vi.fn(),
  from: vi.fn(),
  signInWithPassword: vi.fn(),
  updateUser: vi.fn(),
  rpc: vi.fn(),
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
      signInWithPassword: mocks.signInWithPassword,
      updateUser: mocks.updateUser,
    },
    from: mocks.from,
    rpc: mocks.rpc,
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

const oldPassword = "TemporarySynthetic2026!";
const newPassword = "NewSyntheticPersonal2026!";
const email = "reviewer@example.invalid";
async function openRotation() {
  window.history.replaceState({}, "", "/acesso-equipe-afiliadas?login=senha");
  mocks.loginAffiliateAdminMember.mockResolvedValueOnce({
    ok: false,
    requiresPasswordChange: true,
    reason: "Troque sua senha provisória para continuar.",
  });
  render(<AffiliateTeamAccess />);
  fireEvent.change(await screen.findByLabelText("E-mail administrativo"), {
    target: { value: email },
  });
  fireEvent.change(screen.getByLabelText("Senha pessoal"), { target: { value: oldPassword } });
  fireEvent.click(screen.getByRole("button", { name: "Acessar candidaturas" }));
  await screen.findByRole("heading", { name: "Primeiro acesso: altere sua senha" });
  mocks.signInWithPassword.mockResolvedValue({
    data: { user: { email, email_confirmed_at: "2026-11-24T12:00:00Z" } },
    error: null,
  });
  mocks.from.mockReturnValue({
    select: () => ({
      eq: () => ({
        maybeSingle: async () => ({
          data: {
            must_rotate_password: true,
            password_set_at: "2026-11-24T12:00:00Z",
            ever_activated_at: "2026-11-24T12:00:00Z",
          },
          error: null,
        }),
      }),
    }),
  });
  mocks.updateUser.mockResolvedValue({ error: null });
}
function submitRotation(password: string) {
  fireEvent.change(screen.getByLabelText("Nova senha pessoal"), { target: { value: password } });
  fireEvent.change(screen.getByLabelText("Confirmar nova senha"), { target: { value: password } });
  fireEvent.click(screen.getByRole("button", { name: "Trocar senha e liberar acesso" }));
}
describe("C151 password rotation boundaries (mock provider)", () => {
  it("changes password then confirms rotation before requesting a fresh admin session", async () => {
    await openRotation();
    mocks.rpc.mockResolvedValue({ data: true, error: null });
    submitRotation(newPassword);
    await waitFor(() => expect(mocks.loginAffiliateAdminMember).toHaveBeenCalledTimes(2));
    expect(mocks.signInWithPassword).toHaveBeenCalledWith({ email, password: oldPassword });
    expect(mocks.updateUser).toHaveBeenCalledWith({ password: newPassword });
    expect(mocks.rpc).toHaveBeenCalledWith("vonix_affiliate_finish_temporary_password");
    expect(mocks.updateUser.mock.invocationCallOrder[0]!).toBeLessThan(
      mocks.rpc.mock.invocationCallOrder[0]!,
    );
    expect(mocks.rpc.mock.invocationCallOrder[0]!).toBeLessThan(
      mocks.loginAffiliateAdminMember.mock.invocationCallOrder[1]!,
    );
    expect(mocks.loginAffiliateAdminMember).toHaveBeenLastCalledWith({
      data: { email, password: newPassword },
    });
    expect(await screen.findByText(/Senha atualizada. Faça login novamente/)).toBeInTheDocument();
    expect(screen.getByLabelText("Senha pessoal")).toHaveValue("");
  });
  it("does not request an admin session when rotation confirmation fails", async () => {
    await openRotation();
    mocks.rpc.mockResolvedValue({ data: false, error: null });
    submitRotation(newPassword);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "a liberação administrativa não foi confirmada",
    );
    expect(mocks.loginAffiliateAdminMember).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText("Senha pessoal")).toHaveValue("");
  });
  it("rejects reuse of the temporary password without invoking the provider", async () => {
    await openRotation();
    submitRotation(oldPassword);
    expect(await screen.findByRole("alert")).toHaveTextContent("diferente da provisória");
    expect(mocks.signInWithPassword).not.toHaveBeenCalled();
    expect(mocks.updateUser).not.toHaveBeenCalled();
  });
});
