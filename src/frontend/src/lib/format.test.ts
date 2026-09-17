import {
  formatArea,
  formatCurrency,
  formatCurrencyPrecise,
  formatFactor,
  formatHectares,
  formatLongDate,
  formatNumber,
  formatPercent,
  parseNumberInput,
} from "@/lib/format";
import { describe, expect, it } from "vitest";

describe("formatCurrency", () => {
  it("formatea en pesos colombianos sin decimales", () => {
    const resultado = formatCurrency(468_000_000);
    expect(resultado).toContain("468.000.000");
    expect(resultado).not.toContain(",00");
  });

  it("devuelve un guion para valores no finitos", () => {
    expect(formatCurrency(Number.NaN)).toBe("—");
    expect(formatCurrency(Number.POSITIVE_INFINITY)).toBe("—");
  });
});

describe("formatCurrencyPrecise", () => {
  it("incluye dos decimales", () => {
    expect(formatCurrencyPrecise(1234.5)).toContain(",50");
  });
});

describe("formatNumber", () => {
  it("usa el separador de miles colombiano", () => {
    expect(formatNumber(1_234_567)).toBe("1.234.567");
  });

  it("devuelve un guion para valores no finitos", () => {
    expect(formatNumber(Number.NaN)).toBe("—");
  });
});

describe("formatPercent", () => {
  it("agrega el signo de porcentaje con dos decimales", () => {
    expect(formatPercent(7.5)).toBe("7,50 %");
  });

  it("devuelve un guion para valores no finitos", () => {
    expect(formatPercent(Number.NaN)).toBe("—");
  });
});

describe("formatFactor", () => {
  it("fija cuatro decimales con coma decimal", () => {
    expect(formatFactor(0.2571)).toBe("0,2571");
  });
});

describe("formatArea y formatHectares", () => {
  it("agrega la unidad de área", () => {
    expect(formatArea(86)).toBe("86 m²");
    expect(formatHectares(18.5)).toBe("18,5 ha");
  });

  it("devuelve un guion para valores no finitos", () => {
    expect(formatArea(Number.NaN)).toBe("—");
    expect(formatHectares(Number.NaN)).toBe("—");
  });
});

describe("parseNumberInput", () => {
  it("interpreta el registro colombiano: punto de miles y coma decimal", () => {
    expect(parseNumberInput("3.850.000")).toBe(3_850_000);
    expect(parseNumberInput("9,5")).toBe(9.5);
    expect(parseNumberInput("1.234,56")).toBe(1234.56);
  });

  it("tolera espacios en blanco", () => {
    expect(parseNumberInput("  86  ")).toBe(86);
    expect(parseNumberInput("3 850 000")).toBe(3_850_000);
  });

  it("devuelve NaN para una cadena vacía", () => {
    expect(Number.isNaN(parseNumberInput(""))).toBe(true);
    expect(Number.isNaN(parseNumberInput("   "))).toBe(true);
  });

  it("devuelve NaN para texto no numérico", () => {
    expect(Number.isNaN(parseNumberInput("abc"))).toBe(true);
  });
});

describe("formatLongDate", () => {
  it("formatea la fecha en registro legal colombiano", () => {
    const resultado = formatLongDate(new Date(2026, 8, 17));
    expect(resultado).toContain("2026");
    expect(resultado.toLowerCase()).toContain("septiembre");
  });
});
