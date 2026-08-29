"use client";

import { useActionState } from "react";
import { LoaderCircle, Plus } from "lucide-react";
import { createRehearsalAction, type IntakeFormState } from "@/app/rehearsals/actions";

const initialState: IntakeFormState = {};

export function NewRehearsalForm() {
  const [state, action, pending] = useActionState(createRehearsalAction, initialState);
  return <form action={action} className="mx-auto mt-6 grid w-full max-w-2xl gap-3 text-left sm:grid-cols-[1fr_1fr_110px_auto]">
    <label className="sr-only" htmlFor="owner">Repository owner</label><input id="owner" name="owner" required placeholder="Owner" className="min-w-0 rounded-lg border border-[#d9e3ea] bg-white px-3 py-2.5 text-sm text-[#26384b] outline-none placeholder:text-[#9aa8b6] focus:border-[#2f7183]" />
    <label className="sr-only" htmlFor="repo">Repository name</label><input id="repo" name="repo" required placeholder="Repository" className="min-w-0 rounded-lg border border-[#d9e3ea] bg-white px-3 py-2.5 text-sm text-[#26384b] outline-none placeholder:text-[#9aa8b6] focus:border-[#2f7183]" />
    <label className="sr-only" htmlFor="prNumber">Pull request</label><input id="prNumber" name="prNumber" required min="1" type="number" placeholder="PR #" className="min-w-0 rounded-lg border border-[#d9e3ea] bg-white px-3 py-2.5 text-sm text-[#26384b] outline-none placeholder:text-[#9aa8b6] focus:border-[#2f7183]" />
    <button disabled={pending} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#236778] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#195766] disabled:opacity-60">{pending ? <LoaderCircle className="size-4 animate-spin" /> : <Plus size={16} />}Add rehearsal</button>
    {state.error ? <p role="alert" className="sm:col-span-4 text-center text-xs text-rose-600">{state.error}</p> : null}
  </form>;
}
