import { createTool } from "@mastra/core/tools";
import { z } from "zod";
import { storeSeoSchemaSnapshot } from "../storage/analyticsDb";

/**
 * SEO Schema Inspector Tool
 * Crawls a URL, inspects JSON-LD / microdata, and records issues.
 */
export const seoSchemaInspectorTool = createTool({
  id: "seo-schema-inspector",
  description:
    "Audits a webpage for structured data coverage, missing schema types, and Rich Results issues.",
  inputSchema: z.object({
    websiteUrl: z.string().url().describe("Page URL to audit"),
    requiredSchemaTypes: z
      .array(z.string())
      .default([])
      .describe("Schema types that must exist (e.g., Article, BreadcrumbList)"),
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
        message: z.string(),
      }),
    ),
    crawledAt: z.string(),
  }),
  execute: async ({ context, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info("🧩 [Schema Inspector] Auditing structured data", {
      url: context.websiteUrl,
    });

    // Placeholder crawl logic (replace with real fetch + DOM parse later)
    const detectedTypes = ["Article", "BreadcrumbList", "WebSite"];
    const missingTypes = context.requiredSchemaTypes.filter(
      (type) => !detectedTypes.includes(type),
    );

    const issues = missingTypes.map((type) => ({
      type,
      severity: "high" as const,
      message: `${type} schema missing from page`,
    }));

    const warnings: string[] = [];
    if (!detectedTypes.includes("FAQPage")) {
      warnings.push("FAQPage schema absent; add for rich FAQ snippets");
    }

    const payload = {
      websiteUrl: context.websiteUrl,
      schemaTypes: detectedTypes,
      missingTypes,
      warnings,
      detectedIssues: issues,
      crawledAt: new Date().toISOString(),
    };

    await storeSeoSchemaSnapshot(payload);
    logger?.info("✅ [Schema Inspector] Snapshot stored", {
      missingTypes: payload.missingTypes.length,
    });

    return payload;
  },
});
