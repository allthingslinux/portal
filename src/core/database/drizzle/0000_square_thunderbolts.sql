CREATE TYPE "public"."app_permissions" AS ENUM('roles.manage', 'settings.manage', 'members.manage', 'invites.manage');--> statement-breakpoint
CREATE TYPE "public"."notification_channel" AS ENUM('in_app', 'email');--> statement-breakpoint
CREATE TYPE "public"."notification_type" AS ENUM('info', 'warning', 'error');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"primary_owner_user_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" text,
	"email" varchar(320),
	"is_personal_account" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp with time zone,
	"created_at" timestamp with time zone,
	"created_by" uuid,
	"updated_by" uuid,
	"picture_url" varchar(1000),
	"public_data" jsonb DEFAULT '{}'::jsonb NOT NULL,
	CONSTRAINT "accounts_slug_key" UNIQUE("slug"),
	CONSTRAINT "accounts_email_key" UNIQUE("email"),
	CONSTRAINT "accounts_slug_null_if_personal_account_true" CHECK (((is_personal_account = true) AND (slug IS NULL)) OR ((is_personal_account = false) AND (slug IS NOT NULL)))
);
--> statement-breakpoint
CREATE TABLE "accounts_memberships" (
	"user_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"account_role" varchar(50) NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"created_by" uuid,
	"updated_by" uuid,
	CONSTRAINT "accounts_memberships_pkey" PRIMARY KEY("user_id","account_id")
);
--> statement-breakpoint
CREATE TABLE "account" (
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
--> statement-breakpoint
CREATE TABLE "session" (
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
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"emailVerified" boolean DEFAULT false NOT NULL,
	"image" text,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expiresAt" timestamp with time zone NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"updatedAt" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "config" (
	"enable_team_accounts" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invitations" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"account_id" uuid NOT NULL,
	"invited_by" uuid NOT NULL,
	"role" varchar(50) NOT NULL,
	"invite_token" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"updated_at" timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
	"expires_at" timestamp with time zone DEFAULT (CURRENT_TIMESTAMP + '7 days'::interval) NOT NULL,
	CONSTRAINT "invitations_email_account_id_key" UNIQUE("email","account_id"),
	CONSTRAINT "invitations_invite_token_key" UNIQUE("invite_token")
);
--> statement-breakpoint
CREATE TABLE "nonces" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_token" text NOT NULL,
	"nonce" text NOT NULL,
	"user_id" uuid,
	"purpose" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"used_at" timestamp with time zone,
	"revoked" boolean DEFAULT false NOT NULL,
	"revoked_reason" text,
	"verification_attempts" integer DEFAULT 0 NOT NULL,
	"last_verification_at" timestamp with time zone,
	"last_verification_ip" "inet",
	"last_verification_user_agent" text,
	"metadata" jsonb DEFAULT '{}'::jsonb,
	"scopes" text[] DEFAULT '{""}'
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "notifications_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"account_id" uuid NOT NULL,
	"type" "notification_type" DEFAULT 'info' NOT NULL,
	"body" varchar(5000) NOT NULL,
	"link" varchar(255),
	"channel" "notification_channel" DEFAULT 'in_app' NOT NULL,
	"dismissed" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp with time zone DEFAULT (now() + '1 mon'::interval),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"id" bigint PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY (sequence name "role_permissions_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1),
	"role" varchar(50) NOT NULL,
	"permission" "app_permissions" NOT NULL,
	CONSTRAINT "role_permissions_role_permission_key" UNIQUE("role","permission")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"name" varchar(50) PRIMARY KEY NOT NULL,
	"hierarchy_level" integer NOT NULL,
	CONSTRAINT "roles_hierarchy_level_key" UNIQUE("hierarchy_level"),
	CONSTRAINT "roles_hierarchy_level_check" CHECK (hierarchy_level > 0)
);
--> statement-breakpoint
CREATE TABLE "auth"."users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"email" text
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_primary_owner_user_id_fkey" FOREIGN KEY ("primary_owner_user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts_memberships" ADD CONSTRAINT "accounts_memberships_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts_memberships" ADD CONSTRAINT "accounts_memberships_account_role_fkey" FOREIGN KEY ("account_role") REFERENCES "public"."roles"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts_memberships" ADD CONSTRAINT "accounts_memberships_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts_memberships" ADD CONSTRAINT "accounts_memberships_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "accounts_memberships" ADD CONSTRAINT "accounts_memberships_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_invited_by_fkey" FOREIGN KEY ("invited_by") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitations" ADD CONSTRAINT "invitations_role_fkey" FOREIGN KEY ("role") REFERENCES "public"."roles"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "nonces" ADD CONSTRAINT "nonces_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_account_id_fkey" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "role_permissions" ADD CONSTRAINT "role_permissions_role_fkey" FOREIGN KEY ("role") REFERENCES "public"."roles"("name") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ix_accounts_is_personal_account" ON "accounts" USING btree ("is_personal_account");--> statement-breakpoint
CREATE INDEX "ix_accounts_primary_owner_user_id" ON "accounts" USING btree ("primary_owner_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "unique_personal_account" ON "accounts" USING btree ("primary_owner_user_id") WHERE (is_personal_account = true);--> statement-breakpoint
CREATE INDEX "ix_accounts_memberships_account_id" ON "accounts_memberships" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "ix_accounts_memberships_account_role" ON "accounts_memberships" USING btree ("account_role");--> statement-breakpoint
CREATE INDEX "ix_accounts_memberships_user_id" ON "accounts_memberships" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "ix_invitations_account_id" ON "invitations" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "idx_nonces_status" ON "nonces" USING btree ("client_token","user_id","purpose","expires_at") WHERE ((used_at IS NULL) AND (revoked = false));--> statement-breakpoint
CREATE INDEX "idx_nonces_verify_lookup" ON "nonces" USING btree ("purpose","expires_at","user_id") WHERE ((used_at IS NULL) AND (revoked = false));--> statement-breakpoint
CREATE INDEX "idx_notifications_account_dismissed" ON "notifications" USING btree ("account_id","dismissed","expires_at");--> statement-breakpoint
CREATE INDEX "ix_role_permissions_role" ON "role_permissions" USING btree ("role");--> statement-breakpoint
CREATE VIEW "public"."user_account_workspace" AS (SELECT id, name, picture_url FROM accounts LIMIT 1);--> statement-breakpoint
CREATE VIEW "public"."user_accounts" AS (SELECT account.id, account.name, account.picture_url, account.slug, membership.account_role AS role FROM accounts account JOIN accounts_memberships membership ON account.id = membership.account_id);