import "server-only";

import { createStartingRun, markRunFailed, markRunReady } from "@/lib/database/runs";
import { getRehearsal } from "@/lib/database/rehearsals";
import { startRehearsalSession } from "@/lib/trueforge/sessions";

export async function createTrueForgeRehearsalSession(rehearsalId: string) {
  const rehearsal = await getRehearsal(rehearsalId);
  if (!rehearsal) throw new Error("Rehearsal was not found.");

  const run = await createStartingRun(rehearsal.id);
  try {
    const session = await startRehearsalSession({
      rehearsal: {
        repoOwner: rehearsal.repoOwner,
        repoName: rehearsal.repoName,
        prNumber: rehearsal.prNumber,
        commitSha: rehearsal.commitSha,
        migrationPath: rehearsal.migrationPath,
      },
    });
    const readyRun = await markRunReady(run.id, session.sessionId);
    if (!readyRun) throw new Error("Run was not found after creating a TrueForge session.");
    return { rehearsal, run: readyRun, session };
  } catch (error) {
    await markRunFailed(run.id);
    throw error;
  }
}
