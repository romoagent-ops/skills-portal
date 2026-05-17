import { NextResponse } from "next/server";
import { buildImageBrief, type ImageWorkbenchMode } from "@/lib/images-workbench";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as { mode?: ImageWorkbenchMode; prompt?: string };
    const mode = payload.mode === "edit" ? "edit" : "generate";
    const prompt = payload.prompt?.trim() ?? "";

    const brief = buildImageBrief(mode, prompt);
    return NextResponse.json(brief);
  } catch {
    return NextResponse.json({ error: "No pude preparar el briefing visual." }, { status: 400 });
  }
}
