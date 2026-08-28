-- Safe to apply to an existing ShutterFrame database created before the engine.
CREATE TABLE IF NOT EXISTS evidence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  status TEXT,
  data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS logs (
  id BIGSERIAL PRIMARY KEY,
  run_id UUID NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
  level TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE runs DROP CONSTRAINT IF EXISTS runs_status_check;
ALTER TABLE runs ADD CONSTRAINT runs_status_check CHECK (status IN ('starting', 'ready', 'branching', 'sandbox_starting', 'migration_running', 'validating', 'completed', 'blocked', 'failed'));
CREATE INDEX IF NOT EXISTS evidence_run_id_created_at_idx ON evidence (run_id, created_at ASC);
CREATE INDEX IF NOT EXISTS logs_run_id_created_at_idx ON logs (run_id, created_at ASC);
CREATE UNIQUE INDEX IF NOT EXISTS runs_active_rehearsal_idx ON runs (rehearsal_id)
  WHERE status IN ('starting', 'ready', 'branching', 'sandbox_starting', 'migration_running', 'validating');
