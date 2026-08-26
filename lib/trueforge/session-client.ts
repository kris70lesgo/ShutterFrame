import { TrueForge, mergeEventDelta } from "@truefoundry/trueforge-sdk";
import { TRUEFORGE_REHEARSAL_RESPONSE, buildRehearsalContextPrompt } from "@/lib/trueforge/rehearsal-context";
import type { TrueForgeSessionRequest, TrueForgeSessionResult } from "@/lib/trueforge/types";

const AGENT_NAME = "shutterframe-rehearsal-session";

function contentToText(content: unknown) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";
  return content.map((part) => (part && typeof part === "object" && "type" in part && part.type === "text" && "text" in part && typeof part.text === "string" ? part.text : "")).join("");
}

export async function startRehearsalSessionWithClient(client: TrueForge, request: TrueForgeSessionRequest): Promise<TrueForgeSessionResult> {
  const agentManifest = {
    model: { name: "groq/gpt-oss-20b", params: { temperature: 0.00000001, maxTokens: 128, reasoningEffort: "low" } },
    instructions: `You are the ShutterFrame rehearsal session harness. Do not invoke MCP tools, sandboxes, or external actions. Use only the supplied rehearsal context and reply with exactly: ${TRUEFORGE_REHEARSAL_RESPONSE}`,
  };
  const existingAgent = (await client.agents.list()).data.find((agent) => agent.name === AGENT_NAME);
  if (existingAgent) await client.agents.update(existingAgent.id, { manifest: agentManifest });
  else await client.agents.create({ name: AGENT_NAME, manifest: agentManifest });

  const session = await client.sessions.create({ agent: { name: AGENT_NAME } });
  let response = "";
  let streamedContent = "";
  let modelMessage = null;
  let failure: unknown;

  try {
    const events = await client.sessions.createTurnStream(session.data.id, {
      previousTurnId: "none",
      input: [{ type: "user.message", content: buildRehearsalContextPrompt(request.rehearsal) }],
    });

    for await (const event of events) {
      if (event.type === "model.message") modelMessage = event;
      if (event.type === "model.message.delta" && modelMessage) mergeEventDelta(modelMessage, event);
      if (event.type === "model.message.delta") streamedContent += event.content ?? "";
      if (event.type === "turn.done" && event.state.status === "done") response = contentToText(event.state.output?.content).trim();
    }

    response = contentToText(modelMessage?.content).trim() || streamedContent.trim() || response;
    if (response !== TRUEFORGE_REHEARSAL_RESPONSE) throw new Error("TrueForge did not return the expected rehearsal response.");
    return { sessionId: session.data.id, response };
  } catch (error) {
    failure = error;
    throw error;
  } finally {
    if (failure) try { await client.sessions.delete(session.data.id); } catch { /* Preserve the original turn error. */ }
  }
}
