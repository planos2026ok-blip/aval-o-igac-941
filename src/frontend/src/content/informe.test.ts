import {
  ESTADOS_HEIDECK,
  FORMULAS_REFERENCIA,
  INFORME_SECTIONS,
  TABLA_ROSS_HEIDECK,
} from "@/content/informe";
import { describe, expect, it } from "vitest";

/**
 * La tabla Ross-Heideck debe reproducirse íntegra y sin modificación del anexo
 * técnico. Estas pruebas fijan su forma y sus valores de frontera para que una
 * edición accidental no pase inadvertida.
 */
describe("TABLA_ROSS_HEIDECK", () => {
  it("tiene 100 filas, de 0 % a 99 % de vida útil", () => {
    expect(TABLA_ROSS_HEIDECK).toHaveLength(100);
    expect(TABLA_ROSS_HEIDECK[0][0]).toBe(0);
    expect(TABLA_ROSS_HEIDECK[99][0]).toBe(99);
  });

  it("tiene diez columnas por fila: porcentaje más nueve estados", () => {
    for (const fila of TABLA_ROSS_HEIDECK) {
      expect(fila).toHaveLength(10);
    }
    expect(ESTADOS_HEIDECK).toHaveLength(9);
  });

  it("numera las filas de forma consecutiva", () => {
    TABLA_ROSS_HEIDECK.forEach((fila, index) => {
      expect(fila[0]).toBe(index);
    });
  });

  it("conserva los valores de frontera del anexo", () => {
    // Fila 0: estado 1 = 0, estado 5 = 1.
    expect(TABLA_ROSS_HEIDECK[0][1]).toBe(0);
    expect(TABLA_ROSS_HEIDECK[0][9]).toBe(1.0);
    // Fila 50: estado 1 = 0,375, estado 5 = 1.
    expect(TABLA_ROSS_HEIDECK[50][1]).toBeCloseTo(0.375, 6);
    expect(TABLA_ROSS_HEIDECK[50][9]).toBe(1.0);
    // Fila 99: estado 1 = 0,98505.
    expect(TABLA_ROSS_HEIDECK[99][1]).toBeCloseTo(0.98505, 6);
  });

  it("mantiene los coeficientes dentro del rango 0 a 1", () => {
    for (const fila of TABLA_ROSS_HEIDECK) {
      const [, ...coeficientes] = fila;
      for (const coeficiente of coeficientes) {
        expect(coeficiente).toBeGreaterThanOrEqual(0);
        expect(coeficiente).toBeLessThanOrEqual(1);
      }
    }
  });

  it("mantiene la columna del estado 5 (demolición) en 1 para toda la tabla", () => {
    for (const fila of TABLA_ROSS_HEIDECK) {
      expect(fila[9]).toBe(1.0);
    }
  });

  it("crece de forma monótona con el porcentaje de vida en cada estado", () => {
    for (let columna = 1; columna <= 9; columna += 1) {
      for (let fila = 1; fila < TABLA_ROSS_HEIDECK.length; fila += 1) {
        expect(TABLA_ROSS_HEIDECK[fila][columna]).toBeGreaterThanOrEqual(
          TABLA_ROSS_HEIDECK[fila - 1][columna],
        );
      }
    }
  });
});

describe("ESTADOS_HEIDECK", () => {
  it("declara los nueve estados en el orden de las columnas", () => {
    expect(ESTADOS_HEIDECK.map((estado) => estado.key)).toEqual([
      "1",
      "1,5",
      "2",
      "2,5",
      "3",
      "3,5",
      "4",
      "4,5",
      "5",
    ]);
  });

  it("etiqueta cada estado con su descripción", () => {
    expect(ESTADOS_HEIDECK[0].label).toContain("Óptima");
    expect(ESTADOS_HEIDECK[8].label).toContain("Demolición");
  });
});

describe("FORMULAS_REFERENCIA", () => {
  it("incluye las fórmulas clave del anexo técnico", () => {
    const ids = FORMULAS_REFERENCIA.map((formula) => formula.id);
    expect(ids).toContain("ross-heideck");
    expect(ids).toContain("capitalizacion-directa");
    expect(ids).toContain("flujo-descontado");
    expect(ids).toContain("residual");
    expect(ids).toContain("vida-util-prolongada");
    expect(ids).toContain("rural");
  });

  it("documenta variables y pasos en cada fórmula", () => {
    for (const formula of FORMULAS_REFERENCIA) {
      expect(formula.name.length).toBeGreaterThan(0);
      expect(formula.expression.length).toBeGreaterThan(0);
      expect(formula.variables.length).toBeGreaterThan(0);
      expect(formula.steps.length).toBeGreaterThan(0);
      for (const variable of formula.variables) {
        expect(variable.symbol.length).toBeGreaterThan(0);
        expect(variable.meaning.length).toBeGreaterThan(0);
        expect(variable.unit.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("INFORME_SECTIONS", () => {
  it("estructura el informe por títulos con artículos clave", () => {
    expect(INFORME_SECTIONS.length).toBeGreaterThanOrEqual(7);
    for (const seccion of INFORME_SECTIONS) {
      expect(seccion.id.length).toBeGreaterThan(0);
      expect(seccion.eyebrow).toContain("Título");
      expect(seccion.articles.length).toBeGreaterThan(0);
      for (const articulo of seccion.articles) {
        expect(articulo.label).toContain("Artículo");
        expect(articulo.paragraphs.length).toBeGreaterThan(0);
      }
    }
  });

  it("resume los artículos clave sin transcribir los 61 artículos", () => {
    const totalArticulos = INFORME_SECTIONS.reduce(
      (total, seccion) => total + seccion.articles.length,
      0,
    );
    expect(totalArticulos).toBeGreaterThan(0);
    expect(totalArticulos).toBeLessThan(61);
  });
});
