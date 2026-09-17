import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ESTADOS_HEIDECK, TABLA_ROSS_HEIDECK } from "@/content/informe";
import { useProyecto } from "@/hooks/useProyecto";
import { generarInformeHtml } from "@/lib/export/plantilla";
import {
  type ClaveSeccion,
  type IdentificacionProyecto,
  SECCIONES_EXPORTABLES,
  SECCIONES_POR_DEFECTO,
  nombreArchivo,
} from "@/lib/export/reporte";
import { formatCurrency, formatHectares, formatPercent } from "@/lib/format";
import { EXPORT_PROJECT_EVENT } from "@/lib/nav";
import { construirDatosReporte } from "@/lib/proyecto";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Download,
  FileCode2,
  Info,
  Printer,
  RotateCcw,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/** Campo de texto del formulario de identificación. */
function CampoTexto({
  id,
  label,
  value,
  onChange,
  placeholder,
  hint,
  ocid,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  ocid: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={id}
        className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground"
      >
        {label}
      </Label>
      <Input
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="field-inset h-9 rounded-sm text-sm"
        data-ocid={ocid}
      />
      {hint ? (
        <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

/** Campo de texto largo del formulario de identificación. */
function CampoArea({
  id,
  label,
  value,
  onChange,
  placeholder,
  hint,
  ocid,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  ocid: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label
        htmlFor={id}
        className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground"
      >
        {label}
      </Label>
      <Textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={3}
        className="field-inset min-h-[4.5rem] resize-y rounded-sm text-sm"
        data-ocid={ocid}
      />
      {hint ? (
        <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export default function ExportarPage() {
  const { proyecto, publicarIdentificacion, restablecer } = useProyecto();
  const [incluidas, setIncluidas] = useState<ClaveSeccion[]>(
    SECCIONES_POR_DEFECTO,
  );
  const [descargado, setDescargado] = useState(false);
  const descargaTimer = useRef<number | null>(null);

  const identificacion = proyecto.identificacion;

  /**
   * Memoria de cálculo construida con el estado compartido del proyecto: las
   * entradas que el usuario digitó en las calculadoras urbanas y rurales.
   */
  const datos = useMemo(() => construirDatosReporte(proyecto), [proyecto]);

  const html = useMemo(
    () => generarInformeHtml(datos, incluidas),
    [datos, incluidas],
  );

  const archivo = nombreArchivo(identificacion.nombre);

  /** Descarga el informe como archivo HTML autocontenido. */
  const descargar = useCallback(() => {
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = archivo;
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);

    setDescargado(true);
    if (descargaTimer.current !== null) {
      window.clearTimeout(descargaTimer.current);
    }
    descargaTimer.current = window.setTimeout(() => setDescargado(false), 5000);
  }, [html, archivo]);

  /** Abre el diálogo de impresión del navegador con el informe. */
  const imprimir = useCallback(() => {
    const ventana = window.open("", "_blank");
    if (!ventana) return;
    ventana.document.write(html);
    ventana.document.close();
    ventana.focus();
    ventana.print();
  }, [html]);

  // El botón del encabezado emite EXPORT_PROJECT_EVENT desde cualquier sección;
  // esta página lo atiende cuando está montada.
  useEffect(() => {
    window.addEventListener(EXPORT_PROJECT_EVENT, descargar);
    return () => window.removeEventListener(EXPORT_PROJECT_EVENT, descargar);
  }, [descargar]);

  useEffect(() => {
    return () => {
      if (descargaTimer.current !== null) {
        window.clearTimeout(descargaTimer.current);
      }
    };
  }, []);

  function alternarSeccion(key: ClaveSeccion, activa: boolean) {
    setIncluidas((actuales) =>
      activa ? [...actuales, key] : actuales.filter((actual) => actual !== key),
    );
  }

  function restablecerTodo() {
    restablecer();
    setIncluidas(SECCIONES_POR_DEFECTO);
  }

  const totalSecciones = incluidas.length;
  const pesoKb = Math.max(1, Math.round(new Blob([html]).size / 1024));

  return (
    <div className="mx-auto w-full max-w-[1400px] animate-fade-rise">
      <header className="border-b-2 border-primary pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="secondary"
            className="rounded-sm font-mono text-[0.6875rem] uppercase tracking-[0.08em]"
          >
            Folio VI
          </Badge>
          <Badge
            variant="outline"
            className="rounded-sm font-mono text-[0.6875rem] uppercase tracking-[0.08em]"
          >
            Informe descargable autocontenido
          </Badge>
        </div>
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Exportar el expediente
        </h1>
        <p className="mt-3 max-w-[75ch] text-base leading-relaxed text-muted-foreground">
          Genere un único archivo HTML con la identificación del proyecto, los
          datos ingresados, las fórmulas aplicadas, los resultados paso a paso y
          la tabla Ross-Heideck completa. El archivo se abre en cualquier
          navegador sin dependencias externas y conserva estilos de impresión
          para papel o PDF.
        </p>
      </header>

      <div className="mt-8 grid gap-8 lg:grid-cols-[24rem_minmax(0,1fr)] xl:gap-10">
        {/* Riel de configuración */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <section
            className="rounded-md border border-border bg-card shadow-subtle"
            data-ocid="exportar.identificacion_panel"
          >
            <div className="border-b border-border px-4 py-3">
              <h2 className="font-display text-sm font-semibold uppercase tracking-[0.08em] text-foreground">
                Identificación del proyecto
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Encabeza el informe exportado y da nombre al archivo.
              </p>
            </div>
            <div className="space-y-4 p-4">
              <CampoTexto
                id="proyecto-nombre"
                label="Nombre del proyecto"
                value={identificacion.nombre}
                onChange={(value) =>
                  publicarIdentificacion({ ...identificacion, nombre: value })
                }
                placeholder="Avalúo comercial — inmueble urbano"
                hint={`Archivo: ${archivo}`}
                ocid="exportar.nombre_input"
              />
              <CampoTexto
                id="proyecto-municipio"
                label="Municipio"
                value={identificacion.municipio}
                onChange={(value) =>
                  publicarIdentificacion({
                    ...identificacion,
                    municipio: value,
                  })
                }
                placeholder="Bogotá D.C."
                ocid="exportar.municipio_input"
              />
              <CampoTexto
                id="proyecto-fecha"
                label="Fecha del informe"
                value={identificacion.fecha}
                onChange={(value) =>
                  publicarIdentificacion({ ...identificacion, fecha: value })
                }
                placeholder="17 de septiembre de 2026"
                ocid="exportar.fecha_input"
              />
              <CampoTexto
                id="proyecto-responsable"
                label="Responsable"
                value={identificacion.responsable}
                onChange={(value) =>
                  publicarIdentificacion({
                    ...identificacion,
                    responsable: value,
                  })
                }
                placeholder="Nombre y matrícula profesional"
                ocid="exportar.responsable_input"
              />
              <CampoArea
                id="proyecto-notas"
                label="Notas"
                value={identificacion.notas}
                onChange={(value) =>
                  publicarIdentificacion({ ...identificacion, notas: value })
                }
                placeholder="Supuestos, alcance y observaciones del avalúo."
                ocid="exportar.notas_input"
              />
              <CampoArea
                id="proyecto-fuentes"
                label="Fuentes consultadas"
                value={identificacion.fuentes}
                onChange={(value) =>
                  publicarIdentificacion({ ...identificacion, fuentes: value })
                }
                placeholder="Ofertas, escrituras, normas y bases consultadas."
                ocid="exportar.fuentes_input"
              />
            </div>
          </section>

          <section
            className="rounded-md border border-border bg-card shadow-subtle"
            data-ocid="exportar.secciones_panel"
          >
            <div className="border-b border-border px-4 py-3">
              <h2 className="font-display text-sm font-semibold uppercase tracking-[0.08em] text-foreground">
                Secciones a incluir
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {totalSecciones} de {SECCIONES_EXPORTABLES.length} secciones
                activas.
              </p>
            </div>
            <ul className="divide-y divide-border">
              {SECCIONES_EXPORTABLES.map((seccion) => {
                const activa = incluidas.includes(seccion.key);
                return (
                  <li key={seccion.key} className="flex gap-3 px-4 py-3">
                    <Checkbox
                      id={`seccion-${seccion.key}`}
                      checked={activa}
                      onCheckedChange={(checked) =>
                        alternarSeccion(seccion.key, checked === true)
                      }
                      className="mt-0.5"
                      data-ocid={`exportar.seccion_checkbox.${seccion.key}`}
                    />
                    <div className="min-w-0">
                      <Label
                        htmlFor={`seccion-${seccion.key}`}
                        className="cursor-pointer font-display text-sm font-semibold text-foreground"
                      >
                        {seccion.label}
                      </Label>
                      <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                        {seccion.description}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-border p-4">
              <Button
                type="button"
                variant="outline"
                onClick={restablecerTodo}
                className="w-full rounded-md"
                data-ocid="exportar.reset_button"
              >
                <RotateCcw className="h-4 w-4" aria-hidden="true" />
                Restablecer valores
              </Button>
            </div>
          </section>

          <section
            className="rounded-md border border-border bg-muted/40 p-4"
            data-ocid="exportar.resumen_panel"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Contenido del archivo
            </p>
            <dl className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Archivo</dt>
                <dd className="min-w-0 truncate font-mono text-foreground">
                  {archivo}
                </dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Secciones</dt>
                <dd className="font-mono text-foreground">{totalSecciones}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Tamaño aproximado</dt>
                <dd className="font-mono text-foreground">{pesoKb} KB</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-muted-foreground">Tabla Ross-Heideck</dt>
                <dd className="font-mono text-foreground">
                  {incluidas.includes("ross-heideck")
                    ? `${TABLA_ROSS_HEIDECK.length} filas`
                    : "excluida"}
                </dd>
              </div>
            </dl>
          </section>
        </aside>

        {/* Columna de vista previa y acciones */}
        <div className="min-w-0 space-y-6">
          <section
            className="result-surface rounded-md p-5 md:p-6"
            data-ocid="exportar.acciones_panel"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Informe listo para exportar
                </p>
                <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground">
                  {identificacion.nombre || "Informe de avalúo"}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {identificacion.municipio || "—"} ·{" "}
                  {identificacion.fecha || "—"} ·{" "}
                  {formatCurrency(datos.urbano.consolidado.valorTotal)} urbano ·{" "}
                  {formatCurrency(datos.rural.resultado.valorTotal)} rural
                </p>
              </div>
              <span
                aria-hidden="true"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-gradient-seal text-accent-foreground shadow-seal"
              >
                <FileCode2 className="h-5 w-5" />
              </span>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={descargar}
                className="rounded-md bg-accent font-semibold text-accent-foreground shadow-seal transition-smooth hover:bg-accent/90"
                data-ocid="exportar.download_button"
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                EXPORTAR PROYECTO
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={imprimir}
                className="rounded-md"
                data-ocid="exportar.print_button"
              >
                <Printer className="h-4 w-4" aria-hidden="true" />
                Imprimir / PDF
              </Button>
            </div>

            {descargado ? (
              <output
                className="mt-4 flex items-center gap-2 rounded-sm border border-success/50 bg-success/10 px-3 py-2.5"
                data-ocid="exportar.success_state"
              >
                <CheckCircle2
                  className="h-4 w-4 shrink-0 text-success"
                  aria-hidden="true"
                />
                <p className="text-sm text-foreground">
                  Archivo <span className="font-mono">{archivo}</span>{" "}
                  descargado. Ábralo en cualquier navegador para consultarlo o
                  guardarlo como PDF.
                </p>
              </output>
            ) : null}

            <div className="mt-4 flex gap-2.5 rounded-sm border border-border bg-muted/40 px-3 py-2.5">
              <Info
                className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                aria-hidden="true"
              />
              <p className="text-xs leading-relaxed text-muted-foreground">
                El botón EXPORTAR PROYECTO del encabezado descarga este mismo
                informe desde cualquier sección del expediente, con los datos
                vigentes del proyecto.
              </p>
            </div>

            {!proyecto.hayDatosUsuario ? (
              <output
                className="mt-4 flex gap-2.5 rounded-sm border border-warning/50 bg-warning/10 px-3 py-2.5"
                data-ocid="exportar.sin_datos_warning"
              >
                <Info
                  className="mt-0.5 h-4 w-4 shrink-0 text-warning"
                  aria-hidden="true"
                />
                <p className="text-xs leading-relaxed text-foreground">
                  Aún no se han ingresado datos en las calculadoras. El informe
                  se generará con los valores de referencia del expediente y así
                  se advierte en el documento exportado.
                </p>
              </output>
            ) : null}
          </section>

          {/* Vista previa del contenido exportado */}
          <section
            aria-labelledby="vista-previa"
            className="rounded-md border border-border bg-card shadow-subtle"
            data-ocid="exportar.preview_panel"
          >
            <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
              <div className="min-w-0">
                <h2
                  id="vista-previa"
                  className="font-display text-sm font-semibold uppercase tracking-[0.08em] text-foreground"
                >
                  Vista previa del contenido
                </h2>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  Resumen de lo que se incluirá en el archivo descargado.
                </p>
              </div>
              <Badge
                variant="secondary"
                className="rounded-sm font-mono text-[0.6875rem] uppercase tracking-[0.08em]"
              >
                {totalSecciones} secciones
              </Badge>
            </header>

            <div className="divide-y divide-border">
              {incluidas.includes("identificacion") ? (
                <article
                  className="px-4 py-4"
                  data-ocid="exportar.preview.identificacion"
                >
                  <h3 className="font-display text-sm font-semibold text-foreground">
                    Identificación del proyecto
                  </h3>
                  <dl className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
                    {[
                      { label: "Proyecto", value: identificacion.nombre },
                      { label: "Municipio", value: identificacion.municipio },
                      { label: "Fecha", value: identificacion.fecha },
                      {
                        label: "Responsable",
                        value: identificacion.responsable,
                      },
                    ].map((item) => (
                      <div key={item.label} className="min-w-0">
                        <dt className="text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                          {item.label}
                        </dt>
                        <dd className="mt-0.5 truncate text-sm text-foreground">
                          {item.value || "—"}
                        </dd>
                      </div>
                    ))}
                  </dl>
                  {identificacion.notas ? (
                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                      {identificacion.notas}
                    </p>
                  ) : null}
                </article>
              ) : null}

              {incluidas.includes("urbano") ? (
                <article
                  className="px-4 py-4"
                  data-ocid="exportar.preview.urbano"
                >
                  <h3 className="font-display text-sm font-semibold text-foreground">
                    Memoria de cálculo urbana
                  </h3>
                  <dl className="mt-3 divide-y divide-border overflow-hidden rounded-sm border border-border">
                    {[
                      {
                        label: "Valor unitario promedio de mercado",
                        value: `${formatCurrency(datos.urbano.mercado.media)}/m²`,
                      },
                      {
                        label: "Coeficiente de variación",
                        value: formatPercent(
                          datos.urbano.mercado.coeficienteVariacion,
                        ),
                      },
                      {
                        label: "Valor por capitalización directa",
                        value: formatCurrency(
                          datos.urbano.capitalizacion.valor,
                        ),
                      },
                      {
                        label: "Valor por flujo de caja descontado",
                        value: formatCurrency(datos.urbano.flujo.valor),
                      },
                      {
                        label: "Valor avisado Ross-Heideck",
                        value: formatCurrency(datos.urbano.ross.valorAvisado),
                      },
                      {
                        label: "Valor residual del terreno",
                        value: formatCurrency(
                          datos.urbano.residual.valorTerreno,
                        ),
                      },
                      {
                        label: "Valor total del avalúo urbano",
                        value: formatCurrency(
                          datos.urbano.consolidado.valorTotal,
                        ),
                        emphasis: true,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={cn(
                          "flex items-baseline justify-between gap-3 px-3 py-2",
                          item.emphasis && "bg-muted/50",
                        )}
                      >
                        <dt className="min-w-0 text-sm text-muted-foreground">
                          {item.label}
                        </dt>
                        <dd
                          className={cn(
                            "shrink-0 font-mono text-sm tabular-nums",
                            item.emphasis
                              ? "font-semibold text-foreground"
                              : "text-foreground/90",
                          )}
                        >
                          {item.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </article>
              ) : null}

              {incluidas.includes("rural") ? (
                <article
                  className="px-4 py-4"
                  data-ocid="exportar.preview.rural"
                >
                  <h3 className="font-display text-sm font-semibold text-foreground">
                    Memoria de cálculo rural
                  </h3>
                  <dl className="mt-3 divide-y divide-border overflow-hidden rounded-sm border border-border">
                    {[
                      {
                        label: "Área total del predio",
                        value: formatHectares(
                          datos.rural.resultado.areaTotalHa,
                        ),
                      },
                      {
                        label: "Ingresos brutos consolidados",
                        value: formatCurrency(
                          datos.rural.resultado.ingresosTotales,
                        ),
                      },
                      {
                        label: "Costos consolidados",
                        value: formatCurrency(
                          datos.rural.resultado.costosTotales,
                        ),
                      },
                      {
                        label: "Renta de la tierra consolidada",
                        value: formatCurrency(
                          datos.rural.resultado.rentaTierraTotal,
                        ),
                      },
                      {
                        label: "Valor total del predio",
                        value: formatCurrency(datos.rural.resultado.valorTotal),
                        emphasis: true,
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className={cn(
                          "flex items-baseline justify-between gap-3 px-3 py-2",
                          item.emphasis && "bg-muted/50",
                        )}
                      >
                        <dt className="min-w-0 text-sm text-muted-foreground">
                          {item.label}
                        </dt>
                        <dd
                          className={cn(
                            "shrink-0 font-mono text-sm tabular-nums",
                            item.emphasis
                              ? "font-semibold text-foreground"
                              : "text-foreground/90",
                          )}
                        >
                          {item.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </article>
              ) : null}

              {incluidas.includes("formulas") ? (
                <article
                  className="px-4 py-4"
                  data-ocid="exportar.preview.formulas"
                >
                  <h3 className="font-display text-sm font-semibold text-foreground">
                    Formulario de referencia
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Fórmulas del anexo técnico con variables, unidades y pasos
                    de sustitución.
                  </p>
                </article>
              ) : null}

              {incluidas.includes("ross-heideck") ? (
                <article
                  className="px-4 py-4"
                  data-ocid="exportar.preview.ross_heideck"
                >
                  <h3 className="font-display text-sm font-semibold text-foreground">
                    Tabla Ross-Heideck completa
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {TABLA_ROSS_HEIDECK.length} filas × {ESTADOS_HEIDECK.length}{" "}
                    estados de conservación, transcritas del anexo sin
                    modificación.
                  </p>
                </article>
              ) : null}

              {incluidas.includes("informe") ? (
                <article
                  className="px-4 py-4"
                  data-ocid="exportar.preview.informe"
                >
                  <h3 className="font-display text-sm font-semibold text-foreground">
                    Resumen normativo
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Síntesis estructurada por títulos y artículos clave de la
                    Resolución IGAC 941 de 2026.
                  </p>
                </article>
              ) : null}

              {totalSecciones === 0 ? (
                <div
                  className="px-6 py-10 text-center"
                  data-ocid="exportar.empty_state"
                >
                  <p className="font-display text-base font-semibold text-foreground">
                    No hay secciones seleccionadas
                  </p>
                  <p className="mx-auto mt-2 max-w-[50ch] text-sm leading-relaxed text-muted-foreground">
                    Active al menos una sección para generar el informe
                    exportable.
                  </p>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
