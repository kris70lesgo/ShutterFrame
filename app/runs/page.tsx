import { WorkspaceLayout } from "@/components/shutterframe/workspace-layout";
import { InteractiveRunsTable } from "@/components/shutterframe/interactive-runs-table";

export default function RunsPage() {
  return (
    <WorkspaceLayout>
      <InteractiveRunsTable />
    </WorkspaceLayout>
  );
}
