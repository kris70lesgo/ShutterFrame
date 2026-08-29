"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowUpRight, ChevronRight, FileCode2, LoaderCircle, Plus, ShieldCheck, X } from "lucide-react";
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

export function DashboardOverview({ items, featured }: { items: RehearsalListItem[]; featured?: RehearsalDetail }) {
  const active = items.filter((item) => item.runStatus && !terminalStatuses.has(item.runStatus)).length;
  const completed = items.filter((item) => item.runStatus === "completed").length;
  const blocked = items.filter((item) => item.runStatus === "blocked").length;
  return <div className="space-y-6">
    <section className="grid gap-[18px] xl:grid-cols-[repeat(3,340px)] 2xl:grid-cols-[repeat(4,340px)]">
      <DashboardStatCard title="Active runs" value={String(active)} increaseValue={String(Math.max(active, 1))} description="Running now" variant="green" href="/rehearsals" />
      <DashboardStatCard title="Completed" value={String(completed)} increaseValue={String(Math.max(completed, 1))} description="Ready for review" variant="light" href="/rehearsals" />
      <DashboardStatCard title="Blocked" value={String(blocked)} increaseValue={String(Math.max(blocked, 0))} description="Needs attention" variant="light" href="/rehearsals" />
      <DashboardActionCard />
    </section>
    {featured ? <section className="grid items-start gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(350px,.72fr)]"><RehearsalProgress stages={featured.stages} compact /><EvidenceLog logs={featured.logs} rehearsalId={featured.id} /></section> : null}
    <RehearsalTable items={items.slice(0, 8)} title="Recent rehearsals" />
  </div>;
}

function DashboardStatCard({ title, value, increaseValue, description, variant, href }: { title: string; value: string; increaseValue: string; description: string; variant: "green" | "light"; href: string }) {
  const isGreen = variant === "green";
  return <div className={`relative h-[230px] w-[340px] shrink-0 overflow-hidden rounded-[28px] antialiased ${isGreen ? "text-[#F7F8F1]" : "text-[#090909]"}`} style={{ background: isGreen ? "linear-gradient(140deg, #19462D 0%, #397652 100%)" : "#FBFBFA" }}>
    <div className="absolute left-[26px] top-[32px] max-w-[210px] text-[26px] font-medium leading-[1.1] tracking-[-0.5px]">{title}</div>
    <Link href={href} aria-label={`View ${title}`} className={`absolute right-[25px] top-[25px] flex size-[47px] items-center justify-center rounded-full border transition-colors ${isGreen ? "border-transparent bg-[#FAFAF7] text-black hover:bg-white" : "border-black bg-transparent text-black hover:bg-[#F0F0F0]"}`}>
      <ArrowUpRight size={22} strokeWidth={1.25} />
    </Link>
    <div className={`absolute left-[26px] top-[94px] text-[72px] font-normal leading-[0.95] tracking-[-2px] ${isGreen ? "text-[#F6F8E9]" : "text-black"}`}>{value}</div>
    <div className="absolute bottom-[27px] left-[26px] flex items-center gap-[10px]">
      <div className={`flex h-[21px] min-w-[29px] items-center justify-center rounded-[6px] border px-1 ${isGreen ? "border-[#D8F65B] text-[#D8F65B]" : "border-[#5D8E69] text-[#4E8460]"}`}><span className="text-[12px] font-medium leading-none">{increaseValue}</span><svg width="6" height="5" viewBox="0 0 6 5" fill="currentColor" className="ml-1"><polygon points="3,0 6,5 0,5" /></svg></div>
      <span className={`text-[17px] font-normal leading-none tracking-[-0.2px] ${isGreen ? "text-[#D8F65B]" : "text-[#4F7F5F]"}`}>{description}</span>
    </div>
  </div>;
}

function DashboardActionCard() {
  return <div className="relative h-[230px] w-[340px] shrink-0 overflow-hidden rounded-[28px] bg-[#FBFBFA] antialiased">
    <div className="absolute left-[26px] top-[32px] max-w-[220px] text-[26px] font-medium leading-[1.1] tracking-[-0.5px] text-[#090909]">Run a rehearsal</div>
    <Link href="/rehearsals" aria-label="Open rehearsals" className="absolute right-[25px] top-[25px] flex size-[47px] items-center justify-center rounded-full border border-black bg-transparent text-black transition-colors hover:bg-[#F0F0F0]">
      <ArrowUpRight size={22} strokeWidth={1.25} />
    </Link>
    <p className="absolute left-[26px] top-[96px] max-w-[250px] text-[18px] font-normal leading-[1.35] tracking-[-0.25px] text-[#587263]">Create, run, and review pull-request migration rehearsals.</p>
    <Link href="/rehearsals" className="absolute bottom-[27px] left-[26px] inline-flex items-center gap-2 rounded-full bg-[#19462D] px-5 py-3 text-[15px] font-semibold text-[#F7F8F1] transition hover:bg-[#123721]">
      View rehearsals
      <ChevronRight size={16} />
    </Link>
  </div>;
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
    <RehearsalProgress stages={rehearsal.stages} />
    <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_330px]"><div className="space-y-5"><EvidencePanel evidence={rehearsal.evidence} /><LogPanel logs={rehearsal.logs} /></div><ApprovalCard runId={rehearsal.runId} runStatus={rehearsal.runStatus} approval={rehearsal.approval} /></div>
  </div>;
}

function EvidencePanel({ evidence }: { evidence: RehearsalDetail["evidence"] }) { return <section className="rounded-xl border border-[#e0e7ed] bg-white"><div className="border-b border-[#e8edf1] px-5 py-4"><h3 className="text-sm font-semibold text-[#1d2939]">Evidence</h3></div>{evidence.length ? <ul className="divide-y divide-[#eef2f5]">{evidence.map((item) => <li key={item.id} className="flex items-start justify-between gap-4 px-5 py-4"><div><p className="text-sm font-medium text-[#354157]">{item.name.replaceAll("_", " ")}</p><p className="mt-1 text-xs text-[#728095]">{item.type}</p></div><StatusPill status={item.status} /></li>)}</ul> : <p className="px-5 py-10 text-center text-sm text-[#788599]">Evidence will appear when a run records it.</p>}</section>; }
function LogPanel({ logs }: { logs: RehearsalDetail["logs"] }) { return <section className="rounded-xl border border-[#e0e7ed] bg-white"><div className="border-b border-[#e8edf1] px-5 py-4"><h3 className="text-sm font-semibold text-[#1d2939]">Run log</h3></div>{logs.length ? <ol className="divide-y divide-[#eef2f5]">{logs.map((log) => <li key={log.id} className="grid grid-cols-[82px_64px_1fr] gap-3 px-5 py-3 text-xs"><time className="font-mono text-[#788599]">{formatDate(log.createdAt)}</time><span className="font-semibold uppercase text-[#2e6978]">{log.level}</span><span className="text-[#4c5d70]">{log.message}</span></li>)}</ol> : <p className="px-5 py-10 text-center text-sm text-[#788599]">No log records were persisted for this run.</p>}</section>; }

function ApprovalCard({ runId, runStatus, approval }: { runId: string | null; runStatus: string | null; approval: RehearsalDetail["approval"] }) {
  const router = useRouter(); const [loading, setLoading] = useState(false); const [error, setError] = useState("");
  async function decide(decision: "approved" | "rejected") { if (!runId) return; setLoading(true); setError(""); try { const response = await fetch(`/api/runs/${runId}/approval`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ decision }) }); if (!response.ok) throw new Error("The decision could not be saved."); router.refresh(); } catch (reason) { setError(reason instanceof Error ? reason.message : "The decision could not be saved."); } finally { setLoading(false); } }
  if (approval) return <aside className="rounded-xl border border-[#dce6df] bg-white p-5"><ShieldCheck className="size-5 text-emerald-600" /><h3 className="mt-3 text-sm font-semibold text-[#1d2939]">Decision recorded</h3><p className="mt-2 text-sm capitalize text-[#5d6c7c]">{approval.decision} by {approval.actor}</p><p className="mt-3 text-xs leading-5 text-[#788599]">This records the review only. It does not execute a production migration.</p></aside>;
  const enabled = canReviewRun(runStatus as "completed" | "blocked" | "failed" | null, false) && Boolean(runId); return <aside className="rounded-xl border border-[#e0e7ed] bg-white p-5"><ShieldCheck className="size-5 text-[#2f6d7d]" /><h3 className="mt-3 text-sm font-semibold text-[#1d2939]">Human decision</h3><p className="mt-2 text-sm leading-6 text-[#68778a]">A completed rehearsal can be approved or rejected. Neither action touches production.</p><div className="mt-5 grid gap-2"><button disabled={!enabled || loading} onClick={() => decide("approved")} className="rounded-lg bg-[#236778] px-3 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40">{loading ? <LoaderCircle className="mx-auto size-4 animate-spin" /> : "Approve rehearsal"}</button><button disabled={!enabled || loading} onClick={() => decide("rejected")} className="rounded-lg border border-[#d8e1e8] px-3 py-2.5 text-sm font-semibold text-[#536477] disabled:cursor-not-allowed disabled:opacity-40">Reject</button></div>{!enabled && <p className="mt-3 text-xs text-[#8a6370]">Only completed runs can be reviewed.</p>}{error && <p role="alert" className="mt-3 text-xs text-rose-600">{error}</p>}</aside>;
}
