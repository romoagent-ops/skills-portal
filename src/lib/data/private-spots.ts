import localSpots from "@/lib/data/private-spots.local.json";

export type PrivateSpotPreview = {
  id: string;
  reservoirId: string;
  aliasVisible: string;
  sensitivity: "private" | "secret" | "shared";
  depthHintM?: number;
  structureTags: string[];
  notesPrivate?: string;
};

export const mockPrivateSpots: PrivateSpotPreview[] = localSpots as PrivateSpotPreview[];
