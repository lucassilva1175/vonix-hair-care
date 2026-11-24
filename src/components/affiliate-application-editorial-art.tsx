import { CheckCircle2, ShieldCheck } from "lucide-react";

/**
 * Editorial credibility alongside the existing application introduction.
 * An official store PRODUCT photo, not an applicant portrait, an endorsed
 * creator or a promise that a product is provided to candidates.
 *
 * Hidden at small viewports so the actual application stays the priority.
 */
export function AffiliateApplicationEditorialArt() {
  return (
    <figure
      data-testid="affiliate-c115-form-editorial-art"
      className="relative isolate hidden min-h-[19rem] min-w-0 flex-col justify-between overflow-hidden rounded-[1.3rem] border border-[#e7cdd0] bg-gradient-to-br from-[#f3dddf] via-[#faeee8] to-[#eddae0] p-5 lg:flex"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-20 -right-16 size-72 rounded-full border-[3rem] border-[#e4c1c8]/40"
      />
      <span className="relative z-10 inline-flex w-fit items-center gap-2 rounded-full border border-[#d8b9c2] bg-white/95 px-3 py-2 text-[10px] font-bold uppercase tracking-[.1em] text-[#754357]">
        <ShieldCheck aria-hidden="true" className="size-4" />
        Catálogo oficial Vonix Hair
      </span>
      <picture className="pointer-events-none absolute inset-x-0 bottom-8 top-12 flex items-center justify-center">
        <source srcSet="/images/products/kit-cronograma-capilar.webp" type="image/webp" />
        <img
          data-testid="affiliate-c115-form-product-photo"
          src="/images/products/kit-cronograma-capilar.jpg"
          alt="Kit Cronograma Capilar do catálogo oficial Vonix Hair, foto de produto"
          width={640}
          height={640}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain px-9 py-4 drop-shadow-[0_16px_22px_rgba(73,41,53,.17)]"
        />
      </picture>
      <figcaption className="relative z-10 mt-auto rounded-2xl border border-white/80 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
        <span className="flex items-center gap-2 text-xs font-bold text-[#674056]">
          <CheckCircle2 aria-hidden="true" className="size-4 shrink-0" />A candidatura é gratuita
        </span>
        <span className="mt-1.5 block text-[11px] leading-[1.6] text-[#755866]">
          Foto de produto à venda na loja, não de afiliada participante. A seleção é individual e
          não garante aprovação, kits ou remuneração.
        </span>
      </figcaption>
    </figure>
  );
}
