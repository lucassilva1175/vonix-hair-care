import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { RecruitmentStatus } from "@/components/affiliate-editorial-hero";
import { ArrowRight, Sparkles } from "lucide-react";
import { AffiliateShell } from "@/components/affiliate-shell";
import { getAffiliateRecruitmentStatus } from "@/lib/affiliate-functions";
import { AffiliateSimpleForm } from "@/components/affiliate-simple-form";
import { AffiliateApplicationPrep } from "@/components/affiliate-application-prep";
import { AffiliateNextSteps } from "@/components/affiliate-next-steps";
import { AffiliateVerifiedReviewPreview } from "@/components/affiliate-verified-review-preview";
import { AffiliateApplicationStepsPreview } from "@/components/affiliate-application-steps-preview";
import {
  AffiliateLandingOffer,
  AffiliateLandingDiscovery,
  AffiliateLandingFAQ,
} from "@/components/affiliate-landing";
import { Button } from "@/components/ui/button";
import { SITE_URL } from "@/lib/store";

export const Route = createFileRoute("/seja-afiliada")({
  head: () => ({
    meta: [
      { title: "Afiliadas Vonix Hair | Cria??o, candidatura e sele??o individual" },
      {
        name: "description",
        content:
          "Conhe?a o programa de afiliadas Vonix Hair: inscri??o gratuita, comiss?o de 8% sobre vendas eleg?veis ap?s aprova??o, sem estoque pr?prio e sele??o individual, sem garantia de ganhos.",
      },
      { property: "og:title", content: "Afiliadas Vonix Hair | Seu jeito de criar" },
      {
        property: "og:description",
        content:
          "Sua criatividade pode abrir novas possibilidades. Conhe?a o programa de afiliadas Vonix Hair, as condi??es ap?s aprova??o e como enviar sua candidatura gratuita.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Vonix Hair" },
      { property: "og:image", content: SITE_URL + "/affiliate-creators-share.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      {
        property: "og:image:alt",
        content:
          "Programa de afiliadas Vonix Hair: inscri??o gratuita e produtos oficiais da marca",
      },
      { name: "twitter:image", content: SITE_URL + "/affiliate-creators-share.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "index,follow" },
    ],
    links: [{ rel: "canonical", href: SITE_URL + "/seja-afiliada" }],
  }),
  component: AffiliateApplicationPage,
});

export function AffiliateApplicationPage() {
  const [recruitment, setRecruitment] = useState<RecruitmentStatus>("loading");
  const [retryAvailability, setRetryAvailability] = useState(0);

  function verifyAvailabilityAgain() {
    setRecruitment("loading");
    setRetryAvailability((attempt) => attempt + 1);
  }
  const [preview, setPreview] = useState(false);
  const [backendDiagnostics, setBackendDiagnostics] = useState({
    storage: false,
    storageDiagnostic: "checking",
    publicNetworkDiagnostic: "checking",
    ingress: false,
    encryption: false,
    emailConfigured: false,
  });
  const [previewHasDraft, setPreviewHasDraft] = useState(false);
  const [confirmPreviewExit, setConfirmPreviewExit] = useState(false);
  // Keep an already-started application mounted if the operator closes
  // recruitment while somebody is filling it in. It becomes read-only preview
  // mode, but never loses the unsent local draft or attempts to POST.
  const [liveFormStarted, setLiveFormStarted] = useState(false);

  useEffect(() => {
    let active = true;
    let latestRequest = 0;
    async function refreshStatus() {
      const requestId = ++latestRequest;
      // Never trust a previously OPEN session while the next GET is pending.
      // Keep the existing draft mounted, but pause any submission.
      setRecruitment("loading");
      setBackendDiagnostics({
        storage: false,
        storageDiagnostic: "checking",
        publicNetworkDiagnostic: "checking",
        ingress: false,
        encryption: false,
        emailConfigured: false,
      });
      try {
        const {
          open,
          intakeEnabled,
          rateLimitReady,
          storageReachable,
          storageDiagnostic,
          publicNetworkDiagnostic,
          cfConnectingIpPresent,
          encryptionReady,
          transactionalEmailConfigured,
        } = await getAffiliateRecruitmentStatus();
        if (!active || requestId !== latestRequest) return;
        setBackendDiagnostics({
          storage: storageReachable,
          storageDiagnostic,
          publicNetworkDiagnostic,
          ingress: cfConnectingIpPresent,
          encryption: encryptionReady,
          emailConfigured: transactionalEmailConfigured,
        });
        setRecruitment(
          open ? "open" : intakeEnabled === true && rateLimitReady === false ? "limited" : "closed",
        );
        if (open) setLiveFormStarted(true);
      } catch {
        // A failed GET is not proof the program is closed. Fail closed for
        // submissions, but give applicants an explicit retry action.
        if (active && requestId === latestRequest) {
          setBackendDiagnostics({
            storage: false,
            storageDiagnostic: "unavailable",
            publicNetworkDiagnostic: "unavailable",
            ingress: false,
            encryption: false,
            emailConfigured: false,
          });
          setRecruitment("unavailable");
        }
      }
    }
    void refreshStatus();
    // Re-check availability without restarting a filled draft.
    const onFocus = () => {
      if (document.visibilityState === "visible") void refreshStatus();
    };
    const onVisible = () => {
      if (document.visibilityState === "visible") void refreshStatus();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      active = false;
      latestRequest += 1;
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [retryAvailability]);

  const showWizard = preview || recruitment === "open" || liveFormStarted;
  const simulationOnly = preview || recruitment !== "open";

  function requestPreviewExit() {
    if (previewHasDraft) {
      setConfirmPreviewExit(true);
      return;
    }
    finishPreviewExit();
  }

  function finishPreviewExit() {
    setPreview(false);
    setPreviewHasDraft(false);
    setConfirmPreviewExit(false);
  }

  return (
    <AffiliateShell recruitmentStatus={recruitment}>
      <div data-testid="vonix-affiliate-editorial" className="bg-background text-foreground">
        <AffiliateLandingOffer recruitmentStatus={recruitment} />
        <AffiliateVerifiedReviewPreview />
        <AffiliateApplicationStepsPreview />

        <div className="bg-card px-5 pt-8 sm:pt-10">
          <details
            data-testid="vonix-c64-preparation-details"
            className="mx-auto max-w-5xl rounded-2xl border border-[#e5d5d2] bg-[#fcf7f4]"
          >
            <summary className="min-h-14 cursor-pointer px-5 py-5 text-sm font-semibold text-[#603746] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#744452] sm:px-8">
              O que preciso para me candidatar? Nome, contato, endere?o e Instagram. TikTok ?
              opcional.
            </summary>
            <div className="border-t border-[#e5d5d2] px-3 pt-5 sm:px-6">
              <AffiliateApplicationPrep />
            </div>
          </details>
        </div>

        <section
          id="inscricao"
          data-storage-check={backendDiagnostics.storage ? "ok" : "unavailable"}
          data-storage-diagnostic={backendDiagnostics.storageDiagnostic}
          data-network-diagnostic={backendDiagnostics.publicNetworkDiagnostic}
          data-ingress-check={backendDiagnostics.ingress ? "ok" : "unavailable"}
          data-encryption-check={backendDiagnostics.encryption ? "ok" : "unavailable"}
          data-email-provider={backendDiagnostics.emailConfigured ? "configured" : "unavailable"}
          className="mx-auto max-w-5xl scroll-mt-36 px-5 py-14 sm:py-20"
        >
          <div className="mb-10 text-center">
            <p className="text-xs font-bold uppercase tracking-normal text-muted-foreground">
              {recruitment === "open"
                ? "Inscri??es abertas"
                : recruitment === "limited"
                  ? "Programa aberto ? acesso temporariamente limitado"
                  : recruitment === "unavailable"
                    ? "Disponibilidade n?o confirmada"
                    : "Programa de afiliados"}
            </p>
            <h2 className="mt-3 font-display text-4xl sm:text-5xl">
              Sua inscri??o, de um jeito simples.
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              S? precisamos do seu nome completo, e-mail v?lido, telefone, endere?o com CEP e
              n?mero, do seu perfil no Instagram e da quantidade de seguidores. TikTok e seguidores
              no TikTok s?o opcionais. A inscri??o ? gratuita e n?o garante aprova??o. Se sua
              candidatura n?o for selecionada, voc? poder? se inscrever novamente com o mesmo
              Instagram. Guarde o c?digo de acompanhamento.
            </p>
          </div>

          {!showWizard ? (
            <div
              role="status"
              className="mx-auto max-w-2xl rounded-lg border border-border bg-card px-8 py-14 text-center shadow-sm"
            >
              <Sparkles aria-hidden="true" className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-5 font-display text-3xl sm:text-4xl">
                {recruitment === "loading"
                  ? "Verificando inscri??es..."
                  : recruitment === "limited"
                    ? "Limite tempor?rio nesta conex?o"
                    : recruitment === "unavailable"
                      ? "N?o foi poss?vel verificar inscri??es"
                      : "Inscri??es em prepara??o"}
              </h3>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                {recruitment === "loading"
                  ? "Estamos verificando a disponibilidade do cadastro."
                  : recruitment === "limited"
                    ? "O programa de afiliadas continua aberto, mas esta conex?o n?o pode enviar novas candidaturas agora. Aguarde alguns minutos e tente novamente; a pr?via n?o registra inscri??es."
                    : recruitment === "unavailable"
                      ? "N?o conseguimos consultar o status das inscri??es nesta conex?o. Isso n?o significa que o programa esteja fechado. O envio permanece bloqueado at? uma confirma??o do servidor."
                      : "O formul?rio simplificado est? dispon?vel para visualiza??o, mas n?o recebe candidaturas enquanto as inscri??es estiverem fechadas."}
              </p>
              {recruitment === "unavailable" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={verifyAvailabilityAgain}
                  className="mt-6 min-h-12 rounded-lg px-6 py-3 text-sm font-bold"
                >
                  Verificar novamente
                </Button>
              )}
              {recruitment !== "loading" && (
                <Button
                  type="button"
                  onClick={() => {
                    setConfirmPreviewExit(false);
                    setPreview(true);
                  }}
                  className="h-auto whitespace-normal mt-7 inline-flex min-h-12 items-center gap-2 rounded-lg bg-primary px-7 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90"
                >
                  Visualizar formul?rio (pr?via) <ArrowRight className="h-4 w-4" />
                </Button>
              )}
              <div className="mt-5">
                <Link
                  to="/"
                  className="h-auto min-h-11 whitespace-normal text-sm font-semibold underline"
                >
                  Voltar ? loja
                </Link>
              </div>
            </div>
          ) : (
            <>
              {simulationOnly && (
                <p
                  role="status"
                  className="mx-auto mb-5 max-w-3xl rounded-lg border border-border bg-card p-4 text-center text-sm text-muted-foreground"
                >
                  {preview
                    ? "Esta pr?via nunca envia ou armazena candidaturas, mesmo se as inscri??es forem abertas."
                    : recruitment === "loading"
                      ? "Verificando novamente a disponibilidade. Seu rascunho continua nesta aba, mas o envio fica pausado at? uma confirma??o do servidor."
                      : recruitment === "limited"
                        ? "O programa continua aberto, mas esta conex?o est? temporariamente limitada. Seu rascunho permanece na aba; o envio n?o ser? realizado at? o acesso ser restabelecido."
                        : recruitment === "unavailable"
                          ? "N?o foi poss?vel confirmar a disponibilidade. Seu rascunho continua nesta aba, mas o envio fica bloqueado at? uma resposta v?lida do servidor."
                          : "A disponibilidade mudou: este cadastro n?o recebe candidaturas agora. O rascunho permanece nesta aba, mas nenhum envio ser? realizado."}
                </p>
              )}
              {/* A preview must never turn into a live POST because status changed.
                  Switching explicitly to live starts a fresh form, not an old draft. */}
              {!preview && recruitment === "unavailable" && (
                <div className="mx-auto mb-5 max-w-3xl text-center">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={verifyAvailabilityAgain}
                    className="min-h-12 rounded-lg px-6 py-3 text-sm font-bold"
                  >
                    Verificar novamente
                  </Button>
                </div>
              )}
              <AffiliateSimpleForm
                key={preview ? "preview" : "live"}
                preview={simulationOnly}
                onDraftChange={setPreviewHasDraft}
              />
              {preview && (
                <div className="mt-6 text-center">
                  {confirmPreviewExit ? (
                    <div
                      role="group"
                      aria-label="Confirmar sa?da da pr?via"
                      className="mx-auto max-w-xl rounded-lg border border-border bg-card p-6 text-left shadow-sm"
                    >
                      <p className="font-semibold text-muted-foreground">
                        Descartar os dados desta pr?via?
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        O rascunho ainda n?o foi enviado nem armazenado. Para sair, confirme o
                        descarte dos dados digitados.
                      </p>
                      <div className="mt-5 flex flex-wrap gap-3">
                        <Button
                          type="button"
                          className="h-auto whitespace-normal min-h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground"
                          onClick={finishPreviewExit}
                        >
                          {recruitment === "open"
                            ? "Descartar dados e iniciar inscri??o real"
                            : "Descartar dados e fechar pr?via"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-auto whitespace-normal min-h-11 rounded-lg border border-border px-5 text-sm font-semibold text-muted-foreground"
                          onClick={() => setConfirmPreviewExit(false)}
                        >
                          Continuar preenchendo
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button
                      type="button"
                      className="h-auto min-h-11 whitespace-normal text-sm font-semibold underline"
                      onClick={requestPreviewExit}
                    >
                      {recruitment === "open"
                        ? "Iniciar inscri??o real (novo formul?rio)"
                        : "Fechar pr?via"}
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </section>
        <AffiliateNextSteps recruitmentOpen={recruitment === "open" && !preview} />
        <AffiliateLandingDiscovery recruitmentStatus={recruitment} />
        <AffiliateLandingFAQ />
      </div>
    </AffiliateShell>
  );
}
