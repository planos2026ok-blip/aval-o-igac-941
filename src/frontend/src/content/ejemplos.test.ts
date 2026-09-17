import { EJEMPLO_RURAL, EJEMPLO_URBANO } from "@/content/ejemplos";
import { ESTADOS_HEIDECK } from "@/content/informe";
import { calcularPredio, pasosCalculoCultivo } from "@/lib/calc/rural";
import {
  calcularMercado,
  calcularResidual,
  calcularRossHeideck,
  consolidarAvaluo,
} from "@/lib/calc/urbano";
import {
  formatCurrency,
  formatHectares,
  formatNumber,
  parseNumberInput,
} from "@/lib/format";
import { describe, expect, it } from "vitest";

/**
 * Los ejemplos resueltos deben coincidir exactamente con los motores de cálculo
 * de las calculadoras: la página de ejemplos y las calculadoras comparten los
 * mismos módulos, y estas pruebas fijan esa correspondencia.
 */
describe("EJEMPLO_URBANO", () => {
  it("declara los datos de entrada del caso urbano", () => {
    expect(EJEMPLO_URBANO.id).toBe("urbano-la-soledad");
    expect(EJEMPLO_URBANO.datos.length).toBeGreaterThan(0);
    expect(EJEMPLO_URBANO.comparables).toHaveLength(3);
    expect(EJEMPLO_URBANO.entradas.estadoKey).toBe("2");
  });

  it("produce un mercado conforme con el límite de dispersión urbano", () => {
    const mercado = calcularMercado(EJEMPLO_URBANO.comparables);

    expect(mercado.n).toBe(3);
    expect(mercado.media).toBeGreaterThan(0);
    expect(mercado.cumple).toBe(true);
  });

  it("produce un Ross-Heideck coherente con las entradas del ejemplo", () => {
    const { entradas } = EJEMPLO_URBANO;
    const ross = calcularRossHeideck(
      parseNumberInput(entradas.areaConstruidaTexto),
      parseNumberInput(entradas.valorNuevoM2Texto),
      parseNumberInput(entradas.edadTexto),
      parseNumberInput(entradas.vidaUtilTexto),
      entradas.estadoKey,
    );

    expect(ross.valorNuevo).toBe(86 * 3_850_000);
    expect(ross.valorAvisado).toBeGreaterThan(0);
    expect(ross.valorAvisado).toBeLessThan(ross.valorNuevo);
    expect(ross.estadoLabel).toBe(
      ESTADOS_HEIDECK.find((e) => e.key === entradas.estadoKey)?.label,
    );
  });

  it("produce un residual y un consolidado reproducibles", () => {
    const { residual: entradas } = EJEMPLO_URBANO;
    const residual = calcularResidual(
      parseNumberInput(entradas.valorVentaTexto),
      parseNumberInput(entradas.costosDirectosTexto),
      parseNumberInput(entradas.costosIndirectosTexto),
      parseNumberInput(entradas.costosFinancierosTexto),
      parseNumberInput(entradas.utilidadTexto),
      parseNumberInput(entradas.cargasTexto),
    );

    expect(residual.valorTerreno).toBe(450_000_000);

    const ross = calcularRossHeideck(86, 3_850_000, 18, 70, "2");
    const consolidado = consolidarAvaluo(
      residual.valorTerreno,
      ross.valorAvisado,
      "Técnica residual (paso 8)",
      "Ross-Heideck, modelo continuo (paso 7)",
    );

    expect(consolidado.valorTotal).toBe(
      residual.valorTerreno + ross.valorAvisado,
    );
  });
});

describe("EJEMPLO_RURAL", () => {
  it("declara dos actividades productivas y sus parámetros", () => {
    expect(EJEMPLO_RURAL.id).toBe("rural-salgar");
    expect(EJEMPLO_RURAL.cultivos).toHaveLength(2);
    expect(EJEMPLO_RURAL.parametros.participacionTierraPct).toBe(30);
    expect(EJEMPLO_RURAL.parametros.tasaCapitalizacionPct).toBe(8);
  });

  it("consolida el predio con los mismos motores de la calculadora rural", () => {
    const predio = calcularPredio(
      EJEMPLO_RURAL.cultivos,
      EJEMPLO_RURAL.parametros,
    );

    expect(predio.cultivos).toHaveLength(2);
    expect(predio.areaTotalHa).toBeCloseTo(18.5, 10);
    expect(predio.valorTotal).toBeGreaterThan(0);
    expect(predio.valorPromedioHa).toBe(Math.round(predio.valorTotal / 18.5));
  });

  it("genera la memoria de cálculo paso a paso de cada actividad", () => {
    const predio = calcularPredio(
      EJEMPLO_RURAL.cultivos,
      EJEMPLO_RURAL.parametros,
    );

    for (const cultivoResultado of predio.cultivos) {
      const cultivo = EJEMPLO_RURAL.cultivos.find(
        (item) => item.id === cultivoResultado.id,
      );
      expect(cultivo).toBeDefined();
      if (!cultivo) continue;

      const pasos = pasosCalculoCultivo(
        cultivo,
        EJEMPLO_RURAL.parametros,
        cultivoResultado,
        {
          currency: formatCurrency,
          number: formatNumber,
          hectares: formatHectares,
        },
      );

      expect(pasos).toHaveLength(6);
      expect(pasos[5].resultado).toBe(
        formatCurrency(cultivoResultado.valorTotal),
      );
    }
  });
});
