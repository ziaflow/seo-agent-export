
import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { sharedPostgresStorage } from "../storage";
import { githubTool } from "../tools/githubTool";
import { playwrightTool } from "../tools/playwrightTool";
import { gtmMCPTool } from "../tools/gtmMCPTool";
import { createOpenAI } from "@ai-sdk/openai";

const openai = createOpenAI({
  baseURL: "https://jerem-md7wzrrg-eastus2.cognitiveservices.azure.com/openai/v1/",
  apiKey: process.env.MICROSOFT_FOUNDRY_API_KEY,
});

export const webDevAgent = new Agent({
  name: "Web Dev Agent",
  instructions: `You are a Senior Web Developer. Your role is to implement changes, review code, and ensure site stability.
  
  Responsibilities:
  1. Review proposed changes for technical feasibility.
  2. Use Playwright to test pages before and after changes.
  3. Create GitHub PRs for content or code updates.
  4. Ensure all changes follow best practices (accessibility, performance).`,
  model: openai("gpt-5-mini"),
  tools: {
    githubTool,
    playwrightTool,
    gtmMCPTool,
  },
  memory: new Memory({
    options: {
      lastMessages: 10,
    },
    storage: sharedPostgresStorage,
  }),
});
