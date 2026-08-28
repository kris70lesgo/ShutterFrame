import "server-only";

import { listEvidence, type EvidenceRecord } from "@/lib/database/evidence";
import { listRunLogs, type RunLog } from "@/lib/database/logs";
import { getDatabase } from "@/lib/database/client";
import { getApprovalForRun, type Approval } from "@/lib/database/approvals";
import { redactUnknown } from "@/lib/rehearsal-engine/redaction";
import { mapRehearsalStages, type RehearsalStage } from "@/lib/rehearsal-engine/stages";
import type { RunStatus } from "@/lib/database/runs";

export type RehearsalListItem = {
  id: string; repoOwner: string; repoName: string; prNumber: number; commitSha: string; migrationPath: string | null;
  rehearsalStatus: string; createdAt: string; runId: string | null; runStatus: RunStatus | null; runCreatedAt: string | null; completedAt: string | null;
};

export type RehearsalDetail = RehearsalListItem & { evidence: EvidenceRecord[]; logs: RunLog[]; approval: Approval | undefined; stages: RehearsalStage[] };

export async function listRehearsalViews(limit = 50) {
  return await getDatabase()`SELECT r.id, r.repo_owner AS "repoOwner", r.repo_name AS "repoName", r.pr_number AS "prNumber", r.commit_sha AS "commitSha", r.migration_path AS "migrationPath", r.status AS "rehearsalStatus", r.created_at AS "createdAt", latest.id AS "runId", latest.status AS "runStatus", latest.created_at AS "runCreatedAt", latest.completed_at AS "completedAt" FROM rehearsals r LEFT JOIN LATERAL (SELECT id, status, created_at, completed_at FROM runs WHERE rehearsal_id = r.id ORDER BY created_at DESC LIMIT 1) latest ON true ORDER BY COALESCE(latest.created_at, r.created_at) DESC LIMIT ${limit}` as RehearsalListItem[];
}

export async function getRehearsalView(id: string): Promise<RehearsalDetail | undefined> {
  const [record] = await getDatabase()`SELECT r.id, r.repo_owner AS "repoOwner", r.repo_name AS "repoName", r.pr_number AS "prNumber", r.commit_sha AS "commitSha", r.migration_path AS "migrationPath", r.status AS "rehearsalStatus", r.created_at AS "createdAt", latest.id AS "runId", latest.status AS "runStatus", latest.created_at AS "runCreatedAt", latest.completed_at AS "completedAt" FROM rehearsals r LEFT JOIN LATERAL (SELECT id, status, created_at, completed_at FROM runs WHERE rehearsal_id = r.id ORDER BY created_at DESC LIMIT 1) latest ON true WHERE r.id = ${id}`;
  if (!record) return undefined;
  const summary = record as RehearsalListItem;
  const [evidence, logs, approval] = summary.runId ? await Promise.all([listEvidence(summary.runId), listRunLogs(summary.runId), getApprovalForRun(summary.runId)]) : [[], [], undefined];
  const safeEvidence = evidence.map((item) => ({ ...item, data: redactUnknown(item.data) as EvidenceRecord["data"] }));
  const safeLogs = logs.map((item) => ({ ...item, message: String(redactUnknown(item.message)), metadata: redactUnknown(item.metadata) as RunLog["metadata"] }));
  return { ...summary, evidence: safeEvidence, logs: safeLogs, approval, stages: mapRehearsalStages(summary.runStatus ?? "starting", safeEvidence) };
}
