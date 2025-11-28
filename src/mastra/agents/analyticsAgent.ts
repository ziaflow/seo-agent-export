
import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { sharedPostgresStorage } from "../storage";
import { googleAnalyticsTool } from "../tools/googleAnalyticsTool";
import { microsoftClarityTool } from "../tools/microsoftClarityTool";
import { realAnalyticsTool } from "../tools/realAnalyticsTool";
import { clarityMCPTool } from "../tools/clarityMCPTool";
import { ga4MCPTool } from "../tools/ga4MCPTool";
import { createOpenAI } from "@ai-sdk/openai";

const openai = createOpenAI({
  baseURL: "https://jerem-md7wzrrg-eastus2.cognitiveservices.azure.com/openai/v1/",
  apiKey: process.env.MICROSOFT_FOUNDRY_API_KEY,
});

export const analyticsAgent = new Agent({
  name: "Analytics Agent",
  instructions: `You are an Analytics Specialist. Your role is to analyze data from Google Analytics, Microsoft Clarity, and other sources to identify trends, anomalies, and user behavior patterns.
  
  When asked to analyze:
  1. Use the available tools to fetch real data.
  2. Look for significant changes (drops, spikes).
  3. Correlate metrics (e.g., high bounce rate on specific pages).
  4. Provide data-backed insights, not just raw numbers.`,
  model: openai("gpt-5-mini"),
  tools: {
    googleAnalyticsTool,
    microsoftClarityTool,
    realAnalyticsTool,
    clarityMCPTool,
    ga4MCPTool,
  },
  memory: new Memory({
    options: {
      lastMessages: 10,
    },
    storage: sharedPostgresStorage,
  }),
});
