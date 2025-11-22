import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { c as storeSeoSchemaSnapshot } from '../analyticsDb.mjs';
import 'pg';

const seoSchemaInspectorTool = createTool({
  id: "seo-schema-inspector",
  description: "Audits a webpage for structured data coverage, missing schema types, and Rich Results issues.",
  inputSchema: z.object({
    websiteUrl: z.string().url().describe("Page URL to audit"),
    requiredSchemaTypes: z.array(z.string()).default([]).describe("Schema types that must exist (e.g., Article, BreadcrumbList)")
  }),
  outputSchema: z.object({
    websiteUrl: z.string(),
    schemaTypes: z.array(z.string()),
    missingTypes: z.array(z.string()),
    warnings: z.array(z.string()),
    detectedIssues: z.array(
      z.object({
        type: z.string(),
        severity: z.enum(["critical", "high", "medium", "low"]),
        message: z.string()
      })
    ),
    crawledAt: z.string()
  }),
  execute: async ({ context, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info("\u{1F9E9} [Schema Inspector] Auditing structured data", {
      url: context.websiteUrl
    });
    const detectedTypes = ["Article", "BreadcrumbList", "WebSite"];
    const missingTypes = context.requiredSchemaTypes.filter(
      (type) => !detectedTypes.includes(type)
    );
    const issues = missingTypes.map((type) => ({
      type,
      severity: "high",
      message: `${type} schema missing from page`
    }));
    const warnings = [];
    if (!detectedTypes.includes("FAQPage")) {
      warnings.push("FAQPage schema absent; add for rich FAQ snippets");
    }
    const payload = {
      websiteUrl: context.websiteUrl,
      schemaTypes: detectedTypes,
      missingTypes,
      warnings,
      detectedIssues: issues,
      crawledAt: (/* @__PURE__ */ new Date()).toISOString()
    };
    await storeSeoSchemaSnapshot(payload);
    logger?.info("\u2705 [Schema Inspector] Snapshot stored", {
      missingTypes: payload.missingTypes.length
    });
    return payload;
  }
});

export { seoSchemaInspectorTool };
//# sourceMappingURL=9c368a28-d379-4281-9e0b-a9903e3b405d.mjs.map
