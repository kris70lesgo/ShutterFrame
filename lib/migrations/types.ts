export type MigrationSource = "github-pull-request" | "local-fixture";
export type RehearsalStatus =
  | "queued"
  | "provisioning"
  | "executing"
  | "validating"
  | "awaiting-approval"
  | "approved"
  | "rejected"
  | "failed"
  | "cleaned-up";

export type Migration = {
  id: string;
  filename: string;
  sql: string;
  source: MigrationSource;
};

export type RehearsalEnvironment = {
  branchId: string;
  provider: "neon";
  sandboxProvider: "daytona";
};

export type MigrationRun = {
  id: string;
  migrationId: string;
  status: RehearsalStatus;
  environment?: RehearsalEnvironment;
};

export type ValidationCheck =
  | "migration-executed"
  | "schema-integrity"
  | "row-preservation"
  | "foreign-keys"
  | "smoke-queries"
  | "rollback";

export type ValidationResult = {
  check: ValidationCheck;
  passed: boolean;
  detail: string;
};

export type ExecutionEvidence = {
  occurredAt: string;
  validation: ValidationResult[];
  durationMs?: number;
};

export type ApprovalDecision = "approved" | "rejected";
export type ApprovalRequest = {
  runId: string;
  evidence: ExecutionEvidence;
  decision?: ApprovalDecision;
};
