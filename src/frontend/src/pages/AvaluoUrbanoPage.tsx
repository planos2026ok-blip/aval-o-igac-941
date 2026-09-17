import { CalcSection } from "@/components/CalcSection";
import {
  ComparablesTable,
  SemaforoDispersion,
  draftToComparable,
} from "@/components/ComparablesTable";
import { ResultPanel } from "@/components/ResultPanel";
import { Badge } from "@/components/ui/badge";
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
import { ESTADOS_HEIDECK } from "@/content/informe";
import { useProyecto } from "@/hooks/useProyecto";
import {
  type Comparable,
  calcularCapitalizacionDirecta,
  calcularFlujoDescontado,
  calcularMercado,
  calcularResidual,
  calcularRossHeideck,
  calcularVidaUtilProlongada,
  consolidarAvaluo,
} from "@/lib/calc/urbano";
import {
  formatArea,
  formatCurrency,
  formatFactor,
  formatNumber,
  formatPercent,
  parseNumberInput,
} from "@/lib/format";
import { obtenerProyecto } from "@/lib/proyecto";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";

/** Campo numérico del rail de cálculo: etiqueta arriba, entrada hundida. */
function CampoNumero({
  id,
  label,
  value,
  onChange,
  placeholder,
  suffix,
  hint,
  ocid,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  suffix?: string;
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
      <div className="relative">
        <Input
          id={id}
          inputMode="decimal"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className={cn(
            "field-inset h-9 rounded-sm font-mono text-sm tabular-nums",
            suffix && "pr-12",
          )}
          data-ocid={ocid}
        />
        {suffix ? (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-3 flex items-center font-mono text-xs text-muted-foreground"
          >
            {suffix}
          </span>
        ) : null}
      </div>
      {hint ? (
        <p className="text-xs leading-relaxed text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

let comparableSeq = 0;
function nuevoComparable(): Comparable {
  comparableSeq += 1;
  return {
    id: `comparable-${comparableSeq}`,
    descripcion: "",
    precio: Number.NaN,
    area: Number.NaN,
    fuente: "",
    precioTexto: "",
    areaTexto: "",
  };
}

export default function AvaluoUrbanoPage() {
  const { publicarUrbanas } = useProyecto();

  // Las entradas iniciales provienen del estado compartido: así el botón
  // «Cargar en la calculadora urbana» de la página de ejemplos precarga el caso
  // completo (comparables, Ross-Heideck y técnica residual).
  const [inicial] = useState(() => obtenerProyecto().urbano);

  // Método de mercado
  const [comparables, setComparables] = useState<Comparable[]>(
    inicial.comparables,
  );

  // Método de renta — capitalización directa
  const [rentaTexto, setRentaTexto] = useState(inicial.rentaTexto);
  const [tasaCapTexto, setTasaCapTexto] = useState(inicial.tasaCapTexto);

  // Método de renta — flujo de caja descontado
  const [fnoTexto, setFnoTexto] = useState(inicial.fnoTexto);
  const [crecimientoTexto, setCrecimientoTexto] = useState(
    inicial.crecimientoTexto,
  );
  const [tasaDescTexto, setTasaDescTexto] = useState(inicial.tasaDescTexto);
  const [aniosTexto, setAniosTexto] = useState(inicial.aniosTexto);
  const [valorTerminalTexto, setValorTerminalTexto] = useState(
    inicial.valorTerminalTexto,
  );

  // Método de costo con Ross-Heideck
  const [areaConstruidaTexto, setAreaConstruidaTexto] = useState(
    inicial.areaConstruidaTexto,
  );
  const [valorNuevoM2Texto, setValorNuevoM2Texto] = useState(
    inicial.valorNuevoM2Texto,
  );
  const [edadTexto, setEdadTexto] = useState(inicial.edadTexto);
  const [vidaUtilTexto, setVidaUtilTexto] = useState(inicial.vidaUtilTexto);
  const [estadoKey, setEstadoKey] = useState(inicial.estadoKey);

  // Vida útil prolongada
  const [vurTexto, setVurTexto] = useState(inicial.vurTexto);
  const [edadVupTexto, setEdadVupTexto] = useState(inicial.edadVupTexto);
  const [ecTexto, setEcTexto] = useState(inicial.ecTexto);

  // Técnica residual
  const [valorVentaTexto, setValorVentaTexto] = useState(
    inicial.valorVentaTexto,
  );
  const [costosDirectosTexto, setCostosDirectosTexto] = useState(
    inicial.costosDirectosTexto,
  );
  const [costosIndirectosTexto, setCostosIndirectosTexto] = useState(
    inicial.costosIndirectosTexto,
  );
  const [costosFinancierosTexto, setCostosFinancierosTexto] = useState(
    inicial.costosFinancierosTexto,
  );
  const [utilidadTexto, setUtilidadTexto] = useState(inicial.utilidadTexto);
  const [cargasTexto, setCargasTexto] = useState(inicial.cargasTexto);

  // Consolidado
  const [origenTerreno, setOrigenTerreno] = useState<"residual" | "manual">(
    inicial.origenTerreno,
  );
  const [terrenoManualTexto, setTerrenoManualTexto] = useState(
    inicial.terrenoManualTexto,
  );
  const [origenConstruccion, setOrigenConstruccion] = useState<
    "ross" | "manual"
  >(inicial.origenConstruccion);
  const [construccionManualTexto, setConstruccionManualTexto] = useState(
    inicial.construccionManualTexto,
  );

  const mercado = useMemo(() => calcularMercado(comparables), [comparables]);

  const capitalizacion = useMemo(
    () =>
      calcularCapitalizacionDirecta(
        parseNumberInput(rentaTexto),
        parseNumberInput(tasaCapTexto) / 100,
      ),
    [rentaTexto, tasaCapTexto],
  );

  const flujo = useMemo(
    () =>
      calcularFlujoDescontado(
        parseNumberInput(fnoTexto),
        parseNumberInput(crecimientoTexto) / 100,
        parseNumberInput(tasaDescTexto) / 100,
        parseNumberInput(aniosTexto),
        parseNumberInput(valorTerminalTexto),
      ),
    [fnoTexto, crecimientoTexto, tasaDescTexto, aniosTexto, valorTerminalTexto],
  );

  const ross = useMemo(
    () =>
      calcularRossHeideck(
        parseNumberInput(areaConstruidaTexto),
        parseNumberInput(valorNuevoM2Texto),
        parseNumberInput(edadTexto),
        parseNumberInput(vidaUtilTexto),
        estadoKey,
      ),
    [
      areaConstruidaTexto,
      valorNuevoM2Texto,
      edadTexto,
      vidaUtilTexto,
      estadoKey,
    ],
  );

  const vup = useMemo(
    () =>
      calcularVidaUtilProlongada(
        parseNumberInput(vurTexto),
        parseNumberInput(edadVupTexto),
        parseNumberInput(ecTexto),
      ),
    [vurTexto, edadVupTexto, ecTexto],
  );

  const residual = useMemo(
    () =>
      calcularResidual(
        parseNumberInput(valorVentaTexto),
        parseNumberInput(costosDirectosTexto),
        parseNumberInput(costosIndirectosTexto),
        parseNumberInput(costosFinancierosTexto),
        parseNumberInput(utilidadTexto),
        parseNumberInput(cargasTexto),
      ),
    [
      valorVentaTexto,
      costosDirectosTexto,
      costosIndirectosTexto,
      costosFinancierosTexto,
      utilidadTexto,
      cargasTexto,
    ],
  );

  const valorTerreno =
    origenTerreno === "residual"
      ? residual.valorTerreno
      : parseNumberInput(terrenoManualTexto);
  const valorConstruccion =
    origenConstruccion === "ross"
      ? ross.valorAvisado
      : parseNumberInput(construccionManualTexto);

  const consolidado = useMemo(
    () =>
      consolidarAvaluo(
        valorTerreno,
        valorConstruccion,
        origenTerreno === "residual"
          ? "Técnica residual (bloque 6)"
          : "Valor de terreno ingresado manualmente",
        origenConstruccion === "ross"
          ? "Ross-Heideck, modelo continuo (bloque 4)"
          : "Valor de construcción ingresado manualmente",
      ),
    [valorTerreno, valorConstruccion, origenTerreno, origenConstruccion],
  );

  const valoresUnitarios = mercado.comparables.map((c) => c.valorUnitario);

  // Publica las entradas vigentes en el estado compartido del proyecto para
  // que la exportación del encabezado use los datos realmente ingresados.
  useEffect(() => {
    publicarUrbanas({
      comparables,
      rentaTexto,
      tasaCapTexto,
      fnoTexto,
      crecimientoTexto,
      tasaDescTexto,
      aniosTexto,
      valorTerminalTexto,
      areaConstruidaTexto,
      valorNuevoM2Texto,
      edadTexto,
      vidaUtilTexto,
      estadoKey,
      vurTexto,
      edadVupTexto,
      ecTexto,
      valorVentaTexto,
      costosDirectosTexto,
      costosIndirectosTexto,
      costosFinancierosTexto,
      utilidadTexto,
      cargasTexto,
      origenTerreno,
      terrenoManualTexto,
      origenConstruccion,
      construccionManualTexto,
    });
  }, [
    publicarUrbanas,
    comparables,
    rentaTexto,
    tasaCapTexto,
    fnoTexto,
    crecimientoTexto,
    tasaDescTexto,
    aniosTexto,
    valorTerminalTexto,
    areaConstruidaTexto,
    valorNuevoM2Texto,
    edadTexto,
    vidaUtilTexto,
    estadoKey,
    vurTexto,
    edadVupTexto,
    ecTexto,
    valorVentaTexto,
    costosDirectosTexto,
    costosIndirectosTexto,
    costosFinancierosTexto,
    utilidadTexto,
    cargasTexto,
    origenTerreno,
    terrenoManualTexto,
    origenConstruccion,
    construccionManualTexto,
  ]);

  function actualizarComparable(id: string, patch: Partial<Comparable>) {
    setComparables((actuales) =>
      actuales.map((comparable) => {
        if (comparable.id !== id) return comparable;
        const siguiente = { ...comparable, ...patch };
        return draftToComparable({
          id: siguiente.id,
          descripcion: siguiente.descripcion,
          precioTexto: siguiente.precioTexto,
          areaTexto: siguiente.areaTexto,
          fuente: siguiente.fuente,
        });
      }),
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1400px] animate-fade-rise">
      <header className="mb-8 border-b-2 border-primary pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="secondary"
            className="rounded-sm font-mono text-[0.6875rem] uppercase tracking-[0.08em]"
          >
            Folio III
          </Badge>
          <Badge
            variant="outline"
            className="rounded-sm font-mono text-[0.6875rem] uppercase tracking-[0.08em]"
          >
            Resolución IGAC 941 de 2026
          </Badge>
        </div>
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Calculadora de avalúo urbano
        </h1>
        <p className="mt-3 max-w-[75ch] text-base leading-relaxed text-muted-foreground">
          Memoria de cálculo de los métodos valuatorios urbanos: mercado, renta
          por capitalización directa y flujo de caja descontado, costo con
          depreciación Ross-Heideck, vida útil prolongada y técnica residual.
          Cada resultado muestra la fórmula sustituida con los valores
          ingresados, de modo que un tercero pueda reproducir la cifra paso a
          paso.
        </p>
      </header>

      <div className="space-y-8">
        {/* 1 — Método de mercado */}
        <CalcSection
          index={1}
          title="Método de mercado"
          reference="Artículo 5 y 10"
          description="Valor unitario de cada comparable (VU = precio / área), media aritmética, desviación estándar y coeficiente de variación contra el límite admisible de 7,5 % para inmuebles urbanos."
          result={
            <div className="space-y-4">
              <ResultPanel
                label="Valor unitario promedio"
                value={formatCurrency(mercado.media)}
                unit="por metro cuadrado"
                formula={mercado.formulaMedia}
                rows={[
                  {
                    label: "Comparables válidos",
                    value: `${mercado.n}`,
                  },
                  {
                    label: "Desviación estándar muestral",
                    value: formatCurrency(mercado.desviacion),
                  },
                  {
                    label: "Coeficiente de variación",
                    value: formatPercent(mercado.coeficienteVariacion),
                    emphasis: true,
                  },
                  {
                    label: "Límite admisible urbano",
                    value: formatPercent(mercado.limite),
                  },
                ]}
                tone={
                  mercado.n > 1
                    ? mercado.cumple
                      ? "success"
                      : "destructive"
                    : "neutral"
                }
                ocid="mercado.result"
              />
              <SemaforoDispersion
                coeficienteVariacion={mercado.coeficienteVariacion}
                limite={mercado.limite}
                cumple={mercado.cumple}
              />
              <div className="rounded-sm border border-border bg-muted/40 px-3 py-2">
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Desviación estándar
                </p>
                <p className="mt-1 break-words font-mono text-xs leading-relaxed text-foreground">
                  {mercado.formulaDesviacion}
                </p>
                <p className="mt-2 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Coeficiente de variación
                </p>
                <p className="mt-1 break-words font-mono text-xs leading-relaxed text-foreground">
                  {mercado.formulaCV}
                </p>
              </div>
            </div>
          }
        >
          <ComparablesTable
            comparables={comparables}
            valoresUnitarios={valoresUnitarios}
            onChange={actualizarComparable}
            onAdd={() =>
              setComparables((actuales) => [...actuales, nuevoComparable()])
            }
            onRemove={(id) =>
              setComparables((actuales) =>
                actuales.filter((comparable) => comparable.id !== id),
              )
            }
          />
        </CalcSection>

        {/* 2 — Capitalización directa */}
        <CalcSection
          index={2}
          title="Método de renta — capitalización directa"
          reference="Artículo 6 y 11"
          description="Convierte la renta neta anual en valor mediante una tasa de capitalización: A = R / i."
          result={
            <ResultPanel
              label="Valor del inmueble"
              value={formatCurrency(capitalizacion.valor)}
              unit="capitalización directa"
              formula={capitalizacion.formula}
              rows={[
                {
                  label: "Renta neta anual (R)",
                  value: formatCurrency(capitalizacion.renta),
                },
                {
                  label: "Tasa de capitalización (i)",
                  value: formatPercent(capitalizacion.tasa * 100),
                },
              ]}
              ocid="capitalizacion.result"
            />
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <CampoNumero
              id="renta-neta"
              label="Renta neta anual (R)"
              value={rentaTexto}
              onChange={setRentaTexto}
              placeholder="54.000.000"
              suffix="COP"
              hint="Ingreso bruto menos los gastos operativos del artículo 12."
              ocid="capitalizacion.input.renta"
            />
            <CampoNumero
              id="tasa-capitalizacion"
              label="Tasa de capitalización (i)"
              value={tasaCapTexto}
              onChange={setTasaCapTexto}
              placeholder="9,5"
              suffix="%"
              hint="Tasa del segmento de mercado, sustentada en el informe."
              ocid="capitalizacion.input.tasa"
            />
          </div>
        </CalcSection>

        {/* 3 — Flujo de caja descontado */}
        <CalcSection
          index={3}
          title="Método de renta — flujo de caja descontado"
          reference="Artículo 6 y 11"
          description="Proyecta los flujos netos de operación con crecimiento anual y los descuenta a valor presente, sumando el valor terminal: V = Σ[FNO_t/(1+i)^t] + VT/(1+i)^T."
          result={
            <div className="space-y-4">
              <ResultPanel
                label="Valor presente del inmueble"
                value={formatCurrency(flujo.valor)}
                unit="flujo de caja descontado"
                formula={flujo.formula}
                rows={[
                  {
                    label: "Suma de flujos descontados",
                    value: formatCurrency(flujo.sumaFlujos),
                  },
                  {
                    label: "Valor terminal descontado",
                    value: formatCurrency(flujo.valorTerminalDescontado),
                  },
                  {
                    label: "Valor presente total",
                    value: formatCurrency(flujo.valor),
                    emphasis: true,
                  },
                ]}
                ocid="flujo.result"
              />
              {flujo.filas.length > 0 ? (
                <div className="overflow-x-auto rounded-sm border border-border">
                  <table
                    className="w-full min-w-[26rem] border-collapse text-sm"
                    data-ocid="flujo.table"
                  >
                    <caption className="sr-only">
                      Flujo neto de operación descontado año por año.
                    </caption>
                    <thead>
                      <tr>
                        <th
                          scope="col"
                          className="th-tech border-b border-border px-3 py-2 text-left"
                        >
                          Año
                        </th>
                        <th
                          scope="col"
                          className="th-tech border-b border-border px-3 py-2 text-right"
                        >
                          FNO
                        </th>
                        <th
                          scope="col"
                          className="th-tech border-b border-border px-3 py-2 text-right"
                        >
                          Factor
                        </th>
                        <th
                          scope="col"
                          className="th-tech border-b border-border px-3 py-2 text-right"
                        >
                          Descontado
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {flujo.filas.map((fila) => (
                        <tr
                          key={fila.anio}
                          className="border-b border-border last:border-b-0"
                          data-ocid={`flujo.row.${fila.anio}`}
                        >
                          <th
                            scope="row"
                            className="px-3 py-1.5 text-left font-mono text-xs font-semibold tabular-nums text-foreground"
                          >
                            {fila.anio}
                          </th>
                          <td className="px-3 py-1.5 text-right font-mono text-xs tabular-nums text-foreground/90">
                            {formatCurrency(fila.fno)}
                          </td>
                          <td className="px-3 py-1.5 text-right font-mono text-xs tabular-nums text-muted-foreground">
                            {formatFactor(fila.factor)}
                          </td>
                          <td className="px-3 py-1.5 text-right font-mono text-xs tabular-nums text-foreground">
                            {formatCurrency(fila.descontado)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <CampoNumero
              id="fno-anio1"
              label="FNO del año 1"
              value={fnoTexto}
              onChange={setFnoTexto}
              placeholder="48.000.000"
              suffix="COP"
              ocid="flujo.input.fno"
            />
            <CampoNumero
              id="crecimiento-anual"
              label="Crecimiento anual"
              value={crecimientoTexto}
              onChange={setCrecimientoTexto}
              placeholder="3,5"
              suffix="%"
              ocid="flujo.input.crecimiento"
            />
            <CampoNumero
              id="tasa-descuento"
              label="Tasa de descuento (i)"
              value={tasaDescTexto}
              onChange={setTasaDescTexto}
              placeholder="11"
              suffix="%"
              ocid="flujo.input.tasa"
            />
            <CampoNumero
              id="anios-proyeccion"
              label="Años proyectados (T)"
              value={aniosTexto}
              onChange={setAniosTexto}
              placeholder="5"
              suffix="años"
              ocid="flujo.input.anios"
            />
            <CampoNumero
              id="valor-terminal"
              label="Valor terminal (VT)"
              value={valorTerminalTexto}
              onChange={setValorTerminalTexto}
              placeholder="620.000.000"
              suffix="COP"
              hint="Capitalizado a la tasa terminal y descontado al año T."
              ocid="flujo.input.terminal"
            />
          </div>
        </CalcSection>

        {/* 4 — Costo con Ross-Heideck */}
        <CalcSection
          index={4}
          title="Método de costo con Ross-Heideck"
          reference="Artículo 7 y 14"
          description="Depreciación por edad D = ½x + ½x², factor de estado E = (100 − depreciación Heideck)/100, factor total FD = 1 − D·E y valor avisado VA = Vn × FD. Se contrasta con la lectura directa del coeficiente K de la tabla."
          result={
            <div className="space-y-4">
              <ResultPanel
                label="Valor avisado de la construcción"
                value={formatCurrency(ross.valorAvisado)}
                unit="modelo continuo Ross-Heideck"
                formula={ross.formulaValor}
                rows={[
                  {
                    label: "Valor a nuevo (Vn)",
                    value: formatCurrency(ross.valorNuevo),
                  },
                  {
                    label: "Relación de edad (x/n)",
                    value: formatFactor(ross.relacionEdad),
                  },
                  {
                    label: "Depreciación por edad (D)",
                    value: formatFactor(ross.depreciacionEdad),
                  },
                  {
                    label: "Factor de estado (E)",
                    value: formatFactor(ross.factorEstado),
                  },
                  {
                    label: "Factor de depreciación (FD)",
                    value: formatFactor(ross.factorDepreciacion),
                    emphasis: true,
                  },
                ]}
                ocid="ross.result"
              />
              <div className="rounded-sm border border-border bg-muted/40 px-3 py-2">
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Sustitución paso a paso
                </p>
                <ul className="mt-2 space-y-1.5">
                  {[
                    ross.formulaRelacion,
                    ross.formulaDepreciacion,
                    ross.formulaEstado,
                    ross.formulaFactor,
                  ].map((paso) => (
                    <li
                      key={paso}
                      className="break-words font-mono text-xs leading-relaxed text-foreground"
                    >
                      {paso}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-sm border border-accent/40 bg-accent/10 px-3 py-2">
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Lectura directa de la tabla
                </p>
                <p className="mt-1 text-sm text-foreground">
                  {ross.estadoLabel} · {formatNumber(ross.porcentajeVida)} % de
                  vida útil · K = {formatFactor(ross.coeficienteK)}
                </p>
                <p className="mt-1 break-words font-mono text-xs leading-relaxed text-foreground">
                  {ross.formulaTabla}
                </p>
              </div>
            </div>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <CampoNumero
              id="area-construida"
              label="Área construida"
              value={areaConstruidaTexto}
              onChange={setAreaConstruidaTexto}
              placeholder="86"
              suffix="m²"
              ocid="ross.input.area"
            />
            <CampoNumero
              id="valor-nuevo-m2"
              label="Valor a nuevo por m²"
              value={valorNuevoM2Texto}
              onChange={setValorNuevoM2Texto}
              placeholder="3.850.000"
              suffix="COP"
              ocid="ross.input.valor_m2"
            />
            <CampoNumero
              id="edad-inmueble"
              label="Edad (x)"
              value={edadTexto}
              onChange={setEdadTexto}
              placeholder="18"
              suffix="años"
              ocid="ross.input.edad"
            />
            <CampoNumero
              id="vida-util"
              label="Vida útil (n)"
              value={vidaUtilTexto}
              onChange={setVidaUtilTexto}
              placeholder="70"
              suffix="años"
              ocid="ross.input.vida_util"
            />
            <div className="space-y-1.5 sm:col-span-2">
              <Label
                htmlFor="estado-heideck"
                className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground"
              >
                Estado de conservación Heideck
              </Label>
              <Select value={estadoKey} onValueChange={setEstadoKey}>
                <SelectTrigger
                  id="estado-heideck"
                  className="field-inset h-9 w-full rounded-sm"
                  data-ocid="ross.select.estado"
                >
                  <SelectValue placeholder="Seleccione el estado" />
                </SelectTrigger>
                <SelectContent>
                  {ESTADOS_HEIDECK.map((estado) => (
                    <SelectItem key={estado.key} value={estado.key}>
                      {estado.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs leading-relaxed text-muted-foreground">
                El estado determina la columna de la tabla Ross-Heideck y el
                factor E del modelo continuo.
              </p>
            </div>
          </div>
        </CalcSection>

        {/* 5 — Vida útil prolongada */}
        <CalcSection
          index={5}
          title="Vida útil prolongada"
          reference="Artículo 15"
          description="Vida remanente VR = VUR / (EC × 2) y vida útil prolongada VUP = edad + VR. Solo procede para estados de conservación entre 2,5 y 4,5 y desde el 90 % de la vida útil."
          result={
            <div className="space-y-4">
              <ResultPanel
                label="Vida útil prolongada (VUP)"
                value={`${formatNumber(vup.vup)} años`}
                unit="vida útil reconocida"
                formula={`${vup.formulaVR};  ${vup.formulaVUP}`}
                rows={[
                  {
                    label: "Vida útil de referencia (VUR)",
                    value: `${formatNumber(vup.vur)} años`,
                  },
                  {
                    label: "Estado de conservación (EC)",
                    value: formatNumber(vup.ec),
                  },
                  {
                    label: "Vida remanente (VR)",
                    value: `${formatNumber(vup.vidaRemanente)} años`,
                  },
                  {
                    label: "Vida útil transcurrida",
                    value: formatPercent(vup.porcentajeVida),
                  },
                ]}
                tone={vup.procede ? "success" : "destructive"}
                ocid="vup.result"
              />
              <div
                className={cn(
                  "flex flex-wrap items-center gap-3 rounded-sm border px-3 py-2",
                  vup.procede
                    ? "border-success/40 bg-success/10"
                    : "border-destructive/40 bg-destructive/10",
                )}
                data-ocid="vup.semaforo"
              >
                <span
                  aria-hidden="true"
                  className={cn(
                    "size-2.5 shrink-0 rounded-full",
                    vup.procede ? "bg-success" : "bg-destructive",
                  )}
                />
                <p className="min-w-0 text-sm text-foreground">
                  {vup.procede
                    ? "Procede reconocer la vida útil prolongada: el estado de conservación es admisible y la vida útil transcurrida alcanza el 90 %."
                    : !vup.ecAdmisible
                      ? "No procede: el estado de conservación debe estar entre 2,5 y 4,5."
                      : "No procede: la vida útil transcurrida aún no alcanza el 90 % de la vida útil de referencia."}
                </p>
              </div>
            </div>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <CampoNumero
              id="vur"
              label="Vida útil de referencia (VUR)"
              value={vurTexto}
              onChange={setVurTexto}
              placeholder="70"
              suffix="años"
              ocid="vup.input.vur"
            />
            <CampoNumero
              id="edad-vup"
              label="Edad del inmueble"
              value={edadVupTexto}
              onChange={setEdadVupTexto}
              placeholder="64"
              suffix="años"
              ocid="vup.input.edad"
            />
            <CampoNumero
              id="ec-vup"
              label="Estado de conservación (EC)"
              value={ecTexto}
              onChange={setEcTexto}
              placeholder="3"
              hint="Admisible únicamente entre 2,5 y 4,5."
              ocid="vup.input.ec"
            />
          </div>
        </CalcSection>

        {/* 6 — Técnica residual */}
        <CalcSection
          index={6}
          title="Técnica residual"
          reference="Artículo 8 y 16"
          description="Valor residual del terreno por diferencia entre el valor de venta del proyecto y los costos, la utilidad del promotor y las cargas: Vt = Vp − (Cd + Ci + Cf + Up + Cg)."
          result={
            <ResultPanel
              label="Valor residual del terreno"
              value={formatCurrency(residual.valorTerreno)}
              unit="técnica residual estática"
              formula={residual.formula}
              rows={[
                {
                  label: "Valor de venta del proyecto (Vp)",
                  value: formatCurrency(residual.valorVenta),
                },
                {
                  label: "Costos directos (Cd)",
                  value: formatCurrency(residual.costosDirectos),
                },
                {
                  label: "Costos indirectos (Ci)",
                  value: formatCurrency(residual.costosIndirectos),
                },
                {
                  label: "Costos financieros (Cf)",
                  value: formatCurrency(residual.costosFinancieros),
                },
                {
                  label: "Utilidad del promotor (Up)",
                  value: formatCurrency(residual.utilidadPromotor),
                },
                {
                  label: "Cargas y obligaciones (Cg)",
                  value: formatCurrency(residual.cargas),
                },
                {
                  label: "Total de deducciones",
                  value: formatCurrency(residual.totalDeducciones),
                  emphasis: true,
                },
              ]}
              tone={residual.valorTerreno >= 0 ? "success" : "destructive"}
              ocid="residual.result"
            />
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <CampoNumero
              id="valor-venta"
              label="Valor de venta del proyecto (Vp)"
              value={valorVentaTexto}
              onChange={setValorVentaTexto}
              placeholder="2.400.000.000"
              suffix="COP"
              ocid="residual.input.venta"
            />
            <CampoNumero
              id="costos-directos"
              label="Costos directos (Cd)"
              value={costosDirectosTexto}
              onChange={setCostosDirectosTexto}
              placeholder="1.180.000.000"
              suffix="COP"
              ocid="residual.input.directos"
            />
            <CampoNumero
              id="costos-indirectos"
              label="Costos indirectos (Ci)"
              value={costosIndirectosTexto}
              onChange={setCostosIndirectosTexto}
              placeholder="210.000.000"
              suffix="COP"
              ocid="residual.input.indirectos"
            />
            <CampoNumero
              id="costos-financieros"
              label="Costos financieros (Cf)"
              value={costosFinancierosTexto}
              onChange={setCostosFinancierosTexto}
              placeholder="145.000.000"
              suffix="COP"
              ocid="residual.input.financieros"
            />
            <CampoNumero
              id="utilidad-promotor"
              label="Utilidad del promotor (Up)"
              value={utilidadTexto}
              onChange={setUtilidadTexto}
              placeholder="320.000.000"
              suffix="COP"
              hint="Anclada a la TIR sectorial; el VPN del proyecto no puede ser negativo."
              ocid="residual.input.utilidad"
            />
            <CampoNumero
              id="cargas"
              label="Cargas y obligaciones (Cg)"
              value={cargasTexto}
              onChange={setCargasTexto}
              placeholder="95.000.000"
              suffix="COP"
              ocid="residual.input.cargas"
            />
          </div>
        </CalcSection>

        {/* 7 — Resultado consolidado */}
        <CalcSection
          index={7}
          title="Resultado consolidado del avalúo urbano"
          reference="Artículo 4"
          description="Valor del terreno, valor de la construcción depreciada y valor total del avalúo, con el origen de cada componente para trazabilidad."
          result={
            <div className="space-y-4">
              <ResultPanel
                label="Valor total del avalúo"
                value={formatCurrency(consolidado.valorTotal)}
                unit="terreno + construcción depreciada"
                formula={`VT = ${formatCurrency(consolidado.valorTerreno)} + ${formatCurrency(consolidado.valorConstruccion)} = ${formatCurrency(consolidado.valorTotal)}`}
                rows={[
                  {
                    label: "Valor del terreno",
                    value: formatCurrency(consolidado.valorTerreno),
                  },
                  {
                    label: "Valor de la construcción depreciada",
                    value: formatCurrency(consolidado.valorConstruccion),
                  },
                  {
                    label: "Valor total",
                    value: formatCurrency(consolidado.valorTotal),
                    emphasis: true,
                  },
                ]}
                ocid="consolidado.result"
              />
              <div className="rounded-sm border border-border bg-muted/40 px-3 py-2">
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Origen de los componentes
                </p>
                <ul className="mt-2 space-y-1.5 text-sm text-foreground">
                  <li className="flex gap-2">
                    <span
                      aria-hidden="true"
                      className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
                    />
                    <span className="min-w-0">
                      Terreno: {consolidado.origenTerreno}
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span
                      aria-hidden="true"
                      className="mt-2 size-1.5 shrink-0 rounded-full bg-primary"
                    />
                    <span className="min-w-0">
                      Construcción: {consolidado.origenConstruccion}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          }
        >
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Origen del valor del terreno
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={origenTerreno === "residual" ? "default" : "outline"}
                  onClick={() => setOrigenTerreno("residual")}
                  className="rounded-md"
                  data-ocid="consolidado.toggle.terreno_residual"
                >
                  Técnica residual
                </Button>
                <Button
                  type="button"
                  variant={origenTerreno === "manual" ? "default" : "outline"}
                  onClick={() => setOrigenTerreno("manual")}
                  className="rounded-md"
                  data-ocid="consolidado.toggle.terreno_manual"
                >
                  Valor manual
                </Button>
              </div>
              {origenTerreno === "manual" ? (
                <CampoNumero
                  id="terreno-manual"
                  label="Valor del terreno"
                  value={terrenoManualTexto}
                  onChange={setTerrenoManualTexto}
                  placeholder="520.000.000"
                  suffix="COP"
                  ocid="consolidado.input.terreno"
                />
              ) : (
                <p className="rounded-sm border border-border bg-muted/40 px-3 py-2 font-mono text-xs text-foreground">
                  {formatCurrency(residual.valorTerreno)} tomados del bloque 6.
                </p>
              )}
            </div>

            <div className="rule-doc" />

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                Origen del valor de la construcción
              </p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={
                    origenConstruccion === "ross" ? "default" : "outline"
                  }
                  onClick={() => setOrigenConstruccion("ross")}
                  className="rounded-md"
                  data-ocid="consolidado.toggle.construccion_ross"
                >
                  Ross-Heideck
                </Button>
                <Button
                  type="button"
                  variant={
                    origenConstruccion === "manual" ? "default" : "outline"
                  }
                  onClick={() => setOrigenConstruccion("manual")}
                  className="rounded-md"
                  data-ocid="consolidado.toggle.construccion_manual"
                >
                  Valor manual
                </Button>
              </div>
              {origenConstruccion === "manual" ? (
                <CampoNumero
                  id="construccion-manual"
                  label="Valor de la construcción depreciada"
                  value={construccionManualTexto}
                  onChange={setConstruccionManualTexto}
                  placeholder="180.000.000"
                  suffix="COP"
                  ocid="consolidado.input.construccion"
                />
              ) : (
                <p className="rounded-sm border border-border bg-muted/40 px-3 py-2 font-mono text-xs text-foreground">
                  {formatCurrency(ross.valorAvisado)} tomados del bloque 4.
                </p>
              )}
            </div>

            <div className="rule-doc" />

            <div className="rounded-sm border border-border bg-muted/40 px-3 py-2">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Área construida considerada
              </p>
              <p className="mt-1 font-mono text-sm tabular-nums text-foreground">
                {formatArea(parseNumberInput(areaConstruidaTexto))}
              </p>
            </div>
          </div>
        </CalcSection>
      </div>

      <div className="mt-8 rounded-md border border-border bg-muted/40 p-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Nota de alcance
        </p>
        <p className="mt-2 max-w-[80ch] text-sm leading-relaxed text-muted-foreground">
          Los valores precargados son un caso de referencia para verificar la
          memoria de cálculo. El avaluador debe reemplazarlos por los datos
          verificados del inmueble y sustentar la selección del método, las
          fuentes y las tasas empleadas, conforme a los artículos 2 y 4 de la
          Resolución IGAC 941 de 2026.
        </p>
      </div>
    </div>
  );
}
