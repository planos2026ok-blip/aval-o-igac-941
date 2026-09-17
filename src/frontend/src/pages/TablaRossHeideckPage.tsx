import { Badge } from "@/components/ui/badge";
import { ESTADOS_HEIDECK, TABLA_ROSS_HEIDECK } from "@/content/informe";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

/** Formatea el coeficiente K en registro colombiano con cinco decimales. */
function formatCoeficiente(value: number): string {
  return value.toFixed(5).replace(".", ",");
}

/** Fila de la tabla con su porcentaje de vida útil y sus nueve coeficientes. */
interface FilaTabla {
  vida: number;
  coeficientes: number[];
}

export default function TablaRossHeideckPage() {
  const [estadoFiltro, setEstadoFiltro] = useState<string | null>(null);

  const filas = useMemo<FilaTabla[]>(
    () =>
      TABLA_ROSS_HEIDECK.map((row) => {
        const [vida, ...coeficientes] = row;
        return { vida, coeficientes };
      }),
    [],
  );

  const columnaActiva = estadoFiltro
    ? ESTADOS_HEIDECK.findIndex((estado) => estado.key === estadoFiltro)
    : -1;

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-8 md:px-8 md:py-12">
      <header className="mb-8 border-b-2 border-primary pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="secondary"
            className="rounded-sm font-mono text-[0.6875rem] uppercase tracking-[0.08em]"
          >
            Anexo técnico
          </Badge>
          <Badge
            variant="outline"
            className="rounded-sm font-mono text-[0.6875rem] uppercase tracking-[0.08em]"
          >
            {filas.length} filas · {ESTADOS_HEIDECK.length} estados
          </Badge>
        </div>
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Tabla Ross-Heideck de doble entrada
        </h1>
        <p className="mt-3 max-w-[70ch] text-base leading-relaxed text-muted-foreground">
          Coeficiente K de depreciación según el porcentaje de vida útil
          transcurrida y el estado de conservación Heideck. Valores transcritos
          del anexo técnico oficial de la Resolución IGAC 941 de 2026, sin
          modificación. El coeficiente se aplica en la expresión VA = Vn × (1 −
          K).
        </p>
      </header>

      {/* Selector de estado de conservación */}
      <section
        aria-label="Filtro por estado de conservación"
        className="mb-6"
        data-ocid="tabla.filtro"
      >
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Estado de conservación Heideck
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setEstadoFiltro(null)}
            aria-pressed={estadoFiltro === null}
            className={cn(
              "rounded-sm border px-3 py-1.5 font-mono text-xs transition-smooth",
              estadoFiltro === null
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
            data-ocid="tabla.filtro.todos"
          >
            Todos
          </button>
          {ESTADOS_HEIDECK.map((estado) => {
            const activo = estadoFiltro === estado.key;
            return (
              <button
                key={estado.key}
                type="button"
                onClick={() => setEstadoFiltro(activo ? null : estado.key)}
                aria-pressed={activo}
                className={cn(
                  "rounded-sm border px-3 py-1.5 font-mono text-xs transition-smooth",
                  activo
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
                data-ocid={`tabla.filtro.${estado.key}`}
              >
                {estado.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* Tabla completa */}
      <div className="overflow-hidden rounded-md border border-border bg-card shadow-sheet">
        <div className="max-h-[40rem] overflow-auto">
          <table
            className="w-full border-collapse text-sm"
            data-ocid="tabla.ross_heideck"
          >
            <caption className="sr-only">
              Tabla Ross-Heideck de doble entrada: coeficiente K de depreciación
              por porcentaje de vida útil transcurrida y estado de conservación
              Heideck.
            </caption>
            <thead className="sticky top-0 z-10">
              <tr>
                <th
                  scope="col"
                  className="th-tech border border-border px-3 py-2 text-left"
                >
                  % vida
                </th>
                {ESTADOS_HEIDECK.map((estado, index) => (
                  <th
                    key={estado.key}
                    scope="col"
                    className={cn(
                      "th-tech border border-border px-3 py-2 text-right",
                      columnaActiva === index && "bg-primary/10 text-primary",
                    )}
                  >
                    {estado.key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filas.map((fila, rowIndex) => (
                <tr
                  key={fila.vida}
                  className={cn(
                    "transition-smooth hover:bg-muted/50",
                    rowIndex % 2 === 1 && "bg-muted/40",
                  )}
                  data-ocid={`tabla.row.${rowIndex + 1}`}
                >
                  <th
                    scope="row"
                    className="border border-border px-3 py-1.5 text-left font-mono text-xs font-semibold tabular-nums text-foreground"
                  >
                    {fila.vida}
                  </th>
                  {fila.coeficientes.map((value, columnIndex) => (
                    <td
                      key={`${fila.vida}-${ESTADOS_HEIDECK[columnIndex].key}`}
                      className={cn(
                        "border border-border px-3 py-1.5 text-right font-mono text-xs tabular-nums text-foreground/90",
                        columnaActiva === columnIndex &&
                          "bg-primary/5 font-semibold text-primary",
                      )}
                    >
                      {formatCoeficiente(value)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Leyenda de estados */}
      <section
        aria-label="Estados de conservación Heideck"
        className="mt-6 rounded-md border border-border bg-muted/40 p-4"
        data-ocid="tabla.leyenda"
      >
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Estados de conservación Heideck
        </p>
        <ul className="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-3">
          {ESTADOS_HEIDECK.map((estado) => (
            <li
              key={estado.key}
              className="font-mono text-xs text-foreground/80"
            >
              {estado.label}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Fuente: Resolución IGAC 941 de 2026 y anexo técnico oficial. La tabla
          se reproduce íntegra y sin modificación, conforme al requisito de
          transcripción del anexo.
        </p>
      </section>
    </div>
  );
}
