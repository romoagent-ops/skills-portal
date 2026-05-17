export type Species = "black bass" | "lucio" | "barbo" | "lucioperca";
export type FishingMode = "pato" | "orilla" | "bass-boat";
export type SpotSensitivity = "private" | "secret" | "shared";

export type Reservoir = {
  id: string;
  name: string;
  province: string;
  basin: string;
  latitude: number;
  longitude: number;
  primarySpecies: Species[];
  forage: string[];
  pressure: "baja" | "media" | "alta";
  clarity: "tomada" | "mixta" | "clara";
  notes: string;
  publicZones: string[];
  privateSupport: boolean;
};

export type FishingAppState = {
  reservoirId: string;
  tripDate: string;
  targetSpecies: Species;
  mode: FishingMode;
  usingSonar: boolean;
  sonarModel: string;
  selectedSpotKind: "public" | "private";
  selectedSpotName: string;
};

export type ReservoirLevelSnapshot = {
  source?: string;
  pageUrl?: string;
  currentHm3?: number;
  currentPercent?: number;
  capacityHm3?: number;
  weeklyChangeHm3?: number;
  weeklyChangePercent?: number;
  sameWeekLastYearHm3?: number;
  sameWeekLastYearPercent?: number;
  sameWeekTenYearAvgHm3?: number;
  sameWeekTenYearAvgPercent?: number;
  annualChartUrl?: string;
  historicChartUrl?: string;
  inflowChartUrl?: string;
  updatedAt?: string;
};

export type LiveConditions = {
  reservoirId: string;
  date: string;
  temperatureMinC?: number;
  temperatureMaxC?: number;
  precipitationProbabilityMax?: number;
  sunrise?: string;
  sunset?: string;
  windSpeedMaxKmh?: number;
  windGustsMaxKmh?: number;
  weatherCode?: number;
  levelPercent?: number;
  levelTrendHm3?: number;
  level?: ReservoirLevelSnapshot;
  moonPhaseLabel?: string;
  moonIlluminationPercent?: number;
  fishActivityScore?: number;
  solunarMajor?: string[];
  solunarMinor?: string[];
  hourly?: Array<{
    time: string;
    temperatureC: number;
    windSpeedKmh: number;
    windDirectionDeg: number;
    cloudCover: number;
    weatherCode?: number;
  }>;
  summary: string;
};
