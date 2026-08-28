# Rehearsal Engine Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Run one persisted migration rehearsal end-to-end with a TrueForge session, a disposable Neon branch, a Daytona sandbox, deterministic checks, redacted evidence, and guaranteed infrastructure cleanup.

**Architecture:** A server-only route starts a narrowly scoped TrueForge session. The agent receives only repository metadata, uses the configured official Neon MCP for every branch and SQL action, and uses its TrueForge-managed Daytona sandbox only for repository checkout and static work. It never receives a database URL, password, or API key. The server persists only redacted tool outcomes, IDs, fingerprints, and validation summaries.

**Tech Stack:** Next.js route handlers, TypeScript, `@neondatabase/serverless`, TrueForge SDK/local runtime, official Neon MCP, TrueForge's Daytona sandbox provider, Vitest.

---

### Task 1: Reconcile run persistence and evidence storage

**Files:**
- Modify: `lib/database/runs.ts`
- Create: `lib/database/evidence.ts`
- Create: `lib/database/logs.ts`
- Create: `migrations/003_rehearsal_engine.sql`

**Step 1:** Extend persisted run status transitions and resource IDs without assuming a fresh database.

**Step 2:** Add small, server-only repositories for structured evidence and redacted execution logs.

**Step 3:** Add an idempotent migration for indexes and status compatibility.

### Task 2: Add TrueForge-managed infrastructure adapters

**Files:**
- Replace: `lib/database/neon.ts`
- Create: `lib/trueforge/rehearsal-engine-agent.ts`
- Modify: `lib/env/server.ts`

**Step 1:** Register/verify the official Neon MCP provider in TrueForge using server-side header auth, with redacted settings responses.

**Step 2:** Create an agent with Neon MCP tools and TrueForge's Daytona sandbox enabled; direct it to use `sandbox.exec` only for checkout/static work.

**Step 3:** Prohibit database URLs and credentials from agent context, `sandbox.exec` environments, logs, and evidence.

### Task 3: Build the rehearsal engine and API

**Files:**
- Create: `lib/rehearsal-engine/index.ts`
- Create: `lib/rehearsal-engine/validation.ts`
- Create: `lib/rehearsal-engine/redaction.ts`
- Create: `app/api/rehearsals/[id]/run/route.ts`

**Step 1:** Enforce a single active run per rehearsal and create the existing TrueForge session first.

**Step 2:** Clone the configured repository and verify the exact head SHA in Daytona; send migration SQL only as repository content to Neon MCP, then run deterministic database checks through Neon MCP.

**Step 3:** Persist evidence/logs, classify completed/blocked/failed outcomes, and clean up the sandbox and Neon branch in `finally`.

### Task 4: Verification and tests

**Files:**
- Create: `scripts/verify-rehearsal-engine.ts`
- Modify: `package.json`
- Create: `tests/rehearsal-engine.test.ts`
- Create: `tests/redaction.test.ts`

**Step 1:** Unit-test status transitions, failure classification, cleanup ordering, evidence persistence, and redaction with injected adapters.

**Step 2:** Add a live verifier that creates a temporary rehearsal from a fixture PR, executes it, confirms persisted evidence/logs, and reports cleanup.

**Step 3:** Run lint, typecheck, tests, build, and the live verifier; then push one PR targeting `main` and wait for Qodo without merging.
