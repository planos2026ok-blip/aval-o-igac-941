/**
 * Ejemplos prácticos resueltos del expediente de avalúos.
 *
 * Cada ejemplo precarga los datos de entrada de su calculadora y describe el
 * procedimiento completo: datos de entrada, fórmula aplicada, sustitución de
 * valores y resultado. Los números que se muestran en la página se obtienen de
 * los mismos motores de cálculo que usan las calculadoras (`lib/calc/urbano.ts`
 * y `lib/calc/rural.ts`), de modo que ambas superficies coincidan exactamente.
 */

import type { CultivoInput, ParametrosPredio } from "@/lib/calc/rural";
import type { Comparable } from "@/lib/calc/urbano";

/** Dato de entrada de un ejemplo, con su unidad y su fuente. */
export interface DatoEntrada {
  /** Etiqueta del dato. */
  label: string;
  /** Valor ya formateado para presentación. */
  value: string;
  /** Unidad o nota de procedencia. */
  unit: string;
}

/** Ejemplo urbano resuelto por el método de costo con Ross-Heideck. */
export interface EjemploUrbano {
  id: string;
  /** Título del caso. */
  titulo: string;
  /** Ubicación del inmueble. */
  ubicacion: string;
  /** Ficha técnica del inmueble. */
  ficha: string;
  /** Datos de entrada del método de costo. */
  datos: DatoEntrada[];
  /** Comparables de mercado que sustentan el valor del terreno. */
  comparables: Comparable[];
  /** Entradas del bloque Ross-Heideck de la calculadora. */
  entradas: {
    areaConstruidaTexto: string;
    valorNuevoM2Texto: string;
    edadTexto: string;
    vidaUtilTexto: string;
    estadoKey: string;
  };
  /** Entradas de la técnica residual que sustenta el terreno. */
  residual: {
    valorVentaTexto: string;
    costosDirectosTexto: string;
    costosIndirectosTexto: string;
    costosFinancierosTexto: string;
    utilidadTexto: string;
    cargasTexto: string;
  };
  /** Nota de alcance del caso. */
  nota: string;
}

/** Ejemplo rural resuelto por capitalización de renta de la tierra. */
export interface EjemploRural {
  id: string;
  /** Título del caso. */
  titulo: string;
  /** Ubicación del predio. */
  ubicacion: string;
  /** Ficha técnica del predio. */
  ficha: string;
  /** Datos de entrada del predio. */
  datos: DatoEntrada[];
  /** Actividades productivas precargadas en la calculadora. */
  cultivos: CultivoInput[];
  /** Parámetros del predio precargados en la calculadora. */
  parametros: ParametrosPredio;
  /** Nota de alcance del caso. */
  nota: string;
}

/**
 * Caso urbano: apartamento en el barrio La Soledad, Bogotá D.C.
 * Se valora por el método de costo con depreciación Ross-Heideck, con el valor
 * del terreno sustentado en la técnica residual y contraste de mercado.
 */
export const EJEMPLO_URBANO: EjemploUrbano = {
  id: "urbano-la-soledad",
  titulo: "Apartamento en La Soledad, Bogotá D.C.",
  ubicacion:
    "Calle 45 # 12-30, apartamento 302, barrio La Soledad, Bogotá D.C.",
  ficha:
    "Apartamento de 86 m² en edificio de cinco pisos, estructura en concreto reforzado, acabados en buen estado, con ascensor y vigilancia. Edad de 18 años sobre una vida útil de referencia de 70 años.",
  datos: [
    { label: "Área construida", value: "86", unit: "m²" },
    { label: "Valor a nuevo por m²", value: "$ 3.850.000", unit: "COP/m²" },
    { label: "Edad del inmueble (x)", value: "18", unit: "años" },
    { label: "Vida útil de referencia (n)", value: "70", unit: "años" },
    {
      label: "Estado de conservación",
      value: "2 — Bueno",
      unit: "Heideck",
    },
  ],
  comparables: [
    {
      id: "comparable-1",
      descripcion: "Calle 45 # 12-30, apartamento 302",
      precio: 468_000_000,
      area: 86,
      fuente: "Fincaraíz, oferta marzo 2026",
      precioTexto: "468.000.000",
      areaTexto: "86",
    },
    {
      id: "comparable-2",
      descripcion: "Carrera 18 # 45-12, apartamento 501",
      precio: 512_000_000,
      area: 94,
      fuente: "Metrocuadrado, oferta febrero 2026",
      precioTexto: "512.000.000",
      areaTexto: "94",
    },
    {
      id: "comparable-3",
      descripcion: "Calle 47 # 15-08, apartamento 204",
      precio: 441_000_000,
      area: 82,
      fuente: "Escritura 1.245 de 2026, Notaría 12",
      precioTexto: "441.000.000",
      areaTexto: "82",
    },
  ],
  entradas: {
    areaConstruidaTexto: "86",
    valorNuevoM2Texto: "3.850.000",
    edadTexto: "18",
    vidaUtilTexto: "70",
    estadoKey: "2",
  },
  residual: {
    valorVentaTexto: "2.400.000.000",
    costosDirectosTexto: "1.180.000.000",
    costosIndirectosTexto: "210.000.000",
    costosFinancierosTexto: "145.000.000",
    utilidadTexto: "320.000.000",
    cargasTexto: "95.000.000",
  },
  nota: "El valor del terreno se toma de la técnica residual y el de la construcción del modelo continuo Ross-Heideck. La lectura directa del coeficiente K de la tabla se contrasta como verificación del resultado.",
};

/**
 * Caso rural: predio cafetero en el municipio de Salgar, Antioquia.
 * Se valora por capitalización de la renta de la tierra, con dos actividades
 * productivas: café pergamino seco y plátano asociado.
 */
export const EJEMPLO_RURAL: EjemploRural = {
  id: "rural-salgar",
  titulo: "Predio cafetero en Salgar, Antioquia",
  ubicacion: "Vereda La Cuchilla, municipio de Salgar, Antioquia.",
  ficha:
    "Predio de 18,5 ha en ladera media, con 12 ha en café pergamino seco y 6,5 ha en plátano asociado. Vías de acceso en afirmado, energía eléctrica y beneficiadero propio.",
  datos: [
    { label: "Área total del predio", value: "18,5", unit: "ha" },
    { label: "Café pergamino seco", value: "12", unit: "ha" },
    { label: "Plátano asociado", value: "6,5", unit: "ha" },
    {
      label: "Participación de la tierra",
      value: "30,00 %",
      unit: "de la utilidad",
    },
    {
      label: "Tasa de capitalización",
      value: "8,00 %",
      unit: "uso agropecuario",
    },
  ],
  cultivos: [
    {
      id: "cultivo-1",
      nombre: "Café pergamino seco",
      areaHa: 12,
      rendimiento: 1.4,
      unidad: "tonelada",
      precioUnitario: 14_500_000,
      costosDirectos: 9_800_000,
      costosIndirectos: 1_450_000,
      otrosCostos: 620_000,
    },
    {
      id: "cultivo-2",
      nombre: "Plátano asociado",
      areaHa: 6.5,
      rendimiento: 8,
      unidad: "tonelada",
      precioUnitario: 1_250_000,
      costosDirectos: 4_100_000,
      costosIndirectos: 780_000,
      otrosCostos: 310_000,
    },
  ],
  parametros: {
    participacionTierraPct: 30,
    tasaCapitalizacionPct: 8,
  },
  nota: "La renta de la tierra se capitaliza a la tasa del uso agropecuario. Los cultivos se valoran como activos biológicos y no como costo del suelo.",
};
