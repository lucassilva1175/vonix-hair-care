import { useRef, useState } from "react";
import {
  ArrowUpRight,
  ChevronDown,
  Instagram,
  MessageCircleMore,
  PlayCircle,
  X,
} from "lucide-react";
import reviews from "@/data/reviews.json";
import socialCommentsSource from "@/data/comentarios-instagram.json";

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

/** Three different PRODUCT categories already displayed by the Vonix storefront.
 * Links lead to original posts (not permalinks verifying individual comments).
 * A public comment does not establish a purchase or an affiliate relationship.
 */
const selectedSocialCommentKeys = [
  { user: "aleandriele", produto: "SOS Reconstrutor Capilar" },
  { user: "darislainedocuras", produto: "Kit Desmaia Cabelo" },
  { user: "irene__soares", produto: "Perfume Capilar Vonix" },
] as const;
const selectedSocialComments = selectedSocialCommentKeys.flatMap(({ user, produto }) =>
  socialCommentsSource.filter(
    (comment) =>
      comment.user === user &&
      comment.produto === produto &&
      comment.url.startsWith("https://www.instagram.com/"),
  ),
);

export function AffiliateCustomerVoiceTeaser() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [videoOpen, setVideoOpen] = useState(false);
  const [showSocialComments, setShowSocialComments] = useState(false);
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
      className="border-b border-[#e8d9d4] bg-[#f6eeea] px-5 py-3 text-[#543745] sm:py-6"
    >
      <div className="mx-auto grid max-w-5xl min-w-0 grid-cols-[5.5rem_minmax(0,1fr)] items-start gap-4 rounded-2xl border border-[#e3ccc9] bg-[#fffaf7] p-2.5 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-6 sm:px-5 sm:py-4">
        <div className="relative min-w-0">
          <a
            href="#avaliacoes-produtos"
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
              <PlayCircle aria-hidden="true" className="size-6" />
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
              Leia outras experiências do mesmo produto:
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
                  {review.author === "Mariana Andrade"
                    ? "Mariana"
                    : review.author === "Fernanda Assis"
                      ? "Fernanda"
                      : review.author}
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
              <a
                href="#inscricao"
                className="inline-flex min-h-11 items-center gap-1 text-xs font-semibold text-[#774457] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-4"
              >
                Ir à inscrição
                <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
              </a>
            </nav>
            {selectedSocialComments.length === selectedSocialCommentKeys.length && (
              <button
                type="button"
                data-testid="affiliate-c110-social-toggle"
                aria-expanded={showSocialComments}
                aria-controls={showSocialComments ? "affiliate-c110-social-comments" : undefined}
                onClick={() => setShowSocialComments((open) => !open)}
                className="mt-1 inline-flex min-h-11 max-w-full items-center gap-1.5 rounded-lg px-1 py-2 text-left text-xs font-bold text-[#774457] underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#784256]"
              >
                <Instagram aria-hidden="true" className="size-4 shrink-0" />
                {showSocialComments
                  ? "Ocultar comentários nas redes"
                  : "Ver comentários sobre outros 3 produtos"}
                <ChevronDown
                  aria-hidden="true"
                  className={
                    "size-4 shrink-0 transition-transform motion-reduce:transition-none " +
                    (showSocialComments ? "rotate-180" : "")
                  }
                />
              </button>
            )}
          </div>
        </div>
        {showSocialComments &&
          selectedSocialComments.length === selectedSocialCommentKeys.length && (
            <section
              id="affiliate-c110-social-comments"
              aria-label="Comentários em publicações sobre diferentes produtos Vonix"
              data-testid="affiliate-c110-social-panel"
              className="col-span-2 min-w-0 rounded-xl border border-[#e4cace] bg-[#f9f0ed] px-3 py-4 sm:p-5"
            >
              <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[.08em] text-[#88566a]">
                    Outras vozes · Produtos Vonix Hair
                  </p>
                  <h3 className="mt-1 font-display text-lg leading-snug text-[#563443]">
                    Mais comentários públicos sobre o catálogo
                  </h3>
                </div>
                <span className="rounded-full border border-[#dbbac5] bg-white px-3 py-1.5 text-[10px] font-bold text-[#78485d]">
                  3 produtos diferentes
                </span>
              </div>
              <ul
                className="grid min-w-0 gap-2 sm:grid-cols-3"
                data-testid="affiliate-c110-social-list"
              >
                {selectedSocialComments.map((comment) => (
                  <li
                    key={comment.user}
                    data-testid="affiliate-c110-social-card"
                    className="flex min-w-0 flex-col rounded-xl border border-[#e9d8d4] bg-white px-3 py-3"
                  >
                    <p className="text-[10px] font-bold uppercase leading-relaxed text-[#875568]">
                      {comment.produto}
                    </p>
                    <blockquote className="mt-2 flex-1 break-words text-sm font-medium leading-[1.55] text-[#553745]">
                      “{comment.text}”
                    </blockquote>
                    <p className="mt-2 text-xs font-semibold text-[#754558]">
                      {"@" + comment.user}
                    </p>
                    <a
                      href={comment.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={
                        "Abrir publicação relacionada ao comentário de @" +
                        comment.user +
                        " sobre " +
                        comment.produto
                      }
                      className="mt-1 inline-flex min-h-11 items-center gap-1 self-start text-xs font-bold text-[#774457] underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#784256]"
                    >
                      Ver publicação <ArrowUpRight aria-hidden="true" className="size-4" />
                    </a>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[11px] leading-relaxed text-[#806570]">
                Comentários já exibidos na loja Vonix em publicações sobre produtos, inclusive de
                terceiros. Os links apontam para as postagens, não comprovam a autoria de uma compra
                nem participação no programa de afiliadas. Publicações e comentários podem mudar.
              </p>
            </section>
          )}
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
