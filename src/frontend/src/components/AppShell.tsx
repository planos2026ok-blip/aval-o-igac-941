import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useExportarProyecto } from "@/hooks/useExportarProyecto";
import {
  NAV_SECTIONS,
  findSectionByPath,
  requestProjectExport,
} from "@/lib/nav";
import { Link } from "@tanstack/react-router";
import { CheckCircle2, Download, Menu, Scale } from "lucide-react";
import { useState } from "react";
import { SidebarNav } from "./SidebarNav";

interface AppShellProps {
  /** Ruta activa, provista por el router. */
  activePath: string;
  children: React.ReactNode;
}

/**
 * Armazón del expediente: encabezado fijo, índice lateral y columna de contenido.
 * En pantallas pequeñas el índice se pliega en un panel deslizante.
 */
export function AppShell({ activePath, children }: AppShellProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const activeSection = findSectionByPath(activePath);
  // La exportación vive en el armazón: el botón emite el evento global y este
  // hook lo atiende desde cualquier ruta. En la sección Exportar el evento lo
  // atiende la propia página, de modo que se desactiva aquí para no duplicar
  // la descarga.
  const { descargado, archivoDescargado } = useExportarProyecto({
    enabled: activePath !== "/exportar",
  });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header
        data-ocid="app.header"
        className="no-print sticky top-0 z-40 border-b border-border bg-card shadow-subtle"
      >
        <div className="flex items-center gap-3 px-4 py-3 md:px-8">
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="shrink-0 rounded-md lg:hidden"
                aria-label="Abrir índice del expediente"
                data-ocid="nav.open_modal_button"
              >
                <Menu className="h-4 w-4" aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="w-[19rem] border-r border-sidebar-border bg-sidebar p-0"
              data-ocid="nav.sheet"
            >
              <SheetHeader className="sr-only">
                <SheetTitle>Índice del expediente</SheetTitle>
                <SheetDescription>
                  Navegación entre las secciones del informe de avalúos.
                </SheetDescription>
              </SheetHeader>
              <SidebarNav
                activePath={activePath}
                onNavigate={() => setMobileNavOpen(false)}
              />
            </SheetContent>
          </Sheet>

          <Link
            to="/"
            data-ocid="app.home_link"
            className="flex min-w-0 flex-1 items-center gap-3"
          >
            <span
              aria-hidden="true"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gradient-primary text-primary-foreground"
            >
              <Scale className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-display text-sm font-bold tracking-tight text-foreground md:text-base">
                Avalúos IGAC — Resolución 941 de 2026
              </span>
              <span className="hidden truncate text-xs text-muted-foreground md:block">
                {activeSection
                  ? `${activeSection.folio} · ${activeSection.label}`
                  : "Expediente técnico de avalúo"}
              </span>
            </span>
          </Link>

          <Button
            type="button"
            onClick={requestProjectExport}
            data-ocid="app.export_button"
            className="shrink-0 rounded-md bg-accent font-semibold text-accent-foreground shadow-seal transition-smooth hover:bg-accent/90"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">EXPORTAR PROYECTO</span>
            <span className="sm:hidden">Exportar</span>
          </Button>
        </div>
        {descargado ? (
          <output
            className="flex items-center gap-2 border-t border-success/40 bg-success/10 px-4 py-2 md:px-8"
            data-ocid="app.export_success_state"
          >
            <CheckCircle2
              className="h-4 w-4 shrink-0 text-success"
              aria-hidden="true"
            />
            <p className="min-w-0 truncate text-xs text-foreground">
              Informe <span className="font-mono">{archivoDescargado}</span>{" "}
              descargado con los datos ingresados en el expediente.
            </p>
          </output>
        ) : null}
        <div
          aria-hidden="true"
          className="h-0.5 w-full animate-rule-draw bg-gradient-primary"
        />
      </header>

      <div className="flex flex-1">
        <aside className="no-print hidden w-[19rem] shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
          <div className="sticky top-[4.25rem] h-[calc(100vh-4.25rem)]">
            <SidebarNav activePath={activePath} />
          </div>
        </aside>

        <main
          data-ocid="app.page"
          className="min-w-0 flex-1 bg-background px-4 py-8 md:px-8 md:py-10"
        >
          {children}
        </main>
      </div>

      <footer
        data-ocid="app.footer"
        className="no-print border-t border-border bg-muted/40 px-4 py-6 md:px-8"
      >
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Referencia normativa
            </p>
            <p className="mt-1 text-sm text-foreground">
              Resolución IGAC 941 de 2026 — Metodología de avalúos comerciales
            </p>
          </div>
          <nav
            aria-label="Secciones"
            className="flex flex-wrap gap-x-4 gap-y-1"
          >
            {NAV_SECTIONS.map((section) => (
              <Link
                key={section.id}
                to={section.path}
                data-ocid={`footer.link.${section.id}`}
                className="text-xs text-muted-foreground transition-smooth hover:text-foreground"
              >
                {section.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-2 transition-smooth hover:text-foreground"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
