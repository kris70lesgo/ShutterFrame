"use client";

import { useEffect, useMemo, useState } from "react";
import { Star } from "lucide-react";
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
  const currentIndex = Math.max(stages.findIndex((stage) => stage.state === "current" || stage.state === "blocked" || stage.state === "failed" || stage.state === "warning"), completed - 1, 0);

  return <section className="dashboard-card overflow-hidden px-5 py-6 sm:px-7" aria-labelledby="progress-heading">
    <div className="flex items-start justify-between gap-5"><div><p className="dashboard-kicker">Run execution</p><h2 id="progress-heading" className="mt-1 text-base font-bold tracking-[-0.02em] text-[#1c2940]">Rehearsal progress</h2><p className="mt-1 text-xs text-[#748195]">{current ? `${current.label} · ${stateCopy[current.state].toLowerCase()}` : "Waiting for engine evidence"}</p></div><span className="rounded-full border border-[#dfe8e4] bg-[#f3fbf6] px-2.5 py-1 text-[11px] font-semibold text-[#2b7b50]">{completed}/{stages.length} complete</span></div>
    <div className="relative mx-auto mt-7 max-w-4xl px-2 sm:px-5" role="progressbar" aria-label="Rehearsal progress" aria-valuemin={0} aria-valuemax={stages.length} aria-valuenow={completed}>
      <div className="absolute left-5 right-5 top-5 h-2 rounded-full bg-[#eef3f6] sm:left-10 sm:right-10" />
      <div className="relative grid grid-cols-8 gap-1">{stages.map((stage, index) => {
        const reached = stage.state !== "pending";
        const currentStage = index === currentIndex && stage.state !== "completed";
        return <div key={stage.key} className={`relative flex min-w-0 flex-col items-center ${newlyReached.has(stage.key) ? "motion-safe:animate-[milestone-arrive_.55s_cubic-bezier(.34,1.56,.64,1)_both]" : ""}`}>
          <div className={`flex size-10 items-center justify-center rounded-full border-4 border-white transition-colors sm:size-12 ${currentStage ? "ring-2 ring-[#92c5ff] ring-offset-2" : ""}`} style={{ backgroundColor: reached ? stageColor(stage) : "#eef3f6" }}>
            <Star className={`size-4 transition-all sm:size-5 ${reached ? "fill-white text-white" : "text-[#aab5ba]"} ${newlyReached.has(stage.key) ? "motion-safe:animate-[star-pop_.5s_cubic-bezier(.34,1.56,.64,1)_both]" : ""}`} />
          </div>
          <p className="mt-3 hidden max-w-20 text-center text-[10px] font-semibold leading-3 text-[#526178] sm:block">{stage.label}</p>
          <p className="mt-1 hidden text-[10px] text-[#8996a7] sm:block">{stateCopy[stage.state]}</p>
        </div>;
      })}</div>
    </div>
    <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-4 border-t border-[#edf1f5] pt-4 sm:hidden">{stages.map((stage) => <div key={stage.key} className="min-w-0"><div className="flex items-center gap-2"><span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: stageColor(stage) }} /><p className="truncate text-xs font-semibold text-[#405067]">{stage.label}</p></div><p className="mt-1 pl-4 text-[11px] text-[#7d8a9c]">{stateCopy[stage.state]}</p></div>)}</div>
    <style>{`@keyframes milestone-arrive{0%{opacity:.25;transform:translateY(7px) scale(.85)}100%{opacity:1;transform:translateY(0) scale(1)}}@keyframes star-pop{0%{transform:scale(.45) rotate(-18deg)}70%{transform:scale(1.2) rotate(7deg)}100%{transform:scale(1) rotate(0)}}`}</style>
  </section>;
}
