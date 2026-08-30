import type { ReactNode } from "react";
import { serverEnv } from "@/lib/env/server";
import { checkTrueForgeHealth } from "@/lib/trueforge/health";
import { DashboardShell } from "@/components/shutterframe/dashboard-shell";

export async function WorkspaceLayout({ children }: { children: ReactNode }) {
  const trueforge = await checkTrueForgeHealth();
  const operational = [trueforge.reachable, serverEnv.neonConfigured, serverEnv.daytonaConfigured, serverEnv.githubConfigured, serverEnv.deepseekConfigured].every(Boolean);
  return <DashboardShell systemsOperational={operational}>{children}</DashboardShell>;
}
