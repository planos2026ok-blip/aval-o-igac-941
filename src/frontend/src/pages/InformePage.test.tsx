import {
  ESTADOS_HEIDECK,
  INFORME_SECTIONS,
  TABLA_ROSS_HEIDECK,
} from "@/content/informe";
import InformePage from "@/pages/InformePage";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

/**
 * El informe estructurado debe resumir los títulos y artículos clave y
 * reproducir la tabla Ross-Heideck completa, sin transcribir los 61 artículos.
 */
describe("InformePage", () => {
  it("renderiza el encabezado y el índice del informe", () => {
    render(<InformePage />);

    expect(
      screen.getByRole("heading", { name: "Informe técnico de avalúos" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Índice del informe" }),
    ).toBeInTheDocument();
  });

  it("renderiza una sección por cada título del informe", () => {
    render(<InformePage />);

    for (const seccion of INFORME_SECTIONS) {
      expect(
        screen.getByRole("heading", { name: seccion.title }),
      ).toBeInTheDocument();
    }
  });

  it("cuenta los artículos clave resumidos", () => {
    render(<InformePage />);

    const totalArticulos = INFORME_SECTIONS.reduce(
      (total, seccion) => total + seccion.articles.length,
      0,
    );
    // El conteo vive en el panel del índice; el mismo número puede aparecer
    // como encabezado de fila en la tabla Ross-Heideck.
    const nav = screen.getByTestId("informe.nav");
    expect(within(nav).getByText(String(totalArticulos))).toBeInTheDocument();
    expect(
      within(nav).getByText(
        new RegExp(
          `artículos clave resumidos en ${INFORME_SECTIONS.length} títulos`,
        ),
      ),
    ).toBeInTheDocument();
  });

  it("reproduce la tabla Ross-Heideck completa", () => {
    render(<InformePage />);

    const tabla = screen.getByTestId("informe.table.ross_heideck");
    expect(tabla).toBeInTheDocument();
    expect(screen.getAllByTestId(/^informe\.table\.row\./)).toHaveLength(
      TABLA_ROSS_HEIDECK.length,
    );
    expect(TABLA_ROSS_HEIDECK.length).toBe(100);
  });

  it("muestra los nueve estados de conservación en la leyenda", () => {
    render(<InformePage />);

    for (const estado of ESTADOS_HEIDECK) {
      expect(screen.getAllByText(estado.label).length).toBeGreaterThan(0);
    }
  });

  it("marca el enlace activo del índice al pulsarlo", async () => {
    const user = userEvent.setup();
    render(<InformePage />);

    const primerEnlace = screen.getByTestId(
      `informe.nav.link.${INFORME_SECTIONS[0].id}`,
    );
    expect(primerEnlace).toHaveAttribute("aria-current", "true");

    const segundoEnlace = screen.getByTestId(
      `informe.nav.link.${INFORME_SECTIONS[1].id}`,
    );
    await user.click(segundoEnlace);

    expect(segundoEnlace).toHaveAttribute("aria-current", "true");
    expect(primerEnlace).not.toHaveAttribute("aria-current");
  });

  it("incluye el enlace a la tabla Ross-Heideck en el índice", () => {
    render(<InformePage />);

    const nav = screen.getByTestId("informe.nav");
    expect(within(nav).getByText("Tabla Ross-Heideck")).toBeInTheDocument();
  });
});
