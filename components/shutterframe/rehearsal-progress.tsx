"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

const progressColors = ["#f6c143", "#f3aa3b", "#f07542", "#ea5455", "#dc5a66", "#c65a78", "#a4608e", "#7e6eaa"];

function stageColor(stage: RehearsalStage, index: number) {
  if (stage.state === "warning") return "#f3aa3b";
  if (stage.state === "blocked" || stage.state === "failed") return "#ea5455";
  return progressColors[index] ?? progressColors.at(-1)!;
}

export function RehearsalProgress({ stages }: { stages: RehearsalStage[] }) {
  const stageSignature = useMemo(() => stages.map((stage) => `${stage.key}:${stage.state}`).join("|"), [stages]);
  const [previousSignature, setPreviousSignature] = useState(stageSignature);
  const [newlyReached, setNewlyReached] = useState<Set<string>>(new Set());
  const targetVisibleCount = useMemo(() => {
    const currentIndex = stages.findIndex((stage) => stage.state === "current" || stage.state === "blocked" || stage.state === "failed" || stage.state === "warning");
    if (currentIndex >= 0) return currentIndex + 1;
    return stages.filter((stage) => stage.state === "completed").length;
  }, [stages]);
  const [visibleCount, setVisibleCount] = useState(0);
  const visibleCountRef = useRef(0);
  const hasPlayedInitialSequence = useRef(false);

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

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const setVisible = (count: number) => { visibleCountRef.current = count; setVisibleCount(count); };
    if (reducedMotion) { setVisible(targetVisibleCount); return; }

    let timer: number | undefined;
    const from = hasPlayedInitialSequence.current ? visibleCountRef.current : 0;
    hasPlayedInitialSequence.current = true;
    setVisible(from);
    const reveal = (next: number) => {
      setVisible(next);
      if (next < targetVisibleCount) timer = window.setTimeout(() => reveal(next + 1), 220);
    };
    if (from < targetVisibleCount) timer = window.setTimeout(() => reveal(from + 1), 80);
    return () => { if (timer) window.clearTimeout(timer); };
  }, [stageSignature, targetVisibleCount]);

  const completed = stages.filter((stage) => stage.state === "completed").length;
  const current = stages.find((stage) => stage.state === "current") ?? stages.find((stage) => stage.state === "blocked" || stage.state === "failed" || stage.state === "warning") ?? stages.find((stage) => stage.state === "completed");
  const currentIndex = Math.max(stages.findIndex((stage) => stage.state === "current" || stage.state === "blocked" || stage.state === "failed" || stage.state === "warning"), completed - 1, 0);

  return <section className="dashboard-card overflow-hidden px-5 py-6 sm:px-7" aria-labelledby="progress-heading">
    <div className="flex items-start justify-between gap-5"><div><p className="dashboard-kicker">Run execution</p><h2 id="progress-heading" className="mt-1 text-base font-bold tracking-[-0.02em] text-[#1c2940]">Rehearsal progress</h2><p className="mt-1 text-xs text-[#748195]">{current ? `${current.label} · ${stateCopy[current.state].toLowerCase()}` : "Waiting for engine evidence"}</p></div><span className="rounded-full border border-[#dfe8e4] bg-[#f3fbf6] px-2.5 py-1 text-[11px] font-semibold text-[#2b7b50]">{completed}/{stages.length} complete</span></div>
    <div className="relative mx-auto mt-7 max-w-4xl px-2 sm:px-5" role="progressbar" aria-label="Rehearsal progress" aria-valuemin={0} aria-valuemax={stages.length} aria-valuenow={completed}>
      <div className="absolute left-5 right-5 top-5 h-2 rounded-full bg-[#eef3f6] sm:left-10 sm:right-10" />
      <div className="absolute left-5 top-5 h-2 rounded-full bg-gradient-to-r from-[#f6c143] via-[#f07542] to-[#ea5455] transition-[width] duration-200 ease-out sm:left-10" style={{ width: `calc((100% - 5rem) * ${Math.max(visibleCount - 1, 0) / Math.max(stages.length - 1, 1)})` }} />
      <div className="relative grid grid-cols-8 gap-1">{stages.map((stage, index) => {
        const reached = index < visibleCount;
        const currentStage = index === currentIndex && stage.state !== "completed";
        return <div key={stage.key} className={`relative flex min-w-0 flex-col items-center ${newlyReached.has(stage.key) ? "motion-safe:animate-[milestone-arrive_.55s_cubic-bezier(.34,1.56,.64,1)_both]" : ""}`}>
          <div className={`flex size-10 items-center justify-center rounded-full border-4 border-white transition-colors sm:size-12 ${currentStage && reached ? "ring-2 ring-[#f3b153] ring-offset-2" : ""}`} style={{ backgroundColor: reached ? stageColor(stage, index) : "#eef3f6" }}>
            <Star key={`${stage.key}-${reached ? "shown" : "hidden"}`} className={`size-4 transition-all sm:size-5 ${reached ? "fill-white text-white motion-safe:animate-[star-pop_.5s_cubic-bezier(.34,1.56,.64,1)_both]" : "text-[#aab5ba]"}`} />
          </div>
          <p className="mt-3 hidden max-w-20 text-center text-[10px] font-semibold leading-3 text-[#526178] sm:block">{stage.label}</p>
          <p className="mt-1 hidden text-[10px] text-[#8996a7] sm:block">{stateCopy[stage.state]}</p>
        </div>;
      })}</div>
    </div>
    <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-4 border-t border-[#edf1f5] pt-4 sm:hidden">{stages.map((stage, index) => <div key={stage.key} className="min-w-0"><div className="flex items-center gap-2"><span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: stage.state === "pending" ? "#d5dce6" : stageColor(stage, index) }} /><p className="truncate text-xs font-semibold text-[#405067]">{stage.label}</p></div><p className="mt-1 pl-4 text-[11px] text-[#7d8a9c]">{stateCopy[stage.state]}</p></div>)}</div>
    <style>{`@keyframes milestone-arrive{0%{opacity:.25;transform:translateY(7px) scale(.85)}100%{opacity:1;transform:translateY(0) scale(1)}}@keyframes star-pop{0%{transform:scale(.45) rotate(-18deg)}70%{transform:scale(1.2) rotate(7deg)}100%{transform:scale(1) rotate(0)}}`}</style>
  </section>;
}
