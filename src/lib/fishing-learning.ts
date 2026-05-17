import type { FishingCatchLog, FishingSessionLog } from "@/lib/fishing-log-types";
import type { Species } from "@/lib/fishing-types";

export type FishingLearningSummary = {
  sessionCount: number;
  catchCount: number;
  topLures: string[];
  topTechniques: string[];
  averageWeightKg?: number;
  latestTripDate?: string;
  summary: string;
};

export function summarizeLearning(input: {
  reservoirId: string;
  species: Species;
  sessions: Array<FishingSessionLog & { catches: FishingCatchLog[] }>;
}): FishingLearningSummary {
  const relevantSessions = input.sessions.filter(
    (session) => session.reservoirId === input.reservoirId && session.targetSpecies === input.species,
  );

  const catches = relevantSessions.flatMap((session) =>
    session.catches.filter((item) => item.species === input.species),
  );

  const lureCounts = new Map<string, number>();
  const techniqueCounts = new Map<string, number>();
  let weightSum = 0;
  let weightCount = 0;

  for (const item of catches) {
    if (item.lure) lureCounts.set(item.lure, (lureCounts.get(item.lure) ?? 0) + 1);
    if (item.technique) techniqueCounts.set(item.technique, (techniqueCounts.get(item.technique) ?? 0) + 1);
    if (typeof item.weightKg === "number") {
      weightSum += item.weightKg;
      weightCount += 1;
    }
  }

  const topLures = [...lureCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([key]) => key);
  const topTechniques = [...techniqueCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3).map(([key]) => key);
  const averageWeightKg = weightCount ? Number((weightSum / weightCount).toFixed(2)) : undefined;
  const latestTripDate = relevantSessions[0]?.tripDate;

  const summary = relevantSessions.length
    ? `${relevantSessions.length} jornadas y ${catches.length} capturas registradas para ${input.species}${topLures.length ? `. Señuelos con señal: ${topLures.join(", ")}` : ""}.`
    : `Todavía no hay histórico propio para ${input.species} en este embalse.`;

  return {
    sessionCount: relevantSessions.length,
    catchCount: catches.length,
    topLures,
    topTechniques,
    averageWeightKg,
    latestTripDate,
    summary,
  };
}
