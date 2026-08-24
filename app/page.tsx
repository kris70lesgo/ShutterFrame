import { ArrowDown, GitBranch, ScanSearch } from "lucide-react";
import { SystemStatusPanel } from "@/components/shutterframe/system-status";
import { serverEnv } from "@/lib/env/server";
import { checkTrueForgeHealth } from "@/lib/trueforge/health";

export default async function Home() {
  const trueforge = await checkTrueForgeHealth();
  const status = {
    trueforgeReachable: trueforge.reachable,
    neonConfigured: serverEnv.neonConfigured,
    daytonaConfigured: serverEnv.daytonaConfigured,
    githubConfigured: serverEnv.githubConfigured,
    modelConfigured: serverEnv.openAiConfigured,
  };

  return (
    <main className="min-h-screen px-6 py-8 sm:px-10 lg:px-16 lg:py-12">
      <header className="mx-auto flex max-w-6xl items-center justify-between border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <span className="grid size-9 place-items-center border border-amber-300/50 bg-amber-300 text-slate-950"><ScanSearch size={19} /></span>
          <span className="font-mono text-sm font-bold tracking-[0.12em] text-slate-100">SHUTTERFRAME</span>
        </div>
        <span className="font-mono text-xs text-slate-500">MIGRATION REHEARSAL / 0.1</span>
      </header>

      <div className="mx-auto grid max-w-6xl gap-10 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-24">
        <section className="self-center">
          <p className="eyebrow">Before production</p>
          <h1 className="mt-5 max-w-3xl text-5xl font-semibold leading-[0.98] tracking-[-0.055em] text-white sm:text-6xl">
            Migrations should <span className="text-amber-300">prove</span> they are safe.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-slate-400">
            ShutterFrame rehearses a proposed PostgreSQL migration in an isolated Neon branch, records deterministic evidence, then stops for human approval.
          </p>
          <div className="mt-11 flex flex-wrap items-center gap-x-5 gap-y-4 font-mono text-xs uppercase tracking-[0.12em] text-slate-400">
            <span className="flex items-center gap-2"><GitBranch size={15} className="text-amber-300" /> Pull request</span>
            <ArrowDown size={14} className="text-slate-700" />
            <span>Isolated branch</span>
            <ArrowDown size={14} className="text-slate-700" />
            <span>Evidence + approval</span>
          </div>
          <p className="mt-10 border-l-2 border-amber-300 pl-4 text-sm leading-6 text-slate-500">
            Foundation mode: integrations are surfaced honestly. No migration can run from this page yet.
          </p>
        </section>
        <SystemStatusPanel status={status} />
      </div>
    </main>
  );
}
