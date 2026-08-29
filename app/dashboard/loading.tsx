import { WorkspaceLayout } from "@/components/shutterframe/workspace-layout";

export default function Loading() { return <WorkspaceLayout><div className="space-y-4"><div className="h-44 animate-pulse rounded-xl bg-white" /><div className="grid grid-cols-3 gap-3">{[1, 2, 3].map((item) => <div key={item} className="h-28 animate-pulse rounded-xl bg-white" />)}</div></div></WorkspaceLayout>; }
