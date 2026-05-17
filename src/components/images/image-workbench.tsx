"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { Download, ImagePlus, LoaderCircle, RefreshCcw, Sparkles, Wand2, X } from "lucide-react";
import type { PersistedImageAsset, PersistedImageRun } from "@/lib/image-history-repository";
import { buildRenderPrompt, getSizeOptions, type ImageBrief, type ImageWorkbenchMode } from "@/lib/images-workbench";

type GeneratedImage = PersistedImageAsset;

type HistoryResponse = {
  runs: PersistedImageRun[];
};

const aspectRatioOptions = ["1:1", "4:5", "3:2", "16:9", "9:16"];
const backgroundOptions = [
  { value: "auto", label: "Auto" },
  { value: "opaque", label: "Opaco" },
  { value: "transparent", label: "Transparente" },
] as const;
const outputFormatOptions = ["jpeg", "png", "webp"] as const;

function inputClassName() {
  return "w-full rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-cyan-300/30 focus:bg-white/[0.08]";
}

function imageSrc(image: GeneratedImage) {
  return image.signedUrl ?? `/api/images/file?path=${encodeURIComponent(image.storagePath)}`;
}

function downloadHref(image: GeneratedImage) {
  return image.signedUrl ?? `/api/images/file?path=${encodeURIComponent(image.storagePath)}&download=1`;
}

function assetKey(image: GeneratedImage) {
  return image.storagePath;
}

export function ImageWorkbench() {
  const [mode, setMode] = useState<ImageWorkbenchMode>("generate");
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [brief, setBrief] = useState<ImageBrief | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [size, setSize] = useState("1024x1024");
  const [background, setBackground] = useState<"auto" | "opaque" | "transparent">("auto");
  const [outputFormat, setOutputFormat] = useState<"jpeg" | "png" | "webp">("jpeg");
  const [count, setCount] = useState(1);
  const [files, setFiles] = useState<File[]>([]);
  const [referenceImages, setReferenceImages] = useState<GeneratedImage[]>([]);
  const [results, setResults] = useState<GeneratedImage[]>([]);
  const [historyRuns, setHistoryRuns] = useState<PersistedImageRun[]>([]);
  const [refining, setRefining] = useState(false);
  const [rendering, setRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRun, setLastRun] = useState<{ provider?: string; model?: string; promptUsed?: string } | null>(null);

  const sizeOptions = useMemo(() => getSizeOptions(aspectRatio), [aspectRatio]);
  const composedPrompt = useMemo(
    () => buildRenderPrompt({ mode, prompt, answers, negativePrompt }),
    [mode, prompt, answers, negativePrompt],
  );

  useEffect(() => {
    if (!sizeOptions.includes(size)) setSize(sizeOptions[0]);
  }, [size, sizeOptions]);

  useEffect(() => {
    setBrief(null);
    setAnswers({});
    setError(null);
  }, [mode]);

  useEffect(() => {
    let cancelled = false;

    async function loadHistory() {
      try {
        const response = await fetch("/api/images/history?limit=24", { cache: "no-store" });
        const payload = (await response.json()) as HistoryResponse & { error?: string };
        if (!response.ok) throw new Error(payload.error || "No pude cargar el histórico.");
        if (!cancelled) setHistoryRuns(payload.runs ?? []);
      } catch (err) {
        if (!cancelled) setError((current) => current ?? (err instanceof Error ? err.message : "No pude cargar el histórico."));
      }
    }

    loadHistory();
    return () => {
      cancelled = true;
    };
  }, []);

  async function refineBriefing() {
    setRefining(true);
    setError(null);
    try {
      const response = await fetch("/api/images/brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, prompt }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "No pude afinar el briefing.");

      setBrief(payload);
      setAspectRatio(payload.defaults.aspectRatio);
      setSize(payload.defaults.size);
      setBackground(payload.defaults.background);
      setOutputFormat(payload.defaults.outputFormat);
      setCount(payload.defaults.count);
      setAnswers((current) => {
        const next: Record<string, string> = {};
        for (const question of payload.questions as ImageBrief["questions"]) next[question.id] = current[question.id] ?? "";
        return next;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pude afinar el briefing.");
    } finally {
      setRefining(false);
    }
  }

  async function renderImages() {
    setRendering(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("mode", mode);
      formData.append("prompt", prompt);
      formData.append("negativePrompt", negativePrompt);
      formData.append("aspectRatio", aspectRatio);
      formData.append("size", size);
      formData.append("background", background);
      formData.append("outputFormat", outputFormat);
      formData.append("count", String(count));
      formData.append("answers", JSON.stringify(answers));
      formData.append("referenceAssets", JSON.stringify(referenceImages));
      for (const file of files) formData.append("files", file);

      const response = await fetch("/api/images/render", { method: "POST", body: formData });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "No pude generar la imagen.");

      const nextResults = payload.images as GeneratedImage[];
      const nextRun = payload.run as PersistedImageRun;
      setResults(nextResults);
      setHistoryRuns((current) => {
        const merged = [nextRun, ...current].filter(Boolean);
        const seen = new Set<string>();
        return merged.filter((item) => {
          if (seen.has(item.runId)) return false;
          seen.add(item.runId);
          return true;
        });
      });
      setLastRun({ provider: payload.provider, model: payload.model, promptUsed: payload.promptUsed });
      setFiles([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No pude generar la imagen.");
    } finally {
      setRendering(false);
    }
  }

  function toggleReference(image: GeneratedImage) {
    setMode("edit");
    setReferenceImages((current) => current.some((item) => assetKey(item) === assetKey(image))
      ? current.filter((item) => assetKey(item) !== assetKey(image))
      : [image, ...current].slice(0, 4));
  }

  const history = useMemo(
    () => historyRuns.flatMap((run) => run.generated),
    [historyRuns],
  );

  const canRender = prompt.trim().length > 0 && (mode === "generate" || files.length > 0 || referenceImages.length > 0);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[34px] border border-amber-300/12 bg-[linear-gradient(135deg,rgba(41,24,8,0.96),rgba(17,19,30,0.94)_42%,rgba(9,12,22,0.96))] shadow-[0_30px_100px_rgba(0,0,0,0.32)]">
        <div className="p-6 sm:p-8 lg:p-10">
          <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.32em] text-amber-200/72">
            <span>Image Workbench</span>
            <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 tracking-[0.24em] text-zinc-300">prompting + edición</span>
          </div>

          <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">Imagen pedida, imagen afinada</h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-zinc-300/88">
                Aquí no se trata de tirar un prompt a ciegas. Primero cerramos briefing, luego generamos y después puedes iterar sobre el resultado sin salir de la skill.
              </p>
            </div>
            <div className="rounded-2xl border border-amber-300/18 bg-amber-400/10 px-4 py-3 text-sm text-amber-50">
              {mode === "generate" ? "Modo creación" : "Modo edición"}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.08fr_0.92fr]">
        <div className="space-y-6">
          <Panel eyebrow="Entrada" title="Qué quieres conseguir">
            <div className="flex flex-wrap gap-2">
              {[
                { value: "generate", label: "Crear desde cero" },
                { value: "edit", label: "Editar imágenes" },
              ].map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setMode(item.value as ImageWorkbenchMode)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${mode === item.value ? "border-amber-300/24 bg-amber-400/12 text-amber-50" : "border-white/10 bg-white/[0.04] text-zinc-300"}`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="mt-4 space-y-4">
              <label className="block space-y-2">
                <span className="text-sm text-zinc-400">Prompt base</span>
                <textarea
                  value={prompt}
                  onChange={(event) => setPrompt(event.target.value)}
                  placeholder={mode === "generate" ? "Ej. Quiero una hero image premium de un restaurante japonés moderno, con sushi, luz cálida y look editorial." : "Ej. Quiero quitar el fondo, mantener el producto intacto y cambiar el ambiente a estudio premium."}
                  className="min-h-[140px] w-full resize-y rounded-[24px] border border-white/10 bg-black/20 px-4 py-4 text-sm leading-7 text-white outline-none placeholder:text-zinc-500"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm text-zinc-400">Aspect ratio</span>
                  <select className={inputClassName()} value={aspectRatio} onChange={(event) => setAspectRatio(event.target.value)}>
                    {aspectRatioOptions.map((item) => <option key={item} value={item} className="bg-slate-950">{item}</option>)}
                  </select>
                </label>
                <label className="block space-y-2">
                  <span className="text-sm text-zinc-400">Tamaño</span>
                  <select className={inputClassName()} value={size} onChange={(event) => setSize(event.target.value)}>
                    {sizeOptions.map((item) => <option key={item} value={item} className="bg-slate-950">{item}</option>)}
                  </select>
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <label className="block space-y-2">
                  <span className="text-sm text-zinc-400">Formato</span>
                  <select className={inputClassName()} value={outputFormat} onChange={(event) => setOutputFormat(event.target.value as "jpeg" | "png" | "webp")}>
                    {outputFormatOptions.map((item) => <option key={item} value={item} className="bg-slate-950">{item}</option>)}
                  </select>
                </label>
                <label className="block space-y-2">
                  <span className="text-sm text-zinc-400">Fondo</span>
                  <select className={inputClassName()} value={background} onChange={(event) => setBackground(event.target.value as "auto" | "opaque" | "transparent")}>
                    {backgroundOptions.map((item) => <option key={item.value} value={item.value} className="bg-slate-950">{item.label}</option>)}
                  </select>
                </label>
                <label className="block space-y-2">
                  <span className="text-sm text-zinc-400">Variantes</span>
                  <input type="number" min={1} max={4} value={count} onChange={(event) => setCount(Math.max(1, Math.min(4, Number(event.target.value) || 1)))} className={inputClassName()} disabled={mode === "edit"} />
                </label>
              </div>

              <label className="block space-y-2">
                <span className="text-sm text-zinc-400">Restricciones / cosas a evitar</span>
                <textarea
                  value={negativePrompt}
                  onChange={(event) => setNegativePrompt(event.target.value)}
                  placeholder="Ej. sin texto, sin fondo recargado, sin manos extra, no tocar la cara..."
                  className="min-h-[96px] w-full resize-y rounded-[24px] border border-white/10 bg-black/20 px-4 py-4 text-sm leading-7 text-white outline-none placeholder:text-zinc-500"
                />
              </label>

              <div className="flex flex-wrap gap-3">
                <button type="button" onClick={refineBriefing} disabled={refining || !prompt.trim()} className="inline-flex items-center gap-2 rounded-2xl border border-amber-300/18 bg-amber-400/12 px-4 py-3 text-sm font-medium text-amber-50 transition hover:bg-amber-400/18 disabled:cursor-not-allowed disabled:opacity-60">
                  {refining ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />} Afinar briefing
                </button>
                <button type="button" onClick={renderImages} disabled={rendering || !canRender} className="inline-flex items-center gap-2 rounded-2xl border border-cyan-300/18 bg-cyan-400/12 px-4 py-3 text-sm font-medium text-cyan-50 transition hover:bg-cyan-400/18 disabled:cursor-not-allowed disabled:opacity-60">
                  {rendering ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} {mode === "generate" ? "Generar imagen" : "Aplicar edición"}
                </button>
              </div>
            </div>
          </Panel>

          <Panel eyebrow="Preguntas" title="Cierra el briefing antes de disparar">
            {brief ? (
              <div className="space-y-5">
                <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4 text-sm leading-7 text-zinc-200">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">Lectura rápida</div>
                  <div className="mt-2">{brief.summary}</div>
                  <div className="mt-3 rounded-2xl border border-cyan-300/14 bg-cyan-400/[0.05] px-4 py-3 text-cyan-50/92">{brief.goal}</div>
                </div>

                <div className="space-y-4">
                  {brief.questions.map((question) => (
                    <label key={question.id} className="block rounded-[22px] border border-white/10 bg-black/20 p-4">
                      <div className="text-sm font-medium text-white">{question.label}</div>
                      {question.help ? <div className="mt-2 text-xs leading-6 text-zinc-500">{question.help}</div> : null}
                      <textarea
                        value={answers[question.id] ?? ""}
                        onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: event.target.value }))}
                        placeholder={question.placeholder}
                        className="mt-3 min-h-[84px] w-full resize-y rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm leading-7 text-white outline-none placeholder:text-zinc-500"
                      />
                    </label>
                  ))}
                </div>

                <div className="rounded-[22px] border border-emerald-300/14 bg-emerald-400/[0.05] p-4">
                  <div className="text-[11px] uppercase tracking-[0.24em] text-emerald-200/72">Prompt compuesto</div>
                  <pre className="mt-3 whitespace-pre-wrap text-sm leading-7 text-zinc-100">{composedPrompt || "Todavía no hay prompt compuesto."}</pre>
                </div>
              </div>
            ) : (
              <EmptyState text="Escribe la intención y pulsa “Afinar briefing”. La idea es forzar especificidad antes de generar, no adivinarla al final." />
            )}
          </Panel>

          <Panel eyebrow="Entradas visuales" title="Imágenes de referencia y edición">
            <div className="space-y-4">
              <label className="block rounded-[24px] border border-dashed border-white/14 bg-white/[0.03] p-5 text-sm text-zinc-300">
                <div className="flex items-center gap-3 text-white"><ImagePlus className="h-5 w-5 text-cyan-200" />Sube imágenes para editar o para usarlas como referencia</div>
                <div className="mt-2 text-zinc-500">Puedes mezclar subida local con imágenes generadas dentro de la propia skill.</div>
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  multiple
                  onChange={(event) => setFiles(Array.from(event.target.files ?? []).slice(0, 4))}
                  className="mt-4 block w-full text-sm text-zinc-400 file:mr-4 file:rounded-full file:border-0 file:bg-cyan-400/14 file:px-4 file:py-2 file:text-sm file:font-medium file:text-cyan-50"
                />
              </label>

              {files.length ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {files.map((file) => (
                    <div key={`${file.name}-${file.size}`} className="rounded-[22px] border border-white/10 bg-black/20 p-4 text-sm text-zinc-200">
                      <div className="truncate font-medium text-white">{file.name}</div>
                      <div className="mt-1 text-zinc-500">{Math.round(file.size / 1024)} KB</div>
                    </div>
                  ))}
                </div>
              ) : null}

              {referenceImages.length ? (
                <div className="space-y-3">
                  <div className="text-sm font-medium text-white">Referencias tomadas de resultados previos</div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {referenceImages.map((image) => (
                      <div key={assetKey(image)} className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04]">
                        <img src={imageSrc(image)} alt="Referencia" className="h-44 w-full object-cover" />
                        <div className="flex items-center justify-between gap-3 p-3 text-sm text-zinc-300">
                          <span className="truncate">{image.width && image.height ? `${image.width}×${image.height}` : "referencia"}</span>
                          <button type="button" onClick={() => setReferenceImages((current) => current.filter((item) => assetKey(item) !== assetKey(image)))} className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-200">
                            <X className="h-3.5 w-3.5" /> quitar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel eyebrow="Salida" title="Resultados listos para descargar o iterar">
            {error ? <EmptyState text={error} tone="warning" /> : null}

            {results.length ? (
              <div className="space-y-4">
                {results.map((image) => {
                  const selected = referenceImages.some((item) => assetKey(item) === assetKey(image));
                  return (
                    <div key={assetKey(image)} className="overflow-hidden rounded-[26px] border border-white/10 bg-black/20">
                      <img src={imageSrc(image)} alt="Resultado generado" className="w-full object-cover" />
                      <div className="space-y-3 p-4">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                          <span>{image.width && image.height ? `${image.width}×${image.height}` : "sin tamaño"}</span>
                          <span>·</span>
                          <span>{Math.round(image.size / 1024)} KB</span>
                          <span>·</span>
                          <span>{image.mimeType}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <a href={downloadHref(image)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-2 text-sm text-white">
                            <Download className="h-4 w-4" /> Descargar
                          </a>
                          <button type="button" onClick={() => toggleReference(image)} className={`inline-flex items-center gap-2 rounded-2xl border px-4 py-2 text-sm ${selected ? "border-amber-300/20 bg-amber-400/12 text-amber-50" : "border-cyan-300/18 bg-cyan-400/12 text-cyan-50"}`}>
                            <RefreshCcw className="h-4 w-4" /> {selected ? "Quitar de edición" : "Usar como base"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState text="Todavía no hay resultado en esta sesión. Cuando generes algo, aparecerá aquí con descarga directa y opción de reutilizarlo como base para una edición posterior." />
            )}
          </Panel>

          <Panel eyebrow="Histórico" title="Rastro de iteraciones">
            {history.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {history.map((image) => (
                  <button key={assetKey(image)} type="button" onClick={() => toggleReference(image)} className="overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.04] text-left transition hover:border-white/16">
                    <img src={imageSrc(image)} alt="Histórico" className="h-36 w-full object-cover" />
                    <div className="p-3 text-xs text-zinc-400">{image.width && image.height ? `${image.width}×${image.height}` : "resultado"}</div>
                  </button>
                ))}
              </div>
            ) : (
              <EmptyState text="Aquí irán cayendo tus resultados para poder reenganchar cualquiera como imagen base." />
            )}
          </Panel>

          <Panel eyebrow="Motor" title="Cómo está pensado este flujo">
            <ul className="space-y-3 text-sm leading-6 text-zinc-200/84">
              <li>• Primero fuerza especificidad con preguntas útiles, no con ruido.</li>
              <li>• Después genera dentro del propio portal para descargar sin salir.</li>
              <li>• Cualquier resultado se puede reciclar como base para editarlo.</li>
              <li>• Las referencias subidas y las generadas conviven en el mismo flujo.</li>
            </ul>
            {lastRun ? (
              <div className="mt-4 rounded-[22px] border border-white/10 bg-black/20 p-4 text-sm leading-6 text-zinc-300">
                <div><span className="text-zinc-500">Provider:</span> {lastRun.provider ?? "—"}</div>
                <div><span className="text-zinc-500">Modelo:</span> {lastRun.model ?? "—"}</div>
                {lastRun.promptUsed ? <div className="mt-3 whitespace-pre-wrap text-zinc-200">{lastRun.promptUsed}</div> : null}
              </div>
            ) : null}
          </Panel>
        </div>
      </section>
    </div>
  );
}

function Panel({ eyebrow, title, children }: { eyebrow?: string; title: string; children: ReactNode }) {
  return (
    <section className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-2xl sm:p-6">
      <div>
        {eyebrow ? <div className="text-[11px] uppercase tracking-[0.3em] text-zinc-500">{eyebrow}</div> : null}
        <h3 className="mt-2 text-xl font-semibold tracking-tight text-white">{title}</h3>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function EmptyState({ text, tone = "default" }: { text: string; tone?: "default" | "warning" }) {
  return <div className={`rounded-[24px] border px-4 py-4 text-sm leading-7 ${tone === "warning" ? "border-amber-300/14 bg-amber-400/10 text-amber-50" : "border-white/10 bg-white/[0.04] text-zinc-400"}`}>{text}</div>;
}
