"use server";

import { revalidatePath } from "next/cache";
import { archivePrivateSpot, createPrivateSpot } from "@/lib/fishing-repository";
import { extractCoordinatesFromGoogleMapsUrl } from "@/lib/google-maps";

function parseTags(raw: string) {
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function createPrivateSpotAction(formData: FormData) {
  const reservoirId = String(formData.get("reservoirId") || "").trim();
  const aliasVisible = String(formData.get("aliasVisible") || "").trim();
  const sensitivity = String(formData.get("sensitivity") || "private").trim() as "private" | "secret" | "shared";
  const depthHintRaw = String(formData.get("depthHintM") || "").trim();
  const notesPrivate = String(formData.get("notesPrivate") || "").trim();
  const structureTags = parseTags(String(formData.get("structureTags") || ""));
  const mapsUrl = String(formData.get("mapsUrl") || "").trim();

  if (!reservoirId || !aliasVisible || !mapsUrl) {
    throw new Error("Faltan campos obligatorios del spot privado");
  }

  const coords = extractCoordinatesFromGoogleMapsUrl(mapsUrl);
  if (!coords) {
    throw new Error("No pude extraer coordenadas válidas del enlace de Google Maps");
  }

  await createPrivateSpot({
    reservoirId,
    aliasVisible,
    sensitivity,
    lat: coords.lat,
    lon: coords.lon,
    depthHintM: depthHintRaw ? Number(depthHintRaw) : undefined,
    structureTags,
    notesPrivate: notesPrivate || undefined,
  });

  revalidatePath("/fishing");
}

export async function archivePrivateSpotAction(formData: FormData) {
  const id = String(formData.get("id") || "").trim();
  const reservoirId = String(formData.get("reservoirId") || "").trim();

  if (!id || !reservoirId) {
    throw new Error("No se pudo identificar el privado a archivar");
  }

  await archivePrivateSpot({ id, reservoirId });
  revalidatePath("/fishing");
}
