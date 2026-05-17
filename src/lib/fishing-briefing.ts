import type { PrivateSpotPreview } from "@/lib/data/private-spots";
import type { FishingLearningSummary } from "@/lib/fishing-learning";
import type { FishingMode, LiveConditions, Reservoir, Species } from "@/lib/fishing-types";
import { buildSpeciesOverlay } from "@/lib/fishing-species";
import { publicZones } from "@/lib/fishing-zones";

export type BriefingInput = {
  reservoir: Reservoir;
  tripDate: string;
  targetSpecies: Species;
  mode: FishingMode;
  usingSonar: boolean;
  selectedSpotKind: "public" | "private";
  selectedSpotName: string;
  privateSpots: PrivateSpotPreview[];
  liveConditions?: LiveConditions | null;
  learning?: FishingLearningSummary;
};

export type BriefingOutput = {
  summary: string;
  confidence: "high" | "medium" | "low";
  windows: string[];
  keyZones: string[];
  lures: string[];
  techniques: string[];
  sonarPlan: string[];
  secondarySpecies: string[];
  notes: string[];
};

function seasonPhaseForDate(dateIso: string) {
  const month = Number(dateIso.slice(5, 7));
  if ([3, 4].includes(month)) return "pre-freza";
  if ([5, 6].includes(month)) return "post-freza";
  if ([7, 8].includes(month)) return "verano";
  if ([9, 10].includes(month)) return "otoño";
  return "invierno";
}

function windRead(speed?: number) {
  if (speed === undefined) return "sin lectura de viento";
  if (speed < 6) return "viento muy flojo";
  if (speed < 12) return "viento flojo útil";
  if (speed < 20) return "viento moderado";
  return "viento duro";
}

function genericOutput(input: BriefingInput, phase: string, reservoirZones: ReturnType<typeof publicZones.filter>, secondarySpecies: string[], windNote: string, live?: LiveConditions | null): BriefingOutput {
  const weatherSummary = live?.summary ? ` Condición live: ${live.summary}.` : "";
  const learningSummary = input.learning?.summary ? ` Aprendizaje propio: ${input.learning.summary}` : "";
  const sunriseWindow = live?.sunrise ? `Apretar desde amanecer (${live.sunrise.slice(11, 16)}) hasta media mañana.` : "Apretar amanecer hasta media mañana.";
  const eveningWindow = live?.sunset ? `Última revisión seria antes de la caída de luz (${live.sunset.slice(11, 16)}).` : "Últimas horas con cambio de luz como cierre fuerte.";
  const levelRead = live?.levelPercent !== undefined
    ? `Nivel ${live.levelPercent}%${live.levelTrendHm3 !== undefined ? ` (${live.levelTrendHm3 >= 0 ? "subiendo" : "bajando"} ${Math.abs(live.levelTrendHm3)} hm³)` : ""}`
    : "sin lectura de nivel";

  return {
    summary: `${input.reservoir.name} todavía está en fase base dentro de la app. Ya hay estructura suficiente para darte briefing, pero el modelado fino de este embalse aún no está al nivel de García Sola.${weatherSummary}${learningSummary}`,
    confidence: live ? "medium" : "low",
    windows: [sunriseWindow, `En ${phase}, prioriza cambios de profundidad, coberturas y pez pasto activo.`, eveningWindow],
    keyZones: reservoirZones.length ? reservoirZones.map((zone) => `${zone.name}: ${zone.tacticalNote}`) : ["Faltan zonas públicas curadas para este embalse en la base actual."],
    lures: ["Fluke", "Texas rig", "Jig", live?.windSpeedMaxKmh && live.windSpeedMaxKmh >= 8 ? "Spinnerbait / chatter" : "Spinnerbait si el viento acompaña"],
    techniques: [`Empieza simple: transición, cobertura, lectura de actividad y ajuste por claridad/presión. Hoy manda ${windNote}.`],
    sonarPlan: input.usingSonar ? ["Busca pez pasto, suspensiones claras y cortes con vida antes de insistir con damiki."] : ["Sin sonda, prioriza agua con señal visual y estructura evidente."],
    secondarySpecies,
    notes: [
      `${levelRead}${live?.moonPhaseLabel ? ` · ${live.moonPhaseLabel} ${live.moonIlluminationPercent}%` : ""}.`,
      ...(input.learning?.topLures?.length ? [`Señuelos con señal en tu histórico: ${input.learning.topLures.join(", ")}.`] : []),
      "Hay que seguir curando este embalse para darte una lectura premium.",
    ],
  };
}

export function generateBriefing(input: BriefingInput): BriefingOutput {
  const phase = seasonPhaseForDate(input.tripDate);
  const speciesOverlay = buildSpeciesOverlay(input.targetSpecies, input.liveConditions);
  const reservoirZones = publicZones.filter((zone) => zone.reservoirId === input.reservoir.id);
  const secondarySpecies = input.reservoir.primarySpecies.filter((species) => species !== input.targetSpecies);
  const live = input.liveConditions;
  const weatherSummary = live?.summary ? ` Condición live: ${live.summary}.` : "";
  const learningSummary = input.learning?.summary ? ` Aprendizaje propio: ${input.learning.summary}` : "";
  const sunriseWindow = live?.sunrise ? `Apretar desde amanecer (${live.sunrise.slice(11, 16)}) hasta media mañana.` : "Apretar amanecer hasta media mañana.";
  const eveningWindow = live?.sunset ? `Última revisión seria antes de la caída de luz (${live.sunset.slice(11, 16)}).` : "Últimas horas con cambio de luz como cierre fuerte.";
  const windNote = windRead(live?.windSpeedMaxKmh);
  const levelRead = live?.levelPercent !== undefined
    ? `Nivel ${live.levelPercent}%${live.levelTrendHm3 !== undefined ? ` (${live.levelTrendHm3 >= 0 ? "subiendo" : "bajando"} ${Math.abs(live.levelTrendHm3)} hm³)` : ""}`
    : "sin lectura de nivel";

  if (input.reservoir.id === "garcia-sola" && input.targetSpecies === "black bass") {
    const spotHint = input.selectedSpotKind === "private"
      ? `Empieza revisando el privado "${input.selectedSpotName}" con mentalidad de transición y no te cases si no ves vida.`
      : `Si arrancas en "${input.selectedSpotName}", exprime primero estructura, sombra y salida a profundidad antes de correr agua.`;

    return {
      summary: `García Sola en ${phase} pide jornada técnica: pez de calidad, bastante presión y premio claro para quien combine cobertura, transición y lectura fina con sonda. ${spotHint}${weatherSummary}${learningSummary}`,
      confidence: live ? "high" : "medium",
      windows: [
        sunriseWindow,
        ...(live?.solunarMajor?.map((slot) => `Mayor: ${slot}`) ?? []),
        ...(live?.solunarMinor?.map((slot) => `Menor: ${slot}`) ?? []),
        "Franja central si coincide con actividad o solunar: bajar ritmo y pescar más fino.",
        eveningWindow,
      ],
      keyZones: reservoirZones.slice(0, 4).map((zone) => `${zone.name}: ${zone.tacticalNote}`),
      lures: ["Fluke weightless", "Senko / stickbait weightless o wacky", "Texas rig con creature o worm", "Jig fino para piedra/alga", live?.windSpeedMaxKmh && live.windSpeedMaxKmh >= 8 ? "Spinnerbait o chatter por viento útil" : "Spinnerbait o chatter si entra viento"],
      techniques: [
        `Pesca de transición sobre punta, salida de recula y piedra con cambio de profundidad; hoy manda ${windNote}.`,
        "Alterna reacción suave al amanecer con texas/jig cuando el pez se ponga fino.",
        "No te quedes solo en la orilla visible: revisa paralelo + cara profunda del puesto.",
      ],
      sonarPlan: input.usingSonar
        ? [
            "Buscar bolas de alburno y pez suspendido cerca de puntas y taludes.",
            "Revisar si hay actividad fuera del fondo en cortes limpios y salidas de recula.",
            live?.windSpeedMaxKmh && live.windSpeedMaxKmh < 8 ? "Con poco viento, mejor leer fino y no forzar damiki si la pantalla no enseña pez colocado." : "Si el viento mueve agua pero ves pez colocado en columna, aquí sí puede entrar damiki con sentido.",
          ]
        : ["Sin sonda: apóyate más en viento, actividad superficial, cobertura y cambios de profundidad visibles."],
      secondarySpecies,
      notes: [
        "El alburno y el cangrejo condicionan mucho la decisión entre natural/reacción.",
        ...(input.learning?.topLures?.length ? [`Histórico útil de señuelos: ${input.learning.topLures.join(", ")}.`] : []),
        `Lectura meteo del día: ${windNote}${live?.temperatureMinC !== undefined && live?.temperatureMaxC !== undefined ? ` · ${live.temperatureMinC}-${live.temperatureMaxC}ºC` : ""}.`,
        `${levelRead}${live?.moonPhaseLabel ? ` · ${live.moonPhaseLabel} ${live.moonIlluminationPercent}%` : ""}.`,
      ],
    };
  }

  if (input.reservoir.id === "orellana" && input.targetSpecies === "black bass") {
    return {
      summary: `Orellana te va a pedir más cabeza que agresividad: agua clara, pez receloso y mucha importancia de la precisión, el ángulo y la distancia. Aquí no gana el que más lanza, gana el que menos regala presencia.${weatherSummary}${learningSummary}`,
      confidence: live ? "high" : "medium",
      windows: [
        sunriseWindow,
        ...(live?.solunarMajor?.map((slot) => `Mayor: ${slot}`) ?? []),
        "Media mañana para peces suspendidos o pegados al primer escalón serio si la orilla visible se apaga.",
        eveningWindow,
      ],
      keyZones: reservoirZones.map((zone) => `${zone.name}: ${zone.tacticalNote}`),
      lures: ["Fluke natural", "Senko fino", "Neko rig", "Jig compacto marrón/verde", live?.windSpeedMaxKmh && live.windSpeedMaxKmh >= 8 ? "Spinnerbait pequeño o swimbait fino en orilla batida" : "Reaction muy controlado, sin pasarte de ruido"],
      techniques: [
        "Pesca más lejos y más fino: Orellana castiga ruido, sombra y errores de aproximación.",
        "Empieza por puntas claras y cambios de piedra; si no responden, baja al primer corte serio.",
        `Con ${windNote}, decide entre finesse puro o algo de reacción controlada en orilla batida.`,
      ],
      sonarPlan: input.usingSonar
        ? [
            "Usa la sonda para decidir si el pez está pegado al fondo o suspendido fuera del primer drop.",
            "Damiki solo si ves pez claramente suspendido y orientado a pasto en agua limpia.",
            "Si la pantalla está vacía, no te inventes el patrón: vuelve a visual y transición.",
          ]
        : ["Sin sonda, manda la lectura visual, el agua clara y la disciplina de no quemar puestos rápido."],
      secondarySpecies,
      notes: [
        "Alburno y claridad te empujan a naturalidad y control de caída.",
        ...(input.learning?.topLures?.length ? [`Histórico útil de señuelos: ${input.learning.topLures.join(", ")}.`] : []),
        `${levelRead}${live?.moonPhaseLabel ? ` · ${live.moonPhaseLabel} ${live.moonIlluminationPercent}%` : ""}.`,
      ],
    };
  }

  if (input.reservoir.id === "cijara" && input.targetSpecies === "black bass") {
    return {
      summary: `Cíjara es menos de microdetalle y más de elegir bien el sector. Mucha agua, muchos escenarios y premio claro si encuentras pez menos tocado o alimento activo en el brazo correcto.${weatherSummary}${learningSummary}`,
      confidence: live ? "high" : "medium",
      windows: [
        sunriseWindow,
        ...(live?.solunarMajor?.map((slot) => `Mayor: ${slot}`) ?? []),
        "Bloque central para revisar colas, brazos y puntas con vida real, no por intuición.",
        eveningWindow,
      ],
      keyZones: reservoirZones.map((zone) => `${zone.name}: ${zone.tacticalNote}`),
      lures: ["Spinnerbait", "Chatterbait", "Fluke", "Texas con creature", "Jig si la madera o el corte lo piden"],
      techniques: [
        "En Cíjara compensa correr menos sectores pero con criterio: busca agua con señal y menos presión.",
        "Combina power fishing en roca/recortado con pausas más finas en puntas o coberturas aisladas.",
        `Si entra ${windNote}, los recortados rocosos y las puntas con alimento ganan mucho peso.`,
      ],
      sonarPlan: input.usingSonar
        ? [
            "Úsala para confirmar vida antes de enamorarte de un brazo bonito pero vacío.",
            "Busca pasto, cortes con pez suspendido y transiciones largas con actividad escalonada.",
            "Damiki tiene sentido solo si realmente ves pez en columna; si no, manda cubrir agua con cabeza.",
          ]
        : ["Sin sonda, la elección del sector es todavía más crítica: viento, pasto y presión mandan."],
      secondarySpecies,
      notes: [
        "Lucio y lucioperca pueden cruzarse más fácilmente aquí si sales del patrón puro de bass.",
        ...(input.learning?.topTechniques?.length ? [`Técnicas con señal en tu histórico: ${input.learning.topTechniques.join(", ")}.`] : []),
        `${levelRead}${live?.moonPhaseLabel ? ` · ${live.moonPhaseLabel} ${live.moonIlluminationPercent}%` : ""}.`,
      ],
    };
  }

  if (input.targetSpecies !== "black bass") {
    return {
      summary: `${input.reservoir.name}: ${speciesOverlay.summary}${weatherSummary}${learningSummary}`,
      confidence: live ? "medium" : "low",
      windows: [
        sunriseWindow,
        ...(live?.solunarMajor?.map((slot) => `Mayor: ${slot}`) ?? []),
        eveningWindow,
      ],
      keyZones: reservoirZones.length ? reservoirZones.map((zone) => `${zone.name}: ${zone.tacticalNote}`) : ["Faltan zonas curadas para este embalse."],
      lures: speciesOverlay.lures,
      techniques: [
        `Ajusta la jornada a ${input.targetSpecies}: menos automatismo de bass y más lectura específica de comida, profundidad y momento.`,
        `Hoy manda ${windNote}.`,
      ],
      sonarPlan: input.usingSonar
        ? [
            `Usa la sonda para confirmar patrón de ${input.targetSpecies} antes de insistir.`,
            ...(input.targetSpecies === "lucioperca" ? ["Si no ves pez colocado, no fuerces damiki."] : []),
          ]
        : ["Sin sonda, apóyate en actividad visible, sectores vivos y estructura clara."],
      secondarySpecies,
      notes: [
        ...speciesOverlay.notes,
        ...(input.learning?.topLures?.length ? [`Histórico útil de señuelos: ${input.learning.topLures.join(", ")}.`] : []),
        `${levelRead}${live?.moonPhaseLabel ? ` · ${live.moonPhaseLabel} ${live.moonIlluminationPercent}%` : ""}.`,
      ],
    };
  }

  return genericOutput(input, phase, reservoirZones, secondarySpecies, windNote, live);
}
