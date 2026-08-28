"use client";

import type { NavItemDividerType, NavItemType } from "@/components/application/app-navigation/config";
import { NavList } from "@/components/application/app-navigation/base-components/nav-list";

type SidebarNavigationSectionDividersProps = {
  activeUrl?: string;
  className?: string;
  items: (NavItemType | NavItemDividerType)[];
};

/**
 * ShutterFrame's local composition of the Untitled UI navigation primitives.
 * `NavList` owns nested items and divider rendering; this component gives the
 * sidebar a stable, intention-revealing integration point.
 */
export function SidebarNavigationSectionDividers({
  activeUrl,
  className,
  items,
}: SidebarNavigationSectionDividersProps) {
  return <NavList activeUrl={activeUrl} className={className} items={items} />;
}
