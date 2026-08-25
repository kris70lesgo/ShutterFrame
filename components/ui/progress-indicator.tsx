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

  return (
    <ol className="min-w-[760px]" aria-label="Rehearsal stages">
      <div className="relative flex items-center px-[7.15%]">
        <div aria-hidden="true" className="absolute left-[7.15%] right-[7.15%] h-px bg-[#d3dde7]" />
        {reachedCount > 0 ? <div aria-hidden="true" className="absolute left-[7.15%] z-[1] flex h-7 items-center justify-around rounded-full bg-[#22bb62] px-2 shadow-[0_2px_5px_rgba(34,187,98,.18)]" style={{ width: `calc(${(reachedCount / steps.length) * 85.7}% + 1px)` }} /> : null}
        {steps.map(({ label, detail, state }, index) => (
          <li key={label} className="relative z-[2] flex flex-1 flex-col items-center text-center">
            <span className={cn("grid size-4 place-items-center rounded-full border-2 border-white", index < reachedCount ? "bg-white text-[#1d9c4f]" : "bg-[#cbd5e1] text-transparent", state === "active" && "ring-2 ring-[#22bb62]/20")} aria-current={state === "active" ? "step" : undefined}>
              {state === "complete" ? <Check size={10} strokeWidth={3} /> : null}
            </span>
            <span className="mt-4 text-xs font-semibold text-[#435166]">{label}</span>
            <span className={cn("mt-1 text-xs", state === "pending" ? "text-[#9aa5b5]" : "text-[#68768b]")}>{detail}</span>
          </li>
        ))}
      </div>
    </ol>
  );
}
