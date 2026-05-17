"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, CalendarDays, Cloud, CloudLightning, CloudRain, CloudSun, Fish, Gauge, MoonStar, Radar, Route, Shield, Snowflake, SunMedium, Target, TrendingDown, TrendingUp, Waves, Wind } from "lucide-react";
import type { PrivateSpotPreview } from "@/lib/data/private-spots";
import { generateBriefing } from "@/lib/fishing-briefing";
import { summarizeLearning } from "@/lib/fishing-learning";
import { buildFishingTimeline } from "@/lib/fishing-timeline";
import type { FishingCatchLog, FishingSessionLog } from "@/lib/fishing-log-types";
import type { LiveConditions, Reservoir, FishingAppState, FishingMode, Species } from "@/lib/fishing-types";

const speciesOptions: Species[] = ["black bass", "lucio", "barbo", "lucioperca"];
const modeOptions: FishingMode[] = ["pato", "orilla", "bass-boat"];

function inputClassName() {
  return "w-full rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-cyan-300/35 focus:bg-white/10";
}

function buildHourlyHotWindows(liveConditions: LiveConditions | null) {
  if (!liveConditions?.hourly?.length) return [] as Array<{ label: string; score: number; reason: string }>;

  return liveConditions.hourly
    .map((item) => {
      const hour = Number(item.time.slice(11, 13));
      let score = 5;
      if (hour >= 6 && hour <= 10) score += 2;
      if (hour >= 18 && hour <= 21) score += 1;
      if (item.windSpeedKmh >= 6 && item.windSpeedKmh <= 14) score += 2;
      if (item.windSpeedKmh > 20) score -= 2;
      if (item.cloudCover >= 20 && item.cloudCover <= 70) score += 1;

      return {
        label: item.time.slice(11, 16),
        score: Math.max(1, Math.min(10, Math.round(score))),
        reason: `${Math.round(item.windSpeedKmh)} km/h · nubes ${Math.round(item.cloudCover)}% · ${Math.round(item.temperatureC)}ºC`,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

function confidenceTone(confidence: "high" | "medium" | "low") {
  if (confidence === "high") return "bg-emerald-400/15 text-emerald-50 ring-1 ring-emerald-300/20";
  if (confidence === "medium") return "bg-amber-400/15 text-amber-50 ring-1 ring-amber-300/20";
  return "bg-rose-400/15 text-rose-50 ring-1 ring-rose-300/20";
}

function weatherLabelFromCode(code?: number) {
  if (code === undefined) return "sin lectura";
  if (code === 0) return "despejado";
  if ([1, 2].includes(code)) return "poco nuboso";
  if (code === 3) return "cubierto";
  if ([45, 48].includes(code)) return "niebla";
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "lluvia";
  if ([71, 73, 75, 77, 85, 86].includes(code)) return "nieve";
  if ([95, 96, 99].includes(code)) return "tormenta";
  return "variable";
}

function WeatherIcon({ code, className = "h-5 w-5" }: { code?: number; className?: string }) {
  if (code === 0) return <SunMedium className={`${className} text-amber-200`} />;
  if ([1, 2].includes(code ?? -1)) return <CloudSun className={`${className} text-sky-200`} />;
  if (code === 3 || [45, 48].includes(code ?? -1)) return <Cloud className={`${className} text-zinc-200`} />;
  if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code ?? -1)) return <CloudRain className={`${className} text-cyan-200`} />;
  if ([95, 96, 99].includes(code ?? -1)) return <CloudLightning className={`${className} text-violet-200`} />;
  if ([71, 73, 75, 77, 85, 86].includes(code ?? -1)) return <Snowflake className={`${className} text-sky-100`} />;
  return <Cloud className={`${className} text-zinc-200`} />;
}

function moonEmoji(label?: string) {
  if (!label) return "🌑";
  if (label.includes("Luna nueva")) return "🌑";
  if (label.includes("Creciente")) return "🌓";
  if (label.includes("Gibosa creciente")) return "🌔";
  if (label.includes("Luna llena")) return "🌕";
  if (label.includes("Gibosa menguante")) return "🌖";
  if (label.includes("Cuarto menguante")) return "🌗";
  return "🌘";
}

function windLabel(speed?: number) {
  if (speed === undefined) return "sin dato";
  if (speed < 6) return "flojo";
  if (speed < 12) return "útil";
  if (speed < 20) return "moderado";
  if (speed < 28) return "fuerte";
  return "duro";
}

function activityScore(liveConditions: LiveConditions | null, species: Species, dateIso: string) {
  let score = 3;
  const month = Number(dateIso.slice(5, 7));
  const wind = liveConditions?.windSpeedMaxKmh;
  const rain = liveConditions?.precipitationProbabilityMax;
  const clouds = liveConditions?.hourly?.slice(6, 21).reduce((acc, item) => acc + (item.cloudCover ?? 0), 0);
  const cloudAvg = liveConditions?.hourly?.length ? (clouds ?? 0) / liveConditions.hourly.slice(6, 21).length : undefined;

  if (wind !== undefined) {
    if (wind >= 6 && wind <= 16) score += 1;
    else if (wind >= 24 || wind <= 2) score -= 1;
  }
  if (rain !== undefined && rain >= 70) score -= 1;
  if (cloudAvg !== undefined && cloudAvg >= 20 && cloudAvg <= 75) score += 1;
  if (liveConditions?.solunarMajor?.length) score += 1;
  if (["Luna nueva", "Luna llena"].includes(liveConditions?.moonPhaseLabel ?? "")) score += 1;
  if (species === "black bass" && [4, 5, 6, 10].includes(month)) score += 1;
  if (species === "lucioperca" && [11, 12, 1, 2].includes(month)) score += 1;

  return Math.max(1, Math.min(5, score));
}

export function FishingForm({
  reservoirs,
  privateSpots,
  backendReady,
  sessions,
  todayIso,
}: {
  reservoirs: Reservoir[];
  privateSpots: PrivateSpotPreview[];
  backendReady: boolean;
  sessions: Array<FishingSessionLog & { catches: FishingCatchLog[] }>;
  todayIso: string;
}) {
  const [state, setState] = useState<FishingAppState>({
    reservoirId: reservoirs[0]?.id ?? "garcia-sola",
    tripDate: todayIso,
    targetSpecies: "black bass",
    mode: "pato",
    usingSonar: true,
    sonarModel: "Lowrance Eagle Eye",
    selectedSpotKind: "public",
    selectedSpotName: "Puente de Castilblanco",
  });
  const [liveConditions, setLiveConditions] = useState<LiveConditions | null>(null);
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);

  const reservoir = useMemo(
    () => reservoirs.find((item) => item.id === state.reservoirId) ?? reservoirs[0],
    [state.reservoirId, reservoirs],
  );

  const spotsForReservoir = useMemo(
    () => privateSpots.filter((spot) => spot.reservoirId === state.reservoirId),
    [privateSpots, state.reservoirId],
  );

  useEffect(() => {
    if (state.selectedSpotKind !== "private") return;
    if (!spotsForReservoir.length) return;
    if (spotsForReservoir.some((spot) => spot.aliasVisible === state.selectedSpotName)) return;
    setState((s) => ({ ...s, selectedSpotName: spotsForReservoir[0]?.aliasVisible ?? s.selectedSpotName }));
  }, [spotsForReservoir, state.selectedSpotKind, state.selectedSpotName]);

  useEffect(() => {
    let cancelled = false;
    async function loadConditions() {
      setLiveLoading(true);
      setLiveError(null);
      try {
        const response = await fetch(`/api/fishing/conditions?reservoirId=${encodeURIComponent(state.reservoirId)}&date=${encodeURIComponent(state.tripDate)}`);
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error || `HTTP ${response.status}`);
        }
        const payload = (await response.json()) as LiveConditions;
        if (!cancelled) setLiveConditions(payload);
      } catch (error) {
        if (!cancelled) {
          setLiveConditions(null);
          setLiveError(error instanceof Error ? error.message : "No se pudieron cargar condiciones live");
        }
      } finally {
        if (!cancelled) setLiveLoading(false);
      }
    }
    loadConditions();
    return () => {
      cancelled = true;
    };
  }, [state.reservoirId, state.tripDate]);

  const learning = useMemo(
    () => summarizeLearning({ reservoirId: reservoir.id, species: state.targetSpecies, sessions }),
    [reservoir.id, state.targetSpecies, sessions],
  );

  const briefing = useMemo(
    () => generateBriefing({
      reservoir,
      tripDate: state.tripDate,
      targetSpecies: state.targetSpecies,
      mode: state.mode,
      usingSonar: state.usingSonar,
      selectedSpotKind: state.selectedSpotKind,
      selectedSpotName: state.selectedSpotName,
      privateSpots: spotsForReservoir,
      liveConditions,
      learning,
    }),
    [reservoir, state, spotsForReservoir, liveConditions, learning],
  );

  const timeline = useMemo(() => buildFishingTimeline(liveConditions), [liveConditions]);
  const hotWindows = useMemo(() => buildHourlyHotWindows(liveConditions), [liveConditions]);
  const fishScore = useMemo(() => activityScore(liveConditions, state.targetSpecies, state.tripDate), [liveConditions, state.targetSpecies, state.tripDate]);

  return (
    <div className="space-y-6">
      <section className="overflow-hidden rounded-[34px] border border-cyan-300/12 bg-[linear-gradient(135deg,rgba(11,26,43,0.96),rgba(8,16,29,0.92)_42%,rgba(6,12,24,0.96))] shadow-[0_30px_100px_rgba(0,0,0,0.32)]">
        <div className="grid gap-0 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="relative p-6 sm:p-8 lg:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_32%),radial-gradient(circle_at_75%_15%,rgba(59,130,246,0.12),transparent_24%)]" />
            <div className="relative">
              <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.32em] text-cyan-200/70">
                <span>Fishing Intel</span>
                <span className="rounded-full border border-white/10 bg-white/6 px-3 py-1 tracking-[0.24em] text-zinc-300">{reservoir.basin}</span>
              </div>

              <div className="mt-5 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">{reservoir.name}</h2>
                  <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-300/88">{briefing.summary}</p>
                </div>
                <div className={`rounded-2xl px-4 py-3 text-sm font-medium ${confidenceTone(briefing.confidence)}`}>
                  confianza {briefing.confidence}
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3 text-sm text-zinc-200">
                <SignalChip icon={<CalendarDays className="h-4 w-4" />} label={formatDate(state.tripDate)} />
                <SignalChip icon={<Fish className="h-4 w-4" />} label={state.targetSpecies} />
                <SignalChip icon={<Route className="h-4 w-4" />} label={state.mode} />
                <SignalChip icon={<Radar className="h-4 w-4" />} label={state.usingSonar ? state.sonarModel : "sin sonda"} />
                <SignalChip icon={<WeatherIcon code={liveConditions?.weatherCode} className="h-4 w-4" />} label={weatherLabelFromCode(liveConditions?.weatherCode)} />
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <HeroMetric
                  label="Meteo"
                  value={liveConditions?.temperatureMaxC !== undefined ? `${liveConditions.temperatureMaxC}º` : "—"}
                  hint={liveConditions?.precipitationProbabilityMax !== undefined ? `${weatherLabelFromCode(liveConditions.weatherCode)} · lluvia ${liveConditions.precipitationProbabilityMax}%` : "sin lectura"}
                  icon={<WeatherIcon code={liveConditions?.weatherCode} />}
                />
                <HeroMetric
                  label="Viento"
                  value={liveConditions?.windSpeedMaxKmh !== undefined ? `${liveConditions.windSpeedMaxKmh} km/h` : "—"}
                  hint={windLabel(liveConditions?.windSpeedMaxKmh)}
                  icon={<Wind className="h-5 w-5 text-cyan-200" />}
                />
                <HeroMetric
                  label="Nivel"
                  value={liveConditions?.level?.currentPercent !== undefined ? `${liveConditions.level.currentPercent}%` : "—"}
                  hint={liveConditions?.level?.weeklyChangeHm3 !== undefined ? `${liveConditions.level.weeklyChangeHm3 >= 0 ? "sube" : "baja"} ${Math.abs(liveConditions.level.weeklyChangeHm3)} hm³/sem` : "sin histórico"}
                  icon={<Gauge className="h-5 w-5 text-emerald-200" />}
                />
                <HeroMetric
                  label="Actividad"
                  value={`${fishScore}/5`}
                  hint={hotWindows[0] ? `mejor ventana ${hotWindows[0].label}` : "sin ranking horario"}
                  icon={<FishActivity value={fishScore} />}
                />
              </div>
            </div>
          </div>

          <aside className="border-t border-white/8 bg-black/18 p-6 backdrop-blur-2xl sm:p-8 xl:border-l xl:border-t-0">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[11px] uppercase tracking-[0.3em] text-zinc-500">Plan rápido</div>
                <h3 className="mt-2 text-xl font-semibold text-white">Configura la salida</h3>
              </div>
              <div className={`rounded-full px-3 py-1 text-xs ${backendReady ? "bg-emerald-400/12 text-emerald-100" : "bg-amber-400/12 text-amber-100"}`}>{backendReady ? "Supabase listo" : "JSON local"}</div>
            </div>

            <div className="mt-6 space-y-4">
              <Field label="Embalse">
                <select className={inputClassName()} value={state.reservoirId} onChange={(e) => setState((s) => ({ ...s, reservoirId: e.target.value }))}>
                  {reservoirs.map((item) => (
                    <option key={item.id} value={item.id} className="bg-slate-950">{item.name}</option>
                  ))}
                </select>
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Fecha">
                  <input type="date" className={inputClassName()} value={state.tripDate} onChange={(e) => setState((s) => ({ ...s, tripDate: e.target.value }))} />
                </Field>
                <Field label="Modo">
                  <select className={inputClassName()} value={state.mode} onChange={(e) => setState((s) => ({ ...s, mode: e.target.value as FishingMode }))}>
                    {modeOptions.map((item) => <option key={item} value={item} className="bg-slate-950">{item}</option>)}
                  </select>
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Especie objetivo">
                  <select className={inputClassName()} value={state.targetSpecies} onChange={(e) => setState((s) => ({ ...s, targetSpecies: e.target.value as Species }))}>
                    {speciesOptions.map((item) => <option key={item} value={item} className="bg-slate-950">{item}</option>)}
                  </select>
                </Field>
                <Field label="Tipo de spot">
                  <select className={inputClassName()} value={state.selectedSpotKind} onChange={(e) => setState((s) => ({ ...s, selectedSpotKind: e.target.value as "public" | "private" }))}>
                    <option value="public" className="bg-slate-950">Zona pública</option>
                    <option value="private" className="bg-slate-950">Privado</option>
                  </select>
                </Field>
              </div>

              <Field label={state.selectedSpotKind === "private" ? "Alias del privado" : "Zona de arranque"}>
                {state.selectedSpotKind === "private" && spotsForReservoir.length ? (
                  <select className={inputClassName()} value={state.selectedSpotName} onChange={(e) => setState((s) => ({ ...s, selectedSpotName: e.target.value }))}>
                    {spotsForReservoir.map((spot) => (
                      <option key={spot.id} value={spot.aliasVisible} className="bg-slate-950">{spot.aliasVisible}</option>
                    ))}
                  </select>
                ) : (
                  <input className={inputClassName()} value={state.selectedSpotName} onChange={(e) => setState((s) => ({ ...s, selectedSpotName: e.target.value }))} placeholder={state.selectedSpotKind === "private" ? "Ej. Castillo Norte 2" : "Ej. punta batida, recula, puente..."} />
                )}
              </Field>

              <div className="rounded-[28px] border border-white/10 bg-white/[0.05] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <label className="inline-flex items-center gap-3 text-sm text-zinc-100">
                    <input type="checkbox" checked={state.usingSonar} onChange={(e) => setState((s) => ({ ...s, usingSonar: e.target.checked }))} className="h-4 w-4 rounded border-white/20 bg-transparent" />
                    Activar capa sonar
                  </label>
                  <span className="rounded-full border border-cyan-300/18 bg-cyan-400/10 px-3 py-1 text-xs text-cyan-50">Lowrance-ready</span>
                </div>
                <div className="mt-3">
                  <Field label="Equipo">
                    <input className={inputClassName()} value={state.sonarModel} onChange={(e) => setState((s) => ({ ...s, sonarModel: e.target.value }))} />
                  </Field>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <Panel
            eyebrow="Ventanas"
            title="Cuándo apretar"
            accent="cyan"
            aside={hotWindows[0] ? `Mejor franja: ${hotWindows[0].label}` : undefined}
          >
            <div className="grid gap-4 lg:grid-cols-[0.88fr_1.12fr]">
              <div className="space-y-3">
                {hotWindows.length ? hotWindows.map((slot, index) => (
                  <div key={`${slot.label}-${index}`} className="rounded-[24px] border border-cyan-300/16 bg-cyan-400/10 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-xs uppercase tracking-[0.26em] text-cyan-100/60">Ventana {index + 1}</div>
                        <div className="mt-1 text-2xl font-semibold text-white">{slot.label}</div>
                      </div>
                      <div className="rounded-2xl bg-white/10 px-3 py-2 text-sm font-medium text-cyan-50">{slot.score}/10</div>
                    </div>
                    <p className="mt-3 text-sm text-cyan-50/88">{slot.reason}</p>
                  </div>
                )) : <EmptyState text="Sin ranking horario todavía." />}
              </div>

              <div className="rounded-[26px] border border-white/10 bg-white/[0.04] p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.3em] text-zinc-500">Timeline de lectura</div>
                    <div className="mt-2 text-lg font-semibold text-white">Bloques del día</div>
                  </div>
                  <Wind className="h-5 w-5 text-cyan-200" />
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {timeline.length ? timeline.map((slot) => (
                    <div key={slot.label} className="rounded-2xl border border-white/10 bg-black/18 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="font-medium text-white">{slot.label}</div>
                        <div className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs text-cyan-50">{slot.score}/10</div>
                      </div>
                      <div className="mt-2 text-sm text-zinc-400">{slot.reason}</div>
                    </div>
                  )) : <EmptyState text="Sin timeline todavía." />}
                </div>

                {liveConditions?.hourly?.length ? (
                  <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4 xl:grid-cols-6">
                    {liveConditions.hourly.slice(0, 12).map((item) => (
                      <div key={item.time} className="rounded-2xl border border-white/8 bg-white/[0.04] p-3 text-center">
                        <div className="text-xs font-medium text-white">{item.time.slice(11, 16)}</div>
                        <div className="mt-1 text-sm text-zinc-200">{Math.round(item.temperatureC)}º</div>
                        <div className="text-[11px] text-zinc-500">{Math.round(item.windSpeedKmh)} km/h</div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </Panel>

          <Panel eyebrow="Plan táctico" title="Dónde y cómo pescar" aside={state.selectedSpotName}>
            <div className="grid gap-4 lg:grid-cols-2">
              <FeatureList title="Ventanas operativas" icon={<Target className="h-4 w-4" />} items={briefing.windows} />
              <FeatureList title="Zonas con sentido" icon={<Waves className="h-4 w-4" />} items={briefing.keyZones} />
              <FeatureList title="Señuelos" icon={<Fish className="h-4 w-4" />} items={briefing.lures} />
              <FeatureList title="Técnicas" icon={<Route className="h-4 w-4" />} items={briefing.techniques} />
            </div>
          </Panel>

          <Panel eyebrow="Electrónica" title="Lectura sonar / Eagle Eye" aside={state.usingSonar ? state.sonarModel : "Desactivado"}>
            <div className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
              <div className="rounded-[24px] border border-cyan-300/14 bg-cyan-400/8 p-5">
                <div className="flex items-center gap-3 text-cyan-50">
                  <Radar className="h-5 w-5" />
                  <div className="font-medium">Plan sonar</div>
                </div>
                <ul className="mt-4 space-y-3 text-sm text-zinc-200">
                  {briefing.sonarPlan.map((item) => <li key={item}>• {item}</li>)}
                </ul>
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
                <div className="flex items-center gap-3 text-white">
                  <Shield className="h-5 w-5 text-cyan-200" />
                  <div className="font-medium">Checklist rápida</div>
                </div>
                <ul className="mt-4 space-y-3 text-sm text-zinc-300">
                  <li>• Buscar pez pasto antes de casarte con una punta bonita pero vacía.</li>
                  <li>• Validar si el viento crea agua tomada útil o solo complica control del pato.</li>
                  <li>• Si la pantalla no enseña pez colocado, no fuerces damiki por romanticismo.</li>
                  <li>• Revisa paralelo + salida a profundidad antes de abandonar el puesto.</li>
                </ul>
              </div>
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel eyebrow="Condiciones" title="Radar de jornada" accent="subtle">
            <div className="space-y-4">
              {liveLoading ? <EmptyState text="Cargando meteo y viento…" /> : null}
              {!liveLoading && liveError ? <EmptyState text={liveError} tone="warning" /> : null}
              {!liveLoading && !liveError && liveConditions ? (
                <>
                  <div className="rounded-[24px] border border-white/10 bg-white/[0.05] p-4 text-sm text-zinc-200">{liveConditions.summary}</div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <VisualConditionCard
                      title="Tiempo"
                      value={weatherLabelFromCode(liveConditions.weatherCode)}
                      detail={liveConditions.precipitationProbabilityMax !== undefined ? `lluvia ${liveConditions.precipitationProbabilityMax}% · ${liveConditions.temperatureMinC ?? "—"}-${liveConditions.temperatureMaxC ?? "—"}ºC` : "sin precipitación estimada"}
                      icon={<WeatherIcon code={liveConditions.weatherCode} className="h-6 w-6" />}
                    />
                    <VisualConditionCard
                      title="Viento"
                      value={liveConditions.windSpeedMaxKmh !== undefined ? `${liveConditions.windSpeedMaxKmh} km/h` : "—"}
                      detail={`intensidad ${windLabel(liveConditions.windSpeedMaxKmh)}${liveConditions.windGustsMaxKmh !== undefined ? ` · racha ${liveConditions.windGustsMaxKmh} km/h` : ""}`}
                      icon={<Wind className="h-6 w-6 text-cyan-200" />}
                    />
                    <VisualConditionCard
                      title="Luna"
                      value={liveConditions.moonPhaseLabel ?? "—"}
                      detail={liveConditions.moonIlluminationPercent !== undefined ? `${liveConditions.moonIlluminationPercent}% iluminada` : "sin fase"}
                      icon={<span className="text-2xl leading-none">{moonEmoji(liveConditions.moonPhaseLabel)}</span>}
                    />
                    <VisualConditionCard
                      title="Actividad peces"
                      value={`${fishScore}/5`}
                      detail={hotWindows[0] ? `pico estimado ${hotWindows[0].label}` : "score heurístico del día"}
                      icon={<FishActivity value={fishScore} />}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <MiniMetric label="Amanecer" value={liveConditions.sunrise?.slice(11, 16) ?? "—"} />
                    <MiniMetric label="Anochecer" value={liveConditions.sunset?.slice(11, 16) ?? "—"} />
                    <MiniMetric label="Lluvia" value={liveConditions.precipitationProbabilityMax !== undefined ? `${liveConditions.precipitationProbabilityMax}%` : "—"} />
                    <MiniMetric label="Nivel" value={liveConditions.levelPercent !== undefined ? `${liveConditions.levelPercent}%` : "—"} />
                  </div>
                  {(liveConditions.solunarMajor?.length || liveConditions.solunarMinor?.length) ? (
                    <div className="rounded-[24px] border border-white/10 bg-black/16 p-4 text-sm text-zinc-300">
                      <div className="flex items-center gap-2 text-white"><MoonStar className="h-4 w-4 text-cyan-200" />Solunar</div>
                      {liveConditions.solunarMajor?.length ? <div className="mt-3"><span className="font-medium text-white">Mayores:</span> {liveConditions.solunarMajor.join(" · ")}</div> : null}
                      {liveConditions.solunarMinor?.length ? <div className="mt-2"><span className="font-medium text-white">Menores:</span> {liveConditions.solunarMinor.join(" · ")}</div> : null}
                    </div>
                  ) : null}
                </>
              ) : null}
            </div>
          </Panel>

          <Panel eyebrow="Nivel" title="Embalse y tendencia" accent="subtle">
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <VisualConditionCard
                  title="Estado actual"
                  value={liveConditions?.level?.currentPercent !== undefined ? `${liveConditions.level.currentPercent}%` : "—"}
                  detail={liveConditions?.level?.currentHm3 !== undefined ? `${liveConditions.level.currentHm3} hm³ embalsados` : "sin lectura actual"}
                  icon={<Gauge className="h-6 w-6 text-emerald-200" />}
                />
                <VisualConditionCard
                  title="Variación semanal"
                  value={liveConditions?.level?.weeklyChangeHm3 !== undefined ? `${liveConditions.level.weeklyChangeHm3 > 0 ? "+" : ""}${liveConditions.level.weeklyChangeHm3} hm³` : "—"}
                  detail={liveConditions?.level?.weeklyChangePercent !== undefined ? `${liveConditions.level.weeklyChangePercent > 0 ? "+" : ""}${liveConditions.level.weeklyChangePercent}% frente a la semana anterior` : "sin comparación"}
                  icon={liveConditions?.level?.weeklyChangeHm3 !== undefined && liveConditions.level.weeklyChangeHm3 < 0 ? <TrendingDown className="h-6 w-6 text-rose-200" /> : <TrendingUp className="h-6 w-6 text-cyan-200" />}
                />
              </div>

              {liveConditions?.level ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <MiniMetric label="Misma semana 2025" value={liveConditions.level.sameWeekLastYearPercent !== undefined ? `${liveConditions.level.sameWeekLastYearPercent}%` : "—"} />
                  <MiniMetric label="Media 10 años" value={liveConditions.level.sameWeekTenYearAvgPercent !== undefined ? `${liveConditions.level.sameWeekTenYearAvgPercent}%` : "—"} />
                </div>
              ) : null}

              {liveConditions?.level?.annualChartUrl ? (
                <div className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-3">
                  <div className="mb-3 flex items-center justify-between gap-3 px-1">
                    <div>
                      <div className="text-sm font-medium text-white">Gráfica anual</div>
                      <div className="text-xs text-zinc-500">Fuente embalses.net · semanal</div>
                    </div>
                    {liveConditions.level.pageUrl ? <a href={liveConditions.level.pageUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-cyan-200">fuente <ArrowUpRight className="h-3.5 w-3.5" /></a> : null}
                  </div>
                  <img src={liveConditions.level.annualChartUrl} alt={`Gráfica anual de ${reservoir.name}`} className="w-full rounded-[18px] border border-white/8 bg-white" loading="lazy" />
                </div>
              ) : null}

              {liveConditions?.level?.historicChartUrl ? (
                <div className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.04] p-3">
                  <div className="mb-3 px-1">
                    <div className="text-sm font-medium text-white">Gráfica histórica</div>
                    <div className="text-xs text-zinc-500">Fuente embalses.net · mensual</div>
                  </div>
                  <img src={liveConditions.level.historicChartUrl} alt={`Gráfica histórica de ${reservoir.name}`} className="w-full rounded-[18px] border border-white/8 bg-white" loading="lazy" />
                </div>
              ) : (
                <EmptyState text="Todavía no tengo vinculada la gráfica histórica de este embalse en embalses.net." />
              )}
            </div>
          </Panel>

          <Panel eyebrow="Contexto" title="Embalse y estructura" accent="subtle">
            <div className="space-y-4">
              <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4 text-sm text-zinc-300">{reservoir.notes}</div>
              <div className="flex flex-wrap gap-2">
                <Tag>{reservoir.province}</Tag>
                <Tag>presión {reservoir.pressure}</Tag>
                <Tag>agua {reservoir.clarity}</Tag>
                {reservoir.forage.map((item) => <Tag key={item}>{item}</Tag>)}
              </div>
              <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
                <div className="text-sm font-medium text-white">Zonas públicas base</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {reservoir.publicZones.map((zone) => <Tag key={zone}>{zone}</Tag>)}
                </div>
              </div>
            </div>
          </Panel>

          <Panel eyebrow="Privados" title="Spots sensibles" accent="subtle" aside={`${spotsForReservoir.length} spots`}>
            <div className="space-y-3">
              <div className="rounded-[22px] border border-amber-300/16 bg-amber-400/10 px-4 py-3 text-sm text-amber-50">
                Solo alias en interfaz. Coordenadas exactas siempre fuera de pantalla.
              </div>
              {spotsForReservoir.length ? spotsForReservoir.map((spot) => (
                <div key={spot.id} className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium text-white">{spot.aliasVisible}</div>
                      <div className="mt-1 text-xs text-zinc-500">sensibilidad {spot.sensitivity} · profundidad {spot.depthHintM ?? "—"} m</div>
                    </div>
                    <div className="rounded-full border border-white/10 bg-black/15 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-zinc-400">privado</div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {spot.structureTags.map((tag) => <Tag key={tag}>{tag}</Tag>)}
                  </div>
                </div>
              )) : <EmptyState text="Todavía no hay spots privados cargados para este embalse." />}
            </div>
          </Panel>

          <Panel eyebrow="Aprendizaje" title="Lo que ya sabemos" accent="subtle">
            <div className="space-y-4">
              <div className="rounded-[24px] border border-white/10 bg-white/[0.05] p-4 text-sm text-zinc-200">{learning.summary}</div>
              <div className="grid grid-cols-2 gap-3">
                <MiniMetric label="Jornadas" value={String(learning.sessionCount)} />
                <MiniMetric label="Capturas" value={String(learning.catchCount)} />
                <MiniMetric label="Peso medio" value={learning.averageWeightKg !== undefined ? `${learning.averageWeightKg} kg` : "—"} />
                <MiniMetric label="Última" value={learning.latestTripDate ?? "—"} />
              </div>
              {briefing.secondarySpecies.length ? (
                <div>
                  <div className="text-sm font-medium text-white">Especies secundarias aprovechables</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {briefing.secondarySpecies.map((species) => <Tag key={species}>{species}</Tag>)}
                  </div>
                </div>
              ) : null}
              <div>
                <div className="text-sm font-medium text-white">Notas finas</div>
                <ul className="mt-3 space-y-2 text-sm text-zinc-300">
                  {briefing.notes.map((note) => <li key={note}>• {note}</li>)}
                </ul>
              </div>
            </div>
          </Panel>
        </div>
      </section>
    </div>
  );
}

function formatDate(value: string) {
  if (!value) return "fecha sin definir";
  const [, month = "01", day = "01"] = value.split("-");
  const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  return `${day} ${months[Math.max(0, Number(month) - 1)] ?? month}`;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm text-zinc-400">{label}</span>
      {children}
    </label>
  );
}

function Panel({ eyebrow, title, children, aside, accent = "default" }: { eyebrow?: string; title: string; children: React.ReactNode; aside?: string; accent?: "default" | "cyan" | "subtle" }) {
  const tone = accent === "cyan"
    ? "border-cyan-300/14 bg-[linear-gradient(180deg,rgba(10,22,34,0.92),rgba(7,14,24,0.96))]"
    : "border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))]";

  return (
    <section className={`rounded-[30px] border ${tone} p-5 shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-2xl sm:p-6`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          {eyebrow ? <div className="text-[11px] uppercase tracking-[0.3em] text-zinc-500">{eyebrow}</div> : null}
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-white">{title}</h3>
        </div>
        {aside ? <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-zinc-400">{aside}</div> : null}
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function HeroMetric({ label, value, hint, icon }: { label: string; value: string; hint: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-[24px] border border-white/8 bg-white/[0.05] p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[11px] uppercase tracking-[0.28em] text-zinc-500">{label}</div>
        {icon ? <div>{icon}</div> : null}
      </div>
      <div className="mt-3 text-xl font-semibold text-white">{value}</div>
      <div className="mt-2 text-xs leading-5 text-zinc-400">{hint}</div>
    </div>
  );
}

function SignalChip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.05] px-4 py-2">{icon}<span>{label}</span></div>;
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4">
      <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">{label}</div>
      <div className="mt-2 text-sm font-medium text-white">{value}</div>
    </div>
  );
}

function VisualConditionCard({ title, value, detail, icon }: { title: string; value: string; detail: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.24em] text-zinc-500">{title}</div>
          <div className="mt-2 text-lg font-semibold text-white">{value}</div>
        </div>
        <div>{icon}</div>
      </div>
      <div className="mt-2 text-sm text-zinc-400">{detail}</div>
    </div>
  );
}

function FishActivity({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => (
        <Fish key={index} className={`h-4 w-4 ${index < value ? "text-cyan-200" : "text-zinc-700"}`} />
      ))}
    </div>
  );
}

function FeatureList({ title, icon, items }: { title: string; icon: React.ReactNode; items: string[] }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-center gap-3 text-white">
        <span className="text-cyan-200">{icon}</span>
        <div className="font-medium">{title}</div>
      </div>
      <ul className="mt-4 space-y-3 text-sm text-zinc-300">
        {items.map((item) => <li key={item}>• {item}</li>)}
      </ul>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-xs text-zinc-200">{children}</span>;
}

function EmptyState({ text, tone = "default" }: { text: string; tone?: "default" | "warning" }) {
  return <div className={`rounded-[24px] border px-4 py-4 text-sm ${tone === "warning" ? "border-amber-300/14 bg-amber-400/10 text-amber-50" : "border-white/10 bg-white/[0.04] text-zinc-400"}`}>{text}</div>;
}
