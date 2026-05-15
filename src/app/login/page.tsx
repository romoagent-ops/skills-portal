import { LockKeyhole, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md items-center px-4 py-8 sm:px-5">
      <section className="w-full rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,rgba(10,12,20,0.92),rgba(10,12,20,0.78))] p-5 shadow-[0_26px_80px_rgba(0,0,0,0.34)] backdrop-blur-3xl sm:p-6">
        <div className="inline-flex items-center gap-2 rounded-full border border-fuchsia-300/16 bg-fuchsia-400/10 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-fuchsia-100">
          <ShieldCheck className="h-3.5 w-3.5" /> acceso protegido
        </div>

        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">skills.romobot.es</h1>
        <p className="mt-2 text-sm leading-6 text-zinc-200/78">
          Cierre temporal activo hasta moverlo a Cloudflare Zero Trust.
        </p>

        <form action="/api/auth/login" method="post" className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 block text-sm text-zinc-200">Contraseña</span>
            <div className="flex items-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.05] px-4 py-3">
              <LockKeyhole className="h-4 w-4 text-fuchsia-200" />
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                required
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-zinc-500"
                placeholder="Introduce la clave"
              />
            </div>
          </label>

          <button
            type="submit"
            className="w-full rounded-[22px] border border-fuchsia-300/18 bg-fuchsia-400/14 px-4 py-3 text-sm font-medium text-fuchsia-50 transition hover:bg-fuchsia-400/20"
          >
            Entrar
          </button>
        </form>
      </section>
    </main>
  );
}
