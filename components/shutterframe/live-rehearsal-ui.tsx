"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowUpRight, CheckCircle2, ChevronRight, Database, FileCode2, LoaderCircle, Plus, Shield, ShieldCheck, X, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import type { RehearsalDetail, RehearsalListItem } from "@/lib/database/rehearsal-views";
import { canReviewRun } from "@/lib/approvals/policy";
import { RehearsalProgress } from "@/components/shutterframe/rehearsal-progress";
import { EvidenceLog } from "@/components/shutterframe/evidence-log";
import { StartRehearsalForm } from "@/components/shutterframe/start-rehearsal-form";
import { NewRehearsalForm } from "@/components/shutterframe/new-rehearsal-form";

const statusStyle: Record<string, string> = {
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-200", approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  blocked: "bg-amber-50 text-amber-700 ring-amber-200", failed: "bg-rose-50 text-rose-700 ring-rose-200",
  starting: "bg-blue-50 text-blue-700 ring-blue-200", ready: "bg-blue-50 text-blue-700 ring-blue-200", branching: "bg-blue-50 text-blue-700 ring-blue-200", sandbox_starting: "bg-blue-50 text-blue-700 ring-blue-200", migration_running: "bg-blue-50 text-blue-700 ring-blue-200", validating: "bg-blue-50 text-blue-700 ring-blue-200",
};
const terminalStatuses = new Set(["completed", "blocked", "failed"]);
const activeStatuses = new Set(["starting", "ready", "branching", "sandbox_starting", "migration_running", "validating"]);

export function StatusPill({ status }: { status: string | null }) {
  const value = status ?? "queued";
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ring-1 ring-inset ${statusStyle[value] ?? "bg-slate-50 text-slate-600 ring-slate-200"}`}><span className="size-1.5 rounded-full bg-current" />{value.replaceAll("_", " ")}</span>;
}

function formatDate(value: string | null) { return value ? new Intl.DateTimeFormat("en", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value)) : "—"; }
function shortSha(value: string) { return value.slice(0, 8); }
function evidenceHas(rehearsal: RehearsalDetail, terms: string[]) { return rehearsal.evidence.some((item) => terms.some((term) => item.name.includes(term) || item.type.includes(term))); }
function elapsedTime(startedAt: string | null, completedAt: string | null) {
  if (!startedAt || !completedAt) return "—";
  const ms = Math.max(0, new Date(completedAt).getTime() - new Date(startedAt).getTime());
  if (!Number.isFinite(ms) || ms === 0) return "—";
  if (ms < 10000) return `${(ms / 1000).toFixed(2)}s`;
  return `${Math.round(ms / 1000)}s`;
}
function migrationLabel(path: string | null) {
  if (!path) return "No migration";
  return path.split("/").at(-1)?.replace(/^\d+[_-]?/, "").replace(/\.sql$/i, "").replaceAll("_", " ") ?? path;
}
function migrationEntity(path: string | null) {
  const label = migrationLabel(path);
  const createMatch = label.match(/create\s+(.+)/i);
  const dropMatch = label.match(/drop\s+(.+)/i);
  if (createMatch?.[1]) return createMatch[1].replace(/\btable\b/i, "").trim();
  if (dropMatch?.[1]) return dropMatch[1].replace(/\btable\b|\bcolumn\b/i, "").trim();
  return label;
}
function isDestructiveMigration(rehearsal: RehearsalDetail) {
  return rehearsal.runStatus === "blocked" || /(?:drop|remove|delete|truncate)/i.test(rehearsal.migrationPath ?? "");
}

export function DashboardOverview({
  items,
  featured,
}: {
  items: RehearsalListItem[];
  featured?: RehearsalDetail;
}) {
  const active = items.filter(
    (item) => item.runStatus && !terminalStatuses.has(item.runStatus)
  ).length;

  const completed = items.filter(
    (item) => item.runStatus === "completed"
  ).length;

  const blocked = items.filter(
    (item) => item.runStatus === "blocked"
  ).length;

  return (
    <div className="space-y-5">
      <section className="w-full">
        <div className="grid w-full grid-cols-1 gap-3.5 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardStatCard
            title="Active runs"
            value={String(active)}
            increaseValue={String(Math.max(active, 1))}
            description="Running now"
            variant="green"
            href="/rehearsals"
          />

          <DashboardStatCard
            title="Completed"
            value={String(completed)}
            increaseValue={String(Math.max(completed, 1))}
            description="Ready for review"
            variant="light"
            href="/rehearsals"
          />

          <DashboardStatCard
            title="Blocked"
            value={String(blocked)}
            increaseValue={String(Math.max(blocked, 0))}
            description="Needs attention"
            variant="light"
            href="/rehearsals"
          />

          <DashboardActionCard />
        </div>
      </section>

      {featured ? (
        <section className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(350px,.72fr)]">
          <RehearsalProgress stages={featured.stages} compact />
          <EvidenceLog
            logs={featured.logs}
            rehearsalId={featured.id}
          />
        </section>
      ) : null}

      <RehearsalTable
        items={items.slice(0, 8)}
        title="Recent rehearsals"
      />
    </div>
  );
}

function DashboardStatCard({ title, value, increaseValue, description, variant, href }: { title: string; value: string; increaseValue: string; description: string; variant: "green" | "light"; href: string }) {
  const isGreen = variant === "green";
  return <Link
    href={href}
    className={[
      "group relative flex h-[188px] w-full min-w-0 flex-col",
      "rounded-[26px] px-6 py-5",
      "transition-transform duration-200 hover:-translate-y-0.5",
      isGreen ? "bg-gradient-to-br from-[#155432] to-[#25844f] text-white" : "bg-white text-[#111111]",
    ].join(" ")}
  >
    <div className="flex items-start justify-between gap-3">
      <h3 className="min-w-0 text-[20px] font-medium leading-tight tracking-[-0.02em]">{title}</h3>
      <div className={["flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full", isGreen ? "bg-white text-black" : "border border-black/80 bg-white text-black"].join(" ")}>
        <ArrowUpRight size={21} strokeWidth={1.6} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </div>

    <div className="mt-3">
      <div className={["text-[54px] font-normal leading-none tracking-[-0.055em]", isGreen ? "text-[#f6f5e9]" : "text-black"].join(" ")}>{value}</div>
    </div>

    <div className="mt-auto flex min-w-0 items-center gap-2">
      <span className={["inline-flex h-[22px] shrink-0 items-center rounded-md border px-1.5", "text-[11px] font-medium", isGreen ? "border-[#c6e637] text-[#d7f44c]" : "border-[#6fa180] text-[#39744e]"].join(" ")}>{increaseValue} ▲</span>
      <span className={["truncate text-[14px] leading-none", isGreen ? "text-[#d7e444]" : "text-[#658c72]"].join(" ")}>{description}</span>
    </div>
  </Link>;
}

function DashboardActionCard() {
  return <Link href="/rehearsals" className="group flex h-[188px] w-full min-w-0 flex-col rounded-[26px] bg-white px-6 py-5 text-[#111111] transition-transform duration-200 hover:-translate-y-0.5">
    <div className="flex items-start justify-between gap-3">
      <h3 className="text-[20px] font-medium leading-tight tracking-[-0.02em]">Run a rehearsal</h3>
      <div className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full border border-black/80">
        <ArrowUpRight size={21} strokeWidth={1.6} className="transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </div>
    </div>

    <p className="mt-5 max-w-[230px] text-[14px] leading-[1.45] text-[#6b8877]">Create, run, and review pull-request migration rehearsals.</p>

    <div className="mt-auto">
      <span className="inline-flex h-[42px] items-center gap-2 rounded-full bg-[#12552f] px-5 text-[14px] font-medium text-white">
        View rehearsals
        <ChevronRight size={16} />
      </span>
    </div>
  </Link>;
}

export function RehearsalTable({ items, title = "Rehearsals" }: { items: RehearsalListItem[]; title?: string }) {
  const router = useRouter();
  const [showIntake, setShowIntake] = useState(false);
  const hasActiveRun = items.some((item) => item.runStatus && activeStatuses.has(item.runStatus));
  useEffect(() => {
    if (!hasActiveRun) return;
    const timer = window.setInterval(() => router.refresh(), 5000);
    return () => window.clearInterval(timer);
  }, [hasActiveRun, router]);
  const intake = <div role="dialog" aria-modal="true" aria-labelledby="new-rehearsal-title" className="fixed inset-0 z-50 flex items-center justify-center p-4"><button aria-label="Close new rehearsal" className="absolute inset-0 bg-[#102738]/35 backdrop-blur-[2px]" onClick={() => setShowIntake(false)} /><div className="relative w-full max-w-2xl rounded-2xl border border-[#dce6ec] bg-white p-6 shadow-[0_24px_70px_rgba(20,42,58,.22)] sm:p-7"><button aria-label="Close" type="button" onClick={() => setShowIntake(false)} className="absolute right-4 top-4 rounded-md p-1.5 text-[#718095] hover:bg-[#f1f5f7] hover:text-[#2d4050]"><X size={18} /></button><p className="dashboard-kicker">New rehearsal</p><h2 id="new-rehearsal-title" className="mt-1 text-xl font-semibold tracking-[-.03em] text-[#1d2939]">Add a pull request</h2><p className="mt-2 max-w-lg text-sm leading-6 text-[#68778a]">We will verify the exact pull-request commit and its SQL migration before any rehearsal can start.</p><NewRehearsalForm /></div></div>;
  if (!items.length) return <><section className="rounded-xl border border-dashed border-[#d8e2e9] bg-white px-6 py-16 text-center"><FileCode2 className="mx-auto size-7 text-[#7c98a5]" /><h2 className="mt-4 text-lg font-semibold text-[#243246]">Start a rehearsal</h2><p className="mt-2 text-sm text-[#738095]">Add a pull request, then review the exact migration before you run it.</p><button type="button" onClick={() => setShowIntake(true)} className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#236778] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#195766]"><Plus size={16} />New rehearsal</button></section>{showIntake ? intake : null}</>;
  return <><section className="overflow-hidden rounded-xl border border-[#e0e7ed] bg-white"><div className="flex items-center justify-between border-b border-[#e8edf1] px-5 py-4"><div><h2 className="text-sm font-semibold text-[#1d2939]">{title}</h2><span className="mt-0.5 block text-xs text-[#788599]">{items.length} shown</span></div><button type="button" onClick={() => setShowIntake(true)} className="inline-flex items-center gap-2 rounded-lg bg-[#236778] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#195766]"><Plus size={14} />New rehearsal</button></div><div className="overflow-x-auto"><table className="min-w-[1040px] w-full text-left"><thead className="bg-[#fbfcfd] text-[10px] font-semibold uppercase tracking-[.09em] text-[#788599]"><tr>{["Repository / PR", "Migration", "Commit", "Latest status", "Last run", "Created", "Action"].map((heading) => <th key={heading} className="px-5 py-3">{heading}</th>)}</tr></thead><tbody>{items.map((item) => { const runActive = Boolean(item.runStatus && activeStatuses.has(item.runStatus)); return <tr key={item.id} className="border-t border-[#eef2f5] text-sm text-[#455468] transition hover:bg-[#fbfcfd]"><td className="px-5 py-4"><Link href={`/rehearsals/${item.id}`} className="font-semibold text-[#214f60] hover:underline">{item.repoOwner}/{item.repoName}</Link><span className="ml-2 text-[#6b7b8e]">PR #{item.prNumber}</span></td><td className="max-w-[230px] truncate px-5 py-4 font-mono text-xs text-[#56677b]">{item.migrationPath ?? "No SQL migration detected"}</td><td className="px-5 py-4 font-mono text-xs text-[#56677b]">{shortSha(item.commitSha)}</td><td className="px-5 py-4"><StatusPill status={item.runStatus ?? item.rehearsalStatus} /></td><td className="px-5 py-4 text-xs">{formatDate(item.completedAt ?? item.runCreatedAt)}</td><td className="px-5 py-4 text-xs">{formatDate(item.createdAt)}</td><td className="px-5 py-4"><div className="flex items-center justify-end gap-3"><StartRehearsalForm rehearsalId={item.id} disabled={runActive || !item.migrationPath} compact /><Link aria-label={`Open rehearsal ${item.id}`} href={`/rehearsals/${item.id}`} className="text-[#2a6779]"><ChevronRight size={17} /></Link></div></td></tr>; })}</tbody></table></div></section>{showIntake ? intake : null}</>;
}

export function RehearsalDetailView({ rehearsal }: { rehearsal: RehearsalDetail }) {
  const router = useRouter();
  const active = rehearsal.runStatus && !terminalStatuses.has(rehearsal.runStatus);
  useEffect(() => { if (!active) return; const timer = window.setInterval(() => router.refresh(), 5000); return () => window.clearInterval(timer); }, [active, router]);
  const runActive = rehearsal.runStatus && !terminalStatuses.has(rehearsal.runStatus);
  return <div className="space-y-5"><section className="rounded-xl border border-[#dfe7ed] bg-white px-6 py-6"><div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start"><div><Link href="/rehearsals" className="text-xs font-semibold text-[#317083] hover:underline">← All rehearsals</Link><h2 className="mt-3 text-2xl font-semibold tracking-[-.035em] text-[#172033]">{rehearsal.repoOwner}/{rehearsal.repoName} <span className="text-[#748195]">· PR #{rehearsal.prNumber}</span></h2><p className="mt-2 flex items-center gap-2 font-mono text-xs text-[#64748b]"><FileCode2 size={14} />{rehearsal.migrationPath ?? "No migration path"}</p></div><div className="flex w-full flex-col items-start gap-3 lg:w-auto lg:items-end"><StatusPill status={rehearsal.runStatus ?? rehearsal.rehearsalStatus} /><StartRehearsalForm rehearsalId={rehearsal.id} disabled={Boolean(runActive)} /></div></div></section>
    <BlockReasonBanner rehearsal={rehearsal} />
    <RehearsalResultSummary rehearsal={rehearsal} />
    <div className="grid items-start gap-5 xl:grid-cols-2">
      <DatabaseChangesCard rehearsal={rehearsal} />
      <ImpactSafetyCard rehearsal={rehearsal} />
    </div>
    <RehearsalProgress stages={rehearsal.stages} />
    <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <EvidencePanel evidence={rehearsal.evidence} />
      <ApprovalCard runId={rehearsal.runId} runStatus={rehearsal.runStatus} approval={rehearsal.approval} />
    </div>
    <LogPanel logs={rehearsal.logs} />
  </div>;
}

function BlockReasonBanner({ rehearsal }: { rehearsal: RehearsalDetail }) {
  if (rehearsal.runStatus !== "blocked") return null;
  return <section className="flex items-start gap-3 rounded-xl border border-orange-200 bg-orange-50 px-5 py-3 text-sm text-[#71401d]">
    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-orange-500" />
    <p><span className="font-semibold">Why blocked?</span> This rehearsal recorded a required safety or validation failure. Review the impact and evidence before approval.</p>
  </section>;
}

function RehearsalResultSummary({ rehearsal }: { rehearsal: RehearsalDetail }) {
  const blocked = rehearsal.runStatus === "blocked";
  const failed = rehearsal.runStatus === "failed";
  const passed = rehearsal.runStatus === "completed";
  const tone = blocked || failed ? "red" : passed ? "green" : "blue";
  const completedStages = rehearsal.stages.filter((stage) => stage.state === "completed").length;
  const required = rehearsal.stages.length;
  const iconClass = tone === "green" ? "bg-emerald-500 text-white" : tone === "red" ? "bg-red-500 text-white" : "bg-blue-500 text-white";
  const titleClass = tone === "green" ? "text-emerald-600" : tone === "red" ? "text-red-500" : "text-blue-600";
  const label = blocked ? "Blocked" : failed ? "Failed" : passed ? "Passed" : "Running";
  const message = passed ? "All recorded checks passed successfully." : blocked ? "A required safety check failed. Human approval is unavailable." : failed ? "Infrastructure failed before the rehearsal could complete." : "The rehearsal is still collecting evidence.";
  return <section className="grid gap-4 rounded-xl border border-[#e0e7ed] bg-white px-5 py-5 shadow-[0_1px_0_rgba(15,23,42,.02)] lg:grid-cols-[1.2fr_.9fr_.75fr_.75fr_.85fr] lg:items-center">
    <div className="flex items-center gap-4">
      <span className={`grid size-11 shrink-0 place-items-center rounded-full ${iconClass}`}>{blocked || failed ? <XCircle size={25} /> : <CheckCircle2 size={25} />}</span>
      <div><p className="dashboard-kicker">Rehearsal result</p><h3 className={`mt-1 text-xl font-bold leading-none ${titleClass}`}>{label}</h3><p className="mt-2 text-xs font-medium text-[#718095]">{message}</p></div>
    </div>
    <SummaryMetric label="Migration path" value={rehearsal.migrationPath ?? "—"} />
    <SummaryMetric label="Commit" value={shortSha(rehearsal.commitSha)} mono />
    <SummaryMetric label="Execution time" value={elapsedTime(rehearsal.runCreatedAt, rehearsal.completedAt)} />
    <SummaryMetric label="Checks passed" value={`${completedStages}/${required} required`} valueClass={tone === "green" ? "text-emerald-600" : tone === "red" ? "text-red-500" : "text-blue-600"} />
  </section>;
}

function SummaryMetric({ label, value, mono = false, valueClass = "text-[#243246]" }: { label: string; value: string; mono?: boolean; valueClass?: string }) {
  return <div className="border-[#e5ebf0] lg:border-l lg:pl-8">
    <p className="text-xs font-semibold text-[#536176]">{label}</p>
    <p className={`mt-2 truncate text-sm font-bold ${mono ? "font-mono" : ""} ${valueClass}`}>{value}</p>
  </div>;
}

function DatabaseChangesCard({ rehearsal }: { rehearsal: RehearsalDetail }) {
  const destructive = isDestructiveMigration(rehearsal);
  const entity = migrationEntity(rehearsal.migrationPath);
  const hasMigration = Boolean(rehearsal.migrationPath);
  return <section className="min-h-[222px] rounded-xl border border-[#e0e7ed] bg-white p-5">
    <div className="flex items-center gap-3"><Database className="size-5 text-[#2f8494]" /><h3 className="dashboard-kicker">Database changes</h3></div>
    <div className="mt-5 space-y-4">
      <div>
        <p className="text-sm font-bold text-emerald-600">Added</p>
        <div className="mt-2 rounded-lg bg-[#f8fbfa] px-4 py-3">
          <p className="font-semibold text-[#344054]">{!destructive && hasMigration ? entity : "No additive change detected"}</p>
          <p className="mt-1 font-mono text-xs text-[#6b7b8e]">{!destructive && hasMigration ? rehearsal.migrationPath : "None"}</p>
        </div>
      </div>
      <div>
        <p className="text-sm font-bold text-red-500">Removed</p>
        <div className="mt-2 rounded-lg bg-[#fffafa] px-4 py-3">
          <p className="font-semibold text-[#344054]">{destructive && hasMigration ? entity : "None"}</p>
          <p className="mt-1 font-mono text-xs text-[#6b7b8e]">{destructive && hasMigration ? rehearsal.migrationPath : "No removed objects recorded"}</p>
        </div>
      </div>
    </div>
  </section>;
}

function ImpactSafetyCard({ rehearsal }: { rehearsal: RehearsalDetail }) {
  const destructive = isDestructiveMigration(rehearsal);
  const completedStages = rehearsal.stages.filter((stage) => stage.state === "completed").length;
  const failedEvidence = rehearsal.evidence.filter((item) => item.status === "fail" || item.status === "failed" || item.status === "blocked").length;
  const rowCounts = evidenceHas(rehearsal, ["rowCounts", "row_counts", "row"]);
  const recommendation = rehearsal.runStatus === "blocked" ? "Not eligible for approval" : rehearsal.runStatus === "completed" ? "Eligible for human approval" : "Waiting for more evidence";
  return <section className="min-h-[222px] rounded-xl border border-[#e0e7ed] bg-white p-5">
    <div className="flex items-center gap-3"><Shield className="size-5 text-[#2f8494]" /><h3 className="dashboard-kicker">{rehearsal.runStatus === "blocked" ? "Block reason" : "Impact & safety"}</h3></div>
    <dl className="mt-5 space-y-3 text-sm">
      <SafetyRow label="Destructive operations" value={destructive ? "Detected" : "None"} bad={destructive} />
      <SafetyRow label="Tables affected" value={evidenceHas(rehearsal, ["schema", "table"]) ? "Verified" : rehearsal.migrationPath ? "1 likely" : "—"} />
      <SafetyRow label="Checks completed" value={`${completedStages}/${rehearsal.stages.length}`} bad={failedEvidence > 0} />
      <SafetyRow label="Row-count observations" value={rowCounts ? "Recorded" : "Not recorded"} muted={!rowCounts} />
      <SafetyRow label="Unexpected row loss" value={destructive ? "Review required" : "None"} bad={destructive} />
    </dl>
    <div className="mt-5 flex items-center justify-between gap-3 border-t border-[#edf1f4] pt-4">
      <span className="text-sm font-semibold text-[#344054]">Recommendation</span>
      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold ring-1 ring-inset ${rehearsal.runStatus === "blocked" ? "bg-red-50 text-red-600 ring-red-200" : rehearsal.runStatus === "completed" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-slate-50 text-slate-600 ring-slate-200"}`}>
        {rehearsal.runStatus === "blocked" ? <XCircle size={13} /> : <ShieldCheck size={13} />}
        {recommendation}
      </span>
    </div>
  </section>;
}

function SafetyRow({ label, value, bad = false, muted = false }: { label: string; value: string; bad?: boolean; muted?: boolean }) {
  return <div className="flex items-center justify-between gap-4 border-b border-[#eef2f5] pb-2 last:border-b-0">
    <dt className="text-[#536176]">{label}</dt>
    <dd className={`font-bold ${bad ? "text-red-500" : muted ? "text-[#8a98a8]" : "text-emerald-600"}`}>{value}</dd>
  </div>;
}

function EvidencePanel({ evidence }: { evidence: RehearsalDetail["evidence"] }) { return <section className="overflow-hidden rounded-xl border border-[#e0e7ed] bg-white"><div className="border-b border-[#e8edf1] px-5 py-4"><h3 className="text-sm font-semibold text-[#1d2939]">Evidence</h3></div>{evidence.length ? <ul className="max-h-[368px] divide-y divide-[#eef2f5] overflow-y-auto overscroll-contain">{evidence.map((item) => <li key={item.id} className="flex min-h-[92px] items-center justify-between gap-4 px-5 py-4"><div className="min-w-0"><p className="truncate text-sm font-medium text-[#354157]">{item.name.replaceAll("_", " ")}</p><p className="mt-1 truncate text-xs text-[#728095]">{item.type}</p></div><StatusPill status={item.status} /></li>)}</ul> : <p className="px-5 py-10 text-center text-sm text-[#788599]">Evidence will appear when a run records it.</p>}</section>; }
function LogPanel({ logs }: { logs: RehearsalDetail["logs"] }) { return <section className="overflow-hidden rounded-xl border border-[#e0e7ed] bg-white"><div className="border-b border-[#e8edf1] px-5 py-4"><h3 className="text-sm font-semibold text-[#1d2939]">Run log</h3></div>{logs.length ? <ol className="max-h-[260px] divide-y divide-[#eef2f5] overflow-y-auto overscroll-contain">{logs.map((log) => <li key={log.id} className="grid grid-cols-[82px_64px_1fr] gap-3 px-5 py-3 text-xs"><time className="font-mono text-[#788599]">{formatDate(log.createdAt)}</time><span className="font-semibold uppercase text-[#2e6978]">{log.level}</span><span className="text-[#4c5d70]">{log.message}</span></li>)}</ol> : <p className="px-5 py-10 text-center text-sm text-[#788599]">No log records were persisted for this run.</p>}</section>; }

function ApprovalCard({ runId, runStatus, approval }: { runId: string | null; runStatus: string | null; approval: RehearsalDetail["approval"] }) {
  const router = useRouter(); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  async function decide(decision: "approved" | "rejected") { if (!runId) return; setLoading(true); setError(""); try { const response = await fetch(`/api/runs/${runId}/approval`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ decision }) }); if (!response.ok) throw new Error("The decision could not be saved."); router.refresh(); } catch (reason) { setError(reason instanceof Error ? reason.message : "The decision could not be saved."); } finally { setLoading(false); } }
  if (approval) return <aside className="rounded-xl border border-[#dce6df] bg-white p-5"><ShieldCheck className="size-5 text-emerald-600" /><h3 className="mt-3 text-sm font-semibold text-[#1d2939]">Decision recorded</h3><p className="mt-2 text-sm capitalize text-[#5d6c7c]">{approval.decision} by {approval.actor}</p><p className="mt-3 text-xs leading-5 text-[#788599]">This records the review only. It does not execute a production migration.</p></aside>;
  const enabled = canReviewRun(runStatus as "completed" | "blocked" | "failed" | null, false) && Boolean(runId); return <aside className="rounded-xl border border-[#e0e7ed] bg-white p-5"><ShieldCheck className="size-5 text-[#2f6d7d]" /><h3 className="mt-3 text-sm font-semibold text-[#1d2939]">Human decision</h3><p className="mt-2 text-sm leading-6 text-[#68778a]">A completed rehearsal can be approved or rejected. Neither action touches production.</p><div className="mt-5 grid gap-2"><button disabled={!enabled || loading} onClick={() => decide("approved")} className="rounded-lg bg-[#236778] px-3 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">{loading ? <LoaderCircle className="mx-auto size-4 animate-spin" /> : "Approve rehearsal"}</button><button disabled={!enabled || loading} onClick={() => decide("rejected")} className="rounded-lg border border-[#d8e1e8] px-3 py-2.5 text-sm font-semibold text-[#536477] disabled:cursor-not-allowed disabled:opacity-40">Reject</button></div>{!enabled && <p className="mt-3 text-xs text-[#8a6370]">Only completed runs can be reviewed.</p>}{error && <p role="alert" className="mt-3 text-xs text-rose-600">{error}</p>}</aside>;
}
