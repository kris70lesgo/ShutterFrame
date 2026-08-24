# Time-Traveler reference analysis

The temporary `34562572-main/` directory was inspected before ShutterFrame was
created. It is a Python/FastAPI, static HTML, Docker Compose, PostgreSQL, and
GitLab Duo-agent project. Its license is MIT (copyright © 2026-present GitLab
Inc.), which permits reuse with notice. ShutterFrame does not reuse its code.

## Useful concepts found

- A migration must be rehearsed in an isolated environment before promotion.
- An explicit lifecycle—analyze, provision, apply, validate, report, approve,
  clean up—keeps production separate from experimentation.
- Deterministic checks must supply safety evidence; an LLM explains evidence but
  should not invent it.
- The original migration auditor's practical checks (destructive DDL, unsafe
  `NOT NULL` additions, transactions, FK/index concerns, and rollback) are good
  starting categories for ShutterFrame's future validation policy.
- A human approval gate must appear only after the evidence report is complete.

## Useful implementation pieces

- `agents/migration_auditor.yml`: helpful risk categories and rollback framing.
- `mcp_bridge.py`: useful *conceptual* isolated-environment lifecycle and
  scoped/idempotent teardown naming.
- `migrations/*.sql`: useful examples of safe, transactional PostgreSQL DDL.
- `flows/time_traveller_flow.yml`: useful separation between analysis, audit,
  provisioning, and smoke testing.

## Pieces reused

None. ShutterFrame contains no copied implementation, prompts, fixtures, or
assets from Time-Traveler.

## Pieces rewritten

- The migration lifecycle is represented with ShutterFrame-specific domain
  types and an explicit status-transition guard.
- Migration fixtures are new, generic `accounts` examples, including a
  deliberately dangerous and a fixed migration.
- The original multi-agent/Docker/GitLab design is replaced with boundaries for
  TrueForge, Neon MCP, GitHub MCP, and Daytona.

## Pieces intentionally discarded

- GitLab Duo agent YAMLs, GitLab API integration, and MR-comment workflow:
  ShutterFrame uses GitHub through TrueForge MCP.
- GCP VM bridge, Docker clone orchestration, Cloud Run fallback, VM metrics,
  and the patient-records app: Neon branches and TrueForge/Daytona are the new
  isolation model; none of the original product is in scope.
- The original branding, README/Devpost submission copy, screenshots, data, and
  static frontend: ShutterFrame has independent product language and UI.

## License and attribution notes

Time-Traveler's MIT license permits reuse with attribution, but no source code
was copied. `THIRD_PARTY_NOTICES.md` records the inspection and license context.

## Mapping from Time-Traveler to ShutterFrame

| Reference concept | ShutterFrame implementation direction |
| --- | --- |
| GitLab MR migration discovery | GitHub MCP through TrueForge |
| Docker/Postgres shadow clone | Temporary Neon branch |
| VM command bridge | TrueForge tool execution + Daytona sandbox |
| Duo agents and flow | TrueForge sessions, model loop, tools, and approvals |
| Risk score narrative | Deterministic validation evidence, then AI explanation |
| MR deploy confirmation | TrueForge human approval checkpoint |
