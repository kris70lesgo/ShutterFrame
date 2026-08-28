-- Safe to apply to an existing ShutterFrame database created before the engine.
CREATE INDEX IF NOT EXISTS evidence_run_id_created_at_idx ON evidence (run_id, created_at ASC);
CREATE INDEX IF NOT EXISTS logs_run_id_created_at_idx ON logs (run_id, created_at ASC);
CREATE INDEX IF NOT EXISTS runs_active_rehearsal_idx ON runs (rehearsal_id, created_at DESC)
  WHERE status IN ('starting', 'ready', 'branching', 'sandbox_starting', 'migration_running', 'validating');
