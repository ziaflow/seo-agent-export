import { getPgPool, executeQuery, initializeAnalyticsTables } from "./pgClient";

/**
 * Database Helper for Marketing Analytics Data
 * Stores data from Google Analytics, Meta Pixel, TikTok Pixel, Microsoft Clarity
 */

export interface AnalyticsRecord {
  id?: string;
  source: string;
  metric_type: string;
  date: string;
  data: any;
  created_at?: string;
}

// Initialize tables on module load
initializeAnalyticsTables().catch(console.error);

/**
 * Store analytics data in PostgreSQL
 */
export async function storeAnalyticsData(record: AnalyticsRecord): Promise<void> {
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
      record.created_at || new Date().toISOString(),
    ];
    
    await pool.query(query, values);
    console.log("✅ Stored analytics data:", { id, source: record.source, type: record.metric_type });
    
  } catch (error) {
    console.error("❌ Error storing analytics data:", error);
    throw error;
  }
}

/**
 * Retrieve analytics data from PostgreSQL
 */
export async function getAnalyticsData(
  source?: string,
  startDate?: string,
  endDate?: string
): Promise<AnalyticsRecord[]> {
  try {
    let query = "SELECT * FROM analytics_data WHERE 1=1";
    const params: any[] = [];
    let paramCount = 1;
    
    if (source) {
      query += ` AND source = $${paramCount}`;
      params.push(source);
      paramCount++;
    }
    
    if (startDate) {
      query += ` AND date >= $${paramCount}`;
      params.push(startDate);
      paramCount++;
    }
    
    if (endDate) {
      query += ` AND date <= $${paramCount}`;
      params.push(endDate);
      paramCount++;
    }
    
    query += " ORDER BY date DESC LIMIT 100";
    
    const results = await executeQuery<AnalyticsRecord>(query, params);
    console.log(`✅ Retrieved ${results.length} analytics records`);
    return results;
  } catch (error) {
    console.error("❌ Error retrieving analytics data:", error);
    throw error;
  }
}

/**
 * Store SEO audit results
 */
export async function storeSeoAudit(audit: {
  websiteUrl: string;
  score: number;
  issues: any[];
  auditDate: string;
}): Promise<void> {
  try {
    const record: AnalyticsRecord = {
      id: `seo-audit-${audit.websiteUrl.replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}`,
      source: "seo_analysis",
      metric_type: "audit",
      date: audit.auditDate,
      data: audit,
    };
    
    await storeAnalyticsData(record);
    console.log("✅ Stored SEO audit:", { url: audit.websiteUrl, score: audit.score });
  } catch (error) {
    console.error("❌ Error storing SEO audit:", error);
    throw error;
  }
}

/**
 * Store content opportunity
 */
export async function storeContentOpportunity(opportunity: {
  keyword: string;
  searchVolume: number;
  difficulty: number;
  intent: string;
  opportunity: string;
}): Promise<void> {
  try {
    console.log("Storing content opportunity:", { keyword: opportunity.keyword });
    
    const record: AnalyticsRecord = {
      id: `content-opp-${opportunity.keyword}-${new Date().toISOString()}`,
      source: "search_query_analysis",
      metric_type: "opportunity",
      date: new Date().toISOString(),
      data: opportunity,
    };
    
    await storeAnalyticsData(record);
  } catch (error) {
    console.error("Error storing content opportunity:", error);
    throw error;
  }
}

/**
 * Store generated content
 */
export async function storeGeneratedContent(content: {
  contentType: string;
  keyword: string;
  content: string;
  seoScore: number;
}): Promise<void> {
  try {
    console.log("Storing generated content:", { type: content.contentType, keyword: content.keyword });
    
    const record: AnalyticsRecord = {
      id: `content-${content.contentType}-${content.keyword}-${new Date().toISOString()}`,
      source: "content_generation",
      metric_type: content.contentType,
      date: new Date().toISOString(),
      data: content,
    };
    
    await storeAnalyticsData(record);
  } catch (error) {
    console.error("Error storing generated content:", error);
    throw error;
  }
}

/**
 * Store SEO schema snapshot data
 */
export async function storeSeoSchemaSnapshot(snapshot: {
  websiteUrl: string;
  schemaTypes: string[];
  missingTypes: string[];
  warnings: string[];
  detectedIssues: Array<{
    type: string;
    severity: "critical" | "high" | "medium" | "low";
    message: string;
  }>;
  crawledAt: string;
}): Promise<void> {
  try {
    const record: AnalyticsRecord = {
      id: `schema-${snapshot.websiteUrl.replace(/[^a-zA-Z0-9]/g, '-')}-${snapshot.crawledAt}`,
      source: "seo_schema",
      metric_type: "snapshot",
      date: snapshot.crawledAt,
      data: snapshot,
    };

    await storeAnalyticsData(record);
  } catch (error) {
    console.error("Error storing SEO schema snapshot:", error);
    throw error;
  }
}

/**
 * Store keyword radar / opportunity insights
 */
export async function storeKeywordRadarInsights(payload: {
  industry: string;
  focusKeywords: Array<{
    keyword: string;
    searchVolume: number;
    difficulty: number;
    opportunityScore: number;
    intent: string;
  }>;
  trendSignals: Array<{ topic: string; delta: string }>;
  generatedAt: string;
}): Promise<void> {
  try {
    const record: AnalyticsRecord = {
      id: `keyword-radar-${payload.industry}-${payload.generatedAt}`,
      source: "keyword_radar",
      metric_type: "opportunity_map",
      date: payload.generatedAt,
      data: payload,
    };

    await storeAnalyticsData(record);
  } catch (error) {
    console.error("Error storing keyword radar insights:", error);
    throw error;
  }
}

/**
 * Persist automation decisions (e.g., should create content)
 */
export async function storeAutomationDecision(decision: {
  websiteUrl: string;
  decisionType: string;
  shouldAct: boolean;
  confidence: number;
  reasons: string[];
  evaluatedAt: string;
}): Promise<void> {
  try {
    const record: AnalyticsRecord = {
      id: `decision-${decision.decisionType}-${decision.evaluatedAt}`,
      source: "automation_decision",
      metric_type: decision.decisionType,
      date: decision.evaluatedAt,
      data: decision,
    };

    await storeAnalyticsData(record);
  } catch (error) {
    console.error("Error storing automation decision:", error);
    throw error;
  }
}

/**
 * Store monitoring telemetry pulses
 */
export async function storeMonitoringPulse(pulse: {
  websiteUrl: string;
  signal: string;
  severity: "info" | "warning" | "critical";
  metrics: Record<string, any>;
  observedAt: string;
}): Promise<void> {
  try {
    const record: AnalyticsRecord = {
      id: `monitoring-${pulse.signal}-${pulse.observedAt}`,
      source: "monitoring",
      metric_type: pulse.signal,
      date: pulse.observedAt,
      data: pulse,
    };

    await storeAnalyticsData(record);
  } catch (error) {
    console.error("Error storing monitoring pulse:", error);
    throw error;
  }
}
