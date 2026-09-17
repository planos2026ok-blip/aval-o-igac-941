import { cn } from "@/lib/utils";

interface PasoCalculoProps {
  /** Número de orden del paso dentro de la memoria de cálculo. */
  index: number;
  /** Título del paso, en registro técnico. */
  titulo: string;
  /** Fórmula en notación matemática, sin valores sustituidos. */
  formula: string;
  /** Sustitución numérica de la fórmula. */
  sustitucion: string;
  /** Resultado del paso, ya formateado. */
  resultado: string;
  /** Explicación del significado de las variables y de sus unidades. */
  detalle: string;
  /** Referencia normativa o nota de alcance del paso. */
  referencia?: string;
  className?: string;
}

/**
 * Paso de la memoria de cálculo: número de orden, fórmula en notación
 * matemática, sustitución numérica y resultado. Es la unidad que hace
 * reproducible la cifra ante un tercero.
 */
export function PasoCalculo({
  index,
  titulo,
  formula,
  sustitucion,
  resultado,
  detalle,
  referencia,
  className,
}: PasoCalculoProps) {
  return (
    <li
      className={cn("flex gap-3 px-4 py-4 md:px-5", className)}
      data-ocid={`ejemplo.paso.${index}`}
    >
      <span
        aria-hidden="true"
        className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-sm bg-primary font-mono text-xs font-semibold text-primary-foreground"
      >
        {index}
      </span>

      <div className="min-w-0 flex-1 space-y-2.5">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h3 className="font-display text-sm font-semibold tracking-tight text-foreground">
            {titulo}
          </h3>
          {referencia ? (
            <span className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-accent">
              {referencia}
            </span>
          ) : null}
        </div>

        <div className="rounded-sm border border-border bg-muted/50 px-3 py-2">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Fórmula
          </p>
          <p className="mt-1 break-words font-mono text-sm leading-relaxed text-foreground">
            {formula}
          </p>
        </div>

        <div className="rounded-sm border border-border bg-card px-3 py-2">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Sustitución de valores
          </p>
          <p className="mt-1 break-words font-mono text-sm leading-relaxed text-foreground">
            {sustitucion}
          </p>
        </div>

        <p className="font-mono text-sm font-semibold tabular-nums text-primary">
          = {resultado}
        </p>

        <p className="max-w-[75ch] text-sm leading-relaxed text-muted-foreground">
          {detalle}
        </p>
      </div>
    </li>
  );
}
