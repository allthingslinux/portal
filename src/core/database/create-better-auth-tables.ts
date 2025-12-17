import "dotenv/config";
import postgres from "postgres";

const connectionString =
  process.env.DATABASE_URL ??
  "postgresql://portal:portal@127.0.0.1:5433/portal";

async function createBetterAuthTables() {
  console.log("Creating Better Auth tables...");

  const sql = postgres(connectionString, { max: 1 });

  try {
    // Create verification table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS "verification" (
        "id" text PRIMARY KEY NOT NULL,
        "identifier" text NOT NULL,
        "value" text NOT NULL,
        "expiresAt" timestamp with time zone NOT NULL,
        "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
        "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
      );
    `;

    // Create user table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS "user" (
        "id" text PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "email" text NOT NULL,
        "emailVerified" boolean DEFAULT false NOT NULL,
        "image" text,
        "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
        "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
      );
    `;

    // Create session table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS "session" (
        "id" text PRIMARY KEY NOT NULL,
        "userId" text NOT NULL,
        "token" text NOT NULL,
        "expiresAt" timestamp with time zone NOT NULL,
        "ipAddress" text,
        "userAgent" text,
        "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
        "updatedAt" timestamp with time zone DEFAULT now() NOT NULL,
        CONSTRAINT "session_token_unique" UNIQUE("token")
      );
    `;

    // Create account table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS "account" (
        "id" text PRIMARY KEY NOT NULL,
        "userId" text NOT NULL,
        "accountId" text NOT NULL,
        "providerId" text NOT NULL,
        "accessToken" text,
        "refreshToken" text,
        "accessTokenExpiresAt" timestamp with time zone,
        "refreshTokenExpiresAt" timestamp with time zone,
        "scope" text,
        "idToken" text,
        "password" text,
        "createdAt" timestamp with time zone DEFAULT now() NOT NULL,
        "updatedAt" timestamp with time zone DEFAULT now() NOT NULL
      );
    `;

    // Add foreign key constraints if they don't exist
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'session_userId_user_id_fk'
        ) THEN
          ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" 
            FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
        END IF;
      END $$;
    `;

    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'account_userId_user_id_fk'
        ) THEN
          ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" 
            FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
        END IF;
      END $$;
    `;

    console.log("✓ Better Auth tables created successfully");
  } catch (error) {
    console.error("Failed to create tables:", error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

createBetterAuthTables();
