import { EXPORT_PROJECT_EVENT } from "@/lib/nav";
import { restablecerProyecto } from "@/lib/proyecto";
import ExportarPage from "@/pages/ExportarPage";
import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Recorrido de integración de la exportación: la vista previa refleja la
 * selección de secciones, el nombre del archivo se deriva del proyecto y el
 * botón de descarga produce el HTML autocontenido. La descarga real del
 * navegador se sustituye por un espía sobre el enlace temporal.
 *
 * El estado del proyecto vive durante toda la sesión de la aplicación y no se
 * reinicia al desmontar el último suscriptor, de modo que cada caso parte de
 * un almacén limpio con `restablecerProyecto`.
 */
describe("ExportarPage", () => {
  beforeEach(() => {
    restablecerProyecto();
  });

  afterEach(() => {
    restablecerProyecto();
  });

  it("renderiza el encabezado, la identificación y la vista previa", () => {
    render(<ExportarPage />);

    expect(
      screen.getByRole("heading", { name: "Exportar el expediente" }),
    ).toBeInTheDocument();
    // El título del panel y el de la vista previa comparten texto: se acota al
    // panel de identificación.
    const panel = screen.getByTestId("exportar.identificacion_panel");
    expect(
      within(panel).getByRole("heading", {
        name: "Identificación del proyecto",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Vista previa del contenido" }),
    ).toBeInTheDocument();
  });

  it("muestra las seis secciones activas por defecto", () => {
    render(<ExportarPage />);

    expect(screen.getByText("6 de 6 secciones activas.")).toBeInTheDocument();
    expect(screen.getByTestId("exportar.preview.urbano")).toBeInTheDocument();
    expect(screen.getByTestId("exportar.preview.rural")).toBeInTheDocument();
    expect(
      screen.getByTestId("exportar.preview.ross_heideck"),
    ).toBeInTheDocument();
  });

  it("deriva el nombre del archivo del nombre del proyecto", async () => {
    const user = userEvent.setup();
    render(<ExportarPage />);

    const nombre = screen.getByTestId("exportar.nombre_input");
    await user.clear(nombre);
    await user.type(nombre, "Avalúo Salgar 2026");

    expect(screen.getByText("avaluo-salgar-2026.html")).toBeInTheDocument();
  });

  it("excluye una sección de la vista previa al desmarcarla", async () => {
    const user = userEvent.setup();
    render(<ExportarPage />);

    expect(screen.getByTestId("exportar.preview.rural")).toBeInTheDocument();

    await user.click(screen.getByTestId("exportar.seccion_checkbox.rural"));

    expect(
      screen.queryByTestId("exportar.preview.rural"),
    ).not.toBeInTheDocument();
    expect(screen.getByText("5 de 6 secciones activas.")).toBeInTheDocument();
  });

  it("muestra el estado vacío cuando no hay secciones seleccionadas", async () => {
    const user = userEvent.setup();
    render(<ExportarPage />);

    for (const key of [
      "identificacion",
      "urbano",
      "rural",
      "formulas",
      "ross-heideck",
      "informe",
    ]) {
      await user.click(screen.getByTestId(`exportar.seccion_checkbox.${key}`));
    }

    expect(screen.getByTestId("exportar.empty_state")).toBeInTheDocument();
    expect(screen.getByText("0 de 6 secciones activas.")).toBeInTheDocument();
  });

  it("descarga el informe y muestra la confirmación", async () => {
    const user = userEvent.setup();
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    const createUrl = vi
      .spyOn(URL, "createObjectURL")
      .mockReturnValue("blob:informe");
    const revokeUrl = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => {});

    render(<ExportarPage />);

    await user.click(screen.getByTestId("exportar.download_button"));

    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(createUrl).toHaveBeenCalledTimes(1);
    expect(revokeUrl).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("exportar.success_state")).toBeInTheDocument();
    // El nombre del archivo aparece en la identificación, el resumen y la
    // confirmación de descarga.
    expect(
      screen.getAllByText(/avaluo-comercial-apartamento-calle-45-12-30\.html/)
        .length,
    ).toBeGreaterThan(0);
  });

  it("dispara la descarga desde el evento global del encabezado", async () => {
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    vi.spyOn(URL, "createObjectURL").mockReturnValue("blob:informe");
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

    render(<ExportarPage />);

    // El evento provoca una actualización de estado de React: se envuelve en
    // `act` para que el efecto se aplique antes de la aserción.
    await act(async () => {
      window.dispatchEvent(new CustomEvent(EXPORT_PROJECT_EVENT));
    });

    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("exportar.success_state")).toBeInTheDocument();
  });

  it("restablece la identificación y las secciones", async () => {
    const user = userEvent.setup();
    render(<ExportarPage />);

    const nombre = screen.getByTestId("exportar.nombre_input");
    await user.clear(nombre);
    await user.type(nombre, "Otro proyecto");
    await user.click(screen.getByTestId("exportar.seccion_checkbox.rural"));

    await user.click(screen.getByTestId("exportar.reset_button"));

    expect(screen.getByTestId("exportar.nombre_input")).toHaveValue(
      "Avalúo comercial — Apartamento Calle 45 # 12-30",
    );
    expect(screen.getByText("6 de 6 secciones activas.")).toBeInTheDocument();
  });

  it("resume el contenido del archivo en el panel lateral", () => {
    render(<ExportarPage />);

    const panel = screen.getByTestId("exportar.resumen_panel");
    expect(within(panel).getByText("100 filas")).toBeInTheDocument();
    expect(within(panel).getByText("6")).toBeInTheDocument();
  });
});
