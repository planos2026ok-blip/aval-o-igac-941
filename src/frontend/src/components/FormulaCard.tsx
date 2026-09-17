import { Badge } from "@/components/ui/badge";
import type { Formula } from "@/content/informe";
import { cn } from "@/lib/utils";

interface FormulaCardProps {
  formula: Formula;
  className?: string;
}

/**
 * Tarjeta de fórmula: expresión matemática en monoespaciada sobre superficie
 * hundida, con el significado de cada variable y el orden de reemplazo paso a
 * paso. Es la unidad de la memoria de cálculo del informe.
 */
export function FormulaCard({ formula, className }: FormulaCardProps) {
  return (
    <figure
      className={cn(
        "rounded-md border border-border bg-card shadow-subtle",
        className,
      )}
      data-ocid={`formula.card.${formula.id}`}
    >
      <figcaption className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <span className="font-display text-sm font-semibold text-foreground">
          {formula.name}
        </span>
        <Badge
          variant="secondary"
          className="rounded-sm font-mono text-[0.6875rem] uppercase tracking-[0.08em]"
        >
          Fórmula
        </Badge>
      </figcaption>

      <div className="space-y-4 p-4">
        <div className="rounded-sm border border-border bg-muted/50 px-4 py-3">
          <p className="font-mono text-sm leading-relaxed text-foreground">
            {formula.expression}
          </p>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Variables
          </p>
          <dl className="divide-y divide-border overflow-hidden rounded-sm border border-border">
            {formula.variables.map((variable) => (
              <div
                key={variable.symbol}
                className="grid grid-cols-[minmax(4.5rem,auto)_1fr] gap-x-3 gap-y-0.5 bg-card px-3 py-2 sm:grid-cols-[minmax(6rem,auto)_1fr_minmax(6rem,auto)]"
              >
                <dt className="font-mono text-sm font-medium text-primary">
                  {variable.symbol}
                </dt>
                <dd className="min-w-0 text-sm text-foreground">
                  {variable.meaning}
                </dd>
                <dd className="col-span-2 font-mono text-xs text-muted-foreground sm:col-span-1 sm:text-right">
                  {variable.unit}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Orden de reemplazo
          </p>
          <ol className="space-y-2">
            {formula.steps.map((step, index) => (
              <li
                key={step.expression}
                className="flex gap-3 rounded-sm border border-border bg-muted/30 px-3 py-2"
              >
                <span
                  aria-hidden="true"
                  className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-sm bg-primary font-mono text-[0.6875rem] font-semibold text-primary-foreground"
                >
                  {index + 1}
                </span>
                <div className="min-w-0 space-y-1">
                  <p className="break-words font-mono text-sm text-foreground">
                    {step.expression}
                  </p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {step.detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {formula.note ? (
          <p className="legal-quote rounded-r-sm py-2 pr-3 text-sm text-muted-foreground">
            {formula.note}
          </p>
        ) : null}
      </div>
    </figure>
  );
}
