import {
  type CultivoDraft,
  CultivosTable,
  cultivoToDraft,
  draftToCultivo,
} from "@/components/CultivosTable";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { consumirCarga, useProyecto } from "@/hooks/useProyecto";
import {
  type ParametrosPredio,
  RANGO_PARTICIPACION,
  RANGO_TASA_CAPITALIZACION,
  calcularPredio,
  pasosCalculoCultivo,
} from "@/lib/calc/rural";
import {
  formatCurrency,
  formatHectares,
  formatInputNumber,
  formatNumber,
  formatPercent,
  parseNumberInput,
} from "@/lib/format";
import {
  CULTIVO_INICIAL,
  type EntradasRurales,
  PARAMETROS_INICIALES,
} from "@/lib/proyecto";
import { cn } from "@/lib/utils";
import { AlertTriangle, Info, RotateCcw, Scale } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

let contadorCultivos = 1;

function nuevoCultivo(): CultivoDraft {
  contadorCultivos += 1;
  return {
    id: `cultivo-${contadorCultivos}`,
    nombre: "",
    areaTexto: "",
    rendimientoTexto: "",
    unidad: "tonelada",
    precioTexto: "",
    costosDirectosTexto: "",
    costosIndirectosTexto: "",
    otrosCostosTexto: "",
  };
}

/** Parámetros del predio tal como los digita el usuario, en texto de formulario. */
interface ParametrosDraft {
  participacionTexto: string;
  tasaTexto: string;
}

/** Campo numérico del riel de parámetros. Conserva el texto digitado. */
function CampoParametro({
  id,
  label,
  value,
  onChange,
  suffix,
  hint,
  ocid,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (valor: string) => void;
  suffix: string;
  hint: string;
  ocid: string;
}) {
  return (
    <div>
      <Label
        htmlFor={id}
        className="text-xs font-medium uppercase tracking-[0.08em] text-muted-foreground"
      >
        {label}
      </Label>
      <div className="relative mt-1.5">
        <Input
          id={id}
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="field-inset h-10 rounded-sm pr-9 font-mono text-sm tabular-nums"
          data-ocid={ocid}
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-3 flex items-center font-mono text-xs text-muted-foreground"
        >
          {suffix}
        </span>
      </div>
      <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
        {hint}
      </p>
    </div>
  );
}

export default function AvaluoRuralPage() {
  const { publicarRurales } = useProyecto();
  // Si la página de ejemplos programó una carga, la calculadora precarga el
  // caso completo (todas las actividades y los parámetros del predio); en caso
  // contrario parte del caso de referencia del expediente. La carga se consume
  // una sola vez, en el inicializador perezoso del primer estado.
  const [cargaInicial] = useState(() => consumirCarga<EntradasRurales>());

  const [cultivosDraft, setCultivosDraft] = useState<CultivoDraft[]>(() => {
    const iniciales = cargaInicial?.cultivos?.length
      ? cargaInicial.cultivos
      : [CULTIVO_INICIAL];
    return iniciales.map(cultivoToDraft);
  });
  const [parametrosDraft, setParametrosDraft] = useState<ParametrosDraft>(
    () => {
      const parametros = cargaInicial?.parametros ?? PARAMETROS_INICIALES;
      return {
        participacionTexto: formatInputNumber(
          parametros.participacionTierraPct,
        ),
        tasaTexto: formatInputNumber(parametros.tasaCapitalizacionPct),
      };
    },
  );

  // Los valores numéricos se derivan del texto digitado con `parseNumberInput`
  // solo al calcular: la coma decimal sobrevive mientras el usuario escribe.
  const cultivos = useMemo(
    () => cultivosDraft.map(draftToCultivo),
    [cultivosDraft],
  );
  const parametros = useMemo<ParametrosPredio>(
    () => ({
      participacionTierraPct: parseNumberInput(
        parametrosDraft.participacionTexto,
      ),
      tasaCapitalizacionPct: parseNumberInput(parametrosDraft.tasaTexto),
    }),
    [parametrosDraft],
  );

  const resultado = useMemo(
    () => calcularPredio(cultivos, parametros),
    [cultivos, parametros],
  );

  // Publica las entradas vigentes en el estado compartido del proyecto para
  // que la exportación del encabezado use los datos realmente ingresados.
  useEffect(() => {
    publicarRurales({ cultivos, parametros });
  }, [publicarRurales, cultivos, parametros]);

  const cultivosValidos = resultado.cultivos.length;
  const hayResultado = cultivosValidos > 0;

  function actualizarCampo(
    id: string,
    campo: keyof CultivoDraft,
    valor: string,
  ) {
    setCultivosDraft((actuales) =>
      actuales.map((cultivo) =>
        cultivo.id === id ? { ...cultivo, [campo]: valor } : cultivo,
      ),
    );
  }

  function agregarCultivo() {
    setCultivosDraft((actuales) => [...actuales, nuevoCultivo()]);
  }

  function eliminarCultivo(id: string) {
    setCultivosDraft((actuales) =>
      actuales.length <= 1
        ? actuales
        : actuales.filter((cultivo) => cultivo.id !== id),
    );
  }

  function restablecer() {
    setCultivosDraft([cultivoToDraft(CULTIVO_INICIAL)]);
    setParametrosDraft({
      participacionTexto: formatInputNumber(
        PARAMETROS_INICIALES.participacionTierraPct,
      ),
      tasaTexto: formatInputNumber(PARAMETROS_INICIALES.tasaCapitalizacionPct),
    });
  }

  const participacionFueraDeRango =
    parametros.participacionTierraPct < RANGO_PARTICIPACION.min ||
    parametros.participacionTierraPct > RANGO_PARTICIPACION.max;
  const tasaFueraDeRango =
    parametros.tasaCapitalizacionPct < RANGO_TASA_CAPITALIZACION.min ||
    parametros.tasaCapitalizacionPct > RANGO_TASA_CAPITALIZACION.max;

  return (
    <div className="mx-auto w-full max-w-[1400px] animate-fade-rise">
      <header className="border-b-2 border-primary pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="secondary"
            className="rounded-sm font-mono text-[0.6875rem] uppercase tracking-[0.08em]"
          >
            Folio IV
          </Badge>
          <Badge
            variant="outline"
            className="rounded-sm font-mono text-[0.6875rem] uppercase tracking-[0.08em]"
          >
            Título VII · Artículos 17 y 18
          </Badge>
        </div>
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Avalúo rural por capitalización de renta
        </h1>
        <p className="mt-3 max-w-[75ch] text-base leading-relaxed text-muted-foreground">
          Calculadora del valor del suelo agropecuario. Se estiman los ingresos
          y costos de cada unidad productiva homogénea, se determina la utilidad
          y se capitaliza la renta atribuible a la tierra a la tasa del uso
          agropecuario. Cada resultado se acompaña de la fórmula sustituida con
          los valores ingresados.
        </p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[22rem_minmax(0,1fr)] xl:gap-10">
        {/* Riel de parámetros */}
        <aside
          className="no-print lg:sticky lg:top-24 lg:self-start"
          data-ocid="rural.parametros_panel"
        >
          <div className="rounded-md border border-border bg-card shadow-subtle">
            <div className="border-b border-border px-4 py-3">
              <h2 className="font-display text-sm font-semibold uppercase tracking-[0.08em] text-foreground">
                Parámetros del predio
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Comunes a todas las actividades productivas.
              </p>
            </div>
            <div className="space-y-5 p-4">
              <CampoParametro
                id="participacion-tierra"
                label="Participación de la tierra"
                value={parametrosDraft.participacionTexto}
                onChange={(valor) =>
                  setParametrosDraft((actuales) => ({
                    ...actuales,
                    participacionTexto: valor,
                  }))
                }
                suffix="%"
                hint={`Fracción de la utilidad que remunera al suelo. Rango técnico esperado: ${RANGO_PARTICIPACION.min} % a ${RANGO_PARTICIPACION.max} %.`}
                ocid="rural.participacion_input"
              />
              <CampoParametro
                id="tasa-capitalizacion"
                label="Tasa de capitalización"
                value={parametrosDraft.tasaTexto}
                onChange={(valor) =>
                  setParametrosDraft((actuales) => ({
                    ...actuales,
                    tasaTexto: valor,
                  }))
                }
                suffix="%"
                hint={`Rendimiento esperado del capital invertido en tierra agropecuaria. Rango técnico esperado: ${RANGO_TASA_CAPITALIZACION.min} % a ${RANGO_TASA_CAPITALIZACION.max} %.`}
                ocid="rural.tasa_input"
              />

              {participacionFueraDeRango || tasaFueraDeRango ? (
                <output
                  className="flex gap-2.5 rounded-sm border border-warning/50 bg-warning/10 px-3 py-2.5"
                  data-ocid="rural.parametros_warning"
                >
                  <AlertTriangle
                    className="mt-0.5 h-4 w-4 shrink-0 text-warning"
                    aria-hidden="true"
                  />
                  <p className="text-xs leading-relaxed text-foreground">
                    {participacionFueraDeRango
                      ? "La participación de la tierra está fuera del rango técnico esperado. "
                      : ""}
                    {tasaFueraDeRango
                      ? "La tasa de capitalización está fuera del rango técnico esperado. "
                      : ""}
                    El cálculo continúa, pero el resultado debe sustentarse en
                    el expediente.
                  </p>
                </output>
              ) : null}

              <Button
                type="button"
                variant="outline"
                onClick={restablecer}
                className="w-full rounded-md"
                data-ocid="rural.reset_button"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Restablecer valores
              </Button>
            </div>
          </div>

          <div className="mt-4 rounded-md border border-border bg-muted/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Unidades del cálculo
            </p>
            <dl className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Rendimiento</dt>
                <dd className="font-mono text-foreground">unidad/ha</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Precio</dt>
                <dd className="font-mono text-foreground">pesos/unidad</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Ingresos y costos</dt>
                <dd className="font-mono text-foreground">pesos/ha</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Valor del suelo</dt>
                <dd className="font-mono text-foreground">pesos/ha</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Área</dt>
                <dd className="font-mono text-foreground">hectáreas</dd>
              </div>
            </dl>
          </div>
        </aside>

        {/* Columna de cálculo */}
        <div className="min-w-0 space-y-10">
          <CultivosTable
            cultivos={cultivosDraft}
            onCampoChange={actualizarCampo}
            onAgregar={agregarCultivo}
            onEliminar={eliminarCultivo}
          />

          {/* Resultado consolidado */}
          <section
            aria-labelledby="resultado-predio"
            className="result-surface rounded-md p-5 md:p-6"
            data-ocid="rural.resultado_panel"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Valor total del predio
                </p>
                <h2 id="resultado-predio" className="sr-only">
                  Resultado consolidado del avalúo rural
                </h2>
                <p
                  className="mt-2 font-display text-4xl font-bold tabular-nums tracking-tight text-foreground md:text-5xl"
                  data-ocid="rural.valor_total"
                >
                  {hayResultado ? formatCurrency(resultado.valorTotal) : "—"}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">
                  {hayResultado
                    ? `${formatHectares(resultado.areaTotalHa)} en ${cultivosValidos} ${
                        cultivosValidos === 1 ? "actividad" : "actividades"
                      } · ${formatCurrency(resultado.valorPromedioHa)}/ha promedio`
                    : "Complete área, rendimiento y precio de al menos una actividad para obtener el avalúo."}
                </p>
              </div>
              <span
                aria-hidden="true"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-gradient-seal text-accent-foreground shadow-seal"
              >
                <Scale className="h-5 w-5" />
              </span>
            </div>

            <div className="mt-6 grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  label: "Ingresos brutos",
                  value: formatCurrency(resultado.ingresosTotales),
                },
                {
                  label: "Costos totales",
                  value: formatCurrency(resultado.costosTotales),
                },
                {
                  label: "Utilidad",
                  value: formatCurrency(resultado.utilidadTotal),
                },
                {
                  label: "Renta de la tierra",
                  value: formatCurrency(resultado.rentaTierraTotal),
                },
              ].map((item) => (
                <div key={item.label} className="bg-card px-4 py-3">
                  <p className="text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                    {item.label}
                  </p>
                  <p className="mt-1 font-mono text-sm font-semibold tabular-nums text-foreground">
                    {hayResultado ? item.value : "—"}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Memoria de cálculo por actividad */}
          {hayResultado ? (
            <section
              aria-labelledby="memoria-calculo"
              className="space-y-6"
              data-ocid="rural.memoria_section"
            >
              <div>
                <h2
                  id="memoria-calculo"
                  className="font-display text-xl font-semibold tracking-tight text-foreground"
                >
                  Memoria de cálculo paso a paso
                </h2>
                <p className="mt-2 max-w-[75ch] text-sm leading-relaxed text-muted-foreground">
                  Cada paso muestra la fórmula con los valores ingresados ya
                  sustituidos, el resultado y el significado de las variables
                  con sus unidades.
                </p>
              </div>

              {resultado.cultivos.map((cultivoResultado, index) => {
                const cultivo = cultivos.find(
                  (item) => item.id === cultivoResultado.id,
                );
                if (!cultivo) return null;
                const pasos = pasosCalculoCultivo(
                  cultivo,
                  parametros,
                  cultivoResultado,
                  {
                    currency: formatCurrency,
                    number: formatNumber,
                    hectares: formatHectares,
                  },
                );
                return (
                  <article
                    key={cultivoResultado.id}
                    className="rounded-md border border-border bg-card shadow-subtle"
                    data-ocid={`rural.memoria.card.${index + 1}`}
                  >
                    <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
                      <div className="min-w-0">
                        <p className="font-display text-sm font-semibold text-foreground">
                          {cultivoResultado.nombre || `Actividad ${index + 1}`}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {formatHectares(cultivoResultado.areaHa)} ·{" "}
                          {formatCurrency(cultivoResultado.valorHa)}/ha
                        </p>
                      </div>
                      <Badge
                        variant="secondary"
                        className="rounded-sm font-mono text-[0.6875rem] uppercase tracking-[0.08em]"
                      >
                        {formatCurrency(cultivoResultado.valorTotal)}
                      </Badge>
                    </header>

                    <ol className="divide-y divide-border">
                      {pasos.map((paso, pasoIndex) => (
                        <li
                          key={paso.titulo}
                          className="flex gap-3 px-4 py-3"
                          data-ocid={`rural.memoria.paso.${index + 1}.${pasoIndex + 1}`}
                        >
                          <span
                            aria-hidden="true"
                            className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-sm bg-primary font-mono text-[0.6875rem] font-semibold text-primary-foreground"
                          >
                            {pasoIndex + 1}
                          </span>
                          <div className="min-w-0 flex-1 space-y-1.5">
                            <p className="font-display text-sm font-semibold text-foreground">
                              {paso.titulo}
                            </p>
                            <p className="break-words rounded-sm border border-border bg-muted/50 px-3 py-2 font-mono text-sm text-foreground">
                              {paso.sustitucion}
                            </p>
                            <p className="font-mono text-sm font-semibold tabular-nums text-primary">
                              = {paso.resultado}
                            </p>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                              {paso.detalle}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  </article>
                );
              })}
            </section>
          ) : (
            <div
              className="rounded-md border border-dashed border-border bg-muted/30 px-6 py-10 text-center"
              data-ocid="rural.empty_state"
            >
              <p className="font-display text-base font-semibold text-foreground">
                Aún no hay una actividad calculable
              </p>
              <p className="mx-auto mt-2 max-w-[50ch] text-sm leading-relaxed text-muted-foreground">
                Ingrese el área en hectáreas, el rendimiento por hectárea y el
                precio de venta unitario de al menos una actividad productiva.
              </p>
            </div>
          )}

          {/* Nota técnica */}
          <section
            aria-labelledby="nota-tecnica"
            className="rounded-md border border-border bg-muted/40 p-5"
            data-ocid="rural.nota_tecnica"
          >
            <div className="flex gap-3">
              <Info
                className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <div className="min-w-0">
                <h2
                  id="nota-tecnica"
                  className="font-display text-sm font-semibold uppercase tracking-[0.08em] text-foreground"
                >
                  Nota técnica
                </h2>
                <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-muted-foreground">
                  <li className="legal-quote rounded-r-sm py-2 pr-3">
                    Los cultivos se valoran como activos biológicos: se
                    considera su ciclo productivo, su estado y su capacidad de
                    generar ingresos futuros. No se trata como un costo del
                    suelo.
                  </li>
                  <li className="legal-quote rounded-r-sm py-2 pr-3">
                    No proceden reducciones automáticas del valor por la sola
                    condición de suelo de protección o preservación. En rondas
                    hídricas debe preservarse el valor del predio conforme a la
                    normativa aplicable.
                  </li>
                  <li className="legal-quote rounded-r-sm py-2 pr-3">
                    La participación de la tierra y la tasa de capitalización
                    deben sustentarse técnicamente en el expediente. Los rangos
                    indicados son referencias de contraste, no límites
                    normativos.
                  </li>
                </ul>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  Fundamento: Resolución IGAC 941 de 2026, Título VII, artículos
                  17 y 18. Participación de la tierra aplicada:{" "}
                  {formatPercent(parametros.participacionTierraPct)}. Tasa de
                  capitalización aplicada:{" "}
                  {formatPercent(parametros.tasaCapitalizacionPct)}.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
