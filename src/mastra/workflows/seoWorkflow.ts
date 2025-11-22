import { createStep, createWorkflow } from "../inngest";
import { z } from "zod";
import { seoAgent } from "../agents/seoAgent";
import {
  storeAnalyticsData,
  storeSeoAudit,
  storeContentOpportunity,
  storeGeneratedContent,
  storeSeoSchemaSnapshot,
  storeKeywordRadarInsights,
  storeAutomationDecision,
  storeMonitoringPulse,
} from "../storage/analyticsDb";

/**
 * SEO Analysis Step
 * Evaluates website SEO health
 */
const analyzeSeoDemands = createStep({
  id: "analyze-seo",
  description: "Analyzes website SEO including on-page, technical, and structural elements",
  inputSchema: z.object({
    websiteUrl: z
      .string()
      .optional()
      .describe("Website URL to analyze (default: example.com)"),
  }),
  outputSchema: z.object({
    seoAnalysis: z.string(),
    criticalIssuesCount: z.number(),
    websiteUrl: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info("🚀 [SEO Workflow] Step 1: Analyzing SEO metrics...");

    const url = inputData.websiteUrl || "https://example.com";
    const prompt = `
      Perform a comprehensive SEO analysis for ${url}.
      
      Please:
      1. Use the seoAnalysisTool to audit on-page, technical, and structural elements
      2. Identify critical issues that need immediate attention
      3. Provide a summary of findings and recommendations
      4. Suggest priority actions for improvement
      
      Format your response as a structured SEO audit report.
    `;

    const response = await seoAgent.generateLegacy([
      { role: "user", content: prompt },
    ]);

    // Store SEO audit in database
    try {
      await storeSeoAudit({
        websiteUrl: url,
        score: 75, // Default score, could be parsed from response in production
        issues: [],
        auditDate: new Date().toISOString(),
      });
      logger?.info("💾 [SEO Workflow] SEO audit stored in database");
    } catch (error) {
      logger?.error("❌ [SEO Workflow] Failed to store SEO audit", { error });
    }

    logger?.info("✅ [SEO Workflow] SEO analysis complete");

    return {
      seoAnalysis: response.text,
      criticalIssuesCount: 3, // Could be parsed from tool responses in production
      websiteUrl: url,
    };
  },
});

/**
 * SEO Schema Validation Step
 */
const validateSeoSchema = createStep({
  id: "validate-schema",
  description: "Validates structured data coverage and stores schema snapshots",
  inputSchema: z.object({
    websiteUrl: z.string(),
    seoAnalysis: z.string(),
  }),
  outputSchema: z.object({
    websiteUrl: z.string(),
    schemaSummary: z.string(),
    criticalSchemaIssues: z.number(),
  }),
  execute: async ({ inputData, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info("🧩 [SEO Workflow] Step 2: Validating SEO schema...");

    const prompt = `
      Using the SEO schema inspector tool, audit ${inputData.websiteUrl} for structured data coverage.
      - Required schema types: Article, BreadcrumbList, FAQPage
      - Report missing or invalid schema
      - Return a concise summary of issues
    `;

    const response = await seoAgent.generateLegacy([
      { role: "user", content: prompt },
    ]);

    const criticalIssues = response.text.includes("critical") ? 1 : 0;

    try {
      await storeSeoSchemaSnapshot({
        websiteUrl: inputData.websiteUrl,
        schemaTypes: ["Article", "BreadcrumbList"],
        missingTypes: ["FAQPage"],
        warnings: [],
        detectedIssues: [],
        crawledAt: new Date().toISOString(),
      });
    } catch (error) {
      logger?.error("❌ Failed to store schema snapshot", { error });
    }

    return {
      websiteUrl: inputData.websiteUrl,
      schemaSummary: response.text,
      criticalSchemaIssues: criticalIssues,
    };
  },
});

/**
 * Analytics Data Collection Step
 * Gathers marketing metrics and insights
 */
const collectAnalyticsData = createStep({
  id: "collect-analytics",
  description: "Collects and analyzes marketing data including traffic and conversions",
  inputSchema: z.object({
    seoAnalysis: z.string(),
    websiteUrl: z.string(),
    schemaSummary: z.string(),
    criticalSchemaIssues: z.number(),
  }),
  outputSchema: z.object({
    analyticsInsights: z.string(),
    recommendedKeywords: z.array(z.string()),
    websiteUrl: z.string(),
    schemaSummary: z.string(),
    criticalSchemaIssues: z.number(),
  }),
  execute: async ({ inputData, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info("📊 [SEO Workflow] Step 2: Collecting analytics data...");

    const prompt = `
      Based on the SEO analysis provided, perform a comprehensive analytics review:
      
      SEO Analysis Context:
      ${inputData.seoAnalysis}
      
      Please:
      1. Use the realAnalyticsTool to fetch data from ALL platforms: google_analytics, meta_pixel, tiktok_pixel, microsoft_clarity
      2. Request all metrics: traffic, conversions, engagement, behavior
      3. For time range, use: last-30-days
      
      NOTE: The analytics tool provides structured mock data for demonstration purposes. 
      When API credentials are configured, it will fetch real data from these platforms.
      
      Analyze the data to:
      - Understand user behavior and engagement patterns
      - Identify conversion opportunities
      - Spot technical issues (rage clicks, dead clicks from Clarity)
      - Recommend specific optimizations
      
      Provide actionable insights based on the data structure.
    `;

    const response = await seoAgent.generateLegacy([
      { role: "user", content: prompt },
    ]);

    // Store analytics data in database
    try {
      await storeAnalyticsData({
        source: "multi_platform",
        metric_type: "aggregated_analytics",
        date: new Date().toISOString(),
        data: {
          insights: response.text,
          timestamp: new Date().toISOString(),
        },
      });
      logger?.info("💾 [SEO Workflow] Analytics data stored in database");
    } catch (error) {
      logger?.error("❌ [SEO Workflow] Failed to store analytics data", { error });
    }

    logger?.info("✅ [SEO Workflow] Analytics collection complete");

    return {
      analyticsInsights: response.text,
      recommendedKeywords: [
        "seo optimization",
        "content marketing",
        "digital strategy",
      ],
      websiteUrl: inputData.websiteUrl,
      schemaSummary: inputData.schemaSummary,
      criticalSchemaIssues: inputData.criticalSchemaIssues,
    };
  },
});

/**
 * Keyword & Content Opportunities Step
 * Identifies gaps and trending topics
 */
const identifyContentOpportunities = createStep({
  id: "identify-opportunities",
  description: "Identifies keyword gaps and content opportunities from search data",
  inputSchema: z.object({
    analyticsInsights: z.string(),
    websiteUrl: z.string(),
    schemaSummary: z.string(),
    criticalSchemaIssues: z.number(),
  }),
  outputSchema: z.object({
    contentStrategy: z.string(),
    priorityKeywords: z.array(z.string()),
    websiteUrl: z.string(),
    schemaSummary: z.string(),
    criticalSchemaIssues: z.number(),
    keywordRadar: z.string(),
    keywordOpportunities: z.array(
      z.object({ keyword: z.string(), opportunityScore: z.number() }),
    ),
  }),
  execute: async ({ inputData, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info("🔎 [SEO Workflow] Step 3: Identifying content opportunities...");

    const prompt = `
      Based on the analytics insights provided, conduct a comprehensive search query and keyword analysis:
      
      Analytics Context:
      ${inputData.analyticsInsights}
      
      Please:
      1. Use the searchQueryTool to analyze the industry for opportunities, gaps, and trending topics
      2. Identify high-priority keywords with good opportunity scores
      3. Find content gaps where competitors are not ranking
      4. Discover trending topics in the industry
      5. Create a strategic content roadmap
      6. Recommend specific content pieces to create
      
      Prioritize opportunities by potential impact and achievability.
    `;

    const response = await seoAgent.generateLegacy([
      { role: "user", content: prompt },
    ]);

    // Store content opportunities in database
    const priorityKeywords = ["seo best practices", "content optimization", "keyword research"];
    try {
      for (const keyword of priorityKeywords) {
        await storeContentOpportunity({
          keyword,
          searchVolume: 1000,
          difficulty: 40,
          intent: "informational",
          opportunity: "High-value keyword identified from search query analysis",
        });
      }
      logger?.info("💾 [SEO Workflow] Content opportunities stored in database");
    } catch (error) {
      logger?.error("❌ [SEO Workflow] Failed to store content opportunities", { error });
    }

    logger?.info("✅ [SEO Workflow] Content opportunities identified");

    const keywordRadarSummary = "Keyword radar placeholder";

    return {
      contentStrategy: response.text,
      priorityKeywords,
      websiteUrl: inputData.websiteUrl,
      schemaSummary: inputData.schemaSummary,
      criticalSchemaIssues: inputData.criticalSchemaIssues,
      keywordRadar: keywordRadarSummary,
      keywordOpportunities: priorityKeywords.map((keyword) => ({
        keyword,
        opportunityScore: 75,
      })),
    };
  },
});

/**
 * Automation decision step
 */
const evaluateAutomationDecision = createStep({
  id: "automation-decision",
  description: "Evaluates whether new content should be created based on schema + keyword data",
  inputSchema: z.object({
    websiteUrl: z.string(),
    schemaSummary: z.string(),
    criticalSchemaIssues: z.number(),
    keywordOpportunities: z.array(
      z.object({ keyword: z.string(), opportunityScore: z.number() }),
    ),
    contentStrategy: z.string(),
    priorityKeywords: z.array(z.string()),
    analyticsInsights: z.string(),
  }),
  outputSchema: z.object({
    websiteUrl: z.string(),
    shouldCreateContent: z.boolean(),
    decisionReasons: z.array(z.string()),
    priorityKeywords: z.array(z.string()),
    contentStrategy: z.string(),
    analyticsInsights: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info("🤖 [SEO Workflow] Step 4: Evaluating automation decision...");

    const prompt = `
      Decide if we should create new content.
      Context:
      Schema Summary: ${inputData.schemaSummary}
      Critical Schema Issues: ${inputData.criticalSchemaIssues}
      Keyword Opportunities: ${JSON.stringify(inputData.keywordOpportunities)}
    `;

    const decisionResponse = await seoAgent.generateLegacy([
      { role: "user", content: prompt },
    ]);

    const shouldCreate = decisionResponse.text
      .toLowerCase()
      .includes("create");

    try {
      await storeAutomationDecision({
        websiteUrl: inputData.websiteUrl,
        decisionType: "content_generation",
        shouldAct: shouldCreate,
        confidence: 0.8,
        reasons: [decisionResponse.text],
        evaluatedAt: new Date().toISOString(),
      });
    } catch (error) {
      logger?.error("❌ Failed to store automation decision", { error });
    }

    return {
      websiteUrl: inputData.websiteUrl,
      shouldCreateContent: shouldCreate,
      decisionReasons: [decisionResponse.text],
      priorityKeywords: inputData.priorityKeywords,
      contentStrategy: inputData.contentStrategy,
      analyticsInsights: inputData.analyticsInsights,
    };
  },
});

/**
 * Content Generation Step
 * Creates SEO-optimized content
 */
const generateSeoContent = createStep({
  id: "generate-content",
  description: "Generates SEO-optimized content including blog posts and metadata",
  inputSchema: z.object({
    contentStrategy: z.string(),
    priorityKeywords: z.array(z.string()),
    shouldCreateContent: z.boolean(),
  }),
  outputSchema: z.object({
    generatedContent: z.string(),
    contentPlan: z.string(),
  }),
  execute: async ({ inputData, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info("✍️ [SEO Workflow] Step 4: Generating SEO content...");

    if (!inputData.shouldCreateContent) {
      logger?.warn("⚠️ [SEO Workflow] Skipping content generation (decision=false)");
      return {
        generatedContent: "Content generation skipped per automation decision",
        contentPlan: "Awaiting better opportunity",
      };
    }

    const keywordsList = inputData.priorityKeywords.join(", ");
    const prompt = `
      Generate comprehensive SEO-optimized content based on the content strategy:
      
      Strategy:
      ${inputData.contentStrategy}
      
      Priority Keywords: ${keywordsList}
      
      Please:
      1. For each priority keyword, use the contentGenerationTool to generate:
         - A title tag (SEO-optimized)
         - A meta description
         - A blog post outline
      2. Ensure content is SEO-optimized while maintaining readability
      3. Create a content calendar showing implementation timeline
      4. Include specific recommendations for each content piece
      5. Provide metrics for expected SEO impact
      
      Generate ready-to-publish content with implementation guidelines.
    `;

    const response = await seoAgent.generateLegacy([
      { role: "user", content: prompt },
    ]);

    // Store generated content in database
    try {
      for (const keyword of inputData.priorityKeywords) {
        await storeGeneratedContent({
          contentType: "outline",
          keyword,
          content: response.text,
          seoScore: 85,
        });
      }
      logger?.info("💾 [SEO Workflow] Generated content stored in database");
    } catch (error) {
      logger?.error("❌ [SEO Workflow] Failed to store generated content", { error });
    }

    logger?.info("✅ [SEO Workflow] Content generation complete");

    return {
      generatedContent: response.text,
      contentPlan: "Generated comprehensive SEO content strategy",
    };
  },
});

/**
 * Generate Final Report Step
 * Synthesizes all findings into actionable report
 */
const generateFinalReport = createStep({
  id: "final-report",
  description: "Creates comprehensive SEO report with recommendations and next steps",
  inputSchema: z.object({
    seoAnalysis: z.string(),
    analyticsInsights: z.string(),
    contentStrategy: z.string(),
    generatedContent: z.string(),
  }),
  outputSchema: z.object({
    report: z.string(),
    nextSteps: z.array(z.string()),
    success: z.boolean(),
    shouldCreateContent: z.boolean(),
  }),
  execute: async ({ inputData, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info("📋 [SEO Workflow] Step 5: Generating final report...");

    const reportPrompt = `
      Create a comprehensive SEO optimization report that synthesizes all findings:
      
      SEO Analysis:
      ${inputData.seoAnalysis}
      
      Analytics Insights:
      ${inputData.analyticsInsights}
      
      Content Strategy:
      ${inputData.contentStrategy}
      
      Generated Content:
      ${inputData.generatedContent}
      
      Please create:
      1. Executive Summary (high-level findings and recommendations)
      2. Key Findings (critical issues and quick wins)
      3. Content Implementation Plan (ready-to-execute content strategy)
      4. Performance Metrics (expected impact and KPIs)
      5. 30-Day Action Plan (prioritized next steps)
      6. Resource Requirements (tools, time, budget needed)
      
      Format as a professional report with clear sections and actionable recommendations.
    `;

    const response = await seoAgent.generateLegacy([
      { role: "user", content: reportPrompt },
    ]);

    logger?.info("✅ [SEO Workflow] Final report generated");

    return {
      report: response.text,
      nextSteps: [
        "Implement critical SEO fixes",
        "Create and publish optimized content",
        "Monitor analytics for improvements",
      ],
      success: true,
      shouldCreateContent: inputData.generatedContent !== "Content generation skipped per automation decision",
    };
  },
});

const emitMonitoringPulse = createStep({
  id: "monitoring-pulse",
  description: "Emits monitoring telemetry for downstream agents",
  inputSchema: z.object({
    websiteUrl: z.string(),
    report: z.string(),
    shouldCreateContent: z.boolean(),
  }),
  outputSchema: z.object({
    report: z.string(),
    nextSteps: z.array(z.string()),
    success: z.boolean(),
  }),
  execute: async ({ inputData, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info("📡 [SEO Workflow] Step 6: Emitting monitoring pulse...");

    try {
      await storeMonitoringPulse({
        websiteUrl: inputData.websiteUrl,
        signal: inputData.shouldCreateContent ? "content_ready" : "monitor_only",
        severity: inputData.shouldCreateContent ? "info" : "warning",
        metrics: { shouldCreateContent: inputData.shouldCreateContent },
        observedAt: new Date().toISOString(),
      });
    } catch (error) {
      logger?.error("❌ Failed to store monitoring pulse", { error });
    }

    return {
      report: inputData.report,
      nextSteps: [
        "Implement critical SEO fixes",
        inputData.shouldCreateContent
          ? "Proceed with content publishing"
          : "Continue monitoring opportunities",
        "Monitor analytics for improvements",
      ],
      success: true,
    };
  },
});

/**
 * Create SEO Automation Workflow
 * Orchestrates the complete SEO optimization process
 */
export const seoWorkflow = createWorkflow({
  id: "seo-automation-workflow",
  inputSchema: z.object({}) as any,
  outputSchema: z.object({
    report: z.string(),
    nextSteps: z.array(z.string()),
    success: z.boolean(),
  }),
})
  .then(analyzeSeoDemands as any)
  .then(validateSeoSchema as any)
  .then(collectAnalyticsData as any)
  .then(identifyContentOpportunities as any)
  .then(evaluateAutomationDecision as any)
  .then(generateSeoContent as any)
  .then(generateFinalReport as any)
  .then(emitMonitoringPulse as any)
  .commit();
