import { createTool } from "@mastra/core/tools";
import { z } from "zod";

/**
 * SEO Analysis Tool
 * Evaluates on-page, technical, and structural SEO issues
 */
export const seoAnalysisTool = createTool({
  id: "seo-analysis",
  description:
    "Analyzes website for on-page SEO, technical SEO issues, and site structure problems",
  inputSchema: z.object({
    websiteUrl: z.string().describe("The URL of the website to analyze"),
    analysisType: z
      .enum(["on-page", "technical", "structure", "astro", "all"])
      .describe("Type of SEO analysis to perform"),
  }),
  outputSchema: z.object({
    analysisType: z.string(),
    issues: z.array(
      z.object({
        category: z.string(),
        severity: z.enum(["critical", "high", "medium", "low"]),
        issue: z.string(),
        recommendation: z.string(),
      })
    ),
    score: z.number().min(0).max(100),
    summary: z.string(),
  }),
  execute: async ({ context, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info("🔍 [SEO Analysis] Starting analysis", {
      url: context.websiteUrl,
      type: context.analysisType,
    });

    const issues: Array<{
      category: string;
      severity: "critical" | "high" | "medium" | "low";
      issue: string;
      recommendation: string;
    }> = [];

    let html = "";
    try {
        const response = await fetch(context.websiteUrl);
        html = await response.text();
    } catch (error) {
        logger?.error("Failed to fetch website", { error });
        issues.push({
            category: "Accessibility",
            severity: "critical",
            issue: "Website is not accessible",
            recommendation: "Check server status and DNS configuration",
        });
        return {
            analysisType: context.analysisType,
            issues,
            score: 0,
            summary: "Failed to access website.",
        };
    }

    // Real analysis logic
    if (
      context.analysisType === "on-page" ||
      context.analysisType === "all"
    ) {
      logger?.info("📄 [SEO Analysis] Analyzing on-page elements");
      
      const titleMatch = html.match(/<title>(.*?)<\/title>/i);
      if (!titleMatch || !titleMatch[1]) {
          issues.push({
              category: "Meta Tags",
              severity: "high",
              issue: "Missing title tag",
              recommendation: "Add a descriptive title tag.",
          });
      } else if (titleMatch[1].length < 10 || titleMatch[1].length > 60) {
           issues.push({
              category: "Meta Tags",
              severity: "medium",
              issue: `Title tag length is ${titleMatch[1].length} characters (recommended: 10-60)`,
              recommendation: "Optimize title tag length.",
          });
      }

      const metaDescMatch = html.match(/<meta\s+name=["']description["']\s+content=["'](.*?)["']/i);
      if (!metaDescMatch || !metaDescMatch[1]) {
          issues.push({
              category: "Meta Tags",
              severity: "high",
              issue: "Missing meta description",
              recommendation: "Add a compelling meta description (120-160 characters).",
          });
      }

      const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/gi);
      if (!h1Match) {
          issues.push({
              category: "Headings",
              severity: "high",
              issue: "Missing H1 tag",
              recommendation: "Add exactly one H1 tag per page.",
          });
      } else if (h1Match.length > 1) {
          issues.push({
              category: "Headings",
              severity: "medium",
              issue: `Found ${h1Match.length} H1 tags`,
              recommendation: "Use only one H1 tag per page.",
          });
      }
    }

    if (
      context.analysisType === "technical" ||
      context.analysisType === "all"
    ) {
      logger?.info("⚙️ [SEO Analysis] Analyzing technical SEO");
      // Basic check for viewport
      if (!html.includes('name="viewport"')) {
           issues.push({
              category: "Mobile Friendliness",
              severity: "high",
              issue: "Viewport meta tag missing",
              recommendation: "Add <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">",
          });
      }
    }

    if (
      context.analysisType === "structure" ||
      context.analysisType === "all"
    ) {
      logger?.info("🏗️ [SEO Analysis] Analyzing site structure");
      // Basic check for URL structure (context.websiteUrl)
      if (context.websiteUrl.includes('_')) {
        issues.push({
          category: "URL Structure",
          severity: "medium",
          issue: "URL contains underscores",
          recommendation: "Use hyphens instead of underscores in URLs.",
        });
      }
    }

    if (
      context.analysisType === "astro" ||
      context.analysisType === "all"
    ) {
      logger?.info("🚀 [SEO Analysis] Analyzing Astro JS specific optimizations");
      // Simple check for Astro generator tag
      if (!html.includes('name="generator" content="Astro')) {
          // Not necessarily an issue if they hid it, but good to note
      }
      
      // Check for client directives
      if (html.includes('client:load')) {
           issues.push({
              category: "Astro Optimization",
              severity: "low",
              issue: "Found client:load directive",
              recommendation: "Ensure client:load is necessary; prefer client:visible or client:idle.",
          });
      }
    }

    const score = Math.max(0, 100 - issues.length * 10);
    logger?.info("✅ [SEO Analysis] Analysis complete", { score });

    return {
      analysisType: context.analysisType,
      issues,
      score,
      summary: `Found ${issues.length} SEO issues. Overall SEO score: ${score}/100`,
    };
  },
});
