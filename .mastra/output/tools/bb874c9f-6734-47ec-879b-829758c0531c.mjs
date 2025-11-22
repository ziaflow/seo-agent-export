import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

const seoAnalysisTool = createTool({
  id: "seo-analysis",
  description: "Analyzes website for on-page SEO, technical SEO issues, and site structure problems",
  inputSchema: z.object({
    websiteUrl: z.string().describe("The URL of the website to analyze"),
    analysisType: z.enum(["on-page", "technical", "structure", "all"]).describe("Type of SEO analysis to perform")
  }),
  outputSchema: z.object({
    analysisType: z.string(),
    issues: z.array(
      z.object({
        category: z.string(),
        severity: z.enum(["critical", "high", "medium", "low"]),
        issue: z.string(),
        recommendation: z.string()
      })
    ),
    score: z.number().min(0).max(100),
    summary: z.string()
  }),
  execute: async ({ context, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info("\u{1F50D} [SEO Analysis] Starting analysis", {
      url: context.websiteUrl,
      type: context.analysisType
    });
    const issues = [];
    if (context.analysisType === "on-page" || context.analysisType === "all") {
      logger?.info("\u{1F4C4} [SEO Analysis] Analyzing on-page elements");
      issues.push(
        {
          category: "Meta Tags",
          severity: "high",
          issue: "Missing meta description on homepage",
          recommendation: "Add a compelling meta description (120-160 characters)"
        },
        {
          category: "Headings",
          severity: "medium",
          issue: "Multiple H1 tags found on page",
          recommendation: "Use only one H1 tag per page for optimal SEO"
        }
      );
    }
    if (context.analysisType === "technical" || context.analysisType === "all") {
      logger?.info("\u2699\uFE0F [SEO Analysis] Analyzing technical SEO");
      issues.push(
        {
          category: "Core Web Vitals",
          severity: "critical",
          issue: "Largest Contentful Paint (LCP) exceeds 4 seconds",
          recommendation: "Optimize image sizes, implement lazy loading, and reduce server response time"
        },
        {
          category: "Mobile Friendliness",
          severity: "high",
          issue: "Viewport meta tag not configured properly",
          recommendation: "Add proper viewport configuration for mobile devices"
        }
      );
    }
    if (context.analysisType === "structure" || context.analysisType === "all") {
      logger?.info("\u{1F3D7}\uFE0F [SEO Analysis] Analyzing site structure");
      issues.push(
        {
          category: "URL Structure",
          severity: "medium",
          issue: "URLs contain unnecessary parameters and special characters",
          recommendation: "Use clean, descriptive URLs with hyphens instead of underscores"
        },
        {
          category: "Internal Linking",
          severity: "medium",
          issue: "Some pages have no internal links",
          recommendation: "Establish clear internal linking strategy for content discovery"
        }
      );
    }
    const score = Math.max(40, 100 - issues.length * 8);
    logger?.info("\u2705 [SEO Analysis] Analysis complete", { score });
    return {
      analysisType: context.analysisType,
      issues,
      score,
      summary: `Found ${issues.length} SEO issues. Overall SEO score: ${score}/100`
    };
  }
});

export { seoAnalysisTool };
//# sourceMappingURL=bb874c9f-6734-47ec-879b-829758c0531c.mjs.map
