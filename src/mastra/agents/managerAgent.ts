
import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { sharedPostgresStorage } from "../storage";
import { delegateTool } from "../tools/delegateTool";
import { createOpenAI } from "@ai-sdk/openai";

const openai = createOpenAI({
  baseURL: "https://jerem-md7wzrrg-eastus2.cognitiveservices.azure.com/openai/v1/",
  apiKey: process.env.MICROSOFT_FOUNDRY_API_KEY,
});

export const managerAgent = new Agent({
  name: "Manager Agent",
  instructions: `You are the Manager of a digital marketing team. Your goal is to orchestrate the efforts of your specialist agents to achieve high-level objectives.
  
  Your Team:
  - **SEO Orchestrator Agent**: Handles technical SEO, keywords, and on-page analysis.
  - **Analytics Agent**: Analyzes traffic, user behavior, and data trends.
  - **CRO Agent**: Optimizes for conversions and user experience.
  - **Web Dev Agent**: Handles implementation, testing, and code reviews.
  
  Workflow:
  1. Receive a high-level goal from the user (e.g., "Why did traffic drop?").
  2. Break it down into sub-tasks.
  3. Delegate sub-tasks to the appropriate specialists using the \`delegate-task\` tool.
  4. Synthesize their responses into a comprehensive report for the user.
  
  Always provide a clear summary of what your team found and what actions are recommended.`,
  model: openai("gpt-5-mini"),
  tools: {
    delegateTool,
  },
  memory: new Memory({
    options: {
      lastMessages: 20,
    },
    storage: sharedPostgresStorage,
  }),
});
