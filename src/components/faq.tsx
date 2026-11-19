import { ChevronDown } from "lucide-react";
import type { FaqItem } from "@/lib/faq";

/** Perguntas frequentes em sanfona (details/summary: funciona sem JavaScript e no celular). */
export function FaqSection({ items, title = "Dúvidas frequentes", testId = "faq", nested = false }: { items: FaqItem[]; title?: string; testId?: string; nested?: boolean }) {
  return (
    <section className={nested ? "mt-16" : "container-site mt-16"} data-testid={testId} aria-label={title}>
      <h2 className="mb-6">{title}</h2>
      <div className="divide-y divide-border rounded-2xl border border-border bg-card">
        {items.map((it) => (
          <details key={it.q} className="group px-4 py-1 md:px-6">
            <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 text-name font-semibold [&::-webkit-details-marker]:hidden">
              {it.q}
              <ChevronDown aria-hidden="true" className="h-5 w-5 shrink-0 transition-transform group-open:rotate-180" />
            </summary>
            <p className="pb-4 text-body leading-relaxed text-muted-foreground">{it.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
