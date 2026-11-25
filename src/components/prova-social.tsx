import { Link } from "@tanstack/react-router";
import { ArrowRight, BadgeCheck, Check } from "lucide-react";
import { thumb } from "@/lib/images";
import { provaDe } from "@/lib/prova-social";
import type { Product } from "@/lib/store";

/** Prova social em texto, uma por produto: nome, quantidade, a dor da dona de salão e a solução. Sem vídeo, sem foto crua. */
export function ProvaSocial({ p, compact = false, link = false }: { p: Product; compact?: boolean; link?: boolean }) {
  const v = provaDe(p);
  return (
    <article className="flex h-full flex-col rounded-2xl border border-border bg-white p-4 md:p-5" data-testid="prova-social" aria-label={`Aprovado pelas donas de salão: ${p.name}`}>
      <div className="flex items-center gap-3">
        <img src={thumb(p.images[0]!)} alt="" width={72} height={72} loading="lazy" className="h-[72px] w-[72px] shrink-0 rounded-xl bg-white object-contain" />
        <div className="min-w-0">
          <b className="block text-name font-semibold leading-snug">{v.nome}</b>
          <span className="text-small text-muted-foreground">Quantidade: {v.quantidade}</span>
        </div>
      </div>
      {v.selo && (
        <p className="mt-3 inline-flex w-fit items-center gap-1.5 rounded-full bg-black px-3 py-1 text-small font-semibold text-white">
          <BadgeCheck className="h-4 w-4" aria-hidden="true" /> {v.selo}
          {v.vendidos >= 10 && !v.selo.includes("unidades") ? ` · ${v.vendidos} unidades vendidas` : ""}
        </p>
      )}
      <p className="mt-3 text-body"><b>A dor: </b>{v.dor}</p>
      <p className="mt-2 text-body"><b>A solução: </b>{v.solucao}</p>
      {!compact && (
        <ul className="mt-3 space-y-1.5">
          {v.pontos.map((t) => (
            <li key={t} className="flex gap-2 text-body">
              <Check className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{t}</span>
            </li>
          ))}
        </ul>
      )}
      {link && (
        <Link to="/produto/$slug" params={{ slug: p.slug }} className="mt-4 inline-flex items-center gap-2 pt-1 text-small font-semibold uppercase tracking-wide underline">
          Ver o produto <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      )}
    </article>
  );
}
