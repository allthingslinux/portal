CREATE TYPE "mediawiki_account_status" AS ENUM('active', 'pending', 'suspended', 'deleted');--> statement-breakpoint
CREATE TABLE "mediawiki_account" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"wiki_username" text NOT NULL,
	"wiki_user_id" integer,
	"status" "mediawiki_account_status" DEFAULT 'active'::"mediawiki_account_status" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"metadata" jsonb
);
--> statement-breakpoint
CREATE INDEX "mediawiki_account_status_idx" ON "mediawiki_account" ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "mediawiki_account_userId_active_idx" ON "mediawiki_account" ("user_id") WHERE status != 'deleted';--> statement-breakpoint
CREATE UNIQUE INDEX "mediawiki_account_wikiUsername_active_idx" ON "mediawiki_account" ("wiki_username") WHERE status != 'deleted';--> statement-breakpoint
ALTER TABLE "mediawiki_account" ADD CONSTRAINT "mediawiki_account_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;