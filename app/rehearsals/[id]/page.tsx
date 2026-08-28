import { notFound } from "next/navigation";
import { RehearsalDetailView } from "@/components/shutterframe/live-rehearsal-ui";
import { WorkspaceLayout } from "@/components/shutterframe/workspace-layout";
import { getRehearsalView } from "@/lib/database/rehearsal-views";

export default async function RehearsalPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rehearsal = await getRehearsalView(id);
  if (!rehearsal) notFound();
  return <WorkspaceLayout><RehearsalDetailView rehearsal={rehearsal} /></WorkspaceLayout>;
}
