"use server";

import { revalidatePath } from "next/cache";
import { createCatch, createSession } from "@/lib/fishing-log-repository";
import type { FishingMode, Species } from "@/lib/fishing-types";

export async function createSessionAction(formData: FormData) {
  await createSession({
    reservoirId: String(formData.get("reservoirId") || "").trim(),
    targetSpecies: String(formData.get("targetSpecies") || "black bass").trim() as Species,
    mode: String(formData.get("mode") || "pato").trim() as FishingMode,
    usingSonar: String(formData.get("usingSonar") || "off") === "on",
    sonarDevice: String(formData.get("sonarDevice") || "").trim() || undefined,
    tripDate: String(formData.get("tripDate") || "").trim(),
    notes: String(formData.get("notes") || "").trim() || undefined,
  });
  revalidatePath("/fishing");
}

export async function createCatchAction(formData: FormData) {
  await createCatch({
    sessionId: String(formData.get("sessionId") || "").trim(),
    species: String(formData.get("species") || "black bass").trim() as Species,
    weightKg: String(formData.get("weightKg") || "").trim() ? Number(formData.get("weightKg")) : undefined,
    lengthCm: String(formData.get("lengthCm") || "").trim() ? Number(formData.get("lengthCm")) : undefined,
    lure: String(formData.get("lure") || "").trim() || undefined,
    technique: String(formData.get("technique") || "").trim() || undefined,
    depthM: String(formData.get("depthM") || "").trim() ? Number(formData.get("depthM")) : undefined,
    notes: String(formData.get("notes") || "").trim() || undefined,
  });
  revalidatePath("/fishing");
}
