import { EJEMPLO_RURAL, EJEMPLO_URBANO } from "@/content/ejemplos";
import { consumirCarga } from "@/hooks/useProyecto";
import type { EntradasRurales, EntradasUrbanas } from "@/lib/proyecto";
import { obtenerProyecto, restablecerProyecto } from "@/lib/proyecto";
import EjemplosPage from "@/pages/EjemplosPage";
import { renderWithRouter } from "@/test/render";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

/**
 * La página de ejemplos debe mostrar ambos casos resueltos con la memoria de
 * cálculo completa. Los enlaces de carga apuntan a las calculadoras, por lo que
 * la página se monta bajo un router en memoria que resuelve sus destinos.
 */
describe("EjemplosPage", () => {
  beforeEach(() => {
    restablecerProyecto();
  });

  afterEach(() => {
    restablecerProyecto();
  });

  it("renderiza el encabezado y los dos casos resueltos", async () => {
    await renderWithRouter(<EjemplosPage />);

    expect(
      screen.getByRole("heading", { name: "Ejemplos prácticos resueltos" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("ejemplo.urbano")).toBeInTheDocument();
    expect(screen.getByTestId("ejemplo.rural")).toBeInTheDocument();
  });

  it("muestra el caso urbano con sus datos y su memoria de nueve pasos", async () => {
    await renderWithRouter(<EjemplosPage />);

    const urbano = screen.getByTestId("ejemplo.urbano");
    expect(
      within(urbano).getByRole("heading", { name: EJEMPLO_URBANO.titulo }),
    ).toBeInTheDocument();
    expect(
      within(urbano).getByRole("heading", {
        name: "Memoria de cálculo paso a paso",
      }),
    ).toBeInTheDocument();
    expect(
      within(urbano).getByText("Valor a nuevo de la construcción"),
    ).toBeInTheDocument();
    expect(
      within(urbano).getByText("Avalúo consolidado del inmueble"),
    ).toBeInTheDocument();
  });

  it("muestra el caso rural con sus dos actividades productivas", async () => {
    await renderWithRouter(<EjemplosPage />);

    const rural = screen.getByTestId("ejemplo.rural");
    expect(
      within(rural).getByRole("heading", { name: EJEMPLO_RURAL.titulo }),
    ).toBeInTheDocument();
    expect(
      within(rural).getByTestId("ejemplo.rural.actividad.1"),
    ).toBeInTheDocument();
    expect(
      within(rural).getByTestId("ejemplo.rural.actividad.2"),
    ).toBeInTheDocument();
  });

  it("muestra el resultado consolidado del caso urbano", async () => {
    await renderWithRouter(<EjemplosPage />);

    const resultado = screen.getByTestId("ejemplo.urbano.resultado");
    // Terreno 450.000.000 + construcción depreciada: aparece en la fórmula
    // sustituida y en la fila del desglose.
    expect(
      within(resultado).getAllByText(/450\.000\.000/).length,
    ).toBeGreaterThan(0);
  });

  it("muestra el resultado consolidado del caso rural", async () => {
    await renderWithRouter(<EjemplosPage />);

    const resultado = screen.getByTestId("ejemplo.rural.resultado");
    // El área total aparece en la unidad del panel y en la fórmula sustituida.
    expect(within(resultado).getAllByText(/18,5 ha/).length).toBeGreaterThan(0);
  });

  it("ofrece los botones de carga hacia las calculadoras", async () => {
    await renderWithRouter(<EjemplosPage />);

    expect(screen.getByTestId("ejemplo.urbano.cargar_button")).toHaveAttribute(
      "href",
      "/avaluo-urbano",
    );
    expect(screen.getByTestId("ejemplo.rural.cargar_button")).toHaveAttribute(
      "href",
      "/avaluo-rural",
    );
  });

  it("publica el caso rural completo y programa su carga al pulsar el botón", async () => {
    const user = userEvent.setup();
    await renderWithRouter(<EjemplosPage />);

    await user.click(screen.getByTestId("ejemplo.rural.cargar_button"));

    // El estado compartido recibe las dos actividades del ejemplo.
    const proyecto = obtenerProyecto();
    expect(proyecto.hayDatosUsuario).toBe(true);
    expect(proyecto.rural.cultivos).toHaveLength(2);
    expect(proyecto.rural.cultivos.map((c) => c.nombre)).toEqual([
      "Café pergamino seco",
      "Plátano asociado",
    ]);
    expect(proyecto.rural.parametros).toEqual(EJEMPLO_RURAL.parametros);

    // La carga pendiente que consumirá la calculadora rural es el mismo caso.
    const carga = consumirCarga<EntradasRurales>();
    expect(carga).not.toBeNull();
    expect(carga?.cultivos).toHaveLength(2);
    expect(carga?.cultivos[0].areaHa).toBe(12);
    expect(carga?.cultivos[1].areaHa).toBe(6.5);
  });

  it("publica el caso urbano completo y programa su carga al pulsar el botón", async () => {
    const user = userEvent.setup();
    await renderWithRouter(<EjemplosPage />);

    await user.click(screen.getByTestId("ejemplo.urbano.cargar_button"));

    const proyecto = obtenerProyecto();
    expect(proyecto.hayDatosUsuario).toBe(true);
    // El caso urbano precarga comparables, Ross-Heideck y técnica residual.
    expect(proyecto.urbano.comparables).toHaveLength(3);
    expect(proyecto.urbano.areaConstruidaTexto).toBe(
      EJEMPLO_URBANO.entradas.areaConstruidaTexto,
    );
    expect(proyecto.urbano.valorNuevoM2Texto).toBe(
      EJEMPLO_URBANO.entradas.valorNuevoM2Texto,
    );
    expect(proyecto.urbano.edadTexto).toBe(EJEMPLO_URBANO.entradas.edadTexto);
    expect(proyecto.urbano.vidaUtilTexto).toBe(
      EJEMPLO_URBANO.entradas.vidaUtilTexto,
    );
    expect(proyecto.urbano.estadoKey).toBe(EJEMPLO_URBANO.entradas.estadoKey);
    expect(proyecto.urbano.valorVentaTexto).toBe(
      EJEMPLO_URBANO.residual.valorVentaTexto,
    );
    expect(proyecto.urbano.origenTerreno).toBe("residual");
    expect(proyecto.urbano.origenConstruccion).toBe("ross");

    const carga = consumirCarga<EntradasUrbanas>();
    expect(carga).not.toBeNull();
    expect(carga?.comparables).toHaveLength(3);
    expect(carga?.areaConstruidaTexto).toBe(
      EJEMPLO_URBANO.entradas.areaConstruidaTexto,
    );
  });
});
