import { ArticleSection } from "@/components/ArticleSection";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ESTADOS_HEIDECK,
  INFORME_SECTIONS,
  TABLA_ROSS_HEIDECK,
} from "@/content/informe";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

const NAV_ITEMS = [
  ...INFORME_SECTIONS.map((section) => ({
    id: section.id,
    label: section.navLabel,
  })),
  { id: "tabla-ross-heideck", label: "Tabla Ross-Heideck" },
];

function formatCoeficiente(value: number): string {
  return value.toFixed(5).replace(".", ",");
}

export default function InformePage() {
  const [activeSection, setActiveSection] = useState(NAV_ITEMS[0].id);

  const totalArticulos = useMemo(
    () =>
      INFORME_SECTIONS.reduce(
        (total, section) => total + section.articles.length,
        0,
      ),
    [],
  );

  return (
    <div className="mx-auto w-full max-w-[1400px] px-4 py-8 md:px-8 md:py-12">
      <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] xl:gap-12">
        {/* Índice del expediente */}
        <nav
          aria-label="Índice del informe"
          className="no-print lg:sticky lg:top-24 lg:self-start"
          data-ocid="informe.nav"
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Índice del informe
          </p>
          <ul className="space-y-1 border-l border-border">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={() => setActiveSection(item.id)}
                    aria-current={isActive ? "true" : undefined}
                    className={cn(
                      "-ml-px block border-l-2 py-1.5 pl-3 text-sm transition-smooth",
                      isActive
                        ? "border-primary font-medium text-primary"
                        : "border-transparent text-muted-foreground hover:border-border hover:text-foreground",
                    )}
                    data-ocid={`informe.nav.link.${item.id}`}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 rounded-md border border-border bg-card p-4 shadow-subtle">
            <p className="font-mono text-2xl font-semibold tabular-nums text-foreground">
              {totalArticulos}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              artículos clave resumidos en {INFORME_SECTIONS.length} títulos del
              informe estructurado.
            </p>
          </div>
        </nav>

        {/* Columna de lectura */}
        <div className="min-w-0">
          <header className="mb-10 border-b-2 border-primary pb-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="secondary"
                className="rounded-sm font-mono text-[0.6875rem] uppercase tracking-[0.08em]"
              >
                Resolución IGAC 941 de 2026
              </Badge>
              <Badge
                variant="outline"
                className="rounded-sm font-mono text-[0.6875rem] uppercase tracking-[0.08em]"
              >
                Informe estructurado
              </Badge>
            </div>
            <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              Informe técnico de avalúos
            </h1>
            <p className="mt-3 max-w-[70ch] text-base leading-relaxed text-muted-foreground">
              Resumen estructurado por títulos y artículos clave de la
              Resolución IGAC 941 de 2026: objeto y principios, métodos
              valuatorios, reglas de mercado, renta, costo, técnica residual y
              avalúo rural. Cada fórmula se presenta con su expresión, el
              significado de sus variables, sus unidades y el orden de reemplazo
              paso a paso.
            </p>
            <div className="no-print mt-6 flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={() => window.print()}
                className="rounded-md bg-accent text-accent-foreground shadow-seal hover:bg-accent/90"
                data-ocid="informe.print_button"
              >
                Imprimir informe
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  document
                    .getElementById("tabla-ross-heideck")
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
                className="rounded-md"
                data-ocid="informe.table_link"
              >
                Ver tabla Ross-Heideck
              </Button>
            </div>
          </header>

          <div className="space-y-12">
            {INFORME_SECTIONS.map((section, sectionIndex) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-24 animate-fade-rise"
                style={{ animationDelay: `${sectionIndex * 40}ms` }}
                data-ocid={`informe.section.${sectionIndex + 1}`}
              >
                <div className="mb-6">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {section.eyebrow}
                  </p>
                  <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground">
                    {section.title}
                  </h2>
                  <p className="mt-3 max-w-[70ch] text-base leading-relaxed text-muted-foreground">
                    {section.intro}
                  </p>
                </div>

                <div className="space-y-10">
                  {section.articles.map((article, articleIndex) => (
                    <ArticleSection
                      key={article.id}
                      article={article}
                      index={articleIndex}
                    />
                  ))}
                </div>

                {sectionIndex < INFORME_SECTIONS.length - 1 ? (
                  <div className="rule-doc mt-12 animate-rule-draw" />
                ) : null}
              </section>
            ))}

            {/* Tabla Ross-Heideck */}
            <section
              id="tabla-ross-heideck"
              className="scroll-mt-24 animate-fade-rise"
              data-ocid="informe.section.tabla"
            >
              <div className="mb-6">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Anexo técnico
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground">
                  Tabla Ross-Heideck de doble entrada
                </h2>
                <p className="mt-3 max-w-[70ch] text-base leading-relaxed text-muted-foreground">
                  Coeficiente K de depreciación según el porcentaje de vida útil
                  transcurrida y el estado de conservación Heideck. Valores
                  transcritos del anexo técnico oficial, sin modificación.
                </p>
              </div>

              <div className="overflow-hidden rounded-md border border-border bg-card shadow-sheet">
                <div className="max-h-[32rem] overflow-auto">
                  <table
                    className="w-full border-collapse text-sm"
                    data-ocid="informe.table.ross_heideck"
                  >
                    <caption className="sr-only">
                      Tabla Ross-Heideck de doble entrada: coeficiente K de
                      depreciación por porcentaje de vida útil y estado de
                      conservación.
                    </caption>
                    <thead className="sticky top-0 z-10">
                      <tr>
                        <th
                          scope="col"
                          className="th-tech border border-border px-3 py-2 text-left"
                        >
                          % vida
                        </th>
                        {ESTADOS_HEIDECK.map((estado) => (
                          <th
                            key={estado.key}
                            scope="col"
                            className="th-tech border border-border px-3 py-2 text-right"
                          >
                            {estado.key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {TABLA_ROSS_HEIDECK.map((row, rowIndex) => {
                        const [vida, ...coeficientes] = row;
                        return (
                          <tr
                            key={vida}
                            className={cn(
                              "transition-smooth hover:bg-muted/50",
                              rowIndex % 2 === 1 && "bg-muted/40",
                            )}
                            data-ocid={`informe.table.row.${rowIndex + 1}`}
                          >
                            <th
                              scope="row"
                              className="border border-border px-3 py-1.5 text-left font-mono text-xs font-semibold tabular-nums text-foreground"
                            >
                              {vida}
                            </th>
                            {coeficientes.map((value, columnIndex) => (
                              <td
                                key={`${vida}-${ESTADOS_HEIDECK[columnIndex].key}`}
                                className="border border-border px-3 py-1.5 text-right font-mono text-xs tabular-nums text-foreground/90"
                              >
                                {formatCoeficiente(value)}
                              </td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-4 rounded-md border border-border bg-muted/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Estados de conservación Heideck
                </p>
                <ul className="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-3">
                  {ESTADOS_HEIDECK.map((estado) => (
                    <li
                      key={estado.key}
                      className="font-mono text-xs text-foreground/80"
                    >
                      {estado.label}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                  Fuente: Resolución IGAC 941 de 2026 y anexo técnico oficial. K
                  es el coeficiente de depreciación aplicado en VA = Vn × (1 −
                  K).
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
