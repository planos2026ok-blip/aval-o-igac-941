/**
 * Acceso React al estado compartido del proyecto de avalúo.
 *
 * El almacén vive en `lib/proyecto.ts` y es externo a React, de modo que el
 * encabezado puede exportar desde cualquier ruta sin depender de un proveedor
 * montado en una página concreta.
 */

import type { IdentificacionProyecto } from "@/lib/export/reporte";
import {
  type EntradasRurales,
  type EntradasUrbanas,
  type EstadoProyecto,
  consumirCarga,
  obtenerProyecto,
  programarCarga,
  publicarEntradasRurales,
  publicarEntradasUrbanas,
  publicarIdentificacion,
  restablecerProyecto,
  suscribirProyecto,
} from "@/lib/proyecto";
import { useCallback, useSyncExternalStore } from "react";

/** Lee el estado del proyecto y expone sus acciones de escritura. */
export function useProyecto() {
  const proyecto = useSyncExternalStore(
    suscribirProyecto,
    obtenerProyecto,
    obtenerProyecto,
  );

  const publicarUrbanas = useCallback(
    (entradas: EntradasUrbanas) => publicarEntradasUrbanas(entradas),
    [],
  );
  const publicarRurales = useCallback(
    (entradas: EntradasRurales) => publicarEntradasRurales(entradas),
    [],
  );
  const publicarIdentificacionCallback = useCallback(
    (identificacion: IdentificacionProyecto) =>
      publicarIdentificacion(identificacion),
    [],
  );
  const restablecer = useCallback(() => restablecerProyecto(), []);

  return {
    proyecto,
    publicarUrbanas,
    publicarRurales,
    publicarIdentificacion: publicarIdentificacionCallback,
    restablecer,
  };
}

export type { EstadoProyecto };

export { consumirCarga, programarCarga };
