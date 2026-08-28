"use client";

import { Check, X } from "lucide-react";
import { Button } from "@/components/base/buttons/button";

export function ApprovalPanel() {
  return <aside className="dashboard-card self-start" aria-labelledby="approval-heading"><div className="border-b border-[#e7edf3] px-5 py-4"><h2 id="approval-heading" className="text-sm font-bold tracking-[-0.015em]">Approval</h2></div><div className="px-5 py-5"><p className="text-xs font-medium text-[#7c8798]">Requested by</p><div className="mt-3 flex items-center gap-3"><span className="grid size-8 place-items-center rounded-full bg-[#e6edf8] text-xs font-bold text-[#38659a]">AK</span><div><p className="text-sm font-semibold text-[#374357]">Alex Kim</p><p className="text-xs text-[#7c8798]">8 mins ago</p></div></div><div className="mt-6 grid gap-2"><Button color="primary" size="lg" iconLeading={Check} className="w-full">Approve</Button><Button color="secondary" size="lg" iconLeading={X} className="w-full border border-[#d8e1eb]">Reject</Button></div><p className="mt-4 text-xs leading-5 text-[#7b8798]">Approval will trigger promotion to the Production environment.</p><Button color="secondary" size="lg" className="mt-6 w-full border border-[#d8e1eb]">View all runs</Button></div></aside>;
}
