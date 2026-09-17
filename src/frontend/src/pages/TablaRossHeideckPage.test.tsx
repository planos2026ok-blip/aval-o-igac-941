import { ESTADOS_HEIDECK, TABLA_ROSS_HEIDECK } from "@/content/informe";
import TablaRossHeideckPage from "@/pages/TablaRossHeideckPage";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

/**
 * La página de la tabla Ross-Heideck debe reproducir el anexo íntegro: 100
 * filas por 9 estados, con el filtro por estado de conservación operativo.
 */
describe("TablaRossHeideckPage", () => {
  it("renderiza el encabezado y la tabla completa", () => {
    render(<TablaRossHeideckPage />);

    expect(
      screen.getByRole("heading", {
        name: "Tabla Ross-Heideck de doble entrada",
      }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("tabla.ross_heideck")).toBeInTheDocument();
    expect(
      screen.getByText(
        `${TABLA_ROSS_HEIDECK.length} filas · ${ESTADOS_HEIDECK.length} estados`,
      ),
    ).toBeInTheDocument();
  });

  it("renderiza las 100 filas de datos", () => {
    render(<TablaRossHeideckPage />);

    expect(screen.getAllByTestId(/^tabla\.row\./)).toHaveLength(100);
  });

  it("muestra los coeficientes de la primera fila con coma decimal", () => {
    render(<TablaRossHeideckPage />);

    const fila = screen.getByTestId("tabla.row.1");
    // Fila 0: estado 1 = 0,00000 y estado 5 = 1,00000.
    expect(within(fila).getByText("0,00000")).toBeInTheDocument();
    expect(within(fila).getByText("1,00000")).toBeInTheDocument();
  });

  it("filtra por estado de conservación al pulsar un estado", async () => {
    const user = userEvent.setup();
    render(<TablaRossHeideckPage />);

    const boton = screen.getByTestId("tabla.filtro.2");
    expect(boton).toHaveAttribute("aria-pressed", "false");

    await user.click(boton);

    expect(boton).toHaveAttribute("aria-pressed", "true");
    // La tabla sigue completa: el filtro resalta la columna, no oculta filas.
    expect(screen.getAllByTestId(/^tabla\.row\./)).toHaveLength(100);
  });

  it("vuelve a mostrar todos los estados con el botón Todos", async () => {
    const user = userEvent.setup();
    render(<TablaRossHeideckPage />);

    await user.click(screen.getByTestId("tabla.filtro.3"));
    expect(screen.getByTestId("tabla.filtro.3")).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    await user.click(screen.getByTestId("tabla.filtro.todos"));
    expect(screen.getByTestId("tabla.filtro.todos")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByTestId("tabla.filtro.3")).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("muestra la leyenda con los nueve estados de conservación", () => {
    render(<TablaRossHeideckPage />);

    const leyenda = screen.getByTestId("tabla.leyenda");
    for (const estado of ESTADOS_HEIDECK) {
      expect(within(leyenda).getByText(estado.label)).toBeInTheDocument();
    }
  });
});
