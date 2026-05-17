import { NextResponse } from "next/server";
import { listImageRuns } from "@/lib/image-history-repository";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const limit = Math.max(1, Math.min(50, Number(url.searchParams.get("limit") || 24) || 24));

  try {
    const runs = await listImageRuns(limit);
    return NextResponse.json({ runs });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No pude cargar el histórico." },
      { status: 500 },
    );
  }
}
