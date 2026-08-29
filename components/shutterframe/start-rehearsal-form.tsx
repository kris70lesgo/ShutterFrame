"use client";

import { Play } from "lucide-react";
import { useFormStatus } from "react-dom";
import { startRehearsal } from "@/app/rehearsals/[id]/actions";

export function StartRehearsalForm({ rehearsalId, disabled }: { rehearsalId: string; disabled: boolean }) {
  return <form action={startRehearsal.bind(null, rehearsalId)}><StartButton disabled={disabled} /></form>;
}

function StartButton({ disabled }: { disabled: boolean }) { const { pending } = useFormStatus(); return <button disabled={disabled || pending} className="inline-flex items-center gap-2 rounded-lg bg-[#236778] px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#195766] disabled:cursor-not-allowed disabled:opacity-40"><Play size={15} fill="currentColor" />{pending ? "Starting rehearsal…" : "Run rehearsal"}</button>; }
