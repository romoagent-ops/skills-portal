export type ExtractedCoordinates = {
  lat: number;
  lon: number;
};

function parseLatLonPair(raw: string): ExtractedCoordinates | null {
  const match = raw.match(/(-?\d{1,3}\.\d+),\s*(-?\d{1,3}\.\d+)/);
  if (!match) return null;
  const lat = Number(match[1]);
  const lon = Number(match[2]);
  if (Number.isNaN(lat) || Number.isNaN(lon)) return null;
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) return null;
  return { lat, lon };
}

export function extractCoordinatesFromGoogleMapsUrl(rawUrl: string): ExtractedCoordinates | null {
  const input = rawUrl.trim();
  if (!input) return null;

  const direct = parseLatLonPair(input);
  if (direct) return direct;

  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return null;
  }

  const candidates = [
    url.searchParams.get("q"),
    url.searchParams.get("ll"),
    url.searchParams.get("center"),
    url.searchParams.get("query"),
    decodeURIComponent(url.pathname),
    decodeURIComponent(url.hash.replace(/^#/, "")),
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    const parsed = parseLatLonPair(candidate);
    if (parsed) return parsed;
  }

  const atMatch = `${url.pathname}${url.hash}`.match(/@(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)/);
  if (atMatch) {
    const lat = Number(atMatch[1]);
    const lon = Number(atMatch[2]);
    if (!Number.isNaN(lat) && !Number.isNaN(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180) {
      return { lat, lon };
    }
  }

  return null;
}
