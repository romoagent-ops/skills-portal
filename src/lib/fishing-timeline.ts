import type { LiveConditions } from "@/lib/fishing-types";

export type FishingTimelineSlot = {
  label: string;
  score: number;
  reason: string;
};

export function buildFishingTimeline(conditions: LiveConditions | null): FishingTimelineSlot[] {
  if (!conditions?.hourly?.length) return [];

  const buckets = [
    { label: "Amanecer", start: 6, end: 9 },
    { label: "Mañana", start: 9, end: 12 },
    { label: "Mediodía", start: 12, end: 16 },
    { label: "Tarde", start: 16, end: 20 },
  ];

  return buckets.map((bucket) => {
    const slice = conditions.hourly!.filter((item) => {
      const hour = Number(item.time.slice(11, 13));
      return hour >= bucket.start && hour < bucket.end;
    });

    if (!slice.length) {
      return { label: bucket.label, score: 0, reason: "Sin datos" };
    }

    const avgWind = slice.reduce((sum, item) => sum + item.windSpeedKmh, 0) / slice.length;
    const avgCloud = slice.reduce((sum, item) => sum + item.cloudCover, 0) / slice.length;
    let score = 5;
    if (bucket.label === "Amanecer") score += 2;
    if (avgWind >= 6 && avgWind <= 14) score += 2;
    if (avgWind > 18) score -= 2;
    if (avgCloud >= 20 && avgCloud <= 70) score += 1;

    const reason = `viento medio ${avgWind.toFixed(1)} km/h · nubosidad ${avgCloud.toFixed(0)}%`;
    return { label: bucket.label, score: Math.max(1, Math.min(10, Math.round(score))), reason };
  });
}
