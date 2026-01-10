import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { env } from "../../config/env";

const pool = new pg.Pool({
  connectionString: env.DATABASE_URL
});

export const db = drizzle(pool);

const checkConnection = async () => {
  try {
    await pool.query('SELECT 1');
    console.log("🚀 Database connected successfully");
  } catch (err) {
    console.error("❌ Database connection failed", err);
    process.exit(1);
  }
};

checkConnection();
