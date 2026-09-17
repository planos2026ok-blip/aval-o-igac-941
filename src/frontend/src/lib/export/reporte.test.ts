import { type CultivoInput, calcularPredio } from "@/lib/calc/rural";
import {
  type Comparable,
  calcularCapitalizacionDirecta,
  calcularFlujoDescontado,
  calcularMercado,
  calcularResidual,
  calcularRossHeideck,
  calcularVidaUtilProlongada,
  consolidarAvaluo,
} from "@/lib/calc/urbano";
import { generarInformeHtml } from "@/lib/export/plantilla";
import {
  type DatosReporte,
  SECCIONES_EXPORTABLES,
  SECCIONES_POR_DEFECTO,
  construirSecciones,
  datosTablaRossHeideck,
  fechaDeHoy,
  nombreArchivo,
  unidadCultivo,
} from "@/lib/export/reporte";
import { describe, expect, it } from "vitest";

const COMPARABLES: Comparable[] = [
  {
    id: "comparable-1",
    descripcion: "Calle 45 # 12-30, apartamento 302",
    precio: 468_000_000,
    area: 86,
    fuente: "Fincaraíz, oferta marzo 2026",
    precioTexto: "468.000.000",
    areaTexto: "86",
  },
  {
    id: "comparable-2",
    descripcion: "Carrera 18 # 45-12, apartamento 501",
    precio: 512_000_000,
    area: 94,
    fuente: "Metrocuadrado, oferta febrero 2026",
    precioTexto: "512.000.000",
    areaTexto: "94",
  },
];

const CULTIVOS: CultivoInput[] = [
  {
    id: "cultivo-1",
    nombre: "Café pergamino seco",
    areaHa: 12,
    rendimiento: 1.4,
    unidad: "tonelada",
    precioUnitario: 14_500_000,
    costosDirectos: 9_800_000,
    costosIndirectos: 1_450_000,
    otrosCostos: 620_000,
  },
];

const PARAMETROS = { participacionTierraPct: 30, tasaCapitalizacionPct: 8 };

/** Datos de reporte completos, construidos con los motores reales. */
function datosDePrueba(): DatosReporte {
  const mercado = calcularMercado(COMPARABLES);
  const capitalizacion = calcularCapitalizacionDirecta(54_000_000, 0.095);
  const flujo = calcularFlujoDescontado(
    48_000_000,
    0.035,
    0.11,
    5,
    620_000_000,
  );
  const ross = calcularRossHeideck(86, 3_850_000, 18, 70, "2");
  const vup = calcularVidaUtilProlongada(70, 64, 3);
  const residual = calcularResidual(
    2_400_000_000,
    1_180_000_000,
    210_000_000,
    145_000_000,
    320_000_000,
    95_000_000,
  );
  const consolidado = consolidarAvaluo(
    residual.valorTerreno,
    ross.valorAvisado,
    "Técnica residual (bloque 6)",
    "Ross-Heideck, modelo continuo (bloque 4)",
  );

  return {
    identificacion: {
      nombre: "Avalúo comercial — Apartamento Calle 45 # 12-30",
      municipio: "Bogotá D.C.",
      fecha: "17 de septiembre de 2026",
      responsable: "Avaluador con inscripción vigente ante el IGAC",
      notas: "Avalúo con visita técnica y verificación documental.",
      fuentes: "Fincaraíz y Metrocuadrado (ofertas 2026).",
    },
    urbano: {
      comparables: COMPARABLES,
      mercado,
      capitalizacion,
      flujo,
      ross,
      vup,
      residual,
      consolidado,
      origenTerreno: "Técnica residual (bloque 6)",
      origenConstruccion: "Ross-Heideck, modelo continuo (bloque 4)",
      estadoKey: "2",
    },
    rural: {
      cultivos: CULTIVOS,
      parametros: PARAMETROS,
      resultado: calcularPredio(CULTIVOS, PARAMETROS),
    },
  };
}

describe("nombreArchivo", () => {
  it("deriva un nombre seguro sin tildes ni signos", () => {
    expect(
      nombreArchivo("Avalúo comercial — Apartamento Calle 45 # 12-30"),
    ).toBe("avaluo-comercial-apartamento-calle-45-12-30.html");
  });

  it("usa un nombre de respaldo cuando el proyecto queda vacío", () => {
    expect(nombreArchivo("")).toBe("informe-avaluo.html");
    expect(nombreArchivo("   ")).toBe("informe-avaluo.html");
  });
});

describe("fechaDeHoy", () => {
  it("devuelve una fecha larga en registro colombiano", () => {
    const resultado = fechaDeHoy();
    expect(resultado).toMatch(/\d{4}/);
    expect(resultado.length).toBeGreaterThan(0);
  });
});

describe("construirSecciones", () => {
  it("respeta el orden del expediente y la selección del usuario", () => {
    const secciones = construirSecciones(datosDePrueba(), [
      "identificacion",
      "urbano",
      "rural",
      "formulas",
      "informe",
    ]);

    expect(secciones.map((s) => s.id)).toEqual([
      "identificacion",
      "urbano-mercado",
      "urbano-renta",
      "urbano-costo",
      "urbano-residual",
      "rural",
      "formulas",
      "informe",
    ]);
  });

  it("omite las secciones no incluidas", () => {
    const secciones = construirSecciones(datosDePrueba(), ["identificacion"]);

    expect(secciones).toHaveLength(1);
    expect(secciones[0].id).toBe("identificacion");
  });

  it("devuelve una lista vacía cuando no se incluye ninguna sección", () => {
    expect(construirSecciones(datosDePrueba(), [])).toHaveLength(0);
  });

  it("incluye las filas de mercado con el valor unitario calculado", () => {
    const secciones = construirSecciones(datosDePrueba(), ["urbano"]);
    const mercado = secciones.find((s) => s.id === "urbano-mercado");

    expect(mercado).toBeDefined();
    expect(mercado?.rows?.length).toBeGreaterThan(0);
    expect(mercado?.rows?.[0].value).toContain("/m²");
    expect(mercado?.formulas?.length).toBe(3);
  });

  it("incluye el paso a paso rural por actividad", () => {
    const secciones = construirSecciones(datosDePrueba(), ["rural"]);
    const rural = secciones.find((s) => s.id === "rural");

    expect(rural).toBeDefined();
    // Seis pasos por cada cultivo válido.
    expect(rural?.formulas).toHaveLength(6);
    expect(rural?.formulas?.[0]).toContain("Ingresos por hectárea");
  });

  it("marca las cifras de cierre con emphasis", () => {
    const secciones = construirSecciones(datosDePrueba(), ["urbano"]);
    const residual = secciones.find((s) => s.id === "urbano-residual");

    const enfatizadas = residual?.rows?.filter((fila) => fila.emphasis) ?? [];
    expect(enfatizadas.length).toBeGreaterThan(0);
  });
});

describe("datosTablaRossHeideck", () => {
  it("expone los nueve estados y las 100 filas de coeficientes", () => {
    const { estados, filas } = datosTablaRossHeideck();

    expect(estados).toHaveLength(9);
    expect(filas).toHaveLength(100);
    expect(filas[0].porcentaje).toBe(0);
    expect(filas[0].coeficientes).toHaveLength(9);
    expect(filas[99].porcentaje).toBe(99);
  });
});

describe("unidadCultivo", () => {
  it("compone la etiqueta y el símbolo de la unidad", () => {
    expect(unidadCultivo(CULTIVOS[0])).toBe("Tonelada (t)");
  });
});

describe("SECCIONES_EXPORTABLES", () => {
  it("declara las seis secciones exportables y las activa por defecto", () => {
    expect(SECCIONES_EXPORTABLES).toHaveLength(6);
    expect(SECCIONES_POR_DEFECTO).toEqual(
      SECCIONES_EXPORTABLES.map((s) => s.key),
    );
  });
});

describe("generarInformeHtml", () => {
  it("produce un documento HTML autocontenido con el título del proyecto", () => {
    const html = generarInformeHtml(datosDePrueba(), SECCIONES_POR_DEFECTO);

    expect(html.startsWith("<!DOCTYPE html>")).toBe(true);
    expect(html).toContain('<html lang="es-CO">');
    expect(html).toContain("Avalúo comercial");
    expect(html).toContain("Resolución IGAC 941 de 2026");
    // Autocontenido: estilos embebidos y sin recursos remotos.
    expect(html).toContain("<style>");
    expect(html).not.toContain("<script");
    expect(html).not.toContain("http://");
    expect(html).not.toContain("https://");
  });

  it("incluye la tabla Ross-Heideck completa cuando se selecciona", () => {
    const html = generarInformeHtml(datosDePrueba(), ["ross-heideck"]);

    expect(html).toContain('id="ross-heideck"');
    expect(html).toContain("Tabla Ross-Heideck");
    // 100 filas de datos más la fila de encabezado.
    const filas = html.match(/<tr>/g) ?? [];
    expect(filas.length).toBeGreaterThanOrEqual(101);
  });

  it("escribe los coeficientes de la tabla con coma decimal colombiana", () => {
    const html = generarInformeHtml(datosDePrueba(), ["ross-heideck"]);

    // La primera fila del anexo: 0,00000 · 0,00032 · 0,02520 · … · 1,00000.
    expect(html).toContain("<td>0,00000</td>");
    expect(html).toContain("<td>0,00032</td>");
    expect(html).toContain("<td>0,02520</td>");
    expect(html).toContain("<td>1,00000</td>");

    // Ninguna celda de la tabla usa el punto como separador decimal.
    const celdas = html.match(/<td>[^<]*<\/td>/g) ?? [];
    expect(celdas.length).toBeGreaterThan(0);
    for (const celda of celdas) {
      expect(celda).not.toMatch(/<td>\d+\.\d+<\/td>/);
    }
  });

  it("omite la tabla Ross-Heideck cuando no se selecciona", () => {
    const html = generarInformeHtml(datosDePrueba(), ["identificacion"]);

    expect(html).not.toContain('id="ross-heideck"');
  });

  it("escapa el contenido del usuario para evitar inyección de HTML", () => {
    const datos = datosDePrueba();
    datos.identificacion.nombre = "<script>alert('x')</script>";
    const html = generarInformeHtml(datos, ["identificacion"]);

    expect(html).not.toContain("<script>alert");
    expect(html).toContain("&lt;script&gt;");
  });

  it("incluye las fórmulas sustituidas de la memoria de cálculo", () => {
    const html = generarInformeHtml(datosDePrueba(), ["urbano"]);

    expect(html).toContain("Fórmulas aplicadas");
    expect(html).toContain("VU =");
    expect(html).toContain("FD =");
  });

  it("genera un índice con enlaces a las secciones incluidas", () => {
    const html = generarInformeHtml(datosDePrueba(), [
      "identificacion",
      "urbano",
    ]);

    expect(html).toContain('class="toc"');
    expect(html).toContain('href="#identificacion"');
    expect(html).toContain('href="#urbano-mercado"');
  });
});
