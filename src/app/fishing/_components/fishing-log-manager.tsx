import { createCatchAction, createSessionAction } from "@/app/fishing/log-actions";
import type { FishingMode, Species, Reservoir } from "@/lib/fishing-types";
import type { FishingCatchLog, FishingSessionLog } from "@/lib/fishing-log-types";

const speciesOptions: Species[] = ["black bass", "lucio", "barbo", "lucioperca"];
const modeOptions: FishingMode[] = ["pato", "orilla", "bass-boat"];

export function FishingLogManager({
  reservoirs,
  sessions,
}: {
  reservoirs: Reservoir[];
  sessions: Array<FishingSessionLog & { catches: FishingCatchLog[] }>;
}) {
  return (
    <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-6">
        <Panel title="Nueva jornada" eyebrow="Log">
          <form action={createSessionAction} className="grid gap-4 sm:grid-cols-2">
            <Field label="Embalse">
              <select name="reservoirId" className={inputClassName()} defaultValue={reservoirs[0]?.id}>
                {reservoirs.map((item) => <option key={item.id} value={item.id} className="bg-slate-900">{item.name}</option>)}
              </select>
            </Field>
            <Field label="Fecha">
              <input name="tripDate" type="date" className={inputClassName()} required />
            </Field>
            <Field label="Especie objetivo">
              <select name="targetSpecies" className={inputClassName()} defaultValue="black bass">
                {speciesOptions.map((item) => <option key={item} value={item} className="bg-slate-900">{item}</option>)}
              </select>
            </Field>
            <Field label="Modo">
              <select name="mode" className={inputClassName()} defaultValue="pato">
                {modeOptions.map((item) => <option key={item} value={item} className="bg-slate-900">{item}</option>)}
              </select>
            </Field>
            <label className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-200 sm:mt-7">
              <input type="checkbox" name="usingSonar" className="h-4 w-4" defaultChecked />
              Usar sonda
            </label>
            <Field label="Equipo sonda">
              <input name="sonarDevice" className={inputClassName()} defaultValue="Lowrance Eagle Eye" />
            </Field>
            <div className="sm:col-span-2">
              <Field label="Notas">
                <textarea name="notes" className={`${inputClassName()} min-h-24 resize-y`} placeholder="Condiciones, sector, objetivo, etc." />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <button type="submit" className="rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-50">Guardar jornada</button>
            </div>
          </form>
        </Panel>

        <Panel title="Nueva captura" eyebrow="Log">
          <form action={createCatchAction} className="grid gap-4 sm:grid-cols-2">
            <Field label="Jornada">
              <select name="sessionId" className={inputClassName()} defaultValue={sessions[0]?.id}>
                {sessions.map((session) => <option key={session.id} value={session.id} className="bg-slate-900">{session.tripDate} · {session.reservoirId} · {session.targetSpecies}</option>)}
              </select>
            </Field>
            <Field label="Especie">
              <select name="species" className={inputClassName()} defaultValue="black bass">
                {speciesOptions.map((item) => <option key={item} value={item} className="bg-slate-900">{item}</option>)}
              </select>
            </Field>
            <Field label="Peso (kg)"><input name="weightKg" type="number" step="0.01" className={inputClassName()} /></Field>
            <Field label="Longitud (cm)"><input name="lengthCm" type="number" step="0.1" className={inputClassName()} /></Field>
            <Field label="Señuelo"><input name="lure" className={inputClassName()} placeholder="Fluke weightless" /></Field>
            <Field label="Técnica"><input name="technique" className={inputClassName()} placeholder="Transición en punta" /></Field>
            <Field label="Profundidad (m)"><input name="depthM" type="number" step="0.1" className={inputClassName()} /></Field>
            <div className="sm:col-span-2">
              <Field label="Notas"><textarea name="notes" className={`${inputClassName()} min-h-24 resize-y`} placeholder="Lectura de sonda, viento, orilla, etc." /></Field>
            </div>
            <div className="sm:col-span-2">
              <button type="submit" className="rounded-2xl border border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-sm font-medium text-emerald-50">Guardar captura</button>
            </div>
          </form>
        </Panel>
      </div>

      <Panel title="Histórico reciente" eyebrow="Aprendizaje">
        <div className="space-y-4">
          {sessions.length ? sessions.map((session) => (
            <div key={session.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div className="font-medium text-white">{session.tripDate} · {session.reservoirId} · {session.targetSpecies}</div>
                <div className="text-xs text-zinc-500">{session.mode} · {session.usingSonar ? session.sonarDevice || "sonda" : "sin sonda"}</div>
              </div>
              {session.notes ? <div className="mt-2 text-xs text-zinc-400">{session.notes}</div> : null}
              <div className="mt-3 space-y-2">
                {session.catches.length ? session.catches.map((item) => (
                  <div key={item.id} className="rounded-xl border border-white/10 bg-black/15 px-3 py-2 text-xs text-zinc-300">
                    <div className="font-medium text-white">{item.species} {item.weightKg ? `· ${item.weightKg} kg` : ""} {item.lengthCm ? `· ${item.lengthCm} cm` : ""}</div>
                    <div>{item.lure || "—"} · {item.technique || "—"} {item.depthM ? `· ${item.depthM} m` : ""}</div>
                    {item.notes ? <div className="mt-1 text-zinc-400">{item.notes}</div> : null}
                  </div>
                )) : <div className="text-xs text-zinc-500">Sin capturas registradas todavía.</div>}
              </div>
            </div>
          )) : <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-500">Todavía no hay jornadas guardadas.</div>}
        </div>
      </Panel>
    </section>
  );
}

function Panel({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[30px] border border-white/12 bg-white/[0.07] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-2xl sm:p-6">
      <div className="text-[11px] uppercase tracking-[0.3em] text-zinc-500">{eyebrow}</div>
      <h2 className="text-xl font-semibold tracking-tight text-white">{title}</h2>
      <div className="mt-5">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-2"><span className="text-sm text-zinc-400">{label}</span>{children}</label>;
}

function inputClassName() {
  return "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-cyan-300/30 focus:bg-white/8";
}
