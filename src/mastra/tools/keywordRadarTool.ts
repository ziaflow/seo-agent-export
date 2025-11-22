import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { storeKeywordRadarInsights } from "../storage/analyticsDb";

/**
 * Keyword Radar Tool
 * Aggregates keyword intel, trends, and opportunity scores.
 */
export const keywordRadarTool = createTool({
  id: "keyword-radar",
  description:
    "Analyzes industry keywords, calculates opportunity scores, and highlights trending topics.",
  inputSchema: z.object({
    industry: z.string().describe("Industry or niche to analyze"),
    seedKeywords: z.array(z.string()).optional(),
    geography: z.string().optional().describe("Geographic focus like US, EU, global"),
  }),
  outputSchema: z.object({
    industry: z.string(),
    focusKeywords: z.array(
      z.object({
        keyword: z.string(),
        searchVolume: z.number(),
        difficulty: z.number(),
        opportunityScore: z.number(),
        intent: z.string(),
      }),
    ),
    trendSignals: z.array(z.object({ topic: z.string(), delta: z.string() })),
    generatedAt: z.string(),
  }),
  execute: async ({ context, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info("📡 [Keyword Radar] Running analysis", {
      industry: context.industry,
      seeds: context.seedKeywords?.length ?? 0,
    });

    // Placeholder logic – replace with real Search Console + SERP integrations.
    const focusKeywords = [
      {
        keyword: `${context.industry} automation software`,
        searchVolume: 5400,
        difficulty: 38,
        opportunityScore: 82,
        intent: "commercial",
      },
      {
        keyword: `${context.industry} best practices`,
        searchVolume: 2900,
        difficulty: 32,
        opportunityScore: 77,
        intent: "informational",
      },
      {
        keyword: `${context.industry} pricing`,
        searchVolume: 1800,
        difficulty: 45,
        opportunityScore: 68,
        intent: "transactional",
      },
    ];

    const trendSignals = [
      { topic: `${context.industry} AI`, delta: "up 65%" },
      { topic: `${context.industry} templates`, delta: "up 41%" },
    ];

    const payload = {
      industry: context.industry,
      focusKeywords,
      trendSignals,
      generatedAt: new Date().toISOString(),
    };

    await storeKeywordRadarInsights(payload);
    logger?.info("✅ [Keyword Radar] Insights stored", {
      keywordsTracked: focusKeywords.length,
    });

    return payload;
  },
});
