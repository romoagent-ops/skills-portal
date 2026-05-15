import Link from 'next/link';
import { ChevronRight, LockKeyhole, Sparkles, UserRound } from 'lucide-react';
import { sectionMeta, skills } from '@/lib/skills';

const toneMap = {
  violet: {
    icon: 'border-fuchsia-300/20 bg-fuchsia-400/14 text-fuchsia-100',
    badge: 'border-fuchsia-300/16 bg-fuchsia-400/10 text-fuchsia-100',
    glow: 'from-fuchsia-400/14 to-transparent',
  },
  cyan: {
    icon: 'border-cyan-300/20 bg-cyan-400/14 text-cyan-100',
    badge: 'border-cyan-300/16 bg-cyan-400/10 text-cyan-100',
    glow: 'from-cyan-400/14 to-transparent',
  },
  emerald: {
    icon: 'border-emerald-300/20 bg-emerald-400/14 text-emerald-100',
    badge: 'border-emerald-300/16 bg-emerald-400/10 text-emerald-100',
    glow: 'from-emerald-400/14 to-transparent',
  },
  amber: {
    icon: 'border-amber-300/20 bg-amber-400/14 text-amber-100',
    badge: 'border-amber-300/16 bg-amber-400/10 text-amber-100',
    glow: 'from-amber-400/14 to-transparent',
  },
  slate: {
    icon: 'border-white/10 bg-white/[0.06] text-zinc-100',
    badge: 'border-white/10 bg-white/[0.05] text-zinc-200',
    glow: 'from-white/8 to-transparent',
  },
} as const;

const grouped = {
  core: skills.filter((item) => item.section === 'core'),
  ops: skills.filter((item) => item.section === 'ops'),
  lab: skills.filter((item) => item.section === 'lab'),
  paused: skills.filter((item) => item.section === 'paused'),
};

export default function HomePage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-md px-4 pb-10 pt-4 sm:max-w-xl sm:px-5">
      <header className="rounded-[30px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,12,20,0.9),rgba(10,12,20,0.76))] p-4 shadow-[0_26px_80px_rgba(0,0,0,0.34)] backdrop-blur-3xl sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.32em] text-fuchsia-200/82">skills.romobot.es</div>
            <h1 className="mt-2 text-[2rem] font-semibold tracking-tight text-white">Clippy</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.06] px-3 py-2 text-sm text-zinc-100">
              <UserRound className="h-4 w-4 text-fuchsia-200" />
              romoagent-ops
            </div>
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                className="rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-2 text-sm text-zinc-200 transition hover:bg-white/[0.08]"
              >
                Salir
              </button>
            </form>
          </div>
        </div>

        <div className="mt-4 rounded-[28px] border border-fuchsia-300/14 bg-[linear-gradient(135deg,rgba(120,54,196,0.2),rgba(8,11,20,0.9))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
          <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-300/16 bg-fuchsia-400/10 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-fuchsia-100">
            <Sparkles className="h-3.5 w-3.5" /> Portal móvil
          </div>
          <div className="mt-3 text-xl font-semibold text-white">Tus skills, sin mezcla.</div>
          <p className="mt-2 text-sm leading-6 text-zinc-100/82">
            Acceso rápido, jerarquía clara y espacio para crecer sin volver a improvisar la UI.
          </p>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              ['12', 'skills'],
              ['4', 'listas'],
              ['1', 'pausa'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-[22px] border border-white/10 bg-black/20 px-3 py-3 text-center">
                <div className="text-lg font-semibold text-white">{value}</div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.22em] text-zinc-300/72">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="mt-5 space-y-5">
        {Object.entries(grouped).map(([key, items]) => {
          const meta = sectionMeta[key as keyof typeof sectionMeta];
          const sectionClass = key === 'paused'
            ? 'border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),rgba(255,255,255,0.02))]'
            : key === 'lab'
              ? 'border-cyan-400/10 bg-[linear-gradient(180deg,rgba(18,27,46,0.64),rgba(255,255,255,0.02))]'
              : 'border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.025))]';

          return (
            <section key={key} className={`rounded-[28px] border p-4 shadow-[0_20px_70px_rgba(0,0,0,0.22)] backdrop-blur-2xl ${sectionClass}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[11px] uppercase tracking-[0.28em] text-zinc-400">{meta.title}</div>
                  <div className="mt-1 text-sm leading-6 text-zinc-200/78">{meta.subtitle}</div>
                </div>
                {key === 'paused' ? (
                  <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-2 text-zinc-200">
                    <LockKeyhole className="h-4 w-4" />
                  </div>
                ) : null}
              </div>

              <div className="mt-4 space-y-3">
                {items.map((skill) => {
                  const Icon = skill.icon;
                  const tone = toneMap[skill.tone];
                  const cta = skill.state === 'En pausa' ? 'Ver nota' : skill.state === 'Próxima' ? 'Ver ficha' : 'Abrir';
                  return (
                    <Link
                      key={skill.slug}
                      href={`/#${skill.slug}`}
                      className="relative block overflow-hidden rounded-[24px] border border-white/10 bg-[linear-gradient(180deg,rgba(14,16,27,0.96),rgba(10,12,20,0.92))] p-4 transition duration-150 hover:-translate-y-[1px] hover:border-white/16"
                    >
                      <div className={`absolute inset-x-0 top-0 h-16 bg-gradient-to-b ${tone.glow}`} />
                      <div className="relative flex items-center gap-3">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] border ${tone.icon}`}>
                          <Icon className="h-5 w-5" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h2 className="truncate text-base font-semibold tracking-tight text-white">{skill.title}</h2>
                              <p className="mt-0.5 text-sm text-zinc-300/82">{skill.subtitle}</p>
                            </div>
                            <div className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.22em] ${tone.badge}`}>
                              {skill.state}
                            </div>
                          </div>

                          <div className="mt-3 flex items-end justify-between gap-3">
                            <p className="max-w-[16rem] text-sm leading-5 text-zinc-200/76">{skill.description}</p>
                            <div className="shrink-0 text-right">
                              <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-zinc-200/88">
                                {skill.metric}
                              </div>
                              <div className="mt-2 inline-flex items-center gap-1 text-sm text-zinc-200/92">
                                {cta} <ChevronRight className="h-4 w-4" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
