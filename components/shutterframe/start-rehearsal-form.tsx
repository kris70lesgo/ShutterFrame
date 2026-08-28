"use client";

import { Play } from "lucide-react";
import { startRehearsal } from "@/app/rehearsals/[id]/actions";

export function StartRehearsalForm({ rehearsalId, disabled }: { rehearsalId: string; disabled: boolean }) {
  return <form action={startRehearsal.bind(null, rehearsalId)}><button disabled={disabled} className="inline-flex items-center gap-2 rounded-lg bg-[#236778] px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#195766] disabled:cursor-not-allowed disabled:opacity-40"><Play size={15} fill="currentColor" />Run rehearsal</button></form>;
}
