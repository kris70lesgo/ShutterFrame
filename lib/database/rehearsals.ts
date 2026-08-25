import "server-only";
import { getDatabase } from "@/lib/database/client";

export type QueuedRehearsal = { repoOwner: string; repoName: string; prNumber: number; commitSha: string; migrationPath: string | null };
export async function createQueuedRehearsal(input: QueuedRehearsal) {
  const sql = getDatabase();
  const [row] = await sql`INSERT INTO rehearsals (repo_owner, repo_name, pr_number, commit_sha, migration_path, status) VALUES (${input.repoOwner}, ${input.repoName}, ${input.prNumber}, ${input.commitSha}, ${input.migrationPath}, ${"queued"}) RETURNING id, status`;
  return row as { id: string; status: string };
}
export async function getRehearsal(id: string) { const [row] = await getDatabase()`SELECT id, status FROM rehearsals WHERE id = ${id}`; return row as { id: string; status: string } | undefined; }
export async function deleteRehearsal(id: string) { await getDatabase()`DELETE FROM rehearsals WHERE id = ${id}`; }
