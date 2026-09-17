/**
 * Formateo numérico para el expediente de avalúos.
 * Registro colombiano: separador de miles con punto, decimales con coma.
 */

const COP = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const COP_PRECISE = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const DECIMAL = new Intl.NumberFormat("es-CO", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const PERCENT = new Intl.NumberFormat("es-CO", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Valor monetario sin decimales, para cifras de avalúo consolidadas. */
export function formatCurrency(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return COP.format(value);
}

/** Valor monetario con centavos, para factores y resultados intermedios. */
export function formatCurrencyPrecise(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return COP_PRECISE.format(value);
}

/** Número decimal con separador de miles colombiano. */
export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return DECIMAL.format(value);
}

/** Porcentaje con dos decimales y signo explícito. */
export function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return `${PERCENT.format(value)} %`;
}

/** Factor adimensional con hasta cuatro decimales, para tablas técnicas. */
export function formatFactor(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
  }).format(value);
}

/** Área en metros cuadrados. */
export function formatArea(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return `${DECIMAL.format(value)} m²`;
}

/** Área en hectáreas, unidad propia del avalúo rural. */
export function formatHectares(value: number): string {
  if (!Number.isFinite(value)) return "—";
  return `${new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  }).format(value)} ha`;
}

/**
 * Serializa un número al registro de entrada colombiano: punto de miles y coma
 * decimal. Se usa para precargar los campos de formulario sin destruir la coma
 * mientras el usuario escribe.
 */
export function formatInputNumber(value: number): string {
  if (!Number.isFinite(value)) return "";
  return new Intl.NumberFormat("es-CO", {
    maximumFractionDigits: 10,
    useGrouping: true,
  }).format(value);
}

/** Convierte texto de entrada a número, tolerando separadores colombianos. */
export function parseNumberInput(raw: string): number {
  const cleaned = raw
    .trim()
    .replace(/\s/g, "")
    .replace(/\./g, "")
    .replace(",", ".");
  if (cleaned === "") return Number.NaN;
  return Number(cleaned);
}

/** Fecha larga en registro legal colombiano. */
export function formatLongDate(date: Date): string {
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
