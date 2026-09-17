import { AppShell } from "@/components/AppShell";
import { NAV_SECTIONS } from "@/lib/nav";
import { restablecerProyecto } from "@/lib/proyecto";
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Recorrido crítico del armazón: la aplicación carga sin pantalla en blanco en
 * la ruta principal y el botón EXPORTAR PROYECTO del encabezado descarga el
 * informe autocontenido desde cualquier sección, no solo desde Exportar.
 *
 * Es cobertura de componente/integración con jsdom: la descarga real del
 * navegador se sustituye por un espía sobre el enlace temporal y sobre la API
 * de objetos URL, de modo que se observa el HTML generado sin tocar la red.
 */
async function renderShell(initialPath: string, children: React.ReactNode) {
  const rootRoute = createRootRoute({
    component: () => <AppShell activePath={initialPath}>{children}</AppShell>,
  });

  const sectionRoutes = NAV_SECTIONS.map((section) =>
    createRoute({
      getParentRoute: () => rootRoute,
      path: section.path,
      component: () => null,
    }),
  );

  const router = createRouter({
    routeTree: rootRoute.addChildren(sectionRoutes),
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });

  await router.load();

  return render(<RouterProvider router={router} />);
}

describe("AppShell", () => {
  beforeEach(() => {
    restablecerProyecto();
  });

  afterEach(() => {
    restablecerProyecto();
  });

  it("carga el armazón y el contenido de la ruta principal sin pantalla en blanco", async () => {
    await renderShell("/", <h1>Informe técnico de avalúos</h1>);

    // Encabezado, índice lateral y contenido de la ruta conviven en el árbol.
    expect(screen.getByTestId("app.header")).toBeInTheDocument();
    expect(screen.getByTestId("nav.sidebar")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Informe técnico de avalúos" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("app.page")).toBeInTheDocument();
  });

  it("marca la sección activa del índice según la ruta", async () => {
    await renderShell("/avaluo-urbano", <p>Calculadora urbana</p>);

    expect(screen.getByTestId("nav.link.avaluo-urbano")).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByTestId("nav.link.informe")).not.toHaveAttribute(
      "aria-current",
    );
  });

  it("descarga el informe autocontenido desde una sección que no es Exportar", async () => {
    const user = userEvent.setup();
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, "click")
      .mockImplementation(() => {});
    let htmlDescargado = "";
    vi.spyOn(URL, "createObjectURL").mockImplementation((blob) => {
      // El blob es el documento HTML que el encabezado entrega al navegador.
      htmlDescargado = (blob as Blob).type.includes("text/html")
        ? "blob:informe"
        : "blob:otro";
      return "blob:informe";
    });
    const revokeSpy = vi
      .spyOn(URL, "revokeObjectURL")
      .mockImplementation(() => {});

    await renderShell("/avaluo-urbano", <p>Calculadora urbana</p>);

    await user.click(screen.getByTestId("app.export_button"));

    expect(clickSpy).toHaveBeenCalledTimes(1);
    expect(revokeSpy).toHaveBeenCalledTimes(1);
    expect(htmlDescargado).toBe("blob:informe");
    // La confirmación del encabezado aparece con el nombre del archivo.
    await waitFor(() => {
      expect(
        screen.getByTestId("app.export_success_state"),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByText(/avaluo-comercial-apartamento-calle-45-12-30\.html/),
    ).toBeInTheDocument();
  });

  it("incluye los datos del proyecto y las fórmulas en el HTML exportado", async () => {
    const user = userEvent.setup();
    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    let blobCapturado: Blob | undefined;
    vi.spyOn(URL, "createObjectURL").mockImplementation((blob) => {
      blobCapturado = blob as Blob;
      return "blob:informe";
    });
    vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

    await renderShell("/tabla-ross-heideck", <p>Tabla</p>);

    await user.click(screen.getByTestId("app.export_button"));

    expect(blobCapturado).toBeDefined();
    // jsdom no implementa `Blob.text()`; se lee el contenido con FileReader.
    const html = await new Promise<string>((resolve, reject) => {
      const lector = new FileReader();
      lector.onload = () => resolve(String(lector.result));
      lector.onerror = () => reject(lector.error);
      lector.readAsText(blobCapturado as Blob);
    });
    // Documento autocontenido con la identificación, las fórmulas y los
    // resultados paso a paso del expediente.
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("Avalúo comercial");
    expect(html).toContain("Fórmulas aplicadas");
    expect(html).toContain("Resolución IGAC 941 de 2026");
    // Autocontenido: sin recursos remotos.
    expect(html).not.toContain("http://");
    expect(html).not.toContain("https://");
  });
});
