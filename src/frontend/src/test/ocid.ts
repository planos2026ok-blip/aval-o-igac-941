import { configure } from "@testing-library/react";
import type { queries, within } from "@testing-library/react";

/**
 * Ayudantes de consulta por `data-ocid`.
 *
 * La aplicación marca los elementos interactivos y de resultado con el
 * atributo `data-ocid` (no `data-testid`). Estos envoltorios exponen las
 * consultas de Testing Library sobre ese atributo para que las pruebas de
 * página se lean igual que las consultas estándar.
 */

/** Escapa un valor para usarlo dentro de un selector CSS entre comillas. */
function escaparCss(valor: string): string {
  return valor.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

/** Selector CSS exacto para un `data-ocid`. */
export function selectorOcid(ocid: string): string {
  return `[data-ocid="${escaparCss(ocid)}"]`;
}

type Consultas = ReturnType<typeof within>;

/** Consultas por `data-ocid` acotadas a un contenedor (por defecto, el body). */
export interface ConsultasOcid {
  getByOcid: (ocid: string) => HTMLElement;
  queryByOcid: (ocid: string) => HTMLElement | null;
  getAllByOcid: (patron: RegExp) => HTMLElement[];
  queryAllByOcid: (patron: RegExp) => HTMLElement[];
}

/** Construye las consultas por `data-ocid` sobre un contenedor dado. */
export function consultasOcid(contenedor: Consultas): ConsultasOcid {
  return {
    getByOcid: (ocid) => contenedor.getByTestId(ocid),
    queryByOcid: (ocid) => contenedor.queryByTestId(ocid),
    getAllByOcid: (patron) => contenedor.getAllByTestId(patron),
    queryAllByOcid: (patron) => contenedor.queryAllByTestId(patron),
  };
}

/**
 * Configura `data-testid` como alias de `data-ocid` para el contenedor dado.
 *
 * Testing Library resuelve `getByTestId` contra el atributo configurado en
 * `testIdAttribute` (por defecto `data-testid`). Como la aplicación usa
 * `data-ocid`, se registra ese atributo como el de prueba antes de consultar.
 */
export function usarOcidComoTestId(): void {
  // `configure` se importa de forma estática: `require(...) as typeof import(...)`
  // se interpreta como una posición de tipo y rompe la compilación.
  configure({ testIdAttribute: "data-ocid" });
}

export type { queries };
