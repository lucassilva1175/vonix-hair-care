import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import products from "@/data/products.json";
import raw from "@/data/provas-em-video.json";
import { WHATSAPP_NUMERO } from "@/lib/whatsapp-lead";

type Prova = { id: string; src: string; poster: string; slugs: string[] };
type Item =
  | { tipo: "foto"; id: string; thumb: string; slug: string; nome: string }
  | { tipo: "video"; id: string; src: string; poster: string };

/** Vídeos de quem usa, sem os da criadora com contrato encerrado (Banana e Mel). */
const videos = (raw as Prova[]).filter((v) => !v.slugs.includes("kit-banana-e-mel"));

/**
 * "Quem usa os nossos produtos": todas as fotos de salão dos combos e os vídeos, misturados numa grade só.
 * Foto: toque abre o combo. Vídeo: só baixa e toca quando a pessoa toca nele.
 * O título não afirma que as fotos são de clientes: a seção convida cabeleireiras a mandar a própria foto ou vídeo.
 */
export function QuemUsa({ className = "" }: { className?: string }) {
  const [playing, setPlaying] = useState<string | null>(null);
  const items = useMemo(() => {
    const fotos: Item[] = [];
    for (const p of products as { slug: string; name: string; images: string[] }[]) {
      if (!p.slug.startsWith("combo-")) continue;
      p.images.slice(1).forEach((img, i) => {
        fotos.push({ tipo: "foto", id: `${p.slug}-${i}`, thumb: img.replace(/\.jpg$/, "-480.webp"), slug: p.slug, nome: p.name });
      });
    }
    // Uma foto de cada combo por vez (para os combos não ficarem juntos) e um vídeo a cada 5 itens.
    const porCombo = new Map<string, Item[]>();
    fotos.forEach((f) => porCombo.set((f as { slug: string }).slug, [...(porCombo.get((f as { slug: string }).slug) ?? []), f]));
    const rodadas: Item[] = [];
    for (let r = 0; ; r++) {
      let alguma = false;
      for (const lista of porCombo.values()) if (lista[r]) { rodadas.push(lista[r]!); alguma = true; }
      if (!alguma) break;
    }
    const out: Item[] = [];
    let v = 0;
    rodadas.forEach((f, i) => {
      out.push(f);
      if ((i + 1) % 5 === 0 && v < videos.length) {
        const vid = videos[v++]!;
        out.push({ tipo: "video", id: vid.id, src: vid.src, poster: vid.poster });
      }
    });
    while (v < videos.length) {
      const vid = videos[v++]!;
      out.push({ tipo: "video", id: vid.id, src: vid.src, poster: vid.poster });
    }
    return out;
  }, []);

  return (
    <section aria-label="Fotos e vídeos com a Vonix" data-testid="quem-usa" className={className}>
      <h3 className="mb-2 font-display text-h2">Queremos as suas fotos aqui</h3>
      <p className="mb-4 text-body text-muted-foreground">
        Usa a Vonix no seu salão? Mande a sua foto ou vídeo e apareça aqui. Ao mandar, você autoriza a Vonix a mostrar o material no site e nas redes.
      </p>
      <a
        href={`https://wa.me/${WHATSAPP_NUMERO}?text=${encodeURIComponent("Olá! Uso a Vonix no meu salão e quero mandar a minha foto ou vídeo para aparecer no site. Autorizo a Vonix a mostrar o material.")}`}
        target="_blank"
        rel="noreferrer"
        className="mb-5 inline-flex h-12 items-center justify-center rounded-full bg-foreground px-6 font-medium text-background"
      >
        Enviar minha foto ou vídeo
      </a>
      <ul className="columns-2 gap-2 md:columns-4">
        {items.map((it) => (
          <li key={`${it.tipo}-${it.id}`} className="mb-2 break-inside-avoid">
            {it.tipo === "foto" ? (
              <Link to="/produto/$slug" params={{ slug: it.slug }} className="block overflow-hidden rounded-xl bg-muted">
                <img src={it.thumb} alt={`Cabeleireira com ${it.nome}`} width={480} height={600} loading="lazy" decoding="async" className="aspect-[4/5] w-full object-cover" />
              </Link>
            ) : (
              <div className="relative aspect-[9/16] overflow-hidden rounded-xl bg-black">
                {playing === it.id ? (
                  <video controls autoPlay playsInline poster={it.poster} className="h-full w-full object-cover">
                    <source src={it.src} type="video/mp4" />
                  </video>
                ) : (
                  <button type="button" onClick={() => setPlaying(it.id)} className="block h-full w-full" aria-label="Assistir ao vídeo">
                    <img src={it.poster} alt="" width={360} height={640} loading="lazy" decoding="async" className="h-full w-full object-cover" />
                    <span aria-hidden="true" className="absolute inset-0 grid place-items-center">
                      <span className="grid h-12 w-12 place-items-center rounded-full bg-black/60 text-white">▶</span>
                    </span>
                  </button>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
