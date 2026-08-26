CREATE TABLE IF NOT EXISTS runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rehearsal_id UUID NOT NULL REFERENCES rehearsals(id) ON DELETE CASCADE,
  trueforge_session_id TEXT,
  neon_branch_id TEXT,
  daytona_sandbox_id TEXT,
  status TEXT NOT NULL DEFAULT 'starting',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT runs_status_check CHECK (status IN ('starting', 'ready', 'failed'))
);

ALTER TABLE runs ADD COLUMN IF NOT EXISTS trueforge_session_id TEXT;
CREATE INDEX IF NOT EXISTS runs_rehearsal_id_created_at_idx ON runs (rehearsal_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS runs_trueforge_session_id_unique ON runs (trueforge_session_id) WHERE trueforge_session_id IS NOT NULL;
