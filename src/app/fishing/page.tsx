import { FishingForm } from "@/components/fishing/fishing-form";
import { GlassShell } from "@/components/ui/shell";
import { PrivateSpotManager } from "@/app/fishing/_components/private-spot-manager";
import { FishingLogManager } from "@/app/fishing/_components/fishing-log-manager";
import { getReservoirCatalog, getPrivateSpotsByReservoir } from "@/lib/fishing-repository";
import { getRecentSessions } from "@/lib/fishing-log-repository";
import { isSupabaseConfigured } from "@/lib/env";

export const dynamic = "force-dynamic";

export default async function FishingPage() {
  const reservoirs = await getReservoirCatalog();
  const initialReservoirId = reservoirs[0]?.id ?? "garcia-sola";
  const privateSpots = await getPrivateSpotsByReservoir(initialReservoirId);
  const privateSpotsByReservoir = await Promise.all(
    reservoirs.map(async (reservoir) => ({
      reservoir,
      spots: await getPrivateSpotsByReservoir(reservoir.id),
    })),
  );
  const sessions = await getRecentSessions();
  const backendReady = isSupabaseConfigured();
  const todayIso = new Date().toISOString().slice(0, 10);

  return (
    <GlassShell
      title="Fishing Intel"
      subtitle="Mobile-first: abrir, leer la jornada y decidir rápido."
    >
      <FishingForm reservoirs={reservoirs} privateSpots={privateSpots} backendReady={backendReady} sessions={sessions} todayIso={todayIso} />

      <section className="space-y-4 pt-2">
        <div>
          <div className="text-[11px] uppercase tracking-[0.3em] text-zinc-500">Operativa</div>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">Privados, jornadas y aprendizaje</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-300/80">Bloques operativos para spots, jornadas, capturas y aprendizaje.</p>
        </div>
        <PrivateSpotManager reservoirs={reservoirs} privateSpotsByReservoir={privateSpotsByReservoir} backendReady={backendReady} />
        <FishingLogManager reservoirs={reservoirs} sessions={sessions} />
      </section>
    </GlassShell>
  );
}
