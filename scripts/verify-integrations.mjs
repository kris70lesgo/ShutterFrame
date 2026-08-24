import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { TrueForge, mergeEventDelta } from "@truefoundry/trueforge-sdk";

const MODEL_PROVIDER = "groq";
const MODEL_ID = "openai/gpt-oss-20b";
const MODEL_NAME = "gpt-oss-20b";
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
const groqApiKey = process.env.GROQ_API_KEY ?? localEnv.GROQ_API_KEY;
const baseUrl = (process.env.TRUEFORGE_BASE_URL ?? localEnv.TRUEFORGE_BASE_URL ?? "http://127.0.0.1:8790").replace(/\/+$/, "");

if (!groqApiKey) {
  throw new Error("GROQ_API_KEY is required in .env.local or the environment.");
}

const client = new TrueForge({ baseUrl, auth: false, timeoutInSeconds: 60, maxRetries: 0 });

await client.server.getCapabilities();

await client.settings.modelProviders.createOrUpdate({
  manifest: {
    type: "custom",
    name: MODEL_PROVIDER,
    baseUrl: "https://api.groq.com/openai/v1",
    auth: { apiKey: groqApiKey },
    models: [{
      modelId: MODEL_ID,
      name: MODEL_NAME,
      properties: { contextLength: 131072, maxOutputTokens: 8192, reasoningEfforts: ["low", "medium", "high"] },
    }],
  },
});

const agents = (await client.agents.list()).data;
const existingAgent = agents.find((agent) => agent.name === "shutterframe-model-check");
const agentManifest = {
  model: { name: `${MODEL_PROVIDER}/${MODEL_NAME}`, params: { temperature: 0.00000001, maxTokens: 128, reasoningEffort: "low" } },
  instructions: `Reply with exactly: ${EXPECTED_RESPONSE}`,
};

if (existingAgent) {
  await client.agents.update(existingAgent.id, { manifest: agentManifest });
} else {
  await client.agents.create({ name: "shutterframe-model-check", manifest: agentManifest });
}

const session = await client.sessions.create({ agent: { name: "shutterframe-model-check" } });
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
  if (event.type === "model.message.delta" && modelMessage) {
    mergeEventDelta(modelMessage, event);
  }
  if (event.type === "model.message.delta") streamedContent += event.content ?? "";
  if (event.type === "turn.done" && event.state.status === "done") {
    response = contentToText(event.state.output?.content).trim();
  }
}

response = contentToText(modelMessage?.content).trim() || streamedContent.trim() || response;

if (response !== EXPECTED_RESPONSE) {
  throw new Error(`TrueForge did not return the expected Groq response: ${JSON.stringify(response)}; events: ${eventTypes.join(", ")}`);
}

console.log("Groq credentials detected: yes");
console.log("Groq provider configured in TrueForge: yes");
console.log(`Model selected: ${MODEL_ID}`);
console.log("TrueForge session created: yes");
console.log(`Groq response received through TrueForge: ${response}`);
