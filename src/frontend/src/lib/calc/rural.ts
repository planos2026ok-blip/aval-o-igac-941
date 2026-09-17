/**
 * Motor de cálculo del avalúo rural por capitalización de renta de la tierra.
 *
 * Metodología (Resolución IGAC 941 de 2026, Título VII):
 *   1. Ingresos por hectárea = rendimiento × precio de venta unitario
 *   2. Costos totales por hectárea = directos + indirectos + otros
 *   3. Utilidad por hectárea = ingresos − costos totales
 *   4. Renta de la tierra por hectárea = utilidad × participación de la tierra
 *   5. Valor por hectárea = renta de la tierra / tasa de capitalización
 *   6. Valor total del predio = valor por hectárea × área
 *
 * Todas las cifras monetarias se expresan en pesos colombianos (COP) y las
 * áreas en hectáreas (ha). El motor es puro: no depende de React ni del backend.
 */

/** Unidad de medida de la producción, según el cultivo o actividad. */
export type UnidadMedida =
  | "tonelada"
  | "kilogramo"
  | "arroba"
  | "bulto"
  | "cabeza"
  | "litro"
  | "unidad";

export const UNIDADES_MEDIDA: { value: UnidadMedida; label: string }[] = [
  { value: "tonelada", label: "Tonelada (t)" },
  { value: "kilogramo", label: "Kilogramo (kg)" },
  { value: "arroba", label: "Arroba (@)" },
  { value: "bulto", label: "Bulto (62,5 kg)" },
  { value: "cabeza", label: "Cabeza de ganado" },
  { value: "litro", label: "Litro (L)" },
  { value: "unidad", label: "Unidad" },
];

/** Etiqueta corta de la unidad, para fórmulas sustituidas y tablas. */
export function etiquetaUnidad(unidad: UnidadMedida): string {
  const found = UNIDADES_MEDIDA.find((item) => item.value === unidad);
  return found ? found.label.replace(/\s*\(.*\)$/, "") : unidad;
}

/** Símbolo compacto de la unidad, para expresiones matemáticas. */
export function simboloUnidad(unidad: UnidadMedida): string {
  switch (unidad) {
    case "tonelada":
      return "t";
    case "kilogramo":
      return "kg";
    case "arroba":
      return "@";
    case "bulto":
      return "bulto";
    case "cabeza":
      return "cab";
    case "litro":
      return "L";
    case "unidad":
      return "un";
  }
}

/** Datos de entrada de un cultivo o actividad productiva del predio. */
export interface CultivoInput {
  /** Identificador estable, generado por la interfaz. */
  id: string;
  /** Nombre del cultivo o actividad agropecuaria. */
  nombre: string;
  /** Área sembrada o dedicada a la actividad, en hectáreas. */
  areaHa: number;
  /** Producción por hectárea. */
  rendimiento: number;
  /** Unidad en que se mide la producción. */
  unidad: UnidadMedida;
  /** Precio de venta por unidad producida, en pesos. */
  precioUnitario: number;
  /** Costos directos por hectárea, en pesos. */
  costosDirectos: number;
  /** Costos indirectos por hectárea, en pesos. */
  costosIndirectos: number;
  /** Otros costos por hectárea, en pesos. */
  otrosCostos: number;
}

/** Parámetros globales del predio, comunes a todos los cultivos. */
export interface ParametrosPredio {
  /** Porcentaje de la utilidad atribuible a la tierra, en tanto por ciento. */
  participacionTierraPct: number;
  /** Tasa de capitalización del uso agropecuario, en tanto por ciento. */
  tasaCapitalizacionPct: number;
}

/** Resultado del cálculo de un cultivo, con la memoria de cálculo completa. */
export interface CultivoResultado {
  id: string;
  nombre: string;
  areaHa: number;
  unidad: UnidadMedida;
  /** Ingresos por hectárea. */
  ingresosHa: number;
  /** Costos totales por hectárea. */
  costosTotalesHa: number;
  /** Utilidad por hectárea. */
  utilidadHa: number;
  /** Renta atribuible a la tierra por hectárea. */
  rentaTierraHa: number;
  /** Valor del suelo por hectárea. */
  valorHa: number;
  /** Valor total del suelo del área dedicada a la actividad. */
  valorTotal: number;
  /** Ingresos brutos del área completa. */
  ingresosTotales: number;
  /** Costos totales del área completa. */
  costosTotales: number;
  /** Utilidad del área completa. */
  utilidadTotal: number;
  /** Renta de la tierra del área completa. */
  rentaTierraTotal: number;
}

/** Consolidado del predio completo. */
export interface PredioResultado {
  cultivos: CultivoResultado[];
  /** Área total del predio, en hectáreas. */
  areaTotalHa: number;
  /** Valor total del predio, suma de los valores de cada actividad. */
  valorTotal: number;
  /** Valor promedio ponderado por hectárea. */
  valorPromedioHa: number;
  /** Ingresos brutos consolidados. */
  ingresosTotales: number;
  /** Costos consolidados. */
  costosTotales: number;
  /** Utilidad consolidada. */
  utilidadTotal: number;
  /** Renta de la tierra consolidada. */
  rentaTierraTotal: number;
}

/** Redondeo monetario a peso entero, para presentación de cifras de avalúo. */
function redondearPeso(value: number): number {
  return Math.round(value);
}

/**
 * Calcula un cultivo o actividad productiva.
 * Devuelve `null` cuando faltan datos indispensables (área, rendimiento,
 * precio o tasa de capitalización), de modo que la interfaz pueda señalar
 * el dato faltante en lugar de mostrar un resultado inválido.
 */
export function calcularCultivo(
  cultivo: CultivoInput,
  parametros: ParametrosPredio,
): CultivoResultado | null {
  const { areaHa, rendimiento, precioUnitario } = cultivo;
  const { participacionTierraPct, tasaCapitalizacionPct } = parametros;

  if (
    !Number.isFinite(areaHa) ||
    areaHa <= 0 ||
    !Number.isFinite(rendimiento) ||
    rendimiento <= 0 ||
    !Number.isFinite(precioUnitario) ||
    precioUnitario <= 0 ||
    !Number.isFinite(tasaCapitalizacionPct) ||
    tasaCapitalizacionPct <= 0
  ) {
    return null;
  }

  const costosDirectos = Number.isFinite(cultivo.costosDirectos)
    ? cultivo.costosDirectos
    : 0;
  const costosIndirectos = Number.isFinite(cultivo.costosIndirectos)
    ? cultivo.costosIndirectos
    : 0;
  const otrosCostos = Number.isFinite(cultivo.otrosCostos)
    ? cultivo.otrosCostos
    : 0;

  const ingresosHa = rendimiento * precioUnitario;
  const costosTotalesHa = costosDirectos + costosIndirectos + otrosCostos;
  const utilidadHa = ingresosHa - costosTotalesHa;
  const rentaTierraHa = utilidadHa * (participacionTierraPct / 100);
  const valorHa = rentaTierraHa / (tasaCapitalizacionPct / 100);

  return {
    id: cultivo.id,
    nombre: cultivo.nombre,
    areaHa,
    unidad: cultivo.unidad,
    ingresosHa: redondearPeso(ingresosHa),
    costosTotalesHa: redondearPeso(costosTotalesHa),
    utilidadHa: redondearPeso(utilidadHa),
    rentaTierraHa: redondearPeso(rentaTierraHa),
    valorHa: redondearPeso(valorHa),
    valorTotal: redondearPeso(valorHa * areaHa),
    ingresosTotales: redondearPeso(ingresosHa * areaHa),
    costosTotales: redondearPeso(costosTotalesHa * areaHa),
    utilidadTotal: redondearPeso(utilidadHa * areaHa),
    rentaTierraTotal: redondearPeso(rentaTierraHa * areaHa),
  };
}

/** Consolida el avalúo del predio a partir de sus cultivos o actividades. */
export function calcularPredio(
  cultivos: CultivoInput[],
  parametros: ParametrosPredio,
): PredioResultado {
  const resultados = cultivos
    .map((cultivo) => calcularCultivo(cultivo, parametros))
    .filter((resultado): resultado is CultivoResultado => resultado !== null);

  const areaTotalHa = resultados.reduce(
    (total, resultado) => total + resultado.areaHa,
    0,
  );
  const valorTotal = resultados.reduce(
    (total, resultado) => total + resultado.valorTotal,
    0,
  );

  return {
    cultivos: resultados,
    areaTotalHa,
    valorTotal,
    valorPromedioHa:
      areaTotalHa > 0 ? redondearPeso(valorTotal / areaTotalHa) : 0,
    ingresosTotales: resultados.reduce(
      (total, resultado) => total + resultado.ingresosTotales,
      0,
    ),
    costosTotales: resultados.reduce(
      (total, resultado) => total + resultado.costosTotales,
      0,
    ),
    utilidadTotal: resultados.reduce(
      (total, resultado) => total + resultado.utilidadTotal,
      0,
    ),
    rentaTierraTotal: resultados.reduce(
      (total, resultado) => total + resultado.rentaTierraTotal,
      0,
    ),
  };
}

/** Un paso de la memoria de cálculo, con la fórmula ya sustituida. */
export interface PasoCalculo {
  /** Etiqueta del paso. */
  titulo: string;
  /** Expresión con los valores numéricos reemplazados. */
  sustitucion: string;
  /** Resultado del paso, ya formateado. */
  resultado: string;
  /** Explicación del significado del paso y de sus unidades. */
  detalle: string;
}

/**
 * Construye la memoria de cálculo paso a paso de un cultivo, con la fórmula
 * sustituida por los valores ingresados. Es la evidencia técnica que exige el
 * expediente: no basta el número final.
 */
export function pasosCalculoCultivo(
  cultivo: CultivoInput,
  parametros: ParametrosPredio,
  resultado: CultivoResultado,
  fmt: {
    currency: (value: number) => string;
    number: (value: number) => string;
    hectares: (value: number) => string;
  },
): PasoCalculo[] {
  const unidad = simboloUnidad(cultivo.unidad);
  const participacion = parametros.participacionTierraPct;
  const tasa = parametros.tasaCapitalizacionPct;

  return [
    {
      titulo: "Ingresos por hectárea",
      sustitucion: `Ingresos = ${fmt.number(cultivo.rendimiento)} ${unidad}/ha × ${fmt.currency(cultivo.precioUnitario)}/${unidad}`,
      resultado: `${fmt.currency(resultado.ingresosHa)}/ha`,
      detalle:
        "El rendimiento por hectárea se multiplica por el precio de venta de una unidad. El resultado queda en pesos por hectárea.",
    },
    {
      titulo: "Costos totales por hectárea",
      sustitucion: `Costos = ${fmt.currency(cultivo.costosDirectos)} + ${fmt.currency(cultivo.costosIndirectos)} + ${fmt.currency(cultivo.otrosCostos)}`,
      resultado: `${fmt.currency(resultado.costosTotalesHa)}/ha`,
      detalle:
        "Suma de costos directos (insumos, mano de obra, labores), indirectos (administración, asistencia técnica) y otros costos imputables a la hectárea.",
    },
    {
      titulo: "Utilidad por hectárea",
      sustitucion: `Utilidad = ${fmt.currency(resultado.ingresosHa)} − ${fmt.currency(resultado.costosTotalesHa)}`,
      resultado: `${fmt.currency(resultado.utilidadHa)}/ha`,
      detalle:
        "Diferencia entre el ingreso bruto y los costos totales de la hectárea. Una utilidad negativa indica que la actividad no genera renta capitalizable.",
    },
    {
      titulo: "Renta atribuible a la tierra",
      sustitucion: `Renta tierra = ${fmt.currency(resultado.utilidadHa)} × ${fmt.number(participacion)} %`,
      resultado: `${fmt.currency(resultado.rentaTierraHa)}/ha`,
      detalle:
        "La participación de la tierra es la fracción de la utilidad que remunera al suelo y no a la actividad empresarial. Se expresa en porcentaje y su rango técnico esperado es del 20 % al 40 %.",
    },
    {
      titulo: "Valor del suelo por hectárea",
      sustitucion: `Valor/ha = ${fmt.currency(resultado.rentaTierraHa)} ÷ ${fmt.number(tasa)} %`,
      resultado: `${fmt.currency(resultado.valorHa)}/ha`,
      detalle:
        "La renta de la tierra se capitaliza dividiéndola por la tasa de capitalización del uso agropecuario, expresada en porcentaje. La tasa refleja el rendimiento esperado del capital invertido en tierra.",
    },
    {
      titulo: "Valor total de la actividad",
      sustitucion: `Valor total = ${fmt.currency(resultado.valorHa)}/ha × ${fmt.hectares(cultivo.areaHa)}`,
      resultado: fmt.currency(resultado.valorTotal),
      detalle:
        "El valor por hectárea se multiplica por el área dedicada a la actividad, en hectáreas, para obtener el valor del suelo de esa porción del predio.",
    },
  ];
}

/** Rango técnico esperado de la participación de la renta de la tierra. */
export const RANGO_PARTICIPACION = { min: 20, max: 40 };

/** Rango técnico esperado de la tasa de capitalización agropecuaria. */
export const RANGO_TASA_CAPITALIZACION = { min: 4, max: 12 };
