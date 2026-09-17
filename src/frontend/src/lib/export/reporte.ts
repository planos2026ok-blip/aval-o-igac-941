/**
 * Modelo de datos del informe exportable.
 *
 * El expediente se compone de tres bloques: identificación del proyecto,
 * memoria de cálculo urbana y memoria de cálculo rural. Cada bloque se
 * materializa como una lista de secciones con filas etiqueta/valor, de modo
 * que la plantilla HTML pueda renderizarlos sin conocer el dominio.
 *
 * El modelo es puro: no depende de React ni del backend, y toda cifra llega
 * ya formateada en registro colombiano.
 */

import {
  ESTADOS_HEIDECK,
  FORMULAS_REFERENCIA,
  type Formula,
  INFORME_SECTIONS,
  TABLA_ROSS_HEIDECK,
} from "@/content/informe";
import {
  type CultivoInput,
  type ParametrosPredio,
  type PredioResultado,
  etiquetaUnidad,
  pasosCalculoCultivo,
  simboloUnidad,
} from "@/lib/calc/rural";
import type {
  Comparable,
  ResultadoCapitalizacion,
  ResultadoConsolidado,
  ResultadoFlujoDescontado,
  ResultadoMercado,
  ResultadoResidual,
  ResultadoRossHeideck,
  ResultadoVidaUtilProlongada,
} from "@/lib/calc/urbano";
import {
  formatArea,
  formatCurrency,
  formatFactor,
  formatHectares,
  formatLongDate,
  formatNumber,
  formatPercent,
} from "@/lib/format";

/** Identificación del proyecto consignada en el encabezado del informe. */
export interface IdentificacionProyecto {
  nombre: string;
  municipio: string;
  fecha: string;
  responsable: string;
  notas: string;
  fuentes: string;
}

/** Fila etiqueta/valor de una sección del informe. */
export interface FilaReporte {
  label: string;
  value: string;
  /** Verdadero cuando la fila es una cifra de cierre y debe resaltarse. */
  emphasis?: boolean;
}

/** Bloque de contenido del informe: título, prosa, filas y fórmulas. */
export interface SeccionReporte {
  id: string;
  title: string;
  /** Referencia normativa o técnica de la sección. */
  reference?: string;
  intro?: string;
  rows?: FilaReporte[];
  /** Párrafos de prosa a ancho completo, para textos normativos extensos. */
  prose?: string[];
  /** Fórmulas sustituidas con los valores ingresados. */
  formulas?: string[];
  /** Notas al pie de la sección. */
  notes?: string[];
}

/** Entrada de la memoria de cálculo urbana. */
export interface EntradaUrbana {
  comparables: Comparable[];
  mercado: ResultadoMercado;
  capitalizacion: ResultadoCapitalizacion;
  flujo: ResultadoFlujoDescontado;
  ross: ResultadoRossHeideck;
  vup: ResultadoVidaUtilProlongada;
  residual: ResultadoResidual;
  consolidado: ResultadoConsolidado;
  origenTerreno: string;
  origenConstruccion: string;
  estadoKey: string;
}

/** Entrada de la memoria de cálculo rural. */
export interface EntradaRural {
  cultivos: CultivoInput[];
  parametros: ParametrosPredio;
  resultado: PredioResultado;
}

/** Datos completos que alimentan la exportación. */
export interface DatosReporte {
  identificacion: IdentificacionProyecto;
  urbano: EntradaUrbana;
  rural: EntradaRural;
}

/** Secciones que el usuario puede incluir o excluir del archivo exportado. */
export type ClaveSeccion =
  | "identificacion"
  | "urbano"
  | "rural"
  | "formulas"
  | "ross-heideck"
  | "informe";

export interface OpcionSeccion {
  key: ClaveSeccion;
  label: string;
  description: string;
}

export const SECCIONES_EXPORTABLES: OpcionSeccion[] = [
  {
    key: "identificacion",
    label: "Identificación del proyecto",
    description:
      "Nombre, municipio, fecha, responsable, notas y fuentes consultadas.",
  },
  {
    key: "urbano",
    label: "Memoria de cálculo urbana",
    description:
      "Mercado, renta, costo con Ross-Heideck, vida útil prolongada, residual y consolidado.",
  },
  {
    key: "rural",
    label: "Memoria de cálculo rural",
    description:
      "Capitalización de renta por actividad productiva, paso a paso.",
  },
  {
    key: "formulas",
    label: "Formulario de referencia",
    description:
      "Fórmulas del anexo técnico con variables, unidades y pasos de sustitución.",
  },
  {
    key: "ross-heideck",
    label: "Tabla Ross-Heideck completa",
    description:
      "Tabla de doble entrada del anexo, transcrita sin modificación.",
  },
  {
    key: "informe",
    label: "Resumen normativo",
    description:
      "Síntesis estructurada por títulos y artículos clave de la resolución.",
  },
];

/** Todas las secciones activas por defecto. */
export const SECCIONES_POR_DEFECTO: ClaveSeccion[] = SECCIONES_EXPORTABLES.map(
  (seccion) => seccion.key,
);

/** Fecha de hoy en registro legal colombiano, para el encabezado. */
export function fechaDeHoy(): string {
  return formatLongDate(new Date());
}

/**
 * Deriva el nombre del archivo descargado a partir del nombre del proyecto.
 * Se eliminan tildes, signos y espacios para obtener un nombre seguro.
 */
export function nombreArchivo(nombreProyecto: string): string {
  const base = nombreProyecto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
  return `${base || "informe-avaluo"}.html`;
}

/** Sección de identificación del proyecto. */
function seccionIdentificacion(
  identificacion: IdentificacionProyecto,
): SeccionReporte {
  return {
    id: "identificacion",
    title: "Identificación del proyecto",
    reference: "Artículo 4 — contenido mínimo del informe",
    intro:
      "Datos de identificación del encargo y del responsable del avalúo, con las fuentes consultadas y las notas de sustentación.",
    rows: [
      { label: "Proyecto", value: identificacion.nombre || "—" },
      { label: "Municipio", value: identificacion.municipio || "—" },
      { label: "Fecha del informe", value: identificacion.fecha || "—" },
      { label: "Responsable", value: identificacion.responsable || "—" },
      { label: "Notas", value: identificacion.notas || "—" },
      { label: "Fuentes consultadas", value: identificacion.fuentes || "—" },
    ],
  };
}

/** Sección de mercado: comparables, media, desviación y coeficiente. */
function seccionMercado(urbano: EntradaUrbana): SeccionReporte {
  const { mercado } = urbano;
  const filas: FilaReporte[] = mercado.comparables.map((comparable, index) => ({
    label: `Comparable ${index + 1} — ${comparable.descripcion || "sin descripción"}`,
    value: `${formatCurrency(comparable.precio)} / ${formatArea(comparable.area)} = ${formatCurrency(comparable.valorUnitario)}/m²`,
  }));

  filas.push(
    { label: "Comparables válidos", value: `${mercado.n}` },
    {
      label: "Valor unitario promedio",
      value: `${formatCurrency(mercado.media)}/m²`,
      emphasis: true,
    },
    {
      label: "Desviación estándar muestral",
      value: `${formatCurrency(mercado.desviacion)}/m²`,
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
    {
      label: "Concepto de dispersión",
      value:
        mercado.n > 1
          ? mercado.cumple
            ? "Conforme: la dispersión no supera el límite admisible."
            : "No conforme: la muestra debe depurarse o sustentarse."
          : "Sin muestra suficiente para el contraste.",
    },
  );

  return {
    id: "urbano-mercado",
    title: "Método de mercado",
    reference: "Artículos 5 y 10",
    intro:
      "Valor unitario de cada comparable (VU = precio / área), media aritmética, desviación estándar muestral y coeficiente de variación contra el límite admisible de 7,5 % para inmuebles urbanos.",
    rows: filas,
    formulas: [
      mercado.formulaMedia,
      mercado.formulaDesviacion,
      mercado.formulaCV,
    ],
    notes: [
      "El promedio es una ayuda matemática, no una homologación automática. Apartarse de la media exige sustentación expresa.",
    ],
  };
}

/** Sección de renta: capitalización directa y flujo de caja descontado. */
function seccionRenta(urbano: EntradaUrbana): SeccionReporte {
  const { capitalizacion, flujo } = urbano;
  const filas: FilaReporte[] = [
    {
      label: "Renta neta anual",
      value: formatCurrency(capitalizacion.renta),
    },
    {
      label: "Tasa de capitalización",
      value: formatPercent(capitalizacion.tasa * 100),
    },
    {
      label: "Valor por capitalización directa",
      value: formatCurrency(capitalizacion.valor),
      emphasis: true,
    },
  ];

  for (const fila of flujo.filas) {
    filas.push({
      label: `Año ${fila.anio} — flujo neto de operación`,
      value: `${formatCurrency(fila.fno)} × ${formatFactor(fila.factor)} = ${formatCurrency(fila.descontado)}`,
    });
  }

  filas.push(
    {
      label: "Suma de flujos descontados",
      value: formatCurrency(flujo.sumaFlujos),
    },
    {
      label: "Valor terminal descontado",
      value: formatCurrency(flujo.valorTerminalDescontado),
    },
    {
      label: "Valor por flujo de caja descontado",
      value: formatCurrency(flujo.valor),
      emphasis: true,
    },
  );

  return {
    id: "urbano-renta",
    title: "Método de renta",
    reference: "Artículos 6, 11 y 12",
    intro:
      "Capitalización directa de la renta neta anual y flujo de caja descontado con valor terminal, descontado a la tasa del segmento.",
    rows: filas,
    formulas: [capitalizacion.formula, flujo.formula],
    notes: [
      "Gastos operativos mínimos exigidos: predial, seguros, mantenimiento, administración, servicios públicos, imprevistos y comisión.",
    ],
  };
}

/** Sección de costo con Ross-Heideck y vida útil prolongada. */
function seccionCosto(urbano: EntradaUrbana): SeccionReporte {
  const { ross, vup } = urbano;
  return {
    id: "urbano-costo",
    title: "Método de costo — depreciación Ross-Heideck",
    reference: "Artículos 7, 13, 14 y 15",
    intro:
      "Depreciación por edad, factor de estado Heideck, factor de depreciación total, valor avisado por el modelo continuo y valor por lectura directa del coeficiente K de la tabla.",
    rows: [
      {
        label: "Relación de edad x/n",
        value: formatFactor(ross.relacionEdad),
      },
      {
        label: "Depreciación por edad D",
        value: formatFactor(ross.depreciacionEdad),
      },
      {
        label: "Estado de conservación Heideck",
        value: ross.estadoLabel,
      },
      {
        label: "Factor de estado E",
        value: formatFactor(ross.factorEstado),
      },
      {
        label: "Factor de depreciación total FD",
        value: formatFactor(ross.factorDepreciacion),
        emphasis: true,
      },
      {
        label: "Valor a nuevo Vn",
        value: formatCurrency(ross.valorNuevo),
      },
      {
        label: "Valor avisado por modelo continuo",
        value: formatCurrency(ross.valorAvisado),
        emphasis: true,
      },
      {
        label: "Porcentaje de vida útil transcurrida",
        value: formatPercent(ross.porcentajeVida),
      },
      {
        label: "Coeficiente K leído en la tabla",
        value: formatFactor(ross.coeficienteK),
      },
      {
        label: "Valor avisado por lectura de tabla",
        value: formatCurrency(ross.valorTabla),
        emphasis: true,
      },
      {
        label: "Vida útil de referencia (VUR)",
        value: `${formatNumber(vup.vur)} años`,
      },
      {
        label: "Estado de conservación admisible (EC)",
        value: formatNumber(vup.ec),
      },
      {
        label: "Vida remanente VR",
        value: `${formatNumber(vup.vidaRemanente)} años`,
      },
      {
        label: "Vida útil prolongada VUP",
        value: `${formatNumber(vup.vup)} años`,
        emphasis: true,
      },
      {
        label: "Procedencia de la vida útil prolongada",
        value: vup.procede
          ? "Procede: EC entre 2,5 y 4,5 y vida útil transcurrida ≥ 90 %."
          : "No procede conforme a los requisitos del artículo 15.",
      },
    ],
    formulas: [
      ross.formulaRelacion,
      ross.formulaDepreciacion,
      ross.formulaEstado,
      ross.formulaFactor,
      ross.formulaValor,
      ross.formulaTabla,
      vup.formulaVR,
      vup.formulaVUP,
    ],
    notes: [
      "La vida útil prolongada solo procede para estados de conservación entre 2,5 y 4,5, no aplica a Bienes de Interés Cultural y es reconocible desde el 90 % de la vida útil.",
    ],
  };
}

/** Sección de técnica residual y consolidado del avalúo urbano. */
function seccionResidual(urbano: EntradaUrbana): SeccionReporte {
  const { residual, consolidado } = urbano;
  return {
    id: "urbano-residual",
    title: "Técnica residual y consolidado del avalúo",
    reference: "Artículos 8 y 16",
    intro:
      "Valor residual del terreno por diferencia entre el valor de venta del proyecto y las deducciones, y consolidación del avalúo con el origen de cada componente.",
    rows: [
      {
        label: "Valor de venta del proyecto Vp",
        value: formatCurrency(residual.valorVenta),
      },
      {
        label: "Costos directos Cd",
        value: formatCurrency(residual.costosDirectos),
      },
      {
        label: "Costos indirectos Ci",
        value: formatCurrency(residual.costosIndirectos),
      },
      {
        label: "Costos financieros y comercialización Cf",
        value: formatCurrency(residual.costosFinancieros),
      },
      {
        label: "Utilidad del promotor Up",
        value: formatCurrency(residual.utilidadPromotor),
      },
      {
        label: "Cargas y obligaciones Cg",
        value: formatCurrency(residual.cargas),
      },
      {
        label: "Total de deducciones",
        value: formatCurrency(residual.totalDeducciones),
      },
      {
        label: "Valor residual del terreno Vt",
        value: formatCurrency(residual.valorTerreno),
        emphasis: true,
      },
      {
        label: "Origen del valor del terreno",
        value: consolidado.origenTerreno,
      },
      {
        label: "Origen del valor de la construcción",
        value: consolidado.origenConstruccion,
      },
      {
        label: "Valor del terreno consolidado",
        value: formatCurrency(consolidado.valorTerreno),
      },
      {
        label: "Valor de la construcción depreciada",
        value: formatCurrency(consolidado.valorConstruccion),
      },
      {
        label: "Valor total del avalúo urbano",
        value: formatCurrency(consolidado.valorTotal),
        emphasis: true,
      },
    ],
    formulas: [residual.formula],
    notes: [
      "La utilidad del promotor se ancla a la TIR sectorial y el VPN del proyecto no puede ser negativo.",
    ],
  };
}

/** Sección de la memoria de cálculo rural, con el paso a paso por actividad. */
function seccionRural(rural: EntradaRural): SeccionReporte {
  const { cultivos, parametros, resultado } = rural;
  const filas: FilaReporte[] = [
    {
      label: "Participación de la tierra",
      value: formatPercent(parametros.participacionTierraPct),
    },
    {
      label: "Tasa de capitalización agropecuaria",
      value: formatPercent(parametros.tasaCapitalizacionPct),
    },
    {
      label: "Área total del predio",
      value: formatHectares(resultado.areaTotalHa),
    },
    {
      label: "Ingresos brutos consolidados",
      value: formatCurrency(resultado.ingresosTotales),
    },
    {
      label: "Costos consolidados",
      value: formatCurrency(resultado.costosTotales),
    },
    {
      label: "Utilidad consolidada",
      value: formatCurrency(resultado.utilidadTotal),
    },
    {
      label: "Renta de la tierra consolidada",
      value: formatCurrency(resultado.rentaTierraTotal),
    },
    {
      label: "Valor promedio por hectárea",
      value: `${formatCurrency(resultado.valorPromedioHa)}/ha`,
    },
    {
      label: "Valor total del predio",
      value: formatCurrency(resultado.valorTotal),
      emphasis: true,
    },
  ];

  const formulas: string[] = [];
  for (const cultivoResultado of resultado.cultivos) {
    const cultivo = cultivos.find((item) => item.id === cultivoResultado.id);
    if (!cultivo) continue;
    const pasos = pasosCalculoCultivo(cultivo, parametros, cultivoResultado, {
      currency: formatCurrency,
      number: formatNumber,
      hectares: formatHectares,
    });
    for (const paso of pasos) {
      formulas.push(`${paso.titulo}: ${paso.sustitucion} = ${paso.resultado}`);
    }
  }

  return {
    id: "rural",
    title: "Avalúo rural por capitalización de renta",
    reference: "Título VII — Artículos 17 y 18",
    intro:
      "Ingresos, costos, utilidad y renta atribuible a la tierra por unidad productiva homogénea, capitalizada a la tasa del uso agropecuario.",
    rows: filas,
    formulas,
    notes: [
      "Los cultivos se valoran como activos biológicos: se considera su ciclo productivo, su estado y su capacidad de generar ingresos futuros.",
      "No proceden reducciones automáticas del valor por la sola condición de suelo de protección o preservación.",
    ],
  };
}

/** Sección del formulario de referencia del anexo técnico. */
function seccionFormulas(): SeccionReporte {
  const formulas: string[] = FORMULAS_REFERENCIA.map(
    (formula: Formula) =>
      `${formula.name}: ${formula.expression} — ${formula.variables
        .map(
          (variable) =>
            `${variable.symbol} (${variable.meaning}, ${variable.unit})`,
        )
        .join("; ")}`,
  );

  return {
    id: "formulas",
    title: "Formulario de referencia",
    reference: "Anexo técnico — Resolución IGAC 941 de 2026",
    intro:
      "Fórmulas del anexo con sus variables, unidades y el significado de cada término.",
    formulas,
  };
}

/** Sección del resumen normativo estructurado por títulos y artículos. */
function seccionInforme(): SeccionReporte {
  const formulas: string[] = [];
  const prose: string[] = [];

  for (const seccion of INFORME_SECTIONS) {
    for (const articulo of seccion.articles) {
      prose.push(
        `${seccion.eyebrow} · ${articulo.label} — ${articulo.title}`,
        articulo.paragraphs.join(" "),
      );
      for (const formula of articulo.formulas ?? []) {
        formulas.push(`${formula.name}: ${formula.expression}`);
      }
    }
  }

  return {
    id: "informe",
    title: "Resumen normativo por títulos y artículos clave",
    reference: "Resolución IGAC 941 de 2026",
    intro:
      "Síntesis estructurada del articulado. No sustituye la transcripción literal de la resolución.",
    prose,
    formulas,
  };
}

/**
 * Construye las secciones del informe exportable según la selección del
 * usuario. El orden es el del expediente: identificación, urbano, rural,
 * formulario, tabla y resumen normativo.
 */
export function construirSecciones(
  datos: DatosReporte,
  incluidas: ClaveSeccion[],
): SeccionReporte[] {
  const activas = new Set(incluidas);
  const secciones: SeccionReporte[] = [];

  if (activas.has("identificacion")) {
    secciones.push(seccionIdentificacion(datos.identificacion));
  }
  if (activas.has("urbano")) {
    secciones.push(
      seccionMercado(datos.urbano),
      seccionRenta(datos.urbano),
      seccionCosto(datos.urbano),
      seccionResidual(datos.urbano),
    );
  }
  if (activas.has("rural")) {
    secciones.push(seccionRural(datos.rural));
  }
  if (activas.has("formulas")) {
    secciones.push(seccionFormulas());
  }
  if (activas.has("informe")) {
    secciones.push(seccionInforme());
  }

  return secciones;
}

/** Datos de la tabla Ross-Heideck para la plantilla. */
export function datosTablaRossHeideck(): {
  estados: { key: string; label: string }[];
  filas: { porcentaje: number; coeficientes: number[] }[];
} {
  return {
    estados: ESTADOS_HEIDECK.map((estado) => ({
      key: estado.key,
      label: estado.label,
    })),
    filas: TABLA_ROSS_HEIDECK.map((fila) => {
      const [porcentaje, ...coeficientes] = fila;
      return { porcentaje, coeficientes };
    }),
  };
}

/** Etiqueta legible de la unidad de un cultivo, para la tabla exportada. */
export function unidadCultivo(cultivo: CultivoInput): string {
  return `${etiquetaUnidad(cultivo.unidad)} (${simboloUnidad(cultivo.unidad)})`;
}
