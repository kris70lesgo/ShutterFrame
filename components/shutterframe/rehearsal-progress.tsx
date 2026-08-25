import { ProgressIndicator, type ProgressStep } from "@/components/ui/progress-indicator";

const steps: readonly ProgressStep[] = [
  { label: "PR fetched", detail: "00:00:05", state: "complete" },
  { label: "Branch created", detail: "00:00:32", state: "complete" },
  { label: "Sandbox started", detail: "00:01:12", state: "complete" },
  { label: "Migration applied", detail: "00:03:15", state: "active" },
  { label: "Integrity checks", detail: "Pending", state: "pending" },
  { label: "Rollback test", detail: "Pending", state: "pending" },
  { label: "Awaiting approval", detail: "Pending", state: "pending" },
];

export function RehearsalProgress() {
  return <section className="bg-white py-16" aria-label="Rehearsal progress"><ProgressIndicator steps={steps} /></section>;
}
