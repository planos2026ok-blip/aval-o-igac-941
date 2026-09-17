import { AppShell } from "@/components/AppShell";
import { NAV_SECTIONS } from "@/lib/nav";
import AvaluoRuralPage from "@/pages/AvaluoRuralPage";
import AvaluoUrbanoPage from "@/pages/AvaluoUrbanoPage";
import EjemplosPage from "@/pages/EjemplosPage";
import ExportarPage from "@/pages/ExportarPage";
import InformePage from "@/pages/InformePage";
import TablaRossHeideckPage from "@/pages/TablaRossHeideckPage";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
  useRouterState,
} from "@tanstack/react-router";
import type { ReactElement } from "react";

function RootLayout() {
  const { location } = useRouterState();
  return (
    <AppShell activePath={location.pathname}>
      <Outlet />
    </AppShell>
  );
}

const rootRoute = createRootRoute({ component: RootLayout });

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: InformePage,
});

/** Componente real de cada sección del expediente, indexado por ruta. */
const SECTION_COMPONENTS: Record<string, () => ReactElement> = {
  "/tabla-ross-heideck": TablaRossHeideckPage,
  "/avaluo-urbano": AvaluoUrbanoPage,
  "/avaluo-rural": AvaluoRuralPage,
  "/ejemplos": EjemplosPage,
  "/exportar": ExportarPage,
};

const sectionRoutes = NAV_SECTIONS.filter(
  (section) => section.path !== "/",
).map((section) =>
  createRoute({
    getParentRoute: () => rootRoute,
    path: section.path,
    component: SECTION_COMPONENTS[section.path] ?? InformePage,
  }),
);

const routeTree = rootRoute.addChildren([indexRoute, ...sectionRoutes]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
