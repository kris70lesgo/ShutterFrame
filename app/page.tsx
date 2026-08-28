import { WorkspaceLayout } from "@/components/shutterframe/workspace-layout";
import { DashboardOverview } from "@/components/shutterframe/live-rehearsal-ui";
import { listRehearsalViews } from "@/lib/database/rehearsal-views";

export default async function Home() {
  const rehearsals = await listRehearsalViews();
  return <WorkspaceLayout><DashboardOverview items={rehearsals} /></WorkspaceLayout>;
}
