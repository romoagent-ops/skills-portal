import { createPrivateSpotAction, archivePrivateSpotAction } from "@/app/fishing/actions";
import type { PrivateSpotPreview } from "@/lib/data/private-spots";
import type { Reservoir } from "@/lib/fishing-types";

export function PrivateSpotManager({
  reservoirs,
  privateSpotsByReservoir,
  backendReady,
}: {
  reservoirs: Reservoir[];
  privateSpotsByReservoir: Array<{ reservoir: Reservoir; spots: PrivateSpotPreview[] }>;
  backendReady: boolean;
}) {
  return (
    <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-[30px] border border-white/12 bg-white/[0.07] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-2xl sm:p-6">
        <div className="text-[11px] uppercase tracking-[0.3em] text-zinc-500">Privados</div>
        <h2 className="text-xl font-semibold tracking-tight text-white">Alta rápida de spot privado</h2>
        <p className="mt-3 text-sm text-zinc-300">Alias visible fuera, detalle sensible dentro. Y coordenadas sacadas desde Google Maps para no pelearte con decimales a mano.</p>

        <form action={createPrivateSpotAction} className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Embalse">
            <select name="reservoirId" className={inputClassName()} defaultValue={reservoirs[0]?.id}>
              {reservoirs.map((item) => (
                <option key={item.id} value={item.id} className="bg-slate-900">{item.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Alias visible">
            <input name="aliasVisible" className={inputClassName()} placeholder="Ej. Castillo Norte 2" required />
          </Field>
          <Field label="Sensibilidad">
            <select name="sensitivity" className={inputClassName()} defaultValue="private">
              <option value="private" className="bg-slate-900">private</option>
              <option value="secret" className="bg-slate-900">secret</option>
              <option value="shared" className="bg-slate-900">shared</option>
            </select>
          </Field>
          <Field label="Profundidad orientativa (m)">
            <input name="depthHintM" type="number" step="0.1" className={inputClassName()} placeholder="5.5" />
          </Field>
          <Field label="Enlace Google Maps">
            <input name="mapsUrl" className={inputClassName()} placeholder="https://maps.google.com/..." required />
          </Field>
          <Field label="Estructura (coma separada)">
            <input name="structureTags" className={inputClassName()} placeholder="punta, alga, corte" />
          </Field>
          <Field label="Backend">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300">
              <span className={backendReady ? "text-emerald-300" : "text-amber-300"}>{backendReady ? "Supabase activo" : "fallback local activo"}</span>
            </div>
          </Field>
          <div className="sm:col-span-2">
            <Field label="Notas privadas">
              <textarea name="notesPrivate" className={`${inputClassName()} min-h-28 resize-y`} placeholder="Qué viste ahí, cuándo merece la pena, lectura de sonda, etc." />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <button type="submit" className="inline-flex items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-400/10 px-4 py-3 text-sm font-medium text-cyan-50 transition hover:bg-cyan-400/15">
              Guardar privado
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-[30px] border border-white/12 bg-white/[0.07] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-2xl sm:p-6">
        <div className="text-[11px] uppercase tracking-[0.3em] text-zinc-500">Inventario</div>
        <h2 className="text-xl font-semibold tracking-tight text-white">Privados cargados</h2>
        <div className="mt-5 space-y-5">
          {privateSpotsByReservoir.map(({ reservoir, spots }) => (
            <div key={reservoir.id}>
              <div className="mb-3 text-sm font-medium text-white">{reservoir.name} <span className="text-zinc-500">({spots.length})</span></div>
              {spots.length ? (
                <div className="space-y-3">
                  {spots.map((spot) => (
                    <div key={spot.id} className="rounded-2xl border border-white/10 bg-black/15 p-4 text-sm text-zinc-300">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="font-medium text-white">{spot.aliasVisible}</div>
                          <div className="mt-1 text-xs text-zinc-500">{spot.sensitivity} · {spot.depthHintM ?? "—"} m · {spot.structureTags.join(", ") || "sin tags"}</div>
                          {spot.notesPrivate ? <div className="mt-2 text-xs text-zinc-400">{spot.notesPrivate}</div> : null}
                        </div>
                        <form action={archivePrivateSpotAction}>
                          <input type="hidden" name="id" value={spot.id} />
                          <input type="hidden" name="reservoirId" value={reservoir.id} />
                          <button type="submit" className="rounded-2xl border border-rose-300/20 bg-rose-400/10 px-3 py-2 text-xs font-medium text-rose-50 transition hover:bg-rose-400/15">
                            Archivar
                          </button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-500">Sin privados todavía.</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="text-sm text-zinc-400">{label}</span>
      {children}
    </label>
  );
}

function inputClassName() {
  return "w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-cyan-300/30 focus:bg-white/8";
}
