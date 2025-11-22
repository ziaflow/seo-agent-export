import { Agent } from "@mastra/core/agent";
import { Memory } from "@mastra/memory";
import { sharedPostgresStorage } from "../storage";
import { seoAnalysisTool } from "../tools/seoAnalysisTool";
import { analyticsTool } from "../tools/analyticsTool";
import { realAnalyticsTool } from "../tools/realAnalyticsTool";
import { searchQueryTool } from "../tools/searchQueryTool";
import { contentGenerationTool } from "../tools/contentGenerationTool";
import { seoSchemaInspectorTool } from "../tools/seoSchemaInspectorTool";
import { keywordRadarTool } from "../tools/keywordRadarTool";
import { automationDecisionTool } from "../tools/automationDecisionTool";
import { monitoringPulseTool } from "../tools/monitoringPulseTool";
import { createOpenAI } from "@ai-sdk/openai";

/**
 * SEO Orchestrator Agent
 * Coordinates SEO analysis, data collection, and content generation
 */

// Configure with Microsoft Foundry or OpenAI
// Falls back to regular OpenAI if Foundry not configured
const openai = createOpenAI({
  baseURL: process.env.MICROSOFT_FOUNDRY_API_BASE_URL || undefined,
  apiKey: process.env.MICROSOFT_FOUNDRY_API_KEY || process.env.OPENAI_API_KEY,
});

export const seoAgent = new Agent({
  name: "SEO Orchestrator Agent",

  instructions: `You are a comprehensive SEO orchestration agent responsible for analyzing websites, collecting analytics data, identifying content opportunities, and generating SEO-optimized content.

Your primary responsibilities:
1. Conduct thorough SEO audits covering on-page, technical, structural, and structured-data (schema) health
2. Analyze marketing data and user behavior patterns across all connected platforms
3. Identify keyword gaps, trend shifts, and content opportunities from search + analytics data
4. Use automation signals to decide when to create new content, then generate SEO-optimized deliverables
5. Emit monitoring pulses when anomalies or critical issues are detected so near-real-time agents can react

When responding:
- Use the appropriate tools to gather comprehensive data
- Prioritize issues by severity and impact
- Provide actionable recommendations with specific next steps
- Synthesize insights from multiple data sources
- Generate content that balances SEO optimization with readability
- Run the SEO Schema Inspector when schema coverage might affect visibility (rich results)
- Use Keyword Radar to quantify opportunity scores before recommending content
- Call the Automation Decision tool to determine whether content creation or remediation is required
- Emit Monitoring Pulse signals for significant traffic drops, schema failures, or UX anomalies
- Always explain your findings in clear, business-focused language

Remember: Your goal is to improve website visibility, drive qualified traffic, and increase conversions through data-driven SEO strategies.`,

  // Use gpt-4o for reliable performance with Microsoft Foundry
  // For GPT-5 models, ensure MICROSOFT_FOUNDRY_API_BASE_URL points to your deployment
  model: openai("gpt-4o"),

  tools: {
    seoAnalysisTool,
    analyticsTool,
    realAnalyticsTool,
    searchQueryTool,
    contentGenerationTool,
    seoSchemaInspectorTool,
    keywordRadarTool,
    automationDecisionTool,
    monitoringPulseTool,
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
