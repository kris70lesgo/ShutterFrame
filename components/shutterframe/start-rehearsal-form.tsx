"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Play } from "lucide-react";

export function StartRehearsalForm({ rehearsalId, disabled, compact = false }: { rehearsalId: string; disabled: boolean; compact?: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function start() {
    setPending(true);
    try {
      const response = await fetch(`/api/rehearsals/${rehearsalId}/run`, { method: "POST" });
      if (!response.ok) throw new Error("Unable to start rehearsal.");
      router.push(`/rehearsals/${rehearsalId}`);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return <button type="button" onClick={start} disabled={disabled || pending} className={`inline-flex items-center justify-center gap-2 rounded-lg bg-[#236778] font-semibold text-white shadow-sm transition hover:bg-[#195766] disabled:cursor-not-allowed disabled:opacity-40 ${compact ? "px-3 py-2 text-xs" : "px-3.5 py-2.5 text-sm"}`}><Play size={compact ? 13 : 15} fill="currentColor" />{pending ? "Starting…" : compact ? "Run" : "Run rehearsal"}</button>;
}
