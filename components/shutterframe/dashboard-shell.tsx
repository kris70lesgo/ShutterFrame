"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, ChevronDown, PanelLeftClose } from "lucide-react";
import { BarChartSquare02, GitPullRequest, HomeLine, Rows01, Settings01, Shield01 } from "@untitledui/icons";
import type { NavItemDividerType, NavItemType } from "@/components/application/app-navigation/config";
import { NavAccountCard, type NavAccountType } from "@/components/application/app-navigation/base-components/nav-account-card";
import { SidebarNavigationSectionDividers } from "@/components/application/app-navigation/sidebar-navigation/sidebar-section-dividers";
import { SettingsModal } from "@/components/settings/SettingsModal";

const accounts: NavAccountType[] = [
  { id: "sarah", name: "Sarah Chen", email: "sarah@acme.com", initials: "SC", status: "online" },
  { id: "alex", name: "Alex Kim", email: "alex@acme.com", initials: "AK", status: "online" },
];

export function DashboardShell({ children, systemsOperational }: { children: ReactNode; systemsOperational: boolean }) {
  const pathname = usePathname();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const navigation: (NavItemType | NavItemDividerType)[] = [
    { label: "Dashboard", href: "/", icon: HomeLine },
    { label: "Runs", href: "/runs", icon: Rows01 },
    { divider: true },
    { label: "Integrations", href: "/integrations", icon: BarChartSquare02 },
  ];

  const pageTitle = pathname === '/runs' ? 'Runs' : pathname === '/integrations' ? 'Integrations' : 'Dashboard';

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-[#142033]">
      <aside className="dashboard-sidebar fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-[#e2e8f0] bg-white px-4 py-7 lg:flex">
        <Link href="/" className="px-2" aria-label="ShutterFrame dashboard">
          <Image src="/brand/shutterframe-logo.svg" alt="ShutterFrame" width={231} height={48} priority className="h-9 w-auto" />
        </Link>

        <button className="mt-8 flex items-center gap-3 rounded-xl border border-[#e4eaf1] px-3 py-3 text-left transition hover:border-[#c8d5e5]" type="button">
          <span className="grid size-8 place-items-center rounded-lg bg-[#eaf2f8] text-sm font-bold text-[#286078]">A</span>
          <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">Acme Corp</span><span className="block text-xs text-[#738095]">Production Team</span></span>
          <ChevronDown size={15} className="text-[#6d7a8e]" />
        </button>

        <nav className="mt-3" aria-label="Main navigation">
          <SidebarNavigationSectionDividers activeUrl={pathname} items={navigation} />
        </nav>

        <div className="mt-auto">
          <NavAccountCard items={accounts} selectedAccountId="sarah" popoverPlacement="right bottom" onOpenSettings={() => setIsSettingsOpen(true)} />
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="flex items-center justify-between gap-4 pt-4 pb-2 px-5 lg:px-8 bg-transparent">
          <div className="flex items-center gap-3">
            <Link href="/" className="lg:hidden" aria-label="ShutterFrame dashboard">
              <Image src="/brand/shutterframe-mark.svg" alt="ShutterFrame" width={48} height={48} priority className="size-8" />
            </Link>
            <h1 className="text-[26px] sm:text-[30px] font-[550] tracking-[-0.025em] text-[#0F0F0F] font-sans">{pageTitle}</h1>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button type="button" aria-label="Notifications" className="relative grid size-9 place-items-center rounded-full text-[#4d5b70] hover:bg-[#eaeef3]"><Bell size={20} strokeWidth={1.6} /><span className="absolute right-0 top-0 grid size-4 place-items-center rounded-full bg-[#286078] text-[9px] font-bold text-white">3</span></button>
            <span className="grid size-9 place-items-center rounded-full bg-[#e3e8ef] text-xs font-bold text-[#546177]">AK</span>
          </div>
        </header>
        <main id="dashboard" className="mx-auto max-w-[1640px] p-4 sm:p-6 lg:p-7">{children}</main>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
    </div>
  );
}
