"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { startRehearsalEngine } from "@/lib/rehearsal-engine";

/**
 * Local demo operator control. The engine retains all secret-bearing work on
 * the server; this action receives only a rehearsal identifier from the form.
 */
export async function startRehearsal(rehearsalId: string) {
  // Persist a starting run before redirecting. The detached local-demo worker
  // then writes evidence while the detail view polls real database state.
  await startRehearsalEngine(rehearsalId);
  revalidatePath("/dashboard");
  revalidatePath("/rehearsals");
  revalidatePath(`/rehearsals/${rehearsalId}`);
  redirect(`/rehearsals/${rehearsalId}`);
}
