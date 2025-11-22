import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { s as storeAutomationDecision } from '../analyticsDb.mjs';
import 'pg';

const automationDecisionTool = createTool({
  id: "automation-decision",
  description: "Evaluates keyword gaps, schema issues, and performance data to decide if new content should be created.",
  inputSchema: z.object({
    websiteUrl: z.string().url(),
    keywordOpportunities: z.array(
      z.object({
        keyword: z.string(),
        opportunityScore: z.number(),
        intent: z.string()
      })
    ).default([]),
    criticalSchemaIssues: z.number().int().default(0),
    trafficTrend: z.enum(["up", "flat", "down"]).default("flat")
  }),
  outputSchema: z.object({
    websiteUrl: z.string(),
    decisionType: z.literal("content_generation"),
    shouldAct: z.boolean(),
    confidence: z.number(),
    reasons: z.array(z.string()),
    evaluatedAt: z.string()
  }),
  execute: async ({ context, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info("\u{1F9E0} [Decision Tool] Evaluating automation decision");
    const avgOpportunity = context.keywordOpportunities.reduce((sum, item) => sum + item.opportunityScore, 0) / (context.keywordOpportunities.length || 1);
    const shouldAct = avgOpportunity >= 70 || context.criticalSchemaIssues > 0 || context.trafficTrend === "down";
    const reasons = [];
    if (avgOpportunity >= 70) {
      reasons.push(`High average opportunity score (${Math.round(avgOpportunity)})`);
    }
    if (context.criticalSchemaIssues > 0) {
      reasons.push(`${context.criticalSchemaIssues} critical schema issue(s) detected`);
    }
    if (context.trafficTrend === "down") {
      reasons.push("Traffic trending down");
    }
    if (reasons.length === 0) {
      reasons.push("Metrics within acceptable thresholds");
    }
    const payload = {
      websiteUrl: context.websiteUrl,
      decisionType: "content_generation",
      shouldAct,
      confidence: Math.min(0.95, 0.5 + reasons.length * 0.1),
      reasons,
      evaluatedAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await storeAutomationDecision(payload);
    logger?.info("\u2705 [Decision Tool] Decision stored", { shouldAct });
    return payload;
  }
});

export { automationDecisionTool };
//# sourceMappingURL=6c0e8f17-b0d7-4fa9-bcd8-2790248386d3.mjs.map
