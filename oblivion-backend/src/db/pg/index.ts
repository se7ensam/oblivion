import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { env } from "../../config/env";

const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  // Force IPv4 if IPv6 is causing issues
  // This helps with Render's network configuration
  keepAlive: true,
  connectionTimeoutMillis: 10000,
});

export const db = drizzle(pool);

const checkConnection = async () => {
  try {
    await pool.query('SELECT 1');
    console.log("🚀 Database connected successfully");
  } catch (err) {
    console.error("❌ Database connection failed", err);
    // Don't exit immediately - let the app start and retry
    // This allows Render to handle health checks better
    console.error("⚠️  Continuing without database connection - will retry on first request");
  }
};

checkConnection();
