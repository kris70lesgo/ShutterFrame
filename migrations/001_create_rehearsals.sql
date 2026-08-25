CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE rehearsals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repo_owner TEXT NOT NULL,
  repo_name TEXT NOT NULL,
  pr_number INTEGER NOT NULL CHECK (pr_number > 0),
  commit_sha TEXT NOT NULL CHECK (char_length(commit_sha) > 0),
  migration_path TEXT,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'provisioning', 'executing', 'validating', 'awaiting-approval', 'approved', 'rejected', 'failed', 'cleaned-up')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT rehearsals_repository_pr_commit_unique UNIQUE (repo_owner, repo_name, pr_number, commit_sha)
);

CREATE INDEX rehearsals_status_created_at_idx ON rehearsals (status, created_at DESC);
