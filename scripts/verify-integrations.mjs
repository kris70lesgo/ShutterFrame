import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { TrueForge, mergeEventDelta } from "@truefoundry/trueforge-sdk";

const MODEL_PROVIDER = "deepseek";
const MODEL_ID = "deepseek-v4-flash";
const MODEL_NAME = "deepseek-v4-flash";
const EXPECTED_RESPONSE = "SHUTTERFRAME_MODEL_OK";

function loadLocalEnv() {
  const file = resolve(".env.local");
  if (!existsSync(file)) return {};

  return Object.fromEntries(
    readFileSync(file, "utf8")
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const separator = line.indexOf("=");
        return [line.slice(0, separator), line.slice(separator + 1)];
      }),
  );
}

function contentToText(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content.map((part) => (part.type === "text" ? part.text : "")).join("");
}

const localEnv = loadLocalEnv();
const deepseekApiKey = process.env.DEEPSEEK_API_KEY ?? localEnv.DEEPSEEK_API_KEY;
const baseUrl = (process.env.TRUEFORGE_BASE_URL ?? localEnv.TRUEFORGE_BASE_URL ?? "http://127.0.0.1:8790").replace(/\/+$/, "");

if (!deepseekApiKey) {
  throw new Error("DEEPSEEK_API_KEY is required in .env.local or the environment.");
}

const client = new TrueForge({ baseUrl, auth: false, timeoutInSeconds: 60, maxRetries: 0 });

await client.server.getCapabilities();

await client.settings.modelProviders.createOrUpdate({
  manifest: {
    type: "custom",
    name: MODEL_PROVIDER,
    baseUrl: "https://api.deepseek.com",
    auth: { apiKey: deepseekApiKey },
    models: [
      {
        modelId: MODEL_ID,
        name: MODEL_NAME,
        properties: { contextLength: 1048576, maxOutputTokens: 8192, reasoningEfforts: ["none"] },
      },
    ],
  },
});

const agents = (await client.agents.list()).data;
const existingAgent = agents.find((agent) => agent.name === "shutterframe-model-check");
const agentManifest = {
  model: { name: `${MODEL_PROVIDER}/${MODEL_NAME}`, params: { temperature: 0, maxTokens: 128, thinking: { type: "disabled" } } },
  instructions: `Reply with exactly: ${EXPECTED_RESPONSE}`,
};

if (existingAgent) {
  await client.agents.update(existingAgent.id, { manifest: agentManifest });
} else {
  await client.agents.create({ name: "shutterframe-model-check", manifest: agentManifest });
}

let sessionId;
let failure;
try {
  const session = await client.sessions.create({ agent: { name: "shutterframe-model-check" } });
  sessionId = session.data.id;
  let response = "";
  const eventTypes = [];
  let modelMessage = null;
  let streamedContent = "";
  const events = await client.sessions.createTurnStream(session.data.id, {
    previousTurnId: "none",
    input: [{ type: "user.message", content: `Reply with exactly:\n${EXPECTED_RESPONSE}` }],
  });

  for await (const event of events) {
    eventTypes.push(event.type);
    if (event.type === "model.message") modelMessage = event;
    if (event.type === "model.message.delta" && modelMessage) mergeEventDelta(modelMessage, event);
    if (event.type === "model.message.delta") streamedContent += event.content ?? "";
    if (event.type === "turn.done" && event.state.status === "done") response = contentToText(event.state.output?.content).trim();
  }

  response = contentToText(modelMessage?.content).trim() || streamedContent.trim() || response;
  if (response !== EXPECTED_RESPONSE) throw new Error(`TrueForge did not return the expected DeepSeek response: ${JSON.stringify(response)}; events: ${eventTypes.join(", ")}`);

  console.log("DeepSeek credentials detected: yes");
  console.log("DeepSeek provider configured in TrueForge: yes");
  console.log(`Model selected: ${MODEL_ID}`);
  console.log("TrueForge session created: yes");
  console.log(`DeepSeek response received through TrueForge: ${response}`);
} catch (error) {
  failure = error;
  throw error;
} finally {
  if (sessionId) try { await client.sessions.delete(sessionId); } catch (cleanupError) { if (!failure) throw cleanupError; }
}
