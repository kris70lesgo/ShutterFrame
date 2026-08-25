"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, LayoutDashboard, PanelLeftClose, Route, Settings2, ShieldCheck, SlidersHorizontal, Wrench } from "lucide-react";

const navigation = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard }, { label: "Rehearsals", href: "/rehearsals", icon: Route }, { label: "Runs", href: "/runs", icon: SlidersHorizontal }, { label: "Approvals", href: "/approvals", icon: ShieldCheck, count: 3 }, { label: "Integrations", href: "/integrations", icon: Wrench }, { label: "Settings", href: "/settings", icon: Settings2 },
];

export function DashboardShell({ children, systemsOperational }: { children: ReactNode; systemsOperational: boolean }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#142033]">
      <aside className="dashboard-sidebar fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-[#e2e8f0] bg-white px-4 py-7 lg:flex">
          <Link href="/" className="flex items-center gap-3 px-2 text-lg font-bold tracking-[-0.04em] text-[#101828]">
          <span className="brand-mark grid size-9 place-items-center rounded-xl bg-[#edf5ff] text-[#255aa6]">⌁</span>
          ShutterFrame
          </Link>

        <button className="mt-8 flex items-center gap-3 rounded-xl border border-[#e4eaf1] px-3 py-3 text-left transition hover:border-[#c8d5e5]" type="button">
          <span className="grid size-8 place-items-center rounded-lg bg-[#eaf2f8] text-sm font-bold text-[#286078]">A</span>
          <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">Acme Corp</span><span className="block text-xs text-[#738095]">Production Team</span></span>
          <ChevronDown size={15} className="text-[#6d7a8e]" />
        </button>

        <nav className="mt-5 space-y-1" aria-label="Main navigation">
          {navigation.map(({ label, href, icon: Icon, count }) => (
            <Link key={label} href={href} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${pathname === href ? "bg-[#e8f2fa] text-[#286078]" : "text-[#4e5b70] hover:bg-[#f4f7fa]"}`}>
              <Icon size={18} strokeWidth={1.7} />
              <span className="flex-1">{label}</span>
              {count ? <span className="grid size-5 place-items-center rounded-full bg-[#d9ecf6] text-xs font-bold text-[#286078]">{count}</span> : null}
            </Link>
          ))}
        </nav>

        <button className="mt-auto flex items-center gap-3 rounded-xl border border-[#e4eaf1] px-3 py-3 text-left transition hover:border-[#c8d5e5]" type="button">
          <span className="grid size-8 place-items-center rounded-full bg-[#edf0f4] text-xs font-bold text-[#546177]">SC</span>
          <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">Sarah Chen</span><span className="block truncate text-xs text-[#738095]">sarah@acme.com</span></span>
          <ChevronDown size={15} className="text-[#6d7a8e]" />
        </button>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-10 flex min-h-[72px] items-center justify-between gap-4 border-b border-[#e2e8f0] bg-white/95 px-5 backdrop-blur lg:px-8">
          <Link href="/" className="flex items-center gap-2 text-base font-bold tracking-[-0.04em] lg:hidden"><span className="brand-mark grid size-8 place-items-center rounded-lg bg-[#edf5ff] text-[#255aa6]">⌁</span> ShutterFrame</Link>
          <label className="search-field hidden max-w-[405px] flex-1 items-center gap-3 rounded-lg border border-[#d8e1eb] bg-white px-3 py-2.5 text-sm text-[#8994a5] md:flex">
            <span aria-hidden="true">⌕</span><input aria-label="Search runs, rehearsals, or commands" className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-[#8994a5]" placeholder="Search runs, rehearsals, or commands…" /> <kbd>⌘ K</kbd>
          </label>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden items-center gap-2 text-sm font-medium text-[#303b4d] sm:flex"><span className={`size-2 rounded-full ${systemsOperational ? "bg-[#29a064]" : "bg-[#f3a622]"}`} />{systemsOperational ? "All Systems Operational" : "Attention Needed"}</span>
            <button type="button" className="hidden min-w-40 items-center justify-between gap-5 rounded-lg border border-[#dce4ed] px-3 py-2.5 text-sm font-medium sm:flex"><span className="flex items-center gap-2"><PanelLeftClose size={17} className="text-[#59738d]" />Production</span><ChevronDown size={15} className="text-[#6d7a8e]" /></button>
            <button type="button" aria-label="Notifications" className="relative grid size-9 place-items-center rounded-full text-[#4d5b70] hover:bg-[#f0f4f8]"><Bell size={20} strokeWidth={1.6} /><span className="absolute right-0 top-0 grid size-4 place-items-center rounded-full bg-[#286078] text-[9px] font-bold text-white">3</span></button>
            <span className="grid size-9 place-items-center rounded-full bg-[#edf0f4] text-xs font-bold text-[#546177]">AK</span>
          </div>
        </header>
        <main id="dashboard" className="mx-auto max-w-[1640px] p-4 sm:p-6 lg:p-7">{children}</main>
      </div>
    </div>
  );
}
