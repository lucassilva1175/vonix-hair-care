#!/usr/bin/env node
/**
 * Safe, read-only checklist. Reads already-provided process environment variables,
 * not .env files. Never prints credentials, tokens, passwords or database endpoints.
 * It cannot verify actual bank migrations, provider domain ownership, or legal sign-off.
 */
const raw = process.env;
const present = (key, min = 1) => (raw[key] || "").length >= min;
const positive = (key) => raw[key] === "true";
const validUrl = (key) => {
  if (!present(key)) return false;
  try {
    const url = new URL(raw[key]);
    return (
      url.protocol === "https:" &&
      Boolean(url.hostname) &&
      !url.username &&
      !url.password &&
      !url.port &&
      !url.search &&
      !url.hash &&
      (url.pathname === "/" || url.pathname === "")
    );
  } catch {
    return false;
  }
};
// The checkout Supabase must never be used for confidential applicant records.
const projectRef = (raw["AFFILIATE_SUPABASE_PROJECT_REF"] || "").trim();
const affiliateDbKey = (raw["AFFILIATE_SUPABASE_SERVICE_ROLE_KEY"] || "").trim();
const checkoutDbKey = (raw["SUPABASE_SERVICE_ROLE_KEY"] || "").trim();
const projectPinned =
  /^[a-z0-9]{20}$/.test(projectRef) &&
  (() => {
    try {
      return new URL(raw["AFFILIATE_SUPABASE_URL"] || "").hostname === projectRef + ".supabase.co";
    } catch {
      return false;
    }
  })();
const sameAsCheckout = (() => {
  if (!raw["SUPABASE_URL"]) return false;
  try {
    return (
      new URL(raw["SUPABASE_URL"]).origin === new URL(raw["AFFILIATE_SUPABASE_URL"] || "").origin
    );
  } catch {
    return false;
  }
})();
const sameAsCheckoutKey = Boolean(checkoutDbKey && checkoutDbKey === affiliateDbKey);
const db =
  !sameAsCheckout &&
  !sameAsCheckoutKey &&
  validUrl("AFFILIATE_SUPABASE_URL") &&
  affiliateDbKey.length >= 16 &&
  !/\s/.test(affiliateDbKey) &&
  (!affiliateDbKey.startsWith("sb_") || affiliateDbKey.startsWith("sb_secret_")) &&
  projectPinned;
const encryptionKey = (() => {
  const value = raw["AFFILIATE_QUESTIONNAIRE_KEY"] || "";
  // Both legacy hex and Lovable-generated 64-character alphanumeric keys
  // are accepted by the production key derivation. Never print the material.
  if (/^[A-Za-z0-9]{64}$/.test(value)) return true;
  if (!/^[A-Za-z0-9_-]{43}$/.test(value)) return false;
  // Match the server's canonical decoder check. Padding-bit variations and
  // copied garbage must not make the production readiness report green.
  const decoded = Buffer.from(value, "base64url");
  return decoded.length === 32 && decoded.toString("base64url") === value;
})();
const resendKey = raw["AFFILIATE_RESEND_API_KEY"] || raw["RESEND_API_KEY"] || "";
const sender = (raw["AFFILIATE_FROM_EMAIL"] || "").trim();
const senderAddress = /^.{1,120}\s<([^<>]+)>$/.exec(sender)?.[1] || sender;
const senderDomain = senderAddress.split("@")[1] || "";
const senderLooksValid =
  sender.length >= 6 &&
  sender.length <= 240 &&
  /^[^@\s<>]+@[^@\s<>]+$/.test(senderAddress) &&
  /^[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\.[a-z]{2,}$/i.test(senderDomain);
const checks = [
  {
    id: "database_pair",
    ok: db,
    kind: "configuration",
    description: "Credenciais do Supabase dedicado de afiliadas no servidor",
  },
  {
    id: "admin_password",
    ok: present("AFFILIATE_ADMIN_PASSWORD", 16),
    kind: "configuration",
    description: "Senha administrativa",
  },
  {
    id: "session_secret",
    ok: present("AFFILIATE_ADMIN_SESSION_SECRET", 32),
    kind: "configuration",
    description: "Segredo de sessão",
  },
  {
    id: "totp",
    ok: /^[A-Z2-7]{32,128}$/i.test((raw["AFFILIATE_ADMIN_TOTP_SECRET"] || "").replace(/\s+/g, "")),
    kind: "configuration",
    description: "TOTP de produção",
  },
  {
    id: "hmac_pepper",
    ok: present("AFFILIATE_TRAFFIC_PEPPER", 32),
    kind: "configuration",
    description: "Proteção de limite de IP",
  },
  {
    id: "proxy_header",
    ok: ["cf-connecting-ip", "x-real-ip", "x-forwarded-for"].includes(
      raw["AFFILIATE_TRUSTED_IP_HEADER"],
    ),
    kind: "configuration",
    description: "Cabeçalho de proxy selecionado (deve ser verificado na borda)",
  },
  {
    id: "encryption_key",
    ok: encryptionKey,
    kind: "configuration",
    description: "Chave privada de criptografia AES-256-GCM",
  },
  {
    id: "resend",
    ok: resendKey.length >= 20 && !/\s/.test(resendKey),
    kind: "optional_notification",
    description: "Chave Resend (opcional para candidaturas)",
  },
  {
    id: "resend_sender",
    ok: senderLooksValid,
    kind: "optional_notification",
    description: "Endereço remetente (opcional)",
  },
  {
    id: "worker_secret",
    ok: present("AFFILIATE_WORKER_SECRET", 24) && !/\s/.test(raw["AFFILIATE_WORKER_SECRET"] || ""),
    kind: "optional_notification",
    description: "Segredo do worker de notificação (opcional)",
  },
  {
    id: "migration_attestation",
    ok: positive("AFFILIATE_GOVERNANCE_MIGRATED"),
    kind: "operator_approval",
    description: "Migração SQL aplicada e auditada no banco correto",
  },
  {
    id: "privacy_attestation",
    ok: positive("AFFILIATE_PRIVACY_POLICY_APPROVED"),
    kind: "operator_approval",
    description: "Aviso de privacidade e política de retenção aprovados",
  },
  {
    id: "provider_attestation",
    ok: positive("AFFILIATE_PROVIDER_VERIFIED"),
    kind: "operator_approval",
    description: "Hospedagem e proxy de origem homologados",
  },
  {
    id: "launch_switch",
    ok: positive("AFFILIATE_RECRUITMENT_OPEN"),
    kind: "operator_approval",
    description: "Abertura pública explicitamente solicitada",
  },
];
const canOpen = checks.filter((x) => x.kind !== "optional_notification").every((x) => x.ok);
const report = {
  canOpenFromConfiguration: canOpen,
  notificationConfigurationPresent: checks
    .filter((x) => x.kind === "optional_notification")
    .every((x) => x.ok),
  productionAcceptanceVerified: false,
  caveat:
    "Variáveis e atestações declaradas não comprovam banco, RLS, domínio nem revisão jurídica. Resend e worker são opcionais para receber candidaturas; sem eles não haverá envio automático de decisões.",
  missing: checks.filter((x) => x.kind !== "optional_notification" && !x.ok).map((x) => x.id),
  optionalNotificationsMissing: checks
    .filter((x) => x.kind === "optional_notification" && !x.ok)
    .map((x) => x.id),
  checks,
};
if (process.argv.includes("--json")) process.stdout.write(JSON.stringify(report, null, 2) + "\n");
else {
  process.stdout.write("Vonix afiliadas — checklist local, sem leitura de arquivos de segredos\n");
  for (const item of checks)
    process.stdout.write(
      (item.ok ? "OK  " : item.kind === "optional_notification" ? "OPC " : "PEND") +
        " " +
        item.id +
        " — " +
        item.description +
        "\n",
    );
  process.stdout.write(
    canOpen
      ? "Configuração declarada completa; homologação real ainda necessária.\n"
      : "Cadastro deve permanecer fechado; pendências acima.\n",
  );
}
if (!canOpen) process.exitCode = 2;
