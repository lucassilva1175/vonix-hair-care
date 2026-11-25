import provas from "@/data/provas-em-video.json";
import sacolinhas from "@/data/sacolinhas.json";

/** Keep the original lead photo and insert the matching gift-bag photo second. */
export function productGalleryImagesFor(slug: string, images: string[]) {
  const existing = images;
  const bag = (sacolinhas as Record<string, string>)[slug];
  if (!bag || !existing.length) return existing;
  return [existing[0]!, bag, ...existing.slice(1).filter((src) => src !== bag)];
}

/** Vídeos de quem usa, só nos produtos que têm (Fio de Luz, shampoo, Botox). Os do kit Banana e Mel ficam de fora. */
const COM_VIDEO = new Set(["progressiva-fio-de-luz", "shampoo-fio-de-luz-anti-residuo", "botox-vonix", "botox-vonix-matizador", "botox-line", "botox-line-matizador"]);
export function productGalleryVideosFor(slug: string) {
  if (!COM_VIDEO.has(slug)) return undefined;
  const list = provas.filter((v) => v.slugs.includes(slug) && !v.slugs.includes("kit-banana-e-mel")).map((v) => ({ id: v.id, src: v.src, poster: v.poster, own: true }));
  return list.length ? list : undefined;
}
