import "server-only";

import { getDatabase } from "@/lib/database/client";

export type ApprovalDecision = "approved" | "rejected";
export type Approval = {
  id: string;
  runId: string;
  decision: ApprovalDecision;
  actor: string;
  commitSha: string;
  notes: string | null;
  createdAt: string;
};

export async function getApprovalForRun(runId: string) {
  const [row] = await getDatabase()`SELECT id, run_id AS "runId", decision, actor, commit_sha AS "commitSha", notes, created_at AS "createdAt" FROM approvals WHERE run_id = ${runId}`;
  return row as Approval | undefined;
}

export async function createApproval(input: Omit<Approval, "id" | "createdAt">) {
  const [row] = await getDatabase()`INSERT INTO approvals (run_id, decision, actor, commit_sha, notes) VALUES (${input.runId}, ${input.decision}, ${input.actor}, ${input.commitSha}, ${input.notes}) ON CONFLICT (run_id) DO NOTHING RETURNING id, run_id AS "runId", decision, actor, commit_sha AS "commitSha", notes, created_at AS "createdAt"`;
  return row as Approval | undefined;
}
