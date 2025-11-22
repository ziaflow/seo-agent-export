import pg from 'pg';

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
async function storeSeoSchemaSnapshot(snapshot) {
  try {
    const record = {
      id: `schema-${snapshot.websiteUrl.replace(/[^a-zA-Z0-9]/g, "-")}-${snapshot.crawledAt}`,
      source: "seo_schema",
      metric_type: "snapshot",
      date: snapshot.crawledAt,
      data: snapshot
    };
    await storeAnalyticsData(record);
  } catch (error) {
    console.error("Error storing SEO schema snapshot:", error);
    throw error;
  }
}
async function storeKeywordRadarInsights(payload) {
  try {
    const record = {
      id: `keyword-radar-${payload.industry}-${payload.generatedAt}`,
      source: "keyword_radar",
      metric_type: "opportunity_map",
      date: payload.generatedAt,
      data: payload
    };
    await storeAnalyticsData(record);
  } catch (error) {
    console.error("Error storing keyword radar insights:", error);
    throw error;
  }
}
async function storeAutomationDecision(decision) {
  try {
    const record = {
      id: `decision-${decision.decisionType}-${decision.evaluatedAt}`,
      source: "automation_decision",
      metric_type: decision.decisionType,
      date: decision.evaluatedAt,
      data: decision
    };
    await storeAnalyticsData(record);
  } catch (error) {
    console.error("Error storing automation decision:", error);
    throw error;
  }
}
async function storeMonitoringPulse(pulse) {
  try {
    const record = {
      id: `monitoring-${pulse.signal}-${pulse.observedAt}`,
      source: "monitoring",
      metric_type: pulse.signal,
      date: pulse.observedAt,
      data: pulse
    };
    await storeAnalyticsData(record);
  } catch (error) {
    console.error("Error storing monitoring pulse:", error);
    throw error;
  }
}

export { storeKeywordRadarInsights as a, storeMonitoringPulse as b, storeSeoSchemaSnapshot as c, storeSeoAudit as d, storeAnalyticsData as e, storeContentOpportunity as f, storeGeneratedContent as g, storeAutomationDecision as s };
//# sourceMappingURL=analyticsDb.mjs.map
