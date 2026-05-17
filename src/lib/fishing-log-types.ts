import type { FishingMode, Species } from "@/lib/fishing-types";

export type FishingSessionLog = {
  id: string;
  ownerKey: string;
  reservoirId: string;
  targetSpecies: Species;
  mode: FishingMode;
  usingSonar: boolean;
  sonarDevice?: string;
  tripDate: string;
  notes?: string;
  createdAt: string;
};

export type FishingCatchLog = {
  id: string;
  sessionId: string;
  species: Species;
  weightKg?: number;
  lengthCm?: number;
  lure?: string;
  technique?: string;
  depthM?: number;
  notes?: string;
  createdAt: string;
};
