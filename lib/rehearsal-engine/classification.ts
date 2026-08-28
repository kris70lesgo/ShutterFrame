export type RehearsalOutcome = "completed" | "blocked" | "failed";

export function classifyRehearsalOutcome(input: { infrastructureFailed: boolean; requiredChecksPassed: boolean }): RehearsalOutcome {
  if (input.infrastructureFailed) return "failed";
  return input.requiredChecksPassed ? "completed" : "blocked";
}
