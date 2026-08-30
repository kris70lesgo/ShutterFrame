# TrueForge Rehearsal Session Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a real TrueForge/DeepSeek session for a persisted rehearsal and store its session ID on a ready run.

**Architecture:** A server-only orchestration service reads the minimal rehearsal metadata from Neon, creates a `starting` run, creates or refreshes a focused TrueForge agent, and sends that metadata as the only session context. The service records the returned TrueForge session ID and promotes the run to `ready`; it does not invoke MCP tools, Neon preview branching, Daytona, or migrations.

**Tech Stack:** Next.js server modules, `@neondatabase/serverless`, `@truefoundry/trueforge-sdk`, DeepSeek configured only in local TrueForge, TypeScript, Vitest.

---

### Task 1: Define persistence contracts

**Files:**
- Modify: `lib/database/rehearsals.ts`
- Create: `lib/database/runs.ts`
- Create: `migrations/002_create_runs.sql`
- Test: `tests/runs.test.ts`

**Step 1:** Write contract tests for run statuses and the minimal rehearsal context.

**Step 2:** Add parameterized database helpers for reading the rehearsal, inserting a starting run, persisting the TrueForge session ID, reading a run, and cleanup.

**Step 3:** Add the production `runs` table migration with a foreign key to `rehearsals`, status constraint, and session ID index.

**Step 4:** Run `pnpm test` and confirm the new contract tests pass.

### Task 2: Implement the TrueForge orchestration boundary

**Files:**
- Modify: `lib/trueforge/types.ts`
- Modify: `lib/trueforge/sessions.ts`
- Create: `lib/trueforge/rehearsal-session.ts`
- Test: `tests/trueforge-rehearsal-session.test.ts`

**Step 1:** Write tests for the prompt/context builder that permit only repository owner/name, PR number, commit SHA, and migration path.

**Step 2:** Implement a server-only service that loads the rehearsal, creates a starting run, creates a TrueForge session with a dedicated agent, sends a deterministic DeepSeek confirmation turn, persists the session ID, and marks the run ready.

**Step 3:** Ensure all failures are surfaced without logging credentials and do not call tools or execute migrations.

**Step 4:** Run `pnpm test` and `pnpm typecheck`.

### Task 3: Add live verification and documentation

**Files:**
- Create: `scripts/verify-trueforge-session.ts`
- Modify: `package.json`
- Modify: `.env.example`
- Modify: `README.md`

**Step 1:** Add a cleanup-safe verifier that creates temporary rehearsal/run records, invokes the orchestration service, validates the exact DeepSeek-through-TrueForge reply, verifies the stored session ID, and deletes temporary rows.

**Step 2:** Document the server-only configuration and verifier command without exposing secrets.

**Step 3:** Run lint, typecheck, tests, build, and the live verifier.

### Task 4: Review and handoff

**Files:**
- Verify: feature-branch diff only

**Step 1:** Commit the focused implementation and push `feat/trueforge-rehearsal-session`.

**Step 2:** Open a PR against `main`, wait for CI/Qodo, and address valid findings.

**Step 3:** Do not merge the PR; report the PR URL and verification results.
