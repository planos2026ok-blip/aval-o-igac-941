/**
 * Motor de cálculo del avalúo urbano.
 *
 * Implementa los métodos valuatorios de la Resolución IGAC 941 de 2026:
 * mercado, renta (capitalización directa y flujo de caja descontado), costo
 * con depreciación Ross-Heideck, vida útil prolongada y técnica residual.
 *
 * Cada función devuelve, además del resultado, la fórmula sustituida con los
 * valores ingresados, de modo que la memoria de cálculo sea reproducible.
 */

import { ESTADOS_HEIDECK, TABLA_ROSS_HEIDECK } from "@/content/informe";

/** Límite admisible del coeficiente de variación para inmuebles urbanos. */
export const LIMITE_CV_URBANO = 7.5;

/** Rango admisible del estado de conservación para la vida útil prolongada. */
export const EC_VUP_MIN = 2.5;
export const EC_VUP_MAX = 4.5;

/** Porcentaje de vida útil desde el cual procede la vida útil prolongada. */
export const VIDA_UTIL_MINIMA_VUP = 90;

export interface Comparable {
  id: string;
  /** Descripción o dirección del comparable. */
  descripcion: string;
  /** Precio depurado de oferta o transacción, en pesos. */
  precio: number;
  /** Área del comparable, en m². */
  area: number;
  /** Fuente verificable del dato. */
  fuente: string;
  /** Texto de entrada del precio, tal como lo escribe el avaluador. */
  precioTexto: string;
  /** Texto de entrada del área, tal como lo escribe el avaluador. */
  areaTexto: string;
}

export interface ComparableCalculado extends Comparable {
  /** Valor unitario: VU = precio / área. */
  valorUnitario: number;
}

export interface ResultadoMercado {
  comparables: ComparableCalculado[];
  /** Número de comparables con datos válidos. */
  n: number;
  /** Media aritmética de los valores unitarios. */
  media: number;
  /** Desviación estándar muestral de los valores unitarios. */
  desviacion: number;
  /** Coeficiente de variación en porcentaje. */
  coeficienteVariacion: number;
  /** Límite admisible aplicable, en porcentaje. */
  limite: number;
  /** Verdadero cuando el CV no supera el límite normativo. */
  cumple: boolean;
  /** Fórmula de la media sustituida con los valores ingresados. */
  formulaMedia: string;
  /** Fórmula de la desviación estándar sustituida. */
  formulaDesviacion: string;
  /** Fórmula del coeficiente de variación sustituida. */
  formulaCV: string;
}

export interface ResultadoCapitalizacion {
  /** Renta neta anual utilizada. */
  renta: number;
  /** Tasa de capitalización en fracción. */
  tasa: number;
  /** Valor del inmueble: A = R / i. */
  valor: number;
  formula: string;
}

export interface FilaFlujo {
  anio: number;
  /** Flujo neto de operación del año. */
  fno: number;
  /** Factor de descuento 1/(1+i)^t. */
  factor: number;
  /** Flujo descontado a valor presente. */
  descontado: number;
}

export interface ResultadoFlujoDescontado {
  filas: FilaFlujo[];
  /** Suma de los flujos descontados del horizonte. */
  sumaFlujos: number;
  /** Valor terminal ingresado. */
  valorTerminal: number;
  /** Valor terminal descontado. */
  valorTerminalDescontado: number;
  /** Valor presente total del inmueble. */
  valor: number;
  formula: string;
}

export interface ResultadoRossHeideck {
  /** Relación de edad x/n. */
  relacionEdad: number;
  /** Depreciación por edad D = ½x + ½x². */
  depreciacionEdad: number;
  /** Depreciación Heideck del estado seleccionado, en porcentaje. */
  depreciacionHeideck: number;
  /** Factor de estado E = (100 − depreciación Heideck)/100. */
  factorEstado: number;
  /** Factor de depreciación total FD = 1 − D·E. */
  factorDepreciacion: number;
  /** Valor a nuevo: Vn = área × valor por m². */
  valorNuevo: number;
  /** Valor avisado por el modelo continuo: VA = Vn × FD. */
  valorAvisado: number;
  /** Porcentaje de vida útil transcurrida, redondeado a la fila de la tabla. */
  porcentajeVida: number;
  /** Coeficiente K leído en la tabla Ross-Heideck. */
  coeficienteK: number;
  /** Valor avisado por lectura de tabla: VA = Vn × (1 − K). */
  valorTabla: number;
  /** Etiqueta del estado de conservación seleccionado. */
  estadoLabel: string;
  formulaRelacion: string;
  formulaDepreciacion: string;
  formulaEstado: string;
  formulaFactor: string;
  formulaValor: string;
  formulaTabla: string;
}

export interface ResultadoVidaUtilProlongada {
  /** Vida útil de referencia. */
  vur: number;
  /** Estado de conservación admisible. */
  ec: number;
  /** Edad del inmueble. */
  edad: number;
  /** Vida remanente: VR = VUR / (EC × 2). */
  vidaRemanente: number;
  /** Vida útil prolongada: VUP = edad + VR. */
  vup: number;
  /** Porcentaje de vida útil transcurrida respecto de la VUR. */
  porcentajeVida: number;
  /** Verdadero cuando el EC está entre 2,5 y 4,5. */
  ecAdmisible: boolean;
  /** Verdadero cuando la vida útil transcurrida alcanza el 90 %. */
  vidaSuficiente: boolean;
  /** Verdadero cuando procede reconocer la vida útil prolongada. */
  procede: boolean;
  formulaVR: string;
  formulaVUP: string;
}

export interface ResultadoResidual {
  /** Valor de venta del proyecto. */
  valorVenta: number;
  costosDirectos: number;
  costosIndirectos: number;
  costosFinancieros: number;
  utilidadPromotor: number;
  cargas: number;
  /** Suma de costos, utilidad y cargas. */
  totalDeducciones: number;
  /** Valor residual del terreno: Vt = Vp − deducciones. */
  valorTerreno: number;
  formula: string;
}

export interface ResultadoConsolidado {
  /** Valor del terreno. */
  valorTerreno: number;
  /** Valor de la construcción depreciada. */
  valorConstruccion: number;
  /** Valor total del avalúo. */
  valorTotal: number;
  /** Origen del valor del terreno, para trazabilidad. */
  origenTerreno: string;
  /** Origen del valor de la construcción, para trazabilidad. */
  origenConstruccion: string;
}

/** Redondea a dos decimales para presentación de cifras intermedias. */
function r2(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Formatea un número en registro colombiano para incrustarlo en una fórmula. */
function num(value: number, decimals = 2): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(value);
}

/** Formatea un valor monetario para incrustarlo en una fórmula. */
function money(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return `$ ${new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)}`;
}

/** Formatea una fracción con cuatro decimales para incrustarla en una fórmula. */
function frac(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(value);
}

/**
 * Método de mercado: valor unitario de cada comparable, media aritmética,
 * desviación estándar muestral y coeficiente de variación contra el límite
 * admisible de 7,5 % para inmuebles urbanos.
 */
export function calcularMercado(comparables: Comparable[]): ResultadoMercado {
  const validos = comparables.filter(
    (c) =>
      Number.isFinite(c.precio) &&
      Number.isFinite(c.area) &&
      c.precio > 0 &&
      c.area > 0,
  );

  const calculados: ComparableCalculado[] = validos.map((c) => ({
    ...c,
    valorUnitario: c.precio / c.area,
  }));

  const n = calculados.length;
  const media =
    n > 0
      ? calculados.reduce((total, c) => total + c.valorUnitario, 0) / n
      : Number.NaN;

  const sumaCuadrados =
    n > 1
      ? calculados.reduce(
          (total, c) => total + (c.valorUnitario - media) ** 2,
          0,
        )
      : Number.NaN;

  const desviacion = n > 1 ? Math.sqrt(sumaCuadrados / (n - 1)) : Number.NaN;
  const coeficienteVariacion =
    n > 1 && media > 0 ? (desviacion / media) * 100 : Number.NaN;

  const formulaMedia =
    n > 0
      ? `VU = (${calculados
          .map((c) => num(c.valorUnitario, 0))
          .join(" + ")}) / ${n} = ${money(media)}/m²`
      : "Sin comparables válidos: no hay media que calcular.";

  const formulaDesviacion =
    n > 1
      ? `σ = √[Σ(VUᵢ − ${money(media)})² / (${n} − 1)] = ${money(desviacion)}/m²`
      : "Se requieren al menos dos comparables para calcular la desviación.";

  const formulaCV =
    n > 1 && Number.isFinite(coeficienteVariacion)
      ? `CV = (${money(desviacion)} / ${money(media)}) × 100 = ${num(coeficienteVariacion)} %`
      : "Se requieren al menos dos comparables para calcular el coeficiente de variación.";

  return {
    comparables: calculados,
    n,
    media,
    desviacion,
    coeficienteVariacion,
    limite: LIMITE_CV_URBANO,
    cumple:
      Number.isFinite(coeficienteVariacion) &&
      coeficienteVariacion <= LIMITE_CV_URBANO,
    formulaMedia,
    formulaDesviacion,
    formulaCV,
  };
}

/** Método de renta — capitalización directa: A = R / i. */
export function calcularCapitalizacionDirecta(
  renta: number,
  tasa: number,
): ResultadoCapitalizacion {
  const valor = tasa > 0 ? renta / tasa : Number.NaN;
  return {
    renta,
    tasa,
    valor,
    formula: `A = ${money(renta)} / ${frac(tasa)} = ${money(valor)}`,
  };
}

/**
 * Método de renta — flujo de caja descontado:
 * V = Σ[FNO_t/(1+i)^t] + VT/(1+i)^T, con crecimiento anual del flujo.
 */
export function calcularFlujoDescontado(
  fnoAnio1: number,
  crecimiento: number,
  tasaDescuento: number,
  anios: number,
  valorTerminal: number,
): ResultadoFlujoDescontado {
  const filas: FilaFlujo[] = [];
  const horizonte = Math.max(0, Math.floor(anios));

  for (let t = 1; t <= horizonte; t += 1) {
    const fno = fnoAnio1 * (1 + crecimiento) ** (t - 1);
    const factor = 1 / (1 + tasaDescuento) ** t;
    filas.push({
      anio: t,
      fno,
      factor,
      descontado: fno * factor,
    });
  }

  const sumaFlujos = filas.reduce((total, fila) => total + fila.descontado, 0);
  const factorTerminal =
    horizonte > 0 ? 1 / (1 + tasaDescuento) ** horizonte : Number.NaN;
  const valorTerminalDescontado = valorTerminal * factorTerminal;
  const valor = sumaFlujos + valorTerminalDescontado;

  const formula =
    horizonte > 0
      ? `V = ${money(sumaFlujos)} + ${money(valorTerminal)} / (1 + ${frac(tasaDescuento)})^${horizonte} = ${money(valor)}`
      : "Defina un horizonte de al menos un año para descontar los flujos.";

  return {
    filas,
    sumaFlujos,
    valorTerminal,
    valorTerminalDescontado,
    valor,
    formula,
  };
}

/** Índice de la columna Heideck en la tabla, a partir de la clave del estado. */
function indiceEstado(estadoKey: string): number {
  const index = ESTADOS_HEIDECK.findIndex((estado) => estado.key === estadoKey);
  return index >= 0 ? index : 0;
}

/**
 * Lee el coeficiente K de la tabla Ross-Heideck para un porcentaje de vida útil
 * y un estado de conservación. El porcentaje se redondea a la fila entera más
 * cercana, tal como opera la tabla de doble entrada.
 */
export function leerCoeficienteK(
  porcentajeVida: number,
  estadoKey: string,
): number {
  const fila = Math.min(99, Math.max(0, Math.round(porcentajeVida)));
  const registro = TABLA_ROSS_HEIDECK[fila];
  if (!registro) return Number.NaN;
  const [, ...coeficientes] = registro;
  return coeficientes[indiceEstado(estadoKey)] ?? Number.NaN;
}

/**
 * Método de costo con Ross-Heideck: depreciación por edad, factor de estado,
 * factor de depreciación total, valor avisado por el modelo continuo y valor
 * por lectura directa del coeficiente K de la tabla.
 */
export function calcularRossHeideck(
  areaConstruida: number,
  valorNuevoM2: number,
  edad: number,
  vidaUtil: number,
  estadoKey: string,
): ResultadoRossHeideck {
  const valorNuevo = areaConstruida * valorNuevoM2;
  const relacionEdad = vidaUtil > 0 ? edad / vidaUtil : Number.NaN;
  const depreciacionEdad = Number.isFinite(relacionEdad)
    ? 0.5 * relacionEdad + 0.5 * relacionEdad ** 2
    : Number.NaN;

  const estado = ESTADOS_HEIDECK[indiceEstado(estadoKey)];
  const depreciacionHeideck = Number.parseFloat(estado.key.replace(",", "."));
  const factorEstado = (100 - depreciacionHeideck) / 100;
  const factorDepreciacion =
    Number.isFinite(depreciacionEdad) && Number.isFinite(factorEstado)
      ? 1 - depreciacionEdad * factorEstado
      : Number.NaN;
  const valorAvisado = valorNuevo * factorDepreciacion;

  const porcentajeVida = Number.isFinite(relacionEdad)
    ? Math.min(100, Math.max(0, relacionEdad * 100))
    : Number.NaN;
  const coeficienteK = Number.isFinite(porcentajeVida)
    ? leerCoeficienteK(porcentajeVida, estadoKey)
    : Number.NaN;
  const valorTabla = valorNuevo * (1 - coeficienteK);

  return {
    relacionEdad,
    depreciacionEdad,
    depreciacionHeideck,
    factorEstado,
    factorDepreciacion,
    valorNuevo,
    valorAvisado,
    porcentajeVida,
    coeficienteK,
    valorTabla,
    estadoLabel: estado.label,
    formulaRelacion: `x/n = ${num(edad)} / ${num(vidaUtil)} = ${frac(relacionEdad)}`,
    formulaDepreciacion: `D = ½(${frac(relacionEdad)}) + ½(${frac(relacionEdad)})² = ${frac(depreciacionEdad)}`,
    formulaEstado: `E = (100 − ${num(depreciacionHeideck, 1)}) / 100 = ${frac(factorEstado)}`,
    formulaFactor: `FD = 1 − (${frac(depreciacionEdad)} × ${frac(factorEstado)}) = ${frac(factorDepreciacion)}`,
    formulaValor: `VA = ${money(valorNuevo)} × ${frac(factorDepreciacion)} = ${money(valorAvisado)}`,
    formulaTabla: `VA = ${money(valorNuevo)} × (1 − ${frac(coeficienteK)}) = ${money(valorTabla)}`,
  };
}

/**
 * Vida útil prolongada: VR = VUR / (EC × 2) y VUP = edad + VR.
 * Solo procede para estados de conservación entre 2,5 y 4,5 y desde el 90 %
 * de la vida útil de referencia.
 */
export function calcularVidaUtilProlongada(
  vur: number,
  edad: number,
  ec: number,
): ResultadoVidaUtilProlongada {
  const vidaRemanente = ec > 0 ? vur / (ec * 2) : Number.NaN;
  const vup = edad + vidaRemanente;
  const porcentajeVida = vur > 0 ? (edad / vur) * 100 : Number.NaN;
  const ecAdmisible = ec >= EC_VUP_MIN && ec <= EC_VUP_MAX;
  const vidaSuficiente =
    Number.isFinite(porcentajeVida) && porcentajeVida >= VIDA_UTIL_MINIMA_VUP;

  return {
    vur,
    ec,
    edad,
    vidaRemanente,
    vup,
    porcentajeVida,
    ecAdmisible,
    vidaSuficiente,
    procede: ecAdmisible && vidaSuficiente,
    formulaVR: `VR = ${num(vur)} / (${num(ec, 1)} × 2) = ${num(vidaRemanente)} años`,
    formulaVUP: `VUP = ${num(edad)} + ${num(vidaRemanente)} = ${num(vup)} años`,
  };
}

/**
 * Técnica residual: Vt = Vp − (Cd + Ci + Cf + Up + Cg).
 * El valor residual del terreno es el remanente del valor de venta del
 * proyecto tras descontar costos, utilidad del promotor y cargas.
 */
export function calcularResidual(
  valorVenta: number,
  costosDirectos: number,
  costosIndirectos: number,
  costosFinancieros: number,
  utilidadPromotor: number,
  cargas: number,
): ResultadoResidual {
  const totalDeducciones =
    costosDirectos +
    costosIndirectos +
    costosFinancieros +
    utilidadPromotor +
    cargas;
  const valorTerreno = valorVenta - totalDeducciones;

  return {
    valorVenta,
    costosDirectos,
    costosIndirectos,
    costosFinancieros,
    utilidadPromotor,
    cargas,
    totalDeducciones,
    valorTerreno,
    formula: `Vt = ${money(valorVenta)} − (${money(costosDirectos)} + ${money(costosIndirectos)} + ${money(costosFinancieros)} + ${money(utilidadPromotor)} + ${money(cargas)}) = ${money(valorTerreno)}`,
  };
}

/**
 * Consolida el avalúo urbano: valor del terreno, valor de la construcción
 * depreciada y valor total, conservando el origen de cada componente.
 */
export function consolidarAvaluo(
  valorTerreno: number,
  valorConstruccion: number,
  origenTerreno: string,
  origenConstruccion: string,
): ResultadoConsolidado {
  const terreno = Number.isFinite(valorTerreno) ? valorTerreno : 0;
  const construccion = Number.isFinite(valorConstruccion)
    ? valorConstruccion
    : 0;
  return {
    valorTerreno: terreno,
    valorConstruccion: construccion,
    valorTotal: terreno + construccion,
    origenTerreno,
    origenConstruccion,
  };
}

/** Redondeo a dos decimales expuesto para las páginas. */
export { r2 as redondear2 };
