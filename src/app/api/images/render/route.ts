import { randomUUID } from "node:crypto";
import { execFile } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";
import { NextResponse } from "next/server";
import { materializeReferenceAsset, persistImageRun, type PersistedImageAsset } from "@/lib/image-history-repository";
import { buildRenderPrompt, type ImageWorkbenchMode } from "@/lib/images-workbench";

const execFileAsync = promisify(execFile);
const OPENCLAW_BIN = process.env.OPENCLAW_BIN || "openclaw";
const UPLOAD_DIR = "/home/ubuntu/.openclaw/workspace/state/skills-portal/uploads";
const GENERATED_ROOT = "/home/ubuntu/.openclaw/media/generated";

function sanitizeName(filename: string) {
  return filename.replace(/[^a-zA-Z0-9._-]/g, "-");
}

function allowedReferencePath(filePath: string) {
  const resolved = path.resolve(filePath);
  return resolved.startsWith(path.resolve(GENERATED_ROOT) + path.sep) || resolved.startsWith(path.resolve(UPLOAD_DIR) + path.sep);
}

async function saveUploadedFile(file: File) {
  const extension = path.extname(file.name) || ".png";
  const targetName = `${Date.now()}-${randomUUID()}-${sanitizeName(path.basename(file.name, extension))}${extension}`;
  const targetPath = path.join(UPLOAD_DIR, targetName);
  const arrayBuffer = await file.arrayBuffer();
  await writeFile(targetPath, Buffer.from(arrayBuffer));
  return {
    path: targetPath,
    mimeType: file.type || "image/png",
    size: file.size,
    originalName: file.name,
    kind: "reference" as const,
  };
}

export async function POST(request: Request) {
  try {
    await mkdir(UPLOAD_DIR, { recursive: true });
    const formData = await request.formData();

    const mode = formData.get("mode") === "edit" ? "edit" : "generate";
    const prompt = String(formData.get("prompt") || "").trim();
    const negativePrompt = String(formData.get("negativePrompt") || "").trim();
    const aspectRatio = String(formData.get("aspectRatio") || "").trim();
    const size = String(formData.get("size") || "").trim();
    const outputFormat = String(formData.get("outputFormat") || "").trim();
    const background = String(formData.get("background") || "").trim();
    const count = Math.max(1, Math.min(4, Number(formData.get("count") || 1) || 1));
    const answersRaw = String(formData.get("answers") || "{}");
    const referencePathsRaw = String(formData.get("referencePaths") || "[]");
    const referenceAssetsRaw = String(formData.get("referenceAssets") || "[]");

    const answers = JSON.parse(answersRaw) as Record<string, string>;
    const directReferencePaths = (JSON.parse(referencePathsRaw) as string[]).filter(allowedReferencePath);
    const referenceAssets = (JSON.parse(referenceAssetsRaw) as PersistedImageAsset[])
      .filter((item) => item && typeof item.storagePath === "string" && item.storagePath.length > 0);
    const uploadedFiles = formData.getAll("files").filter((item): item is File => item instanceof File && item.size > 0);
    const uploadedReferences = await Promise.all(uploadedFiles.map((file) => saveUploadedFile(file)));
    const materializedReferences = await Promise.all(referenceAssets.map(async (asset) => ({
      path: await materializeReferenceAsset(asset.storagePath),
      mimeType: asset.mimeType,
      size: asset.size,
      width: asset.width,
      height: asset.height,
      originalName: asset.originalName || path.basename(asset.storagePath),
      kind: "reference" as const,
    })));

    const finalPrompt = buildRenderPrompt({ mode: mode as ImageWorkbenchMode, prompt, answers, negativePrompt });
    if (!finalPrompt) {
      return NextResponse.json({ error: "Describe primero la imagen o el cambio que quieres." }, { status: 400 });
    }

    const args = ["infer", "image", mode === "edit" ? "edit" : "generate", "--json", "--prompt", finalPrompt];

    if (aspectRatio) args.push("--aspect-ratio", aspectRatio);
    if (size) args.push("--size", size);
    if (outputFormat) args.push("--output-format", outputFormat);
    if (background) args.push("--background", background);
    if (mode === "generate") args.push("--count", String(count));

    const editInputs = [
      ...directReferencePaths.map((filePath) => ({ path: filePath })),
      ...materializedReferences,
      ...uploadedReferences,
    ];

    if (mode === "edit") {
      if (!editInputs.length) {
        return NextResponse.json({ error: "Para editar necesito al menos una imagen base." }, { status: 400 });
      }
      for (const filePath of editInputs) {
        args.push("--file", filePath.path);
      }
    }

    const { stdout } = await execFileAsync(OPENCLAW_BIN, args, {
      cwd: "/home/ubuntu/.openclaw/workspace",
      timeout: 10 * 60 * 1000,
      maxBuffer: 10 * 1024 * 1024,
    });

    const payload = JSON.parse(stdout) as {
      ok?: boolean;
      provider?: string;
      model?: string;
      outputs?: Array<{ path: string; mimeType: string; size: number; width?: number; height?: number }>;
    };

    if (!payload.ok || !payload.outputs?.length) {
      return NextResponse.json({ error: "La generación no devolvió imágenes." }, { status: 502 });
    }

    const persisted = await persistImageRun({
      mode,
      prompt,
      promptUsed: finalPrompt,
      negativePrompt,
      answers,
      aspectRatio,
      size,
      outputFormat,
      background,
      count,
      provider: payload.provider,
      model: payload.model,
      generated: payload.outputs.map((item) => ({
        path: item.path,
        mimeType: item.mimeType,
        size: item.size,
        width: item.width,
        height: item.height,
        originalName: path.basename(item.path),
        kind: "generated" as const,
      })),
      references: [...uploadedReferences, ...materializedReferences],
    });

    return NextResponse.json({
      promptUsed: finalPrompt,
      mode,
      provider: payload.provider,
      model: payload.model,
      run: persisted,
      images: persisted.generated,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "No pude generar la imagen." },
      { status: 500 },
    );
  }
}
