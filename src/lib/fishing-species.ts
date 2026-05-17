import type { LiveConditions, Species } from "@/lib/fishing-types";

export function buildSpeciesOverlay(species: Species, live?: LiveConditions | null) {
  const wind = live?.windSpeedMaxKmh ?? 0;

  switch (species) {
    case "lucio":
      return {
        summary: "Para lucio manda localizar comida, viento útil y transiciones largas con posibilidad de emboscada.",
        lures: ["spinnerbait", "chatterbait", "swimbait", "jerkbait"],
        notes: [
          wind >= 8 ? "Con viento útil, prioriza recortados, puntas y orillas batidas." : "Sin viento serio, mejor buscar cambios claros de profundidad y pez pasto agrupado.",
          "No te obsesiones con la orilla si la sonda enseña vida suspendida o escalonada fuera.",
        ],
      };
    case "barbo":
      return {
        summary: "Para barbo interesa mucho la actividad visible, entradas de agua, reculas vivas y momentos de movimiento real.",
        lures: ["vinilo natural", "crank pequeño", "swimbait fino", "montaje ligero"],
        notes: [
          "Si ves persecuciones o peces comiendo arriba, cambia el chip rápido: el barbo bueno no espera eternamente.",
          "Las zonas mixtas con corriente o mezcla suelen subir enteros frente a agua completamente muerta.",
        ],
      };
    case "lucioperca":
      return {
        summary: "Para lucioperca manda más la lectura de profundidad, pez pasto y control de la capa de agua que la pesca visual pura.",
        lures: ["vinilo shad", "jighead", "damiki si la pantalla lo justifica", "montaje vertical"],
        notes: [
          "Aquí la sonda pesa mucho más: si no ves pez o comida, no inventes patrón por fe.",
          "Amanecer y últimas horas siguen contando, pero el pez puede estar plenamente pescable en horas centrales si está bien colocado.",
        ],
      };
    default:
      return {
        summary: "Black bass como objetivo principal: mezcla de transición, cobertura, pez pasto y ajuste fino por presión.",
        lures: [],
        notes: [],
      };
  }
}
