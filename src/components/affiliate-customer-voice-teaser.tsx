import { useRef, useState } from "react";
import { ArrowUpRight, ChevronDown, MessageCircleMore, PlayCircle, X } from "lucide-react";
import reviews from "@/data/reviews.json";
import { AffiliateApplyLink } from "@/components/affiliate-apply-link";

/**
 * Genuine published PRODUCT reviews only. Preserve the author, comment and
 * original photo/video poster together; never imply these people are affiliates,
 * purchases were verified or their income is known.
 */
const reviewedAuthors = ["Mariana Andrade", "Ayla Muniz", "Fernanda Assis", "Ana Paula"] as const;
const productReviews = reviews.filter((review) => review.slug === "botox-vonix");
const selectedReviews = reviewedAuthors.flatMap((author) =>
  productReviews.filter(
    (review) =>
      review.author === author &&
      (review.media.type === "image" ||
        (review.media.type === "video" && typeof review.media.poster === "string")),
  ),
);

export function AffiliateCustomerVoiceTeaser({
  recruitmentOpen = false,
  onSafePreview,
}: { recruitmentOpen?: boolean; onSafePreview?: (() => void) | undefined } = {}) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [videoOpen, setVideoOpen] = useState(false);
  const [mobileProofExpanded, setMobileProofExpanded] = useState(false);
  const videoTriggerRef = useRef<HTMLButtonElement>(null);
  const selected = selectedReviews[selectedIndex] ?? selectedReviews[0];
  if (!selected || selectedReviews.length !== reviewedAuthors.length) return null;

  const imageSrc = selected.media.type === "video" ? selected.media.poster : selected.media.src;
  const imageAlt =
    (selected.media.type === "video"
      ? "Imagem de prévia do vídeo publicado junto à avaliação de "
      : "Foto publicada junto à avaliação de ") +
    selected.author +
    " sobre Botox Vonix";

  return (
    <aside
      data-testid="affiliate-c101-customer-voice"
      aria-labelledby="affiliate-c101-title"
      className="border-b border-[#e8d9d4] bg-[#f6eeea] px-5 py-2.5 text-[#543745] sm:py-6"
    >
      <button
        type="button"
        data-testid="affiliate-c116-mobile-proof-toggle"
        aria-expanded={mobileProofExpanded}
        aria-controls="affiliate-c116-proof-content"
        onClick={() => {
          setMobileProofExpanded((expanded) => !expanded);
          // Closing the panel must unmount a potentially playing video.
          setVideoOpen(false);
          setSelectedIndex(0);
        }}
        className="mx-auto flex min-h-[6.5rem] w-full max-w-5xl items-center gap-3 rounded-[1.15rem] border border-[#d8b9bf] bg-gradient-to-r from-[#fff9f6] to-[#f7e7e9] px-3 py-2.5 text-left shadow-[0_8px_24px_rgba(81,43,56,.08)] transition-colors hover:border-[#b78b99] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#754357] sm:hidden"
      >
        <span
          data-testid="affiliate-c116-mobile-review-poster"
          aria-hidden="true"
          style={{ backgroundImage: `url("${imageSrc}")` }}
          className="block size-[4.5rem] shrink-0 rounded-xl border border-[#e6cfd0] bg-[#f1e2df] bg-contain bg-center bg-no-repeat"
        />
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-bold uppercase tracking-[.08em] text-[#8a5367]">
            Avaliações reais de produtos
          </span>
          <span
            data-testid="affiliate-c121-real-review-quote"
            className="mt-0.5 block line-clamp-2 font-display text-[15px] leading-[1.25] text-[#50313f]"
          >
            “{selected.comment}”
          </span>
          <span
            data-testid="affiliate-c121-review-credit"
            className="mt-1 block truncate text-[10px] font-bold leading-snug text-[#74465b]"
          >
            {selected.author} · cliente
          </span>
          <span className="mt-1 block text-[11px] leading-snug text-[#745464]">
            {mobileProofExpanded
              ? "Recolher comentários e vídeos de clientes"
              : `Ver ${selectedReviews.length} avaliações de produto com fotos e vídeos`}
          </span>
          <span className="mt-1 block text-[10px] leading-snug text-[#825f6d]">
            Opiniões sobre produtos, não relatos de afiliadas
          </span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className={
            "size-5 shrink-0 text-[#764459] transition-transform motion-reduce:transition-none " +
            (mobileProofExpanded ? "rotate-180" : "")
          }
        />
      </button>
      <div
        id="affiliate-c116-proof-content"
        data-testid="affiliate-c116-proof-content"
        className={
          "mx-auto max-w-5xl min-w-0 grid-cols-[5.5rem_minmax(0,1fr)] items-start gap-4 rounded-2xl border border-[#e3ccc9] bg-[#fffaf7] p-2.5 sm:grid sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-6 sm:px-5 sm:py-4 " +
          (mobileProofExpanded ? "mt-3 grid" : "hidden")
        }
      >
        <div className="relative min-w-0">
          <a
            href="#avaliacoes-produtos"
            data-review-author={selected.author}
            aria-label={"Ver avaliação completa de " + selected.author + " sobre Botox Vonix"}
            className="block overflow-hidden rounded-xl bg-[#eadad5] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#80485e]"
          >
            <img
              data-testid="affiliate-c106-review-image"
              src={imageSrc}
              alt={imageAlt}
              width={240}
              height={300}
              loading="lazy"
              decoding="async"
              className="aspect-[3/4] w-full object-contain"
            />
          </a>
          {selected.media.type === "video" && (
            <button
              ref={videoTriggerRef}
              type="button"
              data-testid="affiliate-c107-video-toggle"
              aria-label={
                (videoOpen ? "Fechar" : "Assistir") +
                " vídeo da avaliação de produto de " +
                selected.author
              }
              aria-expanded={videoOpen}
              aria-controls={videoOpen ? "affiliate-c107-video-region" : undefined}
              onClick={() => setVideoOpen((open) => !open)}
              className="absolute bottom-1.5 right-1.5 grid size-11 place-items-center rounded-full border border-[#e5d7d3] bg-[#fffaf7]/95 text-[#754255] shadow-md transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#754255]"
            >
              {videoOpen ? (
                <X aria-hidden="true" className="size-5" />
              ) : (
                <PlayCircle aria-hidden="true" className="size-6" />
              )}
            </button>
          )}
        </div>
        <div id="affiliate-c106-review-panel" className="min-w-0">
          <p className="flex items-center gap-1.5 text-[11px] font-semibold leading-4 text-[#835267]">
            <MessageCircleMore aria-hidden="true" className="size-4 shrink-0" />
            Comentários da loja · Botox Vonix
          </p>
          <h2
            id="affiliate-c101-title"
            className="mt-1 font-display text-lg leading-tight text-[#523241] sm:text-xl"
          >
            Conheça experiências reais com o produto.
          </h2>
          <figure className="mt-1.5">
            <blockquote
              data-testid="affiliate-c106-active-comment"
              aria-live="polite"
              aria-atomic="true"
              className="text-sm font-medium leading-[1.45] text-[#654451]"
            >
              “{selected.comment}”
            </blockquote>
            <figcaption
              data-testid="affiliate-c106-active-author"
              className="mt-1 text-xs font-semibold text-[#805365]"
            >
              {selected.author} · avaliação publicada no catálogo
            </figcaption>
          </figure>
          <p className="mt-2 text-[11px] leading-[1.55] text-[#806570]">
            Avaliações de produto, não depoimentos de afiliadas. Não comprovam compra verificada,
            participação no programa ou ganhos.
          </p>
          <div className="mt-3 min-w-0 border-t border-[#efdfdb] pt-3 sm:pt-4">
            <p className="text-[11px] font-semibold text-[#835267]">
              Explore as quatro avaliações do mesmo produto:
            </p>
            <div
              role="group"
              aria-label="Selecionar avaliações de clientes sobre Botox Vonix"
              data-testid="affiliate-c106-review-choices"
              className="mt-2 grid grid-cols-4 gap-1.5 sm:gap-2"
            >
              {selectedReviews.map((review, index) => (
                <button
                  key={review.author}
                  type="button"
                  aria-label={"Ver avaliação de produto de " + review.author}
                  aria-controls="affiliate-c106-review-panel"
                  aria-pressed={selectedIndex === index}
                  onClick={() => {
                    setVideoOpen(false);
                    setSelectedIndex(index);
                  }}
                  data-testid="affiliate-c106-review-choice"
                  className={
                    "min-h-11 min-w-0 rounded-lg border px-1.5 py-2 text-center text-[11px] font-semibold leading-snug transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#784256] sm:px-3 sm:text-xs " +
                    (selectedIndex === index
                      ? "border-[#754255] bg-[#754255] text-white"
                      : "border-[#d8bcc5] bg-white text-[#774457] hover:bg-[#f4e6e9]")
                  }
                >
                  <span
                    aria-hidden="true"
                    className="mx-auto mb-1.5 block aspect-square w-full max-w-16 rounded-md bg-[#eadad5] bg-contain bg-center bg-no-repeat"
                    style={{
                      backgroundImage: `url("${review.media.type === "video" ? review.media.poster : review.media.src}")`,
                    }}
                  />
                  <span className="block">
                    {review.author === "Mariana Andrade"
                      ? "Mariana"
                      : review.author === "Fernanda Assis"
                        ? "Fernanda"
                        : review.author}
                  </span>
                  <span className="mt-1 block text-[10px] font-medium">
                    {review.media.type === "video" ? "Vídeo" : "Foto"}
                  </span>
                </button>
              ))}
            </div>
            <nav
              aria-label="Ações relacionadas à avaliação de produto"
              className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-0"
            >
              <a
                href="#avaliacoes-produtos"
                className="inline-flex min-h-11 items-center gap-1 text-xs font-bold text-[#774457] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                Ver as {productReviews.length} avaliações completas
                <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
              </a>
              <AffiliateApplyLink
                recruitmentOpen={recruitmentOpen}
                onSafePreview={onSafePreview}
                className="inline-flex min-h-11 items-center gap-1 text-xs font-semibold text-[#774457] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                {recruitmentOpen ? "Ir à inscrição" : "Abrir prévia segura"}
                <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
              </AffiliateApplyLink>
            </nav>
          </div>
        </div>
        {videoOpen && selected.media.type === "video" && (
          <div
            id="affiliate-c107-video-region"
            data-testid="affiliate-c107-video-region"
            className="col-span-2 min-w-0 rounded-xl border border-[#ead5d6] bg-[#f7eeec] px-3 py-3 sm:p-5"
          >
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <p className="max-w-xl text-xs leading-relaxed text-[#654451]">
                Vídeo publicado junto à avaliação de {selected.author} sobre Botox Vonix. É uma
                avaliação de produto, não um depoimento de afiliada.
              </p>
              <button
                type="button"
                onClick={() => {
                  setVideoOpen(false);
                  videoTriggerRef.current?.focus();
                }}
                className="inline-flex min-h-11 items-center gap-1 rounded-lg border border-[#d9c0c4] bg-white px-3 text-xs font-bold text-[#784256] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#784256]"
              >
                <X aria-hidden="true" className="size-4" /> Fechar vídeo
              </button>
            </div>
            <video
              key={selected.media.src}
              data-testid="affiliate-c107-review-video"
              aria-label={"Vídeo publicado com a avaliação de produto de " + selected.author}
              controls
              playsInline
              preload="none"
              poster={selected.media.poster}
              src={selected.media.src}
              className="mx-auto block aspect-video max-h-[65vh] w-full max-w-[42rem] rounded-lg bg-[#2e2028] object-contain"
            >
              Seu navegador não permite reproduzir este vídeo. Veja a avaliação no catálogo.
            </video>
          </div>
        )}
      </div>
    </aside>
  );
}
