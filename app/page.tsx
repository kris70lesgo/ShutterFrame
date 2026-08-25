import { ActiveRehearsal } from "@/components/shutterframe/active-rehearsal";
import { ApprovalPanel } from "@/components/shutterframe/approval-panel";
import { DashboardShell } from "@/components/shutterframe/dashboard-shell";
import { EvidenceLog } from "@/components/shutterframe/evidence-log";
import { RecentRuns } from "@/components/shutterframe/recent-runs";
import { RehearsalProgress } from "@/components/shutterframe/rehearsal-progress";
import { ValidationChecks } from "@/components/shutterframe/validation-checks";
import { serverEnv } from "@/lib/env/server";
import { checkTrueForgeHealth } from "@/lib/trueforge/health";

export default async function Home() {
  const trueforge = await checkTrueForgeHealth();
  const status = {
    trueforgeReachable: trueforge.reachable,
    neonConfigured: serverEnv.neonConfigured,
    daytonaConfigured: serverEnv.daytonaConfigured,
    githubConfigured: serverEnv.githubConfigured,
    modelConfigured: serverEnv.groqConfigured,
  };

  return <DashboardShell systemsOperational={Object.values(status).every(Boolean)}>
    <div className="space-y-3.5">
      <ActiveRehearsal />
      <div className="grid gap-3.5 xl:grid-cols-[minmax(0,1fr)_315px]">
        <div className="space-y-3.5"><RehearsalProgress /><div className="grid gap-3.5 lg:grid-cols-2"><ValidationChecks /><EvidenceLog /></div></div>
        <ApprovalPanel />
      </div>
      <RecentRuns />
    </div>
  </DashboardShell>;
}
