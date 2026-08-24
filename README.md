# ShutterFrame

ShutterFrame helps teams rehearse a proposed PostgreSQL migration in an
isolated, production-like database branch before it reaches production. It
collects deterministic execution evidence, explains the result through an
agent, and requires a human approval checkpoint before any production action.

## Core problem

Schema changes can lock tables, invalidate data, or silently violate integrity
constraints. Code review alone cannot prove what will happen against a real
shape of data. ShutterFrame's intended workflow is:

`GitHub PR → migration → temporary Neon branch → Daytona execution + checks → evidence → TrueForge approval`

## Architecture

The root Next.js application is the UI and narrow server boundary. TrueForge
owns agent sessions, Groq model calls, MCP access, sandbox use, and approval
state. Neon supplies temporary branches; GitHub MCP supplies PR migrations; and
Daytona executes untrusted migration/test work in isolation. See
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Technology stack

- Next.js App Router, React, TypeScript, pnpm
- Tailwind CSS, shadcn/ui-compatible component setup, Lucide
- TrueForge v0.1.4 and `@truefoundry/trueforge-sdk`
- Neon PostgreSQL/MCP, GitHub MCP, and Daytona (configured later through
  TrueForge)
- Vitest and Playwright

## Prerequisites

- Node.js 22.13 or newer (`.nvmrc`)
- Corepack and pnpm 10.28.2
- A Groq API key for TrueForge
- A Neon development project, GitHub integration, and Daytona account only when
  you are ready to configure those capabilities

## Local setup

```bash
corepack enable
pnpm install
cp .env.example .env.local
pnpm run doctor
```

`.env.local` is ignored. Do not place a production database credential in it.

## Starting TrueForge

```bash
pnpm trueforge
```

This runs the official local TrueForge process at `http://127.0.0.1:8790` using
its normal local SQLite storage. In a second terminal, run `pnpm run doctor` or
open the app; both surface whether it is reachable.

## Configuring Groq in TrueForge

TrueForge owns the model integration. Configure Groq as a custom,
OpenAI-compatible provider with base URL `https://api.groq.com/openai/v1` and
the `GROQ_API_KEY` secret. ShutterFrame does not call Groq directly or expose
the key to the browser. `pnpm verify:integrations` configures the local
TrueForge provider and verifies a small harness-mediated agent response using
`openai/gpt-oss-20b`.

With TrueForge running, verify the complete path:

```bash
pnpm verify:integrations
```

It configures the local TrueForge custom provider, creates or refreshes the
minimal `shutterframe-model-check` agent, creates a session, and verifies the
exact `SHUTTERFRAME_MODEL_OK` response. The script never prints credentials.

## Configuring Neon MCP

Create a Neon **development** project and obtain a scoped API key/project ID.
Configure the official Neon MCP server in TrueForge using its current UI or
catalog instructions and the remote MCP endpoint offered by Neon. Supply
`NEON_API_KEY` and `NEON_PROJECT_ID` only for local setup status; configure the
actual credentials in TrueForge. Never authorize production branches.

## Configuring GitHub MCP

Create a GitHub token or app installation with least-privilege access to the
demo repository, then configure the official GitHub MCP server in TrueForge.
Set `GITHUB_OWNER` and `GITHUB_REPO` to identify the demo source. TrueForge
should hold `GITHUB_TOKEN`; it must not be exposed by Next.js or browser code.

## Configuring Daytona

Create a Daytona API key and configure the Daytona sandbox provider in
TrueForge. Store `DAYTONA_API_KEY` in TrueForge's secret/configuration path.
The future agent uses it only to run migration and validation scripts against a
temporary Neon branch.

## Starting Next.js

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). This is a foundation
status screen, not a migration execution dashboard yet.

## Running tests

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
pnpm check
```

Playwright's browser executable is installed separately when you decide to run
the end-to-end suite: `pnpm exec playwright install chromium`.

## Environment variables

See `.env.example`. Only server-side names are used: `TRUEFORGE_BASE_URL`,
`GROQ_API_KEY`, `NEON_API_KEY`, `NEON_PROJECT_ID`, `GITHUB_TOKEN`,
`GITHUB_OWNER`, `GITHUB_REPO`, and `DAYTONA_API_KEY`. None use `NEXT_PUBLIC_`.

## Development workflow

Create a focused branch, run `pnpm check`, open a pull request with the provided
template, and include deterministic evidence for migration-related changes.
The initial unit tests cover migration parsing, validation aggregation, and run
state transitions. Fixtures are deliberately synthetic.

## Qodo workflow

Qodo is not installed as an application dependency. A repository administrator
must authorize its GitHub App, then reviewers should address legitimate findings
on pull requests. See [docs/QODO_SETUP.md](docs/QODO_SETUP.md).

## Reference and attribution note

The temporary Time-Traveler directory was inspected under its MIT license but
has no runtime relationship to ShutterFrame. No code was copied. Details are in
[docs/TIMETRAVELLER_REFERENCE.md](docs/TIMETRAVELLER_REFERENCE.md) and
[THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Current implementation status

The standalone development foundation is complete: application tooling, CI,
status UI, TrueForge SDK connectivity boundary, domain types, test fixtures,
and setup documentation exist. PR ingestion, Neon branch creation, sandbox
execution, deterministic database checks, and TrueForge approval handling are
intentionally future feature work.
