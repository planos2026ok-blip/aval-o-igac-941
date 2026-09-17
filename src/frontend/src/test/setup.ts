import "@testing-library/jest-dom/vitest";
import { cleanup, configure } from "@testing-library/react";
import { afterEach } from "vitest";

/**
 * Setup global de la suite.
 *
 * - Registra los matchers de jest-dom (`toBeInTheDocument`, etc.).
 * - Alinea `getByTestId` con el atributo que usa la aplicación (`data-ocid`),
 *   de modo que las consultas por identificador observen el marcado real.
 * - Desmonta el árbol de React entre pruebas para evitar fugas de estado.
 * - Provee `matchMedia`, que jsdom no implementa y que los componentes de
 *   Radix UI y el hook `use-mobile` consultan al montar.
 */
configure({ testIdAttribute: "data-ocid" });

afterEach(() => {
  cleanup();
});

if (!window.matchMedia) {
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  });
}

if (!window.ResizeObserver) {
  class ResizeObserverStub {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
  window.ResizeObserver =
    ResizeObserverStub as unknown as typeof ResizeObserver;
}

if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

/**
 * jsdom no implementa la API de objetos URL, que la exportación usa para
 * construir el blob descargable. Se proveen stubs para que los espías de las
 * pruebas puedan sustituirlos y observar la descarga.
 */
if (typeof URL.createObjectURL !== "function") {
  URL.createObjectURL = () => "blob:stub";
}

if (typeof URL.revokeObjectURL !== "function") {
  URL.revokeObjectURL = () => {};
}
