import {
  type CultivoInput,
  type ParametrosPredio,
  RANGO_PARTICIPACION,
  RANGO_TASA_CAPITALIZACION,
  UNIDADES_MEDIDA,
  calcularCultivo,
  calcularPredio,
  etiquetaUnidad,
  pasosCalculoCultivo,
  simboloUnidad,
} from "@/lib/calc/rural";
import { formatCurrency, formatHectares, formatNumber } from "@/lib/format";
import { describe, expect, it } from "vitest";

const PARAMETROS: ParametrosPredio = {
  participacionTierraPct: 30,
  tasaCapitalizacionPct: 8,
};

const CAFE: CultivoInput = {
  id: "cultivo-1",
  nombre: "Café pergamino seco",
  areaHa: 12,
  rendimiento: 1.4,
  unidad: "tonelada",
  precioUnitario: 14_500_000,
  costosDirectos: 9_800_000,
  costosIndirectos: 1_450_000,
  otrosCostos: 620_000,
};

const PLATANO: CultivoInput = {
  id: "cultivo-2",
  nombre: "Plátano asociado",
  areaHa: 6.5,
  rendimiento: 8,
  unidad: "tonelada",
  precioUnitario: 1_250_000,
  costosDirectos: 4_100_000,
  costosIndirectos: 780_000,
  otrosCostos: 310_000,
};

describe("etiquetaUnidad y simboloUnidad", () => {
  it("devuelve la etiqueta corta sin el paréntesis de la unidad", () => {
    expect(etiquetaUnidad("tonelada")).toBe("Tonelada");
    expect(etiquetaUnidad("bulto")).toBe("Bulto");
    expect(etiquetaUnidad("cabeza")).toBe("Cabeza de ganado");
  });

  it("devuelve el símbolo compacto de cada unidad", () => {
    expect(simboloUnidad("tonelada")).toBe("t");
    expect(simboloUnidad("kilogramo")).toBe("kg");
    expect(simboloUnidad("arroba")).toBe("@");
    expect(simboloUnidad("litro")).toBe("L");
  });

  it("expone las siete unidades de medida soportadas", () => {
    expect(UNIDADES_MEDIDA).toHaveLength(7);
    expect(UNIDADES_MEDIDA.map((u) => u.value)).toContain("tonelada");
  });
});

describe("calcularCultivo", () => {
  it("aplica la cadena completa de capitalización de renta", () => {
    const resultado = calcularCultivo(CAFE, PARAMETROS);

    expect(resultado).not.toBeNull();
    if (!resultado) return;

    const ingresosHa = 1.4 * 14_500_000;
    const costosHa = 9_800_000 + 1_450_000 + 620_000;
    const utilidadHa = ingresosHa - costosHa;
    const rentaHa = utilidadHa * 0.3;
    const valorHa = rentaHa / 0.08;

    expect(resultado.ingresosHa).toBe(Math.round(ingresosHa));
    expect(resultado.costosTotalesHa).toBe(Math.round(costosHa));
    expect(resultado.utilidadHa).toBe(Math.round(utilidadHa));
    expect(resultado.rentaTierraHa).toBe(Math.round(rentaHa));
    expect(resultado.valorHa).toBe(Math.round(valorHa));
    expect(resultado.valorTotal).toBe(Math.round(valorHa * 12));
    expect(resultado.ingresosTotales).toBe(Math.round(ingresosHa * 12));
    expect(resultado.costosTotales).toBe(Math.round(costosHa * 12));
    expect(resultado.utilidadTotal).toBe(Math.round(utilidadHa * 12));
    expect(resultado.rentaTierraTotal).toBe(Math.round(rentaHa * 12));
  });

  it("devuelve null cuando falta el área, el rendimiento o el precio", () => {
    expect(calcularCultivo({ ...CAFE, areaHa: 0 }, PARAMETROS)).toBeNull();
    expect(calcularCultivo({ ...CAFE, rendimiento: 0 }, PARAMETROS)).toBeNull();
    expect(
      calcularCultivo({ ...CAFE, precioUnitario: 0 }, PARAMETROS),
    ).toBeNull();
    expect(
      calcularCultivo({ ...CAFE, areaHa: Number.NaN }, PARAMETROS),
    ).toBeNull();
  });

  it("devuelve null cuando la tasa de capitalización no es positiva", () => {
    expect(
      calcularCultivo(CAFE, { ...PARAMETROS, tasaCapitalizacionPct: 0 }),
    ).toBeNull();
  });

  it("trata costos no finitos como cero", () => {
    const resultado = calcularCultivo(
      {
        ...CAFE,
        costosDirectos: Number.NaN,
        costosIndirectos: Number.NaN,
        otrosCostos: Number.NaN,
      },
      PARAMETROS,
    );

    expect(resultado).not.toBeNull();
    expect(resultado?.costosTotalesHa).toBe(0);
  });

  it("admite utilidad negativa cuando los costos superan los ingresos", () => {
    const resultado = calcularCultivo(
      { ...CAFE, precioUnitario: 1_000_000 },
      PARAMETROS,
    );

    expect(resultado).not.toBeNull();
    expect(resultado?.utilidadHa).toBeLessThan(0);
  });
});

describe("calcularPredio", () => {
  it("consolida área, valor y totales de todos los cultivos válidos", () => {
    const resultado = calcularPredio([CAFE, PLATANO], PARAMETROS);

    expect(resultado.cultivos).toHaveLength(2);
    expect(resultado.areaTotalHa).toBeCloseTo(18.5, 10);

    const valorTotal = resultado.cultivos.reduce(
      (total, cultivo) => total + cultivo.valorTotal,
      0,
    );
    expect(resultado.valorTotal).toBe(valorTotal);
    expect(resultado.valorPromedioHa).toBe(Math.round(valorTotal / 18.5));
    expect(resultado.ingresosTotales).toBe(
      resultado.cultivos.reduce((t, c) => t + c.ingresosTotales, 0),
    );
    expect(resultado.costosTotales).toBe(
      resultado.cultivos.reduce((t, c) => t + c.costosTotales, 0),
    );
    expect(resultado.utilidadTotal).toBe(
      resultado.cultivos.reduce((t, c) => t + c.utilidadTotal, 0),
    );
    expect(resultado.rentaTierraTotal).toBe(
      resultado.cultivos.reduce((t, c) => t + c.rentaTierraTotal, 0),
    );
  });

  it("excluye los cultivos inválidos del consolidado", () => {
    const resultado = calcularPredio(
      [CAFE, { ...PLATANO, areaHa: 0 }],
      PARAMETROS,
    );

    expect(resultado.cultivos).toHaveLength(1);
    expect(resultado.areaTotalHa).toBe(12);
  });

  it("devuelve un consolidado vacío cuando no hay cultivos válidos", () => {
    const resultado = calcularPredio([], PARAMETROS);

    expect(resultado.cultivos).toHaveLength(0);
    expect(resultado.areaTotalHa).toBe(0);
    expect(resultado.valorTotal).toBe(0);
    expect(resultado.valorPromedioHa).toBe(0);
  });
});

describe("pasosCalculoCultivo", () => {
  it("produce los seis pasos de la memoria de cálculo en orden", () => {
    const resultado = calcularCultivo(CAFE, PARAMETROS);
    expect(resultado).not.toBeNull();
    if (!resultado) return;

    const pasos = pasosCalculoCultivo(CAFE, PARAMETROS, resultado, {
      currency: formatCurrency,
      number: formatNumber,
      hectares: formatHectares,
    });

    expect(pasos).toHaveLength(6);
    expect(pasos.map((p) => p.titulo)).toEqual([
      "Ingresos por hectárea",
      "Costos totales por hectárea",
      "Utilidad por hectárea",
      "Renta atribuible a la tierra",
      "Valor del suelo por hectárea",
      "Valor total de la actividad",
    ]);
  });

  it("sustituye los valores ingresados en cada fórmula", () => {
    const resultado = calcularCultivo(CAFE, PARAMETROS);
    expect(resultado).not.toBeNull();
    if (!resultado) return;

    const pasos = pasosCalculoCultivo(CAFE, PARAMETROS, resultado, {
      currency: formatCurrency,
      number: formatNumber,
      hectares: formatHectares,
    });

    expect(pasos[0].sustitucion).toContain("t/ha");
    expect(pasos[0].sustitucion).toContain("1,4");
    expect(pasos[3].sustitucion).toContain("30");
    expect(pasos[4].sustitucion).toContain("8");
    expect(pasos[5].sustitucion).toContain("12 ha");
    for (const paso of pasos) {
      expect(paso.detalle.length).toBeGreaterThan(0);
      expect(paso.resultado.length).toBeGreaterThan(0);
    }
  });
});

describe("rangos técnicos", () => {
  it("expone los rangos de participación y tasa del expediente", () => {
    expect(RANGO_PARTICIPACION).toEqual({ min: 20, max: 40 });
    expect(RANGO_TASA_CAPITALIZACION).toEqual({ min: 4, max: 12 });
  });
});
