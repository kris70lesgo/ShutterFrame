import { WorkspaceLayout } from "@/components/shutterframe/workspace-layout";
import { DashboardOverview } from "@/components/shutterframe/live-rehearsal-ui";
import { getRehearsalView, listRehearsalViews } from "@/lib/database/rehearsal-views";

// These pages read Neon at request time; CI intentionally has no database URL.
export const dynamic = "force-dynamic";

export default async function Home() {
  const rehearsals = await listRehearsalViews();
  const featured = rehearsals[0] ? await getRehearsalView(rehearsals[0].id) : undefined;
  return <WorkspaceLayout><DashboardOverview items={rehearsals} featured={featured} /></WorkspaceLayout>;
}
