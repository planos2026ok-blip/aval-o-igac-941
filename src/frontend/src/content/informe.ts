/**
 * Contenido normativo y técnico del informe.
 *
 * Fuente: Resolución IGAC 941 de 2026 y su anexo técnico oficial.
 * El informe es un resumen estructurado por títulos y artículos clave,
 * no la transcripción literal de los 61 artículos.
 */

export interface FormulaVariable {
  symbol: string;
  meaning: string;
  unit: string;
}

export interface FormulaStep {
  expression: string;
  detail: string;
}

export interface Formula {
  id: string;
  name: string;
  expression: string;
  variables: FormulaVariable[];
  steps: FormulaStep[];
  note?: string;
}

export interface ArticleBlock {
  id: string;
  label: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
  quote?: string;
  formulas?: Formula[];
}

export interface InformeSection {
  id: string;
  navLabel: string;
  eyebrow: string;
  title: string;
  intro: string;
  articles: ArticleBlock[];
}

/**
 * Fila de la tabla Ross-Heideck: [porcentaje de vida útil, K1, K1.5, K2, K2.5,
 * K3, K3.5, K4, K4.5, K5]. Los nueve coeficientes K corresponden, en orden, a
 * los estados de conservación Heideck de `ESTADOS_HEIDECK`.
 */
export type RossRow = [
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
  number,
];

/** Estados de conservación Heideck, en el orden de las columnas de la tabla. */
export const ESTADOS_HEIDECK = [
  { key: "1", label: "1 — Óptima" },
  { key: "1,5", label: "1,5 — Muy bueno" },
  { key: "2", label: "2 — Bueno" },
  { key: "2,5", label: "2,5 — Intermedio" },
  { key: "3", label: "3 — Regular" },
  { key: "3,5", label: "3,5 — Deficiente" },
  { key: "4", label: "4 — Malo" },
  { key: "4,5", label: "4,5 — Muy malo" },
  { key: "5", label: "5 — Demolición" },
] as const;

/**
 * Tabla Ross-Heideck de doble entrada, transcrita del anexo técnico.
 * 100 filas (0 % a 99 % de vida útil) x 9 estados de conservación.
 * Los valores son el coeficiente K de depreciación. No modificar.
 */
export const TABLA_ROSS_HEIDECK: RossRow[] = [
  [0, 0.0, 0.00032, 0.0252, 0.0809, 0.181, 0.332, 0.526, 0.752, 1.0],
  [
    1, 0.00505, 0.00537, 0.03012, 0.08554, 0.18514, 0.33537, 0.52839, 0.75325,
    1.0,
  ],
  [
    2, 0.0102, 0.01052, 0.03514, 0.09027, 0.18935, 0.33881, 0.53083, 0.75453,
    1.0,
  ],
  [
    3, 0.01545, 0.01577, 0.04026, 0.0951, 0.19365, 0.34232, 0.53332, 0.75583,
    1.0,
  ],
  [
    4, 0.0208, 0.02111, 0.04548, 0.10002, 0.19804, 0.34589, 0.53586, 0.75716,
    1.0,
  ],
  [
    5, 0.02625, 0.02656, 0.05079, 0.10503, 0.2025, 0.34954, 0.53844, 0.75851,
    1.0,
  ],
  [
    6, 0.0318, 0.03211, 0.0562, 0.11013, 0.20704, 0.35324, 0.54107, 0.75989,
    1.0,
  ],
  [
    7, 0.03745, 0.03776, 0.06171, 0.11532, 0.21167, 0.35702, 0.54375, 0.76129,
    1.0,
  ],
  [
    8, 0.0432, 0.04351, 0.06731, 0.12061, 0.21638, 0.36086, 0.54648, 0.76271,
    1.0,
  ],
  [
    9, 0.04905, 0.04935, 0.07301, 0.12598, 0.22117, 0.36477, 0.54925, 0.76416,
    1.0,
  ],
  [
    10, 0.055, 0.0553, 0.07881, 0.13145, 0.22605, 0.36874, 0.55207, 0.76564,
    1.0,
  ],
  [
    11, 0.06105, 0.06135, 0.08471, 0.13701, 0.231, 0.37278, 0.55494, 0.76714,
    1.0,
  ],
  [
    12, 0.0672, 0.0675, 0.09071, 0.14266, 0.23604, 0.37689, 0.55785, 0.76867,
    1.0,
  ],
  [
    13, 0.07345, 0.07375, 0.0968, 0.14841, 0.24116, 0.38106, 0.56082, 0.77022,
    1.0,
  ],
  [
    14, 0.0798, 0.08009, 0.10299, 0.15424, 0.24636, 0.38531, 0.56383, 0.77179,
    1.0,
  ],
  [
    15, 0.08625, 0.08654, 0.10928, 0.16017, 0.25164, 0.38962, 0.56688, 0.77339,
    1.0,
  ],
  [
    16, 0.0928, 0.09309, 0.11566, 0.16619, 0.257, 0.39399, 0.56999, 0.77501,
    1.0,
  ],
  [
    17, 0.09945, 0.09974, 0.12214, 0.1723, 0.26245, 0.39843, 0.57314, 0.77666,
    1.0,
  ],
  [
    18, 0.1062, 0.10649, 0.12872, 0.17851, 0.26798, 0.40294, 0.57634, 0.77834,
    1.0,
  ],
  [
    19, 0.11305, 0.11333, 0.1354, 0.1848, 0.27359, 0.40752, 0.57959, 0.78004,
    1.0,
  ],
  [
    20, 0.12, 0.12028, 0.14218, 0.19119, 0.27928, 0.41216, 0.58288, 0.78176,
    1.0,
  ],
  [
    21, 0.12705, 0.12733, 0.14905, 0.19767, 0.28505, 0.41687, 0.58622, 0.78351,
    1.0,
  ],
  [
    22, 0.1342, 0.13448, 0.15602, 0.20424, 0.29091, 0.42165, 0.58961, 0.78528,
    1.0,
  ],
  [
    23, 0.14145, 0.14172, 0.16309, 0.21091, 0.29685, 0.42649, 0.59305, 0.78708,
    1.0,
  ],
  [
    24, 0.1488, 0.14907, 0.17025, 0.21766, 0.30287, 0.4314, 0.59653, 0.7889,
    1.0,
  ],
  [
    25, 0.15625, 0.15652, 0.17751, 0.22451, 0.30897, 0.43638, 0.60006, 0.79075,
    1.0,
  ],
  [
    26, 0.1638, 0.16407, 0.18487, 0.23145, 0.31515, 0.44142, 0.60364, 0.79262,
    1.0,
  ],
  [
    27, 0.17145, 0.17172, 0.19233, 0.23848, 0.32142, 0.44653, 0.60727, 0.79452,
    1.0,
  ],
  [
    28, 0.1792, 0.17946, 0.19988, 0.2456, 0.32776, 0.45171, 0.61094, 0.79644,
    1.0,
  ],
  [
    29, 0.18705, 0.18731, 0.20754, 0.25282, 0.33419, 0.45695, 0.61466, 0.79839,
    1.0,
  ],
  [
    30, 0.195, 0.19526, 0.21529, 0.26012, 0.34071, 0.46226, 0.61843, 0.80036,
    1.0,
  ],
  [
    31, 0.20305, 0.20331, 0.22313, 0.26752, 0.3473, 0.46764, 0.62225, 0.80236,
    1.0,
  ],
  [
    32, 0.2112, 0.21145, 0.23108, 0.27501, 0.35397, 0.47308, 0.62611, 0.80438,
    1.0,
  ],
  [
    33, 0.21945, 0.2197, 0.23912, 0.2826, 0.36073, 0.47859, 0.63002, 0.80642,
    1.0,
  ],
  [
    34, 0.2278, 0.22805, 0.24726, 0.29027, 0.36757, 0.48417, 0.63398, 0.80849,
    1.0,
  ],
  [
    35, 0.23625, 0.23649, 0.2555, 0.29804, 0.37449, 0.48982, 0.63798, 0.81059,
    1.0,
  ],
  [
    36, 0.2448, 0.24504, 0.26383, 0.3059, 0.38149, 0.49553, 0.64204, 0.81271,
    1.0,
  ],
  [
    37, 0.25345, 0.25369, 0.27226, 0.31385, 0.38858, 0.5013, 0.64614, 0.81486,
    1.0,
  ],
  [
    38, 0.2622, 0.26244, 0.28079, 0.32189, 0.39574, 0.50715, 0.65028, 0.81703,
    1.0,
  ],
  [
    39, 0.27105, 0.27128, 0.28942, 0.33002, 0.40299, 0.51306, 0.65448, 0.81922,
    1.0,
  ],
  [
    40, 0.28, 0.28023, 0.29814, 0.33825, 0.41032, 0.51904, 0.65872, 0.82144,
    1.0,
  ],
  [
    41, 0.28905, 0.28928, 0.30697, 0.34657, 0.41773, 0.52509, 0.66301, 0.82368,
    1.0,
  ],
  [
    42, 0.2982, 0.29842, 0.31589, 0.35498, 0.42523, 0.5312, 0.66735, 0.82595,
    1.0,
  ],
  [
    43, 0.30745, 0.30767, 0.3249, 0.36348, 0.4328, 0.53738, 0.67173, 0.82825,
    1.0,
  ],
  [
    44, 0.3168, 0.31702, 0.33402, 0.37207, 0.44046, 0.54362, 0.67616, 0.83057,
    1.0,
  ],
  [
    45, 0.32625, 0.32647, 0.34323, 0.38076, 0.4482, 0.54994, 0.68064, 0.83291,
    1.0,
  ],
  [
    46, 0.3358, 0.33601, 0.35254, 0.38953, 0.45602, 0.55631, 0.68517, 0.83528,
    1.0,
  ],
  [
    47, 0.34545, 0.34566, 0.36194, 0.3984, 0.46392, 0.56276, 0.68974, 0.83767,
    1.0,
  ],
  [
    48, 0.3552, 0.35541, 0.37145, 0.40736, 0.47191, 0.56927, 0.69436, 0.84009,
    1.0,
  ],
  [
    49, 0.36505, 0.36525, 0.38105, 0.41642, 0.47998, 0.57585, 0.69903, 0.84253,
    1.0,
  ],
  [50, 0.375, 0.3752, 0.39075, 0.42556, 0.48813, 0.5825, 0.70375, 0.845, 1.0],
  [
    51, 0.38505, 0.38525, 0.40055, 0.4348, 0.49636, 0.58921, 0.70851, 0.84749,
    1.0,
  ],
  [
    52, 0.3952, 0.39539, 0.41044, 0.44413, 0.50467, 0.59599, 0.71332, 0.85001,
    1.0,
  ],
  [
    53, 0.40545, 0.40564, 0.42043, 0.45355, 0.51306, 0.60284, 0.71818, 0.85255,
    1.0,
  ],
  [
    54, 0.4158, 0.41599, 0.43052, 0.46306, 0.52154, 0.60975, 0.72309, 0.85512,
    1.0,
  ],
  [
    55, 0.42625, 0.42643, 0.44071, 0.47267, 0.5301, 0.61674, 0.72804, 0.85771,
    1.0,
  ],
  [
    56, 0.4368, 0.43698, 0.45099, 0.48236, 0.53874, 0.62378, 0.73304, 0.86033,
    1.0,
  ],
  [
    57, 0.44745, 0.44763, 0.46137, 0.49215, 0.54746, 0.6309, 0.73809, 0.86297,
    1.0,
  ],
  [
    58, 0.4582, 0.45837, 0.47185, 0.50203, 0.55627, 0.63808, 0.74319, 0.86563,
    1.0,
  ],
  [
    59, 0.46905, 0.46922, 0.48243, 0.512, 0.56515, 0.64533, 0.74833, 0.86832,
    1.0,
  ],
  [60, 0.48, 0.48017, 0.4931, 0.52207, 0.57412, 0.65264, 0.75352, 0.87104, 1.0],
  [
    61, 0.49105, 0.49121, 0.50388, 0.53222, 0.58317, 0.66002, 0.75876, 0.87378,
    1.0,
  ],
  [
    62, 0.5022, 0.50236, 0.51474, 0.54247, 0.5923, 0.66747, 0.76404, 0.87655,
    1.0,
  ],
  [
    63, 0.51345, 0.51361, 0.52571, 0.55281, 0.60152, 0.67498, 0.76938, 0.87934,
    1.0,
  ],
  [
    64, 0.5248, 0.52495, 0.53678, 0.56324, 0.61081, 0.68257, 0.77476, 0.88215,
    1.0,
  ],
  [
    65, 0.53625, 0.5364, 0.54794, 0.57377, 0.62019, 0.69022, 0.78018, 0.88499,
    1.0,
  ],
  [
    66, 0.5478, 0.54794, 0.5592, 0.58438, 0.62965, 0.69793, 0.78566, 0.88785,
    1.0,
  ],
  [
    67, 0.55945, 0.55959, 0.57055, 0.59509, 0.63919, 0.70571, 0.79118, 0.89074,
    1.0,
  ],
  [
    68, 0.5712, 0.57134, 0.58201, 0.60589, 0.64881, 0.71356, 0.79675, 0.89366,
    1.0,
  ],
  [
    69, 0.58305, 0.58318, 0.59356, 0.61678, 0.65852, 0.72148, 0.80237, 0.8966,
    1.0,
  ],
  [
    70, 0.595, 0.59513, 0.60521, 0.62776, 0.66831, 0.72946, 0.80803, 0.89956,
    1.0,
  ],
  [
    71, 0.60705, 0.60718, 0.61695, 0.63884, 0.67817, 0.73751, 0.81374, 0.90255,
    1.0,
  ],
  [
    72, 0.6192, 0.61932, 0.6288, 0.65001, 0.68812, 0.74563, 0.8195, 0.90556,
    1.0,
  ],
  [
    73, 0.63145, 0.63157, 0.64074, 0.66127, 0.69816, 0.75381, 0.82531, 0.9086,
    1.0,
  ],
  [
    74, 0.6438, 0.64391, 0.65278, 0.67262, 0.70827, 0.76206, 0.83116, 0.91166,
    1.0,
  ],
  [
    75, 0.65625, 0.65636, 0.66491, 0.68406, 0.71847, 0.77038, 0.83706, 0.91475,
    1.0,
  ],
  [
    76, 0.6688, 0.66891, 0.67715, 0.69559, 0.72875, 0.77876, 0.84301, 0.91786,
    1.0,
  ],
  [
    77, 0.68145, 0.68155, 0.68948, 0.70722, 0.73911, 0.78721, 0.84901, 0.921,
    1.0,
  ],
  [
    78, 0.6942, 0.6943, 0.70191, 0.71894, 0.74955, 0.79573, 0.85505, 0.92416,
    1.0,
  ],
  [
    79, 0.70705, 0.70714, 0.71443, 0.73075, 0.76007, 0.80431, 0.86114, 0.92735,
    1.0,
  ],
  [
    80, 0.72, 0.72009, 0.72706, 0.74265, 0.77068, 0.81296, 0.86728, 0.93056,
    1.0,
  ],
  [
    81, 0.73305, 0.73314, 0.73978, 0.75465, 0.78137, 0.82168, 0.87347, 0.9338,
    1.0,
  ],
  [
    82, 0.7462, 0.74628, 0.7526, 0.76673, 0.79214, 0.83046, 0.8797, 0.93706,
    1.0,
  ],
  [
    83, 0.75945, 0.75953, 0.76551, 0.77891, 0.80299, 0.83931, 0.88598, 0.94034,
    1.0,
  ],
  [
    84, 0.7728, 0.77287, 0.77853, 0.79118, 0.81392, 0.84823, 0.89231, 0.94365,
    1.0,
  ],
  [
    85, 0.78625, 0.78632, 0.79164, 0.80354, 0.82494, 0.85722, 0.89868, 0.94699,
    1.0,
  ],
  [
    86, 0.7998, 0.79986, 0.80485, 0.816, 0.83604, 0.86627, 0.90511, 0.95035,
    1.0,
  ],
  [
    87, 0.81345, 0.81351, 0.81815, 0.82854, 0.84722, 0.87538, 0.91158, 0.95374,
    1.0,
  ],
  [
    88, 0.8272, 0.82726, 0.83155, 0.84118, 0.85848, 0.88457, 0.91809, 0.95715,
    1.0,
  ],
  [
    89, 0.84105, 0.8411, 0.84506, 0.85391, 0.86982, 0.89382, 0.92466, 0.96058,
    1.0,
  ],
  [
    90, 0.855, 0.85505, 0.85865, 0.86673, 0.88125, 0.90314, 0.93127, 0.96404,
    1.0,
  ],
  [
    91, 0.86905, 0.86909, 0.87235, 0.87964, 0.89275, 0.91253, 0.93793, 0.96752,
    1.0,
  ],
  [
    92, 0.8832, 0.88324, 0.88614, 0.89265, 0.90434, 0.92198, 0.94464, 0.97103,
    1.0,
  ],
  [
    93, 0.89745, 0.89748, 0.90003, 0.90575, 0.91601, 0.9315, 0.95139, 0.97457,
    1.0,
  ],
  [
    94, 0.9118, 0.91183, 0.91402, 0.91894, 0.92776, 0.94108, 0.95819, 0.97813,
    1.0,
  ],
  [
    95, 0.92625, 0.92627, 0.92811, 0.93222, 0.9396, 0.95074, 0.96504, 0.98171,
    1.0,
  ],
  [
    96, 0.9408, 0.94082, 0.94229, 0.94559, 0.95152, 0.96045, 0.97194, 0.98532,
    1.0,
  ],
  [
    97, 0.95545, 0.95546, 0.95657, 0.95905, 0.96351, 0.97024, 0.97888, 0.98895,
    1.0,
  ],
  [
    98, 0.9702, 0.97021, 0.97095, 0.97261, 0.97559, 0.98009, 0.98587, 0.99261,
    1.0,
  ],
  [
    99, 0.98505, 0.98505, 0.98543, 0.98626, 0.98776, 0.99001, 0.99291, 0.99629,
    1.0,
  ],
];

/** Fórmulas de referencia del anexo técnico, para consulta rápida. */
export const FORMULAS_REFERENCIA: Formula[] = [
  {
    id: "ross-heideck",
    name: "Depreciación Ross-Heideck",
    expression: "D = ½·(x/n) + ½·(x/n)²",
    variables: [
      {
        symbol: "D",
        meaning: "Depreciación por edad",
        unit: "fracción (0 a 1)",
      },
      { symbol: "x", meaning: "Edad efectiva del inmueble", unit: "años" },
      { symbol: "n", meaning: "Vida útil total", unit: "años" },
    ],
    steps: [
      {
        expression: "x/n",
        detail: "Relación de edad: se divide la edad entre la vida útil.",
      },
      {
        expression: "(x/n)²",
        detail: "Se eleva al cuadrado la relación anterior.",
      },
      {
        expression: "D = ½·(x/n) + ½·(x/n)²",
        detail: "Se pondera cada término por un medio y se suman.",
      },
    ],
  },
  {
    id: "factor-heideck",
    name: "Factor de estado Heideck",
    expression: "E = (100 − depreciación Heideck) / 100",
    variables: [
      {
        symbol: "E",
        meaning: "Factor de conservación",
        unit: "fracción (0 a 1)",
      },
      {
        symbol: "depreciación Heideck",
        meaning: "Depreciación por estado de conservación",
        unit: "%",
      },
    ],
    steps: [
      {
        expression: "100 − depreciación Heideck",
        detail: "Se resta la depreciación de estado al 100 %.",
      },
      {
        expression: "E = resultado / 100",
        detail: "Se convierte el porcentaje a fracción.",
      },
    ],
  },
  {
    id: "factor-depreciacion",
    name: "Factor de depreciación total",
    expression: "FD = 1 − D × E",
    variables: [
      {
        symbol: "FD",
        meaning: "Factor de depreciación combinado",
        unit: "fracción (0 a 1)",
      },
      {
        symbol: "D",
        meaning: "Depreciación por edad",
        unit: "fracción (0 a 1)",
      },
      {
        symbol: "E",
        meaning: "Factor de estado Heideck",
        unit: "fracción (0 a 1)",
      },
    ],
    steps: [
      {
        expression: "D × E",
        detail:
          "Se multiplican la depreciación por edad y el factor de estado.",
      },
      {
        expression: "FD = 1 − (D × E)",
        detail: "Se resta el producto a la unidad.",
      },
    ],
  },
  {
    id: "valor-avisado",
    name: "Valor avisado por Ross-Heideck",
    expression: "VA = Vn × FD",
    variables: [
      { symbol: "VA", meaning: "Valor avisado del inmueble", unit: "pesos" },
      { symbol: "Vn", meaning: "Valor a nuevo (reposición)", unit: "pesos" },
      {
        symbol: "FD",
        meaning: "Factor de depreciación total",
        unit: "fracción (0 a 1)",
      },
    ],
    steps: [
      { expression: "Vn", detail: "Se parte del valor de reposición a nuevo." },
      {
        expression: "VA = Vn × FD",
        detail: "Se multiplica por el factor de depreciación.",
      },
    ],
  },
  {
    id: "valor-tabla",
    name: "Valor por coeficiente de tabla",
    expression: "VA = Vn × (1 − K)",
    variables: [
      { symbol: "VA", meaning: "Valor avisado del inmueble", unit: "pesos" },
      { symbol: "Vn", meaning: "Valor a nuevo (reposición)", unit: "pesos" },
      {
        symbol: "K",
        meaning: "Coeficiente de depreciación de la tabla Ross-Heideck",
        unit: "fracción (0 a 1)",
      },
    ],
    steps: [
      {
        expression: "K",
        detail:
          "Se ubica el coeficiente en la tabla según % de vida y estado Heideck.",
      },
      {
        expression: "1 − K",
        detail: "Se obtiene el factor de valor residual.",
      },
      {
        expression: "VA = Vn × (1 − K)",
        detail: "Se multiplica el valor a nuevo por el factor.",
      },
    ],
  },
  {
    id: "vida-util-prolongada",
    name: "Vida útil prolongada (VUP)",
    expression: "VR = VUR / (EC × 2);  VUP = edad + VR",
    variables: [
      { symbol: "VR", meaning: "Vida remanente", unit: "años" },
      { symbol: "VUR", meaning: "Vida útil de referencia", unit: "años" },
      {
        symbol: "EC",
        meaning: "Estado de conservación admisible (2,5 a 4,5)",
        unit: "adimensional",
      },
      { symbol: "VUP", meaning: "Vida útil prolongada", unit: "años" },
    ],
    steps: [
      {
        expression: "EC × 2",
        detail: "Se duplica el estado de conservación admisible.",
      },
      {
        expression: "VR = VUR / (EC × 2)",
        detail: "Se divide la vida útil de referencia entre ese producto.",
      },
      {
        expression: "VUP = edad + VR",
        detail: "Se suma la edad del inmueble a la vida remanente.",
      },
    ],
    note: "Solo procede para estados de conservación entre 2,5 y 4,5, no aplica a Bienes de Interés Cultural y es reconocible desde el 90 % de la vida útil.",
  },
  {
    id: "capitalizacion-directa",
    name: "Capitalización directa",
    expression: "A = R / i",
    variables: [
      {
        symbol: "A",
        meaning: "Valor del inmueble por capitalización",
        unit: "pesos",
      },
      { symbol: "R", meaning: "Renta neta anual", unit: "pesos/año" },
      {
        symbol: "i",
        meaning: "Tasa de capitalización",
        unit: "fracción (0 a 1)",
      },
    ],
    steps: [
      {
        expression: "R",
        detail:
          "Se determina la renta neta anual, descontando gastos operativos.",
      },
      {
        expression: "i",
        detail: "Se selecciona la tasa de capitalización del segmento.",
      },
      {
        expression: "A = R / i",
        detail: "Se divide la renta neta entre la tasa.",
      },
    ],
  },
  {
    id: "flujo-descontado",
    name: "Flujo de caja descontado",
    expression: "V = Σ[FNO_t / (1+i)^t] + VT / (1+i)^T",
    variables: [
      { symbol: "V", meaning: "Valor presente del inmueble", unit: "pesos" },
      {
        symbol: "FNO_t",
        meaning: "Flujo neto de operación del año t",
        unit: "pesos",
      },
      { symbol: "i", meaning: "Tasa de descuento", unit: "fracción (0 a 1)" },
      {
        symbol: "VT",
        meaning: "Valor terminal al final del horizonte",
        unit: "pesos",
      },
      { symbol: "T", meaning: "Número de años proyectados", unit: "años" },
    ],
    steps: [
      {
        expression: "FNO_t / (1+i)^t",
        detail: "Se descuenta cada flujo anual a valor presente.",
      },
      {
        expression: "Σ[...]",
        detail: "Se suman los flujos descontados del horizonte.",
      },
      { expression: "VT / (1+i)^T", detail: "Se descuenta el valor terminal." },
      {
        expression: "V = Σ + VT/(1+i)^T",
        detail: "Se suman ambos componentes.",
      },
    ],
  },
  {
    id: "residual",
    name: "Técnica residual",
    expression: "Vt = Vp − (Cd + Ci + Cf + Up + Cg)",
    variables: [
      { symbol: "Vt", meaning: "Valor residual del terreno", unit: "pesos" },
      { symbol: "Vp", meaning: "Valor de venta del proyecto", unit: "pesos" },
      {
        symbol: "Cd",
        meaning: "Costos directos de construcción",
        unit: "pesos",
      },
      { symbol: "Ci", meaning: "Costos indirectos", unit: "pesos" },
      {
        symbol: "Cf",
        meaning: "Costos financieros y de comercialización",
        unit: "pesos",
      },
      { symbol: "Up", meaning: "Utilidad del promotor", unit: "pesos" },
      { symbol: "Cg", meaning: "Cargas y obligaciones", unit: "pesos" },
    ],
    steps: [
      {
        expression: "Vp",
        detail: "Se estima el valor de venta del proyecto terminado.",
      },
      {
        expression: "Cd + Ci + Cf + Up + Cg",
        detail: "Se suman todos los costos, la utilidad y las cargas.",
      },
      {
        expression: "Vt = Vp − suma",
        detail: "Se resta la suma al valor de venta.",
      },
    ],
    note: "La utilidad del promotor se ancla a la TIR sectorial y el VPN del proyecto no puede ser negativo.",
  },
  {
    id: "rural",
    name: "Avalúo rural por capitalización de renta",
    expression:
      "Ingresos = rendimiento × precio;  Utilidad = Ingresos − Costos",
    variables: [
      {
        symbol: "Ingresos",
        meaning: "Ingreso bruto de la unidad productiva",
        unit: "pesos/ha",
      },
      {
        symbol: "rendimiento",
        meaning: "Producción por hectárea",
        unit: "unidad/ha",
      },
      {
        symbol: "precio",
        meaning: "Precio de venta por unidad",
        unit: "pesos/unidad",
      },
      {
        symbol: "Costos",
        meaning: "Costos directos, indirectos y otros",
        unit: "pesos/ha",
      },
      {
        symbol: "Utilidad",
        meaning: "Utilidad de la unidad productiva",
        unit: "pesos/ha",
      },
    ],
    steps: [
      {
        expression: "Ingresos = rendimiento × precio",
        detail: "Se multiplica la producción por el precio unitario.",
      },
      {
        expression: "Costos = directos + indirectos + otros",
        detail: "Se suman todos los costos de la unidad.",
      },
      {
        expression: "Utilidad = Ingresos − Costos",
        detail: "Se resta el costo al ingreso.",
      },
      {
        expression: "Renta tierra = Utilidad × participación",
        detail: "Se aplica la participación de la tierra.",
      },
      {
        expression: "Avalúo/ha = Renta tierra / tasa",
        detail: "Se capitaliza la renta atribuible a la tierra.",
      },
    ],
  },
];

/** Secciones del informe estructurado por títulos y artículos clave. */
export const INFORME_SECTIONS: InformeSection[] = [
  {
    id: "objeto",
    navLabel: "Objeto y principios",
    eyebrow: "Título I",
    title: "Objeto, ámbito y principios generales",
    intro:
      "La Resolución IGAC 941 de 2026 fija los métodos y las condiciones para la elaboración y presentación de avalúos. Este apartado resume su objeto, su ámbito de aplicación y los principios que gobiernan la actuación del avaluador.",
    articles: [
      {
        id: "art-1",
        label: "Artículo 1",
        title: "Objeto y ámbito de aplicación",
        paragraphs: [
          "La resolución tiene por objeto fijar los métodos y las condiciones técnicas que deben observarse en la elaboración y presentación de los avalúos, con el fin de asegurar la uniformidad, la trazabilidad y la calidad técnica de los dictámenes valuatorios.",
          "Su ámbito cobra los avalúos de bienes inmuebles urbanos y rurales que requieran las entidades públicas y los particulares, así como aquellos que deban presentarse ante el Instituto Geográfico Agustín Codazzi y las autoridades catastrales.",
        ],
        bullets: [
          "Aplica a avalúos urbanos y rurales.",
          "Rige la elaboración y la presentación del informe técnico.",
          "Exige soporte documental y memoria de cálculo completa.",
        ],
      },
      {
        id: "art-2",
        label: "Artículo 2",
        title: "Principios generales de la actuación valuatoria",
        paragraphs: [
          "El avaluador debe sujetar su actuación a los principios que garantizan la calidad y la defensa técnica del dictamen. Estos principios no son una declaración retórica: cada uno se traduce en exigencias verificables dentro del informe.",
        ],
        bullets: [
          "Objetividad: el valor se sustenta en datos verificables y no en apreciaciones subjetivas.",
          "Certeza de las fuentes: toda fuente debe ser identificable, vigente y consultable.",
          "Transparencia: los supuestos, los datos y los cálculos quedan a la vista del revisor.",
          "Integridad y suficiencia: la información debe ser completa y suficiente para el método elegido.",
          "Independencia: el avaluador no puede tener interés en el resultado del avalúo.",
          "Profesionalidad: el trabajo se ejecuta con la idoneidad técnica de la disciplina valuatoria.",
        ],
        quote:
          "El avaluador responde por la selección del método, por la calidad de los datos, por la visita técnica y por la sustentación de la conclusión de valor.",
      },
      {
        id: "art-3",
        label: "Artículo 3",
        title: "Solicitud del avalúo y plazo de entrega",
        paragraphs: [
          "La solicitud del avalúo debe identificar el inmueble, el objeto del encargo y las condiciones de entrega. Una vez recibida la solicitud con la información mínima, el avaluador dispone de un plazo de treinta (30) días hábiles para entregar el informe.",
          "El plazo se cuenta en días hábiles y supone que el solicitante ha aportado la documentación necesaria. La visita técnica obligatoria forma parte del proceso y debe quedar registrada en el informe.",
        ],
        bullets: [
          "Plazo de entrega: 30 días hábiles.",
          "La visita técnica al inmueble es obligatoria.",
          "El informe debe registrar la fecha de referencia del avalúo.",
        ],
      },
      {
        id: "art-4",
        label: "Artículo 4",
        title: "Identificación del inmueble y contenido mínimo del informe",
        paragraphs: [
          "El informe técnico debe identificar el inmueble en tres dimensiones: física, jurídica y normativa. Sobre esa base se construye la memoria de cálculo, que debe permitir a un tercero reproducir cada resultado.",
        ],
        bullets: [
          "Identificación física: ubicación, linderos, área, lote y construcciones.",
          "Identificación jurídica: propietario, folio de matrícula y gravámenes.",
          "Identificación normativa: uso del suelo, POT, restricciones y afectaciones.",
          "Memoria de cálculo completa: fórmulas, variables, unidades y valores sustituidos.",
        ],
        quote:
          "El informe debe contener la memoria de cálculo completa, de modo que cada cifra pueda reconstruirse paso a paso.",
      },
    ],
  },
  {
    id: "metodos",
    navLabel: "Métodos valuatorios",
    eyebrow: "Título II",
    title: "Los cuatro métodos valuatorios",
    intro:
      "La resolución reconoce cuatro métodos. La elección depende de la naturaleza del bien, de la disponibilidad de información y del mercado en que se inserta. El avaluador debe justificar el método adoptado.",
    articles: [
      {
        id: "art-5",
        label: "Artículo 5",
        title: "Comparación o mercado",
        paragraphs: [
          "El método de comparación estima el valor a partir de precios de bienes similares, depurados y verificados. Es el método preferente cuando existe un mercado activo y comparable.",
          "El valor unitario de cada comparable se obtiene dividiendo el precio entre el área. El promedio de los comparables es una ayuda matemática y no una homologación automática.",
        ],
        formulas: [
          {
            id: "mercado-unitario",
            name: "Valor unitario del comparable",
            expression: "Vu = Precio / Área",
            variables: [
              {
                symbol: "Vu",
                meaning: "Valor unitario del comparable",
                unit: "pesos/m²",
              },
              {
                symbol: "Precio",
                meaning: "Precio de oferta o transacción depurado",
                unit: "pesos",
              },
              { symbol: "Área", meaning: "Área del comparable", unit: "m²" },
            ],
            steps: [
              {
                expression: "Precio",
                detail: "Se toma el precio depurado del comparable.",
              },
              { expression: "Área", detail: "Se toma el área del comparable." },
              {
                expression: "Vu = Precio / Área",
                detail: "Se divide el precio entre el área.",
              },
            ],
          },
        ],
      },
      {
        id: "art-6",
        label: "Artículo 6",
        title: "Renta o capitalización de ingresos",
        paragraphs: [
          "El método de renta valora el inmueble por su capacidad de generar ingresos. Admite dos variantes: la capitalización directa y el flujo de caja descontado.",
          "En la capitalización directa se divide la renta neta anual entre la tasa de capitalización. En el flujo de caja descontado se proyectan los flujos netos de operación y se descuentan a valor presente, sumando el valor terminal.",
        ],
        formulas: [
          {
            id: "renta-directa",
            name: "Capitalización directa",
            expression: "A = R / i",
            variables: [
              { symbol: "A", meaning: "Valor del inmueble", unit: "pesos" },
              { symbol: "R", meaning: "Renta neta anual", unit: "pesos/año" },
              {
                symbol: "i",
                meaning: "Tasa de capitalización",
                unit: "fracción (0 a 1)",
              },
            ],
            steps: [
              {
                expression: "R",
                detail:
                  "Se calcula la renta neta anual descontando gastos operativos.",
              },
              {
                expression: "i",
                detail: "Se selecciona la tasa de capitalización del segmento.",
              },
              {
                expression: "A = R / i",
                detail: "Se divide la renta neta entre la tasa.",
              },
            ],
          },
          {
            id: "renta-fcd",
            name: "Flujo de caja descontado",
            expression: "V = Σ[FNO_t / (1+i)^t] + VT / (1+i)^T",
            variables: [
              {
                symbol: "V",
                meaning: "Valor presente del inmueble",
                unit: "pesos",
              },
              {
                symbol: "FNO_t",
                meaning: "Flujo neto de operación del año t",
                unit: "pesos",
              },
              {
                symbol: "i",
                meaning: "Tasa de descuento",
                unit: "fracción (0 a 1)",
              },
              { symbol: "VT", meaning: "Valor terminal", unit: "pesos" },
              { symbol: "T", meaning: "Años proyectados", unit: "años" },
            ],
            steps: [
              {
                expression: "FNO_t / (1+i)^t",
                detail: "Se descuenta cada flujo anual.",
              },
              {
                expression: "Σ[...]",
                detail: "Se suman los flujos descontados.",
              },
              {
                expression: "VT / (1+i)^T",
                detail: "Se descuenta el valor terminal.",
              },
              {
                expression: "V = Σ + VT/(1+i)^T",
                detail: "Se suman ambos componentes.",
              },
            ],
          },
        ],
        bullets: [
          "Gastos operativos mínimos exigidos: predial, seguros, mantenimiento, administración, servicios públicos, imprevistos y comisión.",
          "La tasa de descuento y la tasa de capitalización terminal deben sustentarse.",
        ],
      },
      {
        id: "art-7",
        label: "Artículo 7",
        title: "Costo",
        paragraphs: [
          "El método de costo estima el valor a partir del costo de reposición o de reproducción, menos la depreciación acumulada. Es el método propio de bienes con mercado limitado o inexistente.",
          "La depreciación se calcula con modelos continuos, y la resolución adopta el modelo Ross-Heideck como referencia. El resultado se obtiene multiplicando el valor a nuevo por el factor de depreciación.",
        ],
        formulas: [
          {
            id: "costo-ross",
            name: "Depreciación Ross-Heideck",
            expression: "D = ½·(x/n) + ½·(x/n)²",
            variables: [
              {
                symbol: "D",
                meaning: "Depreciación por edad",
                unit: "fracción (0 a 1)",
              },
              { symbol: "x", meaning: "Edad efectiva", unit: "años" },
              { symbol: "n", meaning: "Vida útil total", unit: "años" },
            ],
            steps: [
              {
                expression: "x/n",
                detail: "Se divide la edad entre la vida útil.",
              },
              {
                expression: "(x/n)²",
                detail: "Se eleva al cuadrado la relación.",
              },
              {
                expression: "D = ½·(x/n) + ½·(x/n)²",
                detail: "Se ponderan y suman ambos términos.",
              },
            ],
          },
          {
            id: "costo-va",
            name: "Valor avisado por costo",
            expression: "VA = Vn × FD",
            variables: [
              { symbol: "VA", meaning: "Valor avisado", unit: "pesos" },
              { symbol: "Vn", meaning: "Valor a nuevo", unit: "pesos" },
              {
                symbol: "FD",
                meaning: "Factor de depreciación total",
                unit: "fracción (0 a 1)",
              },
            ],
            steps: [
              {
                expression: "Vn",
                detail: "Se determina el valor de reposición a nuevo.",
              },
              {
                expression: "FD = 1 − D × E",
                detail:
                  "Se combina la depreciación por edad y el estado Heideck.",
              },
              {
                expression: "VA = Vn × FD",
                detail: "Se multiplica el valor a nuevo por el factor.",
              },
            ],
          },
        ],
        bullets: [
          "Costo de reposición: reproduce el bien con técnicas y materiales actuales.",
          "Costo de reproducción: replica el bien con técnicas y materiales originales.",
          "Vida útil prolongada: solo para estados de conservación entre 2,5 y 4,5.",
          "La vida útil prolongada no aplica a Bienes de Interés Cultural.",
          "Es reconocible desde el 90 % de la vida útil.",
        ],
      },
      {
        id: "art-8",
        label: "Artículo 8",
        title: "Técnica residual",
        paragraphs: [
          "La técnica residual obtiene el valor del terreno descontando del valor de venta del proyecto todos los costos, la utilidad del promotor y las cargas. Admite una formulación estática y una dinámica.",
          "En la versión dinámica, la utilidad del promotor se ancla a la TIR sectorial y el proyecto debe arrojar un VPN no negativo.",
        ],
        formulas: [
          {
            id: "residual-formula",
            name: "Valor residual del terreno",
            expression: "Vt = Vp − (Cd + Ci + Cf + Up + Cg)",
            variables: [
              {
                symbol: "Vt",
                meaning: "Valor residual del terreno",
                unit: "pesos",
              },
              {
                symbol: "Vp",
                meaning: "Valor de venta del proyecto",
                unit: "pesos",
              },
              { symbol: "Cd", meaning: "Costos directos", unit: "pesos" },
              { symbol: "Ci", meaning: "Costos indirectos", unit: "pesos" },
              {
                symbol: "Cf",
                meaning: "Costos financieros y comercialización",
                unit: "pesos",
              },
              { symbol: "Up", meaning: "Utilidad del promotor", unit: "pesos" },
              { symbol: "Cg", meaning: "Cargas y obligaciones", unit: "pesos" },
            ],
            steps: [
              {
                expression: "Vp",
                detail: "Se estima el valor de venta del proyecto terminado.",
              },
              {
                expression: "Cd + Ci + Cf + Up + Cg",
                detail: "Se suman costos, utilidad y cargas.",
              },
              {
                expression: "Vt = Vp − suma",
                detail: "Se resta la suma al valor de venta.",
              },
            ],
            note: "La utilidad del promotor se ancla a la TIR sectorial y el VPN del proyecto no puede ser negativo.",
          },
        ],
      },
    ],
  },
  {
    id: "mercado",
    navLabel: "Reglas de mercado",
    eyebrow: "Título III",
    title: "Reglas del método de mercado",
    intro:
      "El método de mercado exige rigor en la selección y el tratamiento de los comparables. La resolución prohíbe la homologación automática por factores y fija límites estadísticos de dispersión.",
    articles: [
      {
        id: "art-9",
        label: "Artículo 9",
        title: "Criterios de comparabilidad urbano y rural",
        paragraphs: [
          "Los comparables deben ser efectivamente similares al bien avaluado. La comparabilidad se juzga de forma distinta en suelo urbano y en suelo rural.",
        ],
        bullets: [
          "Urbano: uso del suelo, normativa, área, frente, accesibilidad y servicios públicos.",
          "Rural: aptitud agropecuaria, clase agrológica, disponibilidad de agua, vías y distancia a mercados.",
          "Los comparables deben provenir de fuentes verificables y de fecha reciente.",
        ],
      },
      {
        id: "art-10",
        label: "Artículo 10",
        title:
          "Prohibición de homogenización por factores y dispersión admisible",
        paragraphs: [
          "No se admite la homologación automática de comparables mediante factores. Las diferencias entre comparables deben sustentarse técnicamente y no resolverse con coeficientes aplicados sin justificación.",
          "La dispersión de los comparables se controla con el coeficiente de variación. Si la muestra supera el límite admisible, debe depurarse o sustentarse la desviación.",
        ],
        bullets: [
          "Coeficiente de variación admisible urbano: 7,5 %.",
          "Coeficiente de variación admisible rural: 10,0 %.",
          "Es posible apartarse de la media, siempre que se sustente técnicamente.",
        ],
        quote:
          "El promedio es una ayuda matemática, no una homologación automática. Apartarse de la media exige sustentación expresa.",
      },
    ],
  },
  {
    id: "renta",
    navLabel: "Reglas de renta",
    eyebrow: "Título IV",
    title: "Reglas del método de renta",
    intro:
      "El método de renta exige consistencia entre los ingresos proyectados, los gastos operativos y las tasas aplicadas. La resolución fija un catálogo mínimo de gastos que no puede omitirse.",
    articles: [
      {
        id: "art-11",
        label: "Artículo 11",
        title: "Capitalización directa y flujo de caja descontado",
        paragraphs: [
          "La capitalización directa convierte una renta neta anual en valor mediante una tasa de capitalización. El flujo de caja descontado proyecta los flujos netos de operación y los descuenta con una tasa de descuento, añadiendo un valor terminal capitalizado a la tasa terminal.",
          "Ambas variantes deben explicitar la renta o los flujos, los gastos operativos y las tasas empleadas.",
        ],
        formulas: [
          {
            id: "renta-a",
            name: "Capitalización directa",
            expression: "A = R / i",
            variables: [
              { symbol: "A", meaning: "Valor del inmueble", unit: "pesos" },
              { symbol: "R", meaning: "Renta neta anual", unit: "pesos/año" },
              {
                symbol: "i",
                meaning: "Tasa de capitalización",
                unit: "fracción (0 a 1)",
              },
            ],
            steps: [
              {
                expression: "R",
                detail: "Renta neta anual después de gastos operativos.",
              },
              {
                expression: "i",
                detail: "Tasa de capitalización del segmento.",
              },
              {
                expression: "A = R / i",
                detail: "División de la renta entre la tasa.",
              },
            ],
          },
        ],
      },
      {
        id: "art-12",
        label: "Artículo 12",
        title: "Gastos operativos mínimos exigidos",
        paragraphs: [
          "La renta neta se obtiene descontando del ingreso bruto los gastos operativos. La resolución exige considerar, como mínimo, los siguientes conceptos.",
        ],
        bullets: [
          "Impuesto predial.",
          "Seguros.",
          "Mantenimiento.",
          "Administración.",
          "Servicios públicos.",
          "Imprevistos.",
          "Comisión de administración o comercialización.",
        ],
      },
    ],
  },
  {
    id: "costo",
    navLabel: "Reglas de costo",
    eyebrow: "Título V",
    title: "Reglas del método de costo",
    intro:
      "El método de costo parte del valor a nuevo y aplica la depreciación acumulada. La resolución distingue reposición y reproducción, adopta Ross-Heideck como modelo continuo de referencia y regula la vida útil prolongada.",
    articles: [
      {
        id: "art-13",
        label: "Artículo 13",
        title: "Costo de reposición y costo de reproducción",
        paragraphs: [
          "El costo de reposición estima cuánto costaría construir un bien equivalente con las técnicas y los materiales actuales. El costo de reproducción estima el costo de replicar el bien con sus técnicas y materiales originales.",
          "La elección entre uno y otro depende de la naturaleza del bien y del propósito del avalúo, y debe quedar sustentada en el informe.",
        ],
      },
      {
        id: "art-14",
        label: "Artículo 14",
        title: "Depreciación por modelos continuos y Ross-Heideck",
        paragraphs: [
          "La depreciación se calcula con modelos continuos que combinan la edad del bien con su estado de conservación. La resolución adopta el modelo Ross-Heideck como referencia.",
          "El modelo Ross-Heideck parte de la relación entre la edad efectiva y la vida útil, la pondera con un término lineal y uno cuadrático, y la combina con el estado de conservación Heideck para obtener el factor de depreciación.",
        ],
        formulas: [
          {
            id: "costo-d",
            name: "Depreciación por edad",
            expression: "D = ½·(x/n) + ½·(x/n)²",
            variables: [
              {
                symbol: "D",
                meaning: "Depreciación por edad",
                unit: "fracción (0 a 1)",
              },
              { symbol: "x", meaning: "Edad efectiva", unit: "años" },
              { symbol: "n", meaning: "Vida útil total", unit: "años" },
            ],
            steps: [
              { expression: "x/n", detail: "Relación de edad." },
              { expression: "(x/n)²", detail: "Cuadrado de la relación." },
              {
                expression: "D = ½·(x/n) + ½·(x/n)²",
                detail: "Suma ponderada.",
              },
            ],
          },
          {
            id: "costo-e",
            name: "Factor de estado Heideck",
            expression: "E = (100 − depreciación Heideck) / 100",
            variables: [
              {
                symbol: "E",
                meaning: "Factor de conservación",
                unit: "fracción (0 a 1)",
              },
              {
                symbol: "depreciación Heideck",
                meaning: "Depreciación por estado",
                unit: "%",
              },
            ],
            steps: [
              {
                expression: "100 − depreciación Heideck",
                detail: "Complemento de la depreciación de estado.",
              },
              {
                expression: "E = resultado / 100",
                detail: "Conversión a fracción.",
              },
            ],
          },
          {
            id: "costo-fd",
            name: "Factor de depreciación total",
            expression: "FD = 1 − D × E",
            variables: [
              {
                symbol: "FD",
                meaning: "Factor de depreciación combinado",
                unit: "fracción (0 a 1)",
              },
              {
                symbol: "D",
                meaning: "Depreciación por edad",
                unit: "fracción (0 a 1)",
              },
              {
                symbol: "E",
                meaning: "Factor de estado",
                unit: "fracción (0 a 1)",
              },
            ],
            steps: [
              {
                expression: "D × E",
                detail: "Producto de depreciación por edad y estado.",
              },
              {
                expression: "FD = 1 − (D × E)",
                detail: "Complemento a la unidad.",
              },
            ],
          },
        ],
      },
      {
        id: "art-15",
        label: "Artículo 15",
        title: "Vidas útiles de referencia y vida útil prolongada",
        paragraphs: [
          "La resolución reconoce vidas útiles de referencia por tipología constructiva. Cuando el bien ha sido mantenido de forma excepcional, puede reconocerse una vida útil prolongada.",
          "La vida útil prolongada solo procede para estados de conservación entre 2,5 y 4,5, no aplica a Bienes de Interés Cultural y es reconocible desde el 90 % de la vida útil.",
        ],
        formulas: [
          {
            id: "costo-vup",
            name: "Vida útil prolongada",
            expression: "VR = VUR / (EC × 2);  VUP = edad + VR",
            variables: [
              { symbol: "VR", meaning: "Vida remanente", unit: "años" },
              {
                symbol: "VUR",
                meaning: "Vida útil de referencia",
                unit: "años",
              },
              {
                symbol: "EC",
                meaning: "Estado de conservación admisible (2,5 a 4,5)",
                unit: "adimensional",
              },
              { symbol: "VUP", meaning: "Vida útil prolongada", unit: "años" },
            ],
            steps: [
              {
                expression: "EC × 2",
                detail: "Se duplica el estado de conservación.",
              },
              {
                expression: "VR = VUR / (EC × 2)",
                detail: "Se divide la vida útil de referencia.",
              },
              {
                expression: "VUP = edad + VR",
                detail: "Se suma la edad a la vida remanente.",
              },
            ],
            note: "Solo estados 2,5 a 4,5; no aplica a BIC; reconocible desde el 90 % de la vida útil.",
          },
        ],
      },
    ],
  },
  {
    id: "residual",
    navLabel: "Técnica residual",
    eyebrow: "Título VI",
    title: "Técnica residual estática y dinámica",
    intro:
      "La técnica residual valora el terreno por diferencia entre el valor de venta del proyecto y todos los costos, la utilidad del promotor y las cargas. La versión dinámica incorpora el valor del dinero en el tiempo.",
    articles: [
      {
        id: "art-16",
        label: "Artículo 16",
        title: "Formulación estática y dinámica",
        paragraphs: [
          "En la formulación estática, el valor residual del terreno resulta de restar al valor de venta del proyecto los costos directos, indirectos, financieros y de comercialización, la utilidad del promotor y las cargas.",
          "En la formulación dinámica, los flujos se descuentan en el tiempo y la utilidad del promotor se ancla a la TIR sectorial. El proyecto debe arrojar un VPN no negativo para que el valor residual sea admisible.",
        ],
        formulas: [
          {
            id: "residual-estatica",
            name: "Técnica residual estática",
            expression: "Vt = Vp − (Cd + Ci + Cf + Up + Cg)",
            variables: [
              {
                symbol: "Vt",
                meaning: "Valor residual del terreno",
                unit: "pesos",
              },
              {
                symbol: "Vp",
                meaning: "Valor de venta del proyecto",
                unit: "pesos",
              },
              { symbol: "Cd", meaning: "Costos directos", unit: "pesos" },
              { symbol: "Ci", meaning: "Costos indirectos", unit: "pesos" },
              {
                symbol: "Cf",
                meaning: "Costos financieros y comercialización",
                unit: "pesos",
              },
              { symbol: "Up", meaning: "Utilidad del promotor", unit: "pesos" },
              { symbol: "Cg", meaning: "Cargas y obligaciones", unit: "pesos" },
            ],
            steps: [
              {
                expression: "Vp",
                detail: "Valor de venta del proyecto terminado.",
              },
              {
                expression: "Cd + Ci + Cf + Up + Cg",
                detail: "Suma de costos, utilidad y cargas.",
              },
              {
                expression: "Vt = Vp − suma",
                detail: "Diferencia que arroja el valor del terreno.",
              },
            ],
          },
        ],
        bullets: [
          "La utilidad del promotor se ancla a la TIR sectorial.",
          "El VPN del proyecto no puede ser negativo.",
        ],
      },
    ],
  },
  {
    id: "rural",
    navLabel: "Reglas rurales",
    eyebrow: "Título VII",
    title: "Reglas del avalúo rural",
    intro:
      "El avalúo rural parte de la unidad productiva homogénea. Se estiman ingresos y costos de producción, se determina la utilidad y se capitaliza la renta atribuible a la tierra.",
    articles: [
      {
        id: "art-17",
        label: "Artículo 17",
        title: "Costos unitarios de producción y capitalización de renta",
        paragraphs: [
          "El avalúo del terreno agropecuario se obtiene por capitalización de la renta. Para ello se determina el ingreso bruto de la unidad productiva, se descuentan los costos y se aplica la participación de la tierra.",
          "La renta atribuible a la tierra se capitaliza a la tasa de capitalización del uso agropecuario, y el resultado se multiplica por el área del predio.",
        ],
        formulas: [
          {
            id: "rural-formula",
            name: "Avalúo rural por capitalización de renta",
            expression:
              "Ingresos = rendimiento × precio;  Utilidad = Ingresos − Costos",
            variables: [
              {
                symbol: "Ingresos",
                meaning: "Ingreso bruto de la unidad productiva",
                unit: "pesos/ha",
              },
              {
                symbol: "rendimiento",
                meaning: "Producción por hectárea",
                unit: "unidad/ha",
              },
              {
                symbol: "precio",
                meaning: "Precio de venta por unidad",
                unit: "pesos/unidad",
              },
              {
                symbol: "Costos",
                meaning: "Costos directos, indirectos y otros",
                unit: "pesos/ha",
              },
              {
                symbol: "Utilidad",
                meaning: "Utilidad de la unidad productiva",
                unit: "pesos/ha",
              },
            ],
            steps: [
              {
                expression: "Ingresos = rendimiento × precio",
                detail: "Producción por precio unitario.",
              },
              {
                expression: "Costos = directos + indirectos + otros",
                detail: "Suma de todos los costos.",
              },
              {
                expression: "Utilidad = Ingresos − Costos",
                detail: "Diferencia entre ingreso y costo.",
              },
              {
                expression: "Renta tierra = Utilidad × participación",
                detail: "Aplicación de la participación de la tierra.",
              },
              {
                expression: "Avalúo/ha = Renta tierra / tasa",
                detail: "Capitalización de la renta de la tierra.",
              },
            ],
          },
        ],
      },
      {
        id: "art-18",
        label: "Artículo 18",
        title: "Cultivos como activos biológicos y protección del valor",
        paragraphs: [
          "Los cultivos se valoran como activos biológicos, considerando su ciclo productivo, su estado y su capacidad de generar ingresos futuros.",
          "No proceden reducciones automáticas del valor por la sola condición de suelo de protección o preservación. En las rondas hídricas debe preservarse el valor del predio conforme a la normativa aplicable.",
        ],
        bullets: [
          "Los cultivos se tratan como activos biológicos.",
          "Prohibición de reducciones automáticas por suelo de protección y preservación.",
          "Preservación del valor en rondas hídricas.",
        ],
      },
    ],
  },
];
