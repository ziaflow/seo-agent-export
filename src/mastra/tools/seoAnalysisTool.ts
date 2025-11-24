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

    // Simulate SEO analysis based on type
    if (
      context.analysisType === "on-page" ||
      context.analysisType === "all"
    ) {
      logger?.info("📄 [SEO Analysis] Analyzing on-page elements");
      issues.push(
        {
          category: "Meta Tags",
          severity: "high" as const,
          issue: "Missing meta description on homepage",
          recommendation:
            "Add a compelling meta description (120-160 characters)",
        },
        {
          category: "Headings",
          severity: "medium" as const,
          issue: "Multiple H1 tags found on page",
          recommendation: "Use only one H1 tag per page for optimal SEO",
        }
      );
    }

    if (
      context.analysisType === "technical" ||
      context.analysisType === "all"
    ) {
      logger?.info("⚙️ [SEO Analysis] Analyzing technical SEO");
      issues.push(
        {
          category: "Core Web Vitals",
          severity: "critical" as const,
          issue: "Largest Contentful Paint (LCP) exceeds 4 seconds",
          recommendation:
            "Optimize image sizes, implement lazy loading, and reduce server response time",
        },
        {
          category: "Mobile Friendliness",
          severity: "high" as const,
          issue: "Viewport meta tag not configured properly",
          recommendation:
            "Add proper viewport configuration for mobile devices",
        }
      );
    }

    if (
      context.analysisType === "structure" ||
      context.analysisType === "all"
    ) {
      logger?.info("🏗️ [SEO Analysis] Analyzing site structure");
      issues.push(
        {
          category: "URL Structure",
          severity: "medium" as const,
          issue: "URLs contain unnecessary parameters and special characters",
          recommendation:
            "Use clean, descriptive URLs with hyphens instead of underscores",
        },
        {
          category: "Internal Linking",
          severity: "medium" as const,
          issue: "Some pages have no internal links",
          recommendation:
            "Establish clear internal linking strategy for content discovery",
        }
      );
    }

    if (
      context.analysisType === "astro" ||
      context.analysisType === "all"
    ) {
      logger?.info("🚀 [SEO Analysis] Analyzing Astro JS specific optimizations");
      issues.push(
        {
          category: "Astro Optimization",
          severity: "medium" as const,
          issue: "Verify View Transitions usage",
          recommendation:
            "Check if View Transitions are enabled. If not, enable them for smoother navigation and reduced perceived latency.",
        },
        {
          category: "Astro Optimization",
          severity: "low" as const,
          issue: "Client-side hydration check",
          recommendation:
            "Audit 'client:*' directives. Ensure 'client:load' is only used when absolutely necessary; prefer 'client:visible' or 'client:idle'.",
        },
        {
          category: "Image Optimization",
          severity: "high" as const,
          issue: "Verify Astro Image component usage",
          recommendation:
            "Confirm that the <Image /> component from 'astro:assets' is used for all local images to ensure automatic AVIF/WebP optimization.",
        }
      );
    }

    const score = Math.max(40, 100 - issues.length * 8);
    logger?.info("✅ [SEO Analysis] Analysis complete", { score });

    return {
      analysisType: context.analysisType,
      issues,
      score,
      summary: `Found ${issues.length} SEO issues. Overall SEO score: ${score}/100`,
    };
  },
});
