
import { createTool } from "@mastra/core/tools";
import { z } from "zod";

export const delegateTool = createTool({
  id: "delegate-task",
  description: "Delegate a task to another agent",
  inputSchema: z.object({
    agentName: z.enum(["SEO Orchestrator Agent", "Analytics Agent", "CRO Agent", "Web Dev Agent"]).describe("Name of the agent to delegate to"),
    task: z.string().describe("The task or question for the target agent"),
  }),
  outputSchema: z.object({
    response: z.string(),
  }),
  execute: async ({ context, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info(`Delegating to ${context.agentName}`, { task: context.task });

    const agent = mastra?.getAgent(context.agentName);

    if (!agent) {
      throw new Error(`Agent ${context.agentName} not found`);
    }

    const result = await agent.generate(context.task);

    return {
      response: result.text,
    };
  },
});
