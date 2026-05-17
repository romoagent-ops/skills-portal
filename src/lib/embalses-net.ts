import type { ReservoirLevelSnapshot } from "@/lib/fishing-types";

const embalsesNetSlugs: Record<string, string | undefined> = {
  "garcia-sola": "521-garcia-de-sola",
  cijara: "504-cijara",
  orellana: "555-orellana",
  "la-fernandina": "332-la-fernandina",
  encinarejo: "68-encinarejo",
  guadalmena: "348-guadalmena",
  yeguas: "462-yeguas",
  "san-rafael-de-navallana": "445-san-rafael-de-navallana",
  "la-brena": "39-la-brena-ii",
};

function parseSpanishNumber(raw?: string) {
  if (!raw) return undefined;
  const normalized = raw.replace(/\./g, "").replace(/,/g, ".").trim();
  const value = Number(normalized);
  return Number.isFinite(value) ? value : undefined;
}

function extractRowValues(html: string, labelPattern: string) {
  const pattern = new RegExp(
    `<div class="Campo">(?:<strong>)?${labelPattern}(?:<\\/strong>)?<\\/div>\\s*<div class="Resultado">(?:<strong>)?([^<]+)(?:<\\/strong>)?<\\/div>.*?<div class="Resultado">(?:<strong>)?([^<]+)(?:<\\/strong>)?<\\/div>`,
    "is",
  );
  const match = html.match(pattern);
  if (!match) return { first: undefined, second: undefined };
  return {
    first: parseSpanishNumber(match[1].replace(/&nbsp;/g, "")),
    second: parseSpanishNumber(match[2].replace(/&nbsp;/g, "")),
  };
}

function extractUpdatedAt(html: string) {
  const match = html.match(/Última actualizaci[^:]*:\s*<b>([^<]+)<\/b>/i);
  return match?.[1]?.trim();
}

function extractImageUrl(html: string, slug: string, suffix = "") {
  const escaped = suffix ? `${slug}${suffix}` : slug;
  const match = html.match(new RegExp(`<img[^>]+src="([^"]*${escaped}[^"]*)"`, "i"));
  if (!match?.[1]) return undefined;
  return new URL(match[1], "https://www.embalses.net").toString();
}

export function getEmbalsesNetPageUrl(reservoirId: string) {
  const slug = embalsesNetSlugs[reservoirId];
  return slug ? `https://www.embalses.net/pantano-${slug}.html` : undefined;
}

export async function fetchEmbalsesNetLevel(reservoirId: string): Promise<ReservoirLevelSnapshot | null> {
  const pageUrl = getEmbalsesNetPageUrl(reservoirId);
  if (!pageUrl) return null;

  const response = await fetch(pageUrl, {
    headers: { "user-agent": "Mozilla/5.0 Romo Fishing Intel" },
    next: { revalidate: 3600 },
  });
  if (!response.ok) throw new Error(`Embalses.net ${response.status}`);

  const html = await response.text();
  const slug = embalsesNetSlugs[reservoirId] ?? "";
  const water = extractRowValues(html, "Agua embalsada(?: \\([^)]*\\))?:");
  const variation = extractRowValues(html, "Variación semana Anterior:");
  const capacity = extractRowValues(html, "Capacidad:");
  const lastYear = extractRowValues(html, "Misma Semana \\(2025\\):");
  const tenYear = extractRowValues(html, "Misma Semana \\(Med\. 10 Años\\):");

  return {
    source: "embalses.net",
    pageUrl,
    currentHm3: water.first,
    currentPercent: water.second,
    capacityHm3: capacity.first,
    weeklyChangeHm3: variation.first,
    weeklyChangePercent: variation.second,
    sameWeekLastYearHm3: lastYear.first,
    sameWeekLastYearPercent: lastYear.second,
    sameWeekTenYearAvgHm3: tenYear.first,
    sameWeekTenYearAvgPercent: tenYear.second,
    annualChartUrl: extractImageUrl(html, `pantano-${slug.split("-")[0]}`),
    historicChartUrl: extractImageUrl(html, `pantano-${slug.split("-")[0]}-historico`),
    inflowChartUrl: extractImageUrl(html, `embalse-${slug.split("-")[0]}-entradas`),
    updatedAt: extractUpdatedAt(html),
  };
}
