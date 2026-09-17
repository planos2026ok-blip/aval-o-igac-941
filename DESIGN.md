# Design Brief

## Direction

Expediente Técnico — a document-grade appraisal workstation where the informe, the Ross-Heideck table and the step-by-step calculators read as one continuous legal instrument.

## Tone

Institutional and editorial: crisp off-white paper, deep file-blue ink, gold seal accent. Serious, legible, zero consumer playfulness.

## Differentiation

Dense numeric tables that stay readable at 11px and long Spanish legal prose that stays comfortable at 16px — the interface looks like a properly typeset expediente, not a dashboard.

## Color Palette

| Token      | OKLCH         | Role                                              |
| ---------- | ------------- | ------------------------------------------------- |
| background | 0.974 0.004 250 | Paper surface for long-form reading             |
| foreground | 0.225 0.016 252 | Ink — body text and legal prose                 |
| card       | 0.998 0.002 250 | Report sheet / computed-result surfaces         |
| primary    | 0.395 0.105 252 | File-blue — headers, active state, result rules |
| accent     | 0.655 0.125 78  | IGAC gold seal — sparing highlights only        |
| muted      | 0.945 0.008 250 | Inset data-entry fields, table striping         |
| border     | 0.885 0.008 250 | Table grid and section rules                    |
| success    | 0.535 0.115 152 | Validated inputs                                |
| warning    | 0.705 0.135 82  | Pending / incomplete fields                     |
| destructive| 0.535 0.19 27   | Validation errors, legal warnings               |

## Typography

- Display: Space Grotesk — app title, section headings, zone labels (institutional, slightly technical)
- Body: Figtree — legal prose, labels, form text; tabular numerals enabled globally
- Mono: Geist Mono — all formulas, variables, substituted values, table figures
- Scale: hero `text-3xl md:text-4xl font-bold tracking-tight`, h2 `text-2xl font-semibold tracking-tight`, h3 `text-lg font-semibold`, section label `text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground`, body `text-base leading-relaxed`, table `text-sm`, formula `font-mono text-sm`

## Elevation & Depth

Flat paper base with restrained elevation: `shadow-subtle` for panels, `shadow-elevated` for computed results, `shadow-sheet` for the report document, plus a 3px primary left rule on result surfaces instead of heavy shadows.

## Structural Zones

| Zone    | Background        | Border                 | Notes                                                        |
| ------- | ----------------- | ---------------------- | ------------------------------------------------------------ |
| Header  | `bg-card`         | `border-b`             | Sticky; file-blue rule under title; print/export actions right |
| Nav     | `bg-sidebar`      | `border-r`             | Section index: Informe, Tabla Ross-Heideck, Urbano, Rural      |
| Content | `bg-background`   | —                      | Alternating `bg-muted/30` bands per article block              |
| Tables  | `bg-card`         | `border` grid          | `th-tech` headers, `bg-muted/40` striping, tabular nums        |
| Results | `bg-card` + left primary rule | `border` | `result-surface`; never mixed with input fields    |
| Footer  | `bg-muted/40`     | `border-t`             | Normative reference: Resolución IGAC 941 de 2026               |

## Spacing & Rhythm

Sections separated by `py-10 md:py-14` with `rule-doc` dividers; cards `p-5 md:p-6`; form grids `gap-4`; formula blocks `space-y-2`; table cells `px-3 py-2`; page gutter `px-4 md:px-8`.

## Component Patterns

- Buttons: `rounded-md`, primary = file-blue solid, export = seal-gold with `shadow-seal`, secondary = outline; hover darkens, never lifts
- Cards: `rounded-md` (6px), `bg-card`, `border`, `shadow-subtle`; report sections use `shadow-sheet`
- Inputs: `rounded-sm` (2px), `field-inset` (inset muted bg + strong border) so entry fields are visually distinct from outputs
- Badges: `rounded-sm` uppercase mono, `text-[0.6875rem]`, muted bg — used for method tag, estado de conservación, article number
- Tables: full grid borders, sticky `th-tech` header, zebra striping, right-aligned numerics
- Formulas: mono block on `bg-muted/50` with `legal-quote` left rule for normative citations

## Motion

- Entrance: `animate-fade-rise` on section mount (0.32s, staggered 40ms) — single orchestrated storyboard
- Hover: `transition-smooth` on buttons/rows, background + border only; table row hover `bg-muted/50`
- Decorative: `animate-rule-draw` on section rules; no bouncing, no glow, no parallax

## Constraints

- Light theme is primary and print-first; dark mode is a tuned secondary, never inverted greys
- No raw hex/rgb in components — semantic OKLCH tokens only
- Ross-Heideck table renders exactly as the annex: 21 rows × 9 columns, unmodified
- Numeric data always tabular-aligned; formulas always in mono with visible variable substitution
- No playful illustration, mascots, gradients-as-decoration, or rounded-pill consumer styling

## Signature Detail

The "expediente" treatment: every computed result sits on a paper sheet with a 3px file-blue edge rule and a mono formula trail above it, so the whole app reads as one signed technical document — category: document-grade institutional tooling.
