import type { EvidenceRecord } from "@/lib/database/evidence";
import type { RunStatus } from "@/lib/database/runs";

export type ProgressState = "completed" | "current" | "pending" | "blocked" | "failed" | "warning";
export type RehearsalStage = { key: string; label: string; state: ProgressState };

const stages = [
  ["pr", "PR verified", ["commit_sha", "github_blob_sha"]],
  ["artifact", "Artifact fetched", ["migration_path", "github_blob_sha"]],
  ["fingerprint", "Fingerprint verified", ["migration_fingerprint", "fingerprint", "fingerprintVerification"]],
  ["daytona", "Daytona staged", ["sandbox", "artifactStage"]],
  ["neon", "Neon branch created", ["branch"]],
  ["migration", "Migration executed", ["migration"]],
  ["validation", "Validation complete", ["schema", "foreignKeys", "rowCounts", "smoke"]],
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
