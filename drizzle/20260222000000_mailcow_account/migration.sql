CREATE TYPE "mailcow_account_status" AS ENUM('active', 'suspended', 'deleted');--> statement-breakpoint
CREATE TABLE "mailcow_account" (
	"id" text PRIMARY KEY,
	"user_id" text NOT NULL,
	"email" text NOT NULL,
	"domain" text NOT NULL,
	"local_part" text NOT NULL,
	"status" "mailcow_account_status" DEFAULT 'active'::"mailcow_account_status" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"metadata" jsonb
);--> statement-breakpoint
CREATE INDEX "mailcow_account_userId_idx" ON "mailcow_account" ("user_id");--> statement-breakpoint
CREATE INDEX "mailcow_account_email_idx" ON "mailcow_account" ("email");--> statement-breakpoint
CREATE INDEX "mailcow_account_status_idx" ON "mailcow_account" ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "mailcow_account_userId_active_idx" ON "mailcow_account" ("user_id") WHERE status != 'deleted';--> statement-breakpoint
CREATE UNIQUE INDEX "mailcow_account_email_active_idx" ON "mailcow_account" ("email") WHERE status != 'deleted';--> statement-breakpoint
ALTER TABLE "mailcow_account" ADD CONSTRAINT "mailcow_account_user_id_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE;
