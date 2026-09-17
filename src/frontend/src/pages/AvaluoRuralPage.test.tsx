import { EJEMPLO_RURAL } from "@/content/ejemplos";
import { programarCarga } from "@/hooks/useProyecto";
import { calcularPredio } from "@/lib/calc/rural";
import { formatCurrency } from "@/lib/format";
import { restablecerProyecto } from "@/lib/proyecto";
import AvaluoRuralPage from "@/pages/AvaluoRuralPage";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

/**
 * Recorrido de integración de la calculadora rural: el cultivo precargado
 * produce el avalúo del predio y la memoria paso a paso, y editar los
 * parámetros o las actividades recalcula el consolidado.
 */
describe("AvaluoRuralPage", () => {
  beforeEach(() => {
    restablecerProyecto();
  });

  afterEach(() => {
    restablecerProyecto();
  });

  it("renderiza el encabezado, los parámetros y el cultivo precargado", () => {
    render(<AvaluoRuralPage />);

    expect(
      screen.getByRole("heading", {
        name: "Avalúo rural por capitalización de renta",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Parámetros del predio" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Cultivos y actividades del predio",
      }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("rural.cultivo.card.1")).toBeInTheDocument();
  });

  it("muestra el valor total del predio y los totales consolidados", () => {
    render(<AvaluoRuralPage />);

    const panel = screen.getByTestId("rural.resultado_panel");
    // Café: ingresos 20.300.000/ha, costos 11.870.000/ha, utilidad 8.430.000/ha,
    // renta 2.529.000/ha, valor 31.612.500/ha × 12 ha = 379.350.000.
    expect(within(panel).getByText(/379\.350\.000/)).toBeInTheDocument();
    expect(within(panel).getByText(/12 ha/)).toBeInTheDocument();
  });

  it("muestra la memoria de cálculo paso a paso del cultivo", () => {
    render(<AvaluoRuralPage />);

    const memoria = screen.getByTestId("rural.memoria_section");
    expect(
      within(memoria).getByRole("heading", {
        name: "Memoria de cálculo paso a paso",
      }),
    ).toBeInTheDocument();
    expect(
      within(memoria).getByText("Ingresos por hectárea"),
    ).toBeInTheDocument();
    expect(
      within(memoria).getByText("Valor total de la actividad"),
    ).toBeInTheDocument();
    expect(
      within(memoria).getByText("Renta atribuible a la tierra"),
    ).toBeInTheDocument();
  });

  it("recalcula el valor del predio al editar el área del cultivo", async () => {
    const user = userEvent.setup();
    render(<AvaluoRuralPage />);

    const panel = screen.getByTestId("rural.resultado_panel");
    expect(within(panel).getByText(/379\.350\.000/)).toBeInTheDocument();

    const area = screen.getByTestId("rural.cultivo.area_input.1");
    await user.clear(area);
    await user.type(area, "24");

    // 31.612.500/ha × 24 ha = 758.700.000.
    expect(within(panel).getByText(/758\.700\.000/)).toBeInTheDocument();
  });

  it("agrega una actividad y muestra el estado vacío mientras no es calculable", async () => {
    const user = userEvent.setup();
    render(<AvaluoRuralPage />);

    await user.click(screen.getByTestId("rural.add_cultivo_button"));
    expect(screen.getByTestId("rural.cultivo.card.2")).toBeInTheDocument();

    // La nueva actividad no tiene área, rendimiento ni precio: no suma al predio.
    const panel = screen.getByTestId("rural.resultado_panel");
    expect(within(panel).getByText(/379\.350\.000/)).toBeInTheDocument();
  });

  it("advierte cuando los parámetros salen del rango técnico", async () => {
    const user = userEvent.setup();
    render(<AvaluoRuralPage />);

    expect(
      screen.queryByTestId("rural.parametros_warning"),
    ).not.toBeInTheDocument();

    const participacion = screen.getByTestId("rural.participacion_input");
    await user.clear(participacion);
    await user.type(participacion, "60");

    expect(screen.getByTestId("rural.parametros_warning")).toBeInTheDocument();
  });

  it("restablece los valores iniciales con el botón de reinicio", async () => {
    const user = userEvent.setup();
    render(<AvaluoRuralPage />);

    const area = screen.getByTestId("rural.cultivo.area_input.1");
    await user.clear(area);
    await user.type(area, "24");
    expect(screen.getByTestId("rural.cultivo.area_input.1")).toHaveValue("24");

    await user.click(screen.getByTestId("rural.reset_button"));

    expect(screen.getByTestId("rural.cultivo.area_input.1")).toHaveValue("12");
    const panel = screen.getByTestId("rural.resultado_panel");
    expect(within(panel).getByText(/379\.350\.000/)).toBeInTheDocument();
  });

  it("precarga el ejemplo rural completo y reproduce su total", () => {
    // La página de ejemplos programa la carga antes de navegar; la calculadora
    // la consume una sola vez al montarse.
    programarCarga({
      cultivos: EJEMPLO_RURAL.cultivos,
      parametros: EJEMPLO_RURAL.parametros,
    });

    render(<AvaluoRuralPage />);

    // Las dos actividades del ejemplo, con sus áreas, quedan precargadas.
    expect(screen.getByTestId("rural.cultivo.card.1")).toBeInTheDocument();
    expect(screen.getByTestId("rural.cultivo.card.2")).toBeInTheDocument();
    expect(screen.getByTestId("rural.cultivo.nombre_input.1")).toHaveValue(
      "Café pergamino seco",
    );
    expect(screen.getByTestId("rural.cultivo.nombre_input.2")).toHaveValue(
      "Plátano asociado",
    );
    expect(screen.getByTestId("rural.cultivo.area_input.1")).toHaveValue("12");
    expect(screen.getByTestId("rural.cultivo.area_input.2")).toHaveValue("6,5");

    // El consolidado coincide con el ejemplo resuelto: 18,5 ha y el mismo total.
    const predio = calcularPredio(
      EJEMPLO_RURAL.cultivos,
      EJEMPLO_RURAL.parametros,
    );
    const panel = screen.getByTestId("rural.resultado_panel");
    expect(within(panel).getByText(/18,5 ha/)).toBeInTheDocument();
    // El total del ejemplo es la suma de las dos actividades: 496.593.750.
    expect(predio.valorTotal).toBe(496_593_750);
    expect(within(panel).getByText(/496\.593\.750/)).toBeInTheDocument();
    // El valor mostrado coincide con el del motor de cálculo.
    expect(formatCurrency(predio.valorTotal)).toContain("496.593.750");
  });

  it("interpreta la coma decimal digitada en un campo rural", async () => {
    const user = userEvent.setup();
    render(<AvaluoRuralPage />);

    // El rendimiento del café es 1,4 t/ha. Se digita con coma decimal y el
    // motor debe interpretarlo como 1,4 y no como 14.
    const rendimiento = screen.getByTestId("rural.cultivo.rendimiento_input.1");
    await user.clear(rendimiento);
    await user.type(rendimiento, "2,5");

    // Ingresos/ha = 2,5 × 14.500.000 = 36.250.000; costos 11.870.000;
    // utilidad 24.380.000; renta 7.314.000; valor/ha 91.425.000 × 12 ha.
    const panel = screen.getByTestId("rural.resultado_panel");
    expect(within(panel).getByText(/1\.097\.100\.000/)).toBeInTheDocument();
  });
});
