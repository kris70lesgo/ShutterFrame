import type { ValidationResult } from "@/lib/migrations/types";

export function allChecksPassed(results: ValidationResult[]) {
  return results.length > 0 && results.every((result) => result.passed);
}
