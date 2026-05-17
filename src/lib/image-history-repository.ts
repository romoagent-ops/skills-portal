import "server-only";

import { randomUUID } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import { getOwnerKey } from "@/lib/env";
import { getSupabaseServerClient } from "@/lib/supabase-server";

const BUCKET = "skills-images";
const MANIFEST_PREFIX = "images-workbench/manifests";
const ASSET_PREFIX = "images-workbench/assets";
const PROJECT_ID = process.env.ROMO_PROJECT_ID ?? "12972cd8-e3f4-4f91-b092-0d742a91419d";
const SOURCE = "skills_portal_images";

export type PersistedImageAsset = {
  id: string;
  storagePath: string;
  signedUrl?: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  originalName?: string;
  kind: "generated" | "reference";
};

export type PersistedImageRun = {
  runId: string;
  ownerKey: string;
  mode: "generate" | "edit";
  createdAt: string;
  prompt: string;
  promptUsed: string;
  negativePrompt?: string;
  answers: Record<string, string>;
  aspectRatio?: string;
  size?: string;
  outputFormat?: string;
  background?: string;
  count?: number;
  provider?: string;
  model?: string;
  generated: PersistedImageAsset[];
  references: PersistedImageAsset[];
};

type LocalAssetInput = {
  path: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  originalName?: string;
  kind: "generated" | "reference";
};

function nowIso() {
  return new Date().toISOString();
}

async function ensureBucket() {
  const supabase = getSupabaseServerClient();
  if (!supabase) throw new Error("Supabase no configurado en servidor");

  const { data: buckets, error } = await supabase.storage.listBuckets();
  if (error) throw new Error(error.message);
  if (!buckets?.some((bucket) => bucket.name === BUCKET)) {
    const { error: createError } = await supabase.storage.createBucket(BUCKET, {
      public: false,
      fileSizeLimit: "20MB",
      allowedMimeTypes: ["image/png", "image/jpeg", "image/webp", "application/json"],
    });
    if (createError && !/already exists/i.test(createError.message)) throw new Error(createError.message);
  }

  return supabase;
}

async function uploadAsset(runId: string, asset: LocalAssetInput): Promise<PersistedImageAsset> {
  const supabase = await ensureBucket();
  const extension = path.extname(asset.originalName || asset.path) || mimeFromType(asset.mimeType);
  const baseName = path.basename(asset.originalName || asset.path, extension).replace(/[^a-zA-Z0-9._-]/g, "-");
  const objectPath = `${ASSET_PREFIX}/${getOwnerKey()}/${runId}/${asset.kind}/${randomUUID()}-${baseName}${extension}`;
  const buffer = await fs.readFile(asset.path);

  const { error } = await supabase.storage.from(BUCKET).upload(objectPath, buffer, {
    upsert: false,
    contentType: asset.mimeType,
    cacheControl: "3600",
  });
  if (error) throw new Error(error.message);

  const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(objectPath, 60 * 60 * 24 * 7);

  return {
    id: randomUUID(),
    storagePath: objectPath,
    signedUrl: signed?.signedUrl,
    mimeType: asset.mimeType,
    size: asset.size,
    width: asset.width,
    height: asset.height,
    originalName: asset.originalName,
    kind: asset.kind,
  };
}

function mimeFromType(mimeType: string) {
  if (mimeType === "image/png") return ".png";
  if (mimeType === "image/webp") return ".webp";
  return ".jpg";
}

function manifestObjectPath(run: PersistedImageRun) {
  const stamp = run.createdAt.replace(/[:.]/g, "-");
  return `${MANIFEST_PREFIX}/${run.ownerKey}/${stamp}-${run.runId}.json`;
}

async function writeManifest(run: PersistedImageRun) {
  const supabase = await ensureBucket();
  const objectPath = manifestObjectPath(run);
  const payload = Buffer.from(JSON.stringify(run, null, 2), "utf8");

  const { error } = await supabase.storage.from(BUCKET).upload(objectPath, payload, {
    upsert: true,
    contentType: "application/json",
    cacheControl: "3600",
  });
  if (error) throw new Error(error.message);
}

async function logRunToSupabase(run: PersistedImageRun) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return;

  const details = {
    project_id: PROJECT_ID,
    owner_key: run.ownerKey,
    mode: run.mode,
    prompt: run.prompt,
    prompt_used: run.promptUsed,
    aspect_ratio: run.aspectRatio,
    size: run.size,
    output_format: run.outputFormat,
    background: run.background,
    answers: run.answers,
    provider: run.provider,
    model: run.model,
    generated_assets: run.generated.map((item) => item.storagePath),
    reference_assets: run.references.map((item) => item.storagePath),
    run_id: run.runId,
  };

  await Promise.allSettled([
    supabase.from("n_action_log").insert({
      action_kind: "media",
      action_name: "skills_portal_image_run",
      status: "completed",
      summary: `${run.mode === "edit" ? "Edited" : "Generated"} image run persisted for skills portal`,
      details,
      project_id: PROJECT_ID,
      source: SOURCE,
      run_id: run.runId,
      started_at: run.createdAt,
      completed_at: nowIso(),
    }),
    supabase.from("n_lifecycle_events").insert({
      event_type: "manual_checkpoint",
      status: "ok",
      agent_name: "romo",
      run_id: run.runId,
      details: { flow_event: "skills_portal_image_run", ...details },
      occurred_at: nowIso(),
    }),
    supabase.from("n_metrics").insert([
      {
        metric_name: "skills_portal_image_generated_assets",
        metric_type: "gauge",
        value_numeric: run.generated.length,
        unit: "count",
        source: SOURCE,
        run_id: run.runId,
        measured_at: nowIso(),
        metadata: { project_id: PROJECT_ID, mode: run.mode, owner_key: run.ownerKey },
      },
      {
        metric_name: "skills_portal_image_reference_assets",
        metric_type: "gauge",
        value_numeric: run.references.length,
        unit: "count",
        source: SOURCE,
        run_id: run.runId,
        measured_at: nowIso(),
        metadata: { project_id: PROJECT_ID, mode: run.mode, owner_key: run.ownerKey },
      },
    ]),
  ]);
}

export async function persistImageRun(input: {
  mode: "generate" | "edit";
  prompt: string;
  promptUsed: string;
  negativePrompt?: string;
  answers: Record<string, string>;
  aspectRatio?: string;
  size?: string;
  outputFormat?: string;
  background?: string;
  count?: number;
  provider?: string;
  model?: string;
  generated: LocalAssetInput[];
  references?: LocalAssetInput[];
}) {
  const runId = randomUUID();
  const ownerKey = getOwnerKey();
  const createdAt = nowIso();

  const generated = await Promise.all(input.generated.map((asset) => uploadAsset(runId, asset)));
  const references = await Promise.all((input.references ?? []).map((asset) => uploadAsset(runId, asset)));

  const run: PersistedImageRun = {
    runId,
    ownerKey,
    mode: input.mode,
    createdAt,
    prompt: input.prompt,
    promptUsed: input.promptUsed,
    negativePrompt: input.negativePrompt,
    answers: input.answers,
    aspectRatio: input.aspectRatio,
    size: input.size,
    outputFormat: input.outputFormat,
    background: input.background,
    count: input.count,
    provider: input.provider,
    model: input.model,
    generated,
    references,
  };

  await writeManifest(run);
  await logRunToSupabase(run);
  return run;
}

export async function listImageRuns(limit = 24) {
  const supabase = getSupabaseServerClient();
  if (!supabase) return [] as PersistedImageRun[];

  await ensureBucket();
  const ownerKey = getOwnerKey();
  const folder = `${MANIFEST_PREFIX}/${ownerKey}`;
  const { data, error } = await supabase.storage.from(BUCKET).list(folder, {
    limit,
    offset: 0,
    sortBy: { column: "name", order: "desc" },
  });

  if (error || !data?.length) return [] as PersistedImageRun[];

  const manifests = await Promise.all(data.filter((item) => item.name.endsWith(".json")).map(async (item) => {
    const fullPath = `${folder}/${item.name}`;
    const { data: fileData, error: downloadError } = await supabase.storage.from(BUCKET).download(fullPath);
    if (downloadError || !fileData) return null;
    const json = JSON.parse(await fileData.text()) as PersistedImageRun;

    const generated = await Promise.all(json.generated.map(async (asset) => {
      const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(asset.storagePath, 60 * 60 * 24 * 7);
      return { ...asset, signedUrl: signed?.signedUrl };
    }));
    const references = await Promise.all(json.references.map(async (asset) => {
      const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(asset.storagePath, 60 * 60 * 24 * 7);
      return { ...asset, signedUrl: signed?.signedUrl };
    }));

    return { ...json, generated, references } satisfies PersistedImageRun;
  }));

  return manifests.filter(Boolean).sort((a, b) => new Date(b!.createdAt).getTime() - new Date(a!.createdAt).getTime()).slice(0, limit) as PersistedImageRun[];
}

export async function materializeReferenceAsset(storagePath: string) {
  const supabase = getSupabaseServerClient();
  if (!supabase) throw new Error("Supabase no configurado en servidor");

  const { data, error } = await supabase.storage.from(BUCKET).download(storagePath);
  if (error || !data) throw new Error(error?.message || "No pude descargar la referencia");

  const tmpDir = path.join(process.cwd(), ".tmp", "images-workbench");
  await fs.mkdir(tmpDir, { recursive: true });
  const extension = path.extname(storagePath) || ".png";
  const localPath = path.join(tmpDir, `${randomUUID()}${extension}`);
  const buffer = Buffer.from(await data.arrayBuffer());
  await fs.writeFile(localPath, buffer);
  return localPath;
}
