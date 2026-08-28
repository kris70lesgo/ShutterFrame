import { AlertTriangle, CheckCircle2, CircleX } from "lucide-react";
import type { EvidenceRecord } from "@/lib/database/evidence";

const important = ["schema_integrity", "foreign_keys", "row_counts", "smoke_query", "migration_execution"];

export function ValidationChecks({ evidence }: { evidence: EvidenceRecord[] }) {
  const checks = evidence.filter((item) => important.some((name) => item.name.includes(name) || item.type.includes(name))).slice(-6);
  const completed = checks.filter((item) => item.status === "success" || item.status === "completed").length;
  return <section className="dashboard-card" aria-labelledby="checks-heading"><div className="border-b border-[#e7edf3] px-5 py-4"><h2 id="checks-heading" className="text-sm font-bold tracking-[-0.015em]">Validation checks</h2></div>{checks.length ? <><ul className="px-5 py-1">{checks.map((check) => <li key={check.id} className="grid grid-cols-[18px_minmax(105px,1fr)_auto] items-center gap-2 border-b border-[#edf1f5] py-3 last:border-0"><CheckIcon status={check.status} /><span className="truncate text-xs font-medium text-[#3f4c60]">{check.name.replaceAll("_", " ")}</span><span className={`text-xs font-semibold ${check.status === "failed" ? "text-rose-600" : check.status === "warning" ? "text-amber-600" : "text-[#278050]"}`}>{check.status ?? "recorded"}</span></li>)}</ul><div className="border-t border-[#e7edf3] px-5 py-4"><div className="flex justify-between text-xs text-[#718096]"><span>{completed} of {checks.length} checks passed</span><span>{checks.length ? Math.round((completed / checks.length) * 100) : 0}%</span></div><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e6edf0]"><div className="h-full rounded-full bg-[#2e9a62]" style={{ width: `${checks.length ? (completed / checks.length) * 100 : 0}%` }} /></div></div></> : <p className="px-5 py-10 text-center text-sm text-[#788599]">Validation evidence appears after a rehearsal runs.</p>}</section>;
}

function CheckIcon({ status }: { status: string | null }) { return status === "failed" ? <CircleX size={15} className="text-rose-500" /> : status === "warning" ? <AlertTriangle size={15} className="text-amber-500" /> : <CheckCircle2 size={15} className="text-[#42a269]" />; }
