import type { RunStatus } from "@/lib/database/runs";

export function canReviewRun(status: RunStatus | null, hasExistingDecision: boolean) {
  return status === "completed" && !hasExistingDecision;
}
