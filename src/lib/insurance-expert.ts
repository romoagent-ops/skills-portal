export type CoverageStatus = "covered" | "excluded" | "conditional";

export type PolicyEvidence = { page: number; excerpt: string };
export type PolicyFact = { label: string; value: string };

export type InsurancePolicy = {
  id: string;
  slug: string;
  title: string;
  carrier: string;
  type: string;
  insured: string;
  facts: PolicyFact[];
  contacts: { label: string; value: string }[];
  notes: string[];
};

type IntentFactMap = Record<string, boolean>;

type ScenarioRule = {
  id: string;
  title: string;
  status: CoverageStatus;
  summary: string;
  executiveVerdict: string;
  requiresAny: string[];
  requiresAll?: string[];
  blocksIfAny?: string[];
  boostsIfAny?: string[];
  coveredItems: string[];
  excludedItems: string[];
  claimAdvice: string[];
  doNotSay?: string[];
  followUpQuestions: string[];
  rationale: string[];
  evidence: PolicyEvidence[];
};

export type InsuranceExpertAnswer = {
  policy: InsurancePolicy;
  status: CoverageStatus;
  confidence: "high" | "medium" | "low";
  title: string;
  summary: string;
  executiveVerdict: string;
  rationale: string[];
  coveredItems: string[];
  excludedItems: string[];
  claimAdvice: string[];
  doNotSay: string[];
  suggestedClaimText: string;
  followUpQuestions: string[];
  evidence: PolicyEvidence[];
  matchedRuleIds: string[];
  detectedFacts: string[];
};

const homePolicy: InsurancePolicy = {
  id: "santander-home-051492883971",
  slug: "seguro-hogar-santander",
  title: "Mi Hogar Santander Esencial",
  carrier: "Santander Generales Seguros y Reaseguros S.A.",
  type: "hogar",
  insured: "Carlos Javier Rodríguez Morcillo",
  facts: [
    { label: "Póliza", value: "051492883971" },
    { label: "Uso en póliza", value: "Vivienda secundaria ⚠️" },
    { label: "Continente", value: "115.928 €" },
    { label: "Contenido", value: "28.983 €" },
    { label: "Joyas", value: "No aseguradas" },
    { label: "Especiales", value: "No asegurados" },
  ],
  contacts: [
    { label: "Atención 24h", value: "91 343 58 70" },
    { label: "Superlínea", value: "910 503 500" },
  ],
  notes: [
    "No aplica reducción por infraseguro según condiciones particulares.",
    "La póliza figura con uso de vivienda secundaria; si en realidad es vivienda habitual/principal, hay posible discrepancia relevante que conviene revisar con Santander.",
    "La póliza excluye el ajuste o reparación de grifos, juntas, manguitos y mecanismos de fontanería.",
  ],
};

const homeRules: ScenarioRule[] = [
  {
    id: "water-faucet-no-damage",
    title: "Grifo/fuga sin daño material adicional",
    status: "excluded",
    summary: "Si solo hay avería del grifo o goteo sin daños adicionales, la póliza pinta fuera: eso se parece a mantenimiento, no a siniestro indemnizable.",
    executiveVerdict: "No abriría parte solo por esto. Sin daño adicional, pinta mantenimiento.",
    requiresAny: ["water", "leak"],
    requiresAll: ["tap", "no_damage"],
    coveredItems: [],
    excludedItems: [
      "Reparación del grifo.",
      "Juntas, manguitos y mecanismos de fontanería.",
      "Fuga sin daño material directo adicional.",
    ],
    claimAdvice: [
      "No abriría parte solo por eso salvo que haya daños materiales o a terceros.",
      "Si aparece daño visible en mueble, suelo, pared o vecino, entonces cambia el análisis.",
    ],
    doNotSay: [
      "No lo presentes como siniestro grande si solo es un grifo que gotea.",
      "No mezcles mantenimiento pendiente con un supuesto daño súbito.",
    ],
    followUpQuestions: [
      "¿Ha dañado algo además del propio grifo?",
      "¿Ha afectado a vecino/tercero?",
    ],
    rationale: [
      "La póliza sí cubre daños por agua, pero no la simple reparación/ajuste del grifo.",
      "Sin daño adicional, el caso encaja peor como siniestro cubierto.",
    ],
    evidence: [
      { page: 7, excerpt: "No se cubre la reparación o ajuste de grifos, llaves de paso, juntas, manguitos, mecanismos de fontanería." },
    ],
  },
  {
    id: "water-faucet-own-damage",
    title: "Fuga de grifo con daños en tu vivienda",
    status: "conditional",
    summary: "El arreglo del grifo pinta fuera, pero los daños causados por el agua sobre suelo, mueble, pared o similares sí pueden entrar si el escape fue accidental y el daño es directo.",
    executiveVerdict: "Parte viable por daños del agua, pero no por la reparación del grifo.",
    requiresAny: ["water", "leak"],
    requiresAll: ["tap", "own_damage"],
    blocksIfAny: ["gradual", "maintenance"],
    boostsIfAny: ["sudden"],
    coveredItems: [
      "Daños materiales directos causados por el agua.",
      "Posible localización/reparación de tubería privativa si el origen real fuera tubería y existe daño.",
    ],
    excludedItems: [
      "Reparación del grifo y sus mecanismos.",
      "Humedades progresivas o deterioro por mantenimiento deficiente.",
    ],
    claimAdvice: [
      "Separar la avería del grifo del daño causado por el agua.",
      "Describir fecha aproximada, daño visible y origen detectado.",
      "Adjuntar fotos del daño y, si existe, informe/factura del fontanero.",
    ],
    doNotSay: [
      "No centres el relato en arreglar el grifo, céntralo en los daños causados por el agua.",
      "No hables de problema antiguo o desgaste si no es imprescindible y no te favorece.",
    ],
    followUpQuestions: [
      "¿Fue algo repentino o llevaba tiempo pasando?",
      "¿Qué se ha dañado exactamente: mueble, suelo, pared, techo...?",
      "¿El origen seguro es el grifo o puede ser tubería?",
    ],
    rationale: [
      "Daños por agua sí entran como garantía, pero la póliza no paga el simple ajuste del grifo.",
      "Si parece desgaste progresivo o falta de mantenimiento, el rechazo gana fuerza.",
    ],
    evidence: [
      { page: 4, excerpt: "Daños ocasionados por el agua: escapes accidentales y filtraciones." },
      { page: 6, excerpt: "No se cubre la corrosión o deterioro generalizado por falta de mantenimiento." },
      { page: 7, excerpt: "No se cubre la reparación o ajuste de grifos, juntas, manguitos y mecanismos de fontanería." },
    ],
  },
  {
    id: "water-third-party",
    title: "Fuga con daños al vecino o a terceros",
    status: "conditional",
    summary: "Aquí suele haber mejor encaje: el arreglo de la avería propia puede quedar fuera, pero los daños a terceros pueden entrar por daños por agua y/o responsabilidad civil.",
    executiveVerdict: "Si has causado daños al vecino, sí merece abrir parte bien enfocado.",
    requiresAny: ["water", "leak"],
    requiresAll: ["third_party_damage"],
    blocksIfAny: ["gradual", "maintenance"],
    coveredItems: [
      "Daños materiales causados al vecino/tercero.",
      "Posible defensa y fianzas civiles dentro de responsabilidad civil.",
    ],
    excludedItems: [
      "Reparación del grifo o mecanismo causante, si era simple ajuste o mantenimiento.",
      "Casos claramente ligados a mantenimiento deficiente prolongado.",
    ],
    claimAdvice: [
      "Contarlo como escape accidental detectado en tu vivienda con afección a tercero.",
      "No mezclarlo con mejoras, reforma o desgaste antiguo.",
      "Guardar fotos, mensajes del vecino y parte del fontanero.",
    ],
    doNotSay: [
      "No reconozcas más culpa de la necesaria; cuenta hechos objetivos.",
      "No mezcles el daño al vecino con reforma, mejora o mantenimiento pendiente.",
    ],
    followUpQuestions: [
      "¿Qué daño concreto tiene el vecino: techo, pared, pintura, parquet...?",
      "¿El escape fue súbito o venía de antes?",
      "¿Ya ha venido fontanero o perito?",
    ],
    rationale: [
      "La RC de la póliza cubre daños a terceros como propietario/vida privada, pero la causa y el mantenimiento importan mucho.",
    ],
    evidence: [
      { page: 5, excerpt: "Responsabilidad civil como propietario de la vivienda... hasta 150.000 €, con defensa y fianzas civiles incluidas." },
      { page: 4, excerpt: "Daños ocasionados por el agua: escapes accidentales y filtraciones." },
      { page: 8, excerpt: "No se cubren obligaciones que excedan la responsabilidad civil legal." },
    ],
  },
  {
    id: "humidity-condensation",
    title: "Humedad por condensación o progresiva",
    status: "excluded",
    summary: "Si el caso es humedad por condensación, ambiente, terreno o algo paulatino, la póliza tiene mala pinta para cubrirlo.",
    executiveVerdict: "Con pinta de condensación o daño progresivo, mala base para parte cubierto.",
    requiresAny: ["humidity", "condensation", "gradual"],
    coveredItems: [],
    excludedItems: [
      "Humedad ambiental o condensación.",
      "Daños progresivos y falta de mantenimiento.",
    ],
    claimAdvice: [
      "No lo enfocaría como siniestro súbito si realmente es condensación o problema paulatino.",
      "Primero conviene probar origen: ventilación, aislamiento, puente térmico o fuga real.",
    ],
    doNotSay: [
      "No lo llames fuga si realmente no la tienes identificada.",
      "No lo presentes como súbito si lleva meses evolucionando.",
    ],
    followUpQuestions: [
      "¿Hay fuga identificada o solo manchas/humedad progresiva?",
      "¿Aparece siempre en la misma zona y con el tiempo?",
    ],
    rationale: [
      "La póliza excluye humedad ambiental y problemas paulatinos no súbitos.",
    ],
    evidence: [
      { page: 6, excerpt: "No se cubren filtraciones o goteras causadas por humedad ambiental o transmitida por terreno/cimentación." },
    ],
  },
  {
    id: "theft-inside-home",
    title: "Robo dentro de la vivienda",
    status: "conditional",
    summary: "Robo y desperfectos por robo dentro de la vivienda tienen buen encaje, pero denuncia y detalle de bienes son obligatorios de facto.",
    executiveVerdict: "Sí tiene recorrido, pero sin denuncia y detalle fino te lo complicas tú solo.",
    requiresAny: ["theft", "robbery"],
    coveredItems: [
      "Robo y desperfectos por robo dentro de la vivienda.",
    ],
    excludedItems: [
      "Bienes no incluidos en la denuncia.",
      "Joyas y objetos de valor especial no asegurados.",
      "Pérdida o extravío sin signos de robo.",
    ],
    claimAdvice: [
      "Denuncia primero y haz que coincidan los bienes reclamados.",
      "Separar robo con fuerza de desaparición sin prueba.",
    ],
    doNotSay: [
      "No mezcles robo con simple extravío o falta de recuerdo.",
      "No metas bienes no reflejados en denuncia.",
    ],
    followUpQuestions: [
      "¿Hay denuncia?",
      "¿Qué bienes faltan exactamente?",
      "¿Son joyas, efectivo, electrónica o mobiliario?",
    ],
    rationale: ["La cobertura existe, pero está muy condicionada por prueba y tipo de bien."],
    evidence: [
      { page: 5, excerpt: "Robo y desperfectos por robo dentro de la vivienda hasta 100% S.A." },
      { page: 7, excerpt: "No se cubren joyas ni objetos de valor especial; tampoco bienes no declarados en la denuncia." },
    ],
  },
  {
    id: "breakage-screen-or-countertop",
    title: "Rotura con alto riesgo de exclusión",
    status: "excluded",
    summary: "Pantallas, encimeras, metacrilato y daños estéticos tienen mala pinta según la póliza.",
    executiveVerdict: "Aquí la póliza pinta claramente en contra salvo matiz muy específico.",
    requiresAny: ["breakage"],
    requiresAll: ["screen_or_countertop"],
    coveredItems: [],
    excludedItems: [
      "Pantallas y componentes de aparatos.",
      "Encimeras y superficies de ciertos materiales.",
      "Daño meramente estético.",
    ],
    claimAdvice: [
      "No lo enfocaría como rotura cubierta salvo que el objeto concreto encaje expresamente en cristales/espejos/sanitarios.",
    ],
    doNotSay: ["No llames cristal cubierto a algo que en realidad es pantalla, vitro o encimera."],
    followUpQuestions: [
      "¿Qué se ha roto exactamente y de qué material es?",
    ],
    rationale: ["La garantía de roturas es más estrecha de lo que parece."],
    evidence: [
      { page: 7, excerpt: "No se cubren pantallas, metacrilato, encimeras y daños estéticos." },
    ],
  },
  {
    id: "breakage-glass-sanitary",
    title: "Rotura con posible encaje claro",
    status: "conditional",
    summary: "Cristales, espejos y aparatos sanitarios tienen mejor encaje, aunque importa exactamente qué pieza se ha roto.",
    executiveVerdict: "Puede entrar, pero depende mucho de nombrar bien la pieza rota.",
    requiresAny: ["breakage"],
    requiresAll: ["glass_or_sanitary"],
    coveredItems: [
      "Cristales, lunas y espejos.",
      "Aparatos sanitarios hasta el límite previsto.",
    ],
    excludedItems: [
      "Daño estético sin rotura real.",
      "Piezas/materiales que no entren en la categoría cubierta.",
    ],
    claimAdvice: [
      "Indicar la pieza exacta, fotos y material.",
      "No llamarlo solo 'mampara' o 'mueble' si realmente es cristal/vidrio cubierto.",
    ],
    doNotSay: ["No lo dejes ambiguo si puedes identificar con precisión material y pieza."],
    followUpQuestions: ["¿Es cristal, espejo, sanitario o mampara?", "¿Qué parte se ha roto exactamente?"],
    rationale: ["La garantía sí existe, pero la nomenclatura del objeto importa bastante."],
    evidence: [
      { page: 4, excerpt: "Roturas: cristales, lunas y espejos; aparatos sanitarios hasta 1.800 €/pieza." },
    ],
  },
  {
    id: "weather-rain-window",
    title: "Agua por lluvia / ventana / cierre",
    status: "excluded",
    summary: "Si el agua entra por ventana/puerta mal cerrada o con cierre defectuoso, la póliza lo pone bastante cuesta arriba.",
    executiveVerdict: "Si dependió de un cierre defectuoso o mal cerrado, el parte tiene mala pinta.",
    requiresAny: ["weather", "rain"],
    requiresAll: ["window_or_door"],
    coveredItems: [],
    excludedItems: [
      "Entrada de agua por puertas/ventanas mal cerradas o con cierre defectuoso.",
      "Daños con evidente falta de conservación.",
    ],
    claimAdvice: [
      "Solo tendría mejor encaje si hubo fenómeno atmosférico cubierto y el problema no depende del mal cierre.",
    ],
    doNotSay: ["No lo enfoques como temporal cubierto si el origen real fue cierre defectuoso."],
    followUpQuestions: ["¿La ventana/puerta estaba bien cerrada y en buen estado?", "¿Tienes datos del episodio de lluvia/viento?"],
    rationale: ["La póliza cubre ciertos fenómenos, pero excluye cierres defectuosos y falta de conservación."],
    evidence: [
      { page: 6, excerpt: "No se cubren daños ocasionados por la entrada de agua por puertas y ventanas que hayan quedado sin cerrar o cuyo cierre sea defectuoso." },
    ],
  },
];

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function hasAny(text: string, terms: string[]) {
  return terms.some((term) => text.includes(normalize(term)));
}

function detectFacts(query: string): IntentFactMap {
  const text = normalize(query);
  const ownDamage = hasAny(text, ["mueble", "suelo", "pared", "techo", "parquet", "armario", "cocina", "mojado", "mancha", "hinchado"]);
  const thirdParty = hasAny(text, ["vecino", "vecina", "tercero", "terceros", "piso de abajo", "comunidad"]);

  return {
    water: hasAny(text, ["agua", "fuga", "escape", "gota", "gotea", "gotera", "filtracion", "pierde agua"]),
    leak: hasAny(text, ["fuga", "escape", "gotea", "pierde agua", "filtracion", "gotera"]),
    tap: hasAny(text, ["grifo", "griferia", "fregadero", "lavabo"]),
    pipe: hasAny(text, ["tuberia", "tuberias", "llave de paso", "bajante"]),
    own_damage: ownDamage,
    third_party_damage: thirdParty,
    no_damage: !ownDamage && !thirdParty && hasAny(text, ["pierde agua", "gotea", "fuga", "escape"]),
    sudden: hasAny(text, ["de repente", "repentino", "repente", "hoy", "anoche", "esta manana", "esta tarde", "de un dia para otro"]),
    gradual: hasAny(text, ["desde hace", "lleva tiempo", "poco a poco", "meses", "semanas", "humedad", "siempre", "cada vez"]),
    maintenance: hasAny(text, ["desgaste", "mantenimiento", "viejo", "corrosion", "oxidado", "junta", "manguito", "mecanismo"]),
    humidity: hasAny(text, ["humedad", "moho", "mancha de humedad"]),
    condensation: hasAny(text, ["condensacion", "vaho"]),
    theft: hasAny(text, ["hurto", "me han quitado", "me falta", "desaparecio"]),
    robbery: hasAny(text, ["robo", "reventaron", "forzaron", "allanaron", "entraron a robar"]),
    breakage: hasAny(text, ["rotura", "roto", "se ha roto", "rompio", "partio", "cristal", "mampara", "espejo", "sanitario", "encimera", "pantalla"]),
    glass_or_sanitary: hasAny(text, ["cristal", "espejo", "sanitario", "lavabo", "wc", "inodoro", "bidet"]),
    screen_or_countertop: hasAny(text, ["pantalla", "encimera", "metacrilato", "vitro", "placa"]),
    weather: hasAny(text, ["lluvia", "viento", "pedrisco", "granizo", "tormenta", "inundacion", "temporal"]),
    rain: hasAny(text, ["lluvia", "tormenta", "granizo", "agua de lluvia"]),
    window_or_door: hasAny(text, ["ventana", "puerta", "cierre", "persiana"]),
  };
}

function scoreRule(rule: ScenarioRule, facts: IntentFactMap) {
  if (!rule.requiresAny.some((fact) => facts[fact])) return -1;
  if (rule.requiresAll && !rule.requiresAll.every((fact) => facts[fact])) return -1;
  if (rule.blocksIfAny && rule.blocksIfAny.some((fact) => facts[fact])) return -1;

  let score = rule.requiresAny.filter((fact) => facts[fact]).length;
  score += rule.requiresAll?.filter((fact) => facts[fact]).length ?? 0;
  score += rule.boostsIfAny?.filter((fact) => facts[fact]).length ?? 0;
  return score;
}

export function getInsurancePolicies() {
  return [homePolicy];
}

export function analyzeInsuranceQuestion(query: string, policyId?: string): InsuranceExpertAnswer | null {
  const policy = getInsurancePolicies().find((item) => !policyId || item.id === policyId);
  if (!policy) return null;

  const facts = detectFacts(query);
  const detectedFacts = Object.entries(facts)
    .filter(([, value]) => value)
    .map(([key]) => key);

  const scored = homeRules
    .map((rule) => ({ rule, score: scoreRule(rule, facts) }))
    .filter((item) => item.score >= 0)
    .sort((a, b) => b.score - a.score);

  const top = scored[0];
  if (!top) {
    return {
      policy,
      status: "conditional",
      confidence: "low",
      title: "Caso no aterrizado todavía",
      summary: "No veo aún suficiente contexto estructurado para dictaminar bien. Aquí el sistema debe preguntar, no inventar.",
      executiveVerdict: "Todavía no abriría parte: primero hay que aclarar el caso.",
      rationale: [
        "No he detectado un escenario claro con suficiente precisión.",
        "Hace falta concretar tipo de daño, origen, si fue súbito o gradual y si afecta a terceros.",
      ],
      coveredItems: [],
      excludedItems: [],
      claimAdvice: [
        "No abras parte todavía si ni siquiera está claro qué bloque de cobertura aplica.",
      ],
      doNotSay: [
        "No fuerces una versión del caso si aún no sabes bien origen, daño y alcance.",
      ],
      suggestedClaimText: "Necesito aclarar mejor lo ocurrido antes de redactar un parte útil.",
      followUpQuestions: [
        "¿Qué ha pasado exactamente?",
        "¿Qué se ha dañado?",
        "¿Fue repentino o venía de antes?",
        "¿Afecta solo a tu vivienda o también a terceros?",
      ],
      evidence: [],
      matchedRuleIds: [],
      detectedFacts,
    };
  }

  const confidence: "high" | "medium" | "low" =
    top.score >= 3 ? "high" : top.score === 2 ? "medium" : "low";

  return {
    policy,
    status: top.rule.status,
    confidence,
    title: top.rule.title,
    summary: top.rule.summary,
    executiveVerdict: top.rule.executiveVerdict,
    rationale: top.rule.rationale,
    coveredItems: top.rule.coveredItems,
    excludedItems: top.rule.excludedItems,
    claimAdvice: top.rule.claimAdvice,
    doNotSay: top.rule.doNotSay ?? [],
    suggestedClaimText: buildSuggestedClaimText(query, top.rule, facts),
    followUpQuestions: top.rule.followUpQuestions,
    evidence: top.rule.evidence,
    matchedRuleIds: scored.slice(0, 3).map((item) => item.rule.id),
    detectedFacts,
  };
}

function buildSuggestedClaimText(query: string, rule: ScenarioRule, facts: IntentFactMap) {
  const clean = query.trim();

  if (rule.id === "water-third-party") {
    return "Quiero comunicar un escape de agua detectado en mi vivienda que ha causado daños a un tercero. Solicito apertura de parte para valoración de los daños ocasionados, indicando que el origen detectado fue un escape accidental y aportando fotos y detalle de las zonas afectadas.";
  }

  if (rule.id === "water-faucet-own-damage") {
    return "Quiero comunicar un siniestro por daños causados por agua en mi vivienda. Se detectó un escape accidental y el agua ha provocado daños materiales en la zona afectada. Solicito valoración de los daños producidos, diferenciando esta incidencia de la simple reparación del elemento causante.";
  }

  if (rule.id === "theft-inside-home") {
    return "Quiero comunicar un robo en la vivienda con daños asociados. Adjunto o aportaré denuncia y detalle de los bienes afectados para su valoración dentro de la póliza.";
  }

  if (rule.status === "excluded") {
    return "Con lo que has contado, no veo base sólida para redactar un parte favorable todavía. Primero habría que aclarar si existe un daño cubierto independiente del mantenimiento o de la exclusión principal.";
  }

  return `Quiero comunicar esta incidencia para valoración por la póliza: ${clean || "describir el hecho"}. Solicito revisión de cobertura y orientación sobre los daños efectivamente amparados.`;
}
