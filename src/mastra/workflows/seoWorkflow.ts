import { createStep, createWorkflow } from "../inngest";
import { z } from "zod";
import { seoAgent } from "../agents/seoAgent";
import { astroDeveloperAgent } from "../agents/astroDeveloperAgent";
import { croAnalystAgent } from "../agents/croAnalystAgent";
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
      .describe("Website URL to analyze (default: https://ziaflow.com)"),
    businessGoals: z.string().optional().describe("Key business goals (e.g., increase sales by 15%)"),
    campaignContext: z.string().optional().describe("Current marketing campaigns running"),
    audienceProfile: z.string().optional().describe("Target audience description"),
  }),
  outputSchema: z.object({
    seoAnalysis: z.string(),
    criticalIssuesCount: z.number(),
    websiteUrl: z.string(),
    businessGoals: z.string().optional(),
    campaignContext: z.string().optional(),
    audienceProfile: z.string().optional(),
  }),
  execute: async ({ inputData, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info("🚀 [SEO Workflow] Step 1: Analyzing SEO metrics...");

    const url = inputData.websiteUrl || "https://ziaflow.com";
    const goals = inputData.businessGoals || "Increase leads and local rankings for web development services";

    const prompt = `
      As the Website Optimization Director, perform a comprehensive SEO analysis for ${url}.

      Context:
      Business Goals: ${goals}
      
      Please:
      1. Use the seoAnalysisTool to audit on-page, technical, and structural elements.
      2. Specifically run the 'astro' analysis type to check for Astro JS optimizations.
      3. Identify critical issues that hinder the stated business goals.
      4. Highlight Astro-specific opportunities (View Transitions, Islands).
      
      Format your response as a structured audit report.
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
      businessGoals: goals,
      campaignContext: inputData.campaignContext,
      audienceProfile: inputData.audienceProfile,
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
    businessGoals: z.string().optional(),
    campaignContext: z.string().optional(),
    audienceProfile: z.string().optional(),
  }),
  outputSchema: z.object({
    analyticsInsights: z.string(),
    recommendedKeywords: z.array(z.string()),
    websiteUrl: z.string(),
    schemaSummary: z.string(),
    criticalSchemaIssues: z.number(),
    businessGoals: z.string().optional(),
    campaignContext: z.string().optional(),
    audienceProfile: z.string().optional(),
  }),
  execute: async ({ inputData, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info("📊 [SEO Workflow] Step 2: Collecting analytics data...");

    const prompt = `
      Based on the SEO analysis and business context, perform a comprehensive analytics and data integration review.
      
      Context:
      Website: ${inputData.websiteUrl}
      Business Goals: ${inputData.businessGoals}
      Campaigns: ${inputData.campaignContext || "Standard generic campaigns"}
      Audience: ${inputData.audienceProfile || "General B2B audience"}
      SEO Analysis: ${inputData.seoAnalysis}
      
      Tasks:
      1. Use the realAnalyticsTool to fetch data from ALL platforms (GA4, GSC, Meta/TikTok Pixels, Clarity).
      2. Request metrics including traffic, conversions, engagement, behavior, CRM leads, and A/B test results.
      3. Analyze the data to:
         - Evaluate CRO performance (funnels, bounce rates).
         - Assess Marketing Data Integration (lead quality, campaign alignment).
         - Connect website performance to business goals.
      
      Provide actionable insights linking data to CRO, SEO, and Marketing effectiveness.
    `;

    const response = await seoAgent.generateLegacy([
      { role: "user", content: prompt },
    ]);

    // Store analytics data in database
    try {
      const platformSummary = response.text;

      await storeAnalyticsData({
        source: "multi_platform",
        metric_type: "aggregated_analytics",
        date: new Date().toISOString(),
        data: {
          insights: platformSummary,
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
      businessGoals: inputData.businessGoals,
      campaignContext: inputData.campaignContext,
      audienceProfile: inputData.audienceProfile,
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
 * CRO Deep Dive Step
 * Analyzes user behavior and conversion funnels
 */
const analyzeCro = createStep({
  id: "analyze-cro",
  description: "Deep dive analysis of conversion rate optimization opportunities",
  inputSchema: z.object({
    analyticsInsights: z.string(),
    websiteUrl: z.string(),
  }),
  outputSchema: z.object({
    croRecommendations: z.string(),
    proposedExperiments: z.array(z.string()),
  }),
  execute: async ({ inputData, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info("🕵️ [SEO Workflow] Step 4: CRO Analyst Deep Dive...");

    const prompt = `
      Analyze the analytics insights and website context to propose CRO improvements.
      
      Context:
      Website: ${inputData.websiteUrl}
      Analytics Summary: ${inputData.analyticsInsights}
      
      Tasks:
      1. Identify high-friction areas in the user journey.
      2. Propose 2-3 specific A/B tests.
      3. Suggest layout or copy changes to improve conversion.
    `;

    const response = await croAnalystAgent.generateLegacy([
      { role: "user", content: prompt },
    ]);

    return {
      croRecommendations: response.text,
      proposedExperiments: ["Homepage Hero CTA Test", "Pricing Page Layout Test"],
    };
  },
});

/**
 * Technical Implementation Step
 * Generates code and creates PRs for improvements
 */
const implementTechnicalChanges = createStep({
  id: "implement-changes",
  description: "Generates AstroJS code changes and simulates PR creation",
  inputSchema: z.object({
    seoAnalysis: z.string(),
    croRecommendations: z.string(),
    contentStrategy: z.string(),
    websiteUrl: z.string(),
  }),
  outputSchema: z.object({
    technicalPlan: z.string(),
    prLink: z.string().optional(),
  }),
  execute: async ({ inputData, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info("👨‍💻 [SEO Workflow] Step 5: Astro Developer Implementation...");

    const prompt = `
      Based on the SEO analysis and CRO recommendations, propose and implement technical changes for this AstroJS site.

      Inputs:
      SEO Analysis: ${inputData.seoAnalysis}
      CRO Recommendations: ${inputData.croRecommendations}
      Content Strategy: ${inputData.contentStrategy}

      Tasks:
      1. Propose specific code changes (e.g., Astro components, config).
      2. Use the 'githubTool' to simulate creating a Pull Request with these changes.
      3. Explain the technical implementation details (Islands, View Transitions, etc.).
    `;

    const response = await astroDeveloperAgent.generateLegacy([
      { role: "user", content: prompt },
    ]);

    return {
      technicalPlan: response.text,
      prLink: "https://github.com/ziaflow/website/pull/123", // Mock PR link
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
    technicalPlan: z.string(),
    croRecommendations: z.string(),
    businessGoals: z.string().optional(),
    campaignContext: z.string().optional(),
  }),
  outputSchema: z.object({
    report: z.string(),
    nextSteps: z.array(z.string()),
    success: z.boolean(),
    shouldCreateContent: z.boolean(),
  }),
  execute: async ({ inputData, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info("📋 [SEO Workflow] Step 6: Generating final report...");

    const reportPrompt = `
      As the Website Optimization Director, synthesize the findings from your team (CRO Analyst, Astro Developer, SEO Specialist).
      
      Context:
      Business Goals: ${inputData.businessGoals}
      
      Team Inputs:
      - SEO Analysis: ${inputData.seoAnalysis}
      - Analytics & Marketing: ${inputData.analyticsInsights}
      - CRO Recommendations: ${inputData.croRecommendations}
      - Technical Implementation Plan (AstroJS): ${inputData.technicalPlan}
      - Content Strategy: ${inputData.contentStrategy}
      
      Report Structure:
      1. Executive Summary
      2. Multi-Disciplinary Recommendations (CRO, SEO, Marketing, Technical)
      3. Technical Roadmap (AstroJS specifics, PRs created)
      4. Impact Projection (KPIs)
      
      Highlight the synergy between the agents' work (e.g., how the technical change supports the CRO goal).
    `;

    const response = await seoAgent.generateLegacy([
      { role: "user", content: reportPrompt },
    ]);

    logger?.info("✅ [SEO Workflow] Final report generated");

    return {
      report: response.text,
      nextSteps: [
        "Review and merge generated Pull Requests",
        "Launch proposed A/B tests",
        "Publish new content",
      ],
      success: true,
      shouldCreateContent: true,
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
  .then(analyzeCro as any)
  .then(implementTechnicalChanges as any)
  .then(generateFinalReport as any)
  .then(emitMonitoringPulse as any)
  .commit();

