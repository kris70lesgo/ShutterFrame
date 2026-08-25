import { Clock3, ExternalLink, Hourglass, Layers3 } from "lucide-react";

export function ActiveRehearsal() {
  return (
    <section className="dashboard-card px-5 py-5 sm:px-6" aria-labelledby="active-rehearsal-heading">
      <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
        <div className="min-w-0">
          <p className="dashboard-kicker">Active rehearsal</p>
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-2"><h1 id="active-rehearsal-heading" className="text-xl font-semibold tracking-[-0.035em] text-[#172033] sm:text-2xl">Add user_preferences table and backfill</h1><a href="#feature-1287" className="inline-flex items-center gap-1 rounded bg-[#e8f1ff] px-2 py-1 text-xs font-bold text-[#2561ad]">FEATURE–1287 <ExternalLink size={12} /></a></div>
          <p className="mt-2 text-sm text-[#657288]">Triggered by <strong className="font-semibold text-[#435067]">alex.kim</strong> via PR #1287 <span className="text-[#8390a2]">•</span></p>
          <p className="mt-2 text-xs font-medium text-[#738095]">Started 8 mins ago <span className="mx-2 text-[#c3ccd8]">•</span> Neon Branch: neon/pr-1287-773a <span className="mx-2 text-[#c3ccd8]">•</span> Sandbox: sf-sandbox-773a</p>
        </div>
        <dl className="grid grid-cols-2 divide-x divide-[#e2e8f0] border-y border-[#e7edf3] sm:grid-cols-4 sm:border-y-0">
          <Metric icon={Clock3} label="Elapsed time" value="00:08:42" />
          <Metric icon={Hourglass} label="Est. remaining" value="~00:06:18" />
          <Metric icon={Layers3} label="Environment" value="Neon (us-east-1)" compact />
          <Metric label="Initiated by" value="Alex Kim" initials="AK" compact />
        </dl>
      </div>
    </section>
  );
}

function Metric({ icon: Icon, label, value, initials, compact = false }: { icon?: typeof Clock3; label: string; value: string; initials?: string; compact?: boolean }) {
  return <div className="min-w-[145px] px-4 py-2 first:pl-0 last:pr-0 sm:min-w-[156px]"><dt className="dashboard-kicker">{label}</dt><dd className={`mt-2 flex items-center gap-2 ${compact ? "text-sm" : "text-base"} font-medium text-[#354157]`}>{initials ? <span className="grid size-6 place-items-center rounded-full bg-[#e6edf8] text-[10px] font-bold text-[#38659a]">{initials}</span> : Icon ? <Icon size={18} className="text-[#2b647c]" strokeWidth={1.8} /> : null}{value}</dd></div>;
}
