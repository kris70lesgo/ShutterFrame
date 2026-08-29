CREATE TABLE IF NOT EXISTS approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  decision TEXT NOT NULL CHECK (decision IN ('approved', 'rejected')),
  actor TEXT NOT NULL,
  commit_sha TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT approvals_one_decision_per_run UNIQUE (run_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS approvals_run_id_unique ON approvals (run_id);
CREATE INDEX IF NOT EXISTS approvals_created_at_idx ON approvals (created_at DESC);
