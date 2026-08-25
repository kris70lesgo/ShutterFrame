import "server-only";
import { getDatabase } from "@/lib/database/client";

export type QueuedRehearsal = { repoOwner: string; repoName: string; prNumber: number; commitSha: string; migrationPath: string | null };
export type Rehearsal = QueuedRehearsal & { id: string; status: string };

export async function createQueuedRehearsal(input: QueuedRehearsal) {
  const sql = getDatabase();
  const [row] = await sql`INSERT INTO rehearsals (repo_owner, repo_name, pr_number, commit_sha, migration_path, status) VALUES (${input.repoOwner}, ${input.repoName}, ${input.prNumber}, ${input.commitSha}, ${input.migrationPath}, ${"queued"}) RETURNING id, status`;
  return row as { id: string; status: string };
}

export async function getRehearsal(id: string) {
  const [row] = await getDatabase()`SELECT id, repo_owner AS "repoOwner", repo_name AS "repoName", pr_number AS "prNumber", commit_sha AS "commitSha", migration_path AS "migrationPath", status FROM rehearsals WHERE id = ${id}`;
  return row as Rehearsal | undefined;
}

export async function deleteRehearsal(id: string) { await getDatabase()`DELETE FROM rehearsals WHERE id = ${id}`; }
