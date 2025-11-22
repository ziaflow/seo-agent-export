import pg from "pg";

const { Pool } = pg;

/**
 * PostgreSQL Client for Direct Database Operations
 * Used for storing marketing analytics data
 */

let pool: pg.Pool | null = null;

export function getPgPool(): pg.Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      console.warn("⚠️ DATABASE_URL not set, database features will be limited");
      // Return a dummy pool that won't crash but will log warnings
      return {
        query: async () => {
          console.warn("⚠️ Database query attempted but DATABASE_URL not configured");
          return { rows: [] };
        },
      } as any;
    }
    pool = new Pool({
      connectionString,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    });
  }
  return pool;
}

/**
 * Initialize analytics tables in PostgreSQL
 */
export async function initializeAnalyticsTables(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    console.warn("⚠️ Skipping analytics table initialization - DATABASE_URL not configured");
    return;
  }
  
  const pool = getPgPool();
  
  try {
    // Create analytics_data table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS analytics_data (
        id VARCHAR(255) PRIMARY KEY,
        source VARCHAR(100) NOT NULL,
        metric_type VARCHAR(100) NOT NULL,
        date TIMESTAMP NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create index for querying by source and date
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_analytics_source_date 
      ON analytics_data(source, date DESC);
    `);

    console.log("✅ Analytics tables initialized successfully");
  } catch (error) {
    console.error("❌ Error initializing analytics tables:", error);
    // Don't throw - allow app to start even if DB init fails
    console.warn("⚠️ Continuing without analytics database");
  }
}

/**
 * Execute a parameterized query
 */
export async function executeQuery<T = any>(
  query: string,
  params: any[] = []
): Promise<T[]> {
  const pool = getPgPool();
  
  try {
    const result = await pool.query(query, params);
    return result.rows as T[];
  } catch (error) {
    console.error("Database query error:", error);
    throw error;
  }
}

/**
 * Insert or update a record
 */
export async function upsertRecord(
  table: string,
  id: string,
  data: Record<string, any>
): Promise<void> {
  const pool = getPgPool();
  
  const columns = Object.keys(data);
  const values = Object.values(data);
  const placeholders = values.map((_, i) => `$${i + 2}`).join(", ");
  const updates = columns.map((col, i) => `${col} = $${i + 2}`).join(", ");

  const query = `
    INSERT INTO ${table} (id, ${columns.join(", ")})
    VALUES ($1, ${placeholders})
    ON CONFLICT (id) DO UPDATE SET ${updates}
  `;

  try {
    await pool.query(query, [id, ...values]);
  } catch (error) {
    console.error(`Error upserting record in ${table}:`, error);
    throw error;
  }
}
