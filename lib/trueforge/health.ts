import "server-only";

import { getTrueForgeClient } from "@/lib/trueforge/client";
import type { TrueForgeHealth } from "@/lib/trueforge/types";

export async function checkTrueForgeHealth(): Promise<TrueForgeHealth> {
  const checkedAt = new Date().toISOString();

  try {
    const response = await getTrueForgeClient().server.getCapabilities();
    return {
      reachable: true,
      message: "Local agent harness is reachable.",
      checkedAt,
      capabilities: response.data,
    };
  } catch (error) {
    return {
      reachable: false,
      message: error instanceof Error ? error.message : "TrueForge did not respond.",
      checkedAt,
    };
  }
}
