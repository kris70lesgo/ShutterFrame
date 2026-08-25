import "server-only";

import { getDatabase } from "@/lib/database/client";

export type RunStatus = "starting" | "ready" | "failed";
export type Run = {
  id: string;
  rehearsalId: string;
  status: RunStatus;
  trueforgeSessionId: string | null;
};

export async function createStartingRun(rehearsalId: string) {
  const [row] = await getDatabase()`INSERT INTO runs (rehearsal_id, status, started_at) VALUES (${rehearsalId}, ${"starting"}, now()) RETURNING id, rehearsal_id AS "rehearsalId", status, trueforge_session_id AS "trueforgeSessionId"`;
  return row as Run;
}

export async function markRunReady(runId: string, trueforgeSessionId: string) {
  const [row] = await getDatabase()`UPDATE runs SET trueforge_session_id = ${trueforgeSessionId}, status = ${"ready"} WHERE id = ${runId} RETURNING id, rehearsal_id AS "rehearsalId", status, trueforge_session_id AS "trueforgeSessionId"`;
  return row as Run | undefined;
}

export async function markRunFailed(runId: string) {
  await getDatabase()`UPDATE runs SET status = ${"failed"} WHERE id = ${runId}`;
}

export async function getRun(id: string) {
  const [row] = await getDatabase()`SELECT id, rehearsal_id AS "rehearsalId", status, trueforge_session_id AS "trueforgeSessionId" FROM runs WHERE id = ${id}`;
  return row as Run | undefined;
}

export async function deleteRun(id: string) {
  await getDatabase()`DELETE FROM runs WHERE id = ${id}`;
}
