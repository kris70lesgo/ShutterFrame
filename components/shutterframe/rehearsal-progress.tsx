"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import type { RehearsalStage } from "@/lib/rehearsal-engine/stages";

const stageColors = ["#F6C143", "#F3AA3B", "#F07542", "#EA5455", "#EA5455", "#EA5455", "#EA5455", "#EA5455"];
const positions = [7, 19.3, 31.6, 43.9, 56.2, 68.5, 80.8, 93];
const sparkles = [[-28, -23], [28, -18], [34, 14], [-21, 29], [-35, 8]] as const;

function easeOutQuart(x: number) { return 1 - Math.pow(1 - x, 4); }

function stageTarget(stages: RehearsalStage[]) {
  const activeIndex = stages.findIndex((stage) => stage.state === "current" || stage.state === "warning" || stage.state === "blocked" || stage.state === "failed");
  if (activeIndex >= 0) return positions[activeIndex] ?? 0;
  const completeCount = stages.filter((stage) => stage.state === "completed").length;
  if (completeCount >= stages.length) return 100;
  return completeCount ? positions[Math.min(completeCount - 1, positions.length - 1)]! : 0;
}

function progressIndex(progress: number, stageCount: number) {
  let reachedIndex = -1;
  for (let index = positions.length - 1; index >= 0; index -= 1) {
    if (progress >= positions[index]!) {
      reachedIndex = index;
      break;
    }
  }
  if (progress >= 99 && stageCount > 0) return stageCount - 1;
  return Math.max(reachedIndex, 0);
}

function displayTitle(label: string) {
  const words = label.split(" ");
  return words.length > 1 ? `${words.slice(0, -1).join(" ")}\n${words.at(-1)}` : label;
}

/** The supplied progress choreography, driven only by persisted run evidence. */
export function RehearsalProgress({ stages }: { stages: RehearsalStage[] }) {
  const signature = useMemo(() => stages.map((stage) => `${stage.key}:${stage.state}`).join("|"), [stages]);
  const target = useMemo(() => stageTarget(stages), [stages]);
  const [progressPercent, setProgressPercent] = useState(0);
  const [reachedStages, setReachedStages] = useState<Set<number>>(new Set());
  const [isFinished, setIsFinished] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [isStarted, setIsStarted] = useState(false);
  const progressRef = useRef(0);
  const hasPlayed = useRef(false);
  const current = stages.find((stage) => stage.state === "current" || stage.state === "warning" || stage.state === "blocked" || stage.state === "failed") ?? stages.at(-1);
  const targetIndex = Math.max(stages.indexOf(current ?? stages[0]!), 0);
  const visibleIndex = progressIndex(progressPercent, stages.length);
  const visibleStage = stages[Math.min(visibleIndex, stages.length - 1)] ?? current;

  useEffect(() => {
    setIsStarted(true);
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    if (mediaQuery.matches) {
      progressRef.current = target;
      setProgressPercent(target);
      setReachedStages(new Set(positions.map((position, index) => position <= target ? index : -1).filter((index) => index >= 0)));
      setIsFinished(true);
      return;
    }
    const from = progressRef.current;
    const duration = hasPlayed.current ? 460 : 1900;
    hasPlayed.current = true;
    setIsFinished(false);
    let startedAt: number | null = null;
    let frame = 0;
    const animate = (timestamp: number) => {
      if (startedAt === null) startedAt = timestamp;
      const raw = Math.min((timestamp - startedAt) / duration, 1);
      const next = from + ((target - from) * easeOutQuart(raw));
      progressRef.current = next;
      setProgressPercent(next);
      setReachedStages((previous) => {
        const reached = new Set(previous);
        positions.forEach((position, index) => { if (next >= position) reached.add(index); });
        return reached;
      });
      if (raw < 1) frame = requestAnimationFrame(animate);
      else setIsFinished(true);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [signature, target]);

  return <section className="dashboard-card overflow-hidden px-6 py-6 sm:px-10" aria-labelledby="progress-heading">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div><p className="dashboard-kicker">Run execution</p><h2 id="progress-heading" className="mt-1 text-xl font-bold tracking-[-.03em] text-[#2C3135] sm:text-2xl">Rehearsal progress</h2><p className={`mt-2 text-sm text-[#8A99A2] transition-opacity duration-700 ${isStarted ? "opacity-100" : "opacity-0"}`}>Evidence-driven milestones · Step {Math.min((isFinished ? targetIndex : visibleIndex) + 1, stages.length)} of {stages.length}</p></div>
      <div className={`min-w-0 max-w-full text-left transition-all duration-700 sm:max-w-[280px] sm:text-right ${isStarted ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}><p className="text-xs font-medium uppercase tracking-[.14em] text-[#8A99A2]">Current</p><p className={`mt-1 truncate text-lg font-semibold ${isFinished && !reducedMotion ? "sf-scale-finish" : ""}`} style={{ color: stageColors[Math.min(isFinished ? targetIndex : visibleIndex, stageColors.length - 1)] }}>{(isFinished ? current : visibleStage)?.label ?? "Waiting to start"}</p></div>
    </div>
    <div className="relative mx-10 mt-8 h-[190px] sm:mx-14" role="progressbar" aria-label="Rehearsal progress" aria-valuemin={0} aria-valuemax={stages.length} aria-valuenow={reachedStages.size}>
      <div className="absolute left-0 right-0 top-[15px] h-5 rounded-full bg-[#EEF3F6] sm:top-[24px] sm:h-6" />
      <div className={`absolute left-0 top-[15px] h-5 rounded-full sm:top-[24px] sm:h-6 ${isFinished && !reducedMotion ? "sf-glow-finish" : ""}`} style={{ width: `${progressPercent}%`, background: "linear-gradient(to right, #F6C143 0%, #F3AA3B 30%, #F07542 60%, #EA5455 100%)", backgroundSize: progressPercent > 0 ? `${10000 / progressPercent}% 100%` : "100% 100%", backgroundRepeat: "no-repeat" }} />
      {stages.map((stage, index) => {
        const reached = reachedStages.has(index);
        const color = stageColors[index] ?? "#EA5455";
        return <div key={stage.key} className="absolute top-0 z-10 flex w-0 flex-col items-center" style={{ left: `${positions[index] ?? 96}%` }}>
          <div className={`relative flex size-[56px] -translate-x-1/2 items-center justify-center rounded-full bg-white sm:size-[76px] ${reached && !reducedMotion ? "sf-pop" : ""}`}>
            {reached && !reducedMotion ? <div className="pointer-events-none absolute left-1/2 top-1/2">{sparkles.map(([x, y], sparkleIndex) => <span key={sparkleIndex} className="sf-sparkle absolute size-1.5 rounded-full" style={{ backgroundColor: color, "--tx": `${x}px`, "--ty": `${y}px`, animationDelay: `${sparkleIndex * 38}ms` } as React.CSSProperties} />)}</div> : null}
            <div className="flex size-[48px] items-center justify-center rounded-full transition-colors duration-300 sm:size-[64px]" style={{ backgroundColor: reached ? color : "#EEF3F6" }}><StarIcon className={`size-5 transition-opacity duration-300 sm:size-8 ${reached && !reducedMotion ? "sf-star-pop" : ""}`} style={{ color: reached ? "white" : "#AAB5BA", opacity: reached ? 1 : .8 }} /></div>
          </div>
          <div className="mt-3 w-[82px] -translate-x-1/2 text-center sm:mt-4 sm:w-[116px]"><p className="whitespace-pre-line text-[11px] font-normal leading-tight transition-colors duration-300 sm:text-base" style={{ color: reached ? color : "#AAB5BA" }}>{displayTitle(stage.label)}</p><p className="mt-1 text-[10px] sm:mt-2 sm:text-xs" style={{ color: reached ? color : "#AAB5BA", opacity: reached ? .7 : .8 }}>{reached ? "Complete" : "Pending"}</p></div>
        </div>;
      })}
    </div>
    <style>{`@keyframes sf-pop{0%{transform:translateX(-50%) scale(1)}45%{transform:translateX(-50%) scale(1.15)}70%{transform:translateX(-50%) scale(.96)}100%{transform:translateX(-50%) scale(1)}}@keyframes sf-star-pop{0%{transform:scale(.8) rotate(-8deg)}45%{transform:scale(1.18) rotate(5deg)}100%{transform:scale(1) rotate(0)}}@keyframes sf-sparkle{0%{opacity:0;transform:translate(-50%,-50%) scale(.4)}20%{opacity:1;transform:translate(calc(-50% + var(--tx)),calc(-50% + var(--ty))) scale(1)}100%{opacity:0;transform:translate(calc(-50% + var(--tx) * 1.5),calc(-50% + var(--ty) * 1.5)) scale(0)}}@keyframes sf-glow{0%{filter:brightness(1)}50%{filter:brightness(1.15) drop-shadow(0 0 8px rgba(234,84,85,.4))}100%{filter:brightness(1)}}@keyframes sf-scale{0%{transform:scale(1)}50%{transform:scale(1.025)}100%{transform:scale(1)}}.sf-pop{animation:sf-pop 400ms cubic-bezier(.34,1.56,.64,1) forwards}.sf-star-pop{animation:sf-star-pop 400ms cubic-bezier(.34,1.56,.64,1) forwards}.sf-sparkle{animation:sf-sparkle 600ms ease-out forwards}.sf-glow-finish{animation:sf-glow 400ms ease-out forwards}.sf-scale-finish{animation:sf-scale 400ms ease-out forwards}@media (prefers-reduced-motion:reduce){.sf-pop,.sf-star-pop,.sf-sparkle,.sf-glow-finish,.sf-scale-finish{animation:none!important}}`}</style>
  </section>;
}

function StarIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <svg viewBox="0 0 24 24" className={className} style={style} xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path fill="currentColor" d="M12 2.5L14.85 8.75L21.5 9.5L16.5 14.1L17.9 20.5L12 17.1L6.1 20.5L7.5 14.1L2.5 9.5L9.15 8.75L12 2.5Z" /></svg>;
}
