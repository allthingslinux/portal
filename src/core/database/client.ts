import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://portal:portal@127.0.0.1:5433/portal";

export type DrizzleInstance = ReturnType<typeof drizzle> & {
  runTransaction: ReturnType<typeof drizzle>["transaction"];
};

let clientSingleton: DrizzleInstance | undefined;

function createClient() {
  const sql = postgres(connectionString, {
    max: 10,
  });

  const base = drizzle(sql);
  const withCompat = base as unknown as DrizzleInstance;
  withCompat.runTransaction = base.transaction.bind(base);
  return withCompat;
}

export function getDrizzleClient() {
  // Always create a fresh client to avoid connection pooling issues
  // This ensures we get connections with the correct search_path
  if (clientSingleton) {
    return clientSingleton;
  }

  clientSingleton = createClient();
  return clientSingleton;
}

// Export function to reset the client (useful for testing or after DB changes)
export function resetDrizzleClient() {
  clientSingleton = undefined;
}

export const db = getDrizzleClient();
