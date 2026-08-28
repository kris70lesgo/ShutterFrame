/**
 * The application deliberately has no direct Neon branch or SQL client here.
 * Rehearsal database operations are exposed only as tools from this configured
 * TrueForge MCP server, so preview credentials never enter application logs,
 * prompts, sandbox environment maps, or persisted evidence.
 */
export const NEON_MCP_SERVER_NAME = "neon";

export const requiredNeonMcpTools = [
  "create_branch",
  "run_sql",
  "describe_table_schema",
  "delete_branch",
] as const;
