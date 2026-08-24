import { existsSync } from "node:fs";

const version = process.versions.node;
const nodeSupported = Number(version.split(".")[0]) >= 22;
const env = process.env;

function mark(value, yes, no) {
  return `${value ? "✓" : "○"} ${value ? yes : no}`;
}

async function main() {
  console.log("ShutterFrame environment\n");
  console.log(mark(nodeSupported, `Node ${version} supported`, `Node ${version} requires >= 22.13`));
  console.log(mark(existsSync("node_modules"), "required packages installed", "run pnpm install"));
  console.log(mark(existsSync("next.config.ts"), "Next.js configuration present", "Next.js configuration missing"));

  let trueforgeReachable = false;
  try {
    const response = await fetch(`${(env.TRUEFORGE_BASE_URL ?? "http://127.0.0.1:8790").replace(/\/+$/, "")}/api/v1/capabilities`, {
      signal: AbortSignal.timeout(2000),
    });
    trueforgeReachable = response.ok;
  } catch {
    // An offline local harness is expected before a developer starts TrueForge.
  }

  console.log(mark(trueforgeReachable, "TrueForge reachable", "TrueForge not reachable"));
  console.log(mark(Boolean(env.OPENAI_API_KEY), "OpenAI key configured", "OpenAI key not configured"));
  console.log(mark(Boolean(env.NEON_API_KEY && env.NEON_PROJECT_ID), "Neon credentials configured", "Neon credentials not configured"));
  console.log(mark(Boolean(env.DAYTONA_API_KEY), "Daytona configured", "Daytona not configured"));
  console.log(mark(Boolean(env.GITHUB_TOKEN && env.GITHUB_OWNER && env.GITHUB_REPO), "GitHub credentials configured", "GitHub credentials not configured"));
}

await main();
