import "server-only";

import { getDatabase } from "@/lib/database/client";

export type EvidenceRecord = {
  id: string;
  runId: string;
  type: string;
  name: string;
  status: string | null;
  data: Record<string, unknown> | null;
};

export async function createEvidence(input: Omit<EvidenceRecord, "id">) {
  const [row] = await getDatabase()`INSERT INTO evidence (run_id, type, name, status, data) VALUES (${input.runId}, ${input.type}, ${input.name}, ${input.status}, ${JSON.stringify(input.data)}) RETURNING id, run_id AS "runId", type, name, status, data`;
  return row as EvidenceRecord;
}

export async function listEvidence(runId: string) {
  return await getDatabase()`SELECT id, run_id AS "runId", type, name, status, data FROM evidence WHERE run_id = ${runId} ORDER BY created_at ASC` as EvidenceRecord[];
}

export async function getTrackedModelSpendUsd() {
  const [row] = await getDatabase()`SELECT COALESCE(SUM((data->>'estimatedUsd')::numeric), 0) AS "total" FROM evidence WHERE type = 'model_usage'`;
  return Number((row as { total: string | number }).total);
}
