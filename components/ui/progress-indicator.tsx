export type ProgressStep = {
  label: string;
  detail: string;
  state: "complete" | "active" | "pending";
};

/** A compact, read-only representation of server-owned workflow progress. */
export function ProgressIndicator({ steps }: { steps: readonly ProgressStep[] }) {
  const activeIndex = steps.findIndex(({ state }) => state === "active");
  const reachedCount = activeIndex >= 0 ? activeIndex + 1 : steps.filter(({ state }) => state === "complete").length;
  const futureCount = Math.max(steps.length - reachedCount, 0);

  return (
    <div className="flex items-center justify-center gap-5" role="progressbar" aria-label="Rehearsal progress" aria-valuemin={0} aria-valuemax={steps.length} aria-valuenow={reachedCount}>
      {reachedCount > 0 ? <div className="flex items-center gap-5 rounded-full bg-[#54ce83] px-5 py-3" aria-label={`${reachedCount} stages reached`}>{Array.from({ length: reachedCount }, (_, index) => <span key={index} aria-hidden="true" className="size-3.5 rounded-full bg-white" />)}</div> : null}
      {Array.from({ length: futureCount }, (_, index) => <span key={index} aria-hidden="true" className="size-3.5 rounded-full bg-[#d2d7df]" />)}
    </div>
  );
}
