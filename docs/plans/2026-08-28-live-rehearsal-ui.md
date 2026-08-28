# Live Rehearsal UI Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Finish the rehearsal engine, then expose persisted rehearsals, evidence, logs, and human approval through the existing light operations UI.

**Architecture:** Phase 1 retains trusted server-side GitHub artifact retrieval and TrueForge-controlled Daytona/Neon work. Phase 2 adds server-rendered database views and narrow mutation routes for approval, with polling only for active runs.

**Tech Stack:** Next.js App Router, TypeScript, Neon PostgreSQL, TrueForge, Tailwind, existing UI primitives.

---

### Task 1: Finish Phase-1 verifier

**Files:**
- Modify: `lib/rehearsal-engine/index.ts`
- Modify: `scripts/verify-rehearsal-engine.ts`
- Test: `tests/rehearsal-engine-classification.test.ts`

**Steps:** Run the real fixture; normalize artifact-stage evidence and verifier labels; add a deterministic blocked migration test; run lint, typecheck, tests, build, and the verifier.

### Task 2: Read-model and approval boundary

**Files:**
- Create: `lib/database/rehearsal-views.ts`
- Create: `lib/database/approvals.ts`
- Create: `app/api/runs/[id]/approval/route.ts`
- Test: `tests/approvals.test.ts`

**Steps:** Query latest run/evidence/logs without secrets; permit one auditable approval decision only for completed runs; test completed/blocked behavior.

### Task 3: Live routes and detail UI

**Files:**
- Modify/Create: `app/dashboard/page.tsx`, `app/rehearsals/page.tsx`, `app/rehearsals/[id]/page.tsx`
- Create: `components/shutterframe/rehearsal-detail.tsx`
- Test: `tests/rehearsal-stage-mapping.test.ts`

**Steps:** Render real data, progress stages, evidence, logs, terminal/empty/error states, and approval audit with no credential-bearing payloads.

### Task 4: Verify Phase 2

**Steps:** Manually exercise dashboard/list/detail/approval, run lint, typecheck, tests, and build; push/open the single Phase-2 PR only after Phase 1’s PR is clean according to the requested workflow.
