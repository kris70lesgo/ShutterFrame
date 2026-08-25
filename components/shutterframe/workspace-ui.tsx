import type { ReactNode } from "react";
import { CheckCircle2, CircleAlert, Clock3 } from "lucide-react";

export function PageHeader({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <header className="flex flex-col justify-between gap-5 border-b border-[#e3e9f0] pb-6 sm:flex-row sm:items-end"><div><p className="dashboard-kicker">{eyebrow}</p><h1 className="mt-2 text-3xl font-bold tracking-[-.045em] text-[#172033]">{title}</h1><p className="mt-2 max-w-2xl text-sm leading-6 text-[#69768a]">{description}</p></div>{action}</header>;
}

export function Surface({ children, className = "" }: { children: ReactNode; className?: string }) { return <section className={`dashboard-card ${className}`}>{children}</section>; }

export function StatePill({ state }: { state: "Ready" | "Pending" | "Warning" | "Blocked" }) { const style = { Ready: "bg-[#e7f6ed] text-[#267b4c]", Pending: "bg-[#edf1f5] text-[#66758a]", Warning: "bg-[#fff5df] text-[#b97606]", Blocked: "bg-[#fdeceb] text-[#c74442]" }[state]; return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${style}`}><span className="size-1.5 rounded-full bg-current" />{state}</span>; }

export function ActivityMark({ kind = "complete" }: { kind?: "complete" | "pending" | "warning" }) { return kind === "complete" ? <CheckCircle2 className="text-[#37a36a]" size={17} /> : kind === "warning" ? <CircleAlert className="text-[#d99716]" size={17} /> : <Clock3 className="text-[#8a97a8]" size={17} />; }
