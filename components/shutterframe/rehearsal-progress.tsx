const steps = [
  ["PR fetched", "00:00:05", "complete"], ["Branch created", "00:00:32", "complete"], ["Sandbox started", "00:01:12", "complete"], ["Migration applied", "00:03:15", "active"], ["Integrity checks", "Pending", "pending"], ["Rollback test", "Pending", "pending"], ["Awaiting approval", "Pending", "pending"],
] as const;

export function RehearsalProgress() {
  return <section className="dashboard-card overflow-hidden" aria-labelledby="progress-heading"><div className="border-b border-[#e7edf3] px-5 py-4"><h2 id="progress-heading" className="text-sm font-bold tracking-[-0.015em]">Rehearsal progress</h2></div><div className="overflow-x-auto px-5 py-6"><ol className="progress-track min-w-[850px]">{steps.map(([title, time, state], index) => <li key={title} className="relative flex-1 text-center"><span className={`step-dot ${state}`} aria-label={`${title}: ${state}`}>{state === "complete" ? "✓" : index + 1}</span><p className="mt-3 text-xs font-medium text-[#3f4c60]">{title}</p><p className={`mt-1 text-xs ${state === "pending" ? "text-[#8d98a8]" : "text-[#657288]"}`}>{time}</p></li>)}</ol></div></section>;
}
