import {
  BookOpen,
  Calculator,
  Download,
  FileText,
  Landmark,
  Table2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * Registro único de secciones del expediente.
 * El sidebar, el router y el encabezado leen de aquí: una sola fuente de verdad.
 */
export interface NavSection {
  /** Identificador estable de ruta. */
  id: string;
  /** Ruta de TanStack Router. */
  path: string;
  /** Etiqueta visible en el índice. */
  label: string;
  /** Descripción corta para el índice y el encabezado. */
  description: string;
  /** Número romano de folio, refuerza la metáfora de expediente. */
  folio: string;
  icon: LucideIcon;
}

export const NAV_SECTIONS: NavSection[] = [
  {
    id: "informe",
    path: "/",
    label: "Informe",
    description: "Resumen estructurado por títulos y artículos clave",
    folio: "I",
    icon: FileText,
  },
  {
    id: "tabla-ross-heideck",
    path: "/tabla-ross-heideck",
    label: "Tabla Ross-Heideck",
    description: "Factores de depreciación del anexo, sin modificar",
    folio: "II",
    icon: Table2,
  },
  {
    id: "avaluo-urbano",
    path: "/avaluo-urbano",
    label: "Avalúo Urbano",
    description: "Método de reposición con depreciación Ross-Heideck",
    folio: "III",
    icon: Landmark,
  },
  {
    id: "avaluo-rural",
    path: "/avaluo-rural",
    label: "Avalúo Rural",
    description: "Capitalización de renta de la tierra",
    folio: "IV",
    icon: Calculator,
  },
  {
    id: "ejemplos",
    path: "/ejemplos",
    label: "Ejemplos",
    description: "Caso urbano y caso rural resueltos paso a paso",
    folio: "V",
    icon: BookOpen,
  },
  {
    id: "exportar",
    path: "/exportar",
    label: "Exportar",
    description: "Informe descargable autocontenido",
    folio: "VI",
    icon: Download,
  },
];

/** Sección de respaldo cuando la ruta no coincide con ninguna entrada. */
export const DEFAULT_SECTION: NavSection = NAV_SECTIONS[0];

export function findSectionByPath(pathname: string): NavSection | undefined {
  return NAV_SECTIONS.find((section) => section.path === pathname);
}

/**
 * Evento global que dispara la exportación del proyecto.
 * El encabezado lo emite; la sección Exportar lo escucha y ejecuta.
 */
export const EXPORT_PROJECT_EVENT = "igac:export-project";

export function requestProjectExport(): void {
  window.dispatchEvent(new CustomEvent(EXPORT_PROJECT_EVENT));
}
