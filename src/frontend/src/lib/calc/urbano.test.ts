import {
  type Comparable,
  LIMITE_CV_URBANO,
  calcularCapitalizacionDirecta,
  calcularFlujoDescontado,
  calcularMercado,
  calcularResidual,
  calcularRossHeideck,
  calcularVidaUtilProlongada,
  consolidarAvaluo,
  leerCoeficienteK,
  redondear2,
} from "@/lib/calc/urbano";
import { describe, expect, it } from "vitest";

/** Comparable válido con precio y área explícitos. */
function comparable(id: string, precio: number, area: number): Comparable {
  return {
    id,
    descripcion: `Comparable ${id}`,
    precio,
    area,
    fuente: "Fuente de prueba",
    precioTexto: String(precio),
    areaTexto: String(area),
  };
}

describe("calcularMercado", () => {
  it("calcula el valor unitario, la media, la desviación y el CV de la muestra", () => {
    const resultado = calcularMercado([
      comparable("1", 468_000_000, 86),
      comparable("2", 512_000_000, 94),
      comparable("3", 441_000_000, 82),
    ]);

    expect(resultado.n).toBe(3);
    expect(resultado.comparables[0].valorUnitario).toBeCloseTo(
      468_000_000 / 86,
      6,
    );
    expect(resultado.media).toBeCloseTo(
      (468_000_000 / 86 + 512_000_000 / 94 + 441_000_000 / 82) / 3,
      6,
    );
    // Desviación estándar muestral (denominador n − 1).
    const valores = [468_000_000 / 86, 512_000_000 / 94, 441_000_000 / 82];
    const media = valores.reduce((a, b) => a + b, 0) / valores.length;
    const varianza =
      valores.reduce((total, v) => total + (v - media) ** 2, 0) /
      (valores.length - 1);
    expect(resultado.desviacion).toBeCloseTo(Math.sqrt(varianza), 6);
    expect(resultado.coeficienteVariacion).toBeCloseTo(
      (Math.sqrt(varianza) / media) * 100,
      6,
    );
    expect(resultado.limite).toBe(LIMITE_CV_URBANO);
  });

  it("marca cumple cuando el CV no supera el límite de 7,5 %", () => {
    const resultado = calcularMercado([
      comparable("1", 100_000_000, 100),
      comparable("2", 101_000_000, 100),
      comparable("3", 99_000_000, 100),
    ]);

    expect(resultado.coeficienteVariacion).toBeLessThanOrEqual(
      LIMITE_CV_URBANO,
    );
    expect(resultado.cumple).toBe(true);
  });

  it("marca no cumple cuando la dispersión supera el límite admisible", () => {
    const resultado = calcularMercado([
      comparable("1", 100_000_000, 100),
      comparable("2", 300_000_000, 100),
      comparable("3", 50_000_000, 100),
    ]);

    expect(resultado.coeficienteVariacion).toBeGreaterThan(LIMITE_CV_URBANO);
    expect(resultado.cumple).toBe(false);
  });

  it("descarta comparables con precio o área no positivos", () => {
    const resultado = calcularMercado([
      comparable("1", 100_000_000, 100),
      comparable("2", 0, 100),
      comparable("3", 100_000_000, 0),
      comparable("4", Number.NaN, 100),
    ]);

    expect(resultado.n).toBe(1);
    expect(resultado.comparables).toHaveLength(1);
    expect(resultado.comparables[0].id).toBe("1");
  });

  it("no calcula desviación ni CV con menos de dos comparables válidos", () => {
    const resultado = calcularMercado([comparable("1", 100_000_000, 100)]);

    expect(resultado.n).toBe(1);
    expect(Number.isNaN(resultado.desviacion)).toBe(true);
    expect(Number.isNaN(resultado.coeficienteVariacion)).toBe(true);
    expect(resultado.cumple).toBe(false);
  });

  it("devuelve fórmulas sustituidas con los valores ingresados", () => {
    const resultado = calcularMercado([
      comparable("1", 200_000_000, 100),
      comparable("2", 220_000_000, 100),
    ]);

    expect(resultado.formulaMedia).toContain("VU =");
    expect(resultado.formulaMedia).toContain("/m²");
    expect(resultado.formulaDesviacion).toContain("σ =");
    expect(resultado.formulaCV).toContain("CV =");
  });
});

describe("calcularCapitalizacionDirecta", () => {
  it("aplica A = R / i", () => {
    const resultado = calcularCapitalizacionDirecta(54_000_000, 0.095);

    expect(resultado.valor).toBeCloseTo(54_000_000 / 0.095, 6);
    expect(resultado.formula).toContain("A =");
  });

  it("devuelve NaN cuando la tasa no es positiva", () => {
    const resultado = calcularCapitalizacionDirecta(54_000_000, 0);

    expect(Number.isNaN(resultado.valor)).toBe(true);
  });
});

describe("calcularFlujoDescontado", () => {
  it("descuenta cada flujo y suma el valor terminal descontado", () => {
    const resultado = calcularFlujoDescontado(
      48_000_000,
      0.035,
      0.11,
      5,
      620_000_000,
    );

    expect(resultado.filas).toHaveLength(5);
    expect(resultado.filas[0].anio).toBe(1);
    expect(resultado.filas[0].fno).toBeCloseTo(48_000_000, 6);
    expect(resultado.filas[1].fno).toBeCloseTo(48_000_000 * 1.035, 6);
    expect(resultado.filas[0].factor).toBeCloseTo(1 / 1.11, 6);
    expect(resultado.filas[0].descontado).toBeCloseTo(
      (48_000_000 * 1) / 1.11,
      6,
    );

    const sumaManual = resultado.filas.reduce(
      (total, fila) => total + fila.descontado,
      0,
    );
    expect(resultado.sumaFlujos).toBeCloseTo(sumaManual, 6);

    const terminalDescontado = 620_000_000 / 1.11 ** 5;
    expect(resultado.valorTerminalDescontado).toBeCloseTo(
      terminalDescontado,
      6,
    );
    expect(resultado.valor).toBeCloseTo(sumaManual + terminalDescontado, 6);
  });

  it("no genera filas cuando el horizonte es cero", () => {
    const resultado = calcularFlujoDescontado(
      48_000_000,
      0.035,
      0.11,
      0,
      620_000_000,
    );

    expect(resultado.filas).toHaveLength(0);
    expect(resultado.formula).toContain("al menos un año");
  });
});

describe("leerCoeficienteK", () => {
  it("lee el coeficiente de la fila y la columna del estado", () => {
    // Fila 0, estado "1" (primera columna) = 0.
    expect(leerCoeficienteK(0, "1")).toBe(0);
    // Fila 50, estado "1" = 0.375.
    expect(leerCoeficienteK(50, "1")).toBeCloseTo(0.375, 6);
    // Fila 50, estado "5" (última columna) = 1.0.
    expect(leerCoeficienteK(50, "5")).toBe(1.0);
  });

  it("redondea el porcentaje de vida a la fila entera más cercana", () => {
    expect(leerCoeficienteK(50.4, "1")).toBe(leerCoeficienteK(50, "1"));
    expect(leerCoeficienteK(50.6, "1")).toBe(leerCoeficienteK(51, "1"));
  });

  it("acota el porcentaje al rango de la tabla (0 a 99)", () => {
    expect(leerCoeficienteK(-10, "1")).toBe(leerCoeficienteK(0, "1"));
    expect(leerCoeficienteK(150, "1")).toBe(leerCoeficienteK(99, "1"));
  });
});

describe("calcularRossHeideck", () => {
  it("aplica el modelo continuo D, E, FD y VA", () => {
    const resultado = calcularRossHeideck(86, 3_850_000, 18, 70, "2");

    const valorNuevo = 86 * 3_850_000;
    const relacion = 18 / 70;
    const depreciacion = 0.5 * relacion + 0.5 * relacion ** 2;
    const factorEstado = (100 - 2) / 100;
    const factorDepreciacion = 1 - depreciacion * factorEstado;

    expect(resultado.valorNuevo).toBe(valorNuevo);
    expect(resultado.relacionEdad).toBeCloseTo(relacion, 10);
    expect(resultado.depreciacionEdad).toBeCloseTo(depreciacion, 10);
    expect(resultado.depreciacionHeideck).toBe(2);
    expect(resultado.factorEstado).toBeCloseTo(factorEstado, 10);
    expect(resultado.factorDepreciacion).toBeCloseTo(factorDepreciacion, 10);
    expect(resultado.valorAvisado).toBeCloseTo(
      valorNuevo * factorDepreciacion,
      6,
    );
    expect(resultado.estadoLabel).toContain("Bueno");
  });

  it("contrasta el valor avisado con la lectura directa de la tabla", () => {
    const resultado = calcularRossHeideck(86, 3_850_000, 18, 70, "2");

    // 18/70 = 25,71 % → fila 26 de la tabla.
    expect(resultado.porcentajeVida).toBeCloseTo((18 / 70) * 100, 6);
    expect(resultado.coeficienteK).toBe(leerCoeficienteK(26, "2"));
    expect(resultado.valorTabla).toBeCloseTo(
      resultado.valorNuevo * (1 - resultado.coeficienteK),
      6,
    );
  });

  it("produce fórmulas sustituidas reproducibles", () => {
    const resultado = calcularRossHeideck(86, 3_850_000, 18, 70, "2");

    expect(resultado.formulaRelacion).toContain("x/n =");
    expect(resultado.formulaDepreciacion).toContain("D =");
    expect(resultado.formulaEstado).toContain("E =");
    expect(resultado.formulaFactor).toContain("FD =");
    expect(resultado.formulaValor).toContain("VA =");
    expect(resultado.formulaTabla).toContain("VA =");
  });

  it("devuelve NaN en la relación de edad cuando la vida útil es cero", () => {
    const resultado = calcularRossHeideck(86, 3_850_000, 18, 0, "2");

    expect(Number.isNaN(resultado.relacionEdad)).toBe(true);
    expect(Number.isNaN(resultado.factorDepreciacion)).toBe(true);
  });
});

describe("calcularVidaUtilProlongada", () => {
  it("aplica VR = VUR / (EC × 2) y VUP = edad + VR", () => {
    const resultado = calcularVidaUtilProlongada(70, 64, 3);

    expect(resultado.vidaRemanente).toBeCloseTo(70 / 6, 10);
    expect(resultado.vup).toBeCloseTo(64 + 70 / 6, 10);
    expect(resultado.porcentajeVida).toBeCloseTo((64 / 70) * 100, 6);
  });

  it("procede cuando el EC es admisible y la vida útil alcanza el 90 %", () => {
    const resultado = calcularVidaUtilProlongada(70, 64, 3);

    expect(resultado.ecAdmisible).toBe(true);
    expect(resultado.vidaSuficiente).toBe(true);
    expect(resultado.procede).toBe(true);
  });

  it("no procede cuando el EC está fuera del rango 2,5 a 4,5", () => {
    const resultado = calcularVidaUtilProlongada(70, 64, 2);

    expect(resultado.ecAdmisible).toBe(false);
    expect(resultado.procede).toBe(false);
  });

  it("no procede cuando la vida útil transcurrida es inferior al 90 %", () => {
    const resultado = calcularVidaUtilProlongada(70, 50, 3);

    expect(resultado.vidaSuficiente).toBe(false);
    expect(resultado.procede).toBe(false);
  });
});

describe("calcularResidual", () => {
  it("aplica Vt = Vp − (Cd + Ci + Cf + Up + Cg)", () => {
    const resultado = calcularResidual(
      2_400_000_000,
      1_180_000_000,
      210_000_000,
      145_000_000,
      320_000_000,
      95_000_000,
    );

    const deducciones =
      1_180_000_000 + 210_000_000 + 145_000_000 + 320_000_000 + 95_000_000;
    expect(resultado.totalDeducciones).toBe(deducciones);
    expect(resultado.valorTerreno).toBe(2_400_000_000 - deducciones);
    expect(resultado.formula).toContain("Vt =");
  });

  it("admite un valor residual negativo cuando las deducciones superan la venta", () => {
    const resultado = calcularResidual(100, 200, 0, 0, 0, 0);

    expect(resultado.valorTerreno).toBe(-100);
  });
});

describe("consolidarAvaluo", () => {
  it("suma terreno y construcción y conserva el origen", () => {
    const resultado = consolidarAvaluo(
      520_000_000,
      180_000_000,
      "Técnica residual",
      "Ross-Heideck",
    );

    expect(resultado.valorTotal).toBe(700_000_000);
    expect(resultado.origenTerreno).toBe("Técnica residual");
    expect(resultado.origenConstruccion).toBe("Ross-Heideck");
  });

  it("trata valores no finitos como cero", () => {
    const resultado = consolidarAvaluo(
      Number.NaN,
      Number.NaN,
      "origen",
      "origen",
    );

    expect(resultado.valorTerreno).toBe(0);
    expect(resultado.valorConstruccion).toBe(0);
    expect(resultado.valorTotal).toBe(0);
  });
});

describe("redondear2", () => {
  it("redondea a dos decimales", () => {
    expect(redondear2(1.006)).toBe(1.01);
    expect(redondear2(2.344)).toBe(2.34);
    expect(redondear2(2.345)).toBe(2.35);
  });
});
