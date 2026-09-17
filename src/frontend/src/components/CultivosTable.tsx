import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  type CultivoInput,
  UNIDADES_MEDIDA,
  type UnidadMedida,
} from "@/lib/calc/rural";
import {
  formatCurrency,
  formatHectares,
  formatInputNumber,
  parseNumberInput,
} from "@/lib/format";
import { Plus, Trash2 } from "lucide-react";

/**
 * Fila de cultivo con los textos de entrada sin parsear.
 *
 * Los campos numéricos conservan el texto que el usuario digita —incluida la
 * coma decimal— y solo se convierten a número con `parseNumberInput` al
 * derivar el `CultivoInput` del motor. Así escribir «1,4» produce 1,4 y no 14.
 */
export interface CultivoDraft {
  id: string;
  nombre: string;
  areaTexto: string;
  rendimientoTexto: string;
  unidad: UnidadMedida;
  precioTexto: string;
  costosDirectosTexto: string;
  costosIndirectosTexto: string;
  otrosCostosTexto: string;
}

/** Convierte el borrador de entrada al cultivo numérico del motor. */
export function draftToCultivo(draft: CultivoDraft): CultivoInput {
  return {
    id: draft.id,
    nombre: draft.nombre,
    areaHa: parseNumberInput(draft.areaTexto),
    rendimiento: parseNumberInput(draft.rendimientoTexto),
    unidad: draft.unidad,
    precioUnitario: parseNumberInput(draft.precioTexto),
    costosDirectos: parseNumberInput(draft.costosDirectosTexto),
    costosIndirectos: parseNumberInput(draft.costosIndirectosTexto),
    otrosCostos: parseNumberInput(draft.otrosCostosTexto),
  };
}

/** Precarga un borrador a partir de un cultivo numérico del expediente. */
export function cultivoToDraft(cultivo: CultivoInput): CultivoDraft {
  return {
    id: cultivo.id,
    nombre: cultivo.nombre,
    areaTexto: formatInputNumber(cultivo.areaHa),
    rendimientoTexto: formatInputNumber(cultivo.rendimiento),
    unidad: cultivo.unidad,
    precioTexto: formatInputNumber(cultivo.precioUnitario),
    costosDirectosTexto: formatInputNumber(cultivo.costosDirectos),
    costosIndirectosTexto: formatInputNumber(cultivo.costosIndirectos),
    otrosCostosTexto: formatInputNumber(cultivo.otrosCostos),
  };
}

interface CultivosTableProps {
  cultivos: CultivoDraft[];
  /** Actualiza un campo de texto de un cultivo. */
  onCampoChange: (id: string, campo: keyof CultivoDraft, valor: string) => void;
  /** Agrega una actividad productiva al predio. */
  onAgregar: () => void;
  /** Elimina una actividad productiva del predio. */
  onEliminar: (id: string) => void;
}

/** Campo numérico etiquetado, con fondo hundido y cifras tabulares. */
function CampoNumerico({
  id,
  label,
  value,
  onChange,
  suffix,
  ocid,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (valor: string) => void;
  suffix?: string;
  ocid: string;
}) {
  return (
    <div className="min-w-0">
      <Label
        htmlFor={id}
        className="text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-muted-foreground"
      >
        {label}
      </Label>
      <div className="relative mt-1">
        <Input
          id={id}
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="field-inset h-9 rounded-sm pr-10 font-mono text-sm tabular-nums"
          data-ocid={ocid}
        />
        {suffix ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center font-mono text-[0.6875rem] text-muted-foreground"
          >
            {suffix}
          </span>
        ) : null}
      </div>
    </div>
  );
}

/**
 * Tabla de cultivos y actividades productivas del predio rural.
 * Cada fila es una unidad productiva homogénea con su área, rendimiento,
 * precio y estructura de costos. El valor total se consolida en la página.
 */
export function CultivosTable({
  cultivos,
  onCampoChange,
  onAgregar,
  onEliminar,
}: CultivosTableProps) {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="font-display text-lg font-semibold tracking-tight text-foreground">
            Cultivos y actividades del predio
          </h2>
          <p className="mt-1 max-w-[70ch] text-sm leading-relaxed text-muted-foreground">
            Registre cada unidad productiva homogénea con su área, rendimiento,
            precio de venta y costos por hectárea. El valor del predio se
            consolida sumando el suelo de todas las actividades.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={onAgregar}
          className="rounded-md"
          data-ocid="rural.add_cultivo_button"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Agregar actividad
        </Button>
      </div>

      <div className="space-y-4">
        {cultivos.map((cultivo, index) => {
          const costosTotalesHa =
            (Number.isFinite(parseNumberInput(cultivo.costosDirectosTexto))
              ? parseNumberInput(cultivo.costosDirectosTexto)
              : 0) +
            (Number.isFinite(parseNumberInput(cultivo.costosIndirectosTexto))
              ? parseNumberInput(cultivo.costosIndirectosTexto)
              : 0) +
            (Number.isFinite(parseNumberInput(cultivo.otrosCostosTexto))
              ? parseNumberInput(cultivo.otrosCostosTexto)
              : 0);

          return (
            <article
              key={cultivo.id}
              className="rounded-md border border-border bg-card shadow-subtle"
              data-ocid={`rural.cultivo.card.${index + 1}`}
            >
              <header className="flex flex-wrap items-center gap-3 border-b border-border px-4 py-3">
                <span
                  aria-hidden="true"
                  className="flex size-6 shrink-0 items-center justify-center rounded-sm bg-primary font-mono text-[0.6875rem] font-semibold text-primary-foreground"
                >
                  {index + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <Label
                    htmlFor={`cultivo-nombre-${cultivo.id}`}
                    className="sr-only"
                  >
                    Nombre del cultivo o actividad {index + 1}
                  </Label>
                  <Input
                    id={`cultivo-nombre-${cultivo.id}`}
                    value={cultivo.nombre}
                    onChange={(event) =>
                      onCampoChange(cultivo.id, "nombre", event.target.value)
                    }
                    placeholder="Ej.: Café pergamino seco"
                    className="field-inset h-9 rounded-sm font-display text-sm font-semibold"
                    data-ocid={`rural.cultivo.nombre_input.${index + 1}`}
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => onEliminar(cultivo.id)}
                  disabled={cultivos.length <= 1}
                  aria-label={`Eliminar la actividad ${index + 1}`}
                  className="shrink-0 rounded-md text-muted-foreground hover:text-destructive"
                  data-ocid={`rural.cultivo.delete_button.${index + 1}`}
                >
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                </Button>
              </header>

              <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-4">
                <CampoNumerico
                  id={`cultivo-area-${cultivo.id}`}
                  label="Área"
                  value={cultivo.areaTexto}
                  onChange={(valor) =>
                    onCampoChange(cultivo.id, "areaTexto", valor)
                  }
                  suffix="ha"
                  ocid={`rural.cultivo.area_input.${index + 1}`}
                />
                <CampoNumerico
                  id={`cultivo-rendimiento-${cultivo.id}`}
                  label="Rendimiento"
                  value={cultivo.rendimientoTexto}
                  onChange={(valor) =>
                    onCampoChange(cultivo.id, "rendimientoTexto", valor)
                  }
                  suffix="/ha"
                  ocid={`rural.cultivo.rendimiento_input.${index + 1}`}
                />
                <div className="min-w-0">
                  <Label
                    htmlFor={`cultivo-unidad-${cultivo.id}`}
                    className="text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-muted-foreground"
                  >
                    Unidad de medida
                  </Label>
                  <Select
                    value={cultivo.unidad}
                    onValueChange={(valor) =>
                      onCampoChange(cultivo.id, "unidad", valor)
                    }
                  >
                    <SelectTrigger
                      id={`cultivo-unidad-${cultivo.id}`}
                      className="field-inset mt-1 h-9 rounded-sm text-sm"
                      data-ocid={`rural.cultivo.unidad_select.${index + 1}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIDADES_MEDIDA.map((unidad) => (
                        <SelectItem key={unidad.value} value={unidad.value}>
                          {unidad.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <CampoNumerico
                  id={`cultivo-precio-${cultivo.id}`}
                  label="Precio de venta"
                  value={cultivo.precioTexto}
                  onChange={(valor) =>
                    onCampoChange(cultivo.id, "precioTexto", valor)
                  }
                  suffix="$"
                  ocid={`rural.cultivo.precio_input.${index + 1}`}
                />
                <CampoNumerico
                  id={`cultivo-directos-${cultivo.id}`}
                  label="Costos directos"
                  value={cultivo.costosDirectosTexto}
                  onChange={(valor) =>
                    onCampoChange(cultivo.id, "costosDirectosTexto", valor)
                  }
                  suffix="$/ha"
                  ocid={`rural.cultivo.directos_input.${index + 1}`}
                />
                <CampoNumerico
                  id={`cultivo-indirectos-${cultivo.id}`}
                  label="Costos indirectos"
                  value={cultivo.costosIndirectosTexto}
                  onChange={(valor) =>
                    onCampoChange(cultivo.id, "costosIndirectosTexto", valor)
                  }
                  suffix="$/ha"
                  ocid={`rural.cultivo.indirectos_input.${index + 1}`}
                />
                <CampoNumerico
                  id={`cultivo-otros-${cultivo.id}`}
                  label="Otros costos"
                  value={cultivo.otrosCostosTexto}
                  onChange={(valor) =>
                    onCampoChange(cultivo.id, "otrosCostosTexto", valor)
                  }
                  suffix="$/ha"
                  ocid={`rural.cultivo.otros_input.${index + 1}`}
                />
                <div className="min-w-0">
                  <p className="text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                    Área registrada
                  </p>
                  <p className="mt-1 flex h-9 items-center font-mono text-sm tabular-nums text-foreground">
                    {formatHectares(parseNumberInput(cultivo.areaTexto))}
                  </p>
                </div>
              </div>

              <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-border bg-muted/40 px-4 py-2.5">
                <span className="text-xs text-muted-foreground">
                  Costos totales por hectárea
                </span>
                <span className="font-mono text-sm tabular-nums text-foreground">
                  {formatCurrency(costosTotalesHa)}/ha
                </span>
              </footer>
            </article>
          );
        })}
      </div>
    </div>
  );
}
