"use client";

import { ExternalLink } from "lucide-react";
import { TimerIcon } from "@/components/ui/timer-icon";
import { HourglassIcon } from "@/components/ui/hourglass-icon";
import { LayersIcon } from "@/components/ui/layers-icon";
import { UserIcon } from "@/components/ui/user-icon";

export function ActiveRehearsal() {
  return (
    <section className="relative dashboard-card !overflow-visible mt-3 px-5 py-5 sm:px-6" aria-labelledby="active-rehearsal-heading">
      {/* Active rehearsal label placed directly on top border of component */}
      <div className="absolute -top-3 left-5 inline-flex items-center gap-1.5 rounded-md border border-[#e0e7ef] bg-white px-2.5 py-0.5 shadow-xs">
        <span className="size-1.5 rounded-full bg-[#236a7c] animate-pulse" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748b]">Active rehearsal</span>
      </div>

      <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-center">
        <div className="min-w-0">
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 id="active-rehearsal-heading" className="text-xl font-semibold tracking-[-0.035em] text-[#172033] sm:text-2xl">
              Add user_preferences table and backfill
            </h1>
            <a href="#feature-1287" className="inline-flex items-center gap-1 rounded bg-[#e8f1ff] px-2 py-1 text-xs font-bold text-[#2561ad]">
              FEATURE–1287 <ExternalLink size={12} />
            </a>
          </div>
          <p className="mt-2 text-sm text-[#657288]">
            Triggered by <strong className="font-semibold text-[#435067]">alex.kim</strong> via PR #1287
          </p>
        </div>

        <dl className="grid grid-cols-2 divide-x divide-[#e2e8f0] border-y border-[#e7edf3] sm:grid-cols-4 sm:border-y-0">
          <div className="min-w-[145px] px-4 py-2 first:pl-0 last:pr-0 sm:min-w-[156px]">
            <dt className="dashboard-kicker">Elapsed time</dt>
            <dd className="mt-2 flex items-center gap-2 text-base font-medium text-[#354157]">
              <TimerIcon size={18} className="text-[#2b647c]" />
              00:08:42
            </dd>
          </div>

          <div className="min-w-[145px] px-4 py-2 first:pl-0 last:pr-0 sm:min-w-[156px]">
            <dt className="dashboard-kicker">Est. remaining</dt>
            <dd className="mt-2 flex items-center gap-2 text-base font-medium text-[#354157]">
              <HourglassIcon size={18} className="text-[#2b647c]" />
              ~00:06:18
            </dd>
          </div>

          <div className="min-w-[145px] px-4 py-2 first:pl-0 last:pr-0 sm:min-w-[156px]">
            <dt className="dashboard-kicker">Environment</dt>
            <dd className="mt-2 flex items-center gap-2 text-sm font-medium text-[#354157]">
              <LayersIcon size={18} className="text-[#2b647c]" />
              Neon (us-east-1)
            </dd>
          </div>

          <div className="min-w-[145px] px-4 py-2 first:pl-0 last:pr-0 sm:min-w-[156px]">
            <dt className="dashboard-kicker">Initiated by</dt>
            <dd className="mt-2 flex items-center gap-2 text-sm font-medium text-[#354157]">
              <UserIcon size={18} className="text-[#2b647c]" />
              <span className="grid size-5 place-items-center rounded-full bg-[#e6edf8] text-[9px] font-bold text-[#38659a]">AK</span>
              Alex Kim
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
