"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fish, Home, ImageIcon, LayoutGrid } from "lucide-react";

const items = [
  { href: "/", label: "Portal", icon: LayoutGrid },
  { href: "/images", label: "Images", icon: ImageIcon },
  { href: "/fishing", label: "Fishing", icon: Fish },
  { href: "/insurance/home", label: "Seguro", icon: Home },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="sticky bottom-3 z-20 mt-6 flex gap-2 rounded-[28px] border border-white/10 bg-black/35 p-2 shadow-[0_12px_40px_rgba(0,0,0,0.3)] backdrop-blur-2xl md:hidden">
      {items.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link key={item.href} href={item.href} className={`flex flex-1 items-center justify-center gap-2 rounded-[22px] px-4 py-3 text-sm font-medium transition ${active ? "border border-cyan-300/20 bg-cyan-400/14 text-cyan-50" : "text-zinc-300"}`}>
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
