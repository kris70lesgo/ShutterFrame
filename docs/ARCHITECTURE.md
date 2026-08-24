# ShutterFrame architecture

ShutterFrame has one purpose: rehearse a proposed PostgreSQL migration safely
before it can be considered for production. The Next.js application is a
control surface, not an agent runtime, database-cloning service, or sandbox.

```text
Next.js ShutterFrame UI + route handlers
        |
        v
TrueForge (local in development)
  - sessions, model calls, tools, approvals
  - persistent local SQLite state
        |
        v
Groq (OpenAI-compatible inference)
        |
        v
GitHub MCP + Neon MCP + Daytona sandbox
        |
        v
deterministic migration + checks
        |
        v
execution evidence report → TrueForge approval checkpoint
```

## Ownership boundaries

- **Next.js:** renders status and later brokers narrow, application-specific
  requests to TrueForge through `lib/trueforge`. It never runs agent-created
  shell/SQL code and never exposes secrets to the browser.
- **TrueForge:** owns sessions, Groq model calls, MCP tool calls, sandbox use,
  execution history, and human approval checkpoints. Local mode runs at
  `http://127.0.0.1:8790` with its normal SQLite storage.
- **Neon MCP:** creates and destroys temporary *development* branches. A future
  agent must use scoped credentials and must never be granted production access.
- **GitHub MCP:** reads only the designated pull request and its SQL migrations.
- **Daytona:** runs migration/test scripts in a sandbox; the Next.js server must
  never execute arbitrary agent-generated code.

## Foundation boundaries

`lib/migrations` contains small domain types, migration parsing, and permissible
run status transitions. `lib/validation` models deterministic results. The
database and GitHub directories are interfaces, intentionally not ad hoc client
implementations. The actual future orchestration belongs in TrueForge.
