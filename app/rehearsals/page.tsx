import { RehearsalTable } from "@/components/shutterframe/live-rehearsal-ui";
import { WorkspaceLayout } from "@/components/shutterframe/workspace-layout";
import { listRehearsalViews } from "@/lib/database/rehearsal-views";

export const dynamic = "force-dynamic";

export default async function RehearsalsPage() {
  const rehearsals = await listRehearsalViews();
  return <WorkspaceLayout><RehearsalTable items={rehearsals} /></WorkspaceLayout>;
}
