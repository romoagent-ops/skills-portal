import { NextResponse } from "next/server";
import { reservoirs } from "@/lib/fishing-data";
import { fetchFishingContext } from "@/lib/fishing-context";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const reservoirId = url.searchParams.get("reservoirId");
  const date = url.searchParams.get("date");

  if (!reservoirId || !date) {
    return NextResponse.json({ error: "reservoirId y date son obligatorios" }, { status: 400 });
  }

  const reservoir = reservoirs.find((item) => item.id === reservoirId);
  if (!reservoir) {
    return NextResponse.json({ error: "Embalse no encontrado" }, { status: 404 });
  }

  try {
    const conditions = await fetchFishingContext(reservoir, date);
    return NextResponse.json(conditions);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No se pudieron cargar condiciones" },
      { status: 500 },
    );
  }
}
