import { NAV_SECTIONS } from "@/lib/nav";
import {
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { render } from "@testing-library/react";
import type { ReactElement } from "react";

/**
 * Utilidades de render para la suite.
 *
 * Las páginas que usan `Link` de TanStack Router necesitan un contexto de
 * router real: sin él, el componente falla con "Cannot read properties of null
 * (reading '__store')". Este helper monta la página bajo un router en memoria
 * con las mismas rutas declaradas en `NAV_SECTIONS`, de modo que los enlaces
 * resuelven a sus destinos reales sin levantar la aplicación completa.
 */

/**
 * Renderiza `ui` dentro de un router en memoria posicionado en `initialPath`.
 * La página se monta como componente de la ruta raíz, de modo que hereda el
 * contexto del router y sus `Link` resuelven contra el árbol de rutas real.
 *
 * El router se carga antes de renderizar (`router.load()`), porque TanStack
 * Router resuelve las coincidencias de forma asíncrona y, sin esperar, el
 * primer render devuelve un árbol vacío.
 */
export async function renderWithRouter(
  ui: ReactElement,
  initialPath = "/",
): Promise<ReturnType<typeof render>> {
  const rootRoute = createRootRoute({ component: () => ui });

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
