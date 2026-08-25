import "server-only";

import { getTrueForgeClient } from "@/lib/trueforge/client";
import { startRehearsalSessionWithClient } from "@/lib/trueforge/session-client";
import type { TrueForgeSessionRequest, TrueForgeSessionResult } from "@/lib/trueforge/types";

export async function startRehearsalSession(request: TrueForgeSessionRequest): Promise<TrueForgeSessionResult> {
  return startRehearsalSessionWithClient(getTrueForgeClient(60), request);
}
