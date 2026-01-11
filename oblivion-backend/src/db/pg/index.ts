import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { env } from "../../config/env";

// Helper to convert Supabase direct connection to pooler connection
function getPoolerUrl(directUrl: string): string | null {
  try {
    const url = new URL(directUrl);
    
    // Check if it's a Supabase direct connection (port 5432)
    if (url.hostname.includes('supabase.co') && url.port === '5432') {
      // Extract the project ref from hostname (e.g., db.jmmnodjubhpphvhcxbke.supabase.co)
      const parts = url.hostname.split('.');
      if (parts.length >= 3 && parts[0] === 'db') {
        const projectRef = parts[1];
        // Convert to pooler URL
        const poolerHost = `aws-0-${url.searchParams.get('region') || 'us-east-1'}.pooler.supabase.com`;
        const poolerUrl = `${url.protocol}//${url.username}:${url.password}@${poolerHost}:6543${url.pathname}?pgbouncer=true`;
        return poolerUrl;
      }
    }
  } catch (err) {
    // URL parsing failed
  }
  return null;
}

const pool = new pg.Pool({
  connectionString: env.DATABASE_URL,
  keepAlive: true,
  connectionTimeoutMillis: 10000,
  max: 10,
  idleTimeoutMillis: 30000,
});

export const db = drizzle(pool);

const checkConnection = async () => {
  try {
    await pool.query('SELECT 1');
    console.log("🚀 Database connected successfully");
  } catch (err: any) {
    console.error("❌ Database connection failed", err.message);
    
    // Check if it's an IPv6 issue with Supabase
    if (err.code === 'ENETUNREACH' && err.address?.includes(':')) {
      console.error("\n⚠️  IPv6 connection issue detected with Supabase!");
      console.error("💡 Solution: Use Supabase Connection Pooler URL (port 6543)");
      console.error("\n📋 Steps to fix:");
      console.error("   1. Go to Supabase Dashboard → Settings → Database");
      console.error("   2. Scroll to 'Connection Pooling' section");
      console.error("   3. Under 'Connection string', copy the pooler URL");
      console.error("   4. It should look like:");
      console.error("      postgresql://postgres.[PROJECT-REF]:[PASSWORD]@");
      console.error("      aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true");
      console.error("   5. Update DATABASE_URL in Render environment variables");
      console.error("\n   Your current URL uses port 5432 (direct connection)");
      console.error("   The pooler URL uses port 6543 (IPv4 compatible)");
    }
    
    console.error("⚠️  Continuing without database connection - will retry on first request");
  }
};

checkConnection();
