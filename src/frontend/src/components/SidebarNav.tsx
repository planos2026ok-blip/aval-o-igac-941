import { NAV_SECTIONS } from "@/lib/nav";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

interface SidebarNavProps {
  /** Ruta activa, provista por el shell. */
  activePath: string;
  /** Cierra el panel móvil tras navegar. */
  onNavigate?: () => void;
  className?: string;
}

/**
 * Índice del expediente. En escritorio es una columna fija;
 * en móvil se monta dentro de un Sheet y se cierra al navegar.
 */
export function SidebarNav({
  activePath,
  onNavigate,
  className,
}: SidebarNavProps) {
  return (
    <nav
      aria-label="Índice del expediente"
      data-ocid="nav.sidebar"
      className={cn("flex h-full flex-col", className)}
    >
      <div className="border-b border-sidebar-border px-5 py-4">
        <p className="font-mono text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-muted-foreground">
          Índice del expediente
        </p>
        <p className="mt-1 font-display text-sm font-semibold text-sidebar-foreground">
          Resolución 941 de 2026
        </p>
      </div>

      <ul className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {NAV_SECTIONS.map((section) => {
          const isActive = section.path === activePath;
          const Icon = section.icon;
          return (
            <li key={section.id}>
              <Link
                to={section.path}
                onClick={onNavigate}
                data-ocid={`nav.link.${section.id}`}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "group flex items-start gap-3 rounded-md border-l-2 px-3 py-2.5 transition-smooth",
                  isActive
                    ? "border-l-primary bg-sidebar-accent text-sidebar-accent-foreground"
                    : "border-l-transparent text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon
                  aria-hidden="true"
                  className={cn(
                    "mt-0.5 h-4 w-4 shrink-0",
                    isActive ? "text-primary" : "text-muted-foreground",
                  )}
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline gap-2">
                    <span className="font-mono text-[0.625rem] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                      {section.folio}
                    </span>
                    <span
                      className={cn(
                        "truncate font-display text-sm",
                        isActive ? "font-semibold" : "font-medium",
                      )}
                    >
                      {section.label}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                    {section.description}
                  </span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="border-t border-sidebar-border px-5 py-4">
        <p className="text-xs leading-relaxed text-muted-foreground">
          Herramienta técnica de consulta. No sustituye el acto administrativo
          de avalúo.
        </p>
      </div>
    </nav>
  );
}
