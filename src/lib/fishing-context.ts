import type { LiveConditions, Reservoir } from "@/lib/fishing-types";
import { fetchLiveConditions } from "@/lib/fishing-conditions";
import { fetchReservoirLevel } from "@/lib/fishing-levels";
import { getMoonPhase } from "@/lib/fishing-moon";
import { addDerivedSolunarWindows } from "@/lib/fishing-solunar";

export async function fetchFishingContext(reservoir: Reservoir, date: string): Promise<LiveConditions> {
  const [weather, level] = await Promise.all([
    fetchLiveConditions(reservoir, date),
    fetchReservoirLevel(reservoir.id).catch(() => null),
  ]);

  const moon = getMoonPhase(date);
  const summaryParts = [weather.summary];
  if (level?.levelPercent !== undefined) {
    summaryParts.push(`embalse ${level.levelPercent}%`);
  }
  if (level?.levelTrendHm3 !== undefined) {
    summaryParts.push(`${level.levelTrendHm3 >= 0 ? "sube" : "baja"} ${Math.abs(level.levelTrendHm3)} hm³`);
  }
  summaryParts.push(`${moon.label.toLowerCase()} ${moon.illuminationPercent}%`);

  return addDerivedSolunarWindows({
    ...weather,
    levelPercent: level?.levelPercent,
    levelTrendHm3: level?.levelTrendHm3,
    level: level?.snapshot,
    moonPhaseLabel: moon.label,
    moonIlluminationPercent: moon.illuminationPercent,
    summary: summaryParts.join(" · "),
  });
}
