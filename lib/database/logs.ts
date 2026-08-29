import "server-only";

import { getDatabase } from "@/lib/database/client";

export type RunLog = { id: number; runId: string; level: string; message: string; metadata: Record<string, unknown> | null; createdAt: string };

export async function createRunLog(input: Omit<RunLog, "id" | "createdAt">) {
  const [row] = await getDatabase()`INSERT INTO logs (run_id, level, message, metadata) VALUES (${input.runId}, ${input.level}, ${input.message}, ${JSON.stringify(input.metadata)}) RETURNING id, run_id AS "runId", level, message, metadata, created_at AS "createdAt"`;
  return row as RunLog;
}

export async function listRunLogs(runId: string) {
  return await getDatabase()`SELECT id, run_id AS "runId", level, message, metadata, created_at AS "createdAt" FROM logs WHERE run_id = ${runId} ORDER BY created_at ASC` as RunLog[];
}
