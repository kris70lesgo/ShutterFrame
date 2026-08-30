import { Box, BrainCircuit, Database, Github, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type SystemStatus = {
  trueforgeReachable: boolean;
  neonConfigured: boolean;
  daytonaConfigured: boolean;
  githubConfigured: boolean;
  modelConfigured: boolean;
};

const services = [
  { key: "trueforgeReachable", label: "TrueForge", note: "Agent harness", icon: BrainCircuit },
  { key: "neonConfigured", label: "Neon", note: "Branch database", icon: Database },
  { key: "daytonaConfigured", label: "Daytona", note: "Sandbox", icon: Box },
  { key: "githubConfigured", label: "GitHub", note: "Pull request source", icon: Github },
  { key: "modelConfigured", label: "DeepSeek", note: "Model through TrueForge", icon: ShieldCheck },
] as const;

export function SystemStatusPanel({ status }: { status: SystemStatus }) {
  return (
    <section aria-labelledby="system-heading" className="panel">
      <div className="mb-7 flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Control surface</p>
          <h2 id="system-heading" className="mt-2 text-2xl font-semibold text-white">System readiness</h2>
        </div>
        <span className="font-mono text-xs text-slate-500">LOCAL / DEV</span>
      </div>
      <div className="divide-y divide-slate-800/80">
        {services.map(({ key, label, note, icon: Icon }) => {
          const ready = status[key];
          return (
            <div key={key} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
              <span className="grid size-9 place-items-center border border-slate-700 bg-slate-900 text-slate-400">
                <Icon aria-hidden="true" size={17} strokeWidth={1.6} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-100">{label}</p>
                <p className="text-sm text-slate-500">{note}</p>
              </div>
              <Badge variant={ready ? "ready" : "pending"}>{ready ? "Ready" : "Not configured"}</Badge>
            </div>
          );
        })}
      </div>
    </section>
  );
}
