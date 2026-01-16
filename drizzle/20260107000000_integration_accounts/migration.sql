CREATE TYPE "integration_account_status" AS ENUM ('active', 'suspended', 'deleted');
--> statement-breakpoint
CREATE TABLE "integration_accounts" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"integration_type" text NOT NULL,
	"status" "integration_account_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE INDEX "integration_accounts_userId_idx" ON "integration_accounts" ("user_id");
--> statement-breakpoint
CREATE INDEX "integration_accounts_type_idx" ON "integration_accounts" ("integration_type");
--> statement-breakpoint
CREATE UNIQUE INDEX "integration_accounts_userId_type_idx" ON "integration_accounts" ("user_id","integration_type");
--> statement-breakpoint
ALTER TABLE "integration_accounts" ADD CONSTRAINT "integration_accounts_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;
