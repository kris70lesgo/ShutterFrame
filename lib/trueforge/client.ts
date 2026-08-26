import "server-only";

import { TrueForge } from "@truefoundry/trueforge-sdk";
import { serverEnv } from "@/lib/env/server";

/**
 * Keep the generated SDK at the server boundary. React components and domain
 * modules never call TrueForge directly.
 */
export function getTrueForgeClient(timeoutInSeconds = 2) {
  return new TrueForge({
    baseUrl: serverEnv.trueforgeBaseUrl,
    auth: false,
    timeoutInSeconds,
    maxRetries: 0,
  });
}
