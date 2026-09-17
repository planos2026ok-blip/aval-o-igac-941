/**
 * Plantilla del informe exportable.
 *
 * Genera un documento HTML autocontenido: sin hojas de estilo externas, sin
 * fuentes remotas y sin scripts. Se abre en cualquier navegador y conserva el
 * detalle del procedimiento para presentarlo como memoria de cálculo.
 *
 * Los estilos de impresión están incluidos para que el documento salga limpio
 * en papel o al guardarlo como PDF.
 */

import {
  type ClaveSeccion,
  type DatosReporte,
  type FilaReporte,
  SECCIONES_EXPORTABLES,
  type SeccionReporte,
  construirSecciones,
  datosTablaRossHeideck,
  fechaDeHoy,
  nombreArchivo,
} from "./reporte";

/** Escapa texto para incrustarlo con seguridad en el documento HTML. */
function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Filas etiqueta/valor de una sección. */
function renderFilas(rows: FilaReporte[]): string {
  return rows
    .map(
      (row) => `
        <div class="row${row.emphasis ? " row--emphasis" : ""}">
          <dt>${esc(row.label)}</dt>
          <dd>${esc(row.value)}</dd>
        </div>`,
    )
    .join("");
}

/** Fórmulas sustituidas de una sección. */
function renderFormulas(formulas: string[]): string {
  return `
    <div class="formulas">
      <h4>Fórmulas aplicadas</h4>
      <ol>
        ${formulas.map((formula) => `<li><code>${esc(formula)}</code></li>`).join("")}
      </ol>
    </div>`;
}

/** Notas al pie de una sección. */
function renderNotas(notes: string[]): string {
  return `
    <div class="notes">
      ${notes.map((nota) => `<p>${esc(nota)}</p>`).join("")}
    </div>`;
}

/**
 * Bloques de prosa a ancho completo.
 *
 * El resumen normativo inserta párrafos legales extensos: presentarlos como
 * filas etiqueta/valor los comprimía en una columna alineada a la derecha y
 * limitada al 60 % del ancho. La lista alterna encabezado y párrafo, de modo
 * que cada artículo se lee como prosa corrida.
 */
function renderProsa(prose: string[]): string {
  const bloques: string[] = [];
  for (let i = 0; i < prose.length; i += 2) {
    const titulo = prose[i];
    const parrafo = prose[i + 1];
    bloques.push(`
      <div class="prose-block">
        <h4>${esc(titulo)}</h4>
        ${parrafo ? `<p>${esc(parrafo)}</p>` : ""}
      </div>`);
  }
  return `<div class="prose">${bloques.join("")}</div>`;
}

/** Una sección completa del informe. */
function renderSeccion(seccion: SeccionReporte, index: number): string {
  return `
    <section class="section" id="${esc(seccion.id)}">
      <header class="section__head">
        <span class="section__index">${String(index).padStart(2, "0")}</span>
        <div>
          <h2>${esc(seccion.title)}</h2>
          ${seccion.reference ? `<p class="section__ref">${esc(seccion.reference)}</p>` : ""}
        </div>
      </header>
      ${seccion.intro ? `<p class="section__intro">${esc(seccion.intro)}</p>` : ""}
      ${seccion.rows && seccion.rows.length > 0 ? `<dl class="rows">${renderFilas(seccion.rows)}</dl>` : ""}
      ${seccion.prose && seccion.prose.length > 0 ? renderProsa(seccion.prose) : ""}
      ${seccion.formulas && seccion.formulas.length > 0 ? renderFormulas(seccion.formulas) : ""}
      ${seccion.notes && seccion.notes.length > 0 ? renderNotas(seccion.notes) : ""}
    </section>`;
}

/** Tabla Ross-Heideck completa, transcrita sin modificación del anexo. */
function renderTablaRossHeideck(): string {
  const { estados, filas } = datosTablaRossHeideck();
  return `
    <section class="section" id="ross-heideck">
      <header class="section__head">
        <span class="section__index">RH</span>
        <div>
          <h2>Tabla Ross-Heideck</h2>
          <p class="section__ref">Anexo técnico — coeficientes K de depreciación</p>
        </div>
      </header>
      <p class="section__intro">
        Tabla de doble entrada: porcentaje de vida útil transcurrida y estado de
        conservación Heideck. Los coeficientes se transcriben del anexo sin
        modificación.
      </p>
      <div class="table-wrap">
        <table class="ross">
          <thead>
            <tr>
              <th scope="col">Vida útil (%)</th>
              ${estados.map((estado) => `<th scope="col">${esc(estado.label)}</th>`).join("")}
            </tr>
          </thead>
          <tbody>
            ${filas
              .map(
                (fila) => `
              <tr>
                <th scope="row">${fila.porcentaje}</th>
                ${fila.coeficientes.map((coeficiente) => `<td>${coeficiente.toFixed(5).replace(".", ",")}</td>`).join("")}
              </tr>`,
              )
              .join("")}
          </tbody>
        </table>
      </div>
    </section>`;
}

/** Hoja de estilos embebida del documento exportado. */
const ESTILOS = `
  :root {
    --ink: #1c2430;
    --ink-soft: #55606f;
    --line: #d3d8e0;
    --line-strong: #9aa4b2;
    --paper: #ffffff;
    --paper-alt: #f5f7fa;
    --brand: #1f3a63;
    --seal: #a97b1f;
  }
  * { box-sizing: border-box; }
  html { -webkit-text-size-adjust: 100%; }
  body {
    margin: 0;
    padding: 2.5rem 1.5rem 4rem;
    background: var(--paper-alt);
    color: var(--ink);
    font-family: "Segoe UI", "Helvetica Neue", Arial, sans-serif;
    font-size: 14px;
    line-height: 1.6;
  }
  .sheet {
    max-width: 60rem;
    margin: 0 auto;
    background: var(--paper);
    border: 1px solid var(--line);
    padding: 3rem 3rem 4rem;
  }
  .doc-head {
    border-bottom: 3px solid var(--brand);
    padding-bottom: 1.5rem;
    margin-bottom: 2.5rem;
  }
  .doc-head__eyebrow {
    margin: 0;
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--seal);
  }
  .doc-head h1 {
    margin: 0.5rem 0 0;
    font-size: 1.75rem;
    line-height: 1.25;
    letter-spacing: -0.01em;
  }
  .doc-head__meta {
    margin: 1rem 0 0;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
    gap: 0.75rem 1.5rem;
  }
  .doc-head__meta div { min-width: 0; }
  .doc-head__meta dt {
    font-size: 0.625rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ink-soft);
  }
  .doc-head__meta dd {
    margin: 0.15rem 0 0;
    font-size: 0.875rem;
    font-weight: 600;
    word-break: break-word;
  }
  .doc-head__note {
    margin: 1.25rem 0 0;
    padding: 0.75rem 1rem;
    border-left: 3px solid var(--seal);
    background: var(--paper-alt);
    font-size: 0.8125rem;
    color: var(--ink-soft);
  }
  .section {
    margin: 0 0 2.5rem;
    break-inside: avoid;
  }
  .section__head {
    display: flex;
    align-items: baseline;
    gap: 0.75rem;
    border-bottom: 1px solid var(--line-strong);
    padding-bottom: 0.5rem;
  }
  .section__index {
    font-family: "Consolas", "SFMono-Regular", Menlo, monospace;
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    color: var(--brand);
    border: 1px solid var(--line-strong);
    padding: 0.1rem 0.4rem;
    white-space: nowrap;
  }
  .section__head h2 {
    margin: 0;
    font-size: 1.125rem;
    letter-spacing: -0.01em;
  }
  .section__ref {
    margin: 0.15rem 0 0;
    font-size: 0.75rem;
    color: var(--ink-soft);
  }
  .section__intro {
    margin: 0.85rem 0 1rem;
    max-width: 68ch;
    color: var(--ink-soft);
  }
  .toc {
    margin: 0.85rem 0 0;
    padding-left: 1.25rem;
    columns: 2;
    column-gap: 2rem;
  }
  .toc li { margin-bottom: 0.3rem; break-inside: avoid; }
  .toc a {
    color: var(--brand);
    text-decoration: none;
    font-size: 0.8125rem;
  }
  .toc a:hover { text-decoration: underline; }
  .rows {
    margin: 0;
    border: 1px solid var(--line);
  }
  .row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1.5rem;
    padding: 0.5rem 0.85rem;
    border-bottom: 1px solid var(--line);
  }
  .row:last-child { border-bottom: 0; }
  .row:nth-child(even) { background: var(--paper-alt); }
  .row dt {
    min-width: 0;
    color: var(--ink-soft);
    font-size: 0.8125rem;
  }
  .row dd {
    margin: 0;
    flex-shrink: 0;
    max-width: 60%;
    text-align: right;
    font-family: "Consolas", "SFMono-Regular", Menlo, monospace;
    font-size: 0.8125rem;
    font-variant-numeric: tabular-nums;
    word-break: break-word;
  }
  .row--emphasis { background: #eef2f8; }
  .row--emphasis dt { color: var(--ink); font-weight: 600; }
  .row--emphasis dd { font-weight: 700; color: var(--brand); }
  .prose { margin: 0; }
  .prose-block {
    padding: 0.85rem 0;
    border-bottom: 1px solid var(--line);
  }
  .prose-block:last-child { border-bottom: 0; }
  .prose-block h4 {
    margin: 0 0 0.4rem;
    font-size: 0.8125rem;
    font-weight: 700;
    color: var(--brand);
  }
  .prose-block p {
    margin: 0;
    max-width: 78ch;
    font-size: 0.875rem;
    line-height: 1.7;
    color: var(--ink);
    text-align: left;
  }
  .formulas {
    margin-top: 1rem;
    border: 1px solid var(--line);
    border-left: 3px solid var(--brand);
    background: var(--paper-alt);
    padding: 0.85rem 1rem;
  }
  .formulas h4 {
    margin: 0 0 0.5rem;
    font-size: 0.6875rem;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--ink-soft);
  }
  .formulas ol { margin: 0; padding-left: 1.25rem; }
  .formulas li { margin-bottom: 0.35rem; }
  .formulas code {
    font-family: "Consolas", "SFMono-Regular", Menlo, monospace;
    font-size: 0.8125rem;
    word-break: break-word;
  }
  .notes {
    margin-top: 0.85rem;
    padding-left: 0.85rem;
    border-left: 2px solid var(--line-strong);
  }
  .notes p {
    margin: 0 0 0.4rem;
    font-size: 0.8125rem;
    font-style: italic;
    color: var(--ink-soft);
  }
  .table-wrap { overflow-x: auto; }
  table.ross {
    width: 100%;
    border-collapse: collapse;
    font-family: "Consolas", "SFMono-Regular", Menlo, monospace;
    font-size: 0.6875rem;
    font-variant-numeric: tabular-nums;
  }
  table.ross th,
  table.ross td {
    border: 1px solid var(--line);
    padding: 0.2rem 0.35rem;
    text-align: right;
    white-space: nowrap;
  }
  table.ross thead th {
    background: var(--brand);
    color: #ffffff;
    font-weight: 600;
    text-align: center;
  }
  table.ross tbody th {
    background: var(--paper-alt);
    font-weight: 600;
    text-align: left;
  }
  table.ross tbody tr:nth-child(even) td { background: #fafbfd; }
  .doc-foot {
    margin-top: 3rem;
    border-top: 1px solid var(--line);
    padding-top: 1rem;
    font-size: 0.75rem;
    color: var(--ink-soft);
  }
  .doc-foot p { margin: 0 0 0.35rem; }

  @media print {
    @page { margin: 14mm; }
    body {
      background: #ffffff;
      padding: 0;
      font-size: 10.5pt;
    }
    .sheet {
      max-width: none;
      border: 0;
      padding: 0;
    }
    .section { break-inside: avoid; }
    .section__head { break-after: avoid; }
    .row { break-inside: avoid; }
    .formulas { break-inside: avoid; }
    table.ross { font-size: 6.5pt; }
    table.ross thead { display: table-header-group; }
    table.ross tr { break-inside: avoid; }
    .table-wrap { overflow: visible; }
    .doc-head { break-after: avoid; }
  }
`;

/**
 * Genera el documento HTML autocontenido del informe.
 * `incluidas` decide qué secciones se incorporan al archivo.
 */
export function generarInformeHtml(
  datos: DatosReporte,
  incluidas: ClaveSeccion[],
): string {
  const secciones = construirSecciones(datos, incluidas);
  const incluyeTabla = incluidas.includes("ross-heideck");
  const identificacion = datos.identificacion;
  const titulo = identificacion.nombre || "Informe de avalúo";
  const fecha = identificacion.fecha || fechaDeHoy();

  const indice = secciones
    .map(
      (seccion, index) =>
        `<li><a href="#${esc(seccion.id)}">${String(index + 1).padStart(2, "0")} · ${esc(seccion.title)}</a></li>`,
    )
    .join("");

  const cuerpo = secciones
    .map((seccion, index) => renderSeccion(seccion, index + 1))
    .join("");

  const tabla = incluyeTabla ? renderTablaRossHeideck() : "";

  return `<!DOCTYPE html>
<html lang="es-CO">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(titulo)} — Memoria de cálculo</title>
<meta name="description" content="Memoria de cálculo del avalúo conforme a la Resolución IGAC 941 de 2026." />
<style>${ESTILOS}</style>
</head>
<body>
<main class="sheet">
  <header class="doc-head">
    <p class="doc-head__eyebrow">Memoria de cálculo · Resolución IGAC 941 de 2026</p>
    <h1>${esc(titulo)}</h1>
    <dl class="doc-head__meta">
      <div><dt>Municipio</dt><dd>${esc(identificacion.municipio || "—")}</dd></div>
      <div><dt>Fecha del informe</dt><dd>${esc(fecha)}</dd></div>
      <div><dt>Responsable</dt><dd>${esc(identificacion.responsable || "—")}</dd></div>
    </dl>
    <p class="doc-head__note">
      Documento autocontenido: incluye los datos ingresados, las fórmulas
      aplicadas y los resultados paso a paso. Puede imprimirse o guardarse como
      PDF desde el navegador.
    </p>
  </header>

  <nav class="section" aria-label="Contenido del informe">
    <header class="section__head">
      <span class="section__index">00</span>
      <div><h2>Contenido</h2></div>
    </header>
    <ol class="toc">${indice}</ol>
  </nav>

  ${cuerpo}
  ${tabla}

  <footer class="doc-foot">
    <p>${esc(titulo)} · ${esc(identificacion.municipio || "—")} · ${esc(fecha)}</p>
    <p>Responsable: ${esc(identificacion.responsable || "—")}</p>
    <p>Generado desde el expediente técnico de avalúos — Resolución IGAC 941 de 2026.</p>
  </footer>
</main>
</body>
</html>`;
}

/** Nombre del archivo descargado, derivado del nombre del proyecto. */
export { nombreArchivo };

/** Etiquetas de las secciones exportables, para la vista previa. */
export const ETIQUETAS_SECCIONES = SECCIONES_EXPORTABLES;
