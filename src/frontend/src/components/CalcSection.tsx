import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface CalcSectionProps {
  /** Número de orden del bloque dentro de la memoria de cálculo. */
  index: number;
  /** Título del bloque, en registro técnico. */
  title: string;
  /** Referencia normativa o nota de alcance del método. */
  reference?: string;
  /** Descripción breve del método y de sus entradas. */
  description?: string;
  /** Controles de entrada del método. */
  children: ReactNode;
  /** Resultado o desglose del método. */
  result?: ReactNode;
  className?: string;
}

/**
 * Bloque de la memoria de cálculo: encabezado numerado con referencia
 * normativa, rail de entradas y panel de resultado. Es la unidad estructural
 * de la calculadora de avalúo urbano.
 */
export function CalcSection({
  index,
  title,
  reference,
  description,
  children,
  result,
  className,
}: CalcSectionProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-md border border-border bg-card shadow-subtle",
        className,
      )}
      data-ocid={`calc.section.${index}`}
    >
      <header className="border-b border-border bg-muted/40 px-4 py-3 md:px-5">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span
            aria-hidden="true"
            className="flex size-6 shrink-0 items-center justify-center rounded-sm bg-primary font-mono text-xs font-semibold text-primary-foreground"
          >
            {index}
          </span>
          <h2 className="font-display text-base font-semibold tracking-tight text-foreground md:text-lg">
            {title}
          </h2>
          {reference ? (
            <span className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-accent">
              {reference}
            </span>
          ) : null}
        </div>
        {description ? (
          <p className="mt-2 max-w-[70ch] text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </header>

      <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div className="border-b border-border p-4 md:p-5 lg:border-b-0 lg:border-r">
          {children}
        </div>
        <div className="bg-muted/20 p-4 md:p-5">{result}</div>
      </div>
    </section>
  );
}
