import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type ProgressStep = {
  label: string;
  detail: string;
  state: "complete" | "active" | "pending";
};

/** Read-only workflow progress. State is supplied by the orchestration layer. */
export function ProgressIndicator({ steps }: { steps: readonly ProgressStep[] }) {
  const activeIndex = steps.findIndex(({ state }) => state === "active");
  const reachedCount = activeIndex >= 0 ? activeIndex + 1 : steps.filter(({ state }) => state === "complete").length;
  const reachedSpan = steps.length > 1 ? ((Math.max(reachedCount - 1, 0) / (steps.length - 1)) * 100).toFixed(4) : "0";

  return (
    <div className="min-w-[760px]" aria-label="Rehearsal stages">
      <div className="relative">
        <div aria-hidden="true" className="absolute left-[7.1429%] right-[7.1429%] top-4 h-px bg-[#d3dde7]" />
        {reachedCount > 0 ? <div aria-hidden="true" className="absolute top-0 z-[1] h-8 rounded-full bg-[#22bb62] shadow-[0_2px_5px_rgba(34,187,98,.18)]" style={{ left: "calc(7.1429% - 14px)", width: `calc(${reachedSpan}% + 28px)` }} /> : null}
        <ol className="relative z-[2] grid" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
          {steps.map(({ label, detail, state }, index) => (
          <li key={label} className="flex min-w-0 flex-col items-center text-center">
            <span className={cn("grid size-4 place-items-center rounded-full border-2 border-white", index < reachedCount ? "bg-white text-[#1d9c4f]" : "bg-[#cbd5e1] text-transparent", state === "active" && "ring-2 ring-[#22bb62]/20")} aria-current={state === "active" ? "step" : undefined}>
              {state === "complete" ? <Check size={10} strokeWidth={3} /> : null}
            </span>
            <span className="mt-5 max-w-[120px] text-xs font-semibold leading-4 text-[#435166]">{label}</span>
            <span className={cn("mt-1 text-xs", state === "pending" ? "text-[#9aa5b5]" : "text-[#68768b]")}>{detail}</span>
          </li>
        ))}
        </ol>
      </div>
    </div>
  );
}
