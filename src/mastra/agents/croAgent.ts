
import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { sharedPostgresStorage } from "../storage";
import { microsoftClarityTool } from "../tools/microsoftClarityTool";
import { contentGenerationTool } from "../tools/contentGenerationTool";
import { clarityMCPTool } from "../tools/clarityMCPTool";
import { createOpenAI } from "@ai-sdk/openai";

const openai = createOpenAI({
  baseURL: "https://jerem-md7wzrrg-eastus2.cognitiveservices.azure.com/openai/v1/",
  apiKey: process.env.MICROSOFT_FOUNDRY_API_KEY,
});

export const croAgent = new Agent({
  name: "CRO Agent",
  instructions: `You are a Conversion Rate Optimization (CRO) Specialist. Your goal is to improve the percentage of visitors who complete desired actions.
  
  Responsibilities:
  1. Analyze user session recordings and heatmaps (via Clarity tool) to understand friction points.
  2. Suggest A/B tests or content changes.
  3. Use the content generation tool to draft improved copy for landing pages.`,
  model: openai("gpt-5-mini"),
  tools: {
    microsoftClarityTool,
    contentGenerationTool,
    clarityMCPTool,
  },
  memory: new Memory({
    options: {
      lastMessages: 10,
    },
    storage: sharedPostgresStorage,
  }),
});
