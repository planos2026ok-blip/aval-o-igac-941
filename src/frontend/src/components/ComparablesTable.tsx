import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Comparable } from "@/lib/calc/urbano";
import { formatCurrency, formatNumber, parseNumberInput } from "@/lib/format";
import { cn } from "@/lib/utils";
import { Plus, Trash2 } from "lucide-react";

interface ComparablesTableProps {
  comparables: Comparable[];
  /** Valor unitario calculado por comparable, alineado por índice. */
  valoresUnitarios: number[];
  onChange: (id: string, patch: Partial<Comparable>) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  className?: string;
}

/**
 * Registro de comparables del método de mercado. Cada fila captura precio,
 * área y fuente, y muestra el valor unitario derivado VU = precio / área.
 */
export function ComparablesTable({
  comparables,
  valoresUnitarios,
  onChange,
  onAdd,
  onRemove,
  className,
}: ComparablesTableProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="overflow-x-auto rounded-sm border border-border">
        <table
          className="w-full min-w-[42rem] border-collapse text-sm"
          data-ocid="mercado.table"
        >
          <caption className="sr-only">
            Comparables del método de mercado con precio, área, fuente y valor
            unitario calculado.
          </caption>
          <thead>
            <tr>
              <th
                scope="col"
                className="th-tech border-b border-border px-3 py-2 text-left"
              >
                #
              </th>
              <th
                scope="col"
                className="th-tech border-b border-border px-3 py-2 text-left"
              >
                Descripción
              </th>
              <th
                scope="col"
                className="th-tech border-b border-border px-3 py-2 text-right"
              >
                Precio (COP)
              </th>
              <th
                scope="col"
                className="th-tech border-b border-border px-3 py-2 text-right"
              >
                Área (m²)
              </th>
              <th
                scope="col"
                className="th-tech border-b border-border px-3 py-2 text-left"
              >
                Fuente
              </th>
              <th
                scope="col"
                className="th-tech border-b border-border px-3 py-2 text-right"
              >
                VU (COP/m²)
              </th>
              <th
                scope="col"
                className="th-tech border-b border-border px-3 py-2 text-right"
              >
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {comparables.map((comparable, index) => {
              const vu = valoresUnitarios[index];
              return (
                <tr
                  key={comparable.id}
                  className="border-b border-border last:border-b-0"
                  data-ocid={`mercado.row.${index + 1}`}
                >
                  <th
                    scope="row"
                    className="px-3 py-2 text-left font-mono text-xs font-semibold tabular-nums text-muted-foreground"
                  >
                    {index + 1}
                  </th>
                  <td className="px-3 py-2">
                    <Label
                      htmlFor={`comparable-desc-${comparable.id}`}
                      className="sr-only"
                    >
                      Descripción del comparable {index + 1}
                    </Label>
                    <Input
                      id={`comparable-desc-${comparable.id}`}
                      value={comparable.descripcion}
                      onChange={(event) =>
                        onChange(comparable.id, {
                          descripcion: event.target.value,
                        })
                      }
                      placeholder="Calle 45 # 12-30, apto 302"
                      className="field-inset h-8 min-w-[10rem] rounded-sm text-sm"
                      data-ocid={`mercado.input.descripcion.${index + 1}`}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Label
                      htmlFor={`comparable-precio-${comparable.id}`}
                      className="sr-only"
                    >
                      Precio del comparable {index + 1}
                    </Label>
                    <Input
                      id={`comparable-precio-${comparable.id}`}
                      inputMode="decimal"
                      value={comparable.precioTexto}
                      onChange={(event) =>
                        onChange(comparable.id, {
                          precioTexto: event.target.value,
                        })
                      }
                      placeholder="450.000.000"
                      className="field-inset h-8 min-w-[8rem] rounded-sm text-right font-mono text-sm tabular-nums"
                      data-ocid={`mercado.input.precio.${index + 1}`}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Label
                      htmlFor={`comparable-area-${comparable.id}`}
                      className="sr-only"
                    >
                      Área del comparable {index + 1}
                    </Label>
                    <Input
                      id={`comparable-area-${comparable.id}`}
                      inputMode="decimal"
                      value={comparable.areaTexto}
                      onChange={(event) =>
                        onChange(comparable.id, {
                          areaTexto: event.target.value,
                        })
                      }
                      placeholder="85"
                      className="field-inset h-8 min-w-[5rem] rounded-sm text-right font-mono text-sm tabular-nums"
                      data-ocid={`mercado.input.area.${index + 1}`}
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Label
                      htmlFor={`comparable-fuente-${comparable.id}`}
                      className="sr-only"
                    >
                      Fuente del comparable {index + 1}
                    </Label>
                    <Input
                      id={`comparable-fuente-${comparable.id}`}
                      value={comparable.fuente}
                      onChange={(event) =>
                        onChange(comparable.id, { fuente: event.target.value })
                      }
                      placeholder="Fincaraíz, oferta 2026-03"
                      className="field-inset h-8 min-w-[9rem] rounded-sm text-sm"
                      data-ocid={`mercado.input.fuente.${index + 1}`}
                    />
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-sm tabular-nums text-foreground">
                    {Number.isFinite(vu) ? formatCurrency(vu) : "—"}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemove(comparable.id)}
                      disabled={comparables.length <= 1}
                      aria-label={`Eliminar comparable ${index + 1}`}
                      className="size-8 rounded-sm text-muted-foreground hover:text-destructive"
                      data-ocid={`mercado.delete_button.${index + 1}`}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onAdd}
          className="rounded-md"
          data-ocid="mercado.add_button"
        >
          <Plus className="size-4" aria-hidden="true" />
          Agregar comparable
        </Button>
        <p className="font-mono text-xs text-muted-foreground">
          {comparables.length} comparable
          {comparables.length === 1 ? "" : "s"} registrado
          {comparables.length === 1 ? "" : "s"}
        </p>
      </div>
    </div>
  );
}

interface SemaforoDispersionProps {
  coeficienteVariacion: number;
  limite: number;
  cumple: boolean;
  className?: string;
}

/**
 * Semáforo normativo del coeficiente de variación contra el límite admisible
 * del artículo 10: 7,5 % para inmuebles urbanos.
 */
export function SemaforoDispersion({
  coeficienteVariacion,
  limite,
  cumple,
  className,
}: SemaforoDispersionProps) {
  const valido = Number.isFinite(coeficienteVariacion);
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-sm border px-3 py-2",
        !valido
          ? "border-border bg-muted/40"
          : cumple
            ? "border-success/40 bg-success/10"
            : "border-destructive/40 bg-destructive/10",
        className,
      )}
      data-ocid="mercado.semaforo"
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-2.5 shrink-0 rounded-full",
          !valido
            ? "bg-muted-foreground"
            : cumple
              ? "bg-success"
              : "bg-destructive",
        )}
      />
      <Badge
        variant="outline"
        className={cn(
          "rounded-sm font-mono text-[0.6875rem] uppercase tracking-[0.08em]",
          !valido
            ? "border-border text-muted-foreground"
            : cumple
              ? "border-success/50 text-success"
              : "border-destructive/50 text-destructive",
        )}
      >
        {!valido
          ? "Sin muestra suficiente"
          : cumple
            ? "Dentro del límite"
            : "Supera el límite"}
      </Badge>
      <p className="min-w-0 text-sm text-foreground">
        {valido
          ? `CV = ${formatNumber(coeficienteVariacion)} % frente al límite admisible de ${formatNumber(limite)} %`
          : "Registre al menos dos comparables con precio y área válidos."}
      </p>
    </div>
  );
}

/** Fila de comparable con los textos de entrada sin parsear. */
export interface ComparableDraft {
  id: string;
  descripcion: string;
  precioTexto: string;
  areaTexto: string;
  fuente: string;
}

/** Convierte el borrador de entrada al comparable numérico del motor. */
export function draftToComparable(draft: ComparableDraft): Comparable {
  return {
    id: draft.id,
    descripcion: draft.descripcion,
    precio: parseNumberInput(draft.precioTexto),
    area: parseNumberInput(draft.areaTexto),
    fuente: draft.fuente,
    precioTexto: draft.precioTexto,
    areaTexto: draft.areaTexto,
  };
}
