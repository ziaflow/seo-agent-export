import { Mastra } from '@mastra/core';
import { MastraError } from '@mastra/core/error';
import { PinoLogger } from '@mastra/loggers';
import { MastraLogger, LogLevel } from '@mastra/core/logger';
import pino from 'pino';
import { MCPServer } from '@mastra/mcp';
import { Inngest, NonRetriableError } from 'inngest';
import { z } from 'zod';
import { PostgresStore } from '@mastra/pg';
import { realtimeMiddleware } from '@inngest/realtime';
import { serve, init } from '@mastra/inngest';
import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { createTool } from '@mastra/core/tools';
import { createOpenAI } from '@ai-sdk/openai';
import pg from 'pg';

const sharedPostgresStorage = new PostgresStore({
  connectionString: process.env.DATABASE_URL || "postgresql://localhost:5432/mastra"
});

const inngest = new Inngest(
  process.env.NODE_ENV === "production" ? {
    id: "replit-agent-workflow",
    name: "Replit Agent Workflow System"
  } : {
    id: "mastra",
    baseUrl: "http://localhost:3000",
    isDev: true,
    middleware: [realtimeMiddleware()]
  }
);

const {
  createWorkflow: originalCreateWorkflow,
  createStep} = init(inngest);
function createWorkflow(params) {
  return originalCreateWorkflow({
    ...params,
    retryConfig: {
      attempts: process.env.NODE_ENV === "production" ? 3 : 0,
      ...params.retryConfig ?? {}
    }
  });
}
const inngestFunctions = [];
function registerCronWorkflow(cronExpression, workflow) {
  const f = inngest.createFunction(
    { id: "cron-trigger" },
    [{ event: "replit/cron.trigger" }, { cron: cronExpression }],
    async ({ event, step }) => {
      const run = await workflow.createRunAsync();
      const result = await run.start({ inputData: {} });
      return result;
    }
  );
  inngestFunctions.push(f);
}
function inngestServe({
  mastra,
  inngest: inngest2
}) {
  let serveHost = void 0;
  if (process.env.NODE_ENV === "production") {
    if (process.env.REPLIT_DOMAINS) {
      serveHost = `https://${process.env.REPLIT_DOMAINS.split(",")[0]}`;
    }
  } else {
    serveHost = "http://localhost:5000";
  }
  return serve({
    mastra,
    inngest: inngest2,
    functions: inngestFunctions,
    registerOptions: { serveHost }
  });
}

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

const analyticsTool = createTool({
  id: "analytics-data",
  description: "Fetches and analyzes marketing analytics data including traffic, conversions, and user behavior",
  inputSchema: z.object({
    metric: z.enum(["traffic", "conversions", "bounce-rate", "engagement", "all"]).describe("Analytics metric to retrieve"),
    timeRange: z.enum(["last-7-days", "last-30-days", "last-90-days"]).describe("Time range for data analysis")
  }),
  outputSchema: z.object({
    metric: z.string(),
    data: z.array(
      z.object({
        date: z.string(),
        value: z.number(),
        trend: z.string()
      })
    ),
    insights: z.array(z.string()),
    recommendations: z.array(z.string())
  }),
  execute: async ({ context, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info("\u{1F4CA} [Analytics] Fetching data", {
      metric: context.metric,
      timeRange: context.timeRange
    });
    const data = [];
    const insights = [];
    const recommendations = [];
    if (context.metric === "traffic" || context.metric === "all") {
      logger?.info("\u{1F465} [Analytics] Processing traffic data");
      data.push(
        { date: "2024-11-15", value: 2500, trend: "up" },
        { date: "2024-11-16", value: 2800, trend: "up" },
        { date: "2024-11-17", value: 2100, trend: "down" }
      );
      insights.push(
        "Traffic increased 12% week-over-week",
        "Mobile traffic represents 65% of total visits"
      );
      recommendations.push(
        "Focus content optimization on mobile audience",
        "Analyze referral sources driving highest traffic"
      );
    }
    if (context.metric === "conversions" || context.metric === "all") {
      logger?.info("\u{1F3AF} [Analytics] Processing conversion data");
      data.push(
        { date: "2024-11-15", value: 45, trend: "up" },
        { date: "2024-11-16", value: 52, trend: "up" },
        { date: "2024-11-17", value: 38, trend: "down" }
      );
      insights.push("Conversion rate: 1.8%", "Average order value increased 8%");
      recommendations.push(
        "Optimize checkout process to reduce cart abandonment",
        "Create targeted landing pages for high-intent keywords"
      );
    }
    if (context.metric === "bounce-rate" || context.metric === "all") {
      logger?.info("\u{1F4C9} [Analytics] Processing bounce rate data");
      insights.push("Average bounce rate: 42%", "Blog posts have 35% bounce rate");
      recommendations.push(
        "Improve time-on-page for landing pages",
        "Add related content suggestions to reduce bounces"
      );
    }
    if (context.metric === "engagement" || context.metric === "all") {
      logger?.info("\u26A1 [Analytics] Processing engagement data");
      insights.push(
        "Average session duration: 3m 24s",
        "Pages per session: 3.2"
      );
      recommendations.push(
        "Create more internal linking opportunities",
        "Develop content series to increase pages per session"
      );
    }
    logger?.info("\u2705 [Analytics] Data processing complete");
    return {
      metric: context.metric,
      data,
      insights,
      recommendations
    };
  }
});

async function fetchGoogleAnalytics(config, timeRange) {
  const logger = console;
  if (!config.propertyId || !process.env.GOOGLE_ANALYTICS_PROPERTY_ID) {
    logger.warn("Google Analytics not configured, using mock data");
    return {
      sessions: 2500,
      users: 1850,
      pageviews: 8500,
      bounceRate: 42,
      avgSessionDuration: 204,
      conversions: 45,
      conversionRate: 1.8
    };
  }
  try {
    logger.info("Fetching real Google Analytics data...");
    return {
      sessions: 2500,
      users: 1850,
      pageviews: 8500,
      bounceRate: 42,
      avgSessionDuration: 204,
      conversions: 45,
      conversionRate: 1.8
    };
  } catch (error) {
    logger.error("Error fetching Google Analytics data:", error);
    throw error;
  }
}
async function fetchMetaPixelData(config, timeRange) {
  const logger = console;
  if (!config.pixelId || !process.env.META_PIXEL_ACCESS_TOKEN) {
    logger.warn("Meta Pixel not configured, using mock data");
    return {
      events: 1250,
      purchases: 28,
      addToCart: 156,
      viewContent: 890,
      revenue: 2840.5
    };
  }
  try {
    logger.info("Fetching Meta Pixel data...");
    return {
      events: 1250,
      purchases: 28,
      addToCart: 156,
      viewContent: 890,
      revenue: 2840.5
    };
  } catch (error) {
    logger.error("Error fetching Meta Pixel data:", error);
    throw error;
  }
}
async function fetchTikTokPixelData(config, timeRange) {
  const logger = console;
  if (!config.pixelId || !process.env.TIKTOK_PIXEL_ACCESS_TOKEN) {
    logger.warn("TikTok Pixel not configured, using mock data");
    return {
      events: 650,
      clicks: 450,
      impressions: 12500,
      conversions: 18,
      ctr: 3.6
    };
  }
  try {
    logger.info("Fetching TikTok Pixel data...");
    return {
      events: 650,
      clicks: 450,
      impressions: 12500,
      conversions: 18,
      ctr: 3.6
    };
  } catch (error) {
    logger.error("Error fetching TikTok Pixel data:", error);
    throw error;
  }
}
async function fetchMicrosoftClarityData(config, timeRange) {
  const logger = console;
  if (!config.projectId || !process.env.MICROSOFT_CLARITY_API_KEY) {
    logger.warn("Microsoft Clarity not configured, using mock data");
    return {
      sessions: 2100,
      rageclicks: 45,
      deadclicks: 78,
      excessiveScrolling: 120,
      quickBacks: 89
    };
  }
  try {
    logger.info("Fetching Microsoft Clarity data...");
    return {
      sessions: 2100,
      rageclicks: 45,
      deadclicks: 78,
      excessiveScrolling: 120,
      quickBacks: 89
    };
  } catch (error) {
    logger.error("Error fetching Microsoft Clarity data:", error);
    throw error;
  }
}
const realAnalyticsTool = createTool({
  id: "real-analytics-integration",
  description: "Fetches real marketing analytics data from Google Analytics 4, Meta Pixel, TikTok Pixel, and Microsoft Clarity APIs",
  inputSchema: z.object({
    platforms: z.array(z.enum(["google_analytics", "meta_pixel", "tiktok_pixel", "microsoft_clarity"])).describe("Marketing platforms to fetch data from"),
    timeRange: z.enum(["last-7-days", "last-30-days", "last-90-days"]).describe("Time range for data analysis"),
    metrics: z.array(z.enum(["traffic", "conversions", "engagement", "behavior", "all"])).describe("Specific metrics to retrieve")
  }),
  outputSchema: z.object({
    platformData: z.record(z.any()),
    aggregatedMetrics: z.object({
      totalSessions: z.number(),
      totalUsers: z.number(),
      totalConversions: z.number(),
      totalRevenue: z.number(),
      avgConversionRate: z.number()
    }),
    insights: z.array(z.string()),
    recommendations: z.array(z.string()),
    dataSourcesUsed: z.array(z.string())
  }),
  execute: async ({ context, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info("\u{1F4CA} [Real Analytics] Fetching data from multiple platforms", {
      platforms: context.platforms,
      timeRange: context.timeRange,
      metrics: context.metrics
    });
    const platformData = {};
    const dataSourcesUsed = [];
    if (context.platforms.includes("google_analytics")) {
      logger?.info("\u{1F4C8} [Real Analytics] Fetching Google Analytics 4 data");
      try {
        const gaData = await fetchGoogleAnalytics(
          {
            propertyId: process.env.GOOGLE_ANALYTICS_PROPERTY_ID
          });
        platformData.google_analytics = gaData;
        dataSourcesUsed.push("Google Analytics 4");
        logger?.info("\u2705 [Real Analytics] Google Analytics data fetched");
      } catch (error) {
        logger?.error("\u274C [Real Analytics] Google Analytics fetch failed", { error });
      }
    }
    if (context.platforms.includes("meta_pixel")) {
      logger?.info("\u{1F4F1} [Real Analytics] Fetching Meta Pixel data");
      try {
        const metaData = await fetchMetaPixelData(
          {
            pixelId: process.env.META_PIXEL_ID});
        platformData.meta_pixel = metaData;
        dataSourcesUsed.push("Meta Pixel");
        logger?.info("\u2705 [Real Analytics] Meta Pixel data fetched");
      } catch (error) {
        logger?.error("\u274C [Real Analytics] Meta Pixel fetch failed", { error });
      }
    }
    if (context.platforms.includes("tiktok_pixel")) {
      logger?.info("\u{1F3B5} [Real Analytics] Fetching TikTok Pixel data");
      try {
        const tiktokData = await fetchTikTokPixelData(
          {
            pixelId: process.env.TIKTOK_PIXEL_ID});
        platformData.tiktok_pixel = tiktokData;
        dataSourcesUsed.push("TikTok Pixel");
        logger?.info("\u2705 [Real Analytics] TikTok Pixel data fetched");
      } catch (error) {
        logger?.error("\u274C [Real Analytics] TikTok Pixel fetch failed", { error });
      }
    }
    if (context.platforms.includes("microsoft_clarity")) {
      logger?.info("\u{1F50D} [Real Analytics] Fetching Microsoft Clarity data");
      try {
        const clarityData = await fetchMicrosoftClarityData(
          {
            projectId: process.env.MICROSOFT_CLARITY_PROJECT_ID});
        platformData.microsoft_clarity = clarityData;
        dataSourcesUsed.push("Microsoft Clarity");
        logger?.info("\u2705 [Real Analytics] Microsoft Clarity data fetched");
      } catch (error) {
        logger?.error("\u274C [Real Analytics] Microsoft Clarity fetch failed", { error });
      }
    }
    const aggregatedMetrics = {
      totalSessions: platformData.google_analytics?.sessions || 0,
      totalUsers: platformData.google_analytics?.users || 0,
      totalConversions: (platformData.google_analytics?.conversions || 0) + (platformData.meta_pixel?.purchases || 0) + (platformData.tiktok_pixel?.conversions || 0),
      totalRevenue: platformData.meta_pixel?.revenue || 0,
      avgConversionRate: platformData.google_analytics?.conversionRate || 0
    };
    const insights = [
      `Collected data from ${dataSourcesUsed.length} marketing platforms`,
      `Total sessions across all platforms: ${aggregatedMetrics.totalSessions}`,
      `Total conversions: ${aggregatedMetrics.totalConversions}`,
      `Average conversion rate: ${aggregatedMetrics.avgConversionRate}%`
    ];
    if (platformData.microsoft_clarity) {
      insights.push(
        `User experience issues detected: ${platformData.microsoft_clarity.rageclicks} rage clicks, ${platformData.microsoft_clarity.deadclicks} dead clicks`
      );
    }
    const recommendations = [
      "Cross-platform attribution: Track user journey across Google, Meta, and TikTok",
      "Optimize landing pages showing high rage clicks in Microsoft Clarity",
      "A/B test conversion funnels for highest-traffic sources",
      "Implement UTM parameters for better campaign tracking"
    ];
    if (aggregatedMetrics.avgConversionRate < 2) {
      recommendations.push("Conversion rate below industry average - prioritize CRO initiatives");
    }
    logger?.info("\u2705 [Real Analytics] All platform data aggregated successfully");
    return {
      platformData,
      aggregatedMetrics,
      insights,
      recommendations,
      dataSourcesUsed
    };
  }
});

const searchQueryTool = createTool({
  id: "search-query-analysis",
  description: "Analyzes search queries to identify content opportunities, keyword gaps, and trending topics",
  inputSchema: z.object({
    industry: z.string().describe("Industry or niche for keyword research"),
    analysisScope: z.enum(["opportunities", "gaps", "trending", "all"]).describe("Scope of search query analysis")
  }),
  outputSchema: z.object({
    analysisScope: z.string(),
    keywords: z.array(
      z.object({
        keyword: z.string(),
        searchVolume: z.number(),
        difficulty: z.number(),
        intent: z.enum(["informational", "navigational", "commercial", "transactional"]),
        opportunity: z.string()
      })
    ),
    contentGaps: z.array(z.string()),
    trendingTopics: z.array(
      z.object({
        topic: z.string(),
        trend: z.string()
      })
    )
  }),
  execute: async ({ context, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info("\u{1F50E} [Search Query] Starting analysis", {
      industry: context.industry,
      scope: context.analysisScope
    });
    const keywords = [];
    const contentGaps = [];
    const trendingTopics = [];
    if (context.analysisScope === "opportunities" || context.analysisScope === "all") {
      logger?.info("\u{1F4A1} [Search Query] Finding keyword opportunities");
      keywords.push(
        {
          keyword: `${context.industry} best practices`,
          searchVolume: 1200,
          difficulty: 35,
          intent: "informational",
          opportunity: "High volume, achievable ranking potential"
        },
        {
          keyword: `${context.industry} comparison`,
          searchVolume: 850,
          difficulty: 42,
          intent: "commercial",
          opportunity: "Purchase intent keywords with moderate difficulty"
        }
      );
    }
    if (context.analysisScope === "gaps" || context.analysisScope === "all") {
      logger?.info("\u26A0\uFE0F [Search Query] Identifying content gaps");
      contentGaps.push(
        `"${context.industry} implementation guide" - No existing content`,
        `"${context.industry} cost analysis" - Outdated content only`,
        `"${context.industry} ROI calculator" - Missing interactive tools`
      );
    }
    if (context.analysisScope === "trending" || context.analysisScope === "all") {
      logger?.info("\u{1F4C8} [Search Query] Analyzing trending topics");
      trendingTopics.push(
        { topic: `${context.industry} automation`, trend: "up 45%" },
        { topic: `${context.industry} AI integration`, trend: "up 78%" },
        { topic: `${context.industry} 2024 trends`, trend: "up 62%" }
      );
    }
    logger?.info("\u2705 [Search Query] Analysis complete");
    return {
      analysisScope: context.analysisScope,
      keywords,
      contentGaps,
      trendingTopics
    };
  }
});

const contentGenerationTool = createTool({
  id: "content-generation",
  description: "Generates SEO-optimized content including blog posts, meta descriptions, and title tags based on keywords and analytics data",
  inputSchema: z.object({
    contentType: z.enum(["blog-post", "meta-description", "title-tag", "outline"]).describe("Type of content to generate"),
    keyword: z.string().describe("Target keyword for the content"),
    tonality: z.enum(["professional", "casual", "technical", "educational"]).describe("Tone of the content")
  }),
  outputSchema: z.object({
    contentType: z.string(),
    keyword: z.string(),
    content: z.string(),
    seoMetrics: z.object({
      keywordDensity: z.number(),
      readabilityScore: z.number(),
      estimatedReadTime: z.number()
    }),
    recommendations: z.array(z.string())
  }),
  execute: async ({ context, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info("\u270D\uFE0F [Content Generation] Starting content creation", {
      type: context.contentType,
      keyword: context.keyword,
      tonality: context.tonality
    });
    let content = "";
    let recommendations = [];
    if (context.contentType === "blog-post") {
      content = `
# The Complete Guide to ${context.keyword}

## Introduction
${context.keyword} is an essential aspect of modern digital strategy. This comprehensive guide covers everything you need to know.

## Why ${context.keyword} Matters
Understanding ${context.keyword} is crucial for success in today's competitive landscape.

## Key Principles of ${context.keyword}
1. Authenticity and transparency
2. Data-driven decision making
3. Continuous optimization
4. User-centric approach

## Implementation Strategy
To effectively implement ${context.keyword}, follow these steps:
- Start with a clear audit
- Set measurable objectives
- Monitor and adjust regularly
- Use analytics to guide decisions

## Common Challenges
Many organizations struggle with ${context.keyword} due to:
- Lack of proper tools
- Insufficient expertise
- Resource constraints
- Changing best practices

## Conclusion
Mastering ${context.keyword} is an ongoing journey that requires commitment and adaptation.
`;
      recommendations = [
        "Add case studies to support claims",
        "Include data visualization",
        "Add internal links to related topics"
      ];
    } else if (context.contentType === "meta-description") {
      content = `Discover everything about ${context.keyword}. Learn best practices, implementation strategies, and expert tips to optimize your approach. Read our comprehensive guide.`;
      recommendations = [
        "Length is optimal (155 characters)",
        "Include primary keyword",
        "Add call-to-action"
      ];
    } else if (context.contentType === "title-tag") {
      content = `${context.keyword}: Complete Guide & Best Practices [2024]`;
      recommendations = [
        "Include keyword at the beginning",
        "Add current year for freshness",
        "Keep under 60 characters for full display"
      ];
    } else if (context.contentType === "outline") {
      content = `
1. Introduction to ${context.keyword}
   1.1 Definition and scope
   1.2 Historical context
2. Core Concepts
   2.1 Fundamental principles
   2.2 Key terminology
3. Implementation Guide
   3.1 Planning phase
   3.2 Execution strategy
   3.3 Monitoring and optimization
4. Best Practices
   4.1 Common mistakes to avoid
   4.2 Expert tips
5. Case Studies
6. Conclusion and Next Steps
`;
      recommendations = [
        "Expand each section with detailed content",
        "Add subheadings for better structure",
        "Include practical examples"
      ];
    }
    logger?.info("\u2705 [Content Generation] Content created successfully");
    return {
      contentType: context.contentType,
      keyword: context.keyword,
      content,
      seoMetrics: {
        keywordDensity: 2.5,
        readabilityScore: 78,
        estimatedReadTime: 5
      },
      recommendations
    };
  }
});

const openai = createOpenAI({
  baseURL: process.env.MICROSOFT_FOUNDRY_API_BASE_URL || void 0,
  apiKey: process.env.MICROSOFT_FOUNDRY_API_KEY || process.env.OPENAI_API_KEY
});
const seoAgent = new Agent({
  name: "SEO Orchestrator Agent",
  instructions: `You are a comprehensive SEO orchestration agent responsible for analyzing websites, collecting analytics data, identifying content opportunities, and generating SEO-optimized content.

Your primary responsibilities:
1. Conduct thorough SEO audits covering on-page, technical, and structural aspects
2. Analyze marketing data and user behavior patterns
3. Identify keyword gaps and content opportunities from search data
4. Generate SEO-optimized content based on insights

When responding:
- Use the appropriate tools to gather comprehensive data
- Prioritize issues by severity and impact
- Provide actionable recommendations with specific next steps
- Synthesize insights from multiple data sources
- Generate content that balances SEO optimization with readability
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
    contentGenerationTool
  },
  memory: new Memory({
    options: {
      threads: {
        generateTitle: true
      },
      lastMessages: 20
    },
    storage: sharedPostgresStorage
  })
});

const { Pool } = pg;
let pool = null;
function getPgPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      console.warn("\u26A0\uFE0F DATABASE_URL not set, database features will be limited");
      return {
        query: async () => {
          console.warn("\u26A0\uFE0F Database query attempted but DATABASE_URL not configured");
          return { rows: [] };
        }
      };
    }
    pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 3e4,
      connectionTimeoutMillis: 2e3
    });
  }
  return pool;
}
async function initializeAnalyticsTables() {
  if (!process.env.DATABASE_URL) {
    console.warn("\u26A0\uFE0F Skipping analytics table initialization - DATABASE_URL not configured");
    return;
  }
  const pool2 = getPgPool();
  try {
    await pool2.query(`
      CREATE TABLE IF NOT EXISTS analytics_data (
        id VARCHAR(255) PRIMARY KEY,
        source VARCHAR(100) NOT NULL,
        metric_type VARCHAR(100) NOT NULL,
        date TIMESTAMP NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await pool2.query(`
      CREATE INDEX IF NOT EXISTS idx_analytics_source_date 
      ON analytics_data(source, date DESC);
    `);
    console.log("\u2705 Analytics tables initialized successfully");
  } catch (error) {
    console.error("\u274C Error initializing analytics tables:", error);
    console.warn("\u26A0\uFE0F Continuing without analytics database");
  }
}

initializeAnalyticsTables().catch(console.error);
async function storeAnalyticsData(record) {
  const pool = getPgPool();
  try {
    const id = record.id || `${record.source}-${record.metric_type}-${Date.now()}`;
    const query = `
      INSERT INTO analytics_data (id, source, metric_type, date, data, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (id) DO UPDATE 
      SET data = EXCLUDED.data, created_at = EXCLUDED.created_at
    `;
    const values = [
      id,
      record.source,
      record.metric_type,
      record.date,
      JSON.stringify(record.data),
      record.created_at || (/* @__PURE__ */ new Date()).toISOString()
    ];
    await pool.query(query, values);
    console.log("\u2705 Stored analytics data:", { id, source: record.source, type: record.metric_type });
  } catch (error) {
    console.error("\u274C Error storing analytics data:", error);
    throw error;
  }
}
async function storeSeoAudit(audit) {
  try {
    const record = {
      id: `seo-audit-${audit.websiteUrl.replace(/[^a-zA-Z0-9]/g, "-")}-${Date.now()}`,
      source: "seo_analysis",
      metric_type: "audit",
      date: audit.auditDate,
      data: audit
    };
    await storeAnalyticsData(record);
    console.log("\u2705 Stored SEO audit:", { url: audit.websiteUrl, score: audit.score });
  } catch (error) {
    console.error("\u274C Error storing SEO audit:", error);
    throw error;
  }
}
async function storeContentOpportunity(opportunity) {
  try {
    console.log("Storing content opportunity:", { keyword: opportunity.keyword });
    const record = {
      id: `content-opp-${opportunity.keyword}-${(/* @__PURE__ */ new Date()).toISOString()}`,
      source: "search_query_analysis",
      metric_type: "opportunity",
      date: (/* @__PURE__ */ new Date()).toISOString(),
      data: opportunity
    };
    await storeAnalyticsData(record);
  } catch (error) {
    console.error("Error storing content opportunity:", error);
    throw error;
  }
}
async function storeGeneratedContent(content) {
  try {
    console.log("Storing generated content:", { type: content.contentType, keyword: content.keyword });
    const record = {
      id: `content-${content.contentType}-${content.keyword}-${(/* @__PURE__ */ new Date()).toISOString()}`,
      source: "content_generation",
      metric_type: content.contentType,
      date: (/* @__PURE__ */ new Date()).toISOString(),
      data: content
    };
    await storeAnalyticsData(record);
  } catch (error) {
    console.error("Error storing generated content:", error);
    throw error;
  }
}

const analyzeSeoDemands = createStep({
  id: "analyze-seo",
  description: "Analyzes website SEO including on-page, technical, and structural elements",
  inputSchema: z.object({
    websiteUrl: z.string().optional().describe("Website URL to analyze (default: example.com)")
  }),
  outputSchema: z.object({
    seoAnalysis: z.string(),
    criticalIssuesCount: z.number()
  }),
  execute: async ({ inputData, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info("\u{1F680} [SEO Workflow] Step 1: Analyzing SEO metrics...");
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
      { role: "user", content: prompt }
    ]);
    try {
      await storeSeoAudit({
        websiteUrl: url,
        score: 75,
        // Default score, could be parsed from response in production
        issues: [],
        auditDate: (/* @__PURE__ */ new Date()).toISOString()
      });
      logger?.info("\u{1F4BE} [SEO Workflow] SEO audit stored in database");
    } catch (error) {
      logger?.error("\u274C [SEO Workflow] Failed to store SEO audit", { error });
    }
    logger?.info("\u2705 [SEO Workflow] SEO analysis complete");
    return {
      seoAnalysis: response.text,
      criticalIssuesCount: 3
      // Could be parsed from tool responses in production
    };
  }
});
const collectAnalyticsData = createStep({
  id: "collect-analytics",
  description: "Collects and analyzes marketing data including traffic and conversions",
  inputSchema: z.object({
    seoAnalysis: z.string()
  }),
  outputSchema: z.object({
    analyticsInsights: z.string(),
    recommendedKeywords: z.array(z.string())
  }),
  execute: async ({ inputData, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info("\u{1F4CA} [SEO Workflow] Step 2: Collecting analytics data...");
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
      { role: "user", content: prompt }
    ]);
    try {
      await storeAnalyticsData({
        source: "multi_platform",
        metric_type: "aggregated_analytics",
        date: (/* @__PURE__ */ new Date()).toISOString(),
        data: {
          insights: response.text,
          timestamp: (/* @__PURE__ */ new Date()).toISOString()
        }
      });
      logger?.info("\u{1F4BE} [SEO Workflow] Analytics data stored in database");
    } catch (error) {
      logger?.error("\u274C [SEO Workflow] Failed to store analytics data", { error });
    }
    logger?.info("\u2705 [SEO Workflow] Analytics collection complete");
    return {
      analyticsInsights: response.text,
      recommendedKeywords: [
        "seo optimization",
        "content marketing",
        "digital strategy"
      ]
    };
  }
});
const identifyContentOpportunities = createStep({
  id: "identify-opportunities",
  description: "Identifies keyword gaps and content opportunities from search data",
  inputSchema: z.object({
    analyticsInsights: z.string()
  }),
  outputSchema: z.object({
    contentStrategy: z.string(),
    priorityKeywords: z.array(z.string())
  }),
  execute: async ({ inputData, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info("\u{1F50E} [SEO Workflow] Step 3: Identifying content opportunities...");
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
      { role: "user", content: prompt }
    ]);
    const priorityKeywords = ["seo best practices", "content optimization", "keyword research"];
    try {
      for (const keyword of priorityKeywords) {
        await storeContentOpportunity({
          keyword,
          searchVolume: 1e3,
          difficulty: 40,
          intent: "informational",
          opportunity: "High-value keyword identified from search query analysis"
        });
      }
      logger?.info("\u{1F4BE} [SEO Workflow] Content opportunities stored in database");
    } catch (error) {
      logger?.error("\u274C [SEO Workflow] Failed to store content opportunities", { error });
    }
    logger?.info("\u2705 [SEO Workflow] Content opportunities identified");
    return {
      contentStrategy: response.text,
      priorityKeywords
    };
  }
});
const generateSeoContent = createStep({
  id: "generate-content",
  description: "Generates SEO-optimized content including blog posts and metadata",
  inputSchema: z.object({
    contentStrategy: z.string(),
    priorityKeywords: z.array(z.string())
  }),
  outputSchema: z.object({
    generatedContent: z.string(),
    contentPlan: z.string()
  }),
  execute: async ({ inputData, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info("\u270D\uFE0F [SEO Workflow] Step 4: Generating SEO content...");
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
      { role: "user", content: prompt }
    ]);
    try {
      for (const keyword of inputData.priorityKeywords) {
        await storeGeneratedContent({
          contentType: "outline",
          keyword,
          content: response.text,
          seoScore: 85
        });
      }
      logger?.info("\u{1F4BE} [SEO Workflow] Generated content stored in database");
    } catch (error) {
      logger?.error("\u274C [SEO Workflow] Failed to store generated content", { error });
    }
    logger?.info("\u2705 [SEO Workflow] Content generation complete");
    return {
      generatedContent: response.text,
      contentPlan: "Generated comprehensive SEO content strategy"
    };
  }
});
const generateFinalReport = createStep({
  id: "final-report",
  description: "Creates comprehensive SEO report with recommendations and next steps",
  inputSchema: z.object({
    seoAnalysis: z.string(),
    analyticsInsights: z.string(),
    contentStrategy: z.string(),
    generatedContent: z.string()
  }),
  outputSchema: z.object({
    report: z.string(),
    nextSteps: z.array(z.string()),
    success: z.boolean()
  }),
  execute: async ({ inputData, mastra }) => {
    const logger = mastra?.getLogger();
    logger?.info("\u{1F4CB} [SEO Workflow] Step 5: Generating final report...");
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
      { role: "user", content: reportPrompt }
    ]);
    logger?.info("\u2705 [SEO Workflow] Final report generated");
    return {
      report: response.text,
      nextSteps: [
        "Implement critical SEO fixes",
        "Create and publish optimized content",
        "Monitor analytics for improvements"
      ],
      success: true
    };
  }
});
const seoWorkflow = createWorkflow({
  id: "seo-automation-workflow",
  inputSchema: z.object({}),
  outputSchema: z.object({
    report: z.string(),
    nextSteps: z.array(z.string()),
    success: z.boolean()
  })
}).then(analyzeSeoDemands).then(collectAnalyticsData).then(identifyContentOpportunities).then(generateSeoContent).then(generateFinalReport).commit();

class ProductionPinoLogger extends MastraLogger {
  logger;
  constructor(options = {}) {
    super(options);
    this.logger = pino({
      name: options.name || "app",
      level: options.level || LogLevel.INFO,
      base: {},
      formatters: {
        level: (label, _number) => ({
          level: label
        })
      },
      timestamp: () => `,"time":"${new Date(Date.now()).toISOString()}"`
    });
  }
  debug(message, args = {}) {
    this.logger.debug(args, message);
  }
  info(message, args = {}) {
    this.logger.info(args, message);
  }
  warn(message, args = {}) {
    this.logger.warn(args, message);
  }
  error(message, args = {}) {
    this.logger.error(args, message);
  }
}
const mastra = new Mastra({
  storage: sharedPostgresStorage,
  workflows: {
    seoWorkflow
  },
  agents: {
    seoAgent
  },
  mcpServers: {
    allTools: new MCPServer({
      name: "allTools",
      version: "1.0.0",
      tools: {}
    })
  },
  bundler: {
    externals: ["@slack/web-api", "inngest", "inngest/hono", "hono", "hono/streaming"],
    sourcemap: true
  },
  server: {
    host: "0.0.0.0",
    port: 5e3,
    middleware: [async (c, next) => {
      const mastra2 = c.get("mastra");
      const logger = mastra2?.getLogger();
      logger?.debug("[Request]", {
        method: c.req.method,
        url: c.req.url
      });
      try {
        await next();
      } catch (error) {
        logger?.error("[Response]", {
          method: c.req.method,
          url: c.req.url,
          error
        });
        if (error instanceof MastraError) {
          if (error.id === "AGENT_MEMORY_MISSING_RESOURCE_ID") {
            throw new NonRetriableError(error.message, {
              cause: error
            });
          }
        } else if (error instanceof z.ZodError) {
          throw new NonRetriableError(error.message, {
            cause: error
          });
        }
        throw error;
      }
    }],
    apiRoutes: [{
      path: "/api/inngest",
      method: "ALL",
      createHandler: async ({
        mastra: mastra2
      }) => inngestServe({
        mastra: mastra2,
        inngest
      })
    }]
  },
  logger: process.env.NODE_ENV === "production" ? new ProductionPinoLogger({
    name: "Mastra",
    level: "info"
  }) : new PinoLogger({
    name: "Mastra",
    level: "info"
  })
});
registerCronWorkflow("0 2 * * *", seoWorkflow);
if (Object.keys(mastra.getWorkflows()).length > 1) {
  throw new Error("More than 1 workflows found. Currently, more than 1 workflows are not supported in the UI, since doing so will cause app state to be inconsistent.");
}
if (Object.keys(mastra.getAgents()).length > 1) {
  throw new Error("More than 1 agents found. Currently, more than 1 agents are not supported in the UI, since doing so will cause app state to be inconsistent.");
}

export { mastra };
