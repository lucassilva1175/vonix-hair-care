import provas from "@/data/provas-em-video.json";
import reviews from "@/data/reviews.json";

/** Only product-specific videos; other products keep their existing galleries. */
export function productGalleryVideosFor(slug: string) {
  if (!["progressiva-fio-de-luz", "botox-vonix"].includes(slug)) return undefined;
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
