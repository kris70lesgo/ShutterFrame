import { ActiveRehearsal } from "@/components/shutterframe/active-rehearsal";
import { ApprovalPanel } from "@/components/shutterframe/approval-panel";
import { WorkspaceLayout } from "@/components/shutterframe/workspace-layout";
import { EvidenceLog } from "@/components/shutterframe/evidence-log";
import { RecentRuns } from "@/components/shutterframe/recent-runs";
import { RehearsalProgress } from "@/components/shutterframe/rehearsal-progress";
import { ValidationChecks } from "@/components/shutterframe/validation-checks";

export default async function Home() {
  return <WorkspaceLayout>
    <div className="space-y-3.5">
      <ActiveRehearsal />
      <div className="grid gap-3.5 xl:grid-cols-[minmax(0,1fr)_315px]">
        <div className="space-y-3.5"><RehearsalProgress /><div className="grid items-start gap-3.5 xl:grid-cols-[minmax(270px,.9fr)_minmax(420px,1.1fr)]"><ValidationChecks /><EvidenceLog /></div></div>
        <ApprovalPanel />
      </div>
      <RecentRuns />
    </div>
  </WorkspaceLayout>;
}
