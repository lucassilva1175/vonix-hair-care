import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import type { RecruitmentStatus } from "@/components/affiliate-editorial-hero";
import { ArrowRight, ChevronDown, Sparkles } from "lucide-react";
import { AffiliateShell } from "@/components/affiliate-shell";
import { getAffiliateRecruitmentStatus } from "@/lib/affiliate-functions";
import { AffiliateSimpleForm } from "@/components/affiliate-simple-form";
import { AffiliateApplicationPrep } from "@/components/affiliate-application-prep";
import { AffiliateApplicationEditorialArt } from "@/components/affiliate-application-editorial-art";
import { AffiliateNextSteps } from "@/components/affiliate-next-steps";
import { AffiliateApplicationStepsPreview } from "@/components/affiliate-application-steps-preview";
import { AffiliateCreatorSpotlight } from "@/components/affiliate-creator-spotlight";
import { AffiliateOfficialEvidenceLinks } from "@/components/affiliate-official-evidence-links";
import { AffiliateCustomerVoiceTeaser } from "@/components/affiliate-customer-voice-teaser";
import { AffiliateProductDiscoveryStrip } from "@/components/affiliate-product-discovery-strip";
import { AffiliateApplicationBridge } from "@/components/affiliate-application-bridge";
import { AffiliateDiscoveryGate } from "@/components/affiliate-discovery-gate";
import { AffiliateMobileApplyBar } from "@/components/affiliate-mobile-apply-bar";
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
      { title: "Afiliadas Vonix Hair | Criação, candidatura e seleção individual" },
      {
        name: "description",
        content:
          "Conheça o programa de afiliadas Vonix Hair: inscrição gratuita, comissão de 8% sobre vendas elegíveis após aprovação, sem estoque próprio e seleção individual, sem garantia de ganhos.",
      },
      { property: "og:title", content: "Seja afiliada Vonix Hair | Inscrição gratuita" },
      {
        property: "og:description",
        content:
          "Crie conteúdo sobre beleza capilar com a Vonix Hair. Inscrição gratuita, sem estoque próprio e comissão de 8% sobre vendas elegíveis após aprovação, sem garantia de ganhos.",
      },
      { name: "twitter:title", content: "Seja afiliada Vonix Hair | Inscrição gratuita" },
      {
        name: "twitter:description",
        content:
          "Crie conteúdo sobre beleza capilar com a Vonix Hair. Inscrição gratuita, sem estoque próprio e comissão de 8% sobre vendas elegíveis após aprovação, sem garantia de ganhos.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Vonix Hair" },
      { property: "og:image", content: SITE_URL + "/affiliate-creators-share.png" },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      {
        property: "og:image:alt",
        content:
          "Programa de afiliadas Vonix Hair: inscrição gratuita e produtos oficiais da marca",
      },
      { name: "twitter:image", content: SITE_URL + "/affiliate-creators-share.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "index,follow" },
    ],
    links: [{ rel: "canonical", href: SITE_URL + "/seja-afiliada" }],
  }),
  component: () => <AffiliateApplicationPage />,
});

// Embedded editorial candidate is only selectable by explicit code in QA, never by URL.
export function AffiliateApplicationPage({ sourceLinked = true }: { sourceLinked?: boolean } = {}) {
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
  // recruitment while somebody is filling it in. Its submission pauses,
  // but the real draft and recovery controls stay available.
  const [liveFormStarted, setLiveFormStarted] = useState(false);

  useEffect(() => {
    let active = true;
    let latestRequest = 0;
    const statusTimeouts = new Set<number>();
    async function refreshStatus() {
      const requestId = ++latestRequest;
      let timeoutId: number | undefined;
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
        } = await Promise.race([
          getAffiliateRecruitmentStatus(),
          new Promise<never>((_, reject) => {
            // GETs can hang on unreliable connections. Never leave applicants
            // in a permanent loading state or assume recruitment is OPEN.
            // Server diagnostics run independently from the storage/intake/quota
            // chain. Keep the conservative 25s client deadline for transport margin.
            timeoutId = window.setTimeout(() => {
              if (timeoutId !== undefined) statusTimeouts.delete(timeoutId);
              reject(new Error("affiliate_status_timeout"));
            }, 25_000);
            statusTimeouts.add(timeoutId);
          }),
        ]);
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
      } finally {
        if (timeoutId !== undefined) {
          window.clearTimeout(timeoutId);
          statusTimeouts.delete(timeoutId);
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
      statusTimeouts.forEach((timeout) => window.clearTimeout(timeout));
      statusTimeouts.clear();
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [retryAvailability]);

  const showWizard = preview || recruitment === "open" || liveFormStarted;
  const simulationOnly = preview || recruitment !== "open";

  function openSafePreview() {
    // Deliberate user action: opening the simulation never authorizes a POST.
    // A live form already paused by the server is itself a safe view. Do not
    // remount it with a preview key and discard an in-progress application.
    if (liveFormStarted && !preview) return;
    setConfirmPreviewExit(false);
    setPreview(true);
  }

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
    <AffiliateShell
      recruitmentStatus={recruitment}
      onSafePreview={openSafePreview}
      showCatalogLink={sourceLinked}
    >
      <div data-testid="vonix-affiliate-editorial" className="bg-background text-foreground">
        <AffiliateLandingOffer
          recruitmentStatus={recruitment}
          placement="intro"
          sourceLinked={sourceLinked}
          onSafePreview={openSafePreview}
        />
        <AffiliateMobileApplyBar recruitmentStatus={recruitment} onSafePreview={openSafePreview} />
        {/* C117: authentic PRODUCT review remains before the single application.
            Optional step-by-step/creator inspiration is available immediately after it. */}
        {sourceLinked ? (
          <AffiliateOfficialEvidenceLinks variant="teaser" />
        ) : (
          <AffiliateCustomerVoiceTeaser
            recruitmentOpen={recruitment === "open"}
            onSafePreview={openSafePreview}
          />
        )}
        <AffiliateApplicationBridge status={recruitment} onSafePreview={openSafePreview} />

        <div className="bg-card px-5 pt-8 sm:pt-10">
          <details
            data-testid="vonix-c64-preparation-details"
            className="group mx-auto max-w-5xl overflow-hidden rounded-2xl border border-[#dec5cb] bg-[#fcf7f4] shadow-[0_8px_28px_rgba(90,45,61,.06)]"
          >
            <summary
              data-testid="affiliate-c119-clarity-summary"
              className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 bg-gradient-to-r from-[#fff8f4] to-[#f7e8eb] px-4 py-3 text-[#603746] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#744452] sm:px-6 [&::-webkit-details-marker]:hidden"
            >
              <span className="min-w-0">
                <span className="block text-[10px] font-bold uppercase tracking-[.09em] text-[#8a5869]">
                  Quem pode apresentar o perfil?
                </span>
                <span className="mt-0.5 block text-sm font-bold leading-snug">
                  Não precisa ter portfólio para se candidatar
                </span>
                <span className="mt-1 block text-[11px] font-medium leading-snug text-[#725662]">
                  18 anos ou mais · Instagram · TikTok opcional
                </span>
              </span>
              <span
                aria-hidden="true"
                className="grid size-9 shrink-0 place-items-center rounded-full border border-[#dec5cb] bg-white text-[#7c465b]"
              >
                <ChevronDown className="size-4 transition-transform duration-200 motion-reduce:transition-none group-open:rotate-180" />
              </span>
            </summary>
            <div className="border-t border-[#e5d5d2] px-3 pt-5 sm:px-6">
              <AffiliateApplicationPrep
                recruitmentOpen={recruitment === "open"}
                onSafePreview={openSafePreview}
              />
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
          className="mx-auto max-w-5xl scroll-mt-36 px-5 py-6 sm:py-14"
        >
          <div
            data-testid="affiliate-c115-form-intro"
            className="mb-4 grid min-w-0 items-stretch gap-3 overflow-hidden rounded-[1.6rem] border border-[#e3ccce] bg-gradient-to-br from-[#fffaf7] via-[#fff4f2] to-[#f7e8e7] p-4 shadow-[0_20px_54px_rgba(78,42,56,.08)] sm:mb-7 sm:p-7 lg:mb-9 lg:grid-cols-[minmax(0,1.25fr)_minmax(15rem,.75fr)] lg:gap-8"
          >
            <div className="min-w-0 text-left">
              <p className="inline-flex min-h-8 items-center rounded-full border border-[#e6c8d1] bg-white/90 px-3 py-1 text-[11px] font-bold uppercase tracking-[.09em] text-[#86566a]">
                {recruitment === "open"
                  ? "Inscrições abertas"
                  : recruitment === "limited"
                    ? "Programa aberto · acesso temporariamente limitado"
                    : recruitment === "unavailable"
                      ? "Disponibilidade não confirmada"
                      : "Programa de afiliados"}
              </p>
              <h2 className="mt-2 max-w-2xl font-display text-[clamp(1.75rem,5vw,3rem)] leading-[1.12] tracking-tight text-[#4c3040] sm:mt-3">
                Sua inscrição, de um jeito simples.
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-[1.6] text-[#725867] sm:mt-3 sm:text-base sm:leading-[1.7]">
                Informe nome, telefone, e-mail válido, endereço e Instagram com número de
                seguidores. TikTok é opcional; a inscrição é gratuita, depende de disponibilidade e
                não garante aprovação. Após um envio confirmado, guarde o código privado exibido na
                tela.
              </p>
              <div
                data-testid="affiliate-c112-form-essentials"
                aria-label="Requisitos principais da candidatura"
                className="mt-4 hidden max-w-3xl flex-wrap items-center gap-2 sm:flex"
              >
                {[
                  "18 anos ou mais",
                  "E-mail válido obrigatório",
                  "Instagram com seguidores",
                  "TikTok opcional",
                ].map((item) => (
                  <span
                    key={item}
                    className="inline-flex min-h-8 items-center rounded-full border border-[#e0c8ce] bg-white/95 px-3 py-1.5 text-[11px] font-semibold text-[#76465a] sm:text-xs"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <p className="mt-3 flex flex-wrap items-center gap-x-2 rounded-xl border border-[#e3c9cf] bg-white/95 px-3 py-1 text-xs text-[#765665] sm:mt-5 sm:px-4 sm:py-2 sm:text-sm">
                Já enviou uma candidatura?{" "}
                <Link
                  to="/consultar-candidatura"
                  data-testid="affiliate-c112-form-status"
                  className="inline-flex min-h-11 items-center font-bold text-[#744256] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
                >
                  Consultar meu status pelo código
                </Link>
              </p>
              <p className="mt-0 flex flex-wrap items-center gap-x-2 text-xs leading-[1.4] text-[#725866] sm:mt-2">
                Quer entender a seleção primeiro?{" "}
                <a
                  href="#candidatura-etapas"
                  data-testid="affiliate-c117-explore-steps"
                  className="inline-flex min-h-11 items-center font-bold text-[#744256] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
                >
                  Ver o passo a passo
                </a>
              </p>
            </div>
            <AffiliateApplicationEditorialArt />
          </div>

          {!showWizard ? (
            <div
              role="status"
              className="mx-auto max-w-2xl rounded-lg border border-border bg-card px-8 py-14 text-center shadow-sm"
            >
              <Sparkles aria-hidden="true" className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-5 font-display text-3xl sm:text-4xl">
                {recruitment === "loading"
                  ? "Verificando inscrições..."
                  : recruitment === "limited"
                    ? "Limite temporário nesta conexão"
                    : recruitment === "unavailable"
                      ? "Não foi possível verificar inscrições"
                      : "Inscrições em preparação"}
              </h3>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                {recruitment === "loading"
                  ? "Estamos verificando a disponibilidade do cadastro. Enquanto isso, você pode explorar a prévia, que nunca envia nem armazena candidaturas."
                  : recruitment === "limited"
                    ? "O programa de afiliadas continua aberto, mas esta conexão não pode enviar novas candidaturas agora. Aguarde alguns minutos e tente novamente; a prévia não registra inscrições."
                    : recruitment === "unavailable"
                      ? "Não conseguimos consultar o status das inscrições nesta conexão. Isso não significa que o programa esteja fechado. O envio permanece bloqueado até uma confirmação do servidor."
                      : "O formulário simplificado está disponível para visualização, mas não recebe candidaturas enquanto as inscrições estiverem fechadas."}
              </p>
              {(recruitment === "unavailable" || recruitment === "limited") && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={verifyAvailabilityAgain}
                  className="mt-6 min-h-12 rounded-lg px-6 py-3 text-sm font-bold"
                >
                  Verificar novamente
                </Button>
              )}
              <Button
                type="button"
                data-testid="affiliate-c122-safe-preview"
                onClick={() => {
                  openSafePreview();
                }}
                className="h-auto whitespace-normal mt-7 inline-flex min-h-12 items-center gap-2 rounded-lg bg-primary px-7 py-3 text-sm font-bold text-primary-foreground hover:bg-primary/90"
              >
                Visualizar formulário (prévia) <ArrowRight className="h-4 w-4" />
              </Button>
              <div className="mt-5">
                <Link
                  to="/"
                  className="h-auto min-h-11 whitespace-normal text-sm font-semibold underline"
                >
                  Voltar à loja
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
                    ? "Esta prévia nunca envia ou armazena candidaturas, mesmo se as inscrições forem abertas."
                    : recruitment === "loading"
                      ? "Verificando novamente a disponibilidade. Seu rascunho continua nesta aba, mas o envio fica pausado até uma confirmação do servidor."
                      : recruitment === "limited"
                        ? "O programa continua aberto, mas esta conexão está temporariamente limitada. Seu rascunho permanece na aba; o envio não será realizado até o acesso ser restabelecido."
                        : recruitment === "unavailable"
                          ? "Não foi possível confirmar a disponibilidade. Seu rascunho continua nesta aba, mas o envio fica bloqueado até uma resposta válida do servidor."
                          : "A disponibilidade mudou: este cadastro não recebe candidaturas agora. O rascunho permanece nesta aba, mas nenhum envio será realizado."}
                </p>
              )}
              {/* A preview must never turn into a live POST because status changed.
                  Switching explicitly to live starts a fresh form, not an old draft. */}
              {!preview && (recruitment === "unavailable" || recruitment === "limited") && (
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
                paused={!preview && recruitment !== "open"}
                onDraftChange={setPreviewHasDraft}
              />
              {preview && (
                <div className="mt-6 text-center">
                  {confirmPreviewExit ? (
                    <div
                      role="group"
                      aria-label="Confirmar saída da prévia"
                      className="mx-auto max-w-xl rounded-lg border border-border bg-card p-6 text-left shadow-sm"
                    >
                      <p className="font-semibold text-muted-foreground">
                        Descartar os dados desta prévia?
                      </p>
                      <p className="mt-2 text-sm text-muted-foreground">
                        O rascunho ainda não foi enviado nem armazenado. Para sair, confirme o
                        descarte dos dados digitados.
                      </p>
                      <div className="mt-5 flex flex-wrap gap-3">
                        <Button
                          type="button"
                          className="h-auto whitespace-normal min-h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground"
                          onClick={finishPreviewExit}
                        >
                          {recruitment === "open"
                            ? "Descartar dados e iniciar inscrição real"
                            : "Descartar dados e fechar prévia"}
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
                        ? "Iniciar inscrição real (novo formulário)"
                        : "Fechar prévia"}
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </section>
        <AffiliateNextSteps recruitmentOpen={recruitment === "open" && !preview} />
        {/* C136: the optional catalog-ideas gallery belongs after the application.
            The hero and real product-review teaser remain BEFORE the form. */}
        <AffiliateProductDiscoveryStrip
          recruitmentOpen={recruitment === "open"}
          onSafePreview={openSafePreview}
        />
        {/* C117: keep editorial exploration AFTER the unique #inscricao form
            and its immediate next-step guidance. Original anchors remain unique. */}
        <AffiliateApplicationStepsPreview />
        <AffiliateCreatorSpotlight
          recruitmentStatus={recruitment}
          onSafePreview={openSafePreview}
        />
        <AffiliateLandingFAQ recruitmentStatus={recruitment} onSafePreview={openSafePreview} />
        <AffiliateLandingOffer
          recruitmentStatus={recruitment}
          placement="details"
          sourceLinked={sourceLinked}
          onSafePreview={openSafePreview}
        />
        <nav
          data-testid="affiliate-c91-explore-paths"
          aria-label="Continue explorando o universo Vonix Hair"
          className="border-y border-[#e8d8d6] bg-[#fbf5f2] px-5 py-7 sm:py-9"
        >
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-5">
            <div className="max-w-xl">
              <p className="text-[11px] font-bold uppercase tracking-[.12em] text-[#845268]">
                Depois de conhecer a candidatura
              </p>
              <h2 className="mt-2 font-display text-2xl leading-tight text-[#533240] sm:text-3xl">
                Explore mais do universo Vonix.
              </h2>
              <p className="mt-2 text-xs leading-[1.65] text-[#755a64]">
                Avaliações são de clientes sobre produtos; vídeos e exemplos de conteúdo são
                materiais editoriais da loja, não relatos de afiliadas aprovadas.
              </p>
            </div>
            <div className="flex min-w-0 flex-wrap gap-2.5">
              {[
                { href: "#avaliacoes-produtos", label: "Avaliações de produtos" },
                { href: "#catalogo-em-video", label: "Vídeos do catálogo" },
                { href: "#perfis", label: "Ideias de conteúdo" },
                ...(sourceLinked
                  ? [{ href: "#planejamento-criativo", label: "Planejamento semanal" }]
                  : []),
              ].map(({ href, label }) => (
                <a
                  key={href}
                  href={href}
                  className="inline-flex min-h-11 items-center rounded-full border border-[#d3b6bd] bg-white px-4 py-2 text-xs font-bold text-[#754353] transition-colors hover:bg-[#f1e4e5] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#754353]"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>
        </nav>
        <AffiliateDiscoveryGate
          recruitmentOpen={recruitment === "open"}
          onSafePreview={openSafePreview}
        >
          <AffiliateLandingDiscovery
            recruitmentStatus={recruitment}
            sourceLinked={sourceLinked}
            onSafePreview={openSafePreview}
          />
        </AffiliateDiscoveryGate>
      </div>
    </AffiliateShell>
  );
}
