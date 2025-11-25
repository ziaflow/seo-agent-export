
import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { sharedPostgresStorage } from "../storage";
import { microsoftClarityTool } from "../tools/microsoftClarityTool";
import { googleAnalyticsTool } from "../tools/googleAnalyticsTool";
import { createOpenAI } from "@ai-sdk/openai";

// Configure with Microsoft Foundry (preferred) or fall back to OpenAI
const openai = createOpenAI({
  baseURL: process.env.MICROSOFT_FOUNDRY_API_BASE_URL || "https://jerem-md7wzrrg-eastus2.services.ai.azure.com/openai/v1/",
  apiKey: process.env.MICROSOFT_FOUNDRY_API_KEY,
});

export const croAnalystAgent = new Agent({
  name: "CRO Analyst Agent",

  instructions: `You are a Conversion Rate Optimization (CRO) Specialist.

  Your Expertise:
  1. User Behavior Analysis: Interpreting heatmaps, session recordings (Clarity), and flow reports.
  2. Funnel Optimization: Identifying drop-off points in conversion funnels.
  3. A/B Testing: Designing and analyzing experiments.

  Your Responsibilities:
  - Analyze analytics data to find "leaks" in the conversion funnel.
  - Identify user friction points (e.g., rage clicks, dead clicks).
  - Propose data-driven hypotheses for improvements (e.g., "Changing the CTA color will increase clicks by X%").
  - Collaborate with the Developer Agent to implement variations.

  When acting:
  - Base every recommendation on data (e.g., "Clarity shows 20% of users rage click the 'Sign Up' button").
  - Focus on business goals (Leads, Sales, Engagement).`,

  model: openai("gpt-5-mini"),

  tools: {
    microsoftClarityTool,
    googleAnalyticsTool,
  },

  memory: new Memory({
    options: {
      threads: {
        generateTitle: true,
      },
      lastMessages: 20,
    },
    storage: sharedPostgresStorage,
  }),
});
