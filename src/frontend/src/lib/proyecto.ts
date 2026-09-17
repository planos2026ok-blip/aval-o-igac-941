/**
 * Estado compartido del proyecto de avalúo.
 *
 * Las calculadoras publican aquí las entradas que el usuario digita y la
 * exportación las lee para construir el informe. El almacén es externo a React
 * (patrón `useSyncExternalStore`) para que el encabezado pueda exportar desde
 * cualquier ruta sin depender de un proveedor montado en una página concreta.
 *
 * El estado es puro: no depende de React ni del backend. Las memorias de
 * cálculo se derivan con los motores de `lib/calc`, nunca se duplican aquí.
 */

import {
  type CultivoInput,
  type ParametrosPredio,
  calcularPredio,
} from "@/lib/calc/rural";
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
  type DatosReporte,
  type IdentificacionProyecto,
  fechaDeHoy,
} from "@/lib/export/reporte";
import { parseNumberInput } from "@/lib/format";

/** Entradas urbanas tal como las digita el usuario, en texto de formulario. */
export interface EntradasUrbanas {
  comparables: Comparable[];
  rentaTexto: string;
  tasaCapTexto: string;
  fnoTexto: string;
  crecimientoTexto: string;
  tasaDescTexto: string;
  aniosTexto: string;
  valorTerminalTexto: string;
  areaConstruidaTexto: string;
  valorNuevoM2Texto: string;
  edadTexto: string;
  vidaUtilTexto: string;
  estadoKey: string;
  vurTexto: string;
  edadVupTexto: string;
  ecTexto: string;
  valorVentaTexto: string;
  costosDirectosTexto: string;
  costosIndirectosTexto: string;
  costosFinancierosTexto: string;
  utilidadTexto: string;
  cargasTexto: string;
  origenTerreno: "residual" | "manual";
  terrenoManualTexto: string;
  origenConstruccion: "ross" | "manual";
  construccionManualTexto: string;
}

/** Entradas rurales tal como las digita el usuario. */
export interface EntradasRurales {
  cultivos: CultivoInput[];
  parametros: ParametrosPredio;
}

/** Estado completo del proyecto compartido entre calculadoras y exportación. */
export interface EstadoProyecto {
  identificacion: IdentificacionProyecto;
  urbano: EntradasUrbanas;
  rural: EntradasRurales;
  /** Verdadero cuando el usuario ya publicó entradas desde una calculadora. */
  hayDatosUsuario: boolean;
}

/** Identificación por defecto: encabeza el informe cuando no hay datos. */
export const IDENTIFICACION_INICIAL: IdentificacionProyecto = {
  nombre: "Avalúo comercial — Apartamento Calle 45 # 12-30",
  municipio: "Bogotá D.C.",
  fecha: fechaDeHoy(),
  responsable: "Avaluador con inscripción vigente ante el IGAC",
  notas:
    "Avalúo elaborado con visita técnica al inmueble y verificación documental. El valor del terreno se adopta por la técnica residual y el valor de la construcción por el modelo continuo Ross-Heideck.",
  fuentes:
    "Fincaraíz y Metrocuadrado (ofertas 2026); Escritura 1.245 de 2026, Notaría 12; Resolución IGAC 941 de 2026 y su anexo técnico.",
};

/** Comparables de referencia del expediente, usados como valor por defecto. */
export const COMPARABLES_INICIALES: Comparable[] = [
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
];

/** Actividad productiva de referencia del expediente. */
export const CULTIVO_INICIAL: CultivoInput = {
  id: "cultivo-1",
  nombre: "Café pergamino seco",
  areaHa: 12,
  rendimiento: 1.4,
  unidad: "tonelada",
  precioUnitario: 14_500_000,
  costosDirectos: 9_800_000,
  costosIndirectos: 1_450_000,
  otrosCostos: 620_000,
};

/** Parámetros rurales de referencia del expediente. */
export const PARAMETROS_INICIALES: ParametrosPredio = {
  participacionTierraPct: 30,
  tasaCapitalizacionPct: 8,
};

/** Entradas urbanas por defecto: caso de referencia del expediente. */
export const ENTRADAS_URBANAS_INICIALES: EntradasUrbanas = {
  comparables: COMPARABLES_INICIALES,
  rentaTexto: "54.000.000",
  tasaCapTexto: "9,5",
  fnoTexto: "48.000.000",
  crecimientoTexto: "3,5",
  tasaDescTexto: "11",
  aniosTexto: "5",
  valorTerminalTexto: "620.000.000",
  areaConstruidaTexto: "86",
  valorNuevoM2Texto: "3.850.000",
  edadTexto: "18",
  vidaUtilTexto: "70",
  estadoKey: "2",
  vurTexto: "70",
  edadVupTexto: "64",
  ecTexto: "3",
  valorVentaTexto: "2.400.000.000",
  costosDirectosTexto: "1.180.000.000",
  costosIndirectosTexto: "210.000.000",
  costosFinancierosTexto: "145.000.000",
  utilidadTexto: "320.000.000",
  cargasTexto: "95.000.000",
  origenTerreno: "residual",
  terrenoManualTexto: "520.000.000",
  origenConstruccion: "ross",
  construccionManualTexto: "180.000.000",
};

/** Entradas rurales por defecto: caso de referencia del expediente. */
export const ENTRADAS_RURALES_INICIALES: EntradasRurales = {
  cultivos: [CULTIVO_INICIAL],
  parametros: PARAMETROS_INICIALES,
};

/** Estado inicial del proyecto: valores de referencia, sin datos del usuario. */
export const ESTADO_INICIAL: EstadoProyecto = {
  identificacion: IDENTIFICACION_INICIAL,
  urbano: ENTRADAS_URBANAS_INICIALES,
  rural: ENTRADAS_RURALES_INICIALES,
  hayDatosUsuario: false,
};

let estado: EstadoProyecto = ESTADO_INICIAL;
const suscriptores = new Set<() => void>();

/**
 * Suscribe un componente a los cambios del proyecto.
 *
 * El estado vive durante toda la sesión de la aplicación: desmontar el último
 * suscriptor no lo reinicia, de modo que navegar a una sección sin
 * calculadoras (informe, tabla Ross-Heideck o exportación) conserva las
 * entradas que el usuario digitó. El único reinicio es la acción explícita
 * `restablecerProyecto`.
 */
export function suscribirProyecto(suscriptor: () => void): () => void {
  suscriptores.add(suscriptor);
  return () => {
    suscriptores.delete(suscriptor);
  };
}

function emitir(): void {
  for (const suscriptor of suscriptores) suscriptor();
}

/** Devuelve el estado actual del proyecto. */
export function obtenerProyecto(): EstadoProyecto {
  return estado;
}

/** Reemplaza el estado del proyecto y notifica a los suscriptores. */
export function actualizarProyecto(parcial: Partial<EstadoProyecto>): void {
  estado = { ...estado, ...parcial };
  emitir();
}

/** Publica las entradas urbanas actuales de la calculadora. */
export function publicarEntradasUrbanas(entradas: EntradasUrbanas): void {
  actualizarProyecto({ urbano: entradas, hayDatosUsuario: true });
}

/** Publica las entradas rurales actuales de la calculadora. */
export function publicarEntradasRurales(entradas: EntradasRurales): void {
  actualizarProyecto({ rural: entradas, hayDatosUsuario: true });
}

/** Publica la identificación del proyecto editada en la página de exportación. */
export function publicarIdentificacion(
  identificacion: IdentificacionProyecto,
): void {
  actualizarProyecto({ identificacion });
}

/**
 * Carga pendiente de un ejemplo práctico.
 *
 * La página de ejemplos publica aquí el caso completo y navega a la
 * calculadora. La calculadora consume la carga una sola vez al montarse, de
 * modo que precarga el ejemplo sin que el estado compartido —que persiste
 * durante toda la sesión— sobrescriba lo que el usuario digite después.
 */
let cargaPendiente: EntradasUrbanas | EntradasRurales | null = null;

/** Registra las entradas de un ejemplo para que la calculadora las consuma. */
export function programarCarga(
  entradas: EntradasUrbanas | EntradasRurales,
): void {
  cargaPendiente = entradas;
}

/**
 * Consume la carga pendiente, si existe, y la descarta.
 * Devuelve `null` cuando no hay ningún ejemplo por precargar.
 */
export function consumirCarga<
  T extends EntradasUrbanas | EntradasRurales,
>(): T | null {
  const carga = cargaPendiente;
  cargaPendiente = null;
  return carga as T | null;
}

/** Restablece el proyecto completo a los valores de referencia. */
export function restablecerProyecto(): void {
  estado = ESTADO_INICIAL;
  emitir();
}

/**
 * Deriva la memoria de cálculo completa a partir del estado compartido.
 * Reutiliza los motores puros de `lib/calc`; no duplica ninguna fórmula.
 */
export function construirDatosReporte(proyecto: EstadoProyecto): DatosReporte {
  const u = proyecto.urbano;
  const r = proyecto.rural;

  const mercado = calcularMercado(u.comparables);
  const capitalizacion = calcularCapitalizacionDirecta(
    parseNumberInput(u.rentaTexto),
    parseNumberInput(u.tasaCapTexto) / 100,
  );
  const flujo = calcularFlujoDescontado(
    parseNumberInput(u.fnoTexto),
    parseNumberInput(u.crecimientoTexto) / 100,
    parseNumberInput(u.tasaDescTexto) / 100,
    parseNumberInput(u.aniosTexto),
    parseNumberInput(u.valorTerminalTexto),
  );
  const ross = calcularRossHeideck(
    parseNumberInput(u.areaConstruidaTexto),
    parseNumberInput(u.valorNuevoM2Texto),
    parseNumberInput(u.edadTexto),
    parseNumberInput(u.vidaUtilTexto),
    u.estadoKey,
  );
  const vup = calcularVidaUtilProlongada(
    parseNumberInput(u.vurTexto),
    parseNumberInput(u.edadVupTexto),
    parseNumberInput(u.ecTexto),
  );
  const residual = calcularResidual(
    parseNumberInput(u.valorVentaTexto),
    parseNumberInput(u.costosDirectosTexto),
    parseNumberInput(u.costosIndirectosTexto),
    parseNumberInput(u.costosFinancierosTexto),
    parseNumberInput(u.utilidadTexto),
    parseNumberInput(u.cargasTexto),
  );

  const valorTerreno =
    u.origenTerreno === "residual"
      ? residual.valorTerreno
      : parseNumberInput(u.terrenoManualTexto);
  const valorConstruccion =
    u.origenConstruccion === "ross"
      ? ross.valorAvisado
      : parseNumberInput(u.construccionManualTexto);

  const origenTerreno =
    u.origenTerreno === "residual"
      ? "Técnica residual (bloque 6)"
      : "Valor de terreno ingresado manualmente";
  const origenConstruccion =
    u.origenConstruccion === "ross"
      ? "Ross-Heideck, modelo continuo (bloque 4)"
      : "Valor de construcción ingresado manualmente";

  const consolidado = consolidarAvaluo(
    valorTerreno,
    valorConstruccion,
    origenTerreno,
    origenConstruccion,
  );

  return {
    identificacion: proyecto.identificacion,
    urbano: {
      comparables: u.comparables,
      mercado,
      capitalizacion,
      flujo,
      ross,
      vup,
      residual,
      consolidado,
      origenTerreno,
      origenConstruccion,
      estadoKey: u.estadoKey,
    },
    rural: {
      cultivos: r.cultivos,
      parametros: r.parametros,
      resultado: calcularPredio(r.cultivos, r.parametros),
    },
  };
}
