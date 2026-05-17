import "server-only";

import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import { reservoirs } from "@/lib/fishing-data";
import { getOwnerKey, isSupabaseConfigured } from "@/lib/env";
import { mockPrivateSpots, type PrivateSpotPreview } from "@/lib/data/private-spots";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const localPrivateSpotsPath = path.join(process.cwd(), "src/lib/data/private-spots.local.json");

async function readLocalPrivateSpots(): Promise<PrivateSpotPreview[]> {
  try {
    const raw = await fs.readFile(localPrivateSpotsPath, "utf8");
    return JSON.parse(raw) as PrivateSpotPreview[];
  } catch {
    return mockPrivateSpots;
  }
}

async function writeLocalPrivateSpots(spots: PrivateSpotPreview[]) {
  await fs.writeFile(localPrivateSpotsPath, `${JSON.stringify(spots, null, 2)}\n`, "utf8");
}

export async function getReservoirCatalog() {
  if (!isSupabaseConfigured()) {
    return reservoirs;
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) return reservoirs;

  const { data, error } = await supabase
    .from("fishing_reservoirs")
    .select("slug, name, province, basin, primary_species, forage_species, pressure_level, clarity_profile, notes, lat:latitude, lon:longitude")
    .order("name");

  if (error || !data?.length) return reservoirs;

  return data.map((row) => {
    const fallback = reservoirs.find((item) => item.id === row.slug);
    return {
      id: row.slug,
      name: row.name,
      province: row.province ?? "",
      basin: row.basin ?? "",
      latitude: typeof row.lat === "number" ? row.lat : fallback?.latitude ?? 0,
      longitude: typeof row.lon === "number" ? row.lon : fallback?.longitude ?? 0,
      primarySpecies: (row.primary_species ?? []) as ("black bass" | "lucio" | "barbo" | "lucioperca")[],
      forage: row.forage_species ?? [],
      pressure: (row.pressure_level ?? "media") as "baja" | "media" | "alta",
      clarity: (row.clarity_profile ?? "mixta") as "tomada" | "mixta" | "clara",
      notes: row.notes ?? "",
      publicZones: fallback?.publicZones ?? [],
      privateSupport: true,
    };
  });
}

export async function getPrivateSpotsByReservoir(reservoirId: string) {
  if (!isSupabaseConfigured()) {
    const localSpots = await readLocalPrivateSpots();
    return localSpots.filter((spot) => spot.reservoirId === reservoirId);
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) {
    const localSpots = await readLocalPrivateSpots();
    return localSpots.filter((spot) => spot.reservoirId === reservoirId);
  }

  const ownerKey = getOwnerKey();
  const { data: reservoir } = await supabase
    .from("fishing_reservoirs")
    .select("id")
    .eq("slug", reservoirId)
    .maybeSingle();

  if (!reservoir?.id) {
    const localSpots = await readLocalPrivateSpots();
    return localSpots.filter((spot) => spot.reservoirId === reservoirId);
  }

  const { data, error } = await supabase
    .from("fishing_private_spots")
    .select("id, alias_visible, sensitivity, depth_hint_m, structure_tags, notes_private")
    .eq("owner_key", ownerKey)
    .eq("reservoir_id", reservoir.id)
    .eq("active", true)
    .order("alias_visible");

  if (error || !data) {
    const localSpots = await readLocalPrivateSpots();
    return localSpots.filter((spot) => spot.reservoirId === reservoirId);
  }

  return data.map((row) => ({
    id: row.id,
    reservoirId,
    aliasVisible: row.alias_visible,
    sensitivity: row.sensitivity as "private" | "secret" | "shared",
    depthHintM: row.depth_hint_m ?? undefined,
    structureTags: row.structure_tags ?? [],
    notesPrivate: row.notes_private ?? undefined,
  }));
}

export async function createPrivateSpot(input: {
  reservoirId: string;
  aliasVisible: string;
  sensitivity: "private" | "secret" | "shared";
  lat: number;
  lon: number;
  depthHintM?: number;
  structureTags: string[];
  notesPrivate?: string;
}) {
  if (!isSupabaseConfigured()) {
    const current = await readLocalPrivateSpots();
    const next: PrivateSpotPreview = {
      id: `local-${randomUUID()}`,
      reservoirId: input.reservoirId,
      aliasVisible: input.aliasVisible,
      sensitivity: input.sensitivity,
      depthHintM: input.depthHintM,
      structureTags: input.structureTags,
      notesPrivate: input.notesPrivate,
    };
    await writeLocalPrivateSpots([...current, next]);
    return next;
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) throw new Error("Supabase no configurado");

  const ownerKey = getOwnerKey();
  const { data: reservoir } = await supabase
    .from("fishing_reservoirs")
    .select("id")
    .eq("slug", input.reservoirId)
    .maybeSingle();

  if (!reservoir?.id) throw new Error("Embalse no encontrado");

  const { data, error } = await supabase
    .from("fishing_private_spots")
    .insert({
      reservoir_id: reservoir.id,
      owner_key: ownerKey,
      alias_visible: input.aliasVisible,
      sensitivity: input.sensitivity,
      depth_hint_m: input.depthHintM ?? null,
      structure_tags: input.structureTags,
      notes_private: input.notesPrivate ?? null,
      lat: input.lat,
      lon: input.lon,
    })
    .select("id, alias_visible, sensitivity, depth_hint_m, structure_tags, notes_private")
    .single();

  if (error || !data) throw new Error(error?.message || "No se pudo crear el privado");

  return {
    id: data.id,
    reservoirId: input.reservoirId,
    aliasVisible: data.alias_visible,
    sensitivity: data.sensitivity as "private" | "secret" | "shared",
    depthHintM: data.depth_hint_m ?? undefined,
    structureTags: data.structure_tags ?? [],
    notesPrivate: data.notes_private ?? undefined,
  } satisfies PrivateSpotPreview;
}

export async function archivePrivateSpot(input: { id: string; reservoirId: string }) {
  if (!isSupabaseConfigured()) {
    const current = await readLocalPrivateSpots();
    const filtered = current.filter((spot) => !(spot.id === input.id && spot.reservoirId === input.reservoirId));
    await writeLocalPrivateSpots(filtered);
    return;
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) throw new Error("Supabase no configurado");

  const { error } = await supabase
    .from("fishing_private_spots")
    .update({ active: false })
    .eq("id", input.id)
    .eq("owner_key", getOwnerKey());

  if (error) throw new Error(error.message);
}
