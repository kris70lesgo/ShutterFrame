import "server-only";

import type { TrueForgeSessionRequest } from "@/lib/trueforge/types";

/**
 * Reserved application-level entry point for a future rehearsal session.
 * TrueForge will own the session, tool calls, sandbox, and approval checkpoint.
 */
export async function startRehearsalSession(_request: TrueForgeSessionRequest) {
  throw new Error("Rehearsal sessions are not implemented during foundation setup.");
}
