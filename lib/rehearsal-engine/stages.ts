import type { EvidenceRecord } from "@/lib/database/evidence";
import type { RunStatus } from "@/lib/database/runs";

export type ProgressState = "completed" | "current" | "pending" | "blocked" | "failed" | "warning";
export type RehearsalStage = { key: string; label: string; state: ProgressState };

const stages = [
  ["pr", "PR verified", ["github_pr"]],
  ["artifact", "Artifact fetched", ["migration_artifact", "github_blob"]],
  ["fingerprint", "Fingerprint verified", ["migration_fingerprint", "daytona_fingerprint"]],
  ["daytona", "Daytona staged", ["daytona_artifact"]],
  ["neon", "Neon branch created", ["neon_branch"]],
  ["migration", "Migration executed", ["migration_execution"]],
  ["validation", "Validation complete", ["schema_integrity", "foreign_keys", "row_counts", "smoke_query"]],
  ["cleanup", "Cleanup complete", ["cleanup"]],
] as const;

function evidenceState(evidence: EvidenceRecord[], names: readonly string[]): ProgressState | undefined {
  const matching = evidence.filter((item) => names.some((name) => item.name.includes(name) || item.type.includes(name)));
  if (!matching.length) return undefined;
  if (matching.some((item) => item.status === "failed")) return "failed";
  if (matching.some((item) => item.status === "blocked")) return "blocked";
  if (matching.some((item) => item.status === "warning")) return "warning";
  return "completed";
}

export function mapRehearsalStages(runStatus: RunStatus, evidence: EvidenceRecord[]): RehearsalStage[] {
  let foundPending = false;
  return stages.map(([key, label, evidenceNames]) => {
    const recorded = evidenceState(evidence, evidenceNames);
    if (recorded) return { key, label, state: recorded };
    if (runStatus === "failed" || runStatus === "blocked") {
      if (!foundPending) { foundPending = true; return { key, label, state: runStatus }; }
      return { key, label, state: "pending" };
    }
    if (!foundPending && !["completed"].includes(runStatus)) { foundPending = true; return { key, label, state: "current" }; }
    return { key, label, state: "pending" };
  });
}
