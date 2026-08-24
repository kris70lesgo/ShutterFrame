import type { RehearsalStatus } from "@/lib/migrations/types";

const transitions: Record<RehearsalStatus, RehearsalStatus[]> = {
  queued: ["provisioning", "failed"],
  provisioning: ["executing", "failed", "cleaned-up"],
  executing: ["validating", "failed", "cleaned-up"],
  validating: ["awaiting-approval", "failed", "cleaned-up"],
  "awaiting-approval": ["approved", "rejected", "cleaned-up"],
  approved: ["cleaned-up"],
  rejected: ["cleaned-up"],
  failed: ["cleaned-up"],
  "cleaned-up": [],
};

export function canTransition(from: RehearsalStatus, to: RehearsalStatus) {
  return transitions[from].includes(to);
}
