import { fetchEmbalsesNetLevel } from "@/lib/embalses-net";

export async function fetchReservoirLevel(reservoirId: string) {
  const snapshot = await fetchEmbalsesNetLevel(reservoirId);
  if (!snapshot) return null;

  return {
    levelPercent: snapshot.currentPercent,
    levelTrendHm3: snapshot.weeklyChangeHm3,
    source: snapshot.source,
    pageUrl: snapshot.pageUrl,
    snapshot,
  };
}
