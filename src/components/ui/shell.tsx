import type { ReactNode } from "react";
import Link from "next/link";
import { Compass, Fish, Home, ImageIcon, LayoutGrid } from "lucide-react";
import { MobileNav } from "@/components/ui/mobile-nav";

const navItems = [
  { href: "/", label: "Portal", icon: LayoutGrid },
  { href: "/images", label: "Images", icon: ImageIcon },
  { href: "/fishing", label: "Fishing Intel", icon: Fish },
  { href: "/insurance/home", label: "Seguro Hogar", icon: Home },
];

export function GlassShell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <main className="min-h-screen text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-5 sm:py-5 lg:px-6">
        <header className="sticky top-0 z-30 mb-5 rounded-[26px] border border-white/10 bg-[rgba(7,12,20,0.78)] shadow-[0_18px_60px_rgba(0,0,0,0.26)] backdrop-blur-2xl">
          <div className="flex flex-col gap-4 p-4 sm:p-5 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/15 bg-cyan-400/8 px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-cyan-200/80">
                <Compass className="h-3.5 w-3.5" /> skills.romobot.es
              </div>
              <h1 className="mt-3 truncate text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h1>
              {subtitle ? <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300/82">{subtitle}</p> : null}
            </div>

            <nav className="hidden gap-2 md:flex">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} href={item.href} className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-zinc-200 transition hover:bg-white/[0.08] hover:text-white">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>
        <div className="space-y-5">{children}</div>
        <MobileNav />
      </div>
    </main>
  );
}

export function GlassPanel({ title, children, eyebrow }: { title: string; children: ReactNode; eyebrow?: string }) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.03))] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.22)] backdrop-blur-2xl">
      {eyebrow ? <div className="text-[11px] uppercase tracking-[0.3em] text-zinc-500">{eyebrow}</div> : null}
      <h2 className="mt-2 text-lg font-semibold tracking-tight text-white sm:text-xl">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
