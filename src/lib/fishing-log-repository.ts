import "server-only";

import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import sessionsSeed from "@/lib/data/fishing-sessions.local.json";
import catchesSeed from "@/lib/data/fishing-catches.local.json";
import { getOwnerKey, isSupabaseConfigured } from "@/lib/env";
import { getSupabaseServerClient } from "@/lib/supabase-server";
import type { FishingCatchLog, FishingSessionLog } from "@/lib/fishing-log-types";
import type { FishingMode, Species } from "@/lib/fishing-types";

const sessionsPath = path.join(process.cwd(), "src/lib/data/fishing-sessions.local.json");
const catchesPath = path.join(process.cwd(), "src/lib/data/fishing-catches.local.json");

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJsonFile(filePath: string, payload: unknown) {
  await fs.writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

export async function getRecentSessions() {
  if (!isSupabaseConfigured()) {
    const sessions = await readJsonFile<FishingSessionLog[]>(sessionsPath, sessionsSeed as FishingSessionLog[]);
    const catches = await readJsonFile<FishingCatchLog[]>(catchesPath, catchesSeed as FishingCatchLog[]);
    return sessions
      .slice()
      .sort((a, b) => b.tripDate.localeCompare(a.tripDate))
      .map((session) => ({
        ...session,
        catches: catches.filter((item) => item.sessionId === session.id),
      }));
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) return [];

  const ownerKey = getOwnerKey();
  const { data: sessions, error } = await supabase
    .from("fishing_sessions")
    .select("id, target_species, mode, using_sonar, sonar_device, trip_date, notes, created_at, reservoir:reservoir_id(slug)")
    .eq("owner_key", ownerKey)
    .order("trip_date", { ascending: false })
    .limit(20);

  if (error || !sessions) return [];

  const sessionIds = sessions.map((item) => item.id);
  const { data: catches } = await supabase
    .from("fishing_catches")
    .select("id, session_id, species, weight_kg, length_cm, lure, technique, depth_m, notes, created_at")
    .in("session_id", sessionIds);

  return sessions.map((session) => ({
    id: session.id,
    ownerKey,
    reservoirId: (session.reservoir as { slug?: string } | null)?.slug ?? "unknown",
    targetSpecies: session.target_species as Species,
    mode: session.mode as FishingMode,
    usingSonar: session.using_sonar,
    sonarDevice: session.sonar_device ?? undefined,
    tripDate: session.trip_date,
    notes: session.notes ?? undefined,
    createdAt: session.created_at,
    catches: (catches ?? []).filter((item) => item.session_id === session.id).map((item) => ({
      id: item.id,
      sessionId: item.session_id,
      species: item.species as Species,
      weightKg: item.weight_kg ?? undefined,
      lengthCm: item.length_cm ?? undefined,
      lure: item.lure ?? undefined,
      technique: item.technique ?? undefined,
      depthM: item.depth_m ?? undefined,
      notes: item.notes ?? undefined,
      createdAt: item.created_at,
    })),
  }));
}

export async function createSession(input: {
  reservoirId: string;
  targetSpecies: Species;
  mode: FishingMode;
  usingSonar: boolean;
  sonarDevice?: string;
  tripDate: string;
  notes?: string;
}) {
  if (!isSupabaseConfigured()) {
    const sessions = await readJsonFile<FishingSessionLog[]>(sessionsPath, sessionsSeed as FishingSessionLog[]);
    const next: FishingSessionLog = {
      id: `local-session-${randomUUID()}`,
      ownerKey: getOwnerKey(),
      reservoirId: input.reservoirId,
      targetSpecies: input.targetSpecies,
      mode: input.mode,
      usingSonar: input.usingSonar,
      sonarDevice: input.sonarDevice,
      tripDate: input.tripDate,
      notes: input.notes,
      createdAt: new Date().toISOString(),
    };
    await writeJsonFile(sessionsPath, [next, ...sessions]);
    return next;
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) throw new Error("Supabase no configurado");
  const ownerKey = getOwnerKey();
  const { data: reservoir } = await supabase.from("fishing_reservoirs").select("id").eq("slug", input.reservoirId).maybeSingle();
  if (!reservoir?.id) throw new Error("Embalse no encontrado");

  const { data, error } = await supabase
    .from("fishing_sessions")
    .insert({
      owner_key: ownerKey,
      reservoir_id: reservoir.id,
      target_species: input.targetSpecies,
      mode: input.mode,
      using_sonar: input.usingSonar,
      sonar_device: input.sonarDevice ?? null,
      trip_date: input.tripDate,
      notes: input.notes ?? null,
    })
    .select("id, trip_date, created_at")
    .single();

  if (error || !data) throw new Error(error?.message || "No se pudo crear la jornada");

  return {
    id: data.id,
    ownerKey,
    reservoirId: input.reservoirId,
    targetSpecies: input.targetSpecies,
    mode: input.mode,
    usingSonar: input.usingSonar,
    sonarDevice: input.sonarDevice,
    tripDate: data.trip_date,
    notes: input.notes,
    createdAt: data.created_at,
  } satisfies FishingSessionLog;
}

export async function createCatch(input: {
  sessionId: string;
  species: Species;
  weightKg?: number;
  lengthCm?: number;
  lure?: string;
  technique?: string;
  depthM?: number;
  notes?: string;
}) {
  if (!isSupabaseConfigured()) {
    const catches = await readJsonFile<FishingCatchLog[]>(catchesPath, catchesSeed as FishingCatchLog[]);
    const next: FishingCatchLog = {
      id: `local-catch-${randomUUID()}`,
      sessionId: input.sessionId,
      species: input.species,
      weightKg: input.weightKg,
      lengthCm: input.lengthCm,
      lure: input.lure,
      technique: input.technique,
      depthM: input.depthM,
      notes: input.notes,
      createdAt: new Date().toISOString(),
    };
    await writeJsonFile(catchesPath, [next, ...catches]);
    return next;
  }

  const supabase = getSupabaseServerClient();
  if (!supabase) throw new Error("Supabase no configurado");

  const { data, error } = await supabase
    .from("fishing_catches")
    .insert({
      session_id: input.sessionId,
      species: input.species,
      weight_kg: input.weightKg ?? null,
      length_cm: input.lengthCm ?? null,
      lure: input.lure ?? null,
      technique: input.technique ?? null,
      depth_m: input.depthM ?? null,
      notes: input.notes ?? null,
    })
    .select("id, created_at")
    .single();

  if (error || !data) throw new Error(error?.message || "No se pudo guardar la captura");

  return {
    id: data.id,
    sessionId: input.sessionId,
    species: input.species,
    weightKg: input.weightKg,
    lengthCm: input.lengthCm,
    lure: input.lure,
    technique: input.technique,
    depthM: input.depthM,
    notes: input.notes,
    createdAt: data.created_at,
  } satisfies FishingCatchLog;
}
