"use client";

import { useEffect, useMemo, useState } from "react";
import type { RehearsalStage } from "@/lib/rehearsal-engine/stages";

const stateCopy: Record<RehearsalStage["state"], string> = {
  completed: "Complete",
  current: "In progress",
  pending: "Pending",
  warning: "Needs review",
  blocked: "Blocked",
  failed: "Failed",
};

function stageColor(stage: RehearsalStage) {
  if (stage.state === "completed") return "#46c982";
  if (stage.state === "current") return "#3086f3";
  if (stage.state === "warning") return "#e5a222";
  if (stage.state === "blocked" || stage.state === "failed") return "#e35c5c";
  return "#d5dce6";
}

export function RehearsalProgress({ stages }: { stages: RehearsalStage[] }) {
  const stageSignature = useMemo(() => stages.map((stage) => `${stage.key}:${stage.state}`).join("|"), [stages]);
  const [previousSignature, setPreviousSignature] = useState(stageSignature);
  const [newlyReached, setNewlyReached] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (previousSignature === stageSignature) return;
    const previous = new Map(previousSignature.split("|").map((entry) => {
      const separator = entry.indexOf(":");
      return [entry.slice(0, separator), entry.slice(separator + 1)] as const;
    }));
    const reached = stages.filter((stage) => previous.get(stage.key) !== stage.state && stage.state !== "pending").map((stage) => stage.key);
    setNewlyReached(new Set(reached));
    setPreviousSignature(stageSignature);
    const timeout = window.setTimeout(() => setNewlyReached(new Set()), 650);
    return () => window.clearTimeout(timeout);
  }, [previousSignature, stageSignature, stages]);

  const completed = stages.filter((stage) => stage.state === "completed").length;
  const current = stages.find((stage) => stage.state === "current") ?? stages.find((stage) => stage.state === "blocked" || stage.state === "failed" || stage.state === "warning") ?? stages.find((stage) => stage.state === "completed");
  const activeDots = Math.max(completed + (stages.some((stage) => stage.state === "current") ? 1 : 0), 1);

  return <section className="dashboard-card overflow-hidden px-5 py-6 sm:px-7" aria-labelledby="progress-heading">
    <div className="flex items-start justify-between gap-5"><div><p className="dashboard-kicker">Run execution</p><h2 id="progress-heading" className="mt-1 text-base font-bold tracking-[-0.02em] text-[#1c2940]">Rehearsal progress</h2><p className="mt-1 text-xs text-[#748195]">{current ? `${current.label} · ${stateCopy[current.state].toLowerCase()}` : "Waiting for engine evidence"}</p></div><span className="rounded-full border border-[#dfe8e4] bg-[#f3fbf6] px-2.5 py-1 text-[11px] font-semibold text-[#2b7b50]">{completed}/{stages.length} complete</span></div>
    <div className="flex min-h-28 items-center justify-center py-5" role="progressbar" aria-label="Rehearsal progress" aria-valuemin={0} aria-valuemax={stages.length} aria-valuenow={completed}>
      <div className="flex items-center gap-4 sm:gap-5">
        <div className="flex items-center gap-3 rounded-full bg-[#52cf88] px-4 py-3 shadow-[0_8px_20px_rgba(82,207,136,.16)]">
          {Array.from({ length: activeDots }, (_, index) => <span key={index} className="size-3 rounded-full bg-white motion-safe:animate-[progress-dot_.45s_cubic-bezier(.34,1.56,.64,1)_both]" style={{ animationDelay: `${index * 55}ms` }} />)}
        </div>
        {Array.from({ length: Math.max(stages.length - activeDots, 0) }, (_, index) => <span key={index} className="size-3 rounded-full bg-[#d5dce6]" />)}
      </div>
    </div>
    <div className="grid grid-cols-2 gap-x-5 gap-y-4 border-t border-[#edf1f5] pt-4 sm:grid-cols-4">{stages.map((stage) => <div key={stage.key} className={`min-w-0 ${newlyReached.has(stage.key) ? "motion-safe:animate-[milestone-arrive_.55s_cubic-bezier(.34,1.56,.64,1)_both]" : ""}`}><div className="flex items-center gap-2"><span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: stageColor(stage) }} /><p className="truncate text-xs font-semibold text-[#405067]">{stage.label}</p></div><p className="mt-1 pl-4 text-[11px] text-[#7d8a9c]">{stateCopy[stage.state]}</p></div>)}</div>
    <style>{`@keyframes progress-dot{0%{opacity:0;transform:scale(.35)}100%{opacity:1;transform:scale(1)}}@keyframes milestone-arrive{0%{opacity:.35;transform:translateY(5px) scale(.96)}100%{opacity:1;transform:translateY(0) scale(1)}}`}</style>
  </section>;
}
