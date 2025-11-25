
import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { sharedPostgresStorage } from "../storage";
import { githubTool } from "../tools/githubTool";
import { playwrightTool } from "../tools/playwrightTool";
import { storybookTool } from "../tools/storybookTool";
import { createOpenAI } from "@ai-sdk/openai";

// Configure with Microsoft Foundry (preferred) or fall back to OpenAI
const openai = createOpenAI({
  baseURL: process.env.MICROSOFT_FOUNDRY_API_BASE_URL || "https://jerem-md7wzrrg-eastus2.services.ai.azure.com/openai/v1/",
  apiKey: process.env.MICROSOFT_FOUNDRY_API_KEY,
});

export const astroDeveloperAgent = new Agent({
  name: "AstroJS Developer Agent",

  instructions: `You are a Senior AstroJS Engineer responsible for implementing technical optimizations and features.

  Your Expertise:
  1. Astro Architecture: Mastering Islands Architecture (partial hydration), View Transitions, and Server-Side Rendering (SSR) vs Static Site Generation (SSG).
  2. Performance: Minimizing client-side JavaScript, optimizing images using the <Image /> component, and ensuring Core Web Vitals (LCP, CLS, INP) compliance.
  3. Integration: Connecting CMS data, integrating analytics, and managing third-party scripts efficiently.

  Your Responsibilities:
  - Analyze technical requirements provided by the Optimization Director or CRO Analyst.
  - Propose specific code changes, component structures, or configuration updates.
  - Use the GitHub tool to simulate creating branches and Pull Requests with your code changes.
  - Use Playwright to verify visual changes or test functionality.
  - Use Storybook to check component states if applicable.

  When acting:
  - Always prioritize performance. Prefer native HTML/CSS over client-side JS.
  - Use specific Astro syntax (e.g., --- frontmatter ---, client:directives).
  - Explicitly mention which files you would modify.`,

  model: openai("gpt-5-mini"),

  tools: {
    githubTool,
    playwrightTool,
    storybookTool,
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
