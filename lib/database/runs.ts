import "server-only";

import { getDatabase } from "@/lib/database/client";

export type RunStatus =
  | "starting"
  | "ready"
  | "branching"
  | "sandbox_starting"
  | "migration_running"
  | "validating"
  | "completed"
  | "blocked"
  | "failed";
export type Run = {
  id: string;
  rehearsalId: string;
  status: RunStatus;
  trueforgeSessionId: string | null;
  neonBranchId: string | null;
  daytonaSandboxId: string | null;
};

export async function createStartingRun(rehearsalId: string) {
  const [row] = await getDatabase()`INSERT INTO runs (rehearsal_id, status, started_at) VALUES (${rehearsalId}, ${"starting"}, now()) RETURNING id, rehearsal_id AS "rehearsalId", status, trueforge_session_id AS "trueforgeSessionId", neon_branch_id AS "neonBranchId", daytona_sandbox_id AS "daytonaSandboxId"`;
  return row as Run;
}

export async function markRunReady(runId: string, trueforgeSessionId: string) {
  const [row] = await getDatabase()`UPDATE runs SET trueforge_session_id = ${trueforgeSessionId}, status = ${"ready"} WHERE id = ${runId} RETURNING id, rehearsal_id AS "rehearsalId", status, trueforge_session_id AS "trueforgeSessionId", neon_branch_id AS "neonBranchId", daytona_sandbox_id AS "daytonaSandboxId"`;
  return row as Run | undefined;
}

export async function replaceRunTrueForgeSession(runId: string, trueforgeSessionId: string) {
  const [row] = await getDatabase()`UPDATE runs SET trueforge_session_id = ${trueforgeSessionId}, status = ${"ready"}, completed_at = NULL WHERE id = ${runId} RETURNING id, rehearsal_id AS "rehearsalId", status, trueforge_session_id AS "trueforgeSessionId", neon_branch_id AS "neonBranchId", daytona_sandbox_id AS "daytonaSandboxId"`;
  return row as Run | undefined;
}

export async function markRunFailed(runId: string) {
  await markRunStatus(runId, "failed");
}

export async function markRunStatus(runId: string, status: RunStatus) {
  const [row] = await getDatabase()`UPDATE runs SET status = ${status}, completed_at = CASE WHEN ${status} IN ('completed', 'blocked', 'failed') THEN now() ELSE completed_at END WHERE id = ${runId} RETURNING id, rehearsal_id AS "rehearsalId", status, trueforge_session_id AS "trueforgeSessionId", neon_branch_id AS "neonBranchId", daytona_sandbox_id AS "daytonaSandboxId"`;
  return row as Run | undefined;
}

export async function setRunInfrastructure(runId: string, infrastructure: { neonBranchId?: string; daytonaSandboxId?: string }) {
  const [row] = await getDatabase()`UPDATE runs SET neon_branch_id = COALESCE(${infrastructure.neonBranchId ?? null}, neon_branch_id), daytona_sandbox_id = COALESCE(${infrastructure.daytonaSandboxId ?? null}, daytona_sandbox_id) WHERE id = ${runId} RETURNING id, rehearsal_id AS "rehearsalId", status, trueforge_session_id AS "trueforgeSessionId", neon_branch_id AS "neonBranchId", daytona_sandbox_id AS "daytonaSandboxId"`;
  return row as Run | undefined;
}

export async function hasActiveRun(rehearsalId: string) {
  const [row] = await getDatabase()`SELECT id FROM runs WHERE rehearsal_id = ${rehearsalId} AND status IN ('starting', 'ready', 'branching', 'sandbox_starting', 'migration_running', 'validating') LIMIT 1`;
  return Boolean(row);
}

export async function getRun(id: string) {
  const [row] = await getDatabase()`SELECT id, rehearsal_id AS "rehearsalId", status, trueforge_session_id AS "trueforgeSessionId", neon_branch_id AS "neonBranchId", daytona_sandbox_id AS "daytonaSandboxId" FROM runs WHERE id = ${id}`;
  return row as Run | undefined;
}

export async function getLatestRunForRehearsal(rehearsalId: string) {
  const [row] = await getDatabase()`SELECT id, rehearsal_id AS "rehearsalId", status, trueforge_session_id AS "trueforgeSessionId", neon_branch_id AS "neonBranchId", daytona_sandbox_id AS "daytonaSandboxId" FROM runs WHERE rehearsal_id = ${rehearsalId} ORDER BY created_at DESC LIMIT 1`;
  return row as Run | undefined;
}

export async function deleteRun(id: string) {
  await getDatabase()`DELETE FROM runs WHERE id = ${id}`;
}
