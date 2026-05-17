export type CoverageStatus = "covered" | "excluded" | "conditional";

export type PolicyFact = {
  label: string;
  value: string;
};

export type CoverageTopic = {
  id: string;
  title: string;
  status: CoverageStatus;
  keywords: string[];
  summary: string;
  included: string[];
  excluded: string[];
  claimTips: string[];
  evidence: Array<{ page: number; excerpt: string }>;
};

export type PolicyAnalysis = {
  topic: CoverageTopic;
  score: number;
  matchedKeywords: string[];
  verdict: string;
};

export type PolicyScenarioAnswer = {
  status: CoverageStatus;
  title: string;
  summary: string;
  interpretation: string;
  whatIsLikelyCovered: string[];
  whatIsLikelyNotCovered: string[];
  claimFocus: string[];
  clarificationQuestions: string[];
  evidence: Array<{ page: number; excerpt: string }>;
  matchedTopics: PolicyAnalysis[];
};

export const homeInsurancePolicy = {
  productName: "Mi Hogar Santander Esencial",
  insurer: "Santander Generales Seguros y Reaseguros S.A.",
  policyNumber: "051492883971",
  effectiveDate: "14/02/2023",
  renewalDate: "14/02 de cada año",
  expiryDate: "13/02/2027",
  payment: "Mensual",
  annualPremium: "252,94 €",
  insured: "Carlos Javier Rodríguez Morcillo",
  property: {
    address: "CL PINO CARRASCO DEL 3 2 03 C, 28600 Navalcarnero, Madrid",
    use: "Vivienda secundaria",
    type: "Piso intermedio",
    occupants: "2",
    age: "11-15 años",
    construction: "Ladrillo y hormigón",
    area: "109 m² vivienda · 12 m² garaje · 6 m² trastero",
  },
  capital: {
    continent: "115.928 €",
    contents: "28.983 €",
    jewelsInSafe: "No aseguradas",
    jewelsOutsideSafe: "No aseguradas",
    specialValuables: "No asegurados",
  },
  notableFacts: [
    "No aplica regla proporcional por infraseguro según las condiciones particulares.",
    "La vivienda está declarada como secundaria.",
    "Alarma conectada a central con verificación.",
    "No hay caja fuerte declarada.",
    "Garaje y trastero constan asegurados porque aparecen con superficie en Catastro.",
  ],
} as const;

export const policyFacts: PolicyFact[] = [
  { label: "Póliza", value: homeInsurancePolicy.policyNumber },
  { label: "Producto", value: homeInsurancePolicy.productName },
  { label: "Prima anual", value: homeInsurancePolicy.annualPremium },
  { label: "Forma de pago", value: homeInsurancePolicy.payment },
  { label: "Uso", value: homeInsurancePolicy.property.use },
  { label: "Continente", value: homeInsurancePolicy.capital.continent },
  { label: "Contenido", value: homeInsurancePolicy.capital.contents },
  { label: "Dirección", value: homeInsurancePolicy.property.address },
];

export const coverageTopics: CoverageTopic[] = [
  {
    id: "water-damage",
    title: "Daños por agua",
    status: "conditional",
    keywords: ["agua", "fuga", "filtración", "humedad", "tubería", "grifo", "lavadora", "lavavajillas", "atasco", "gotea", "gotera"],
    summary: "Cubre daños por escapes accidentales, filtraciones, omisión de cierre de grifos y averías de electrodomésticos, pero deja fuera bastantes causas de mantenimiento o humedad progresiva.",
    included: [
      "Escapes accidentales y filtraciones.",
      "Olvido de cierre de grifos.",
      "Escapes o averías de electrodomésticos.",
      "Búsqueda, localización y reparación de tuberías privativas cuando hay daño y está asegurado el continente.",
    ],
    excluded: [
      "Corrosión o deterioro generalizado por falta de mantenimiento.",
      "Humedad ambiental o transmitida por terreno/cimentación.",
      "Desbordamientos o acciones paulatinas de aguas públicas, ríos, embalses, acequias o alcantarillado público.",
      "Atascos, desatascos, bajantes comunitarias, grifos, juntas, sanitarios, fugas sin daño directo, congelación de tuberías y acuarios.",
    ],
    claimTips: [
      "Enfocar el parte como escape accidental súbito con daño material visible y fecha aproximada clara.",
      "Diferenciar bien entre daño súbito y problema de mantenimiento crónico; si parece mantenimiento, te lo pueden tumbar.",
      "Aportar fotos del daño, origen probable y explicar si la tubería afectada es privativa.",
      "No mezclar en el mismo relato trabajos de mejora, desgaste previo o humedades antiguas.",
    ],
    evidence: [
      { page: 4, excerpt: "Daños ocasionados por el agua: escapes accidentales y filtraciones, omisión de cierre de grifos, escapes o averías de electrodomésticos." },
      { page: 6, excerpt: "No se cubre la corrosión o deterioro generalizado por falta de mantenimiento; tampoco humedades ambientales o transmitidas por terreno/cimentación." },
      { page: 7, excerpt: "Quedan fuera atascos, bajantes comunitarias, grifos, juntas, sanitarios, fugas sin daño directo, congelación y acuarios." },
    ],
  },
  {
    id: "theft",
    title: "Robo y hurto",
    status: "conditional",
    keywords: ["robo", "hurto", "ladrón", "allanamiento", "puerta forzada", "joyas", "dinero", "trastero", "garaje", "terraza"],
    summary: "Cubre robo y desperfectos por robo dentro de la vivienda y algunos supuestos en terrazas, trasteros o jardines, con límites. Las joyas y objetos especiales están muy limitados o directamente fuera.",
    included: [
      "Robo y desperfectos por robo dentro de la vivienda hasta 100% de suma asegurada.",
      "Determinados bienes en terrazas, trasteros y jardines hasta 600 €.",
      "Hurto de mobiliario hasta 1.500 €.",
    ],
    excluded: [
      "Joyas y objetos de valor especial robados o hurtados.",
      "Bienes no incluidos en la denuncia.",
      "Pérdida o extravío.",
      "Bienes en el interior de vehículos.",
      "Joyas, aparatos electrónicos y dinero en terrazas, jardines, porches, trasteros o garajes.",
    ],
    claimTips: [
      "Presentar denuncia cuanto antes y hacer que coincida con los bienes reclamados.",
      "Separar claramente robo con fuerza de simple extravío o desaparición sin rastro.",
      "Si afecta a trastero/garaje/terraza, revisar si el bien concreto entra o está expresamente excluido.",
      "No reclamar joyas ni objetos especiales si no están asegurados, porque debilita el parte.",
    ],
    evidence: [
      { page: 5, excerpt: "Robo y hurto dentro de la vivienda: robo y desperfectos por robo hasta 100% S.A.; en terrazas, trasteros y jardines hasta 600 €; hurto de mobiliario hasta 1.500 €." },
      { page: 7, excerpt: "No se cubre el robo o hurto de joyas y objetos de valor especial; tampoco bienes no declarados en la denuncia ni bienes en el interior de vehículos." },
    ],
  },
  {
    id: "liability",
    title: "Responsabilidad civil",
    status: "conditional",
    keywords: ["responsabilidad civil", "vecino", "tercero", "daños a terceros", "indemnización", "fianza", "costas", "reclamación"],
    summary: "Cubre reclamaciones de terceros por daños personales o materiales como propietario de la vivienda o por actos de la vida privada, con defensa y fianzas civiles incluidas, pero con bastantes exclusiones clásicas.",
    included: [
      "Responsabilidad civil como propietario de la vivienda.",
      "Responsabilidad civil por actos de la vida privada del asegurado.",
      "Gastos de defensa y fianzas civiles incluidos.",
    ],
    excluded: [
      "Actos de mala fe, apuestas, desafíos o riñas.",
      "Daños ligados a profesión o actividad retribuida.",
      "Bienes confiados, cedidos, arrendados o bajo control del asegurado.",
      "Animales potencialmente peligrosos, contaminación, vehículos a motor, drones, VMP y embarcaciones salvo excepciones muy concretas.",
    ],
    claimTips: [
      "Contar el hecho como daño accidental a tercero, no como reconocimiento abierto de culpa antes de tiempo.",
      "Aportar daños, fecha, relación causal y terceros afectados.",
      "Si el origen fue un escape de agua o elemento privativo, enlazarlo con ese hecho material.",
      "Evitar introducir elementos profesionales, alquiler turístico o uso comercial porque complican la cobertura.",
    ],
    evidence: [
      { page: 5, excerpt: "Responsabilidad civil como propietario de la vivienda y por actos de la vida privada del asegurado hasta 150.000 €, con defensa y fianzas civiles incluidas." },
      { page: 8, excerpt: "No se cubren actos de mala fe, actividad profesional, bienes bajo custodia/control, vehículos a motor, drones, contaminación ni pérdidas económicas no derivadas de daño corporal o material." },
    ],
  },
  {
    id: "legal-defense",
    title: "Defensa jurídica",
    status: "conditional",
    keywords: ["abogado", "demanda", "defensa jurídica", "reclamación", "asesoramiento legal", "juicio", "consumidor", "laboral", "fiscal"],
    summary: "Incluye asesoramiento jurídico y cobertura de determinados gastos legales, con suma asegurada de hasta 6.000 € y cuantía mínima de 150 €, pero no es un cheque en blanco.",
    included: [
      "Asesoramiento jurídico telefónico, 24h y presencial.",
      "Cobertura de determinados gastos de abogados y reclamación de daños según materia cubierta.",
    ],
    excluded: [
      "Muchos supuestos administrativos, tráfico, propiedad intelectual, urbanismo, expropiación y reclamaciones entre asegurados.",
      "Daños de circulación de vehículos salvo peatón/pasajero o supuestos muy concretos.",
      "Reclamaciones inferiores a 150 €.",
    ],
    claimTips: [
      "Usarla como capa de apoyo jurídico cuando el problema ya encaja en una materia cubierta.",
      "Identificar si el conflicto es vivienda/vida privada/consumo antes de apoyarte en esta garantía.",
      "Si la cuantía es pequeña o administrativa, probablemente no compense o no entre.",
    ],
    evidence: [
      { page: 5, excerpt: "Defensa jurídica: suma asegurada hasta 6.000 €; cuantía mínima 150 €; asesoramiento jurídico telefónico, 24 horas y presencial." },
      { page: 8, excerpt: "No se cubren diversos supuestos de reclamación de daños de circulación y otras materias excluidas." },
      { page: 9, excerpt: "También quedan fuera varias materias administrativas, fiscales, laborales especiales y reclamaciones entre asegurados." },
    ],
  },
  {
    id: "weather",
    title: "Fenómenos atmosféricos",
    status: "conditional",
    keywords: ["lluvia", "viento", "pedrisco", "nieve", "inundación", "tormenta", "granizo", "temporal"],
    summary: "Cubre fenómenos atmosféricos importantes, pero exige umbrales y deja fuera bastantes daños por falta de conservación o cierres defectuosos.",
    included: [
      "Viento con umbrales entre 80 y 120 km/h según tabla.",
      "Lluvia desde 40 litros/m² y hora.",
      "Pedrisco, nieve e inundación dentro de los términos de la garantía.",
    ],
    excluded: [
      "Lluvia por debajo del umbral.",
      "Daños por puertas/ventanas mal cerradas o defectuosas.",
      "Daños por heladas, fríos o mareas.",
      "Daños con evidente falta de conservación.",
    ],
    claimTips: [
      "Apoyar el parte con datos meteorológicos del día y fotos del daño inmediato.",
      "Si entró agua por ventana/puerta, ojo: si parece cierre defectuoso, te pueden excluir.",
      "Hablar de episodio meteorológico concreto, no de problema progresivo previo.",
    ],
    evidence: [
      { page: 4, excerpt: "Fenómenos atmosféricos: viento, lluvia, pedrisco, nieve e inundación; lluvia desde 40 litros/m² y hora." },
      { page: 6, excerpt: "No se cubren daños por lluvia bajo umbral, por cierres defectuosos, heladas o evidente falta de conservación." },
    ],
  },
  {
    id: "breakage",
    title: "Roturas",
    status: "conditional",
    keywords: ["rotura", "cristal", "espejo", "mampara", "sanitario", "encimera", "pantalla", "vitro"],
    summary: "Cubre cristales, lunas, espejos y aparatos sanitarios, pero deja fuera muchas roturas de objetos decorativos, pantallas, metacrilato o daños meramente estéticos.",
    included: [
      "Cristales, lunas y espejos.",
      "Aparatos sanitarios hasta 1.800 € por pieza.",
      "Gastos de reposición, reparación, transporte y colocación.",
    ],
    excluded: [
      "Cristales de cuadros, lámparas, vajillas, menaje, pantallas y componentes de aparatos.",
      "Metacrilato, acuarios, encimeras y superficies similares según material.",
      "Arañazos, raspaduras, desconchones y defectos estéticos.",
    ],
    claimTips: [
      "Describir exactamente qué se ha roto y de qué material es.",
      "Si es pantalla, vitro o encimera, asumir riesgo alto de exclusión.",
      "Acompañar con fotos y, si aplica, señalar peligro de uso o inhabitabilidad.",
    ],
    evidence: [
      { page: 4, excerpt: "Roturas: cristales, lunas y espejos; aparatos sanitarios; máximo 1.800 € por pieza." },
      { page: 7, excerpt: "Quedan fuera pantallas, metacrilato, acuarios, encimeras y daños estéticos." },
    ],
  },
  {
    id: "illegal-occupation",
    title: "Ocupación ilegal",
    status: "conditional",
    keywords: ["okupa", "ocupación", "allanamiento", "ocupas", "suministros", "alojamiento", "vivienda ocupada"],
    summary: "La póliza sí contempla ocupación ilegal, con límites para alojamiento, suministros y daños, pero no cubre supuestos donde hubo autorización previa o contrato previo del ocupante.",
    included: [
      "Gastos de alojamiento por ocupación ilegal hasta 6 mensualidades y/o 6.000 € por siniestro.",
      "Suministros por ocupación ilegal hasta 6 mensualidades y/o 2.000 €.",
      "Daños en la vivienda por ocupación ilegal hasta 5.000 € por siniestro.",
    ],
    excluded: [
      "Si el ocupante tuvo autorización previa o existió un contrato previo que justificara la ocupación.",
      "Gastos posteriores a recuperar legalmente la posesión.",
      "Daños no consecuencia directa del allanamiento u ocupación.",
    ],
    claimTips: [
      "Acreditar que es ocupación ilegal real, no conflicto arrendaticio o tolerancia previa.",
      "Separar daños directos del allanamiento del desgaste normal del inmueble.",
      "Guardar denuncias, actas, notificaciones y fechas exactas de recuperación de la posesión.",
    ],
    evidence: [
      { page: 5, excerpt: "Ocupación ilegal: alojamiento, suministros y daños con límites de 6.000 €, 2.000 € y 5.000 € por siniestro respectivamente." },
      { page: 7, excerpt: "No queda cubierto si el ocupante tuvo autorización previa o existió contrato previo que justificara la ocupación." },
      { page: 8, excerpt: "No se abonan gastos fuera del periodo cubierto ni daños ajenos al allanamiento u ocupación." },
    ],
  },
];

const genericClaimChecklist = [
  "Identificar fecha aproximada, causa inmediata y daño material concreto.",
  "Conservar fotos, vídeos, facturas, presupuestos y cualquier prueba del origen.",
  "Evitar describirlo como desgaste, falta de mantenimiento o problema antiguo si no es eso lo que ha pasado.",
  "Si hay tercero afectado, no admitir culpa de forma amplia; contar hechos objetivos.",
  "Si hay robo, presentar denuncia y cuadrar exactamente bienes y fechas.",
  "Llamar al 91 343 58 70 / 910 503 500 si necesitas apertura formal o asistencia 24h.",
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

export function analyzePolicyQuestion(question: string): PolicyAnalysis[] {
  const normalized = normalize(question);
  if (!normalized) return [];

  return coverageTopics
    .map((topic) => {
      const matchedKeywords = topic.keywords.filter((keyword) => normalized.includes(normalize(keyword)));
      const score = matchedKeywords.length;
      const verdict =
        topic.status === "covered"
          ? "Pinta cubierto"
          : topic.status === "excluded"
            ? "Pinta excluido"
            : "Depende del detalle fino";

      return {
        topic,
        score,
        matchedKeywords,
        verdict,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score);
}

export function analyzePolicyScenario(question: string): PolicyScenarioAnswer | null {
  const normalized = normalize(question);
  if (!normalized) return null;

  const matchedTopics = analyzePolicyQuestion(question);
  const waterTopic = coverageTopics.find((topic) => topic.id === "water-damage");
  const liabilityTopic = coverageTopics.find((topic) => topic.id === "liability");

  const mentionsLeak = hasAny(normalized, ["pierde agua", "gotea", "fuga", "pierde", "escape", "gotera"]);
  const mentionsTap = hasAny(normalized, ["grifo", "griferia", "faucet"]);
  const mentionsKitchen = hasAny(normalized, ["cocina", "fregadero"]);
  const mentionsBathroom = hasAny(normalized, ["bano", "lavabo", "ducha"]);
  const mentionsNeighbor = hasAny(normalized, ["vecino", "vecina", "piso de abajo", "tercero", "terceros"]);
  const mentionsDamage = hasAny(normalized, ["mojado", "mojada", "parquet", "suelo", "mueble", "techo", "pared", "danos", "daño", "mancha"]);
  const mentionsGradual = hasAny(normalized, ["desde hace", "lleva tiempo", "poco a poco", "humedad", "condensacion", "meses", "tiempo"]);

  if (mentionsLeak && mentionsTap && (mentionsKitchen || mentionsBathroom)) {
    const roomLabel = mentionsKitchen ? "grifo de la cocina" : mentionsBathroom ? "grifo del baño" : "grifo";
    const affectsThirdParty = mentionsNeighbor;
    const directDamage = mentionsDamage;
    const gradual = mentionsGradual;

    const status: CoverageStatus = gradual
      ? "excluded"
      : affectsThirdParty || directDamage
        ? "conditional"
        : "excluded";

    return {
      status,
      title: `Caso detectado: ${roomLabel} que pierde agua`,
      summary:
        gradual
          ? "Así contado, se parece más a un problema de mantenimiento o humedad progresiva que a un siniestro indemnizable."
          : affectsThirdParty
            ? "Aquí hay dos planos: la reparación del grifo normalmente pinta fuera, pero los daños causados a terceros sí pueden entrar por daños por agua y/o responsabilidad civil."
            : directDamage
              ? "La reparación del grifo en sí pinta fuera, pero los daños materiales causados por el agua pueden entrar si el escape fue accidental y el daño es directo y reciente."
              : "Si solo me dices que el grifo pierde agua, sin daños materiales adicionales, esto no pinta como parte útil: el grifo y su ajuste/reparación suelen quedar fuera.",
      interpretation:
        gradual
          ? "La póliza excluye corrosión, deterioro generalizado, humedades progresivas y también la reparación o ajuste de grifos y mecanismos de fontanería."
          : affectsThirdParty
            ? "Lo fino es separar la avería propia no cubierta (grifo/junta/mecanismo) de los daños que ese escape haya causado fuera de ese elemento. Si ha mojado al vecino, ahí sí hay base más seria para reclamar."
            : directDamage
              ? "La póliza no está pensada para pagarte el arreglo del grifo como mantenimiento, pero sí puede responder por el daño derivado del agua sobre suelo, mueble, pared o similar si hubo siniestro real."
              : "Sin daño material directo, abrir parte por un grifo que gotea tiene mala pinta y te expones a que lo traten como mantenimiento ordinario.",
      whatIsLikelyCovered: [
        ...(directDamage ? ["Daños materiales directos causados por el agua sobre suelo, muebles, paredes o similares, si el escape fue accidental y reciente."] : []),
        ...(affectsThirdParty ? ["Daños causados al vecino o a terceros, con posible encaje además en responsabilidad civil."] : []),
        ...(directDamage ? ["Si hay que localizar o reparar tubería privativa causante y hay daño real, esa parte puede tener mejor encaje que un simple ajuste de grifo."] : []),
      ],
      whatIsLikelyNotCovered: [
        `La reparación o ajuste del propio ${roomLabel}.`,
        "Juntas, manguitos, mecanismos de fontanería y ajustes similares.",
        ...(gradual ? ["Humedad o deterioro progresivo por falta de mantenimiento."] : []),
        ...(!directDamage && !affectsThirdParty ? ["Un simple goteo sin daño material directo adicional."] : []),
      ],
      claimFocus: gradual
        ? [
            "Si realmente lleva tiempo o es desgaste, mejor no enfocarlo como siniestro cubierto porque la póliza te lo puede rechazar fácil.",
            "Solo tendría sentido parte si además hubo un daño súbito y diferenciable causado por ese escape.",
          ]
        : [
            "Separar claramente la avería del grifo (probablemente fuera) del daño causado por el agua (potencialmente dentro).",
            "Describir cuándo se detectó, qué se mojó y qué daño visible quedó.",
            ...(affectsThirdParty ? ["Si afectó a un vecino, contarlo como daños accidentales derivados de un escape detectado en tu vivienda, sin discutir culpa de más."] : []),
            ...(directDamage ? ["Aportar fotos del daño, zona afectada y, si existe, informe o factura del fontanero que describa el origen."] : []),
          ],
      clarificationQuestions: [
        ...(directDamage ? [] : ["¿Ha llegado a dañar algo además del propio grifo: mueble, suelo, pared o techo?"]),
        ...(affectsThirdParty ? [] : ["¿Ha afectado al vecino o solo a tu vivienda?"]),
        ...(gradual ? [] : ["¿Fue algo repentino o llevaba tiempo goteando? "]),
      ],
      evidence: [
        ...(waterTopic?.evidence ?? []),
        {
          page: 7,
          excerpt: "No se cubre la reparación o ajuste de grifos, llaves de paso, juntas, manguitos, mecanismos de fontanería ni aparatos sanitarios y sus accesorios.",
        },
        ...(affectsThirdParty && liabilityTopic ? liabilityTopic.evidence : []),
      ],
      matchedTopics,
    };
  }

  const primaryMatch = matchedTopics[0];
  if (!primaryMatch) return null;

  return {
    status: primaryMatch.topic.status,
    title: primaryMatch.topic.title,
    summary: primaryMatch.topic.summary,
    interpretation: `${primaryMatch.verdict}. Aquí todavía necesito más contexto del hecho concreto para afinar de verdad.`,
    whatIsLikelyCovered: primaryMatch.topic.included,
    whatIsLikelyNotCovered: primaryMatch.topic.excluded,
    claimFocus: primaryMatch.topic.claimTips,
    clarificationQuestions: [
      "¿Qué se ha dañado exactamente?",
      "¿Fue algo súbito o venía de antes?",
      "¿Afecta solo a tu vivienda o también a terceros?",
    ],
    evidence: primaryMatch.topic.evidence,
    matchedTopics,
  };
}

export function getGenericClaimChecklist() {
  return genericClaimChecklist;
}
