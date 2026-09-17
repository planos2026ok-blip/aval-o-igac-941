/**
 * Exportación del proyecto disponible desde cualquier sección.
 *
 * El hook se monta una sola vez en el armazón de la aplicación, de modo que el
 * botón EXPORTAR PROYECTO del encabezado descarga el informe sin importar la
 * ruta activa. El informe se construye con el estado compartido del proyecto:
 * las entradas que el usuario digitó en las calculadoras urbanas y rurales.
 */

import { generarInformeHtml } from "@/lib/export/plantilla";
import {
  type ClaveSeccion,
  SECCIONES_POR_DEFECTO,
  nombreArchivo,
} from "@/lib/export/reporte";
import { EXPORT_PROJECT_EVENT } from "@/lib/nav";
import {
  construirDatosReporte,
  obtenerProyecto,
  suscribirProyecto,
} from "@/lib/proyecto";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";

/** Descarga un documento HTML autocontenido en el navegador. */
function descargarHtml(html: string, archivo: string): void {
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = archivo;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}

/**
 * Escucha el evento global del encabezado y descarga el informe con los datos
 * vigentes del proyecto. Devuelve el estado de confirmación para la interfaz.
 *
 * `enabled` permite desactivar la escucha cuando la propia sección Exportar ya
 * atiende el evento, de modo que un clic del encabezado produzca una sola
 * descarga.
 */
export function useExportarProyecto({
  enabled = true,
}: { enabled?: boolean } = {}) {
  const [descargado, setDescargado] = useState(false);
  const [archivoDescargado, setArchivoDescargado] = useState("");
  const temporizador = useRef<number | null>(null);

  // Suscribe el armazón al estado compartido: el encabezado siempre lee los
  // datos vigentes y mantiene vivo el almacén aunque la ruta activa no tenga
  // calculadoras montadas.
  const proyecto = useSyncExternalStore(
    suscribirProyecto,
    obtenerProyecto,
    obtenerProyecto,
  );

  const exportar = useCallback(() => {
    const datos = construirDatosReporte(obtenerProyecto());
    const incluidas: ClaveSeccion[] = SECCIONES_POR_DEFECTO;
    const html = generarInformeHtml(datos, incluidas);
    const archivo = nombreArchivo(obtenerProyecto().identificacion.nombre);

    descargarHtml(html, archivo);

    setArchivoDescargado(archivo);
    setDescargado(true);
    if (temporizador.current !== null) {
      window.clearTimeout(temporizador.current);
    }
    temporizador.current = window.setTimeout(() => setDescargado(false), 5000);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    window.addEventListener(EXPORT_PROJECT_EVENT, exportar);
    return () => window.removeEventListener(EXPORT_PROJECT_EVENT, exportar);
  }, [enabled, exportar]);

  useEffect(() => {
    return () => {
      if (temporizador.current !== null) {
        window.clearTimeout(temporizador.current);
      }
    };
  }, []);

  return { exportar, descargado, archivoDescargado, proyecto };
}
