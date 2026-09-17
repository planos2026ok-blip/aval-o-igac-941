import { PasoCalculo } from "@/components/PasoCalculo";
import { ResultPanel } from "@/components/ResultPanel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EJEMPLO_RURAL, EJEMPLO_URBANO } from "@/content/ejemplos";
import { ESTADOS_HEIDECK } from "@/content/informe";
import { programarCarga, useProyecto } from "@/hooks/useProyecto";
import {
  calcularPredio,
  pasosCalculoCultivo,
  simboloUnidad,
} from "@/lib/calc/rural";
import {
  calcularMercado,
  calcularResidual,
  calcularRossHeideck,
  consolidarAvaluo,
} from "@/lib/calc/urbano";
import {
  formatArea,
  formatCurrency,
  formatFactor,
  formatHectares,
  formatNumber,
  formatPercent,
  parseNumberInput,
} from "@/lib/format";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Landmark, Sprout } from "lucide-react";
import { useCallback, useMemo } from "react";

/**
 * Rutas de las calculadoras. El árbol de rutas se construye dinámicamente a
 * partir de `NAV_SECTIONS`, de modo que TanStack Router no infiere sus literales
 * y la ruta se resuelve por cadena, igual que en el índice lateral.
 */
const RUTA_URBANO: string = "/avaluo-urbano";
const RUTA_RURAL: string = "/avaluo-rural";

/** Ficha de datos de entrada: rejilla de pares etiqueta/valor. */
function FichaDatos({
  datos,
  ocid,
}: {
  datos: Array<{ label: string; value: string; unit: string }>;
  ocid: string;
}) {
  return (
    <dl
      className="grid gap-px overflow-hidden rounded-sm border border-border bg-border sm:grid-cols-2 lg:grid-cols-3"
      data-ocid={ocid}
    >
      {datos.map((dato) => (
        <div key={dato.label} className="bg-card px-4 py-3">
          <dt className="text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-muted-foreground">
            {dato.label}
          </dt>
          <dd className="mt-1 font-mono text-sm font-semibold tabular-nums text-foreground">
            {dato.value}
          </dd>
          <dd className="mt-0.5 text-xs text-muted-foreground">{dato.unit}</dd>
        </div>
      ))}
    </dl>
  );
}

/** Encabezado de un ejemplo resuelto, con folio y acción de carga. */
function EncabezadoEjemplo({
  folio,
  titulo,
  ubicacion,
  ficha,
  icon: Icon,
  accion,
}: {
  folio: string;
  titulo: string;
  ubicacion: string;
  ficha: string;
  icon: typeof Landmark;
  accion: React.ReactNode;
}) {
  return (
    <header className="border-b-2 border-primary pb-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant="secondary"
          className="rounded-sm font-mono text-[0.6875rem] uppercase tracking-[0.08em]"
        >
          {folio}
        </Badge>
        <Badge
          variant="outline"
          className="rounded-sm font-mono text-[0.6875rem] uppercase tracking-[0.08em]"
        >
          Ejemplo resuelto
        </Badge>
      </div>
      <div className="mt-4 flex items-start gap-4">
        <span
          aria-hidden="true"
          className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-md bg-gradient-primary text-primary-foreground sm:flex"
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <h2 className="font-display text-2xl font-bold tracking-tight text-foreground md:text-3xl">
            {titulo}
          </h2>
          <p className="mt-2 text-sm font-medium text-foreground">
            {ubicacion}
          </p>
          <p className="mt-2 max-w-[75ch] text-sm leading-relaxed text-muted-foreground">
            {ficha}
          </p>
        </div>
      </div>
      <div className="mt-5">{accion}</div>
    </header>
  );
}

export default function EjemplosPage() {
  const urbano = EJEMPLO_URBANO;
  const rural = EJEMPLO_RURAL;
  const navigate = useNavigate();
  const { proyecto, publicarUrbanas, publicarRurales } = useProyecto();
  // ── Caso urbano: mismos motores que la calculadora de avalúo urbano ────────
  const mercado = useMemo(
    () => calcularMercado(urbano.comparables),
    [urbano.comparables],
  );

  const ross = useMemo(
    () =>
      calcularRossHeideck(
        parseNumberInput(urbano.entradas.areaConstruidaTexto),
        parseNumberInput(urbano.entradas.valorNuevoM2Texto),
        parseNumberInput(urbano.entradas.edadTexto),
        parseNumberInput(urbano.entradas.vidaUtilTexto),
        urbano.entradas.estadoKey,
      ),
    [urbano.entradas],
  );

  const residual = useMemo(
    () =>
      calcularResidual(
        parseNumberInput(urbano.residual.valorVentaTexto),
        parseNumberInput(urbano.residual.costosDirectosTexto),
        parseNumberInput(urbano.residual.costosIndirectosTexto),
        parseNumberInput(urbano.residual.costosFinancierosTexto),
        parseNumberInput(urbano.residual.utilidadTexto),
        parseNumberInput(urbano.residual.cargasTexto),
      ),
    [urbano.residual],
  );

  const consolidado = useMemo(
    () =>
      consolidarAvaluo(
        residual.valorTerreno,
        ross.valorAvisado,
        "Técnica residual (paso 8)",
        "Ross-Heideck, modelo continuo (paso 7)",
      ),
    [residual.valorTerreno, ross.valorAvisado],
  );

  const estadoLabel =
    ESTADOS_HEIDECK.find((estado) => estado.key === urbano.entradas.estadoKey)
      ?.label ?? urbano.entradas.estadoKey;

  const areaConstruida = parseNumberInput(urbano.entradas.areaConstruidaTexto);
  const valorNuevoM2 = parseNumberInput(urbano.entradas.valorNuevoM2Texto);
  const edad = parseNumberInput(urbano.entradas.edadTexto);
  const vidaUtil = parseNumberInput(urbano.entradas.vidaUtilTexto);

  // ── Caso rural: mismos motores que la calculadora de avalúo rural ──────────
  const predio = useMemo(
    () => calcularPredio(rural.cultivos, rural.parametros),
    [rural.cultivos, rural.parametros],
  );

  const pasosRurales = useMemo(
    () =>
      predio.cultivos.map((cultivoResultado) => {
        const cultivo = rural.cultivos.find(
          (item) => item.id === cultivoResultado.id,
        );
        return cultivo
          ? pasosCalculoCultivo(cultivo, rural.parametros, cultivoResultado, {
              currency: formatCurrency,
              number: formatNumber,
              hectares: formatHectares,
            })
          : [];
      }),
    [predio.cultivos, rural.cultivos, rural.parametros],
  );

  /**
   * Publica el caso urbano completo en el estado compartido y abre la
   * calculadora. Los bloques que el ejemplo no define (renta, flujo de caja y
   * valores manuales) conservan lo que el usuario ya tenía en el proyecto.
   */
  const cargarUrbano = useCallback(() => {
    const entradas = {
      ...proyecto.urbano,
      comparables: urbano.comparables,
      areaConstruidaTexto: urbano.entradas.areaConstruidaTexto,
      valorNuevoM2Texto: urbano.entradas.valorNuevoM2Texto,
      edadTexto: urbano.entradas.edadTexto,
      vidaUtilTexto: urbano.entradas.vidaUtilTexto,
      estadoKey: urbano.entradas.estadoKey,
      valorVentaTexto: urbano.residual.valorVentaTexto,
      costosDirectosTexto: urbano.residual.costosDirectosTexto,
      costosIndirectosTexto: urbano.residual.costosIndirectosTexto,
      costosFinancierosTexto: urbano.residual.costosFinancierosTexto,
      utilidadTexto: urbano.residual.utilidadTexto,
      cargasTexto: urbano.residual.cargasTexto,
      origenTerreno: "residual" as const,
      origenConstruccion: "ross" as const,
    };
    programarCarga(entradas);
    publicarUrbanas(entradas);
    void navigate({ to: RUTA_URBANO });
  }, [navigate, proyecto.urbano, publicarUrbanas, urbano]);

  /**
   * Publica el caso rural completo —las dos actividades y los parámetros del
   * predio— y abre la calculadora, de modo que el caso cargado reproduzca el
   * ejemplo resuelto.
   */
  const cargarRural = useCallback(() => {
    const entradas = {
      cultivos: rural.cultivos,
      parametros: rural.parametros,
    };
    programarCarga(entradas);
    publicarRurales(entradas);
    void navigate({ to: RUTA_RURAL });
  }, [navigate, publicarRurales, rural.cultivos, rural.parametros]);

  return (
    <div className="mx-auto w-full max-w-[1100px] animate-fade-rise">
      <header className="border-b-2 border-primary pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="secondary"
            className="rounded-sm font-mono text-[0.6875rem] uppercase tracking-[0.08em]"
          >
            Folio V
          </Badge>
          <Badge
            variant="outline"
            className="rounded-sm font-mono text-[0.6875rem] uppercase tracking-[0.08em]"
          >
            Resolución IGAC 941 de 2026
          </Badge>
        </div>
        <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Ejemplos prácticos resueltos
        </h1>
        <p className="mt-3 max-w-[75ch] text-base leading-relaxed text-muted-foreground">
          Dos casos de referencia resueltos con la memoria de cálculo completa:
          un inmueble urbano por el método de costo con depreciación
          Ross-Heideck y un predio rural por capitalización de la renta de la
          tierra. Cada paso muestra la fórmula en notación matemática, la
          sustitución de los valores y el resultado. Los números provienen de
          los mismos motores de cálculo que las calculadoras, de modo que
          coinciden exactamente.
        </p>
      </header>

      {/* ── Ejemplo urbano ─────────────────────────────────────────────────── */}
      <article className="mt-10" data-ocid="ejemplo.urbano">
        <EncabezadoEjemplo
          folio="Ejemplo 1 · Urbano"
          titulo={urbano.titulo}
          ubicacion={urbano.ubicacion}
          ficha={urbano.ficha}
          icon={Landmark}
          accion={
            <Button
              asChild
              className="rounded-md bg-accent font-semibold text-accent-foreground shadow-seal transition-smooth hover:bg-accent/90"
            >
              <Link
                to={RUTA_URBANO}
                onClick={cargarUrbano}
                data-ocid="ejemplo.urbano.cargar_button"
              >
                Cargar en la calculadora urbana
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          }
        />

        <section className="mt-8" aria-labelledby="urbano-datos">
          <h3
            id="urbano-datos"
            className="font-display text-lg font-semibold tracking-tight text-foreground"
          >
            Datos de entrada
          </h3>
          <p className="mt-2 max-w-[75ch] text-sm leading-relaxed text-muted-foreground">
            Datos verificados del inmueble y del mercado. El valor del terreno
            se sustenta en la técnica residual y el de la construcción en el
            valor a nuevo por metro cuadrado.
          </p>
          <div className="mt-4">
            <FichaDatos datos={urbano.datos} ocid="ejemplo.urbano.datos" />
          </div>
        </section>

        <section className="mt-10" aria-labelledby="urbano-memoria">
          <h3
            id="urbano-memoria"
            className="font-display text-lg font-semibold tracking-tight text-foreground"
          >
            Memoria de cálculo paso a paso
          </h3>
          <p className="mt-2 max-w-[75ch] text-sm leading-relaxed text-muted-foreground">
            Procedimiento completo del método de costo con depreciación
            Ross-Heideck, desde el valor a nuevo hasta el avalúo consolidado.
          </p>

          <ol
            className="mt-4 divide-y divide-border overflow-hidden rounded-md border border-border bg-card shadow-subtle"
            data-ocid="ejemplo.urbano.memoria"
          >
            <PasoCalculo
              index={1}
              titulo="Valor a nuevo de la construcción"
              referencia="Artículo 7"
              formula="Vn = área construida × valor a nuevo por m²"
              sustitucion={`Vn = ${formatArea(areaConstruida)} × ${formatCurrency(valorNuevoM2)}/m²`}
              resultado={formatCurrency(ross.valorNuevo)}
              detalle="El área construida se multiplica por el valor de reposición a nuevo del metro cuadrado. El resultado es el costo de reemplazar la construcción sin depreciación."
            />

            <PasoCalculo
              index={2}
              titulo="Relación de edad"
              referencia="Artículo 7"
              formula="x/n = edad del inmueble / vida útil de referencia"
              sustitucion={`x/n = ${formatNumber(edad)} años / ${formatNumber(vidaUtil)} años`}
              resultado={formatFactor(ross.relacionEdad)}
              detalle="Cociente entre la edad del inmueble y su vida útil de referencia. Es la entrada de la tabla Ross-Heideck y de la fórmula de depreciación por edad."
            />

            <PasoCalculo
              index={3}
              titulo="Depreciación por edad"
              referencia="Artículo 7"
              formula="D = ½(x/n) + ½(x/n)²"
              sustitucion={`D = ½(${formatFactor(ross.relacionEdad)}) + ½(${formatFactor(ross.relacionEdad)})²`}
              resultado={formatFactor(ross.depreciacionEdad)}
              detalle="Depreciación acumulada por la sola edad del inmueble, expresada como fracción del valor a nuevo. Crece de forma cuadrática con la relación de edad."
            />

            <PasoCalculo
              index={4}
              titulo="Factor de estado de conservación"
              referencia="Artículo 7"
              formula="E = (100 − depreciación Heideck) / 100"
              sustitucion={`E = (100 − ${formatNumber(ross.depreciacionHeideck)}) / 100`}
              resultado={formatFactor(ross.factorEstado)}
              detalle={`El estado de conservación seleccionado es ${estadoLabel}. La depreciación Heideck es el porcentaje que la tabla asigna a ese estado; el factor E es su complemento.`}
            />

            <PasoCalculo
              index={5}
              titulo="Factor de depreciación total"
              referencia="Artículo 7"
              formula="FD = 1 − (D × E)"
              sustitucion={`FD = 1 − (${formatFactor(ross.depreciacionEdad)} × ${formatFactor(ross.factorEstado)})`}
              resultado={formatFactor(ross.factorDepreciacion)}
              detalle="Combina la depreciación por edad con el estado de conservación. Es la fracción del valor a nuevo que subsiste en el inmueble."
            />

            <PasoCalculo
              index={6}
              titulo="Valor avisado por el modelo continuo"
              referencia="Artículo 7"
              formula="VA = Vn × FD"
              sustitucion={`VA = ${formatCurrency(ross.valorNuevo)} × ${formatFactor(ross.factorDepreciacion)}`}
              resultado={formatCurrency(ross.valorAvisado)}
              detalle="Valor de la construcción depreciada según el modelo continuo Ross-Heideck. Es el valor que se incorpora al avalúo consolidado."
            />

            <PasoCalculo
              index={7}
              titulo="Lectura del coeficiente K en la tabla Ross-Heideck"
              referencia="Anexo técnico"
              formula="VA = Vn × (1 − K)"
              sustitucion={`VA = ${formatCurrency(ross.valorNuevo)} × (1 − ${formatFactor(ross.coeficienteK)})`}
              resultado={formatCurrency(ross.valorTabla)}
              detalle={`Verificación por lectura directa de la tabla de doble entrada. Con ${formatNumber(ross.porcentajeVida)} % de vida útil transcurrida y estado de conservación ${estadoLabel}, la tabla arroja K = ${formatFactor(ross.coeficienteK)}. El porcentaje de vida útil se redondea a la fila entera más cercana, tal como opera la tabla.`}
            />

            <PasoCalculo
              index={8}
              titulo="Valor residual del terreno"
              referencia="Artículo 8"
              formula="Vt = Vp − (Cd + Ci + Cf + Up + Cg)"
              sustitucion={`Vt = ${formatCurrency(residual.valorVenta)} − (${formatCurrency(residual.costosDirectos)} + ${formatCurrency(residual.costosIndirectos)} + ${formatCurrency(residual.costosFinancieros)} + ${formatCurrency(residual.utilidadPromotor)} + ${formatCurrency(residual.cargas)})`}
              resultado={formatCurrency(residual.valorTerreno)}
              detalle="Técnica residual: del valor de venta del proyecto se descuentan los costos directos, indirectos y financieros, la utilidad del promotor y las cargas. El remanente es el valor del terreno."
            />

            <PasoCalculo
              index={9}
              titulo="Avalúo consolidado del inmueble"
              referencia="Artículo 4"
              formula="VT = valor del terreno + valor de la construcción depreciada"
              sustitucion={`VT = ${formatCurrency(consolidado.valorTerreno)} + ${formatCurrency(consolidado.valorConstruccion)}`}
              resultado={formatCurrency(consolidado.valorTotal)}
              detalle="Suma del valor del terreno, obtenido por la técnica residual, y del valor de la construcción depreciada por Ross-Heideck. Es el avalúo total del inmueble."
            />
          </ol>
        </section>

        <section className="mt-8" aria-labelledby="urbano-resultado">
          <h3
            id="urbano-resultado"
            className="font-display text-lg font-semibold tracking-tight text-foreground"
          >
            Resultado del caso urbano
          </h3>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <ResultPanel
              label="Valor total del avalúo"
              value={formatCurrency(consolidado.valorTotal)}
              unit="terreno + construcción depreciada"
              formula={`VT = ${formatCurrency(consolidado.valorTerreno)} + ${formatCurrency(consolidado.valorConstruccion)} = ${formatCurrency(consolidado.valorTotal)}`}
              rows={[
                {
                  label: "Valor del terreno (residual)",
                  value: formatCurrency(consolidado.valorTerreno),
                },
                {
                  label: "Construcción depreciada (Ross-Heideck)",
                  value: formatCurrency(consolidado.valorConstruccion),
                },
                {
                  label: "Valor total",
                  value: formatCurrency(consolidado.valorTotal),
                  emphasis: true,
                },
              ]}
              ocid="ejemplo.urbano.resultado"
            />

            <ResultPanel
              label="Contraste con el método de mercado"
              value={formatCurrency(mercado.media)}
              unit="valor unitario promedio por m²"
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
              tone={mercado.cumple ? "success" : "destructive"}
              ocid="ejemplo.urbano.mercado"
            />
          </div>

          <div className="mt-4 rounded-sm border border-border bg-muted/40 px-4 py-3">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Nota de alcance
            </p>
            <p className="mt-2 max-w-[80ch] text-sm leading-relaxed text-muted-foreground">
              {urbano.nota}
            </p>
          </div>
        </section>
      </article>

      <div className="rule-doc my-12" />

      {/* ── Ejemplo rural ──────────────────────────────────────────────────── */}
      <article data-ocid="ejemplo.rural">
        <EncabezadoEjemplo
          folio="Ejemplo 2 · Rural"
          titulo={rural.titulo}
          ubicacion={rural.ubicacion}
          ficha={rural.ficha}
          icon={Sprout}
          accion={
            <Button
              asChild
              className="rounded-md bg-accent font-semibold text-accent-foreground shadow-seal transition-smooth hover:bg-accent/90"
            >
              <Link
                to={RUTA_RURAL}
                onClick={cargarRural}
                data-ocid="ejemplo.rural.cargar_button"
              >
                Cargar en la calculadora rural
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </Button>
          }
        />

        <section className="mt-8" aria-labelledby="rural-datos">
          <h3
            id="rural-datos"
            className="font-display text-lg font-semibold tracking-tight text-foreground"
          >
            Datos de entrada
          </h3>
          <p className="mt-2 max-w-[75ch] text-sm leading-relaxed text-muted-foreground">
            Composición del predio y parámetros técnicos de la capitalización.
            La participación de la tierra y la tasa de capitalización se
            sustentan en el expediente.
          </p>
          <div className="mt-4">
            <FichaDatos datos={rural.datos} ocid="ejemplo.rural.datos" />
          </div>
        </section>

        <section className="mt-10" aria-labelledby="rural-memoria">
          <h3
            id="rural-memoria"
            className="font-display text-lg font-semibold tracking-tight text-foreground"
          >
            Memoria de cálculo paso a paso
          </h3>
          <p className="mt-2 max-w-[75ch] text-sm leading-relaxed text-muted-foreground">
            Ingresos, costos, utilidad, renta de la tierra, valor por hectárea y
            valor total de cada actividad productiva del predio.
          </p>

          <div className="mt-4 space-y-6">
            {predio.cultivos.map((cultivoResultado, index) => {
              const pasos = pasosRurales[index] ?? [];
              const cultivo = rural.cultivos.find(
                (item) => item.id === cultivoResultado.id,
              );
              return (
                <article
                  key={cultivoResultado.id}
                  className="overflow-hidden rounded-md border border-border bg-card shadow-subtle"
                  data-ocid={`ejemplo.rural.actividad.${index + 1}`}
                >
                  <header className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/40 px-4 py-3 md:px-5">
                    <div className="min-w-0">
                      <p className="font-display text-sm font-semibold text-foreground">
                        {cultivoResultado.nombre}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatHectares(cultivoResultado.areaHa)} ·{" "}
                        {cultivo
                          ? `${formatNumber(cultivo.rendimiento)} ${simboloUnidad(cultivo.unidad)}/ha`
                          : ""}
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
                      <PasoCalculo
                        key={paso.titulo}
                        index={pasoIndex + 1}
                        titulo={paso.titulo}
                        formula={FORMULAS_RURALES[pasoIndex] ?? paso.titulo}
                        sustitucion={paso.sustitucion}
                        resultado={paso.resultado}
                        detalle={paso.detalle}
                      />
                    ))}
                  </ol>
                </article>
              );
            })}
          </div>
        </section>

        <section className="mt-8" aria-labelledby="rural-resultado">
          <h3
            id="rural-resultado"
            className="font-display text-lg font-semibold tracking-tight text-foreground"
          >
            Resultado del caso rural
          </h3>
          <div className="mt-4">
            <ResultPanel
              label="Valor total del predio"
              value={formatCurrency(predio.valorTotal)}
              unit={`${formatHectares(predio.areaTotalHa)} · ${formatCurrency(predio.valorPromedioHa)}/ha promedio`}
              formula={`VT = ${formatCurrency(predio.valorPromedioHa)}/ha × ${formatHectares(predio.areaTotalHa)} = ${formatCurrency(predio.valorTotal)}`}
              rows={[
                {
                  label: "Ingresos brutos consolidados",
                  value: formatCurrency(predio.ingresosTotales),
                },
                {
                  label: "Costos totales consolidados",
                  value: formatCurrency(predio.costosTotales),
                },
                {
                  label: "Utilidad consolidada",
                  value: formatCurrency(predio.utilidadTotal),
                },
                {
                  label: "Renta de la tierra consolidada",
                  value: formatCurrency(predio.rentaTierraTotal),
                },
                {
                  label: "Valor total del predio",
                  value: formatCurrency(predio.valorTotal),
                  emphasis: true,
                },
              ]}
              ocid="ejemplo.rural.resultado"
            />
          </div>

          <div className="mt-4 rounded-sm border border-border bg-muted/40 px-4 py-3">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Nota de alcance
            </p>
            <p className="mt-2 max-w-[80ch] text-sm leading-relaxed text-muted-foreground">
              {rural.nota}
            </p>
          </div>
        </section>
      </article>

      <div className="mt-12 rounded-md border border-border bg-muted/40 p-5">
        <div className="flex gap-3">
          <BookOpen
            className="mt-0.5 h-4 w-4 shrink-0 text-primary"
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p className="font-display text-sm font-semibold uppercase tracking-[0.08em] text-foreground">
              Cómo usar estos ejemplos
            </p>
            <p className="mt-2 max-w-[80ch] text-sm leading-relaxed text-muted-foreground">
              Cada botón abre la calculadora correspondiente con los datos del
              caso ya precargados, de modo que el avaluador pueda modificar una
              variable y observar de inmediato cómo cambia el resultado. Los
              ejemplos son casos de referencia para verificar la memoria de
              cálculo; el avaluador debe reemplazarlos por los datos verificados
              del inmueble o del predio y sustentar la selección del método, las
              fuentes y las tasas empleadas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Fórmulas en notación matemática de los seis pasos de la capitalización de
 * renta, en el mismo orden que devuelve `pasosCalculoCultivo`.
 */
const FORMULAS_RURALES = [
  "Ingresos/ha = rendimiento × precio unitario",
  "Costos/ha = costos directos + costos indirectos + otros costos",
  "Utilidad/ha = ingresos/ha − costos/ha",
  "Renta tierra/ha = utilidad/ha × participación de la tierra",
  "Valor/ha = renta tierra/ha ÷ tasa de capitalización",
  "Valor total = valor/ha × área",
];
