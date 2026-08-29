"use client";

import { Play } from "lucide-react";
import { useFormStatus } from "react-dom";
import { startRehearsal } from "@/app/rehearsals/[id]/actions";

export function StartRehearsalForm({ rehearsalId, disabled, compact = false }: { rehearsalId: string; disabled: boolean; compact?: boolean }) {
  return <form action={startRehearsal.bind(null, rehearsalId)}><StartButton disabled={disabled} compact={compact} /></form>;
}

function StartButton({ disabled, compact }: { disabled: boolean; compact: boolean }) {
  const { pending } = useFormStatus();
  return <button disabled={disabled || pending} className={`inline-flex items-center justify-center gap-2 rounded-lg bg-[#236778] font-semibold text-white shadow-sm transition hover:bg-[#195766] disabled:cursor-not-allowed disabled:opacity-40 ${compact ? "px-3 py-2 text-xs" : "px-3.5 py-2.5 text-sm"}`}><Play size={compact ? 13 : 15} fill="currentColor" />{pending ? "Starting…" : compact ? "Run" : "Run rehearsal"}</button>;
}
