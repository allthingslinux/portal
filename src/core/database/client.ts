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
  if (clientSingleton) {
    return clientSingleton;
  }

  clientSingleton = createClient();
  return clientSingleton;
}

export function resetDrizzleClient() {
  clientSingleton = undefined;
}

export const db = getDrizzleClient();
