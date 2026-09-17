import { EJEMPLO_URBANO } from "@/content/ejemplos";
import { publicarEntradasUrbanas } from "@/lib/proyecto";
import { restablecerProyecto } from "@/lib/proyecto";
import AvaluoUrbanoPage from "@/pages/AvaluoUrbanoPage";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

/**
 * Recorrido de integración de la calculadora urbana: los valores precargados
 * producen resultados reproducibles y editar una entrada recalcula la memoria.
 * Es cobertura de componente, no de navegador desplegado.
 */
describe("AvaluoUrbanoPage", () => {
  beforeEach(() => {
    restablecerProyecto();
  });

  afterEach(() => {
    restablecerProyecto();
  });

  it("renderiza los siete bloques de la memoria de cálculo", () => {
    render(<AvaluoUrbanoPage />);

    expect(
      screen.getByRole("heading", { name: "Calculadora de avalúo urbano" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Método de mercado" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Método de renta — capitalización directa",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Método de renta — flujo de caja descontado",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Método de costo con Ross-Heideck",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Vida útil prolongada" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Técnica residual" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "Resultado consolidado del avalúo urbano",
      }),
    ).toBeInTheDocument();
  });

  it("muestra el valor unitario promedio de los comparables precargados", () => {
    render(<AvaluoUrbanoPage />);

    const panel = screen.getByTestId("mercado.result");
    // Media de 468M/86, 512M/94 y 441M/82 ≈ 5.414.000. El valor aparece en la
    // fórmula sustituida y en el resultado destacado.
    expect(
      within(panel).getAllByText(/5\.4\d\d\.\d\d\d/).length,
    ).toBeGreaterThan(0);
    expect(within(panel).getByText("3")).toBeInTheDocument();
  });

  it("muestra el valor avisado por Ross-Heideck y la lectura de la tabla", () => {
    render(<AvaluoUrbanoPage />);

    const panel = screen.getByTestId("ross.result");
    // Vn = 86 × 3.850.000 = 331.100.000, presente en la fórmula y en el desglose.
    expect(within(panel).getAllByText(/331\.100\.000/).length).toBeGreaterThan(
      0,
    );
    expect(within(panel).getByText("0,2571")).toBeInTheDocument();
  });

  it("muestra el valor residual del terreno precargado", () => {
    render(<AvaluoUrbanoPage />);

    const panel = screen.getByTestId("residual.result");
    // 2.400.000.000 − 1.950.000.000 = 450.000.000, en la fórmula y en el resultado.
    expect(within(panel).getAllByText(/450\.000\.000/).length).toBeGreaterThan(
      0,
    );
  });

  it("recalcula el consolidado al cambiar el origen del terreno a manual", async () => {
    const user = userEvent.setup();
    render(<AvaluoUrbanoPage />);

    const panel = screen.getByTestId("consolidado.result");
    // Con el residual: 450.000.000 de terreno, en la fórmula y en el desglose.
    expect(within(panel).getAllByText(/450\.000\.000/).length).toBeGreaterThan(
      0,
    );

    await user.click(screen.getByTestId("consolidado.toggle.terreno_manual"));

    // El valor manual precargado es 520.000.000.
    expect(within(panel).getAllByText(/520\.000\.000/).length).toBeGreaterThan(
      0,
    );
  });

  it("recalcula la capitalización directa al editar la renta neta", async () => {
    const user = userEvent.setup();
    render(<AvaluoUrbanoPage />);

    const panel = screen.getByTestId("capitalizacion.result");
    // 54.000.000 / 0,095 ≈ 568.421.053, en la fórmula y en el resultado.
    expect(within(panel).getAllByText(/568\.421\.053/).length).toBeGreaterThan(
      0,
    );

    const renta = screen.getByTestId("capitalizacion.input.renta");
    await user.clear(renta);
    await user.type(renta, "95.000.000");

    // 95.000.000 / 0,095 = 1.000.000.000.
    expect(
      within(panel).getAllByText(/1\.000\.000\.000/).length,
    ).toBeGreaterThan(0);
  });

  it("agrega y elimina comparables del método de mercado", async () => {
    const user = userEvent.setup();
    render(<AvaluoUrbanoPage />);

    expect(screen.getAllByTestId(/^mercado\.row\./)).toHaveLength(3);

    await user.click(screen.getByTestId("mercado.add_button"));
    expect(screen.getAllByTestId(/^mercado\.row\./)).toHaveLength(4);

    await user.click(screen.getByTestId("mercado.delete_button.4"));
    expect(screen.getAllByTestId(/^mercado\.row\./)).toHaveLength(3);
  });

  it("marca la vida útil prolongada como procedente con los valores precargados", () => {
    render(<AvaluoUrbanoPage />);

    const semaforo = screen.getByTestId("vup.semaforo");
    expect(
      within(semaforo).getByText(/Procede reconocer la vida útil prolongada/),
    ).toBeInTheDocument();
  });

  it("deja de proceder la vida útil prolongada si el EC sale del rango", async () => {
    const user = userEvent.setup();
    render(<AvaluoUrbanoPage />);

    const ec = screen.getByTestId("vup.input.ec");
    await user.clear(ec);
    await user.type(ec, "2");

    const semaforo = screen.getByTestId("vup.semaforo");
    expect(
      within(semaforo).getByText(/debe estar entre 2,5 y 4,5/),
    ).toBeInTheDocument();
  });

  it("precarga el caso urbano completo publicado por la página de ejemplos", () => {
    // La página de ejemplos publica el caso completo en el estado compartido
    // antes de navegar; la calculadora lo lee al montarse.
    publicarEntradasUrbanas({
      ...EJEMPLO_URBANO.entradas,
      comparables: EJEMPLO_URBANO.comparables,
      rentaTexto: "54.000.000",
      tasaCapTexto: "9,5",
      fnoTexto: "48.000.000",
      crecimientoTexto: "3,5",
      tasaDescTexto: "11",
      aniosTexto: "5",
      valorTerminalTexto: "620.000.000",
      vurTexto: "70",
      edadVupTexto: "64",
      ecTexto: "3",
      ...EJEMPLO_URBANO.residual,
      origenTerreno: "residual",
      terrenoManualTexto: "520.000.000",
      origenConstruccion: "ross",
      construccionManualTexto: "180.000.000",
    });

    render(<AvaluoUrbanoPage />);

    // Las entradas del caso quedan precargadas en los campos del formulario.
    expect(screen.getByTestId("ross.input.area")).toHaveValue("86");
    expect(screen.getByTestId("ross.input.valor_m2")).toHaveValue("3.850.000");
    expect(screen.getByTestId("ross.input.edad")).toHaveValue("18");
    expect(screen.getByTestId("ross.input.vida_util")).toHaveValue("70");
    expect(screen.getByTestId("residual.input.venta")).toHaveValue(
      "2.400.000.000",
    );

    // El consolidado reproduce el caso: terreno residual 450.000.000.
    const panel = screen.getByTestId("consolidado.result");
    expect(within(panel).getAllByText(/450\.000\.000/).length).toBeGreaterThan(
      0,
    );
  });
});
