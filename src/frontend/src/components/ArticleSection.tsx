import { FormulaCard } from "@/components/FormulaCard";
import type { ArticleBlock } from "@/content/informe";
import { cn } from "@/lib/utils";

interface ArticleSectionProps {
  article: ArticleBlock;
  /** Posición del bloque dentro de la sección, para el índice y el marcador. */
  index: number;
  className?: string;
}

/**
 * Bloque de artículo del informe: encabezado numerado, prosa legal, viñetas
 * normativas, cita destacada y, cuando aplica, la memoria de cálculo con sus
 * fórmulas paso a paso.
 */
export function ArticleSection({
  article,
  index,
  className,
}: ArticleSectionProps) {
  return (
    <article
      id={article.id}
      className={cn("scroll-mt-24", className)}
      data-ocid={`informe.article.${index + 1}`}
    >
      <header className="mb-4">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-mono text-xs font-medium uppercase tracking-[0.14em] text-accent">
            {article.label}
          </span>
          <span
            aria-hidden="true"
            className="hidden h-px flex-1 bg-border sm:block"
          />
        </div>
        <h3 className="mt-2 font-display text-lg font-semibold tracking-tight text-foreground">
          {article.title}
        </h3>
      </header>

      <div className="space-y-4">
        {article.paragraphs.map((paragraph) => (
          <p
            key={paragraph.slice(0, 48)}
            className="max-w-[70ch] text-base leading-relaxed text-foreground/90"
          >
            {paragraph}
          </p>
        ))}

        {article.bullets && article.bullets.length > 0 ? (
          <ul className="space-y-2">
            {article.bullets.map((bullet) => (
              <li
                key={bullet}
                className="flex gap-3 text-base leading-relaxed text-foreground/90"
              >
                <span
                  aria-hidden="true"
                  className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
                />
                <span className="min-w-0 max-w-[70ch]">{bullet}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {article.quote ? (
          <blockquote className="legal-quote max-w-[70ch] rounded-r-sm py-3 pr-4 text-base leading-relaxed text-foreground/80">
            {article.quote}
          </blockquote>
        ) : null}

        {article.formulas && article.formulas.length > 0 ? (
          <div className="space-y-4 pt-2">
            {article.formulas.map((formula) => (
              <FormulaCard key={formula.id} formula={formula} />
            ))}
          </div>
        ) : null}
      </div>
    </article>
  );
}
