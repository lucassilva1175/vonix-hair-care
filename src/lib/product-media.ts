import provas from "@/data/provas-em-video.json";
import reviews from "@/data/reviews.json";
import sacolinhas from "@/data/sacolinhas.json";

/** Keep the original lead photo and insert the matching gift-bag photo second. */
export function productGalleryImagesFor(slug: string, images: string[]) {
  const existing = productGalleryVideosFor(slug) ? images.slice(0, 1) : images;
  const bag = (sacolinhas as Record<string, string>)[slug];
  if (!bag || !existing.length) return existing;
  return [existing[0]!, bag, ...existing.slice(1).filter((src) => src !== bag)];
}

/** Only product-specific videos; other products keep their existing galleries. */
export function productGalleryVideosFor(slug: string) {
  if (!["progressiva-fio-de-luz", "botox-vonix", "kit-banana-e-mel"].includes(slug)) return undefined;
  return [
    ...provas.filter((video) => video.slugs.includes(slug)).map((video) => ({
      id: video.id,
      src: video.src,
      poster: video.poster,
      own: true,
    })),
    ...reviews.filter((review) => review.slug === slug && review.media.type === "video").map((review) => ({
      id: `review:${review.media.src}`,
      src: review.media.src,
      poster: review.media.poster ?? "",
      own: true,
    })),
  ];
}
