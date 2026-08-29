import { ProgressIndicator, type ProgressStep } from "@/components/ui/progress-indicator";
import type { RehearsalStage } from "@/lib/rehearsal-engine/stages";

function toStep(stage: RehearsalStage): ProgressStep {
  return { label: stage.label, detail: stage.state, state: stage.state === "completed" ? "complete" : stage.state === "current" ? "active" : "pending" };
}

export function RehearsalProgress({ stages }: { stages: RehearsalStage[] }) {
  const current = stages.find((stage) => stage.state === "current") ?? stages.find((stage) => stage.state === "blocked" || stage.state === "failed") ?? stages.find((stage) => stage.state === "completed");
  return <section className="dashboard-card px-5 py-6 sm:px-7" aria-labelledby="progress-heading">
    <div className="flex items-start justify-between gap-5"><div><p className="dashboard-kicker">Run execution</p><h2 id="progress-heading" className="mt-1 text-base font-bold tracking-[-0.02em] text-[#1c2940]">Rehearsal progress</h2><p className="mt-1 text-xs text-[#748195]">{current ? `${current.label} · ${current.state}` : "Waiting for engine evidence"}</p></div><span className="rounded-full border border-[#dfe8e4] bg-[#f3fbf6] px-2.5 py-1 text-[11px] font-semibold text-[#2b7b50]">{stages.filter((stage) => stage.state === "completed").length}/{stages.length} complete</span></div>
    <div className="py-8"><ProgressIndicator steps={stages.map(toStep)} /></div>
    <div className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-[#edf1f5] pt-4 sm:grid-cols-4">{stages.map((stage) => <div key={stage.key} className="min-w-0"><p className="truncate text-xs font-semibold text-[#405067]">{stage.label}</p><p className="mt-0.5 text-[11px] capitalize text-[#7d8a9c]">{stage.state}</p></div>)}</div>
  </section>;
}
