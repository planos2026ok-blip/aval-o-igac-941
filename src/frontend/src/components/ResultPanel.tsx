import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface ResultPanelProps {
  /** Etiqueta de la cifra principal. */
  label: string;
  /** Cifra principal ya formateada. */
  value: string;
  /** Unidad o nota al pie de la cifra principal. */
  unit?: string;
  /** Fórmula sustituida con los valores ingresados. */
  formula?: string;
  /** Filas de detalle: par etiqueta/valor de los pasos intermedios. */
  rows?: Array<{ label: string; value: string; emphasis?: boolean }>;
  /** Contenido adicional bajo el detalle, por ejemplo una tabla de flujos. */
  children?: ReactNode;
  /** Tono del filete de acento: neutro, conforme o no conforme. */
  tone?: "neutral" | "success" | "destructive";
  className?: string;
  /** Identificador estable para pruebas deterministas. */
  ocid?: string;
}

const TONE_BORDER: Record<NonNullable<ResultPanelProps["tone"]>, string> = {
  neutral: "border-l-primary",
  success: "border-l-success",
  destructive: "border-l-destructive",
};

/**
 * Panel de resultado: una cifra principal de alto contraste, la fórmula
 * sustituida y el desglose de los pasos intermedios. Materializa la exigencia
 * de memoria de cálculo reproducible del informe técnico.
 */
export function ResultPanel({
  label,
  value,
  unit,
  formula,
  rows,
  children,
  tone = "neutral",
  className,
  ocid,
}: ResultPanelProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-border border-l-[3px] bg-card p-4 shadow-subtle",
        TONE_BORDER[tone],
        className,
      )}
      data-ocid={ocid}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-2 break-words font-display text-2xl font-bold tabular-nums tracking-tight text-foreground md:text-3xl">
        {value}
      </p>
      {unit ? (
        <p className="mt-1 font-mono text-xs text-muted-foreground">{unit}</p>
      ) : null}

      {formula ? (
        <div className="mt-4 rounded-sm border border-border bg-muted/50 px-3 py-2">
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Fórmula sustituida
          </p>
          <p className="mt-1 break-words font-mono text-xs leading-relaxed text-foreground">
            {formula}
          </p>
        </div>
      ) : null}

      {rows && rows.length > 0 ? (
        <dl className="mt-4 divide-y divide-border overflow-hidden rounded-sm border border-border">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-baseline justify-between gap-3 bg-card px-3 py-2"
            >
              <dt className="min-w-0 text-sm text-muted-foreground">
                {row.label}
              </dt>
              <dd
                className={cn(
                  "shrink-0 font-mono text-sm tabular-nums",
                  row.emphasis
                    ? "font-semibold text-foreground"
                    : "text-foreground/90",
                )}
              >
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}

      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}
