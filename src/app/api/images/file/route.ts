import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";

const ALLOWED_ROOTS = [
  "/home/ubuntu/.openclaw/media/generated",
  "/home/ubuntu/.openclaw/workspace/state/skills-portal/uploads",
];

function guessContentType(filePath: string) {
  const extension = path.extname(filePath).toLowerCase();
  if (extension === ".png") return "image/png";
  if (extension === ".webp") return "image/webp";
  if (extension === ".gif") return "image/gif";
  return "image/jpeg";
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const filePath = url.searchParams.get("path");
  const download = url.searchParams.get("download") === "1";

  if (!filePath) {
    return NextResponse.json({ error: "Falta path" }, { status: 400 });
  }

  const resolved = path.resolve(filePath);
  const allowed = ALLOWED_ROOTS.some((root) => resolved.startsWith(path.resolve(root) + path.sep) || resolved === path.resolve(root));
  if (!allowed) {
    return NextResponse.json({ error: "Ruta no permitida" }, { status: 403 });
  }

  try {
    const buffer = await readFile(resolved);
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": guessContentType(resolved),
        "Cache-Control": "private, max-age=3600",
        ...(download ? { "Content-Disposition": `attachment; filename=\"${path.basename(resolved)}\"` } : {}),
      },
    });
  } catch {
    return NextResponse.json({ error: "No pude leer la imagen" }, { status: 404 });
  }
}
